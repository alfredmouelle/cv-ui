import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'

import type { ReleaseManifestV1 } from '../contracts/catalog'
import {
  type PromotionAdapters,
  PromotionCoordinator,
  type ReleasePointerV1,
  serveImmutableRelease,
  serveStableAlias,
  type VerificationCommand,
} from './promotion'

const firstReleaseId = '4f9a1c2d3e5b6a7c8d9e0f1a2b3c4d5e6f708192'
const secondReleaseId = '0192837465fedcba0192837465fedcba01928374'
const thirdReleaseId = 'abcdef0123456789abcdef0123456789abcdef01'

const digest = (bytes: Buffer): string => createHash('sha256').update(bytes).digest('hex')

const releaseBundle = (
  releaseId: string,
  reference = `/releases/${releaseId}/catalog/templates.json`,
): ReadonlyMap<string, Buffer> => {
  const json = Buffer.from(`${JSON.stringify({ catalogUrl: reference })}\n`)
  const pdf = Buffer.from('%PDF-fake\n')
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00])
  const artifacts = [
    ['catalog/templates.json', 'application/json', json],
    ['catalog/v1/templates.json', 'application/json', json],
    ['previews/clearline/pages/001.png', 'image/png', png],
    ['previews/clearline/pages/002.png', 'image/png', png],
    ['previews/clearline/reference.pdf', 'application/pdf', pdf],
    ['previews/signal-ledger/pages/001.png', 'image/png', png],
    ['previews/signal-ledger/pages/002.png', 'image/png', png],
    ['previews/signal-ledger/reference.pdf', 'application/pdf', pdf],
    ['r/clearline.json', 'application/json', json],
    ['r/cv-data.json', 'application/json', json],
    ['r/signal-ledger.json', 'application/json', json],
  ] as const
  const manifest = {
    schemaVersion: '1.0',
    releaseId,
    artifacts: artifacts.map(([path, mediaType, bytes]) => ({
      path,
      size: bytes.byteLength,
      mediaType,
      sha256: digest(bytes),
    })),
  } satisfies ReleaseManifestV1
  const manifestBytes = Buffer.from(`${JSON.stringify(manifest)}\n`)
  return new Map<string, Buffer>([
    ...artifacts.map(([path, , bytes]) => [path, bytes] as const),
    ['manifest.json', manifestBytes],
  ])
}

class FakePromotionAdapters implements PromotionAdapters {
  readonly immutable = new Map<string, Buffer>()
  readonly recordedPointers = new Map<string, ReleasePointerV1>()
  readonly events: string[] = []
  pointer: ReleasePointerV1 | undefined
  failNextPurge = false
  failCatalog = false
  failCandidate = false
  forceNextCasConflict = false
  onWrite: (() => void) | undefined
  candidateCommands: readonly VerificationCommand[] = []
  #promotionTail: Promise<void> = Promise.resolve()

  serializePromotion<T>(job: () => Promise<T>): Promise<T> {
    const result = this.#promotionTail.then(job)
    this.#promotionTail = result.then(
      () => undefined,
      () => undefined,
    )
    return result
  }

  async readImmutable(releaseId: string, path: string): Promise<Buffer | undefined> {
    return this.immutable.get(`${releaseId}/${path}`)
  }

  async writeImmutable(releaseId: string, path: string, bytes: Buffer): Promise<void> {
    this.events.push(`upload:${path}`)
    this.onWrite?.()
    this.immutable.set(`${releaseId}/${path}`, Buffer.from(bytes))
  }

  async listImmutable(releaseId: string): Promise<readonly string[]> {
    const prefix = `${releaseId}/`
    return [...this.immutable.keys()]
      .filter((key) => key.startsWith(prefix))
      .map((key) => key.slice(prefix.length))
      .sort()
  }

  async readPointer(): Promise<ReleasePointerV1 | undefined> {
    return this.pointer
  }

  async readRecordedPointer(releaseId: string): Promise<ReleasePointerV1 | undefined> {
    return this.recordedPointers.get(releaseId)
  }

  async compareAndSwapPointer(
    expectedReleaseId: string | undefined,
    pointer: ReleasePointerV1 | undefined,
  ): Promise<boolean> {
    if (this.forceNextCasConflict) {
      this.forceNextCasConflict = false
      return false
    }
    if (this.pointer?.currentReleaseId !== expectedReleaseId) return false
    this.events.push(`pointer:${pointer?.currentReleaseId ?? 'none'}`)
    this.pointer = pointer
    if (pointer) this.recordedPointers.set(pointer.currentReleaseId, pointer)
    return true
  }

  async purgeStableAliases(): Promise<void> {
    this.events.push('purge')
    if (this.failNextPurge) {
      this.failNextPurge = false
      throw new Error('Purge failed')
    }
  }

  async verifyReleaseCandidate(
    _releaseId: string,
    commands: readonly VerificationCommand[],
  ): Promise<void> {
    this.events.push('check:candidate')
    this.candidateCommands = commands
    if (this.failCandidate) throw new Error('Candidate failed')
  }

  async verifyUncachedAliases(): Promise<void> {
    this.events.push('check:aliases')
  }

  async verifyNamedRegistryInstallation(): Promise<void> {
    this.events.push('check:install-named')
  }

  async verifyDirectRegistryInstallation(): Promise<void> {
    this.events.push('check:install-direct')
  }

  async verifyCatalog(): Promise<void> {
    this.events.push('check:catalog')
    if (this.failCatalog) throw new Error('Catalog failed')
  }

  async verifyReferencePdfs(): Promise<void> {
    this.events.push('check:pdfs')
  }

  async verifyPreviewPngs(): Promise<void> {
    this.events.push('check:pngs')
  }

  async verifyManifestBytes(): Promise<void> {
    this.events.push('check:manifest')
  }

  async verifySelectedCommit(): Promise<void> {
    this.events.push('check:commit')
  }

  async announce(): Promise<void> {
    this.events.push('announce')
  }
}

describe('Release promotion', () => {
  it('selects one verified Release and opens the announcement gate last', async () => {
    const adapters = new FakePromotionAdapters()
    const coordinator = new PromotionCoordinator(adapters)
    const files = releaseBundle(firstReleaseId)

    const pointer = await coordinator.promote({
      releaseId: firstReleaseId,
      expectedPreviousReleaseId: undefined,
      files,
    })

    expect(pointer).toEqual({
      schemaVersion: '1.0',
      currentReleaseId: firstReleaseId,
      manifestUrl: `/releases/${firstReleaseId}/manifest.json`,
      manifestSha256: digest(files.get('manifest.json') ?? Buffer.alloc(0)),
    })
    expect(adapters.events).toEqual([
      'check:candidate',
      ...[...files.keys()].map((path) => `upload:${path}`),
      `pointer:${firstReleaseId}`,
      'purge',
      'check:aliases',
      'check:install-named',
      'check:install-direct',
      'check:catalog',
      'check:pdfs',
      'check:pngs',
      'check:manifest',
      'check:commit',
      'announce',
    ])
  })

  it('serves aliases and immutable artifacts with their distinct cache contracts', async () => {
    const adapters = new FakePromotionAdapters()
    const coordinator = new PromotionCoordinator(adapters)
    await coordinator.promote({
      releaseId: firstReleaseId,
      expectedPreviousReleaseId: undefined,
      files: releaseBundle(firstReleaseId),
    })

    const alias = await serveStableAlias(adapters, 'catalog/templates.json')
    const immutable = await serveImmutableRelease(
      adapters,
      firstReleaseId,
      'catalog/templates.json',
    )

    expect(alias.status).toBe(200)
    expect(alias.headers).toEqual({
      'Cache-Control': 'public, max-age=0, must-revalidate',
      ETag: `"${digest(alias.body)}"`,
      'X-CV-UI-Release': firstReleaseId,
    })
    expect(alias.body.toString()).toContain(`/releases/${firstReleaseId}/`)
    expect(immutable.status).toBe(200)
    expect(immutable.headers).toEqual({
      'Cache-Control': 'public, max-age=31536000, immutable',
    })
  })

  it('serializes concurrent promotions and ignores cancellation after upload starts', async () => {
    const adapters = new FakePromotionAdapters()
    const firstCoordinator = new PromotionCoordinator(adapters)
    const secondCoordinator = new PromotionCoordinator(adapters)
    const abort = new AbortController()
    adapters.onWrite = () => abort.abort()

    const first = firstCoordinator.promote({
      releaseId: firstReleaseId,
      expectedPreviousReleaseId: undefined,
      files: releaseBundle(firstReleaseId),
      signal: abort.signal,
    })
    const second = secondCoordinator.promote({
      releaseId: secondReleaseId,
      expectedPreviousReleaseId: firstReleaseId,
      files: releaseBundle(secondReleaseId),
    })

    await expect(first).resolves.toMatchObject({ currentReleaseId: firstReleaseId })
    await expect(second).resolves.toMatchObject({
      currentReleaseId: secondReleaseId,
      previousReleaseId: firstReleaseId,
    })
    expect(adapters.pointer?.currentReleaseId).toBe(secondReleaseId)
    expect(adapters.events.indexOf(`pointer:${firstReleaseId}`)).toBeLessThan(
      adapters.events.indexOf(`pointer:${secondReleaseId}`),
    )
  })

  it('resumes matching upload bytes and rejects mismatches before pointer change', async () => {
    const adapters = new FakePromotionAdapters()
    const files = releaseBundle(firstReleaseId)
    adapters.immutable.set(
      `${firstReleaseId}/catalog/templates.json`,
      Buffer.from(files.get('catalog/templates.json') ?? EMPTY_TEST_BUFFER),
    )

    await new PromotionCoordinator(adapters).promote({
      releaseId: firstReleaseId,
      expectedPreviousReleaseId: undefined,
      files,
    })

    expect(adapters.events).not.toContain('upload:catalog/templates.json')
    expect(adapters.events).toContain('upload:manifest.json')

    const mismatchAdapters = new FakePromotionAdapters()
    mismatchAdapters.immutable.set(`${firstReleaseId}/catalog/templates.json`, Buffer.from('bad'))
    await expect(
      new PromotionCoordinator(mismatchAdapters).promote({
        releaseId: firstReleaseId,
        expectedPreviousReleaseId: undefined,
        files,
      }),
    ).rejects.toThrow(/byte mismatch/u)
    expect(mismatchAdapters.pointer).toBeUndefined()
  })

  it('runs the verified candidate gate before upload', async () => {
    const adapters = new FakePromotionAdapters()
    adapters.failCandidate = true

    await expect(
      new PromotionCoordinator(adapters).promote({
        releaseId: firstReleaseId,
        expectedPreviousReleaseId: undefined,
        files: releaseBundle(firstReleaseId),
      }),
    ).rejects.toThrow('Candidate failed')
    expect(adapters.events).toEqual(['check:candidate'])
    expect(adapters.candidateCommands).toEqual([
      'pnpm typecheck',
      'pnpm check',
      'pnpm test',
      'pnpm generate:check',
      'pnpm previews:check',
    ])
    expect(adapters.immutable.size).toBe(0)
    expect(adapters.pointer).toBeUndefined()
  })

  it.each([
    'see /r/clearline.json',
    `https://evil.test/releases/${firstReleaseId}/catalog/templates.json`,
    `/releases/${secondReleaseId}/catalog/templates.json`,
  ])('rejects an invalid published reference: %s', async (reference) => {
    const adapters = new FakePromotionAdapters()

    await expect(
      new PromotionCoordinator(adapters).promote({
        releaseId: firstReleaseId,
        expectedPreviousReleaseId: undefined,
        files: releaseBundle(firstReleaseId, reference),
      }),
    ).rejects.toThrow(/Release|reference/u)
    expect(adapters.pointer).toBeUndefined()
  })

  it('leaves the previous Release current after a CAS conflict', async () => {
    const adapters = new FakePromotionAdapters()
    const coordinator = new PromotionCoordinator(adapters)
    await coordinator.promote({
      releaseId: firstReleaseId,
      expectedPreviousReleaseId: undefined,
      files: releaseBundle(firstReleaseId),
    })
    adapters.forceNextCasConflict = true

    await expect(
      coordinator.promote({
        releaseId: secondReleaseId,
        expectedPreviousReleaseId: firstReleaseId,
        files: releaseBundle(secondReleaseId),
      }),
    ).rejects.toThrow(/compare-and-swap/u)
    expect(adapters.pointer?.currentReleaseId).toBe(firstReleaseId)
  })

  it('restores, purges, and verifies the previous Release after a purge failure', async () => {
    const adapters = new FakePromotionAdapters()
    const coordinator = new PromotionCoordinator(adapters)
    await coordinator.promote({
      releaseId: firstReleaseId,
      expectedPreviousReleaseId: undefined,
      files: releaseBundle(firstReleaseId),
    })
    adapters.events.length = 0
    adapters.failNextPurge = true

    await expect(
      coordinator.promote({
        releaseId: secondReleaseId,
        expectedPreviousReleaseId: firstReleaseId,
        files: releaseBundle(secondReleaseId),
      }),
    ).rejects.toThrow('Purge failed')
    expect(adapters.pointer?.currentReleaseId).toBe(firstReleaseId)
    expect(adapters.events.slice(-4)).toEqual([
      'purge',
      `pointer:${firstReleaseId}`,
      'purge',
      'check:aliases',
    ])
  })

  it('rolls back a failed post-promotion check and never announces it', async () => {
    const adapters = new FakePromotionAdapters()
    const coordinator = new PromotionCoordinator(adapters)
    await coordinator.promote({
      releaseId: firstReleaseId,
      expectedPreviousReleaseId: undefined,
      files: releaseBundle(firstReleaseId),
    })
    adapters.events.length = 0
    adapters.failCatalog = true

    await expect(
      coordinator.promote({
        releaseId: secondReleaseId,
        expectedPreviousReleaseId: firstReleaseId,
        files: releaseBundle(secondReleaseId),
      }),
    ).rejects.toThrow('Catalog failed')
    expect(adapters.pointer?.currentReleaseId).toBe(firstReleaseId)
    expect(adapters.events).not.toContain('announce')
  })

  it('returns 503 before the first promotion', async () => {
    const response = await serveStableAlias(new FakePromotionAdapters(), 'catalog/templates.json')

    expect(response).toEqual({
      status: 503,
      body: EMPTY_TEST_BUFFER,
      headers: { 'Cache-Control': 'public, max-age=0, must-revalidate' },
    })
  })

  it('returns 503 and clears the pointer when a first Release artifact is missing', async () => {
    const adapters = new FakePromotionAdapters()
    await new PromotionCoordinator(adapters).promote({
      releaseId: firstReleaseId,
      expectedPreviousReleaseId: undefined,
      files: releaseBundle(firstReleaseId),
    })
    adapters.immutable.delete(`${firstReleaseId}/catalog/templates.json`)

    const response = await serveStableAlias(adapters, 'catalog/templates.json')

    expect(response.status).toBe(503)
    expect(adapters.pointer).toBeUndefined()
  })

  it('returns 503 and rolls back without mixing Releases after Current Release corruption', async () => {
    const adapters = new FakePromotionAdapters()
    const coordinator = new PromotionCoordinator(adapters)
    await coordinator.promote({
      releaseId: firstReleaseId,
      expectedPreviousReleaseId: undefined,
      files: releaseBundle(firstReleaseId),
    })
    await coordinator.promote({
      releaseId: secondReleaseId,
      expectedPreviousReleaseId: firstReleaseId,
      files: releaseBundle(secondReleaseId),
    })
    adapters.events.length = 0
    adapters.immutable.set(`${secondReleaseId}/catalog/templates.json`, Buffer.from('corrupt'))

    const response = await serveStableAlias(adapters, 'catalog/templates.json')

    expect(response.status).toBe(503)
    expect(response.body).toEqual(EMPTY_TEST_BUFFER)
    expect(adapters.pointer?.currentReleaseId).toBe(firstReleaseId)
    expect(adapters.events).toEqual([`pointer:${firstReleaseId}`, 'purge', 'check:aliases'])
  })

  it('restores the exact prior pointer across repeated runtime rollbacks', async () => {
    const adapters = new FakePromotionAdapters()
    const coordinator = new PromotionCoordinator(adapters)
    for (const [releaseId, expectedPreviousReleaseId] of [
      [firstReleaseId, undefined],
      [secondReleaseId, firstReleaseId],
      [thirdReleaseId, secondReleaseId],
    ] as const)
      await coordinator.promote({
        releaseId,
        expectedPreviousReleaseId,
        files: releaseBundle(releaseId),
      })
    adapters.immutable.set(`${thirdReleaseId}/catalog/templates.json`, Buffer.from('corrupt'))

    expect((await serveStableAlias(adapters, 'catalog/templates.json')).status).toBe(503)
    expect(adapters.pointer).toMatchObject({
      currentReleaseId: secondReleaseId,
      previousReleaseId: firstReleaseId,
    })
    adapters.immutable.set(`${secondReleaseId}/catalog/templates.json`, Buffer.from('corrupt'))

    expect((await serveStableAlias(adapters, 'catalog/templates.json')).status).toBe(503)
    expect(adapters.pointer?.currentReleaseId).toBe(firstReleaseId)
  })
})

const EMPTY_TEST_BUFFER = Buffer.alloc(0)
