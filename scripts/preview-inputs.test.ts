import { describe, expect, it } from 'vitest'

import { hasPreviewInput, isPreviewInput } from './preview-inputs'

describe('preview applicability', () => {
  it('accepts every specified preview input', () => {
    const inputs = [
      'registry.json',
      'registry/clearline/clearline.tsx',
      'registry/cv-data/cv-data.ts',
      'fixtures/cv/en.json',
      'scripts/previews.ts',
      'scripts/preview-inputs.ts',
      'contracts/catalog.ts',
      'public/previews/clearline/reference.pdf',
      'package.json',
      'pnpm-lock.yaml',
      'pnpm-workspace.yaml',
      'src/styles.css',
      'tsconfig.json',
      'tsconfig.node.json',
      'tsr.config.json',
      'vite.config.ts',
      'vitest.config.ts',
      'playwright.config.ts',
      'postcss.config.mjs',
      'tailwind.config.js',
      '.github/workflows/ci.yml',
      '.github/workflows/gate.yml',
      '.github/actions/setup/action.yml',
    ]

    expect(inputs.filter((path) => !isPreviewInput(path))).toEqual([])
  })

  it('skips changes that cannot affect Reference Output', () => {
    const skipped = [
      'README.md',
      'CONTRIBUTING.md',
      'docs/spec/v1.md',
      'src/routes/catalog.tsx',
      'src/components/install-panel.tsx',
      '.github/ISSUE_TEMPLATE/bug.yml',
      '.vscode/settings.json',
    ]

    expect(skipped.filter((path) => isPreviewInput(path))).toEqual([])
  })

  it('is applicable when any changed path is a preview input', () => {
    expect(hasPreviewInput(['docs/spec/v1.md', 'registry/clearline/clearline.css'])).toBe(true)
    expect(hasPreviewInput(['docs/spec/v1.md', 'README.md'])).toBe(false)
    expect(hasPreviewInput([])).toBe(false)
  })
})
