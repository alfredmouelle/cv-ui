import { describe, expect, it } from 'vitest'

import type { TemplateCatalogDocument, TemplateCatalogEntry } from './catalog-document'
import { TEMPLATE_CATALOG } from './catalog-document'
import type { CatalogSearch } from './catalog-search'
import { discoverTemplates, normalizeCatalogTokens } from './discovery'

type ActiveEntry = Extract<TemplateCatalogEntry, { status: 'active' }>
type EntryOverrides = Partial<Omit<ActiveEntry, 'deprecation' | 'status' | 'traits'>> & {
  readonly traits?: Partial<ActiveEntry['traits']>
}

const entry = (id: string, overrides: EntryOverrides = {}): TemplateCatalogEntry => ({
  id,
  name: id,
  summary: 'A CV template.',
  author: 'Alfred Mouelle',
  registryUrl: `/r/${id}.json`,
  catalogOrder: 0,
  searchAliases: [],
  supportedCvDataVersions: ['1'],
  license: 'MIT',
  preview: {
    pdf: `/previews/${id}/reference.pdf`,
    pages: [{ src: `/previews/${id}/pages/001.png`, width: 1191, height: 1684 }],
  },
  ...overrides,
  status: 'active',
  traits: {
    layout: 'single-column',
    atsIntent: 'ats-oriented',
    visualTone: 'classic',
    density: 'balanced',
    photoSupport: 'not-supported',
    ...overrides.traits,
  },
})

const catalogOf = (templates: readonly TemplateCatalogEntry[]): TemplateCatalogDocument => ({
  schemaVersion: '1.0',
  templates,
})

const resultIds = (
  templates: readonly TemplateCatalogEntry[],
  search: CatalogSearch,
): readonly string[] => discoverTemplates(catalogOf(templates), search).results.map(({ id }) => id)

const facetOf = (templates: readonly TemplateCatalogEntry[], search: CatalogSearch, key: string) =>
  discoverTemplates(catalogOf(templates), search).facets.find((facet) => facet.key === key)

describe('normalizeCatalogTokens', () => {
  it('applies the fixed Unicode normalization process', () => {
    expect(normalizeCatalogTokens('Élégant  CV')).toEqual(['elegant', 'cv'])
    expect(normalizeCatalogTokens('two-column, ATS-oriented!')).toEqual([
      'two',
      'column',
      'ats',
      'oriented',
    ])
    expect(normalizeCatalogTokens('ﬁche №1')).toEqual(['fiche', 'no1'])
    expect(normalizeCatalogTokens('Groß')).toEqual(['gross'])
    expect(normalizeCatalogTokens('   ')).toEqual([])
  })
})

describe('discoverTemplates search', () => {
  const templates = [
    entry('alpha', {
      name: 'Signal Ledger',
      summary: 'A visual two-column CV.',
      searchAliases: ['ledger', 'créatif'],
      traits: { layout: 'two-column', atsIntent: 'visual-first', visualTone: 'modern' },
    }),
    entry('beta', { name: 'Clearline', summary: 'A one-column ATS CV.' }),
  ]

  it('matches every query token as a complete indexed token or prefix', () => {
    expect(resultIds(templates, { q: 'sig led' })).toEqual(['alpha'])
    expect(resultIds(templates, { q: 'visual column' })).toEqual(['alpha'])
    expect(resultIds(templates, { q: 'ledgers' })).toEqual([])
    expect(resultIds(templates, { q: 'signal clearline' })).toEqual([])
  })

  it('indexes trait literals and reviewed aliases', () => {
    expect(resultIds(templates, { q: 'visual-first' })).toEqual(['alpha'])
    expect(resultIds(templates, { q: 'creatif' })).toEqual(['alpha'])
  })

  it('excludes ids, paths, author names, and license text', () => {
    expect(resultIds(templates, { q: 'alpha' })).toEqual([])
    expect(resultIds(templates, { q: 'alfred' })).toEqual([])
    expect(resultIds(templates, { q: 'mit' })).toEqual([])
    expect(resultIds(templates, { q: 'previews' })).toEqual([])
  })

  it('does not change the result order', () => {
    const ordered = [
      entry('a', { name: 'Zed', catalogOrder: 0 }),
      entry('b', { name: 'Amber', catalogOrder: 1 }),
    ]

    expect(resultIds(ordered, { q: 'cv' })).toEqual(['a', 'b'])
  })
})

describe('discoverTemplates filters', () => {
  const templates = [
    entry('single-classic'),
    entry('two-modern', { traits: { layout: 'two-column', visualTone: 'modern' } }),
    entry('two-classic', { traits: { layout: 'two-column' } }),
  ]

  it('uses OR inside one dimension', () => {
    expect(resultIds(templates, { layout: ['single-column', 'two-column'] })).toEqual([
      'single-classic',
      'two-classic',
      'two-modern',
    ])
  })

  it('uses AND across dimensions', () => {
    expect(resultIds(templates, { layout: ['two-column'], tone: ['modern'] })).toEqual([
      'two-modern',
    ])
  })

  it('counts each value against the other active dimensions', () => {
    expect(facetOf(templates, { tone: ['modern'] }, 'layout')?.values).toEqual([
      { value: 'single-column', label: 'Single column', count: 0, selected: false, disabled: true },
      { value: 'two-column', label: 'Two column', count: 1, selected: false, disabled: false },
    ])
  })

  it('keeps a selected zero-count value visible and enabled', () => {
    const facet = facetOf(templates, { tone: ['expressive'], layout: ['two-column'] }, 'layout')

    expect(facet?.values.find(({ value }) => value === 'two-column')).toEqual({
      value: 'two-column',
      label: 'Two column',
      count: 0,
      selected: true,
      disabled: false,
    })
  })

  it('ignores its own selection when counting a dimension', () => {
    expect(facetOf(templates, { layout: ['single-column'] }, 'layout')?.values).toEqual([
      { value: 'single-column', label: 'Single column', count: 1, selected: true, disabled: false },
      { value: 'two-column', label: 'Two column', count: 2, selected: false, disabled: false },
    ])
  })
})

describe('discoverTemplates order', () => {
  const templates = [
    entry('b', { name: 'Amber', catalogOrder: 2 }),
    entry('a', { name: 'Zed', catalogOrder: 1 }),
    entry('c', { name: 'Amber', catalogOrder: 2 }),
  ]

  it('defaults to catalog order, then English name, then id', () => {
    expect(resultIds(templates, {})).toEqual(['a', 'b', 'c'])
  })

  it('sorts by English name, then id', () => {
    expect(resultIds(templates, { sort: 'name' })).toEqual(['b', 'c', 'a'])
  })
})

describe('discoverTemplates status', () => {
  it('hides deprecated templates from the Catalog', () => {
    const deprecated: TemplateCatalogEntry = {
      ...entry('retired', { name: 'Retired' }),
      status: 'deprecated',
      deprecation: { reason: 'Replaced.', date: '2026-01-01', replacementTemplateId: 'kept' },
    }

    expect(resultIds([deprecated, entry('kept', { name: 'Kept' })], {})).toEqual(['kept'])
  })
})

describe('discoverTemplates on the generated Catalog', () => {
  it('returns both proof templates in catalog order', () => {
    expect(discoverTemplates(TEMPLATE_CATALOG, {}).results.map(({ id }) => id)).toEqual([
      'clearline',
      'signal-ledger',
    ])
  })

  it('reads the exact Signal Ledger metadata', () => {
    const [entryFound] = discoverTemplates(TEMPLATE_CATALOG, { q: 'ledger' }).results

    expect(entryFound).toEqual({
      id: 'signal-ledger',
      name: 'Signal Ledger',
      summary: 'A visual two-column CV with paired rows and a bold ledger-inspired header.',
      author: 'Alfred Mouelle',
      registryUrl: '/r/signal-ledger.json',
      catalogOrder: 1,
      traits: {
        layout: 'two-column',
        atsIntent: 'visual-first',
        visualTone: 'modern',
        density: 'balanced',
        photoSupport: 'not-supported',
      },
      searchAliases: ['two column', 'visual', 'ledger', 'creative'],
      supportedCvDataVersions: ['1'],
      license: 'MIT',
      preview: {
        pdf: '/previews/signal-ledger/reference.pdf',
        pages: [
          { src: '/previews/signal-ledger/pages/001.png', width: 1191, height: 1684 },
          { src: '/previews/signal-ledger/pages/002.png', width: 1191, height: 1684 },
        ],
      },
      status: 'active',
    })
  })
})
