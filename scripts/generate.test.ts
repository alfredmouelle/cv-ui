import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import englishFixture from '../fixtures/cv/en.json'
import { clearlineExampleCvData } from '../registry/clearline/example'
import { generateArtifacts } from './generate'

describe('CV Registry generation', () => {
  it('installs the canonical English fixture without another data copy', () => {
    expect(clearlineExampleCvData).toEqual(englishFixture)
  })

  it('generates the Clearline item and Catalog documents deterministically', () => {
    const outputRoot = mkdtempSync(join(tmpdir(), 'cv-ui-generate-'))
    generateArtifacts(outputRoot)

    const registryItem: unknown = JSON.parse(
      readFileSync(join(outputRoot, 'r/clearline.json'), 'utf8'),
    )
    expect(registryItem).toBeTypeOf('object')
    if (!registryItem || typeof registryItem !== 'object') throw new Error('Invalid registry item')
    expect(registryItem).toMatchObject({
      name: 'clearline',
      type: 'registry:block',
      title: 'Clearline',
      author: 'Alfred Mouelle',
      dependencies: [],
      devDependencies: [],
      registryDependencies: ['https://cv-ui.alfredmouelle.com/r/cv-data.json'],
    })

    const files = Reflect.get(registryItem, 'files')
    expect(files).toBeInstanceOf(Array)
    if (!Array.isArray(files)) throw new Error('Invalid registry files')
    const generatedFiles = files.map((file) => {
      if (!file || typeof file !== 'object') throw new Error('Invalid registry file')
      const target = Reflect.get(file, 'target')
      const content = Reflect.get(file, 'content')
      if (typeof target !== 'string' || typeof content !== 'string')
        throw new Error('Invalid registry file')
      return { target, content }
    })
    expect(generatedFiles.map(({ target }) => target)).toEqual([
      '@components/cv/clearline/clearline.tsx',
      '@components/cv/clearline/clearline.css',
      '@lib/cv/examples/clearline.ts',
      '~/public/cv-ui/clearline/fonts/geist-latin-wght-normal.woff2',
      '~/public/cv-ui/clearline/licenses/OFL-1.1.txt',
    ])
    expect(generatedFiles.every(({ content }) => content.length > 0)).toBe(true)

    const currentCatalog = readFileSync(join(outputRoot, 'catalog/templates.json'), 'utf8')
    const versionedCatalog = readFileSync(join(outputRoot, 'catalog/v1/templates.json'), 'utf8')
    expect(currentCatalog).toBe(versionedCatalog)
    expect(JSON.parse(currentCatalog)).toEqual({
      schemaVersion: '1.0',
      templates: [
        {
          id: 'clearline',
          name: 'Clearline',
          summary:
            'A one-column ATS-oriented CV with restrained blue rules and one linear reading order.',
          author: 'Alfred Mouelle',
          registryUrl: '/r/clearline.json',
          catalogOrder: 0,
          traits: {
            layout: 'single-column',
            atsIntent: 'ats-oriented',
            visualTone: 'classic',
            density: 'balanced',
            photoSupport: 'not-supported',
          },
          searchAliases: ['ats', 'single column', 'traditional', 'professional'],
          supportedCvDataVersions: ['1'],
          license: 'MIT',
          preview: {
            pdf: '/previews/clearline/reference.pdf',
            pages: [
              { src: '/previews/clearline/pages/001.png', width: 1191, height: 1684 },
              { src: '/previews/clearline/pages/002.png', width: 1191, height: 1684 },
            ],
          },
          status: 'active',
        },
      ],
    })
  })
})
