import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as v from 'valibot'

import {
  RELEASE_MANIFEST_V1_SCHEMA,
  type ReleaseArtifactV1,
  type ReleaseManifestV1,
} from '../contracts/catalog.ts'
import { tryParseRemovalTombstoneJsonV1 } from '../contracts/compatibility.ts'
import { listFilePaths } from './file-drift.ts'
import { checkGeneratedArtifacts, serializeJson } from './generate.ts'

type AssembleReleaseOptions = {
  readonly releaseId: string
  readonly sourceRoot: string
  readonly outputRoot: string
}
type VerifyReleaseOptions = {
  readonly releaseId: string
  readonly publicRoot: string
}
type MediaType = ReleaseArtifactV1['mediaType']

const RELEASE_SOURCE_PATHS = ['catalog', 'previews', 'r'] as const
const REQUIRED_RELEASE_PATHS = [
  'catalog/templates.json',
  'catalog/v1/templates.json',
  'r/cv-data.json',
] as const
const RELEASE_MEDIA_TYPES = {
  json: 'application/json',
  pdf: 'application/pdf',
  png: 'image/png',
} as const satisfies Readonly<Record<string, MediaType>>
const MEDIA_TYPE_SIGNATURES = {
  'application/pdf': Buffer.from('%PDF-'),
  'image/png': Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
} as const

const repositoryRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))

const manifestProperties = RELEASE_MANIFEST_V1_SCHEMA.properties
const artifactProperties = manifestProperties.artifacts.items.properties
const publishedPattern = (pattern: string): RegExp => new RegExp(pattern, 'u')
const releaseIdPattern = publishedPattern(manifestProperties.releaseId.pattern)
const authoringReferencePattern =
  /^(https:\/\/cv-ui\.alfredmouelle\.com)?\/((?:catalog|previews|r)\/\S+)$/u
const authoringOccurrencePattern = /\/(?:catalog|previews|r)\/[\w./-]+\.(?:json|pdf|png)/u
const releaseOccurrencePattern =
  /(?<![\w.-])(?:https:\/\/cv-ui\.alfredmouelle\.com)?\/releases\/([0-9a-f]{40})\/((?:catalog|previews|r)\/[\w./-]+\.(?:json|pdf|png))/gu
const anyReleaseOccurrencePattern = /\/releases\//u

const releaseManifestSchema = v.strictObject({
  schemaVersion: v.literal('1.0'),
  releaseId: v.pipe(v.string(), v.regex(releaseIdPattern)),
  artifacts: v.pipe(
    v.array(
      v.strictObject({
        path: v.pipe(v.string(), v.regex(publishedPattern(artifactProperties.path.pattern))),
        size: v.pipe(v.number(), v.integer(), v.minValue(artifactProperties.size.minimum)),
        mediaType: v.union([
          v.literal('application/json'),
          v.literal('application/pdf'),
          v.literal('image/png'),
        ]),
        sha256: v.pipe(v.string(), v.regex(publishedPattern(artifactProperties.sha256.pattern))),
      }),
    ),
    v.minLength(1),
  ),
})

export const parseReleaseManifest = (bytes: Buffer): ReleaseManifestV1 =>
  v.parse(releaseManifestSchema, parseJsonBytes(bytes))

const toPosixPath = (path: string): string => path.split(sep).join('/')
const digest = (bytes: Buffer): string => createHash('sha256').update(bytes).digest('hex')

const assertReleaseId = (releaseId: string): void => {
  if (!releaseIdPattern.test(releaseId)) throw new Error(`Invalid Release ID: ${releaseId}`)
}

const assertReleasePath = (path: string): string => {
  const segments = path.split('/')
  if (segments.some((segment) => segment === '' || segment === '.' || segment === '..'))
    throw new Error(`Invalid Release path: ${path}`)
  return path
}

const mediaTypeOf = (path: string): MediaType => {
  const extension = path.slice(path.lastIndexOf('.') + 1)
  if (!(extension in RELEASE_MEDIA_TYPES))
    throw new Error(`Unsupported Release media type: ${path}`)
  return RELEASE_MEDIA_TYPES[extension as keyof typeof RELEASE_MEDIA_TYPES]
}

const mapJsonStrings = (value: unknown, map: (text: string) => string): unknown => {
  if (typeof value === 'string') return map(value)
  if (Array.isArray(value)) return value.map((item) => mapJsonStrings(item, map))
  if (value !== null && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, mapJsonStrings(item, map)]),
    )
  return value
}

const parseJsonBytes = (bytes: Buffer): unknown => JSON.parse(bytes.toString('utf8'))

const parseTombstone = (bytes: Buffer): ReturnType<typeof tryParseRemovalTombstoneJsonV1> =>
  tryParseRemovalTombstoneJsonV1(bytes.toString('utf8'))

const pathFromPublishedReference = (value: unknown, releaseId?: string): string | undefined => {
  if (typeof value !== 'string') return undefined
  const prefix = releaseId ? `/releases/${releaseId}/` : '/'
  const absolutePrefix = `https://cv-ui.alfredmouelle.com${prefix}`
  if (value.startsWith(absolutePrefix)) return value.slice(absolutePrefix.length)
  if (value.startsWith(prefix)) return value.slice(prefix.length)
  return undefined
}

const catalogRequiredPaths = (bytes: Buffer, releaseId?: string): readonly string[] => {
  const document = parseJsonBytes(bytes)
  if (document === null || typeof document !== 'object') return []
  const templates = Reflect.get(document, 'templates')
  if (!Array.isArray(templates)) return []

  return templates.flatMap((entry) => {
    if (entry === null || typeof entry !== 'object') return []
    const preview = Reflect.get(entry, 'preview')
    const registryPath = pathFromPublishedReference(Reflect.get(entry, 'registryUrl'), releaseId)
    if (preview === null || typeof preview !== 'object') return registryPath ? [registryPath] : []
    const pdfPath = pathFromPublishedReference(Reflect.get(preview, 'pdf'), releaseId)
    const pages = Reflect.get(preview, 'pages')
    const pagePaths = Array.isArray(pages)
      ? pages.flatMap((page) => {
          if (page === null || typeof page !== 'object') return []
          const path = pathFromPublishedReference(Reflect.get(page, 'src'), releaseId)
          return path ? [path] : []
        })
      : []
    return [registryPath, pdfPath, ...pagePaths].filter(
      (path): path is string => path !== undefined,
    )
  })
}

const catalogTemplateStatuses = (bytes: Buffer): ReadonlyMap<string, string> => {
  const document = parseJsonBytes(bytes)
  if (document === null || typeof document !== 'object') return new Map()
  const templates = Reflect.get(document, 'templates')
  if (!Array.isArray(templates)) return new Map()
  return new Map(
    templates.flatMap((entry) => {
      if (entry === null || typeof entry !== 'object') return []
      const id = Reflect.get(entry, 'id')
      const status = Reflect.get(entry, 'status')
      return typeof id === 'string' && typeof status === 'string' ? [[id, status] as const] : []
    }),
  )
}

const assertTombstoneReleaseState = (
  tombstone: NonNullable<ReturnType<typeof parseTombstone>>,
  path: string,
  catalogs: readonly ReadonlyMap<string, string>[],
  artifactPaths: Iterable<string>,
): void => {
  if (path !== `r/${tombstone.templateId}.json`)
    throw new Error(`Removal tombstone path does not match its Template ID: ${path}`)
  if (catalogs.some((catalog) => catalog.has(tombstone.templateId)))
    throw new Error(`Removed Template remains in the Catalog: ${tombstone.templateId}`)
  const replacementId = tombstone.replacementTemplateId
  if (replacementId && catalogs.some((catalog) => catalog.get(replacementId) !== 'active'))
    throw new Error(`Removed Template does not name an active replacement: ${tombstone.templateId}`)
  for (const artifactPath of artifactPaths)
    if (artifactPath.startsWith(`previews/${tombstone.templateId}/`))
      throw new Error(`Removed Template artifact remains in the Release: ${artifactPath}`)
}

const assertRemovalState = (artifacts: ReadonlyMap<string, Buffer>): void => {
  const catalogBytes = [
    artifacts.get('catalog/templates.json'),
    artifacts.get('catalog/v1/templates.json'),
  ].filter((bytes): bytes is Buffer => bytes !== undefined)
  const catalogs = catalogBytes.map(catalogTemplateStatuses)
  for (const [path, bytes] of artifacts) {
    if (!path.startsWith('r/')) continue
    const tombstone = parseTombstone(bytes)
    if (!tombstone) continue
    assertTombstoneReleaseState(tombstone, path, catalogs, artifacts.keys())
  }
}

const qualifyReference =
  (releaseId: string) =>
  (text: string): string => {
    if (anyReleaseOccurrencePattern.test(text))
      throw new Error(`Source reference is already Release-qualified: ${text}`)
    const match = authoringReferencePattern.exec(text)
    if (!match) return text
    return `${match[1] ?? ''}/releases/${releaseId}/${match[2] ?? ''}`
  }

const assertReferenceClosure = (
  documentPath: string,
  document: unknown,
  releaseId: string,
  inventory: ReadonlySet<string>,
): void => {
  mapJsonStrings(document, (text) => {
    const remainder = text.replace(
      releaseOccurrencePattern,
      (reference, referencedRelease, referencedPath) => {
        if (referencedRelease !== releaseId)
          throw new Error(`Reference names another Release in ${documentPath}: ${reference}`)
        if (!inventory.has(referencedPath))
          throw new Error(`Reference is outside the Release in ${documentPath}: ${reference}`)
        return ''
      },
    )
    if (authoringOccurrencePattern.test(remainder) || anyReleaseOccurrencePattern.test(remainder))
      throw new Error(`Reference is not Release-qualified in ${documentPath}: ${text}`)
    return text
  })
}

const assertMediaTypeBytes = (path: string, mediaType: MediaType, bytes: Buffer): void => {
  if (mediaType === 'application/json') {
    parseJsonBytes(bytes)
    return
  }
  const signature = MEDIA_TYPE_SIGNATURES[mediaType]
  if (!bytes.subarray(0, signature.byteLength).equals(signature))
    throw new Error(`Release bytes do not match the media type: ${path}`)
}

const assertRequiredPaths = (
  inventory: ReadonlySet<string>,
  artifacts: ReadonlyMap<string, Buffer>,
  releaseId?: string,
): void => {
  for (const path of REQUIRED_RELEASE_PATHS)
    if (!inventory.has(path)) throw new Error(`Release file is missing: ${path}`)
  const catalog = artifacts.get('catalog/templates.json')
  if (!catalog) return
  for (const path of catalogRequiredPaths(catalog, releaseId))
    if (!inventory.has(path)) throw new Error(`Release file is missing: ${path}`)
}

const readSourceArtifacts = (sourceRoot: string): Map<string, Buffer> => {
  const artifacts = new Map<string, Buffer>()
  for (const directory of RELEASE_SOURCE_PATHS)
    for (const file of listFilePaths(join(sourceRoot, directory))) {
      const path = assertReleasePath(toPosixPath(relative(sourceRoot, file)))
      const bytes = readFileSync(file)
      assertMediaTypeBytes(path, mediaTypeOf(path), bytes)
      artifacts.set(path, bytes)
    }
  if (artifacts.size === 0) throw new Error(`Release source has no artifact: ${sourceRoot}`)
  return artifacts
}

const buildReleaseArtifacts = (releaseId: string, sourceRoot: string): Map<string, Buffer> => {
  const qualify = qualifyReference(releaseId)
  const sourceArtifacts = readSourceArtifacts(sourceRoot)
  const removedTemplateIds = [...sourceArtifacts]
    .filter(([path]) => path.startsWith('r/'))
    .flatMap(([, bytes]) => {
      const tombstone = parseTombstone(bytes)
      return tombstone ? [tombstone.templateId] : []
    })
  for (const templateId of removedTemplateIds)
    for (const path of sourceArtifacts.keys())
      if (path.startsWith(`previews/${templateId}/`)) sourceArtifacts.delete(path)

  const artifacts = new Map(
    [...sourceArtifacts].map(([path, bytes]) => [
      path,
      mediaTypeOf(path) === 'application/json'
        ? Buffer.from(serializeJson(mapJsonStrings(parseJsonBytes(bytes), qualify)))
        : bytes,
    ]),
  )
  const inventory = new Set(artifacts.keys())
  assertRequiredPaths(inventory, artifacts, releaseId)
  assertRemovalState(artifacts)
  for (const [path, bytes] of artifacts)
    if (mediaTypeOf(path) === 'application/json')
      assertReferenceClosure(path, parseJsonBytes(bytes), releaseId, inventory)
  return artifacts
}

const buildManifest = (
  releaseId: string,
  artifacts: ReadonlyMap<string, Buffer>,
): ReleaseManifestV1 => ({
  schemaVersion: '1.0',
  releaseId,
  artifacts: [...artifacts]
    .map(([path, bytes]) => ({
      path,
      size: bytes.byteLength,
      mediaType: mediaTypeOf(path),
      sha256: digest(bytes),
    }))
    .sort((left, right) => (left.path < right.path ? -1 : 1)),
})

const writeReleaseFiles = (
  outputRoot: string,
  bundleRoot: string,
  files: ReadonlyMap<string, Buffer>,
): void => {
  mkdirSync(outputRoot, { recursive: true })
  const stagingRoot = mkdtempSync(join(outputRoot, '.cv-ui-release-'))
  try {
    for (const [path, bytes] of files) {
      const destination = join(stagingRoot, path)
      mkdirSync(dirname(destination), { recursive: true })
      writeFileSync(destination, bytes)
    }
    mkdirSync(dirname(bundleRoot), { recursive: true })
    renameSync(stagingRoot, bundleRoot)
  } finally {
    rmSync(stagingRoot, { recursive: true, force: true })
  }
}

const resumeRelease = (bundleRoot: string, files: ReadonlyMap<string, Buffer>): void => {
  for (const file of listFilePaths(bundleRoot)) {
    const path = toPosixPath(relative(bundleRoot, file))
    const candidate = files.get(path)
    if (!candidate) throw new Error(`Existing Release file is stale: ${path}`)
    if (!readFileSync(file).equals(candidate))
      throw new Error(`Existing Release file does not match the candidate: ${path}`)
  }
  for (const [path, bytes] of files) {
    const file = join(bundleRoot, path)
    if (existsSync(file)) continue
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, bytes)
  }
}

export const assembleRelease = ({
  releaseId,
  sourceRoot,
  outputRoot,
}: AssembleReleaseOptions): ReleaseManifestV1 => {
  assertReleaseId(releaseId)
  const artifacts = buildReleaseArtifacts(releaseId, sourceRoot)
  const manifest = buildManifest(releaseId, artifacts)
  const files = new Map(artifacts).set('manifest.json', Buffer.from(serializeJson(manifest)))
  const bundleRoot = join(outputRoot, 'releases', releaseId)
  if (existsSync(bundleRoot)) resumeRelease(bundleRoot, files)
  else writeReleaseFiles(outputRoot, bundleRoot, files)
  return manifest
}

const assertManifestPaths = (artifacts: readonly ReleaseArtifactV1[]): void => {
  const paths = artifacts.map(({ path }) => assertReleasePath(path))
  for (const path of paths) {
    if (path === 'manifest.json') throw new Error('The manifest inventories manifest.json')
    if (path.startsWith('schemas/')) throw new Error(`The manifest inventories a schema: ${path}`)
  }
  for (const [index, path] of paths.entries())
    if (index > 0 && path <= (paths[index - 1] ?? ''))
      throw new Error(`Manifest artifacts are not path-sorted and unique: ${path}`)
}

const assertBundleInventory = (
  presentPaths: Iterable<string>,
  artifacts: readonly ReleaseArtifactV1[],
): void => {
  const present = new Set(presentPaths)
  const inventoried = new Set([...artifacts.map(({ path }) => path), 'manifest.json'])
  for (const path of present)
    if (!inventoried.has(path)) throw new Error(`Release file is not in the manifest: ${path}`)
  for (const path of inventoried)
    if (!present.has(path)) throw new Error(`Release file is missing: ${path}`)
}

type VerifyReleaseFilesOptions = {
  readonly releaseId: string
  readonly files: ReadonlyMap<string, Buffer>
}

export const verifyReleaseFiles = ({
  releaseId,
  files,
}: VerifyReleaseFilesOptions): ReleaseManifestV1 => {
  assertReleaseId(releaseId)
  const manifestBytes = files.get('manifest.json')
  if (!manifestBytes) throw new Error(`Release manifest is missing: ${releaseId}`)
  const manifest = parseReleaseManifest(manifestBytes)
  if (manifest.releaseId !== releaseId)
    throw new Error(`The manifest names another Release: ${manifest.releaseId}`)
  assertManifestPaths(manifest.artifacts)
  assertBundleInventory(files.keys(), manifest.artifacts)

  const inventory = new Set(manifest.artifacts.map(({ path }) => path))
  assertRequiredPaths(inventory, files, releaseId)
  assertRemovalState(files)
  for (const artifact of manifest.artifacts) {
    const bytes = files.get(artifact.path)
    if (!bytes) throw new Error(`Release file is missing: ${artifact.path}`)
    if (bytes.byteLength !== artifact.size)
      throw new Error(`Release byte count does not match the manifest: ${artifact.path}`)
    if (digest(bytes) !== artifact.sha256)
      throw new Error(`Release digest does not match the manifest: ${artifact.path}`)
    if (mediaTypeOf(artifact.path) !== artifact.mediaType)
      throw new Error(`Release media type does not match the artifact: ${artifact.path}`)
    assertMediaTypeBytes(artifact.path, artifact.mediaType, bytes)
    if (artifact.mediaType === 'application/json')
      assertReferenceClosure(artifact.path, parseJsonBytes(bytes), releaseId, inventory)
  }
  return manifest
}

export const verifyRelease = ({
  releaseId,
  publicRoot,
}: VerifyReleaseOptions): ReleaseManifestV1 => {
  assertReleaseId(releaseId)
  const bundleRoot = join(publicRoot, 'releases', releaseId)
  const files = new Map(
    listFilePaths(bundleRoot).map((file) => [
      toPosixPath(relative(bundleRoot, file)),
      readFileSync(file),
    ]),
  )
  return verifyReleaseFiles({ releaseId, files })
}

const gitOutput = (...args: readonly string[]): string =>
  execFileSync('git', args, { cwd: repositoryRoot, encoding: 'utf8' }).trim()

const assertReleaseSource = (releaseId: string): void => {
  if (gitOutput('rev-parse', 'HEAD') !== releaseId)
    throw new Error(`The Release ID is not the checked out source commit: ${releaseId}`)
  if (gitOutput('status', '--porcelain').length > 0)
    throw new Error('The Release source has uncommitted changes')
  checkGeneratedArtifacts(join(repositoryRoot, 'public'))
}

const optionValue = (name: string): string | undefined => {
  const index = process.argv.indexOf(name)
  return index === -1 ? undefined : process.argv[index + 1]
}

const isMain = process.argv[1] ? resolve(process.argv[1]) === fileURLToPath(import.meta.url) : false
if (isMain) {
  const releaseId = optionValue('--release') ?? gitOutput('rev-parse', 'HEAD')
  const outputRoot = resolve(optionValue('--output') ?? join(repositoryRoot, '.releases'))
  if (!process.argv.includes('--verify')) {
    assertReleaseSource(releaseId)
    assembleRelease({ releaseId, sourceRoot: join(repositoryRoot, 'public'), outputRoot })
  }
  verifyRelease({ releaseId, publicRoot: outputRoot })
}
