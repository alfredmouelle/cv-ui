import { createHash } from 'node:crypto'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

import type { ReleaseManifestV1 } from '../contracts/catalog'
import { listFilePaths } from './file-drift'
import { serializeJson } from './generate'
import { assembleRelease, verifyRelease } from './release'

const releaseId = '4f9a1c2d3e5b6a7c8d9e0f1a2b3c4d5e6f708192'
const otherReleaseId = '0192837465fedcba0192837465fedcba01928374'
const canonicalRoot = 'public'

const temporaryRoot = (name: string): string => mkdtempSync(join(tmpdir(), `cv-ui-${name}-`))

const copyCanonicalTree = (): string => {
  const sourceRoot = temporaryRoot('release-source')
  cpSync(canonicalRoot, sourceRoot, { recursive: true })
  return sourceRoot
}

const treeDigest = (root: string): string => {
  const hash = createHash('sha256')
  for (const file of listFilePaths(root)) {
    hash.update(relative(root, file))
    hash.update(readFileSync(file))
  }
  return hash.digest('hex')
}

const assembleCanonicalRelease = (): {
  readonly outputRoot: string
  readonly bundleRoot: string
} => {
  const outputRoot = temporaryRoot('release-output')
  assembleRelease({ releaseId, sourceRoot: canonicalRoot, outputRoot })
  return { outputRoot, bundleRoot: join(outputRoot, 'releases', releaseId) }
}

const readManifest = (bundleRoot: string): ReleaseManifestV1 =>
  JSON.parse(readFileSync(join(bundleRoot, 'manifest.json'), 'utf8')) as ReleaseManifestV1

const writeManifest = (bundleRoot: string, manifest: ReleaseManifestV1): void => {
  writeFileSync(join(bundleRoot, 'manifest.json'), serializeJson(manifest))
}

const replaceArtifact = (bundleRoot: string, path: string, bytes: Buffer): void => {
  const manifest = readManifest(bundleRoot)
  writeFileSync(join(bundleRoot, path), bytes)
  writeManifest(bundleRoot, {
    ...manifest,
    artifacts: manifest.artifacts.map((artifact) =>
      artifact.path === path
        ? {
            ...artifact,
            size: bytes.byteLength,
            sha256: createHash('sha256').update(bytes).digest('hex'),
          }
        : artifact,
    ),
  })
}

describe('Release assembly', () => {
  it('inventories every required artifact and excludes schemas and the manifest', () => {
    const { bundleRoot } = assembleCanonicalRelease()
    const manifest = readManifest(bundleRoot)

    expect(manifest.schemaVersion).toBe('1.0')
    expect(manifest.releaseId).toBe(releaseId)
    expect(manifest.artifacts.map(({ path }) => path)).toEqual([
      'catalog/templates.json',
      'catalog/v1/templates.json',
      'previews/clearline/pages/001.png',
      'previews/clearline/pages/002.png',
      'previews/clearline/reference.pdf',
      'previews/signal-ledger/pages/001.png',
      'previews/signal-ledger/pages/002.png',
      'previews/signal-ledger/reference.pdf',
      'r/clearline.json',
      'r/cv-data.json',
      'r/signal-ledger.json',
    ])
    expect(manifest.artifacts.map(({ mediaType }) => mediaType)).toEqual([
      'application/json',
      'application/json',
      'image/png',
      'image/png',
      'application/pdf',
      'image/png',
      'image/png',
      'application/pdf',
      'application/json',
      'application/json',
      'application/json',
    ])
    for (const artifact of manifest.artifacts) {
      const bytes = readFileSync(join(bundleRoot, artifact.path))
      expect(artifact.size).toBe(bytes.byteLength)
      expect(artifact.sha256).toBe(createHash('sha256').update(bytes).digest('hex'))
    }
    expect(listFilePaths(bundleRoot).map((file) => relative(bundleRoot, file))).toEqual(
      [...manifest.artifacts.map(({ path }) => path), 'manifest.json'].sort(),
    )
  })

  it('rewrites every artifact reference to one Release prefix', () => {
    const { bundleRoot } = assembleCanonicalRelease()
    const registryItem = readFileSync(join(bundleRoot, 'r/clearline.json'), 'utf8')
    const catalog = readFileSync(join(bundleRoot, 'catalog/templates.json'), 'utf8')

    expect(JSON.parse(registryItem)).toMatchObject({
      registryDependencies: [
        `https://cv-ui.alfredmouelle.com/releases/${releaseId}/r/cv-data.json`,
      ],
      meta: {
        cvUi: {
          preview: {
            pdf: `/releases/${releaseId}/previews/clearline/reference.pdf`,
            pages: [
              { src: `/releases/${releaseId}/previews/clearline/pages/001.png` },
              { src: `/releases/${releaseId}/previews/clearline/pages/002.png` },
            ],
          },
        },
      },
    })
    expect(JSON.parse(catalog)).toMatchObject({
      templates: [
        { registryUrl: `/releases/${releaseId}/r/clearline.json` },
        { registryUrl: `/releases/${releaseId}/r/signal-ledger.json` },
      ],
    })
    for (const document of [registryItem, catalog])
      expect(document).not.toMatch(
        /"(?:https:\/\/cv-ui\.alfredmouelle\.com)?\/(?:r|catalog|previews)\//u,
      )
  })

  it('is deterministic and leaves the canonical tree unchanged', () => {
    const before = treeDigest(canonicalRoot)
    const first = assembleCanonicalRelease()
    const second = assembleCanonicalRelease()

    expect(treeDigest(canonicalRoot)).toBe(before)
    expect(treeDigest(first.bundleRoot)).toBe(treeDigest(second.bundleRoot))
  })

  it('rejects a Release ID that is not a full lowercase source commit SHA', () => {
    const outputRoot = temporaryRoot('release-output')
    for (const invalid of [
      releaseId.toUpperCase(),
      releaseId.slice(0, 39),
      `${releaseId}0`,
      'main',
    ])
      expect(() =>
        assembleRelease({ releaseId: invalid, sourceRoot: canonicalRoot, outputRoot }),
      ).toThrow(/Release ID/u)
  })

  it('rejects a source that already carries a Release prefix', () => {
    const sourceRoot = copyCanonicalTree()
    const catalogPath = join(sourceRoot, 'catalog/templates.json')
    writeFileSync(
      catalogPath,
      readFileSync(catalogPath, 'utf8').replace(
        '"/previews/clearline/reference.pdf"',
        `"/releases/${otherReleaseId}/previews/clearline/reference.pdf"`,
      ),
    )

    expect(() =>
      assembleRelease({ releaseId, sourceRoot, outputRoot: temporaryRoot('release-output') }),
    ).toThrow(/Release-qualified/u)
  })

  it('rejects a missing artifact and a reference outside the bundle', () => {
    const missingRoot = copyCanonicalTree()
    rmSync(join(missingRoot, 'previews/clearline/reference.pdf'))
    expect(() =>
      assembleRelease({
        releaseId,
        sourceRoot: missingRoot,
        outputRoot: temporaryRoot('release-output'),
      }),
    ).toThrow(/previews\/clearline\/reference\.pdf/u)

    const danglingRoot = copyCanonicalTree()
    const catalogPath = join(danglingRoot, 'catalog/templates.json')
    writeFileSync(
      catalogPath,
      readFileSync(catalogPath, 'utf8').replace('"/r/clearline.json"', '"/r/absent.json"'),
    )
    expect(() =>
      assembleRelease({
        releaseId,
        sourceRoot: danglingRoot,
        outputRoot: temporaryRoot('release-output'),
      }),
    ).toThrow(/r\/absent\.json/u)
  })

  it('rejects a source without every supported Catalog document', () => {
    const sourceRoot = copyCanonicalTree()
    rmSync(join(sourceRoot, 'catalog/v1/templates.json'))

    expect(() =>
      assembleRelease({ releaseId, sourceRoot, outputRoot: temporaryRoot('release-output') }),
    ).toThrow(/catalog\/v1\/templates\.json/u)
  })

  it('rejects an artifact without a supported media type', () => {
    const sourceRoot = copyCanonicalTree()
    writeFileSync(join(sourceRoot, 'r/notes.txt'), 'unsupported\n')

    expect(() =>
      assembleRelease({ releaseId, sourceRoot, outputRoot: temporaryRoot('release-output') }),
    ).toThrow(/media type/u)
  })

  it('resumes an existing namespace only when every byte matches', () => {
    const { outputRoot, bundleRoot } = assembleCanonicalRelease()
    const digest = treeDigest(bundleRoot)

    expect(assembleRelease({ releaseId, sourceRoot: canonicalRoot, outputRoot }).releaseId).toBe(
      releaseId,
    )
    expect(treeDigest(bundleRoot)).toBe(digest)

    const corrupted = Buffer.concat([
      readFileSync(join(bundleRoot, 'r/cv-data.json')),
      Buffer.from('\n'),
    ])
    writeFileSync(join(bundleRoot, 'r/cv-data.json'), corrupted)
    expect(() => assembleRelease({ releaseId, sourceRoot: canonicalRoot, outputRoot })).toThrow(
      /r\/cv-data\.json/u,
    )
    expect(readFileSync(join(bundleRoot, 'r/cv-data.json'))).toEqual(corrupted)
  })

  it('completes an interrupted upload without overwriting existing bytes', () => {
    const { outputRoot, bundleRoot } = assembleCanonicalRelease()
    const digest = treeDigest(bundleRoot)
    rmSync(join(bundleRoot, 'previews/clearline/pages/002.png'))

    assembleRelease({ releaseId, sourceRoot: canonicalRoot, outputRoot })

    expect(treeDigest(bundleRoot)).toBe(digest)
  })

  it('rejects an artifact reference embedded in a longer value', () => {
    const sourceRoot = copyCanonicalTree()
    const registryPath = join(sourceRoot, 'r/clearline.json')
    writeFileSync(
      registryPath,
      readFileSync(registryPath, 'utf8').replace(
        '"description": "A one-column',
        '"summary": "url(\\"/previews/clearline/reference.pdf\\")",\n  "description": "A one-column',
      ),
    )

    expect(() =>
      assembleRelease({ releaseId, sourceRoot, outputRoot: temporaryRoot('release-output') }),
    ).toThrow(/not Release-qualified/u)
  })

  it('rejects source bytes that do not match their media type', () => {
    const sourceRoot = copyCanonicalTree()
    writeFileSync(join(sourceRoot, 'previews/clearline/pages/001.png'), 'not a PNG\n')

    expect(() =>
      assembleRelease({ releaseId, sourceRoot, outputRoot: temporaryRoot('release-output') }),
    ).toThrow(/media type/u)
  })

  it('rejects a stale file in an existing namespace', () => {
    const { outputRoot, bundleRoot } = assembleCanonicalRelease()
    mkdirSync(join(bundleRoot, 'r'), { recursive: true })
    writeFileSync(join(bundleRoot, 'r/stale.json'), '{}\n')

    expect(() => assembleRelease({ releaseId, sourceRoot: canonicalRoot, outputRoot })).toThrow(
      /r\/stale\.json/u,
    )
  })
})

describe('Release verification', () => {
  it('accepts the assembled public-shaped bundle', () => {
    const { outputRoot, bundleRoot } = assembleCanonicalRelease()

    expect(verifyRelease({ releaseId, publicRoot: outputRoot })).toEqual(readManifest(bundleRoot))
  })

  it('detects corrupted and truncated artifact bytes', () => {
    const corruptedRelease = assembleCanonicalRelease()
    const page = join(corruptedRelease.bundleRoot, 'previews/clearline/pages/001.png')
    const bytes = readFileSync(page)
    bytes[bytes.byteLength - 1] = (bytes[bytes.byteLength - 1] ?? 0) ^ 0xff
    writeFileSync(page, bytes)
    expect(() => verifyRelease({ releaseId, publicRoot: corruptedRelease.outputRoot })).toThrow(
      /pages\/001\.png/u,
    )

    const truncatedRelease = assembleCanonicalRelease()
    const pdf = join(truncatedRelease.bundleRoot, 'previews/clearline/reference.pdf')
    writeFileSync(pdf, readFileSync(pdf).subarray(0, 128))
    expect(() => verifyRelease({ releaseId, publicRoot: truncatedRelease.outputRoot })).toThrow(
      /reference\.pdf/u,
    )
  })

  it('detects an omitted artifact and a file the manifest does not inventory', () => {
    const omittedRelease = assembleCanonicalRelease()
    rmSync(join(omittedRelease.bundleRoot, 'r/signal-ledger.json'))
    expect(() => verifyRelease({ releaseId, publicRoot: omittedRelease.outputRoot })).toThrow(
      /r\/signal-ledger\.json/u,
    )

    const extraRelease = assembleCanonicalRelease()
    writeFileSync(join(extraRelease.bundleRoot, 'r/extra.json'), '{}\n')
    expect(() => verifyRelease({ releaseId, publicRoot: extraRelease.outputRoot })).toThrow(
      /r\/extra\.json/u,
    )
  })

  it('rejects duplicate, unsorted, self-inventoried, and traversing manifest paths', () => {
    const { outputRoot, bundleRoot } = assembleCanonicalRelease()
    const manifest = readManifest(bundleRoot)
    const [first] = manifest.artifacts
    if (!first) throw new Error('Missing manifest artifact')

    writeManifest(bundleRoot, { ...manifest, artifacts: [first, ...manifest.artifacts] })
    expect(() => verifyRelease({ releaseId, publicRoot: outputRoot })).toThrow(
      /path-sorted and unique/u,
    )

    writeManifest(bundleRoot, { ...manifest, artifacts: [...manifest.artifacts].reverse() })
    expect(() => verifyRelease({ releaseId, publicRoot: outputRoot })).toThrow(/sorted/u)

    writeManifest(bundleRoot, {
      ...manifest,
      artifacts: [{ ...first, path: '../escape.json' }, ...manifest.artifacts],
    })
    expect(() => verifyRelease({ releaseId, publicRoot: outputRoot })).toThrow(
      /Invalid Release path: \.\.\/escape\.json/u,
    )

    writeManifest(bundleRoot, {
      ...manifest,
      artifacts: [...manifest.artifacts, { ...first, path: 'manifest.json' }],
    })
    expect(() => verifyRelease({ releaseId, publicRoot: outputRoot })).toThrow(/manifest\.json/u)
  })

  it('rejects a media type that does not match the artifact', () => {
    const { outputRoot, bundleRoot } = assembleCanonicalRelease()
    const manifest = readManifest(bundleRoot)

    writeManifest(bundleRoot, {
      ...manifest,
      artifacts: manifest.artifacts.map((artifact) =>
        artifact.path === 'r/cv-data.json' ? { ...artifact, mediaType: 'image/png' } : artifact,
      ),
    })
    expect(() => verifyRelease({ releaseId, publicRoot: outputRoot })).toThrow(/media type/u)
  })

  it('rejects artifact bytes that do not match their media type', () => {
    const { outputRoot, bundleRoot } = assembleCanonicalRelease()
    replaceArtifact(bundleRoot, 'previews/clearline/reference.pdf', Buffer.from('not a PDF\n'))

    expect(() => verifyRelease({ releaseId, publicRoot: outputRoot })).toThrow(/media type/u)
  })

  it('rejects an artifact that references another Release', () => {
    const { outputRoot, bundleRoot } = assembleCanonicalRelease()
    const catalog = readFileSync(join(bundleRoot, 'catalog/templates.json'), 'utf8')
    replaceArtifact(
      bundleRoot,
      'catalog/templates.json',
      Buffer.from(
        catalog.replaceAll(`/releases/${releaseId}/r/`, `/releases/${otherReleaseId}/r/`),
      ),
    )

    expect(() => verifyRelease({ releaseId, publicRoot: outputRoot })).toThrow(/Release/u)
  })

  it('rejects a manifest that inventories a schema', () => {
    const { outputRoot, bundleRoot } = assembleCanonicalRelease()
    const manifest = readManifest(bundleRoot)
    const [first] = manifest.artifacts
    if (!first) throw new Error('Missing manifest artifact')

    writeManifest(bundleRoot, {
      ...manifest,
      artifacts: [...manifest.artifacts, { ...first, path: 'schemas/cv-data/v1.json' }],
    })
    expect(() => verifyRelease({ releaseId, publicRoot: outputRoot })).toThrow(/schemas/u)
  })
})
