export type CvTemplateTraitsV1 = {
  readonly layout: 'single-column' | 'two-column'
  readonly atsIntent: 'ats-oriented' | 'visual-first'
  readonly visualTone: 'classic' | 'modern' | 'expressive'
  readonly density: 'compact' | 'balanced' | 'spacious'
  readonly photoSupport: 'not-supported'
}
export type CvPreviewPageV1 = { readonly src: string; readonly width: 1191; readonly height: 1684 }
export type CvPreviewV1 = { readonly pdf: string; readonly pages: readonly CvPreviewPageV1[] }
export type CvTemplateDeprecationV1 = {
  readonly reason: string
  readonly date: string
  readonly replacementTemplateId?: string
}
type CvTemplateStatusV1 =
  | { readonly status: 'active'; readonly deprecation?: never }
  | { readonly status: 'deprecated'; readonly deprecation: CvTemplateDeprecationV1 }
type CvUiMetaBaseV1 = {
  readonly schemaVersion: '1.0'
  readonly catalogOrder: number
  readonly traits: CvTemplateTraitsV1
  readonly searchAliases: readonly string[]
  readonly supportedCvDataVersions: readonly string[]
  readonly license: string
  readonly preview: CvPreviewV1
}
export type CvUiMetaV1 = CvUiMetaBaseV1 & CvTemplateStatusV1
export type CvTemplateCatalogEntryV1 = Omit<CvUiMetaBaseV1, 'schemaVersion'> &
  CvTemplateStatusV1 & {
    readonly id: string
    readonly name: string
    readonly summary: string
    readonly author: string
    readonly registryUrl: string
  }
export type CvTemplateCatalogDocumentV1 = {
  readonly schemaVersion: '1.0'
  readonly templates: readonly CvTemplateCatalogEntryV1[]
}

const templateId = { type: 'string', pattern: '^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$' } as const
const authoringOrReleasePath = (suffix: string): { type: 'string'; pattern: string } => ({
  type: 'string',
  pattern: `^(?:/releases/[0-9a-f]{40})?/${suffix}$`,
})
const traits = {
  type: 'object',
  additionalProperties: false,
  required: ['layout', 'atsIntent', 'visualTone', 'density', 'photoSupport'],
  properties: {
    layout: { enum: ['single-column', 'two-column'] },
    atsIntent: { enum: ['ats-oriented', 'visual-first'] },
    visualTone: { enum: ['classic', 'modern', 'expressive'] },
    density: { enum: ['compact', 'balanced', 'spacious'] },
    photoSupport: { const: 'not-supported' },
  },
} as const
const preview = {
  type: 'object',
  additionalProperties: false,
  required: ['pdf', 'pages'],
  properties: {
    pdf: authoringOrReleasePath('previews/[a-z][a-z0-9-]*/reference\\.pdf'),
    pages: {
      type: 'array',
      minItems: 1,
      maxItems: 2,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['src', 'width', 'height'],
        properties: {
          src: authoringOrReleasePath('previews/[a-z][a-z0-9-]*/pages/00[12]\\.png'),
          width: { const: 1191 },
          height: { const: 1684 },
        },
      },
    },
  },
} as const
const deprecation = {
  type: 'object',
  additionalProperties: false,
  required: ['reason', 'date'],
  properties: {
    reason: { type: 'string', minLength: 1 },
    date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
    replacementTemplateId: templateId,
  },
} as const
const catalogMetaProperties = {
  catalogOrder: { type: 'integer', minimum: 0 },
  traits,
  searchAliases: { type: 'array', items: { type: 'string', minLength: 1 }, uniqueItems: true },
  supportedCvDataVersions: { const: ['1'] },
  license: { const: 'MIT' },
  preview,
  status: { enum: ['active', 'deprecated'] },
  deprecation,
} as const
const metaProperties = { schemaVersion: { const: '1.0' }, ...catalogMetaProperties } as const
const resourceLicenseRule = {
  if: { properties: { kind: { const: 'font' } } },
  // biome-ignore lint/suspicious/noThenProperty: JSON Schema requires this keyword.
  then: { properties: { license: { enum: ['OFL-1.1', 'Apache-2.0'] } } },
  else: {
    properties: { license: { enum: ['CC0-1.0', 'CC-BY-4.0', 'MIT', 'Apache-2.0'] } },
  },
} as const

export const CV_UI_META_V1_SCHEMA = {
  $id: 'https://cv-ui.alfredmouelle.com/schemas/cv-ui-meta/v1.json',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  additionalProperties: false,
  required: [
    'schemaVersion',
    'catalogOrder',
    'traits',
    'searchAliases',
    'supportedCvDataVersions',
    'license',
    'preview',
    'status',
  ],
  properties: metaProperties,
  allOf: [
    {
      if: { properties: { status: { const: 'deprecated' } } },
      // biome-ignore lint/suspicious/noThenProperty: JSON Schema requires this keyword.
      then: { required: ['deprecation'] },
      else: { not: { required: ['deprecation'] } },
    },
  ],
} as const

export const TEMPLATE_CATALOG_V1_SCHEMA = {
  $id: 'https://cv-ui.alfredmouelle.com/schemas/template-catalog/v1.json',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  additionalProperties: false,
  required: ['schemaVersion', 'templates'],
  properties: {
    schemaVersion: { const: '1.0' },
    templates: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'id',
          'name',
          'summary',
          'author',
          'registryUrl',
          'catalogOrder',
          'traits',
          'searchAliases',
          'supportedCvDataVersions',
          'license',
          'preview',
          'status',
        ],
        properties: {
          id: templateId,
          name: { type: 'string', minLength: 1 },
          summary: { type: 'string', minLength: 1 },
          author: { type: 'string', minLength: 1 },
          registryUrl: authoringOrReleasePath('r/[a-z][a-z0-9-]*\\.json'),
          ...catalogMetaProperties,
        },
        allOf: [
          {
            if: { properties: { status: { const: 'deprecated' } } },
            // biome-ignore lint/suspicious/noThenProperty: JSON Schema requires this keyword.
            then: { required: ['deprecation'] },
            else: { not: { required: ['deprecation'] } },
          },
        ],
      },
    },
  },
} as const

export const PROVENANCE_V1_SCHEMA = {
  $id: 'https://cv-ui.alfredmouelle.com/schemas/provenance/v1.json',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  additionalProperties: false,
  required: ['schemaVersion', 'templateId', 'design', 'resources'],
  properties: {
    schemaVersion: { const: '1.0' },
    templateId,
    design: {
      oneOf: [
        {
          type: 'object',
          additionalProperties: false,
          required: ['origin'],
          properties: { origin: { const: 'original' } },
        },
        {
          type: 'object',
          additionalProperties: false,
          required: ['origin', 'sources'],
          properties: {
            origin: { const: 'adapted' },
            sources: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['name', 'url', 'license', 'copyright', 'changes'],
                properties: {
                  name: { type: 'string', minLength: 1 },
                  url: { type: 'string', pattern: '^https://' },
                  license: { enum: ['CC0-1.0', 'CC-BY-4.0', 'MIT', 'Apache-2.0'] },
                  copyright: { type: 'string', minLength: 1 },
                  changes: { type: 'string', minLength: 1 },
                },
              },
            },
          },
        },
      ],
    },
    resources: {
      type: 'array',
      minItems: 1,
      items: {
        oneOf: [
          {
            type: 'object',
            additionalProperties: false,
            allOf: [resourceLicenseRule],
            required: ['path', 'kind', 'origin', 'license', 'copyright', 'licensePath'],
            properties: {
              path: { type: 'string', pattern: '^(?:fonts|assets)/[^/].*' },
              kind: { enum: ['font', 'image', 'other'] },
              origin: { const: 'original' },
              license: {
                enum: ['OFL-1.1', 'Apache-2.0', 'CC0-1.0', 'CC-BY-4.0', 'MIT'],
              },
              copyright: { type: 'string', minLength: 1 },
              licensePath: { type: 'string', pattern: '^licenses/[^/].*' },
            },
          },
          {
            type: 'object',
            additionalProperties: false,
            allOf: [resourceLicenseRule],
            required: [
              'path',
              'kind',
              'origin',
              'sourceName',
              'sourceUrl',
              'license',
              'copyright',
              'licensePath',
            ],
            properties: {
              path: { type: 'string', pattern: '^(?:fonts|assets)/[^/].*' },
              kind: { enum: ['font', 'image', 'other'] },
              origin: { const: 'third-party' },
              sourceName: { type: 'string', minLength: 1 },
              sourceUrl: { type: 'string', pattern: '^https://' },
              sourceVersion: { type: 'string', minLength: 1 },
              license: {
                enum: ['OFL-1.1', 'Apache-2.0', 'CC0-1.0', 'CC-BY-4.0', 'MIT'],
              },
              copyright: { type: 'string', minLength: 1 },
              licensePath: { type: 'string', pattern: '^licenses/[^/].*' },
              changes: { type: 'string', minLength: 1 },
            },
          },
        ],
      },
    },
  },
} as const

export const RELEASE_MANIFEST_V1_SCHEMA = {
  $id: 'https://cv-ui.alfredmouelle.com/schemas/release-manifest/v1.json',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  additionalProperties: false,
  required: ['schemaVersion', 'releaseId', 'artifacts'],
  properties: {
    schemaVersion: { const: '1.0' },
    releaseId: { type: 'string', pattern: '^[0-9a-f]{40}$' },
    artifacts: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['path', 'size', 'mediaType', 'sha256'],
        properties: {
          path: { type: 'string', pattern: '^[^/]+(?:/[^/.][^/]*)*$' },
          size: { type: 'integer', minimum: 0 },
          mediaType: { enum: ['application/json', 'application/pdf', 'image/png'] },
          sha256: { type: 'string', pattern: '^[0-9a-f]{64}$' },
        },
      },
    },
  },
} as const

export const REMOVAL_TOMBSTONE_V1_SCHEMA = {
  $id: 'https://cv-ui.alfredmouelle.com/schemas/removal-tombstone/v1.json',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  additionalProperties: false,
  required: ['schemaVersion', 'templateId', 'status', 'reason', 'removalDate'],
  properties: {
    schemaVersion: { const: '1.0' },
    templateId,
    status: { const: 'removed' },
    reason: { enum: ['legal-risk', 'security-risk', 'redistribution-unavailable'] },
    removalDate: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
    replacementTemplateId: templateId,
  },
} as const
