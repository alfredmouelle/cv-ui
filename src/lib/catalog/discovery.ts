import type { TemplateCatalogDocument, TemplateCatalogEntry } from './catalog-document'
import {
  CATALOG_FILTER_DIMENSIONS,
  CATALOG_TRAIT_LABELS,
  type CatalogFilterDimension,
  type CatalogFilterKey,
  type CatalogSearch,
  selectedFilterValues,
} from './catalog-search'

export type CatalogFacetValue = {
  readonly value: string
  readonly label: string
  readonly count: number
  readonly selected: boolean
  readonly disabled: boolean
}
export type CatalogFacet = {
  readonly key: CatalogFilterKey
  readonly label: string
  readonly values: readonly CatalogFacetValue[]
}
export type CatalogDiscovery = {
  readonly results: readonly TemplateCatalogEntry[]
  readonly facets: readonly CatalogFacet[]
}

const FULL_CASE_FOLDING_TO_ASCII = /[ßẞ]/gu
const collator = new Intl.Collator('en')

export function normalizeCatalogTokens(value: string): readonly string[] {
  const normalized = value
    .normalize('NFKD')
    .replace(FULL_CASE_FOLDING_TO_ASCII, 'ss')
    .toLowerCase()
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]/gu, ' ')
    .replace(/ +/gu, ' ')
    .trim()

  return normalized === '' ? [] : normalized.split(' ')
}

const indexedTokens = (entry: TemplateCatalogEntry): ReadonlySet<string> =>
  new Set(
    [entry.name, entry.summary, ...Object.values(entry.traits), ...entry.searchAliases].flatMap(
      (value) => normalizeCatalogTokens(value),
    ),
  )

const matchesCatalogQuery = (entry: TemplateCatalogEntry, query: string): boolean => {
  const queryTokens = normalizeCatalogTokens(query)

  if (queryTokens.length === 0) return true

  const tokens = [...indexedTokens(entry)]

  return queryTokens.every((queryToken) => tokens.some((token) => token.startsWith(queryToken)))
}

const matchesDimension = (
  entry: TemplateCatalogEntry,
  search: CatalogSearch,
  dimension: CatalogFilterDimension,
): boolean => {
  const selected = selectedFilterValues(search, dimension.key)

  return selected.length === 0 || selected.includes(entry.traits[dimension.trait])
}

const compareCatalogOrder = (a: TemplateCatalogEntry, b: TemplateCatalogEntry): number =>
  a.catalogOrder - b.catalogOrder ||
  collator.compare(a.name, b.name) ||
  collator.compare(a.id, b.id)

const compareName = (a: TemplateCatalogEntry, b: TemplateCatalogEntry): number =>
  collator.compare(a.name, b.name) || collator.compare(a.id, b.id)

export function discoverTemplates(
  catalog: TemplateCatalogDocument,
  search: CatalogSearch,
): CatalogDiscovery {
  const searched = catalog.templates.filter(
    (entry) => entry.status === 'active' && matchesCatalogQuery(entry, search.q ?? ''),
  )
  const results = searched
    .filter((entry) =>
      CATALOG_FILTER_DIMENSIONS.every((dimension) => matchesDimension(entry, search, dimension)),
    )
    .sort(search.sort === 'name' ? compareName : compareCatalogOrder)
  const facets = CATALOG_FILTER_DIMENSIONS.map(({ key, trait, label, values }) => {
    const others = searched.filter((entry) =>
      CATALOG_FILTER_DIMENSIONS.every(
        (dimension) => dimension.key === key || matchesDimension(entry, search, dimension),
      ),
    )
    const selected = selectedFilterValues(search, key)

    return {
      key,
      label,
      values: values.map((value) => {
        const count = others.filter((entry) => entry.traits[trait] === value).length

        return {
          value,
          label: CATALOG_TRAIT_LABELS[value],
          count,
          selected: selected.includes(value),
          disabled: count === 0 && !selected.includes(value),
        }
      }),
    }
  })

  return { results, facets }
}
