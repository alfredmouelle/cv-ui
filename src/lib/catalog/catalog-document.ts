import * as v from 'valibot'

import type { CvTemplateCatalogDocumentV1, CvTemplateTraitsV1 } from '../../../contracts/catalog'
import generatedCatalog from '../../../public/catalog/v1/templates.json'

export type TemplateCatalogDocument = Omit<CvTemplateCatalogDocumentV1, 'schemaVersion'> & {
  readonly schemaVersion: string
}
export type TemplateCatalogEntry = TemplateCatalogDocument['templates'][number]
export type CatalogDocumentReadResult =
  | { readonly success: true; readonly data: TemplateCatalogDocument }
  | { readonly success: false; readonly reason: 'unsupported-major' | 'invalid-document' }

export const CV_TEMPLATE_TRAIT_VALUES = {
  layout: ['single-column', 'two-column'],
  atsIntent: ['ats-oriented', 'visual-first'],
  visualTone: ['classic', 'modern', 'expressive'],
  density: ['compact', 'balanced', 'spacious'],
  photoSupport: ['not-supported'],
} as const satisfies {
  readonly [TTrait in keyof CvTemplateTraitsV1]: readonly CvTemplateTraitsV1[TTrait][]
}

const SUPPORTED_SCHEMA_MAJOR = '1'
const schemaVersionSchema = v.pipe(v.string(), v.regex(/^\d+\.\d+$/u))
const rootSchema = v.object({ schemaVersion: schemaVersionSchema })
const traitsSchema = v.object({
  layout: v.picklist(CV_TEMPLATE_TRAIT_VALUES.layout),
  atsIntent: v.picklist(CV_TEMPLATE_TRAIT_VALUES.atsIntent),
  visualTone: v.picklist(CV_TEMPLATE_TRAIT_VALUES.visualTone),
  density: v.picklist(CV_TEMPLATE_TRAIT_VALUES.density),
  photoSupport: v.picklist(CV_TEMPLATE_TRAIT_VALUES.photoSupport),
})
const previewSchema = v.object({
  pdf: v.string(),
  pages: v.pipe(
    v.array(v.object({ src: v.string(), width: v.literal(1191), height: v.literal(1684) })),
    v.minLength(1),
    v.maxLength(2),
  ),
})
const entryProperties = {
  id: v.string(),
  name: v.pipe(v.string(), v.minLength(1)),
  summary: v.pipe(v.string(), v.minLength(1)),
  author: v.pipe(v.string(), v.minLength(1)),
  registryUrl: v.string(),
  catalogOrder: v.pipe(v.number(), v.integer(), v.minValue(0)),
  traits: traitsSchema,
  searchAliases: v.array(v.string()),
  supportedCvDataVersions: v.array(v.string()),
  license: v.string(),
  preview: previewSchema,
}
const entrySchema = v.union([
  v.object({ ...entryProperties, status: v.literal('active') }),
  v.object({
    ...entryProperties,
    status: v.literal('deprecated'),
    deprecation: v.object({
      reason: v.string(),
      date: v.string(),
      replacementTemplateId: v.optional(v.string()),
    }),
  }),
])
const documentSchema = v.object({
  schemaVersion: schemaVersionSchema,
  templates: v.array(entrySchema),
})

export function readCatalogDocumentV1(value: unknown): CatalogDocumentReadResult {
  const root = v.safeParse(rootSchema, value)

  if (!root.success) return { success: false, reason: 'invalid-document' }
  if (!root.output.schemaVersion.startsWith(`${SUPPORTED_SCHEMA_MAJOR}.`))
    return { success: false, reason: 'unsupported-major' }

  const parsed = v.safeParse(documentSchema, value)

  if (!parsed.success) return { success: false, reason: 'invalid-document' }
  return { success: true, data: parsed.output }
}

const readGeneratedCatalog = (): TemplateCatalogDocument => {
  const result = readCatalogDocumentV1(generatedCatalog as unknown)

  if (!result.success) throw new Error(`Unusable Template Catalog document: ${result.reason}`)
  return result.data
}

export const TEMPLATE_CATALOG = readGeneratedCatalog()
