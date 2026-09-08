import { createHash } from 'node:crypto'

import { RELEASE_MANIFEST_V1_SCHEMA, type ReleaseManifestV1 } from '../contracts/catalog.ts'
import {
  templateIdFromArtifactPath,
  tryParseRemovalTombstoneJsonV1,
} from '../contracts/compatibility.ts'
import { verifyReleaseFiles } from './release.ts'

export const RELEASE_VERIFICATION_COMMANDS = [
  'pnpm typecheck',
  'pnpm check',
  'pnpm test',
  'pnpm generate:check',
  'pnpm previews:check',
] as const

export type VerificationCommand = (typeof RELEASE_VERIFICATION_COMMANDS)[number]

export type ReleasePointerV1 = {
  readonly schemaVersion: '1.0'
  readonly currentReleaseId: string
  readonly previousReleaseId?: string
  readonly manifestUrl: string
  readonly manifestSha256: string
}

export type PromotionRequest = {
  readonly releaseId: string
  readonly expectedPreviousReleaseId: string | undefined
  readonly files: ReadonlyMap<string, Buffer>
  readonly signal?: AbortSignal
}

export type ArtifactResponse = {
  readonly status: 200 | 404 | 410 | 503
  readonly body: Buffer
  readonly headers: Readonly<Record<string, string>>
}

export type PromotionAdapters = {
  readonly serializePromotion: <T>(job: () => Promise<T>) => Promise<T>
  readonly readImmutable: (releaseId: string, path: string) => Promise<Buffer | undefined>
  readonly writeImmutable: (releaseId: string, path: string, bytes: Buffer) => Promise<void>
  readonly listImmutable: (releaseId: string) => Promise<readonly string[]>
  readonly readPointer: () => Promise<ReleasePointerV1 | undefined>
  readonly readRecordedPointer: (releaseId: string) => Promise<ReleasePointerV1 | undefined>
  readonly compareAndSwapPointer: (
    expectedReleaseId: string | undefined,
    pointer: ReleasePointerV1 | undefined,
  ) => Promise<boolean>
  readonly purgeStableAliases: () => Promise<void>
  readonly verifyReleaseCandidate: (
    releaseId: string,
    commands: readonly VerificationCommand[],
  ) => Promise<void>
  readonly verifyUncachedAliases: (releaseId: string | undefined) => Promise<void>
  readonly verifyNamedRegistryInstallation: (releaseId: string) => Promise<void>
  readonly verifyDirectRegistryInstallation: (releaseId: string) => Promise<void>
  readonly verifyCatalog: (releaseId: string) => Promise<void>
  readonly verifyReferencePdfs: (releaseId: string) => Promise<void>
  readonly verifyPreviewPngs: (releaseId: string) => Promise<void>
  readonly verifyManifestBytes: (pointer: ReleasePointerV1) => Promise<void>
  readonly verifySelectedCommit: (releaseId: string) => Promise<void>
  readonly announce: (releaseId: string) => Promise<void>
}

const EMPTY_BODY = Buffer.alloc(0)
const ALIAS_CACHE_CONTROL = 'public, max-age=0, must-revalidate'
const IMMUTABLE_CACHE_CONTROL = 'public, max-age=31536000, immutable'
const releaseIdPattern = new RegExp(RELEASE_MANIFEST_V1_SCHEMA.properties.releaseId.pattern, 'u')

const digest = (bytes: Buffer): string => createHash('sha256').update(bytes).digest('hex')

const parseTombstone = (
  bytes: Buffer | undefined,
): ReturnType<typeof tryParseRemovalTombstoneJsonV1> | undefined =>
  bytes ? tryParseRemovalTombstoneJsonV1(bytes.toString('utf8')) : undefined

const removedResponse = (
  body: Buffer,
  releaseId: string,
  sha256 = digest(body),
): ArtifactResponse => ({
  status: 410,
  body,
  headers: {
    'Cache-Control': ALIAS_CACHE_CONTROL,
    ETag: `"${sha256}"`,
    'X-CV-UI-Release': releaseId,
  },
})

const immutableRemovedResponse = (body: Buffer): ArtifactResponse => ({
  status: 410,
  body,
  headers: { 'Cache-Control': IMMUTABLE_CACHE_CONTROL },
})

const verifyRelease = async (
  adapters: Pick<PromotionAdapters, 'listImmutable' | 'readImmutable'>,
  releaseId: string,
  expectedManifestDigest?: string,
): Promise<{
  readonly files: ReadonlyMap<string, Buffer>
  readonly manifest: ReleaseManifestV1
  readonly manifestBytes: Buffer
}> => {
  const manifestBytes = await adapters.readImmutable(releaseId, 'manifest.json')
  if (!manifestBytes) throw new Error(`Release manifest is missing: ${releaseId}`)
  if (expectedManifestDigest && digest(manifestBytes) !== expectedManifestDigest)
    throw new Error(`Release manifest digest does not match the Current Release: ${releaseId}`)
  const files = new Map<string, Buffer>()
  for (const path of await adapters.listImmutable(releaseId)) {
    const bytes = await adapters.readImmutable(releaseId, path)
    if (!bytes) throw new Error(`Release artifact is missing: ${path}`)
    files.set(path, bytes)
  }
  const manifest = verifyReleaseFiles({ releaseId, files })
  return { manifest, manifestBytes, files }
}

const pointerFor = (
  releaseId: string,
  manifestBytes: Buffer,
  previousReleaseId?: string,
): ReleasePointerV1 => ({
  schemaVersion: '1.0',
  currentReleaseId: releaseId,
  ...(previousReleaseId ? { previousReleaseId } : {}),
  manifestUrl: `/releases/${releaseId}/manifest.json`,
  manifestSha256: digest(manifestBytes),
})

const verifyPointer = async (
  adapters: PromotionAdapters,
  pointer: ReleasePointerV1,
): ReturnType<typeof verifyRelease> => {
  const expectedUrl = `/releases/${pointer.currentReleaseId}/manifest.json`
  if (pointer.manifestUrl !== expectedUrl)
    throw new Error('Current Release manifest URL is invalid')
  return verifyRelease(adapters, pointer.currentReleaseId, pointer.manifestSha256)
}

const assertRetainedTombstones = (
  previousFiles: ReadonlyMap<string, Buffer> | undefined,
  candidateFiles: ReadonlyMap<string, Buffer>,
): void => {
  if (!previousFiles) return
  for (const [path, bytes] of previousFiles) {
    if (!path.startsWith('r/') || !parseTombstone(bytes)) continue
    const candidate = candidateFiles.get(path)
    if (!candidate?.equals(bytes)) throw new Error(`Removed Template ID cannot be reused: ${path}`)
  }
}

const uploadRelease = async (
  adapters: PromotionAdapters,
  releaseId: string,
  files: ReadonlyMap<string, Buffer>,
): Promise<void> => {
  if (!releaseIdPattern.test(releaseId)) throw new Error(`Invalid Release ID: ${releaseId}`)
  if (!files.has('manifest.json')) throw new Error('The Release upload has no manifest')
  for (const [path, bytes] of files) {
    const existing = await adapters.readImmutable(releaseId, path)
    if (existing) {
      if (!existing.equals(bytes)) throw new Error(`Immutable Release byte mismatch: ${path}`)
      continue
    }
    await adapters.writeImmutable(releaseId, path, bytes)
  }
}

const rollback = async (
  adapters: PromotionAdapters,
  failedPointer: ReleasePointerV1,
  previousPointer: ReleasePointerV1 | undefined,
): Promise<void> => {
  if (previousPointer) await verifyPointer(adapters, previousPointer)
  const restored = await adapters.compareAndSwapPointer(
    failedPointer.currentReleaseId,
    previousPointer,
  )
  if (!restored) throw new Error('Current Release rollback compare-and-swap failed')
  await adapters.purgeStableAliases()
  await adapters.verifyUncachedAliases(previousPointer?.currentReleaseId)
}

const runPostPromotionChecks = async (
  adapters: PromotionAdapters,
  pointer: ReleasePointerV1,
): Promise<void> => {
  const releaseId = pointer.currentReleaseId
  await adapters.verifyUncachedAliases(releaseId)
  await adapters.verifyNamedRegistryInstallation(releaseId)
  await adapters.verifyDirectRegistryInstallation(releaseId)
  await adapters.verifyCatalog(releaseId)
  await adapters.verifyReferencePdfs(releaseId)
  await adapters.verifyPreviewPngs(releaseId)
  await adapters.verifyManifestBytes(pointer)
  await adapters.verifySelectedCommit(releaseId)
}

const promote = async (
  adapters: PromotionAdapters,
  request: PromotionRequest,
): Promise<ReleasePointerV1> => {
  if (request.signal?.aborted) {
    const error = new Error('Promotion cancelled before upload')
    error.name = 'AbortError'
    throw error
  }
  const previousPointer = await adapters.readPointer()
  if (previousPointer?.currentReleaseId !== request.expectedPreviousReleaseId)
    throw new Error('Current Release does not match the expected previous Release')
  const previousRelease = previousPointer
    ? await verifyPointer(adapters, previousPointer)
    : undefined
  assertRetainedTombstones(previousRelease?.files, request.files)
  await adapters.verifyReleaseCandidate(request.releaseId, RELEASE_VERIFICATION_COMMANDS)
  await uploadRelease(adapters, request.releaseId, request.files)
  const { manifestBytes } = await verifyRelease(adapters, request.releaseId)
  const nextPointer = pointerFor(
    request.releaseId,
    manifestBytes,
    previousPointer?.currentReleaseId,
  )
  const changed = await adapters.compareAndSwapPointer(
    request.expectedPreviousReleaseId,
    nextPointer,
  )
  if (!changed) throw new Error('Current Release compare-and-swap failed')
  try {
    await adapters.purgeStableAliases()
    await runPostPromotionChecks(adapters, nextPointer)
    await adapters.announce(request.releaseId)
    return nextPointer
  } catch (error) {
    await rollback(adapters, nextPointer, previousPointer)
    throw error
  }
}

export class PromotionCoordinator {
  readonly #adapters: PromotionAdapters

  constructor(adapters: PromotionAdapters) {
    this.#adapters = adapters
  }

  promote(request: PromotionRequest): Promise<ReleasePointerV1> {
    return this.#adapters.serializePromotion(() => promote(this.#adapters, request))
  }
}

const serveVerifiedStableAlias = async (
  adapters: PromotionAdapters,
  pointer: ReleasePointerV1,
  path: string,
): Promise<ArtifactResponse> => {
  const { files, manifest } = await verifyRelease(
    adapters,
    pointer.currentReleaseId,
    pointer.manifestSha256,
  )
  const artifact = manifest.artifacts.find((candidate) => candidate.path === path)
  if (!artifact) {
    const templateId = templateIdFromArtifactPath(path)
    const tombstonePath = templateId ? `r/${templateId}.json` : undefined
    const tombstoneArtifact = tombstonePath
      ? manifest.artifacts.find((candidate) => candidate.path === tombstonePath)
      : undefined
    const tombstoneBytes = tombstonePath ? files.get(tombstonePath) : undefined
    const tombstone = parseTombstone(tombstoneBytes)
    if (tombstone?.templateId === templateId && tombstoneArtifact && tombstoneBytes)
      return removedResponse(tombstoneBytes, pointer.currentReleaseId, tombstoneArtifact.sha256)
    return { status: 404, body: EMPTY_BODY, headers: { 'Cache-Control': ALIAS_CACHE_CONTROL } }
  }
  const body = files.get(path)
  if (!body) throw new Error(`Current Release artifact is missing: ${path}`)
  if (parseTombstone(body)) return removedResponse(body, pointer.currentReleaseId, artifact.sha256)
  return {
    status: 200,
    body,
    headers: {
      'Cache-Control': ALIAS_CACHE_CONTROL,
      ETag: `"${artifact.sha256}"`,
      'X-CV-UI-Release': pointer.currentReleaseId,
    },
  }
}

const rollbackRuntimeFailure = async (
  adapters: PromotionAdapters,
  pointer: ReleasePointerV1,
): Promise<void> => {
  let previousPointer: ReleasePointerV1 | undefined
  if (pointer.previousReleaseId) {
    previousPointer = await adapters.readRecordedPointer(pointer.previousReleaseId)
    if (!previousPointer) throw new Error('Previous Release pointer is missing')
  }
  await rollback(adapters, pointer, previousPointer)
}

export const serveStableAlias = async (
  adapters: PromotionAdapters,
  path: string,
): Promise<ArtifactResponse> => {
  const pointer = await adapters.readPointer()
  if (!pointer)
    return { status: 503, body: EMPTY_BODY, headers: { 'Cache-Control': ALIAS_CACHE_CONTROL } }
  try {
    return await serveVerifiedStableAlias(adapters, pointer, path)
  } catch {
    try {
      await rollbackRuntimeFailure(adapters, pointer)
    } catch {
      return { status: 503, body: EMPTY_BODY, headers: { 'Cache-Control': ALIAS_CACHE_CONTROL } }
    }
    return { status: 503, body: EMPTY_BODY, headers: { 'Cache-Control': ALIAS_CACHE_CONTROL } }
  }
}

export const serveImmutableRelease = async (
  adapters: Pick<PromotionAdapters, 'readImmutable' | 'readPointer'>,
  releaseId: string,
  path: string,
): Promise<ArtifactResponse> => {
  const pointer = await adapters.readPointer()
  const templateId = templateIdFromArtifactPath(path)
  if (pointer && pointer.currentReleaseId !== releaseId && templateId) {
    const tombstoneBytes = await adapters.readImmutable(
      pointer.currentReleaseId,
      `r/${templateId}.json`,
    )
    const tombstone = parseTombstone(tombstoneBytes)
    if (tombstone?.templateId === templateId && tombstoneBytes)
      return immutableRemovedResponse(tombstoneBytes)
  }
  const body = await adapters.readImmutable(releaseId, path)
  return body
    ? { status: 200, body, headers: { 'Cache-Control': IMMUTABLE_CACHE_CONTROL } }
    : { status: 404, body: EMPTY_BODY, headers: { 'Cache-Control': IMMUTABLE_CACHE_CONTROL } }
}
