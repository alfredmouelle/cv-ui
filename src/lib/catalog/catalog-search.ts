import type { CvTemplateTraitsV1 } from '../../../contracts/catalog'
import { CV_TEMPLATE_TRAIT_VALUES } from './catalog-document'

export type CatalogTraitValue = CvTemplateTraitsV1[keyof CvTemplateTraitsV1]
export type CatalogFilterKey = 'layout' | 'ats' | 'tone' | 'density' | 'photo'
export type CatalogSearch = {
  readonly q?: string
  readonly layout?: readonly CvTemplateTraitsV1['layout'][]
  readonly ats?: readonly CvTemplateTraitsV1['atsIntent'][]
  readonly tone?: readonly CvTemplateTraitsV1['visualTone'][]
  readonly density?: readonly CvTemplateTraitsV1['density'][]
  readonly photo?: readonly CvTemplateTraitsV1['photoSupport'][]
  readonly sort?: 'name'
}
export type CatalogFilterDimension = {
  readonly key: CatalogFilterKey
  readonly trait: keyof CvTemplateTraitsV1
  readonly label: string
  readonly values: readonly CatalogTraitValue[]
}

export const CATALOG_FILTER_DIMENSIONS = [
  { key: 'layout', trait: 'layout', label: 'Layout', values: CV_TEMPLATE_TRAIT_VALUES.layout },
  {
    key: 'ats',
    trait: 'atsIntent',
    label: 'ATS intent',
    values: CV_TEMPLATE_TRAIT_VALUES.atsIntent,
  },
  {
    key: 'tone',
    trait: 'visualTone',
    label: 'Visual tone',
    values: CV_TEMPLATE_TRAIT_VALUES.visualTone,
  },
  { key: 'density', trait: 'density', label: 'Density', values: CV_TEMPLATE_TRAIT_VALUES.density },
  {
    key: 'photo',
    trait: 'photoSupport',
    label: 'Photo',
    values: CV_TEMPLATE_TRAIT_VALUES.photoSupport,
  },
] as const satisfies readonly CatalogFilterDimension[]

export const CATALOG_TRAIT_LABELS = {
  'single-column': 'Single column',
  'two-column': 'Two column',
  'ats-oriented': 'ATS oriented',
  'visual-first': 'Visual first',
  classic: 'Classic',
  modern: 'Modern',
  expressive: 'Expressive',
  compact: 'Compact',
  balanced: 'Balanced',
  spacious: 'Spacious',
  'not-supported': 'No photo support',
} as const satisfies Record<CatalogTraitValue, string>

const readCandidates = (value: unknown): readonly unknown[] =>
  typeof value === 'string' ? [value] : Array.isArray(value) ? value : []

export function normalizeQueryText(value: string): string {
  return value.trim().replace(/\s+/gu, ' ')
}

const readText = (value: unknown): string | undefined => {
  const [first] = readCandidates(value)
  const text = typeof first === 'string' ? normalizeQueryText(first) : ''

  return text === '' ? undefined : text
}

const readValues = <TValue extends string>(
  value: unknown,
  contractOrder: readonly TValue[],
): readonly TValue[] => {
  const candidates = readCandidates(value)

  return contractOrder.filter((option) => candidates.includes(option))
}

export function validateCatalogSearch(raw: Record<string, unknown>): CatalogSearch {
  const q = readText(raw.q)
  const layout = readValues(raw.layout, CV_TEMPLATE_TRAIT_VALUES.layout)
  const ats = readValues(raw.ats, CV_TEMPLATE_TRAIT_VALUES.atsIntent)
  const tone = readValues(raw.tone, CV_TEMPLATE_TRAIT_VALUES.visualTone)
  const density = readValues(raw.density, CV_TEMPLATE_TRAIT_VALUES.density)
  const photo = readValues(raw.photo, CV_TEMPLATE_TRAIT_VALUES.photoSupport)

  return {
    ...(q === undefined ? {} : { q }),
    ...(layout.length === 0 ? {} : { layout }),
    ...(ats.length === 0 ? {} : { ats }),
    ...(tone.length === 0 ? {} : { tone }),
    ...(density.length === 0 ? {} : { density }),
    ...(photo.length === 0 ? {} : { photo }),
    ...(readText(raw.sort) === 'name' ? { sort: 'name' as const } : {}),
  }
}

export function selectedFilterValues(
  search: CatalogSearch,
  key: CatalogFilterKey,
): readonly string[] {
  return search[key] ?? []
}
