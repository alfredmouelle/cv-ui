import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { runPreviewCommand, sanitizePdfMetadata } from './previews'

const createRepository = (): string => {
  const repositoryRoot = mkdtempSync(join(tmpdir(), 'cv-ui-previews-test-'))
  const previewRoot = join(repositoryRoot, 'public/previews/clearline')
  mkdirSync(previewRoot, { recursive: true })
  writeFileSync(join(previewRoot, 'reference.pdf'), 'accepted')
  return repositoryRoot
}

describe('preview commands', () => {
  it('normalizes Chromium PDF timestamps without changing byte length', () => {
    const pdf = Buffer.from(
      "/CreationDate (D:20260901174039+00'00') /ModDate (D:20260901174039+00'00')",
    )
    const sanitized = sanitizePdfMetadata(pdf)

    expect(sanitized).toHaveLength(pdf.length)
    expect(sanitized.toString()).toBe(
      "/CreationDate (D:20000101000000+00'00') /ModDate (D:20000101000000+00'00')",
    )
  })

  it('leaves accepted output unchanged when an update capture fails', async () => {
    const repositoryRoot = createRepository()

    await expect(
      runPreviewCommand({
        mode: 'update',
        repositoryRoot,
        capture: async (outputRoot) => {
          mkdirSync(join(outputRoot, 'previews/clearline'), { recursive: true })
          writeFileSync(join(outputRoot, 'previews/clearline/reference.pdf'), 'partial')
          throw new Error('capture failed')
        },
      }),
    ).rejects.toThrow('capture failed')

    expect(
      readFileSync(join(repositoryRoot, 'public/previews/clearline/reference.pdf'), 'utf8'),
    ).toBe('accepted')
  })

  it('preserves failure diagnostics when configured', async () => {
    const repositoryRoot = createRepository()
    const diagnosticsRoot = join(repositoryRoot, 'diagnostics')
    process.env.CV_UI_PREVIEW_DIAGNOSTICS = diagnosticsRoot

    try {
      await expect(
        runPreviewCommand({
          mode: 'check',
          repositoryRoot,
          capture: async (outputRoot) => {
            const previewRoot = join(outputRoot, 'previews/clearline')
            mkdirSync(previewRoot, { recursive: true })
            writeFileSync(join(previewRoot, 'reference.pdf'), 'partial')
            throw new Error('capture failed')
          },
        }),
      ).rejects.toThrow('capture failed')

      expect(readFileSync(join(diagnosticsRoot, 'actual/clearline/reference.pdf'), 'utf8')).toBe(
        'partial',
      )
      expect(readFileSync(join(diagnosticsRoot, 'expected/clearline/reference.pdf'), 'utf8')).toBe(
        'accepted',
      )
      expect(readFileSync(join(diagnosticsRoot, 'capture.log'), 'utf8')).toContain('capture failed')
      expect(JSON.parse(readFileSync(join(diagnosticsRoot, 'report.json'), 'utf8'))).toMatchObject({
        status: 'failed',
      })
    } finally {
      delete process.env.CV_UI_PREVIEW_DIAGNOSTICS
    }
  })

  it('leaves accepted output unchanged when update preparation fails', async () => {
    const repositoryRoot = createRepository()

    await expect(
      runPreviewCommand({
        mode: 'update',
        repositoryRoot,
        capture: async (outputRoot) => {
          const previewRoot = join(outputRoot, 'previews/clearline')
          mkdirSync(previewRoot, { recursive: true })
          writeFileSync(join(previewRoot, 'reference.pdf'), 'replacement')
        },
        prepare: () => {
          throw new Error('generation failed')
        },
      }),
    ).rejects.toThrow('generation failed')

    expect(
      readFileSync(join(repositoryRoot, 'public/previews/clearline/reference.pdf'), 'utf8'),
    ).toBe('accepted')
  })

  it('checks captured bytes without editing accepted output', async () => {
    const repositoryRoot = createRepository()

    await runPreviewCommand({
      mode: 'check',
      repositoryRoot,
      capture: async (outputRoot) => {
        const previewRoot = join(outputRoot, 'previews/clearline')
        mkdirSync(previewRoot, { recursive: true })
        writeFileSync(join(previewRoot, 'reference.pdf'), 'accepted')
      },
    })

    expect(
      readFileSync(join(repositoryRoot, 'public/previews/clearline/reference.pdf'), 'utf8'),
    ).toBe('accepted')
  })
})
