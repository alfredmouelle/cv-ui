import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { readCatalogDocumentV1, TEMPLATE_CATALOG } from './catalog-document'

const generatedDocument: unknown = JSON.parse(
  readFileSync(
    fileURLToPath(new URL('../../../public/catalog/v1/templates.json', import.meta.url)),
    'utf8',
  ),
)
const activeEntry = {
  id: 'clearline',
  name: 'Clearline',
  summary: 'A one-column ATS-oriented CV.',
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
  searchAliases: ['ats'],
  supportedCvDataVersions: ['1'],
  license: 'MIT',
  preview: {
    pdf: '/previews/clearline/reference.pdf',
    pages: [{ src: '/previews/clearline/pages/001.png', width: 1191, height: 1684 }],
  },
  status: 'active',
} as const

describe('readCatalogDocumentV1', () => {
  it('reads the generated V1 document', () => {
    const result = readCatalogDocumentV1(generatedDocument)

    expect(result).toEqual({ success: true, data: generatedDocument })
  })

  it('accepts and ignores unknown fields of the supported major', () => {
    const result = readCatalogDocumentV1({
      schemaVersion: '1.1',
      templates: [{ ...activeEntry, popularity: 12 }],
      generatedAt: '2026-01-01',
    })

    expect(result).toEqual({
      success: true,
      data: { schemaVersion: '1.1', templates: [activeEntry] },
    })
  })

  it('rejects an unsupported major', () => {
    expect(readCatalogDocumentV1({ schemaVersion: '2.0', templates: [] })).toEqual({
      success: false,
      reason: 'unsupported-major',
    })
  })

  it('rejects a document without a readable schema version', () => {
    expect(readCatalogDocumentV1({ templates: [] })).toEqual({
      success: false,
      reason: 'invalid-document',
    })
    expect(readCatalogDocumentV1(null)).toEqual({ success: false, reason: 'invalid-document' })
  })

  it('rejects an entry that breaks the V1 contract', () => {
    expect(
      readCatalogDocumentV1({
        schemaVersion: '1.0',
        templates: [{ ...activeEntry, traits: { ...activeEntry.traits, layout: 'three-column' } }],
      }),
    ).toEqual({ success: false, reason: 'invalid-document' })
    expect(
      readCatalogDocumentV1({
        schemaVersion: '1.0',
        templates: [{ ...activeEntry, status: 'deprecated' }],
      }),
    ).toEqual({ success: false, reason: 'invalid-document' })
  })

  it('exposes the exact proof-template entries', () => {
    expect(
      TEMPLATE_CATALOG.templates.map(({ id, name, catalogOrder }) => ({ id, name, catalogOrder })),
    ).toEqual([
      { id: 'clearline', name: 'Clearline', catalogOrder: 0 },
      { id: 'signal-ledger', name: 'Signal Ledger', catalogOrder: 1 },
    ])
  })
})
