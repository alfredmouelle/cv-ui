export type CvLinkV1 = { readonly label: string; readonly url: string }
export type CvPersonV1 = {
  readonly name: string
  readonly headline?: string
  readonly email?: string
  readonly phone?: string
  readonly location?: string
  readonly links?: readonly CvLinkV1[]
}
export type CvPartialDateV1 = string
export type CvDateRangeV1 = { readonly start: CvPartialDateV1; readonly end?: CvPartialDateV1 }
export type CvSemanticReferenceV1 = {
  readonly vocabulary: string
  readonly uri: string
  readonly version?: string
}
export type CvWorkV1 = {
  readonly organization: string
  readonly position: string
  readonly positionReference?: CvSemanticReferenceV1
  readonly location?: string
  readonly url?: string
  readonly dateRange?: CvDateRangeV1
  readonly summary?: string
  readonly highlights?: readonly string[]
}
export type CvVolunteerV1 = {
  readonly organization: string
  readonly role: string
  readonly location?: string
  readonly url?: string
  readonly dateRange?: CvDateRangeV1
  readonly summary?: string
  readonly highlights?: readonly string[]
}
export type CvEducationV1 = {
  readonly institution: string
  readonly qualification?: string
  readonly qualificationReference?: CvSemanticReferenceV1
  readonly field?: string
  readonly location?: string
  readonly url?: string
  readonly dateRange?: CvDateRangeV1
  readonly score?: string
  readonly highlights?: readonly string[]
}
export type CvCertificationV1 = {
  readonly name: string
  readonly issuer: string
  readonly date?: CvPartialDateV1
  readonly expires?: CvPartialDateV1
  readonly credentialId?: string
  readonly url?: string
}
export type CvProjectV1 = {
  readonly name: string
  readonly role?: string
  readonly url?: string
  readonly dateRange?: CvDateRangeV1
  readonly summary?: string
  readonly highlights?: readonly string[]
}
export type CvPublicationV1 = {
  readonly name: string
  readonly authors?: readonly string[]
  readonly publisher?: string
  readonly date?: CvPartialDateV1
  readonly url?: string
  readonly summary?: string
}
export type CvSkillV1 = {
  readonly name: string
  readonly skillReference?: CvSemanticReferenceV1
  readonly level?: string
  readonly keywords?: readonly string[]
}
export type CvLanguageV1 = {
  readonly name: string
  readonly code?: string
  readonly fluency?: string
}
export type CvAwardV1 = {
  readonly title: string
  readonly issuer?: string
  readonly date?: CvPartialDateV1
  readonly summary?: string
}
export type CvJsonValueV1 =
  | null
  | boolean
  | number
  | string
  | readonly CvJsonValueV1[]
  | { readonly [key: string]: CvJsonValueV1 }
export type CvExtensionsV1 = Readonly<Record<string, Readonly<Record<string, CvJsonValueV1>>>>
export type CvDataV1 = {
  readonly schemaVersion: '1'
  readonly language: string
  readonly person: CvPersonV1
  readonly summary?: string
  readonly work?: readonly CvWorkV1[]
  readonly education?: readonly CvEducationV1[]
  readonly projects?: readonly CvProjectV1[]
  readonly skills?: readonly CvSkillV1[]
  readonly languages?: readonly CvLanguageV1[]
  readonly certifications?: readonly CvCertificationV1[]
  readonly awards?: readonly CvAwardV1[]
  readonly volunteer?: readonly CvVolunteerV1[]
  readonly publications?: readonly CvPublicationV1[]
  readonly extensions?: CvExtensionsV1
}
export type CvData = CvDataV1
export const CV_SECTION_IDS_V1 = [
  'summary',
  'work',
  'education',
  'projects',
  'skills',
  'languages',
  'certifications',
  'awards',
  'volunteer',
  'publications',
] as const
export type CvSectionIdV1 = (typeof CV_SECTION_IDS_V1)[number]
export type CvLabelsV1 = Readonly<Record<CvSectionIdV1, string>> & { readonly present: string }
export type CvValidationResult<T, E> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly errors: readonly E[] }
export const CV_FIDELITY_ENVELOPE_V1 = {
  schemaVersion: '1.0',
  unicodeVersion: '17.0',
  graphemeAlgorithm: 'UAX29-47',
  page: { format: 'A4', maximumPages: 2 },
  textLimits: {
    compact: 40,
    label: 80,
    nameOrTitle: 120,
    highlight: 180,
    entrySummary: 320,
    profileSummary: 600,
    unbrokenText: 40,
  },
  collectionLimits: {
    personLinks: 5,
    work: 4,
    education: 4,
    projects: 4,
    certifications: 4,
    awards: 4,
    volunteer: 4,
    publications: 4,
    skills: 8,
    skillKeywords: 8,
    languages: 6,
    publicationAuthors: 10,
    recordHighlights: 5,
  },
  documentLimits: { records: 14, highlights: 24, authoredText: 5000 },
} as const
export type CvFidelityEnvelopeV1 = typeof CV_FIDELITY_ENVELOPE_V1
export type CvFidelityErrorCode =
  | 'text-length'
  | 'unbroken-text'
  | 'array-count'
  | 'record-count'
  | 'highlight-count'
  | 'authored-text'
export type CvFidelityError = {
  readonly path: string
  readonly code: CvFidelityErrorCode
  readonly limit: number
  readonly actual: number
}
type CvExpectedType = 'null' | 'boolean' | 'number' | 'string' | 'array' | 'object' | 'json-value'
type CvActualType =
  | 'null'
  | 'boolean'
  | 'number'
  | 'string'
  | 'array'
  | 'object'
  | 'undefined'
  | 'bigint'
  | 'symbol'
  | 'function'
  | 'non-finite-number'
export type CvDataValidationError =
  | { readonly path: string; readonly code: 'required' }
  | { readonly path: string; readonly code: 'unexpected-field' }
  | {
      readonly path: string
      readonly code: 'invalid-type'
      readonly expected: CvExpectedType
      readonly actual: CvActualType
    }
  | {
      readonly path: string
      readonly code: 'invalid-literal'
      readonly expected: null | boolean | number | string
      readonly actual: null | boolean | number | string
    }
  | { readonly path: string; readonly code: 'empty-value' }
  | {
      readonly path: string
      readonly code: 'invalid-format'
      readonly format:
        | 'bcp47'
        | 'email'
        | 'http-url'
        | 'absolute-uri'
        | 'partial-date'
        | 'extension-namespace'
    }
  | { readonly path: string; readonly code: 'invalid-order'; readonly relatedPath: string }
  | {
      readonly path: string
      readonly code: 'missing-dependent-field'
      readonly relatedPath: string
    }
export type CvDataValidationErrorCode = CvDataValidationError['code']

const NON_WHITESPACE_PATTERN =
  '[^\\u0009-\\u000D\\u0020\\u0085\\u00A0\\u1680\\u2000-\\u200A\\u2028\\u2029\\u202F\\u205F\\u3000]'
const EMAIL_PATTERN =
  "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"
const LEAP_YEAR_PATTERN =
  '(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)'
const PARTIAL_DATE_PATTERN = `^(?:(?!0000)\\d{4}|(?!0000)\\d{4}-(?:0[1-9]|1[0-2])|(?!0000)\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|02-(?:0[1-9]|1\\d|2[0-8]))|${LEAP_YEAR_PATTERN}-02-29)$`
const HTTP_URL_PATTERN = '^[\\u0000-\\u0020]*[Hh][Tt][Tt][Pp][Ss]?:[/\\\\]*[^/?#\\\\\\s]+'
const ABSOLUTE_URI_PATTERN = '^[A-Za-z][A-Za-z0-9+.-]*:'
const EXTENSION_NAMESPACE_PATTERN =
  '^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.){2,}[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$'
const GRANDFATHERED_LANGUAGE_TAGS = [
  'art-lojban',
  'cel-gaulish',
  'en-GB-oed',
  'i-ami',
  'i-bnn',
  'i-default',
  'i-enochian',
  'i-hak',
  'i-klingon',
  'i-lux',
  'i-mingo',
  'i-navajo',
  'i-pwn',
  'i-tao',
  'i-tay',
  'i-tsu',
  'no-bok',
  'no-nyn',
  'sgn-BE-FR',
  'sgn-BE-NL',
  'sgn-CH-DE',
  'zh-guoyu',
  'zh-hakka',
  'zh-min',
  'zh-min-nan',
  'zh-xiang',
] as const
const toAsciiCaseInsensitivePattern = (value: string): string =>
  Array.from(value, (character) =>
    /[A-Za-z]/.test(character)
      ? `[${character.toUpperCase()}${character.toLowerCase()}]`
      : character,
  ).join('')
const REGULAR_LANGUAGE_TAG_PATTERN =
  '(?:(?:[A-Za-z]{2,3}(?:-[A-Za-z]{3}){0,3}|[A-Za-z]{4}|[A-Za-z]{5,8})(?:-[A-Za-z]{4})?(?:-(?:[A-Za-z]{2}|\\d{3}))?(?:-(?:[A-Za-z0-9]{5,8}|\\d[A-Za-z0-9]{3}))*(?:-[0-9A-WY-Za-wy-z](?:-[A-Za-z0-9]{2,8})+)*(?:-[Xx](?:-[A-Za-z0-9]{1,8})+)?|[Xx](?:-[A-Za-z0-9]{1,8})+)'
const LANGUAGE_TAG_PATTERN = `^(?:${REGULAR_LANGUAGE_TAG_PATTERN}|(?:${GRANDFATHERED_LANGUAGE_TAGS.map(toAsciiCaseInsensitivePattern).join('|')}))$`
const textSchema = { type: 'string', pattern: NON_WHITESPACE_PATTERN } as const
const dateSchema = {
  type: 'string',
  pattern: PARTIAL_DATE_PATTERN,
  format: 'cv-partial-date-v1',
} as const
const textArraySchema = { type: 'array', minItems: 1, items: textSchema } as const
const urlSchema = { ...textSchema, pattern: HTTP_URL_PATTERN, format: 'uri' } as const

export const CV_DATA_V1_SCHEMA = {
  $id: 'https://cv-ui.alfredmouelle.com/schemas/cv-data/v1.json',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  additionalProperties: false,
  required: ['schemaVersion', 'language', 'person'],
  properties: {
    schemaVersion: { const: '1' },
    language: { ...textSchema, pattern: LANGUAGE_TAG_PATTERN, format: 'cv-bcp47-v1' },
    person: { $ref: '#/$defs/person' },
    summary: textSchema,
    work: { type: 'array', minItems: 1, items: { $ref: '#/$defs/work' } },
    education: { type: 'array', minItems: 1, items: { $ref: '#/$defs/education' } },
    projects: { type: 'array', minItems: 1, items: { $ref: '#/$defs/project' } },
    skills: { type: 'array', minItems: 1, items: { $ref: '#/$defs/skill' } },
    languages: { type: 'array', minItems: 1, items: { $ref: '#/$defs/language' } },
    certifications: { type: 'array', minItems: 1, items: { $ref: '#/$defs/certification' } },
    awards: { type: 'array', minItems: 1, items: { $ref: '#/$defs/award' } },
    volunteer: { type: 'array', minItems: 1, items: { $ref: '#/$defs/volunteer' } },
    publications: { type: 'array', minItems: 1, items: { $ref: '#/$defs/publication' } },
    extensions: { $ref: '#/$defs/extensions' },
  },
  $defs: {
    person: {
      type: 'object',
      additionalProperties: false,
      required: ['name'],
      properties: {
        name: textSchema,
        headline: textSchema,
        email: { ...textSchema, pattern: EMAIL_PATTERN },
        phone: textSchema,
        location: textSchema,
        links: { type: 'array', minItems: 1, items: { $ref: '#/$defs/link' } },
      },
    },
    link: {
      type: 'object',
      additionalProperties: false,
      required: ['label', 'url'],
      properties: { label: textSchema, url: urlSchema },
    },
    partialDate: dateSchema,
    dateRange: {
      type: 'object',
      additionalProperties: false,
      required: ['start'],
      properties: { start: dateSchema, end: dateSchema },
    },
    semanticReference: {
      type: 'object',
      additionalProperties: false,
      required: ['vocabulary', 'uri'],
      properties: {
        vocabulary: textSchema,
        uri: { ...textSchema, pattern: ABSOLUTE_URI_PATTERN, format: 'uri-reference' },
        version: textSchema,
      },
    },
    work: {
      type: 'object',
      additionalProperties: false,
      required: ['organization', 'position'],
      properties: {
        organization: textSchema,
        position: textSchema,
        positionReference: { $ref: '#/$defs/semanticReference' },
        location: textSchema,
        url: urlSchema,
        dateRange: { $ref: '#/$defs/dateRange' },
        summary: textSchema,
        highlights: textArraySchema,
      },
    },
    volunteer: {
      type: 'object',
      additionalProperties: false,
      required: ['organization', 'role'],
      properties: {
        organization: textSchema,
        role: textSchema,
        location: textSchema,
        url: urlSchema,
        dateRange: { $ref: '#/$defs/dateRange' },
        summary: textSchema,
        highlights: textArraySchema,
      },
    },
    education: {
      type: 'object',
      additionalProperties: false,
      required: ['institution'],
      dependentRequired: { qualificationReference: ['qualification'] },
      properties: {
        institution: textSchema,
        qualification: textSchema,
        qualificationReference: { $ref: '#/$defs/semanticReference' },
        field: textSchema,
        location: textSchema,
        url: urlSchema,
        dateRange: { $ref: '#/$defs/dateRange' },
        score: textSchema,
        highlights: textArraySchema,
      },
    },
    certification: {
      type: 'object',
      additionalProperties: false,
      required: ['name', 'issuer'],
      dependentRequired: { expires: ['date'] },
      properties: {
        name: textSchema,
        issuer: textSchema,
        date: dateSchema,
        expires: dateSchema,
        credentialId: textSchema,
        url: urlSchema,
      },
    },
    project: {
      type: 'object',
      additionalProperties: false,
      required: ['name'],
      properties: {
        name: textSchema,
        role: textSchema,
        url: urlSchema,
        dateRange: { $ref: '#/$defs/dateRange' },
        summary: textSchema,
        highlights: textArraySchema,
      },
    },
    publication: {
      type: 'object',
      additionalProperties: false,
      required: ['name'],
      properties: {
        name: textSchema,
        authors: textArraySchema,
        publisher: textSchema,
        date: dateSchema,
        url: urlSchema,
        summary: textSchema,
      },
    },
    skill: {
      type: 'object',
      additionalProperties: false,
      required: ['name'],
      properties: {
        name: textSchema,
        skillReference: { $ref: '#/$defs/semanticReference' },
        level: textSchema,
        keywords: textArraySchema,
      },
    },
    language: {
      type: 'object',
      additionalProperties: false,
      required: ['name'],
      properties: {
        name: textSchema,
        code: { ...textSchema, pattern: LANGUAGE_TAG_PATTERN, format: 'cv-bcp47-v1' },
        fluency: textSchema,
      },
    },
    award: {
      type: 'object',
      additionalProperties: false,
      required: ['title'],
      properties: { title: textSchema, issuer: textSchema, date: dateSchema, summary: textSchema },
    },
    extensions: {
      type: 'object',
      propertyNames: { pattern: EXTENSION_NAMESPACE_PATTERN },
      additionalProperties: { type: 'object' },
    },
  },
} as const

export const CV_FIDELITY_ENVELOPE_V1_SCHEMA = {
  $id: 'https://cv-ui.alfredmouelle.com/schemas/fidelity-envelope/v1.json',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  additionalProperties: false,
  required: [
    'schemaVersion',
    'unicodeVersion',
    'graphemeAlgorithm',
    'page',
    'textLimits',
    'collectionLimits',
    'documentLimits',
  ],
  properties: {
    schemaVersion: { const: '1.0' },
    unicodeVersion: { const: '17.0' },
    graphemeAlgorithm: { const: 'UAX29-47' },
    page: {
      type: 'object',
      additionalProperties: false,
      required: ['format', 'maximumPages'],
      properties: { format: { const: 'A4' }, maximumPages: { const: 2 } },
    },
    textLimits: {
      type: 'object',
      additionalProperties: false,
      required: [
        'compact',
        'label',
        'nameOrTitle',
        'highlight',
        'entrySummary',
        'profileSummary',
        'unbrokenText',
      ],
      properties: {
        compact: { const: 40 },
        label: { const: 80 },
        nameOrTitle: { const: 120 },
        highlight: { const: 180 },
        entrySummary: { const: 320 },
        profileSummary: { const: 600 },
        unbrokenText: { const: 40 },
      },
    },
    collectionLimits: {
      type: 'object',
      additionalProperties: false,
      required: [
        'personLinks',
        'work',
        'education',
        'projects',
        'certifications',
        'awards',
        'volunteer',
        'publications',
        'skills',
        'skillKeywords',
        'languages',
        'publicationAuthors',
        'recordHighlights',
      ],
      properties: {
        personLinks: { const: 5 },
        work: { const: 4 },
        education: { const: 4 },
        projects: { const: 4 },
        certifications: { const: 4 },
        awards: { const: 4 },
        volunteer: { const: 4 },
        publications: { const: 4 },
        skills: { const: 8 },
        skillKeywords: { const: 8 },
        languages: { const: 6 },
        publicationAuthors: { const: 10 },
        recordHighlights: { const: 5 },
      },
    },
    documentLimits: {
      type: 'object',
      additionalProperties: false,
      required: ['records', 'highlights', 'authoredText'],
      properties: {
        records: { const: 14 },
        highlights: { const: 24 },
        authoredText: { const: 5000 },
      },
    },
  },
} as const

const GRAPHEME_BREAK_VALUES = [
  'Other',
  'CR',
  'LF',
  'Control',
  'Extend',
  'ZWJ',
  'Regional_Indicator',
  'Prepend',
  'SpacingMark',
  'L',
  'V',
  'T',
  'LV',
  'LVT',
] as const
const GRAPHEME_BREAK_RANGES =
  '0.9.3;0.0.2;0.1.3;0.0.1;0.h.3;2n.w.3;d.0.3;gi.33.4;7n.6.4;7b.18.4;1.0.4;1.1.4;1.1.4;1.0.4;1k.5.7;a.a.4;1.0.3;1a.k.4;g.0.4;2t.6.4;0.0.7;1.5.4;2.1.4;1.3.4;x.0.7;1.0.4;u.q.4;2j.a.4;1m.8.4;9.0.4;o.3.4;1.8.4;1.2.4;1.4.4;17.2.4;1g.1.7;5.8.4;16.n.4;0.0.7;0.v.4;0.0.8;1i.0.4;0.0.8;0.0.4;1.2.8;0.7.4;0.3.8;0.0.4;0.1.8;1.6.4;a.1.4;t.0.4;0.1.8;1k.0.4;1.0.4;0.1.8;0.3.4;2.1.8;2.1.8;0.0.4;9.0.4;a.1.4;q.0.4;2.1.4;0.0.8;1k.0.4;1.2.8;0.1.4;4.1.4;2.2.4;3.0.4;u.1.4;3.0.4;b.1.4;0.0.8;1k.0.4;1.2.8;0.4.4;1.1.4;0.0.8;1.1.8;0.0.4;k.1.4;m.5.4;1.0.4;0.1.8;1k.0.4;1.1.4;0.0.8;0.3.4;2.1.8;2.1.8;0.0.4;7.2.4;a.1.4;u.0.4;1n.0.4;0.0.8;0.0.4;0.1.8;3.2.8;1.2.8;0.0.4;9.0.4;14.0.4;0.2.8;0.0.4;1j.0.4;1.2.4;0.3.8;1.2.4;1.3.4;7.1.4;b.1.4;t.0.4;0.1.8;1k.0.4;1.0.8;0.1.4;0.0.8;0.0.4;0.1.8;1.2.4;1.3.4;7.1.4;b.1.4;f.0.8;c.1.4;0.1.8;1j.1.4;1.0.4;0.1.8;0.3.4;1.2.8;1.2.8;0.0.4;0.0.7;8.0.4;a.1.4;t.0.4;0.1.8;1y.0.4;4.0.4;0.1.8;0.2.4;1.0.4;1.6.8;0.0.4;i.1.8;1p.0.4;1.0.8;0.6.4;c.7.4;2q.0.4;1.0.8;0.8.4;b.6.4;21.1.4;r.0.4;1.0.4;1.0.4;4.1.8;1d.d.4;0.0.8;0.4.4;1.1.4;5.a.4;1.z.4;9.0.4;2u.3.4;0.0.8;0.5.4;1.1.4;0.1.8;0.1.4;n.1.8;0.1.4;4.2.4;g.3.4;d.0.4;1.0.8;0.1.4;6.0.4;f.0.4;2q.2n.9;0.1z.a;0.2f.b;9p.2.4;qa.3.4;s.2.4;t.1.4;u.1.4;1s.1.4;0.0.8;0.6.4;0.7.8;0.0.4;0.1.8;0.a.4;9.0.4;19.2.4;0.0.3;0.0.4;39.1.4;y.0.4;3a.2.4;0.3.8;0.1.4;0.2.8;4.1.8;0.0.4;0.5.8;0.2.4;63.1.4;0.1.8;0.0.4;1l.0.8;0.0.4;0.0.8;0.6.4;1.0.4;1.0.4;2.7.4;0.5.8;0.9.4;2.0.4;1c.19.4;2.b.4;k.3.4;0.0.8;1b.9.4;0.3.8;0.2.4;12.8.4;c.1.4;0.0.8;u.0.8;0.3.4;0.1.8;0.5.4;1k.0.4;0.0.8;0.1.4;0.2.8;0.0.4;0.0.8;0.4.4;1c.7.8;0.7.4;0.1.8;0.1.4;48.2.4;1.c.4;0.0.8;0.6.4;4.0.4;6.0.4;2.0.8;0.1.4;5i.1r.4;ej.0.3;0.0.4;0.0.5;0.1.3;o.6.3;1d.f.3;2o.w.4;2da.2.4;3x.0.4;2o.v.4;fe.5.4;2x.1.4;n9w.3.4;1.9.4;w.1.4;28.1.4;7k.0.4;3.0.4;4.0.4;n.1.8;0.1.4;0.0.8;4.0.4;2b.1.8;1e.f.8;0.1.4;q.h.4;d.0.4;12.7.4;p.a.4;0.0.8;0.0.4;c.s.9;3.2.4;0.0.8;1b.0.4;0.1.8;0.3.4;0.1.8;0.1.4;0.1.8;0.0.4;10.0.4;1v.5.4;0.1.8;0.1.4;0.1.8;0.1.4;c.0.4;8.0.4;0.0.8;1a.0.4;1f.0.4;1.2.4;2.1.4;5.1.4;1.0.4;15.0.8;0.1.4;0.1.8;5.0.8;0.0.4;6k.1.8;0.0.4;0.1.8;0.0.4;0.1.8;1.0.8;0.0.4;i.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;0.0.c;0.q.d;c.m.a;4.1c.b;6xu.0.4;kh.f.4;g.f.4;5r.0.3;4e.1.4;28.b.3;e9.0.4;6a.0.4;45.4.4;1ae.2.4;1.1.4;5.3.4;14.2.4;4.0.4;4l.1.4;fx.3.4;1t.4.4;8t.1.4;25.5.4;1y.a.4;1d.3.4;3e.0.8;0.0.4;0.0.8;1h.e.4;15.0.4;2.1.4;a.2.4;0.0.8;19.2.8;0.3.4;0.1.8;0.1.4;2.0.7;4.0.4;a.0.7;1e.2.4;10.4.4;0.0.8;0.7.4;g.1.8;18.0.4;c.1.4;0.0.8;1c.2.8;0.8.4;0.0.8;0.0.4;1.1.7;5.3.4;1.0.8;0.0.4;2k.2.8;0.2.4;0.1.8;0.3.4;6.0.4;2.0.4;4d.0.4;0.2.8;0.7.4;l.1.4;0.1.8;1j.1.4;1.0.4;0.0.8;0.0.4;0.3.8;2.1.8;2.1.8;0.0.4;9.0.4;a.1.8;2.6.4;3.4.4;1v.0.4;0.1.8;0.5.4;1.0.4;2.0.4;1.2.4;0.0.8;1.1.8;0.2.4;0.0.7;0.0.4;e.1.4;2a.2.8;0.7.4;0.1.8;0.2.4;0.0.8;0.0.4;n.0.4;29.0.4;0.1.8;0.5.4;0.0.8;0.0.4;0.1.8;0.0.4;0.0.8;0.1.4;0.0.8;0.1.4;6j.0.4;0.1.8;0.3.4;2.3.8;0.1.4;0.0.8;0.1.4;r.1.4;2a.2.8;0.7.4;0.1.8;0.0.4;0.0.8;0.1.4;2y.0.4;0.0.8;0.0.4;0.1.8;0.7.4;2t.0.4;0.0.8;0.0.4;2.3.4;0.0.8;0.4.4;74.2.8;0.8.4;0.0.8;0.1.4;6t.0.4;0.4.8;1.1.8;2.3.4;0.0.7;0.0.8;0.0.7;0.0.8;0.0.4;3x.2.8;0.3.4;2.1.4;0.3.8;0.0.4;3.0.8;s.9.4;14.5.4;0.0.8;1.3.4;8.0.4;9.5.4;0.1.8;0.2.4;14.5.7;0.c.4;0.0.8;0.1.4;5i.0.4;0.0.8;0.2.4;0.0.8;0.0.4;0.0.8;5j.0.8;0.6.4;1.5.4;0.0.8;0.0.4;2a.l.4;1.0.8;0.6.4;0.0.8;0.1.4;0.0.8;0.1.4;3e.5.4;3.0.4;1.1.4;1.6.4;0.0.7;0.0.4;1u.4.8;1.1.4;1.1.8;0.0.4;0.0.8;0.0.4;9n.1.4;0.1.8;9.1.4;0.0.7;0.0.8;1c.1.8;0.4.4;3.1.8;0.2.4;n.0.4;445.f.3;0.0.4;6.e.4;8ug.b.4;0.2.8;0.2.4;1xc.4.4;1n.6.4;fg.0.a;3.3.a;dg.0.4;1.1i.8;7.3.4;29.0.4;b.1.4;f57.1.4;1.3.3;3mk.19.4;2.m.4;f2.4.4;3.5.4;0.7.3;0.7.4;2.6.4;u.3.4;44.2.4;1iz.1i.4;4.1d.4;8.0.4;e.0.4;m.4.4;1.e.4;11s.6.4;1.g.4;2.6.4;1.1.4;1.4.4;2s.0.4;4g.6.4;af.0.4;1p.3.4;e4.3.4;72.1.4;6r.0.4;2.0.4;7.1.4;5.0.4;d6.6.4;31.6.4;1p7.p.6;e3.4.4;gx6o.v.3;0.2n.4;0.3j.3;0.6n.4;0.2rz.3'
const LINE_BREAK_VALUES = [
  'XX',
  'AI',
  'AK',
  'AL',
  'AP',
  'AS',
  'B2',
  'BA',
  'BB',
  'BK',
  'CB',
  'CJ',
  'CL',
  'CM',
  'CP',
  'CR',
  'EB',
  'EM',
  'EX',
  'GL',
  'H2',
  'H3',
  'HL',
  'HY',
  'ID',
  'IN',
  'IS',
  'JL',
  'JT',
  'JV',
  'LF',
  'NL',
  'NS',
  'NU',
  'OP',
  'PO',
  'HH',
  'PR',
  'QU',
  'RI',
  'SA',
  'SG',
  'SP',
  'SY',
  'VF',
  'VI',
  'WJ',
  'ZW',
  'ZWJ',
] as const
const LINE_BREAK_RANGES =
  '0.8.d;0.0.7;0.0.u;0.1.9;0.0.f;0.h.d;0.0.16;0.0.i;0.0.12;0.0.3;0.0.11;0.0.z;0.0.3;0.0.12;0.0.y;0.0.e;0.0.3;0.0.11;0.0.q;0.0.n;0.0.q;0.0.17;0.9.x;0.1.q;0.2.3;0.0.i;0.q.3;0.0.y;0.0.11;0.0.e;0.s.3;0.0.y;0.0.7;0.0.c;0.0.3;0.5.d;0.0.v;0.p.d;0.0.j;0.0.y;0.0.z;0.2.11;0.0.3;0.1.1;0.0.3;0.0.1;0.0.12;0.0.3;0.0.7;0.1.3;0.0.z;0.0.11;0.1.1;0.0.8;0.0.3;0.4.1;0.0.12;0.2.1;0.0.y;0.m.3;0.0.1;0.u.3;0.0.1;0.cu.3;0.0.1;0.0.8;0.2.1;0.0.8;0.0.1;0.1.3;0.0.1;0.6.3;0.3.1;0.0.3;0.0.1;0.0.3;0.0.8;0.v.3;0.2j.d;0.6.j;0.c.d;0.7.3;2.3.3;0.0.q;0.0.3;4.6.3;1.0.3;1.j.3;1.67.3;0.6.d;0.4l.3;1.11.3;2.1b.3;0.0.q;0.0.10;2.1.3;0.0.11;1.18.d;0.0.10;0.0.d;0.0.3;0.1.d;0.0.3;0.1.d;0.0.i;0.0.d;8.q.m;4.3.m;0.1.3;b.5.x;0.2.3;0.2.z;0.1.q;0.1.3;0.a.d;0.0.i;0.0.d;0.2.i;0.16.3;0.k.d;0.9.x;0.0.z;0.1.x;0.2.3;0.0.d;0.2q.3;0.0.i;0.0.3;0.6.d;0.0.x;0.0.3;0.5.d;0.1.3;0.1.d;0.0.3;0.3.d;0.1.3;0.9.x;0.j.3;1.1.3;0.0.d;0.t.3;0.q.d;2.2g.3;0.a.d;0.0.3;e.9.x;0.w.3;0.8.d;0.3.3;0.0.q;0.0.i;0.0.3;2.0.d;0.1.11;0.l.3;0.3.d;0.0.3;0.8.d;0.0.3;0.2.d;0.0.3;0.4.d;2.e.3;1.o.3;0.2.d;2.0.3;1.a.3;5.v.3;0.1.x;5.8.d;0.15.3;0.n.d;0.0.x;0.w.d;0.1h.3;0.2.d;0.0.3;0.h.d;0.0.3;0.6.d;0.9.3;0.1.d;0.1.7;0.9.x;0.g.3;0.2.d;1.7.3;2.1.3;2.l.3;1.6.3;1.0.3;3.3.3;2.0.d;0.0.3;0.6.d;2.1.d;2.2.d;0.0.3;8.0.d;4.1.3;1.2.3;0.1.d;2.9.x;0.1.3;0.1.z;0.4.3;0.0.z;0.0.3;0.0.11;0.1.3;0.0.d;2.2.d;1.5.3;4.1.3;2.l.3;1.6.3;1.1.3;1.1.3;1.1.3;2.0.d;1.4.d;4.1.d;2.2.d;3.0.d;7.3.3;1.0.3;7.9.x;0.1.d;0.2.3;0.0.d;0.0.3;a.2.d;1.8.3;1.2.3;1.l.3;1.6.3;1.1.3;1.4.3;2.0.d;0.0.3;0.7.d;1.2.d;1.2.d;2.0.3;f.1.3;0.1.d;2.9.x;0.0.3;0.0.11;7.0.3;0.5.d;1.2.d;1.7.3;2.1.3;2.l.3;1.6.3;1.1.3;1.4.3;2.0.d;0.0.3;0.6.d;2.1.d;2.2.d;7.2.d;4.1.3;1.2.3;0.1.d;2.9.x;0.7.3;a.0.d;0.0.3;1.5.3;3.2.3;1.3.3;3.1.3;1.0.3;1.1.3;3.1.3;3.2.3;3.b.3;4.4.d;3.2.d;1.3.d;2.0.3;6.0.d;e.9.x;0.8.3;0.0.11;0.0.3;5.4.d;0.7.3;1.2.3;1.m.3;1.f.3;2.0.d;0.0.3;0.6.d;1.2.d;1.3.d;7.1.d;1.2.3;1.1.3;2.1.3;0.1.d;2.9.x;7.0.8;0.8.3;0.2.d;0.0.8;0.7.3;1.2.3;1.m.3;1.9.3;1.4.3;2.0.d;0.0.3;0.6.d;1.2.d;1.3.d;7.1.d;5.2.3;1.1.3;0.1.d;2.9.x;1.1.3;0.0.d;c.3.d;0.8.3;1.2.3;1.14.3;0.1.d;0.0.3;0.6.d;1.2.d;1.3.d;0.1.3;4.2.3;0.0.d;0.9.3;0.1.d;2.9.x;0.8.3;0.0.z;0.5.3;1.2.d;1.h.3;3.n.3;1.8.3;1.0.3;2.6.3;3.0.d;4.5.d;1.0.d;1.7.d;6.9.x;2.1.d;0.0.3;c.1l.14;4.0.11;0.e.14;0.0.3;0.9.x;0.1.7;11.1.14;1.0.14;1.4.14;1.n.14;1.0.14;1.m.14;2.4.14;1.0.14;1.6.14;1.9.x;2.3.14;w.0.3;0.3.8;0.0.3;0.1.8;0.0.j;0.1.8;0.0.7;0.0.j;0.4.i;0.0.j;0.0.3;0.0.i;0.2.3;0.1.d;0.5.3;0.9.x;0.9.3;0.0.7;0.0.d;0.0.3;0.0.d;0.0.3;0.0.d;0.0.y;0.0.c;0.0.y;0.0.c;0.1.d;0.7.3;1.z.3;4.d.d;0.0.7;0.4.d;0.0.7;0.1.d;0.4.3;0.a.d;1.z.d;1.1.7;0.5.3;0.0.d;0.5.3;1.1.3;0.1.8;0.0.7;0.0.8;0.4.3;0.1.j;11.1r.14;0.9.x;0.1.7;0.3.3;0.1r.14;0.9.x;0.5.14;0.11.3;1.0.3;5.0.3;2.1b.3;0.2n.r;0.1z.t;0.2f.s;0.20.3;1.3.3;2.6.3;1.0.3;1.3.3;2.14.3;1.3.3;2.w.3;1.3.3;2.6.3;1.0.3;1.3.3;2.e.3;1.1k.3;1.3.3;2.1u.3;2.2.d;0.0.3;0.0.7;0.q.3;3.p.3;6.2d.3;2.5.3;2.0.10;0.hq.3;0.0.7;0.p.3;0.0.y;0.0.c;3.22.3;0.2.7;0.a.3;7.h.3;0.3.d;9.i.3;0.2.d;0.1.7;9.h.3;0.1.d;c.c.3;1.2.3;1.1.d;c.2b.14;0.1.7;0.0.w;0.0.14;0.0.7;0.0.3;0.0.7;0.0.11;0.1.14;2.9.x;6.9.3;6.1.3;0.1.i;0.1.7;0.0.8;0.0.3;0.1.i;0.0.3;0.2.d;0.0.j;0.0.d;0.9.x;6.2g.3;7.4.3;0.1.d;0.x.3;0.0.d;0.0.3;5.1x.3;a.u.3;1.b.d;4.b.d;4.0.3;3.1.i;0.9.x;0.t.14;2.4.14;b.17.14;4.p.14;6.a.x;3.1.14;0.1i.3;0.4.d;2.1.3;0.1q.14;1.s.14;2.0.d;0.9.x;6.9.x;6.d.14;2.19.d;2.a.d;0.0.j;k.4.d;0.1a.2;0.f.d;0.0.19;0.7.2;1.1.7;0.9.5;0.1.7;0.0.o;0.3.7;0.9.o;0.8.d;0.8.o;0.2.7;0.2.d;0.t.3;0.c.d;0.1.3;0.9.x;0.5.3;0.11.5;0.b.d;0.1.18;8.13.3;0.j.d;3.4.7;0.9.x;3.2.3;0.9.x;0.z.3;0.1.7;0.a.3;5.16.3;2.a.3;8.2.d;0.0.3;0.k.d;0.3.3;0.0.d;0.5.3;0.0.d;0.1.3;0.2.d;0.0.3;5.5b.3;0.c.d;0.0.j;0.19.d;0.0.j;0.2.d;0.7p.3;2.5.3;2.11.3;2.5.3;2.7.3;1.0.3;1.0.3;1.0.3;1.u.3;2.1g.3;1.e.3;1.d.3;2.5.3;1.i.3;2.2.3;1.6.3;0.0.8;0.0.3;1.6.7;0.0.j;0.2.7;0.0.1b;0.0.d;0.0.1c;0.1.d;0.0.10;0.0.j;0.1.10;0.0.6;0.1.1;0.0.3;0.1.12;0.0.y;0.2.12;0.0.y;0.0.12;0.1.1;0.1.3;0.2.p;0.0.7;0.1.9;0.4.d;0.0.j;0.7.z;0.0.3;0.1.12;0.0.1;0.1.w;0.5.3;0.0.q;0.0.y;0.0.c;0.2.w;0.b.3;0.0.7;0.0.z;0.3.7;0.0.3;0.2.7;0.0.1a;0.3.3;1.9.d;0.1.3;2.0.1;0.7.3;0.0.y;0.0.c;0.0.1;0.0.3;0.3.1;0.7.3;0.0.y;0.0.c;1.c.3;3.6.11;0.0.z;0.d.11;0.0.z;0.3.11;0.0.z;0.1.11;0.0.z;0.0.11;0.0.z;0.e.11;0.w.d;f.2.3;0.0.z;0.0.3;0.0.1;0.2.3;0.0.z;0.8.3;0.0.1;0.1.3;0.0.11;0.9.3;0.1.1;0.7.3;0.0.1;0.z.3;0.e.1;0.0.3;0.b.1;0.3.3;0.9.1;0.e.3;0.0.1;0.1.3;4.9.1;0.1j.3;0.0.1;0.0.3;0.0.1;0.16.3;0.0.1;0.0.3;0.1.1;0.2.3;0.1.1;0.1.3;0.0.1;0.2.3;0.0.1;0.0.3;0.0.1;0.1.11;0.0.3;0.0.1;0.3.3;0.0.1;0.1.3;0.3.1;0.1.3;0.0.1;0.0.3;0.0.1;0.0.3;0.5.1;0.0.3;0.0.1;0.4.3;0.3.1;0.3.3;0.1.1;0.9.3;0.0.1;0.2.3;0.0.1;0.4.3;0.0.1;0.c.3;0.1.1;0.1.3;0.3.1;0.1.3;0.1.1;0.1.3;0.1.1;0.h.3;0.1.1;0.1.3;0.1.1;0.c.3;0.0.1;0.2.3;0.0.1;0.a.3;0.0.1;0.o.3;0.0.1;0.1a.3;0.0.p;0.n.3;0.0.y;0.0.c;0.0.y;0.0.c;0.5.3;0.0.1;0.6.3;0.1.o;0.c.3;0.0.y;0.0.c;0.5g.3;0.3.o;0.1h.3;m.a.3;l.4e.1;0.0.3;0.23.1;0.3.3;0.10.1;0.a.3;0.f.1;0.1.3;0.3.1;0.9.3;0.1.1;0.0.3;0.6.1;0.7.3;0.1.1;0.1.3;0.1.1;0.3.3;0.1.1;0.1.3;0.1.1;0.3.3;0.2.1;0.1.3;0.0.1;0.1.3;0.3.1;0.f.3;0.3.1;0.8.3;0.0.1;0.f.3;0.3.o;0.0.3;0.1.1;0.1.3;0.0.1;0.3.3;0.1.1;0.3.3;0.1.o;0.1.1;0.0.o;0.0.3;0.2.o;0.0.g;0.1.o;0.o.3;0.2.o;0.3.3;0.0.1;0.0.3;0.0.1;0.s.3;0.1.1;0.0.3;0.2.1;0.0.3;0.0.1;0.0.o;0.1.1;0.0.3;0.1.1;0.0.3;0.0.1;0.e.3;0.0.o;0.t.3;0.1.1;0.s.3;0.b.o;0.3.1;0.0.o;0.0.3;0.2.o;0.0.1;0.1.o;0.2.1;0.1.o;0.1.1;0.0.o;0.1.1;0.2.o;0.0.3;0.0.1;0.3.3;0.1.1;0.0.o;0.5.1;0.4.o;0.0.1;0.1.o;0.0.g;0.0.o;0.1.1;0.7.o;0.2.3;0.1.o;0.3.g;0.20.3;0.0.1;0.2.3;0.5.12;0.0.3;0.1.i;0.0.o;0.2.3;0.0.y;0.0.c;0.0.y;0.0.c;0.0.y;0.0.c;0.0.y;0.0.c;0.0.y;0.0.c;0.0.y;0.0.c;0.0.y;0.0.c;0.t.1;0.1c.3;0.0.y;0.0.c;0.u.3;0.0.y;0.0.c;0.0.y;0.0.c;0.0.y;0.0.c;0.0.y;0.0.c;0.0.y;0.0.c;0.f.3;0.0.7;0.ap.3;0.0.y;0.0.c;0.0.y;0.0.c;0.0.y;0.0.c;0.0.y;0.0.c;0.0.y;0.0.c;0.0.y;0.0.c;0.0.y;0.0.c;0.0.y;0.0.c;0.0.y;0.0.c;0.0.y;0.0.c;0.0.y;0.0.c;0.1q.3;0.0.y;0.0.c;0.0.y;0.0.c;0.v.3;0.0.y;0.0.c;0.9i.3;0.4.1;0.p.3;2.ag.3;0.2.d;0.1.3;5.0.i;0.2.7;0.0.3;0.0.i;0.0.7;0.11.3;1.0.3;5.0.3;2.1j.3;7.0.3;0.0.7;e.0.d;0.m.3;9.6.3;1.6.3;1.6.3;1.6.3;1.6.3;1.6.3;1.6.3;1.6.3;1.v.d;0.d.12;0.7.7;0.0.3;0.0.10;0.0.y;0.0.7;0.1.3;0.1.12;0.1.3;0.1.12;0.0.y;0.0.c;0.0.y;0.0.c;0.0.y;0.0.c;0.0.y;0.0.c;0.3.7;0.0.i;0.0.3;0.1.7;0.0.3;0.1.7;0.4.3;0.1.6;0.2.7;0.0.3;0.0.10;0.0.7;0.0.y;0.7.7;0.0.3;0.0.7;0.0.3;0.1.7;0.2.3;0.1.i;0.0.y;0.0.e;0.0.y;0.0.e;0.0.y;0.0.e;0.0.y;0.0.e;0.0.10;y.p.o;1.2g.o;c.5x.o;q.f.o;0.0.7;0.1.c;0.1.o;0.0.w;0.1.o;0.0.y;0.0.c;0.0.y;0.0.c;0.0.y;0.0.c;0.0.y;0.0.c;0.0.y;0.0.c;0.1.o;0.0.y;0.0.c;0.0.y;0.0.c;0.0.y;0.0.c;0.0.y;0.0.c;0.0.w;0.0.y;0.1.c;0.9.o;0.5.d;0.4.o;0.0.d;0.4.o;0.1.w;0.2.o;1.0.b;0.0.o;0.0.b;0.0.o;0.0.b;0.0.o;0.0.b;0.0.o;0.0.b;0.o.o;0.0.b;0.u.o;0.0.b;0.0.o;0.0.b;0.0.o;0.0.b;0.5.o;0.0.b;0.5.o;0.1.b;2.1.d;0.3.w;0.0.o;0.0.w;0.0.b;0.0.o;0.0.b;0.0.o;0.0.b;0.0.o;0.0.b;0.0.o;0.0.b;0.o.o;0.0.b;0.u.o;0.0.b;0.0.o;0.0.b;0.0.o;0.0.b;0.5.o;0.0.b;0.5.o;0.1.b;0.3.o;0.0.w;0.0.b;0.1.w;0.0.o;5.16.o;1.2l.o;1.2d.o;9.0.o;0.f.b;0.u.o;1.13.o;0.7.1;0.5f3.o;0.1r.3;0.g7o.o;0.0.w;0.vq.o;3.1i.o;9.19.3;0.1.7;0.7g.3;0.0.7;0.0.i;0.0.7;0.f.3;0.9.x;0.1.3;k.1a.3;0.3.d;0.0.3;0.9.d;0.v.3;0.1.d;0.27.3;0.1.d;0.0.3;0.4.7;8.64.3;k.g.3;0.0.d;0.2.3;0.0.d;0.3.3;0.0.d;0.m.3;0.4.d;0.3.3;0.0.d;3.7.3;0.0.z;0.0.3;6.1f.3;0.1.8;0.1.i;8.1.d;0.1d.3;0.h.d;8.1.7;0.9.x;6.h.d;0.9.3;0.0.8;0.1.3;0.0.d;0.9.x;0.r.3;0.7.d;0.1.7;0.m.3;0.c.d;b.0.3;0.s.r;3.3.d;0.1a.2;0.c.d;0.0.19;0.5.o;0.2.7;0.3.o;1.0.7;0.9.5;4.1.o;0.f.14;0.9.x;0.4.14;1.14.5;0.d.d;9.2.7;0.0.d;0.7.7;0.1.d;2.9.5;2.0.o;0.2.7;0.2q.14;o.4.14;0.a.3;0.4.d;0.1.7;0.2.3;0.1.d;a.5.3;2.5.3;2.5.3;9.6.3;1.6.3;1.1n.3;4.36.3;0.7.d;0.0.7;0.1.d;2.9.x;6.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;0.0.k;0.q.l;c.m.t;4.1c.s;4.1kv.15;0.4xr.0;0.e7.o;0.6.3;c.4.3;5.0.m;0.0.d;0.9.m;0.0.3;0.c.m;1.4.m;1.0.m;1.1.m;1.1.m;1.9.m;0.dp.3;0.0.c;0.0.y;0.3z.3;w.b.3;0.0.z;0.2.3;0.f.d;0.2.c;0.1.w;0.1.i;0.0.y;0.0.c;0.0.p;6.0.j;0.0.d;0.0.j;0.0.d;0.0.j;0.0.d;0.1.j;0.0.d;0.0.j;0.0.d;0.0.j;0.0.d;0.1.j;0.0.d;0.4.o;0.0.y;0.0.c;0.0.y;0.0.c;0.0.y;0.0.c;0.0.y;0.0.c;0.0.y;0.0.c;0.0.y;0.0.c;0.0.y;0.0.c;0.0.y;0.0.c;0.1.o;0.0.y;0.0.c;0.6.o;0.0.c;0.0.o;0.0.c;1.1.w;0.1.i;0.0.o;0.0.y;0.0.c;0.0.y;0.0.c;0.0.y;0.0.c;0.7.o;1.0.o;0.0.11;0.0.z;0.0.o;4.4.3;1.3q.3;2.0.1a;1.0.i;0.1.o;0.0.11;0.0.z;0.1.o;0.0.y;0.0.c;0.1.o;0.0.c;0.0.o;0.0.c;0.a.o;0.1.w;0.2.o;0.0.i;0.q.o;0.0.y;0.0.o;0.0.c;0.s.o;0.0.y;0.0.o;0.0.c;0.0.o;0.0.y;0.1.c;0.0.y;0.1.c;0.0.w;0.0.o;0.9.b;0.18.o;0.1.w;0.u.o;3.5.o;2.5.o;2.5.o;2.2.o;3.0.z;0.0.11;0.2.o;0.1.11;1.6.3;a.2.d;0.0.a;0.0.1;2.b.3;1.p.3;1.i.3;1.1.3;1.e.3;2.d.3;y.3e.3;5.2.7;4.18.3;3.2f.3;1.c.3;3.0.3;1b.18.3;0.0.d;3m.s.3;3.1c.3;f.0.d;0.q.3;4.z.3;9.t.3;5.11.3;0.4.d;5.t.3;1.0.7;0.z.3;4.7.3;0.0.7;0.4.3;16.4d.3;2.9.x;6.z.3;4.z.3;4.13.3;8.1f.3;b.b.3;1.e.3;1.6.3;1.1.3;1.a.3;1.e.3;1.6.3;1.1.3;3.1f.3;c.8m.3;9.l.3;a.7.3;o.5.3;1.15.3;1.8.3;1x.5.3;2.0.3;1.17.3;1.1.3;3.0.3;2.m.3;1.0.7;0.1y.3;8.8.3;1c.i.3;1.1.3;5.w.3;3.0.7;0.p.3;5.q.3;12.1j.3;4.j.3;2.1a.3;0.2.d;1.1.d;5.3.d;0.3.3;1.2.3;1.s.3;2.2.d;4.0.d;0.8.3;7.7.7;0.0.3;7.1r.3;w.10.3;0.1.d;4.4.3;0.5.7;0.0.p;9.1h.3;3.6.7;0.l.3;2.q.3;5.p.3;7.3.3;c.6.3;28.20.3;1j.1e.3;d.1e.3;7.15.3;0.3.d;8.9.x;6.9.x;0.r.3;3.4.d;0.0.10;0.m.3;8.1.3;5s.u.3;1.15.3;1.1.d;0.0.10;2.1.3;g.5.3;8.0.7;0.7.3;x.5.d;0.13.3;8.l.3;0.a.d;0.8.3;m.h.3;0.3.d;0.3.3;12.r.3;k.m.3;9.2.d;0.1.4;0.1e.2;0.d.d;0.0.19;0.1.7;0.4.o;4.j.o;0.9.5;0.0.d;0.1.2;0.1.d;0.0.2;9.0.j;0.2.d;0.18.3;0.a.d;0.1.3;0.0.x;0.3.7;0.0.d;a.0.x;2.o.3;7.9.x;6.2.d;0.z.3;0.d.d;1.9.x;0.3.7;0.0.3;0.1.d;0.0.3;8.y.3;0.0.d;0.0.3;0.0.8;0.0.3;9.2.d;0.1b.3;0.d.d;0.3.3;0.1.7;0.0.3;0.0.7;0.3.d;0.0.3;0.1.d;0.9.x;0.0.3;0.0.8;0.0.3;0.2.7;1.j.3;b.h.3;1.o.3;0.b.d;0.1.7;0.0.3;0.1.7;0.0.3;0.0.d;0.1.3;0.0.d;1q.6.3;1.0.3;1.3.3;1.e.3;1.9.3;0.0.7;6.1a.3;0.b.d;5.9.x;6.3.d;1.7.2;2.1.2;2.l.2;1.6.2;1.1.2;1.4.2;1.1.d;0.0.7;0.6.d;2.1.d;2.1.d;0.0.19;2.0.5;6.0.d;5.0.7;0.1.5;0.1.2;0.1.d;2.6.d;3.4.d;b.9.5;1.0.5;2.0.5;1.1.5;0.z.2;1.0.o;0.8.d;1.0.d;2.0.d;1.3.d;1.3.d;0.0.19;0.0.4;0.0.d;0.2.o;1.1.o;8.1.d;t.1g.3;0.h.d;0.3.3;0.3.7;0.0.3;0.9.x;0.1.7;1.0.3;0.0.d;0.2.3;u.1b.3;0.j.d;0.3.3;8.9.x;4m.1a.3;0.6.d;2.8.d;0.0.8;0.1.7;0.1.i;0.2.3;0.e.7;0.3.3;0.1.d;y.1b.3;0.g.d;0.1.7;0.1.3;b.9.x;6.c.8;j.16.3;0.c.d;0.1.3;6.9.x;6.j.x;s.q.14;2.e.14;4.9.x;0.1.14;0.2.7;0.7.14;55.17.3;0.e.d;0.0.3;2s.1r.3;0.9.x;0.8.3;c.0.3;0.6.2;2.0.2;2.7.2;1.1.2;1.n.2;0.5.d;1.1.d;2.2.d;0.0.19;0.0.4;0.0.d;0.0.4;0.1.d;0.2.7;9.9.5;1y.7.3;2.12.3;0.6.d;2.6.d;0.0.3;0.0.8;0.0.3;0.0.d;r.0.3;0.9.d;0.13.3;0.6.d;0.0.3;0.3.d;0.0.8;0.0.3;0.3.7;0.0.8;0.0.3;0.0.d;8.0.3;0.a.d;0.19.3;0.f.d;0.2.7;0.0.3;0.2.8;0.1.7;d.20.3;7.9.8;2e.7.d;2g.x.3;e.9.x;6.8.3;1.10.3;0.7.d;1.7.d;0.0.3;0.4.7;a.9.x;0.i.3;3.0.8;0.0.i;0.t.3;2.l.d;1.d.d;21.6.3;1.1.3;1.11.3;0.5.d;3.0.d;1.1.d;1.6.d;0.0.3;0.0.d;8.9.x;6.5.3;1.1.3;1.v.3;0.4.d;1.1.d;1.4.d;0.0.3;7.9.x;6.17.3;4.9.x;6u.h.5;0.0.7;0.3.d;0.1.7;7.1.d;0.0.4;0.0.d;0.c.2;1.x.2;0.6.d;3.3.d;0.0.19;0.1.7;0.a.o;0.9.5;0.0.d;2d.0.3;f.s.3;0.3.z;0.g.3;d.0.7;0.pl.3;2u.32.3;1.4.7;b.5f.3;218.2q.3;d.gn.3;0.2.y;0.2.c;0.z.3;0.0.c;0.2.3;0.0.y;0.0.c;0.0.y;0.0.c;0.6m.3;0.0.y;0.1.c;0.4y.3;0.0.y;0.6.j;0.0.y;0.0.c;0.2.j;0.0.y;0.0.c;0.0.y;0.0.c;0.0.d;0.5.3;0.e.d;a.32y.3;5.ct.3;0.0.y;0.0.c;0.3a.3;5a1.t.5;0.h.d;0.9.5;1c6.fs.3;7.u.3;1.9.x;4.1.7;0.26.3;1.9.x;6.t.3;2.4.d;0.0.7;a.1b.3;0.6.d;0.2.7;0.9.3;0.0.7;0.0.3;a.9.x;1.6.3;1.k.3;5.i.3;c0.19.3;0.1.7;0.9.x;5i.2e.3;0.1.7;0.1.3;5.o.3;2.o.3;18.22.3;4.0.d;0.0.3;0.1i.d;7.3.d;0.c.3;1s.3.w;0.0.j;b.1.d;0.1.w;0.2.o;9.5bz.o;0.d1.3;15.0.3;0.u.o;2p.36.o;6pp.3.3;1.6.3;1.1.3;1.82.o;f.0.b;t.2.b;2.0.b;e.3.b;8.az.o;1s4.2y.3;5.c.3;3.8.3;7.9.3;2.0.3;0.1.d;0.0.7;0.3.d;318.6n.3;0.9.x;0.2.3;3.c3.3;6.m.3;f.g.3;f.19.d;2.m.d;9.37.3;1o.6t.3;a.12.3;2.1n.3;0.4.d;0.2.3;0.l.d;0.1.3;0.6.d;0.t.3;0.3.d;0.1o.3;l.1t.3;0.2.d;0.0.3;3e.j.3;c.j.3;c.2e.3;9.o.3;3r.2c.3;1.1y.3;1.1.3;2.0.3;2.1.3;2.3.3;1.b.3;1.0.3;1.6.3;1.1s.3;1.3.3;2.7.3;1.6.3;1.r.3;1.3.3;1.4.3;1.0.3;3.6.3;1.9f.3;2.83.3;2.1d.x;0.e7.3;0.1i.d;0.3.3;0.1d.d;0.7.3;0.0.d;0.d.3;0.0.d;0.1.3;0.3.7;0.0.3;f.4.d;1.e.d;uo.u.3;6.5.3;5x.6.d;1.g.d;2.6.d;1.1.d;1.4.d;5.1p.3;x.0.d;34.18.3;3.6.d;0.6.3;2.9.x;4.1.3;8w.t.3;0.0.d;h.17.3;0.3.d;0.9.x;5.0.11;cw.r.3;0.3.d;0.9.x;5y.t.3;0.1.d;0.0.3;0.9.x;4.0.3;5c.u.3;1.2.3;0.0.d;0.1.3;0.0.d;0.6.3;0.1.d;0.4.3;0.0.d;8.1.3;68.6.3;1.3.3;1.1.3;1.e.3;1.5g.3;2.8.3;0.6.d;15.1v.3;0.6.d;0.0.3;4.9.x;4.1.y;lt.1m.3;0.0.z;0.2.3;0.0.z;0.3.3;24.1o.3;5e.3.3;1.q.3;1.1.3;1.0.3;2.0.3;1.9.3;1.3.3;1.0.3;1.0.3;6.0.3;4.0.3;1.0.3;1.0.3;1.2.3;1.1.3;1.0.3;2.0.3;1.0.3;1.0.3;1.0.3;1.0.3;1.1.3;1.0.3;2.3.3;1.6.3;1.3.3;1.3.3;1.0.3;1.9.3;1.g.3;5.2.3;1.4.3;1.g.3;1g.1.3;7i.73.o;0.c.1;0.2.3;0.t.1;0.1.3;0.1l.1;0.5.3;0.1o.1;0.0.3;0.1j.o;0.p.13;0.as.o;0.0.g;0.l.o;0.1.3;0.m.o;0.1.3;0.4.o;0.0.3;0.4.o;0.2.g;0.1.o;0.0.g;0.1.o;0.2.g;0.19.o;0.4.h;0.1t.o;0.1.g;0.1.o;0.a.g;0.k.o;0.i.g;0.2.o;0.0.g;0.3.o;0.2.g;0.0.o;0.2.g;0.6.o;0.0.g;0.0.o;0.0.g;0.d.o;0.0.3;0.0.o;0.0.3;0.0.o;0.0.3;0.4.o;0.0.g;0.3.o;0.0.3;0.0.o;0.1.3;0.24.o;0.6.3;0.f.o;0.d.3;0.c.o;0.n.3;0.15.o;0.1.g;0.3.o;0.0.g;0.k.o;0.0.g;0.3.o;0.1.g;0.1o.o;0.7.3;0.n.o;0.5.3;0.22.o;0.2.g;0.2.o;0.4.g;0.11.3;0.2.12;0.2.w;0.3.3;0.y.o;0.0.g;0.f.o;0.2.g;0.8.o;0.0.g;0.a.o;0.0.g;0.1e.o;0.37.3;0.2.o;0.3.3;0.4.o;0.2c.3;0.16.o;0.b.3;4.1j.3;8.9.3;6.13.3;8.t.3;2.b.3;4.1.3;e.8.3;13.b.3;0.0.g;0.1.o;0.0.g;0.7.o;0.7.g;0.5.o;0.0.g;0.8.o;0.9.g;0.1.o;0.2.g;0.1j.o;0.0.g;0.1o.o;0.1.g;0.0.o;0.1.g;0.0.o;0.0.g;0.g.o;0.2.g;0.0.o;0.c.g;0.x.o;0.2f.3;0.2y.o;0.2.g;0.15.o;0.8.g;0.6.o;0.42.3;1.2j.3;0.9.x;0.0.3;5.sd.o;2.1ekd.o;2.1ekd.o;e1oj.0.d;u.2n.d;3k.6n.d;1e6o.1ekd.0;2.1ekd.0'
const INCB_VALUES = ['Other', 'Consonant', 'Linker', 'Extend'] as const
const INCB_RANGES =
  'lc.33.3;7n.6.3;7b.18.3;1.0.3;1.1.3;1.1.3;1.0.3;20.a.3;1c.k.3;g.0.3;2t.6.3;2.5.3;2.1.3;1.3.3;z.0.3;u.q.3;2j.a.3;1m.8.3;9.0.3;o.3.3;1.8.3;1.2.3;1.4.3;17.2.3;1n.8.3;16.n.3;1.v.3;i.10.1;0.0.3;1.0.3;4.7.3;4.0.2;3.6.3;0.7.1;2.1.3;k.7.1;1.0.3;j.j.1;1.6.1;1.0.1;3.3.1;2.0.3;1.0.3;2.3.3;8.0.2;9.0.3;4.1.1;1.0.1;2.1.3;c.1.1;c.0.3;2.1.3;1l.0.3;4.1.3;4.1.3;2.2.3;3.0.3;u.1.3;3.0.3;b.1.3;i.j.1;1.6.1;1.1.1;1.4.1;2.0.3;4.4.3;1.1.3;4.0.2;k.1.3;l.0.1;0.5.3;1.0.3;j.j.1;1.6.1;1.1.1;1.4.1;2.0.3;1.1.3;1.3.3;8.0.2;7.2.3;4.1.1;1.0.1;2.1.3;d.0.1;g.0.3;1n.0.3;1.0.3;c.0.3;9.0.3;14.0.3;3.0.3;g.j.1;1.f.1;2.0.3;1.2.3;5.2.3;1.2.3;0.0.2;7.1.3;1.2.1;7.1.3;t.0.3;1m.0.3;2.1.3;1.0.3;3.2.3;1.3.3;7.1.3;b.1.3;s.1.3;j.11.1;0.1.3;1.0.3;2.3.3;8.0.2;9.0.3;a.1.3;t.0.3;20.0.3;4.0.3;2.2.3;1.0.3;8.0.3;29.0.3;2.6.3;c.7.3;2q.0.3;2.8.3;b.6.3;21.1.3;r.0.3;1.0.3;1.0.3;1j.d.3;1.4.3;1.1.3;5.a.3;1.z.3;9.0.3;1l.16.1;2.3.3;1.5.3;1.0.2;0.0.3;2.1.3;0.0.1;g.5.1;2.1.3;0.3.1;0.2.3;0.0.1;3.1.1;7.2.1;0.3.3;0.c.1;0.0.3;2.1.3;6.0.3;0.0.1;e.0.3;jj.2.3;qa.3.3;s.2.3;t.1.3;u.1.3;c.1f.1;0.1.3;1.6.3;8.0.3;2.8.3;0.0.2;0.0.3;9.0.3;19.2.3;1.0.3;39.1.3;y.0.3;3a.2.3;4.1.3;9.0.3;6.2.3;63.1.3;2.0.3;4.1g.1;1.0.3;1.6.3;1.0.2;1.0.3;2.7.3;6.9.3;2.0.3;1c.19.3;2.b.3;k.3.3;7.1.1;6.w.1;0.9.3;4.1.3;0.0.2;0.7.1;u.8.3;c.1.3;1.t.1;1.3.3;2.2.3;0.0.2;0.1.3;0.1.1;b.2.1;14.0.3;1.1.3;3.0.3;1.4.3;1k.7.3;2.1.3;48.2.3;1.c.3;1.6.3;4.0.3;6.0.3;3.1.3;5i.1r.3;el.0.3;5e.w.3;2da.2.3;3x.0.3;2o.v.3;fe.5.3;2x.1.3;n9w.3.3;1.9.3;w.1.3;28.1.3;7k.0.3;3.0.3;4.0.3;p.1.3;5.0.3;47.1.3;q.h.3;d.0.3;12.7.3;p.a.3;1.0.3;18.2.3;6.2.1;3.z.1;0.0.3;2.3.3;2.1.3;2.0.2;v.4.1;0.0.3;1.8.1;a.4.1;16.5.3;2.1.3;2.1.3;c.0.3;8.0.3;j.f.1;1.2.1;6.0.1;1.0.3;1.1.1;1c.0.3;1.2.3;2.1.3;5.1.3;1.0.3;u.a.1;1.1.3;8.0.2;5l.q.1;a.0.3;2.0.3;4.0.3;fn4.0.3;kh.f.3;g.f.3;a6.1.3;gt.0.3;6a.0.3;45.4.3;1ad.0.1;0.2.3;1.1.3;5.3.3;0.3.1;1.2.1;1.s.1;2.2.3;4.0.2;4l.1.3;fx.3.3;1t.4.3;8t.1.3;25.5.3;1y.a.3;1d.3.3;3f.0.3;1i.e.3;15.0.3;2.1.3;a.2.3;1d.3.3;2.1.3;7.0.3;1p.2.3;0.z.1;0.4.3;1.5.3;0.0.2;0.0.3;f.0.1;2.0.1;17.0.3;c.1.3;1g.8.3;1.0.3;8.3.3;2.0.3;2n.2.3;2.3.3;6.0.3;2.0.3;4d.0.3;3.7.3;l.1.3;1l.1.3;1.0.3;1.0.3;c.0.3;9.0.3;e.6.3;3.4.3;b.9.1;1.0.1;2.0.1;1.11.1;2.0.3;2.5.3;1.0.3;2.0.3;1.2.3;4.1.3;0.0.2;1.0.3;e.1.3;2d.7.3;2.2.3;1.0.3;n.0.3;29.0.3;2.5.3;1.0.3;2.0.3;1.1.3;1.1.3;6j.0.3;2.3.3;6.1.3;1.1.3;r.1.3;2d.7.3;2.0.3;1.1.3;2y.0.3;1.0.3;2.7.3;2t.0.3;1.0.3;2.3.3;1.4.3;77.8.3;1.1.3;5h.6.1;2.0.1;2.7.1;1.1.1;1.n.1;0.0.3;a.2.3;0.0.2;4.0.3;40.3.3;2.1.3;4.0.3;v.0.1;0.9.3;0.13.1;0.5.3;2.3.3;8.0.2;8.0.1;0.5.3;2.2.3;0.13.1;6.c.3;1.0.3;0.0.2;5i.0.3;1.2.3;1.0.3;5l.6.3;1.5.3;1.0.3;2a.l.3;2.6.3;1.1.3;1.1.3;3e.5.3;3.0.3;1.1.3;1.6.3;1.0.3;20.1.3;3.0.3;1.0.3;9n.1.3;b.1.3;2.c.1;1.x.1;2.4.3;5.1.3;0.0.2;n.0.3;44l.0.3;6.e.3;8ug.b.3;3.2.3;1xc.4.3;1n.6.3;t4.0.3;1r.3.3;29.0.3;b.1.3;f57.1.3;3mp.19.3;2.m.3;f2.4.3;3.5.3;8.7.3;2.6.3;u.3.3;44.2.3;1iz.1i.3;4.1d.3;8.0.3;e.0.3;m.4.3;1.e.3;11s.6.3;1.g.3;2.6.3;1.1.3;1.4.3;2s.0.3;4g.6.3;af.0.3;1p.3.3;e4.3.3;72.1.3;6r.0.3;2.0.3;7.1.3;5.0.3;d6.6.3;31.6.3;240.4.3;gx7k.2n.3;3k.6n.3'
const EXTENDED_PICTOGRAPHIC_RANGES =
  '4p.0.1;4.0.1;68d.0.1;c.0.1;60.0.1;m.0.1;2i.5.1;f.1.1;a7.1.1;c.0.1;4m.0.1;p.a.1;4.2.1;5j.0.1;6f.1.1;a.0.1;9.0.1;1m.3.1;1.4.1;9.0.1;2.0.1;2.1.1;2.0.1;4.0.1;2.0.1;1.1.1;2.0.1;3.0.1;3.1.1;8.2.1;5.0.1;1.0.1;5.b.1;b.1.1;2.0.1;1.1.1;1.0.1;i.0.1;2.1.1;i.5.1;1.0.1;1.1.1;3.1.1;5.0.1;2.1.1;4.1.1;b.1.1;5.1.1;2.0.1;5.1.1;1.0.1;1.1.1;k.1.1;5.5.1;1.3.1;2.0.1;4.0.1;2.0.1;2.5.1;1.0.1;2.0.1;1.0.1;1.0.1;6.0.1;3.0.1;6.0.1;a.1.1;f.0.1;2.0.1;4.0.1;1.0.1;4.2.1;1.0.1;b.1.1;1c.2.1;9.0.1;e.0.1;e.0.1;ac.1.1;cv.2.1;j.1.1;1f.0.1;4.0.1;yi.0.1;c.0.1;gp.0.1;1.0.1;2fze.0.1;13.3.1;2s.b.1;f.1.1;f.0.1;e.1.1;11.9.1;34.1.1;c.1.1;e.0.1;2.9.1;j.1j.1;r.e.1;a.0.1;k.0.1;2.8.1;1.3.1;9.m.1;6.57.1;2.33.1;2.1.1;1.2.1;2.2a.1;2.2.1;1.3.1;5.71.1;1.1q.1;b.5.1;1.n.1;7.1.1;2.7.1;c.0.1;2.3.1;2.0.1;4.1.1;d.1.1;2.0.1;8.1.1;9.0.1;5.2.1;c.2.1;8.2.1;2.0.1;1.0.1;4.0.1;6.0.1;3.0.1;6.2d.1;1c.1x.1;5.7.1;2.g.1;3.0.1;1.5.1;2.c.1;62.11.1;c.3.1;1k.7.1;a.5.1;14.7.1;u.1.1;c.3.1;2.d.1;9.12.1;c.1a.1;1.9.1;1.54.1;2g.7.1;e.41.1;74.sd.1'
const EAST_ASIAN_RANGES =
  '3cw.2n.2;30p.0.3;hc.1.2;d.1.2;5a.3.2;3.0.2;2.0.2;eh.1.2;l.1.2;q.7.2;g.b.2;17.0.2;a.5.2;3.0.2;d.0.2;8.1.2;h.1.2;5.1.2;8.0.2;5.0.2;l.0.2;7.1.2;1.0.2;4.0.2;2.0.2;7.0.2;4.1.2;s.0.2;z.0.2;1.0.2;4.2.2;1.0.2;1p.2.2;o.0.2;e.0.2;nv.1.2;1f.0.2;4.0.2;mi.p.2;1.2g.2;c.5x.2;q.f.2;0.0.1;0.1p.2;2.2d.2;2.2u.2;5.16.2;1.2l.2;1.2d.2;9.1b.2;1.13.2;8.mkc.2;3.1i.2;wp.s.2;hv.8mb.2;6l8.e7.2;ls.9.2;m.y.2;1.i.2;1.3.2;45.2n.1;0.2l.3;3.5.3;2.5.3;2.5.3;2.2.3;3.6.1;1.6.3;m41.4.2;b.6.2;9.5p1.2;15.v.2;2p.36.2;6pp.3.2;1.6.2;1.1.2;1.82.2;f.0.2;t.2.2;2.0.2;e.3.2;8.az.2;6bo.2e.2;9.m.2;5n1.0.2;5m.0.2;5a.0.2;2.9.2;2t.2.2;d.17.2;4.8.2;7.1.2;e.5.2;4a.w.2;c.8.2;1.1x.2;1.l.2;c.16.2;4.4.2;c.g.2;3.0.2;3.1y.2;1.0.2;1.56.2;2.1q.2;d.3.2;1.n.2;i.0.2;q.1.2;d.0.2;2e.2c.2;1c.1x.2;6.0.2;3.2.2;2.3.2;3.3.2;b.1.2;7.8.2;6b.b.2;4.0.2;7v.1a.2;1.9.2;1.54.2;34.c.2;3.a.2;3.1k.2;1.0.2;4.f.2;2.b.2;4.9.2;zr.1ekd.2;2.1ekd.2'
const MARK_RANGES =
  'lc.33.1;7n.4.1;7d.18.1;1.0.1;1.1.1;1.1.1;1.0.1;20.a.1;1c.k.1;g.0.1;2t.6.1;2.5.1;2.1.1;1.3.1;z.0.1;u.q.1;2j.a.1;1m.8.1;9.0.1;o.3.1;1.8.1;1.2.1;1.4.1;17.2.1;1n.8.1;16.n.1;1.v.1;0.0.2;1i.0.1;0.0.2;0.0.1;1.2.2;0.7.1;0.3.2;0.0.1;0.1.2;1.6.1;a.1.1;t.0.1;0.1.2;1k.0.1;1.2.2;0.3.1;2.1.2;2.1.2;0.0.1;9.0.2;a.1.1;q.0.1;2.1.1;0.0.2;1k.0.1;1.2.2;0.1.1;4.1.1;2.2.1;3.0.1;u.1.1;3.0.1;b.1.1;0.0.2;1k.0.1;1.2.2;0.4.1;1.1.1;0.0.2;1.1.2;0.0.1;k.1.1;m.5.1;1.0.1;0.1.2;1k.0.1;1.0.2;0.0.1;0.0.2;0.3.1;2.1.2;2.1.2;0.0.1;7.1.1;0.0.2;a.1.1;u.0.1;1n.1.2;0.0.1;0.1.2;3.2.2;1.2.2;0.0.1;9.0.2;14.0.1;0.2.2;0.0.1;1j.0.1;1.2.1;0.3.2;1.2.1;1.3.1;7.1.1;b.1.1;t.0.1;0.1.2;1k.0.1;1.0.2;0.0.1;0.4.2;1.0.1;0.1.2;1.1.2;0.1.1;7.1.2;b.1.1;f.0.2;c.1.1;0.1.2;1j.1.1;1.2.2;0.3.1;1.2.2;1.2.2;0.0.1;9.0.2;a.1.1;t.0.1;0.1.2;1y.0.1;4.2.2;0.2.1;1.0.1;1.7.2;i.1.2;1p.0.1;2.6.1;c.7.1;2q.0.1;2.8.1;b.6.1;21.1.1;r.0.1;1.0.1;1.0.1;4.1.2;1d.d.1;0.0.2;0.4.1;1.1.1;5.a.1;1.z.1;9.0.1;2s.1.2;0.3.1;0.0.2;0.5.1;0.0.2;0.1.1;0.1.2;0.1.1;n.1.2;0.1.1;4.2.1;1.2.2;2.6.2;3.3.1;d.0.1;0.1.2;0.1.1;0.5.2;0.0.1;1.0.2;a.2.2;0.0.1;jj.2.1;qa.2.1;0.0.2;s.1.1;0.0.2;t.1.1;u.1.1;1s.1.1;0.0.2;0.6.1;0.7.2;0.0.1;0.1.2;0.a.1;9.0.1;19.2.1;1.0.1;39.1.1;y.0.1;3a.2.1;0.3.2;0.1.1;0.2.2;4.1.2;0.0.1;0.5.2;0.2.1;63.1.1;0.1.2;0.0.1;1l.0.2;0.0.1;0.0.2;0.6.1;1.0.1;0.0.2;0.0.1;0.1.2;0.7.1;0.5.2;0.9.1;2.0.1;1c.d.1;1.u.1;2.b.1;k.3.1;0.0.2;1b.0.1;0.0.2;0.4.1;0.0.2;0.0.1;0.4.2;0.0.1;0.1.2;12.8.1;c.1.1;0.0.2;u.0.2;0.3.1;0.1.2;0.1.1;0.0.2;0.2.1;1k.0.1;0.0.2;0.1.1;0.2.2;0.0.1;0.0.2;0.2.1;0.1.2;1c.7.2;0.7.1;0.1.2;0.1.1;48.2.1;1.c.1;0.0.2;0.6.1;4.0.1;6.0.1;2.0.2;0.1.1;5i.1r.1;k0.c.1;4.0.1;3.b.1;2da.2.1;3x.0.1;2o.v.1;fe.3.1;0.1.2;2x.1.1;n9w.0.1;4.9.1;w.1.1;28.1.1;7k.0.1;3.0.1;4.0.1;n.1.2;0.1.1;0.0.2;4.0.1;2b.1.2;1e.f.2;0.1.1;q.h.1;d.0.1;12.7.1;p.a.1;0.1.2;18.2.1;0.0.2;1b.0.1;0.1.2;0.3.1;0.1.2;0.1.1;0.2.2;10.0.1;1v.5.1;0.1.2;0.1.1;0.1.2;0.1.1;c.0.1;8.0.1;0.0.2;19.0.2;0.0.1;0.0.2;1e.0.1;1.2.1;2.1.1;5.1.1;1.0.1;15.0.2;0.1.1;0.1.2;5.0.2;0.0.1;6k.1.2;0.0.1;0.1.2;0.0.1;0.1.2;1.0.2;0.0.1;fn4.0.1;kh.f.1;g.f.1;r1.0.1;6a.0.1;45.4.1;1ae.2.1;1.1.1;5.3.1;14.2.1;4.0.1;4l.1.1;fx.3.1;1t.4.1;8t.1.1;25.5.1;1y.a.1;1d.3.1;3e.0.2;0.0.1;0.0.2;1h.e.1;15.0.1;2.1.1;a.2.1;0.0.2;19.2.2;0.3.1;0.1.2;0.1.1;7.0.1;1p.2.1;10.4.1;0.0.2;0.7.1;g.1.2;18.0.1;c.1.1;0.0.2;1c.2.2;0.8.1;0.1.2;8.3.1;1.0.2;0.0.1;2k.2.2;0.2.1;0.1.2;0.0.1;0.0.2;0.1.1;6.0.1;2.0.1;4d.0.1;0.2.2;0.7.1;l.1.1;0.1.2;1j.1.1;1.1.2;0.0.1;0.3.2;2.1.2;2.2.2;9.0.2;a.1.2;2.6.1;3.4.1;1v.2.2;0.5.1;1.0.2;2.0.2;1.3.2;1.1.2;0.0.1;0.0.2;0.0.1;1.0.1;e.1.1;2a.2.2;0.7.1;0.1.2;0.2.1;0.0.2;0.0.1;n.0.1;29.2.2;0.5.1;0.0.2;0.0.1;0.3.2;0.1.1;0.0.2;0.1.1;6j.2.2;0.3.1;2.3.2;0.1.1;0.0.2;0.1.1;r.1.1;2a.2.2;0.7.1;0.1.2;0.0.1;0.0.2;0.1.1;2y.0.1;0.0.2;0.0.1;0.1.2;0.5.1;0.0.2;0.0.1;2t.0.1;0.0.2;0.0.1;0.1.2;0.3.1;0.0.2;0.4.1;74.2.2;0.8.1;0.0.2;0.1.1;6t.5.2;1.1.2;2.1.1;0.0.2;0.0.1;1.0.2;1.0.2;0.0.1;3x.2.2;0.3.1;2.1.1;0.3.2;0.0.1;3.0.2;s.9.1;14.5.1;0.0.2;1.3.1;8.0.1;9.5.1;0.1.2;0.2.1;1a.c.1;0.0.2;0.1.1;5i.0.1;0.0.2;0.2.1;0.0.2;0.0.1;0.0.2;5j.0.2;0.6.1;1.5.1;0.0.2;0.0.1;2a.l.1;1.0.2;0.6.1;0.0.2;0.1.1;0.0.2;0.1.1;3e.5.1;3.0.1;1.1.1;1.6.1;1.0.1;1u.4.2;1.1.1;1.1.2;0.0.1;0.0.2;0.0.1;9n.1.1;0.1.2;9.1.1;1.0.2;1c.1.2;0.4.1;3.1.2;0.0.1;0.0.2;0.0.1;n.0.1;44l.0.1;6.e.1;8ug.b.1;0.2.2;0.2.1;1xc.4.1;1n.6.1;t4.0.1;1.1i.2;7.3.1;29.0.1;b.1.2;f57.1.1;3mp.19.1;2.m.1;f2.1.2;0.2.1;3.5.2;8.7.1;2.6.1;u.3.1;44.2.1;1iz.1i.1;4.1d.1;8.0.1;e.0.1;m.4.1;1.e.1;11s.6.1;1.g.1;2.6.1;1.1.1;1.4.1;2s.0.1;4g.6.1;af.0.1;1p.3.1;e4.3.1;72.1.1;6r.0.1;2.0.1;7.1.1;5.0.1;d6.6.1;31.6.1;gzhx.6n.1'
const QUOTE_RANGES =
  '4r.0.1;f.0.2;670.0.1;0.0.2;1.1.1;0.0.2;1.0.1;p.0.1;0.0.2;2pz.0.1;0.0.2;0.0.1;0.0.2;3.0.1;0.0.2;1.0.1;0.0.2;e.0.1;0.0.2;2.0.1;0.0.2'
const ASSIGNED_RANGES =
  '0.on.1;2.5.1;4.6.1;1.0.1;1.j.1;1.b0.1;1.11.1;2.1d.1;2.2.1;1.1i.1;8.q.1;4.5.1;b.7h.1;1.1n.1;2.2s.1;e.1m.1;2.1c.1;2.e.1;1.r.1;2.0.1;1.a.1;5.x.1;5.6k.1;1.7.1;2.1.1;2.l.1;1.6.1;1.0.1;3.3.1;2.8.1;2.1.1;2.3.1;8.0.1;4.1.1;1.4.1;2.o.1;2.2.1;1.5.1;4.1.1;2.l.1;1.6.1;1.1.1;1.1.1;1.1.1;2.0.1;1.4.1;4.1.1;2.2.1;3.0.1;7.3.1;1.0.1;7.g.1;a.2.1;1.8.1;1.2.1;1.l.1;1.6.1;1.1.1;1.4.1;2.9.1;1.2.1;1.2.1;2.0.1;f.3.1;2.b.1;7.6.1;1.2.1;1.7.1;2.1.1;2.l.1;1.6.1;1.1.1;1.4.1;2.8.1;2.1.1;2.2.1;7.2.1;4.1.1;1.4.1;2.h.1;a.1.1;1.5.1;3.2.1;1.3.1;3.1.1;1.0.1;1.1.1;3.1.1;3.2.1;3.b.1;4.4.1;3.2.1;1.3.1;2.0.1;6.0.1;e.k.1;5.c.1;1.2.1;1.m.1;1.f.1;2.8.1;1.2.1;1.3.1;7.1.1;1.2.1;1.1.1;2.3.1;2.9.1;7.l.1;1.2.1;1.m.1;1.9.1;1.4.1;2.8.1;1.2.1;1.3.1;7.1.1;5.2.1;1.3.1;2.9.1;1.2.1;c.c.1;1.2.1;1.1e.1;1.2.1;1.5.1;4.f.1;2.p.1;1.2.1;1.h.1;3.n.1;1.8.1;1.0.1;2.6.1;3.0.1;4.5.1;1.0.1;1.7.1;6.9.1;2.2.1;c.1l.1;4.s.1;11.1.1;1.0.1;1.4.1;1.n.1;1.0.1;1.m.1;2.4.1;1.0.1;1.6.1;1.9.1;2.3.1;w.1z.1;1.z.1;4.12.1;1.z.1;1.e.1;1.c.1;11.5h.1;1.0.1;5.0.1;2.ag.1;1.3.1;2.6.1;1.0.1;1.3.1;2.14.1;1.3.1;2.w.1;1.3.1;2.6.1;1.0.1;1.3.1;2.e.1;1.1k.1;1.3.1;2.1u.1;2.v.1;3.p.1;6.2d.1;2.5.1;2.ik.1;3.2g.1;7.l.1;9.n.1;9.j.1;c.c.1;1.2.1;1.1.1;c.2l.1;2.9.1;6.9.1;6.p.1;6.2g.1;7.16.1;5.1x.1;a.u.1;1.b.1;4.b.1;4.0.1;3.15.1;2.4.1;b.17.1;4.p.1;6.a.1;3.1p.1;2.1s.1;1.s.1;2.a.1;6.9.1;6.d.1;2.19.1;2.b.1;k.24.1;1.4l.1;8.1n.1;3.e.1;3.1p.1;5.16.1;2.a.1;8.16.1;5.et.1;2.5.1;2.11.1;2.5.1;2.7.1;1.0.1;1.0.1;1.0.1;1.u.1;2.1g.1;1.e.1;1.d.1;2.5.1;1.i.1;2.2.1;1.8.1;1.2s.1;1.b.1;2.q.1;1.c.1;3.x.1;e.w.1;f.3v.1;4.ih.1;m.a.1;l.1eb.1;2.al.1;5.18.1;1.0.1;5.0.1;2.1j.1;7.1.1;e.n.1;9.6.1;1.6.1;1.6.1;1.6.1;1.6.1;1.6.1;1.6.1;1.6.1;1.3h.1;y.p.1;1.2g.1;c.5x.1;q.27.1;1.2d.1;2.2u.1;5.16.1;1.2l.1;1.2d.1;9.1b.1;1.mlo.1;3.1i.1;9.9n.1;k.53.1;8.64.1;k.1n.1;3.9.1;6.1j.1;8.1x.1;8.b.1;6.37.1;b.t.1;3.25.1;1.a.1;4.w.1;1.1i.1;9.d.1;2.9.1;2.2u.1;o.r.1;a.5.1;2.5.1;2.5.1;9.6.1;1.6.1;1.1n.1;4.3h.1;2.9.1;6.8mb.1;c.m.1;4.1c.1;4.6st.1;2.2x.1;12.6.1;c.4.1;5.p.1;1.4.1;1.0.1;1.1.1;1.1.1;1.i1.1;w.15.1;6.1e.1;1.i.1;1.3.1;4.4.1;1.3q.1;2.0.1;1.59.1;3.5.1;2.5.1;2.5.1;2.2.1;3.6.1;1.6.1;a.4.1;2.b.1;1.p.1;1.i.1;1.1.1;1.e.1;2.d.1;y.3e.1;5.2.1;4.18.1;3.2f.1;1.c.1;3.0.1;1b.19.1;3m.s.1;3.1c.1;f.r.1;4.z.1;9.t.1;5.16.1;5.t.1;1.10.1;4.d.1;16.4d.1;2.9.1;6.z.1;4.z.1;4.13.1;8.1f.1;b.b.1;1.e.1;1.6.1;1.1.1;1.a.1;1.e.1;1.6.1;1.1.1;3.1f.1;c.8m.1;9.l.1;a.7.1;o.5.1;1.15.1;1.8.1;1x.5.1;2.0.1;1.17.1;1.1.1;3.0.1;2.m.1;1.1z.1;8.8.1;1c.i.1;1.1.1;5.w.1;3.q.1;5.q.1;12.1j.1;4.j.1;2.1d.1;1.1.1;5.7.1;1.2.1;1.s.1;2.2.1;4.9.1;7.8.1;7.1r.1;w.12.1;4.b.1;9.1h.1;3.s.1;2.q.1;5.p.1;7.3.1;c.6.1;28.20.1;1j.1e.1;d.1e.1;7.19.1;8.9.1;6.11.1;3.s.1;8.1.1;5s.u.1;1.15.1;1.2.1;2.1.1;g.5.1;8.8.1;x.19.1;8.15.1;m.p.1;12.r.1;k.m.1;9.25.1;4.z.1;9.1v.1;a.0.1;2.o.1;7.9.1;6.1g.1;1.h.1;8.12.1;9.2n.1;1.j.1;b.h.1;1.1a.1;1q.6.1;1.0.1;1.3.1;1.e.1;1.a.1;6.1m.1;5.9.1;6.3.1;1.7.1;2.1.1;2.l.1;1.6.1;1.1.1;1.4.1;1.9.1;2.1.1;2.2.1;2.0.1;6.0.1;5.6.1;2.6.1;3.4.1;b.9.1;1.0.1;2.0.1;1.11.1;1.9.1;1.0.1;2.0.1;1.3.1;1.9.1;1.1.1;8.1.1;t.2j.1;1.4.1;u.1z.1;8.9.1;4m.1h.1;2.11.1;y.1w.1;b.9.1;6.c.1;j.1l.1;6.9.1;6.j.1;s.q.1;2.e.1;4.m.1;55.1n.1;2s.2a.1;c.7.1;2.0.1;2.7.1;1.1.1;1.t.1;1.1.1;2.b.1;9.9.1;1y.7.1;2.19.1;2.a.1;r.1z.1;8.2a.1;d.20.1;7.9.1;2e.7.1;2g.x.1;e.9.1;6.8.1;1.18.1;1.d.1;a.s.1;3.v.1;2.l.1;1.d.1;21.6.1;1.1.1;1.17.1;3.0.1;1.1.1;1.8.1;8.9.1;6.5.1;1.1.1;1.10.1;1.1.1;1.5.1;7.9.1;6.17.1;4.9.1;6u.o.1;7.g.1;1.14.1;3.s.1;2d.0.1;f.1d.1;d.pm.1;2u.32.1;1.4.1;b.5f.1;218.2q.1;d.ut.1;a.32y.1;5.g6.1;5a1.1l.1;1c6.fs.1;7.u.1;1.9.1;4.28.1;1.9.1;6.t.1;2.5.1;a.1x.1;a.9.1;1.6.1;1.k.1;5.i.1;c0.1l.1;5i.2i.1;5.o.1;2.o.1;18.22.1;4.1k.1;7.g.1;1s.4.1;b.6.1;9.5p1.1;15.v.1;2p.36.1;6pp.3.1;1.6.1;1.1.1;1.82.1;f.0.1;t.2.1;2.0.1;e.3.1;8.az.1;1s4.2y.1;5.c.1;3.8.1;7.9.1;2.7.1;318.70.1;3.c3.1;6.m.1;f.g.1;f.19.1;2.m.1;9.37.1;1o.6t.1;a.12.1;2.5d.1;l.1x.1;3e.j.1;c.j.1;c.2e.1;9.o.1;3r.2c.1;1.1y.1;1.1.1;2.0.1;2.1.1;2.3.1;1.b.1;1.0.1;1.6.1;1.1s.1;1.3.1;2.7.1;1.6.1;1.r.1;1.3.1;1.4.1;1.0.1;3.6.1;1.9f.1;2.83.1;2.jh.1;f.4.1;1.e.1;uo.u.1;6.5.1;5x.6.1;1.g.1;2.6.1;1.1.1;1.4.1;5.1p.1;x.0.1;34.18.1;3.d.1;2.9.1;4.1.1;8w.u.1;h.1l.1;5.0.1;cw.15.1;5y.16.1;4.0.1;5c.u.1;1.l.1;8.1.1;68.6.1;1.3.1;1.1.1;1.e.1;1.5g.1;2.f.1;15.23.1;4.9.1;4.1.1;lt.1v.1;24.1o.1;5e.3.1;1.q.1;1.1.1;1.0.1;2.0.1;1.9.1;1.3.1;1.0.1;1.0.1;6.0.1;4.0.1;1.0.1;1.0.1;1.2.1;1.1.1;1.0.1;2.0.1;1.0.1;1.0.1;1.0.1;1.0.1;1.1.1;1.0.1;2.3.1;1.6.1;1.3.1;1.3.1;1.0.1;1.9.1;1.g.1;5.2.1;1.4.1;1.g.1;1g.1.1;7i.17.1;4.2r.1;c.e.1;2.e.1;1.e.1;1.10.1;a.4t.1;1k.s.1;d.17.1;4.8.1;7.1.1;e.5.1;4a.rc.1;3.g.1;3.c.1;3.61.1;6.b.1;4.0.1;f.b.1;4.1j.1;8.9.1;6.13.1;8.t.1;2.b.1;4.1.1;e.8.1;13.9j.1;8.d.1;2.c.1;3.a.1;3.1k.1;1.0.1;4.f.1;2.b.1;4.9.1;7.42.1;1.2u.1;sl.wyn.1;w.3dp.1;2.4gd.1;2.5rk.1;f.h9.1;1wi.f1.1;15u.3t6.1;5.6jt.1;f5vr.0.1;u.2n.1;3k.6n.1;1e6o.1ekd.1;2.1ekd.1'

type UnicodeRange<T extends string> = {
  readonly start: number
  readonly end: number
  readonly value: T
}
const decodeUnicodeRanges = <T extends string>(
  encoded: string,
  values: readonly T[],
): readonly UnicodeRange<T>[] => {
  let previousEnd = -1
  return encoded.split(';').map((entry) => {
    const [deltaText, lengthText, valueText] = entry.split('.')
    const start = previousEnd + 1 + Number.parseInt(deltaText, 36)
    const end = start + Number.parseInt(lengthText, 36)
    const value = values[Number.parseInt(valueText, 36)]
    if (value === undefined) throw new RangeError('Invalid Unicode table')
    previousEnd = end
    return { start, end, value }
  })
}
const findUnicodeValue = <T extends string>(
  ranges: readonly UnicodeRange<T>[],
  codePoint: number,
  fallback: T,
): T => {
  let low = 0
  let high = ranges.length - 1
  while (low <= high) {
    const middle = Math.floor((low + high) / 2)
    const range = ranges[middle]
    if (range === undefined) break
    if (codePoint < range.start) high = middle - 1
    else if (codePoint > range.end) low = middle + 1
    else return range.value
  }
  return fallback
}
const GRAPHEME_BREAK_TABLE = decodeUnicodeRanges(GRAPHEME_BREAK_RANGES, GRAPHEME_BREAK_VALUES)
const LINE_BREAK_TABLE = decodeUnicodeRanges(LINE_BREAK_RANGES, LINE_BREAK_VALUES)
const INCB_TABLE = decodeUnicodeRanges(INCB_RANGES, INCB_VALUES)
const EXTENDED_PICTOGRAPHIC_TABLE = decodeUnicodeRanges(EXTENDED_PICTOGRAPHIC_RANGES, [
  'Other',
  'Extended_Pictographic',
] as const)
const EAST_ASIAN_TABLE = decodeUnicodeRanges(EAST_ASIAN_RANGES, ['Other', 'F', 'W', 'H'] as const)
const MARK_TABLE = decodeUnicodeRanges(MARK_RANGES, ['Other', 'Mn', 'Mc'] as const)
const QUOTE_TABLE = decodeUnicodeRanges(QUOTE_RANGES, ['Other', 'Pi', 'Pf'] as const)
const ASSIGNED_TABLE = decodeUnicodeRanges(ASSIGNED_RANGES, ['Other', 'Assigned'] as const)
type GraphemeBreakValue = (typeof GRAPHEME_BREAK_VALUES)[number]
type LineBreakValue = (typeof LINE_BREAK_VALUES)[number]
type InCbValue = (typeof INCB_VALUES)[number]
const graphemeBreakValue = (codePoint: number): GraphemeBreakValue =>
  findUnicodeValue(GRAPHEME_BREAK_TABLE, codePoint, 'Other')
const lineBreakValue = (codePoint: number): LineBreakValue =>
  findUnicodeValue(LINE_BREAK_TABLE, codePoint, 'XX')
const inCbValue = (codePoint: number): InCbValue => findUnicodeValue(INCB_TABLE, codePoint, 'Other')
const containsUnicodeCodePoint = (
  ranges: readonly UnicodeRange<string>[],
  codePoint: number,
): boolean => {
  let low = 0
  let high = ranges.length - 1
  while (low <= high) {
    const middle = Math.floor((low + high) / 2)
    const range = ranges[middle]
    if (range === undefined) return false
    if (codePoint < range.start) high = middle - 1
    else if (codePoint > range.end) low = middle + 1
    else return true
  }
  return false
}
const getCodePoints = (value: string): readonly number[] =>
  Array.from(value, (character) => character.codePointAt(0) ?? 0)
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: UAX 29 requires ordered rules.
const getGraphemeBoundaries = (codePoints: readonly number[]): readonly boolean[] => {
  const properties = codePoints.map(graphemeBreakValue)
  const boundaries = Array.from({ length: codePoints.length + 1 }, () => true)
  for (let index = 1; index < codePoints.length; index += 1) {
    const previous = properties[index - 1]
    const next = properties[index]
    let shouldBreak = true
    if (previous === 'CR' && next === 'LF') shouldBreak = false
    else if (previous === 'Control' || previous === 'CR' || previous === 'LF') shouldBreak = true
    else if (next === 'Control' || next === 'CR' || next === 'LF') shouldBreak = true
    else if (previous === 'L' && ['L', 'V', 'LV', 'LVT'].includes(next ?? '')) shouldBreak = false
    else if ((previous === 'LV' || previous === 'V') && (next === 'V' || next === 'T'))
      shouldBreak = false
    else if ((previous === 'LVT' || previous === 'T') && next === 'T') shouldBreak = false
    else if (next === 'Extend' || next === 'ZWJ' || next === 'SpacingMark') shouldBreak = false
    else if (previous === 'Prepend') shouldBreak = false
    else if (inCbValue(codePoints[index] ?? 0) === 'Consonant') {
      let cursor = index - 1
      let hasLinker = false
      while (cursor >= 0) {
        const value = inCbValue(codePoints[cursor] ?? 0)
        if (value === 'Linker') hasLinker = true
        else if (value !== 'Extend') break
        cursor -= 1
      }
      if (hasLinker && cursor >= 0 && inCbValue(codePoints[cursor] ?? 0) === 'Consonant')
        shouldBreak = false
    }
    if (
      shouldBreak &&
      containsUnicodeCodePoint(EXTENDED_PICTOGRAPHIC_TABLE, codePoints[index] ?? 0) &&
      previous === 'ZWJ'
    ) {
      let cursor = index - 2
      while (cursor >= 0 && properties[cursor] === 'Extend') cursor -= 1
      if (
        cursor >= 0 &&
        containsUnicodeCodePoint(EXTENDED_PICTOGRAPHIC_TABLE, codePoints[cursor] ?? 0)
      )
        shouldBreak = false
    }
    if (shouldBreak && previous === 'Regional_Indicator' && next === 'Regional_Indicator') {
      let regionalIndicators = 0
      for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
        if (properties[cursor] !== 'Regional_Indicator') break
        regionalIndicators += 1
      }
      if (regionalIndicators % 2 === 1) shouldBreak = false
    }
    boundaries[index] = shouldBreak
  }
  return boundaries
}
const countGraphemes = (value: string): number => {
  const boundaries = getGraphemeBoundaries(getCodePoints(value))
  return boundaries.reduce((count, boundary, index) => count + (index > 0 && boundary ? 1 : 0), 0)
}
type LineUnit = {
  readonly codePoint: number
  codePointEnd: number
  readonly class: LineBreakValue
  readonly rawClass: LineBreakValue
  readonly eastAsian: boolean
  readonly quote: 'Other' | 'Pi' | 'Pf'
  readonly extendedPictographic: boolean
  readonly unassigned: boolean
  endsWithZwj: boolean
}
const resolveLineClass = (codePoint: number, value: LineBreakValue): LineBreakValue => {
  if (value === 'AI' || value === 'SG' || value === 'XX') return 'AL'
  if (value === 'CJ') return 'NS'
  if (value === 'SA') return containsUnicodeCodePoint(MARK_TABLE, codePoint) ? 'CM' : 'AL'
  return value
}
const getLineUnits = (codePoints: readonly number[]): readonly LineUnit[] => {
  const units: LineUnit[] = []
  for (const [index, codePoint] of codePoints.entries()) {
    const rawClass = lineBreakValue(codePoint)
    const resolvedClass = resolveLineClass(codePoint, rawClass)
    const previous = units.at(-1)
    if (
      (resolvedClass === 'CM' || rawClass === 'ZWJ') &&
      previous &&
      !['BK', 'CR', 'LF', 'NL', 'SP', 'ZW'].includes(previous.class)
    ) {
      previous.codePointEnd = index + 1
      previous.endsWithZwj = rawClass === 'ZWJ'
      continue
    }
    units.push({
      codePoint,
      codePointEnd: index + 1,
      class: resolvedClass === 'CM' || rawClass === 'ZWJ' ? 'AL' : resolvedClass,
      rawClass,
      eastAsian: containsUnicodeCodePoint(EAST_ASIAN_TABLE, codePoint),
      quote: findUnicodeValue(QUOTE_TABLE, codePoint, 'Other'),
      extendedPictographic: containsUnicodeCodePoint(EXTENDED_PICTOGRAPHIC_TABLE, codePoint),
      unassigned: !containsUnicodeCodePoint(ASSIGNED_TABLE, codePoint),
      endsWithZwj: rawClass === 'ZWJ',
    })
  }
  return units
}
const hasClass = (unit: LineUnit | undefined, values: readonly LineBreakValue[]): boolean =>
  unit !== undefined && values.includes(unit.class)
const previousNonSpaceIndex = (units: readonly LineUnit[], index: number): number => {
  let cursor = index
  while (cursor >= 0 && units[cursor]?.class === 'SP') cursor -= 1
  return cursor
}
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: UAX 14 requires ordered rules.
const isLineBreakAllowed = (units: readonly LineUnit[], index: number): boolean => {
  const previous = units[index - 1]
  const next = units[index]
  if (!previous || !next) return index === units.length
  if (previous.class === 'BK') return true
  if (previous.class === 'CR' && next.class === 'LF') return false
  if (hasClass(previous, ['CR', 'LF', 'NL'])) return true
  if (hasClass(next, ['BK', 'CR', 'LF', 'NL'])) return false
  if (hasClass(next, ['SP', 'ZW'])) return false
  const beforeSpacesIndex = previousNonSpaceIndex(units, index - 1)
  const beforeSpaces = units[beforeSpacesIndex]
  if (beforeSpaces?.class === 'ZW') return true
  if (previous.endsWithZwj) return false
  if (previous.class === 'WJ' || next.class === 'WJ') return false
  if (previous.class === 'GL') return false
  if (next.class === 'GL' && !hasClass(previous, ['SP', 'BA', 'HY', 'HH'])) return false
  if (hasClass(next, ['CL', 'CP', 'EX', 'SY'])) return false
  if (beforeSpaces?.class === 'OP') return false
  if (beforeSpaces?.class === 'QU' && beforeSpaces.quote === 'Pi') {
    const beforeQuote = units[beforeSpacesIndex - 1]
    if (
      beforeQuote === undefined ||
      hasClass(beforeQuote, ['BK', 'CR', 'LF', 'NL', 'OP', 'QU', 'GL', 'SP', 'ZW'])
    )
      return false
  }
  if (next.class === 'QU' && next.quote === 'Pf') {
    const afterQuote = units[index + 1]
    if (
      afterQuote === undefined ||
      hasClass(afterQuote, [
        'SP',
        'GL',
        'WJ',
        'CL',
        'QU',
        'CP',
        'EX',
        'IS',
        'SY',
        'BK',
        'CR',
        'LF',
        'NL',
        'ZW',
      ])
    )
      return false
  }
  if (previous.class === 'SP' && next.class === 'IS' && units[index + 1]?.class === 'NU')
    return true
  if (next.class === 'IS') return false
  if (hasClass(beforeSpaces, ['CL', 'CP']) && next.class === 'NS') return false
  if (beforeSpaces?.class === 'B2' && next.class === 'B2') return false
  if (previous.class === 'SP') return true
  if (next.class === 'QU' && next.quote !== 'Pi') return false
  if (previous.class === 'QU' && previous.quote !== 'Pf') return false
  if (next.class === 'QU') {
    const afterQuote = units[index + 1]
    if (!previous.eastAsian || afterQuote === undefined || !afterQuote.eastAsian) return false
  }
  if (previous.class === 'QU' && !next.eastAsian) return false
  if (previous.class === 'QU' && (units[index - 2] === undefined || !units[index - 2]?.eastAsian))
    return false
  if (previous.class === 'CB' || next.class === 'CB') return true
  if (
    hasClass(previous, ['HY', 'HH']) &&
    hasClass(next, ['AL', 'HL']) &&
    (units[index - 2] === undefined ||
      hasClass(units[index - 2], ['BK', 'CR', 'LF', 'NL', 'SP', 'ZW', 'CB', 'GL']))
  )
    return false
  if (hasClass(next, ['BA', 'HH', 'HY', 'NS']) || previous.class === 'BB') return false
  if (hasClass(previous, ['HY', 'HH']) && units[index - 2]?.class === 'HL' && next.class !== 'HL')
    return false
  if (previous.class === 'SY' && next.class === 'HL') return false
  if (next.class === 'IN') return false
  if (
    (hasClass(previous, ['AL', 'HL']) && next.class === 'NU') ||
    (previous.class === 'NU' && hasClass(next, ['AL', 'HL']))
  )
    return false
  if (
    (previous.class === 'PR' && hasClass(next, ['ID', 'EB', 'EM'])) ||
    (hasClass(previous, ['ID', 'EB', 'EM']) && next.class === 'PO')
  )
    return false
  if (
    (hasClass(previous, ['PR', 'PO']) && hasClass(next, ['AL', 'HL'])) ||
    (hasClass(previous, ['AL', 'HL']) && hasClass(next, ['PR', 'PO']))
  )
    return false
  if (hasClass(next, ['PO', 'PR'])) {
    let cursor = index - 1
    while (hasClass(units[cursor], ['SY', 'IS'])) cursor -= 1
    if (units[cursor]?.class === 'NU') return false
  }
  if (hasClass(previous, ['CL', 'CP']) && hasClass(next, ['PO', 'PR'])) {
    let cursor = index - 2
    while (hasClass(units[cursor], ['SY', 'IS'])) cursor -= 1
    if (units[cursor]?.class === 'NU') return false
  }
  if (hasClass(previous, ['PO', 'PR']) && next.class === 'OP') {
    const afterOpening = units[index + 1]
    if (
      afterOpening?.class === 'NU' ||
      (afterOpening?.class === 'IS' && units[index + 2]?.class === 'NU')
    )
      return false
  }
  if (hasClass(previous, ['PO', 'PR']) && next.class === 'NU') return false
  if ((previous.class === 'HY' || previous.class === 'IS') && next.class === 'NU') return false
  if (next.class === 'NU') {
    let cursor = index - 1
    while (hasClass(units[cursor], ['SY', 'IS'])) cursor -= 1
    if (units[cursor]?.class === 'NU') return false
  }
  if (
    (previous.class === 'JL' && hasClass(next, ['JL', 'JV', 'H2', 'H3'])) ||
    (hasClass(previous, ['JV', 'H2']) && hasClass(next, ['JV', 'JT'])) ||
    (hasClass(previous, ['JT', 'H3']) && next.class === 'JT')
  )
    return false
  if (
    (hasClass(previous, ['JL', 'JV', 'JT', 'H2', 'H3']) && next.class === 'PO') ||
    (previous.class === 'PR' && hasClass(next, ['JL', 'JV', 'JT', 'H2', 'H3']))
  )
    return false
  if (hasClass(previous, ['AL', 'HL']) && hasClass(next, ['AL', 'HL'])) return false
  const brahmicBase = ['AK', 'AS'] as const
  const previousIsBrahmicBase = hasClass(previous, brahmicBase) || previous.codePoint === 0x25cc
  const nextIsBrahmicBase = hasClass(next, brahmicBase) || next.codePoint === 0x25cc
  if (previous.class === 'AP' && nextIsBrahmicBase) return false
  if (previousIsBrahmicBase && hasClass(next, ['VF', 'VI'])) return false
  if (
    previous.class === 'VI' &&
    nextIsBrahmicBase &&
    (hasClass(units[index - 2], brahmicBase) || units[index - 2]?.codePoint === 0x25cc)
  )
    return false
  if (previousIsBrahmicBase && nextIsBrahmicBase && units[index + 1]?.class === 'VF') return false
  if (previous.class === 'IS' && hasClass(next, ['AL', 'HL'])) return false
  if (hasClass(previous, ['AL', 'HL', 'NU']) && next.class === 'OP' && !next.eastAsian) return false
  if (previous.class === 'CP' && !previous.eastAsian && hasClass(next, ['AL', 'HL', 'NU']))
    return false
  if (previous.class === 'RI' && next.class === 'RI') {
    let regionalIndicators = 0
    for (let cursor = index - 1; units[cursor]?.class === 'RI'; cursor -= 1) regionalIndicators += 1
    if (regionalIndicators % 2 === 1) return false
  }
  if (
    (previous.class === 'EB' || (previous.extendedPictographic && previous.unassigned)) &&
    next.class === 'EM'
  )
    return false
  return true
}
const countLargestUnbrokenText = (value: string): number => {
  const codePoints = getCodePoints(value)
  const graphemeBoundaries = getGraphemeBoundaries(codePoints)
  const units = getLineUnits(codePoints)
  const lineBreaks = new Set<number>()
  for (let index = 1; index <= units.length; index += 1)
    if (isLineBreakAllowed(units, index)) lineBreaks.add(units[index - 1]?.codePointEnd ?? 0)
  let current = 0
  let largest = 0
  for (let index = 1; index <= codePoints.length; index += 1) {
    if (graphemeBoundaries[index]) current += 1
    if (graphemeBoundaries[index] && lineBreaks.has(index)) {
      largest = Math.max(largest, current)
      current = 0
    }
  }
  return Math.max(largest, current)
}

const ROOT_PROPERTIES = [
  'schemaVersion',
  'language',
  'person',
  'summary',
  'work',
  'education',
  'projects',
  'skills',
  'languages',
  'certifications',
  'awards',
  'volunteer',
  'publications',
  'extensions',
] as const
const PERSON_PROPERTIES = ['name', 'headline', 'email', 'phone', 'location', 'links'] as const
const LINK_PROPERTIES = ['label', 'url'] as const
const DATE_RANGE_PROPERTIES = ['start', 'end'] as const
const SEMANTIC_REFERENCE_PROPERTIES = ['vocabulary', 'uri', 'version'] as const
const WORK_PROPERTIES = [
  'organization',
  'position',
  'positionReference',
  'location',
  'url',
  'dateRange',
  'summary',
  'highlights',
] as const
const VOLUNTEER_PROPERTIES = [
  'organization',
  'role',
  'location',
  'url',
  'dateRange',
  'summary',
  'highlights',
] as const
const EDUCATION_PROPERTIES = [
  'institution',
  'qualification',
  'qualificationReference',
  'field',
  'location',
  'url',
  'dateRange',
  'score',
  'highlights',
] as const
const CERTIFICATION_PROPERTIES = [
  'name',
  'issuer',
  'date',
  'expires',
  'credentialId',
  'url',
] as const
const PROJECT_PROPERTIES = ['name', 'role', 'url', 'dateRange', 'summary', 'highlights'] as const
const PUBLICATION_PROPERTIES = ['name', 'authors', 'publisher', 'date', 'url', 'summary'] as const
const SKILL_PROPERTIES = ['name', 'skillReference', 'level', 'keywords'] as const
const LANGUAGE_PROPERTIES = ['name', 'code', 'fluency'] as const
const AWARD_PROPERTIES = ['title', 'issuer', 'date', 'summary'] as const
const HAS_NON_WHITESPACE = new RegExp(NON_WHITESPACE_PATTERN, 'u')
const VALID_EMAIL = new RegExp(EMAIL_PATTERN)
const VALID_EXTENSION_NAMESPACE = new RegExp(EXTENSION_NAMESPACE_PATTERN)
const VALID_LANGUAGE_TAG = new RegExp(LANGUAGE_TAG_PATTERN)
const VALID_URI_COMPONENT = /^(?:[A-Za-z0-9._~!$&'()*+,;=:@/?-]|%[0-9A-Fa-f]{2})*$/
const VALID_URI_PATH_SEGMENT = /^(?:[A-Za-z0-9._~!$&'()*+,;=:@-]|%[0-9A-Fa-f]{2})*$/
const VALID_URI_USER_INFO = /^(?:[A-Za-z0-9._~!$&'()*+,;=:-]|%[0-9A-Fa-f]{2})*$/
const VALID_URI_REG_NAME = /^(?:[A-Za-z0-9._~!$&'()*+,;=-]|%[0-9A-Fa-f]{2})*$/
const VALID_IPV_FUTURE = /^v[0-9A-Fa-f]+\.(?:[A-Za-z0-9._~!$&'()*+,;=:-])+$/i
type JsonObject = Record<string, unknown>
type DateInterval = { readonly earliest: number; readonly latest: number }

const getActualType = (value: unknown): CvActualType => {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  if (typeof value === 'number' && !Number.isFinite(value)) return 'non-finite-number'
  return typeof value
}
const isObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
const escapePointerSegment = (segment: string): string =>
  segment.replaceAll('~', '~0').replaceAll('/', '~1')
const appendPath = (path: string, segment: string | number): string =>
  `${path}/${escapePointerSegment(String(segment))}`
const compareByScalarValue = (left: string, right: string): number => {
  const leftScalars = Array.from(left, (character) => character.codePointAt(0) ?? 0)
  const rightScalars = Array.from(right, (character) => character.codePointAt(0) ?? 0)
  const length = Math.min(leftScalars.length, rightScalars.length)
  for (let index = 0; index < length; index += 1) {
    const difference = leftScalars[index] - rightScalars[index]
    if (difference !== 0) return difference
  }
  return leftScalars.length - rightScalars.length
}
const sortedKeys = (value: JsonObject): string[] => Object.keys(value).sort(compareByScalarValue)
const addUnknownFieldErrors = (
  value: JsonObject,
  knownProperties: readonly string[],
  path: string,
  errors: CvDataValidationError[],
): void => {
  const known = new Set(knownProperties)
  for (const property of sortedKeys(value))
    if (!known.has(property))
      errors.push({ path: appendPath(path, property), code: 'unexpected-field' })
}
const validateString = (
  value: unknown,
  path: string,
  errors: CvDataValidationError[],
): value is string => {
  if (typeof value !== 'string') {
    errors.push({ path, code: 'invalid-type', expected: 'string', actual: getActualType(value) })
    return false
  }
  if (!HAS_NON_WHITESPACE.test(value)) {
    errors.push({ path, code: 'empty-value' })
    return false
  }
  return true
}
const validateRequiredString = (
  value: JsonObject,
  property: string,
  path: string,
  errors: CvDataValidationError[],
): boolean => {
  const propertyPath = appendPath(path, property)
  if (!Object.hasOwn(value, property)) {
    errors.push({ path: propertyPath, code: 'required' })
    return false
  }
  return validateString(value[property], propertyPath, errors)
}
const validateOptionalString = (
  value: JsonObject,
  property: string,
  path: string,
  errors: CvDataValidationError[],
): boolean =>
  !Object.hasOwn(value, property) ||
  validateString(value[property], appendPath(path, property), errors)
type Format = Extract<CvDataValidationError, { code: 'invalid-format' }>['format']
const validateFormattedString = (
  value: unknown,
  path: string,
  format: Format,
  isValid: (input: string) => boolean,
  errors: CvDataValidationError[],
): boolean => {
  if (!validateString(value, path, errors)) return false
  if (!isValid(value)) {
    errors.push({ path, code: 'invalid-format', format })
    return false
  }
  return true
}
const isLeapYear = (year: number): boolean =>
  year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
const daysInMonth = (year: number, month: number): number =>
  [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1] ?? 0
const parsePartialDate = (value: string): DateInterval | undefined => {
  const match = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(value)
  if (!match) return undefined
  const year = Number(match[1])
  const month = match[2] === undefined ? undefined : Number(match[2])
  const day = match[3] === undefined ? undefined : Number(match[3])
  if (year < 1 || year > 9999 || (month !== undefined && (month < 1 || month > 12)))
    return undefined
  if (day !== undefined && (month === undefined || day < 1 || day > daysInMonth(year, month)))
    return undefined
  const earliestMonth = month ?? 1
  const latestMonth = month ?? 12
  return {
    earliest: year * 10_000 + earliestMonth * 100 + (day ?? 1),
    latest: year * 10_000 + latestMonth * 100 + (day ?? daysInMonth(year, latestMonth)),
  }
}
const validatePartialDate = (
  value: unknown,
  path: string,
  errors: CvDataValidationError[],
): boolean =>
  validateFormattedString(
    value,
    path,
    'partial-date',
    (date) => parsePartialDate(date) !== undefined,
    errors,
  )
const isPinnedLegacyAsciiDomainUrl = (value: string): boolean => {
  const match = /^[Hh][Tt][Tt][Pp][Ss]?:\/\/([^/?#]+)(?:[/?#][\x21-\x7E]*)?$/.exec(value)
  if (!match || match[1].includes('@')) return false
  const authority = match[1]
  const colon = authority.lastIndexOf(':')
  if (colon !== authority.indexOf(':')) return false
  const hostname = colon === -1 ? authority : authority.slice(0, colon)
  const port = colon === -1 ? undefined : authority.slice(colon + 1)
  if (port !== undefined && !/^\d*$/.test(port)) return false
  if (port && Number(port) > 65_535) return false
  const domain = hostname.endsWith('.') ? hostname.slice(0, -1) : hostname
  const labels = domain.split('.')
  return (
    labels.length > 0 &&
    labels.every((label) => /^[A-Za-z0-9-]+$/.test(label)) &&
    labels.some((label) => label.toLowerCase().startsWith('xn--'))
  )
}
const isValidHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return isPinnedLegacyAsciiDomainUrl(value)
  }
}
const isValidIpv4Address = (value: string): boolean => {
  const parts = value.split('.')
  return (
    parts.length === 4 &&
    parts.every(
      (part) =>
        /^(?:0|[1-9]\d{0,2})$/.test(part) && Number(part) <= 255 && String(Number(part)) === part,
    )
  )
}
const countIpv6Groups = (tokens: readonly string[]): number | undefined => {
  let count = 0
  for (const [index, token] of tokens.entries()) {
    if (/^[0-9A-Fa-f]{1,4}$/.test(token)) {
      count += 1
      continue
    }
    if (index === tokens.length - 1 && isValidIpv4Address(token)) {
      count += 2
      continue
    }
    return undefined
  }
  return count
}
const isValidIpv6Address = (value: string): boolean => {
  const compressedParts = value.split('::')
  if (compressedParts.length > 2) return false
  const left = compressedParts[0] ? compressedParts[0].split(':') : []
  const right = compressedParts[1] ? compressedParts[1].split(':') : []
  const count = countIpv6Groups([...left, ...right])
  if (count === undefined) return false
  return compressedParts.length === 2 ? count < 8 : count === 8
}
const isValidUriAuthority = (value: string): boolean => {
  const firstAt = value.indexOf('@')
  const lastAt = value.lastIndexOf('@')
  if (firstAt !== lastAt) return false
  const hostAndPort = lastAt === -1 ? value : value.slice(lastAt + 1)
  if (lastAt !== -1 && !VALID_URI_USER_INFO.test(value.slice(0, lastAt))) return false
  if (hostAndPort.startsWith('[')) {
    const closeBracket = hostAndPort.indexOf(']')
    if (closeBracket === -1) return false
    const literal = hostAndPort.slice(1, closeBracket)
    const port = hostAndPort.slice(closeBracket + 1)
    return (
      (isValidIpv6Address(literal) || VALID_IPV_FUTURE.test(literal)) &&
      (port === '' || /^:\d*$/.test(port))
    )
  }
  const firstColon = hostAndPort.indexOf(':')
  const lastColon = hostAndPort.lastIndexOf(':')
  if (firstColon !== lastColon) return false
  const host = firstColon === -1 ? hostAndPort : hostAndPort.slice(0, firstColon)
  const port = firstColon === -1 ? undefined : hostAndPort.slice(firstColon + 1)
  return VALID_URI_REG_NAME.test(host) && (port === undefined || /^\d*$/.test(port))
}
const isValidUriPath = (value: string): boolean =>
  value.split('/').every((segment) => VALID_URI_PATH_SEGMENT.test(segment))
const isValidAbsoluteUri = (value: string): boolean => {
  const scheme = /^([A-Za-z][A-Za-z0-9+.-]*):(.*)$/.exec(value)
  if (!scheme) return false
  const afterScheme = scheme[2]
  const fragmentIndex = afterScheme.indexOf('#')
  const beforeFragment = fragmentIndex === -1 ? afterScheme : afterScheme.slice(0, fragmentIndex)
  const fragment = fragmentIndex === -1 ? undefined : afterScheme.slice(fragmentIndex + 1)
  if (fragment !== undefined && !VALID_URI_COMPONENT.test(fragment)) return false
  const queryIndex = beforeFragment.indexOf('?')
  const hierarchicalPart = queryIndex === -1 ? beforeFragment : beforeFragment.slice(0, queryIndex)
  const query = queryIndex === -1 ? undefined : beforeFragment.slice(queryIndex + 1)
  if (query !== undefined && !VALID_URI_COMPONENT.test(query)) return false
  if (!hierarchicalPart.startsWith('//')) return isValidUriPath(hierarchicalPart)
  const pathStart = hierarchicalPart.indexOf('/', 2)
  const authority =
    pathStart === -1 ? hierarchicalPart.slice(2) : hierarchicalPart.slice(2, pathStart)
  const path = pathStart === -1 ? '' : hierarchicalPart.slice(pathStart)
  return isValidUriAuthority(authority) && isValidUriPath(path)
}
const validateOptionalFormat = (
  value: JsonObject,
  property: string,
  path: string,
  format: Format,
  isValid: (input: string) => boolean,
  errors: CvDataValidationError[],
): boolean =>
  !Object.hasOwn(value, property) ||
  validateFormattedString(value[property], appendPath(path, property), format, isValid, errors)
const validateStringArray = (
  value: unknown,
  path: string,
  errors: CvDataValidationError[],
): void => {
  if (!Array.isArray(value)) {
    errors.push({ path, code: 'invalid-type', expected: 'array', actual: getActualType(value) })
    return
  }
  if (value.length === 0) {
    errors.push({ path, code: 'empty-value' })
    return
  }
  for (const [index, item] of value.entries()) validateString(item, appendPath(path, index), errors)
}
const validateOptionalStringArray = (
  value: JsonObject,
  property: string,
  path: string,
  errors: CvDataValidationError[],
): void => {
  if (Object.hasOwn(value, property))
    validateStringArray(value[property], appendPath(path, property), errors)
}
type ItemValidator = (item: unknown, path: string, errors: CvDataValidationError[]) => void
const validateObjectArray = (
  value: unknown,
  path: string,
  validateItem: ItemValidator,
  errors: CvDataValidationError[],
): void => {
  if (!Array.isArray(value)) {
    errors.push({ path, code: 'invalid-type', expected: 'array', actual: getActualType(value) })
    return
  }
  if (value.length === 0) {
    errors.push({ path, code: 'empty-value' })
    return
  }
  for (const [index, item] of value.entries()) validateItem(item, appendPath(path, index), errors)
}
const requireObject = (
  value: unknown,
  path: string,
  errors: CvDataValidationError[],
): JsonObject | undefined => {
  if (isObject(value)) return value
  errors.push({ path, code: 'invalid-type', expected: 'object', actual: getActualType(value) })
  return undefined
}
const validateLink: ItemValidator = (input, path, errors) => {
  const value = requireObject(input, path, errors)
  if (!value) return
  validateRequiredString(value, 'label', path, errors)
  const urlPath = appendPath(path, 'url')
  if (!Object.hasOwn(value, 'url')) errors.push({ path: urlPath, code: 'required' })
  else validateFormattedString(value.url, urlPath, 'http-url', isValidHttpUrl, errors)
  addUnknownFieldErrors(value, LINK_PROPERTIES, path, errors)
}
const validateSemanticReference = (
  input: unknown,
  path: string,
  errors: CvDataValidationError[],
): boolean => {
  const value = requireObject(input, path, errors)
  if (!value) return false
  const vocabularyValid = validateRequiredString(value, 'vocabulary', path, errors)
  const uriPath = appendPath(path, 'uri')
  let uriValid = false
  if (!Object.hasOwn(value, 'uri')) errors.push({ path: uriPath, code: 'required' })
  else
    uriValid = validateFormattedString(
      value.uri,
      uriPath,
      'absolute-uri',
      isValidAbsoluteUri,
      errors,
    )
  const versionValid = validateOptionalString(value, 'version', path, errors)
  addUnknownFieldErrors(value, SEMANTIC_REFERENCE_PROPERTIES, path, errors)
  return vocabularyValid && uriValid && versionValid
}
const validateDateRange = (input: unknown, path: string, errors: CvDataValidationError[]): void => {
  const value = requireObject(input, path, errors)
  if (!value) return
  const startPath = appendPath(path, 'start')
  let startValid = false
  if (!Object.hasOwn(value, 'start')) errors.push({ path: startPath, code: 'required' })
  else startValid = validatePartialDate(value.start, startPath, errors)
  const endPath = appendPath(path, 'end')
  const endValid = !Object.hasOwn(value, 'end') || validatePartialDate(value.end, endPath, errors)
  if (startValid && endValid && typeof value.start === 'string' && typeof value.end === 'string') {
    const start = parsePartialDate(value.start)
    const end = parsePartialDate(value.end)
    if (start && end && end.latest < start.earliest)
      errors.push({ path: endPath, code: 'invalid-order', relatedPath: startPath })
  }
  addUnknownFieldErrors(value, DATE_RANGE_PROPERTIES, path, errors)
}
const validatePerson = (input: unknown, path: string, errors: CvDataValidationError[]): void => {
  const value = requireObject(input, path, errors)
  if (!value) return
  validateRequiredString(value, 'name', path, errors)
  validateOptionalString(value, 'headline', path, errors)
  validateOptionalFormat(value, 'email', path, 'email', (email) => VALID_EMAIL.test(email), errors)
  validateOptionalString(value, 'phone', path, errors)
  validateOptionalString(value, 'location', path, errors)
  if (Object.hasOwn(value, 'links'))
    validateObjectArray(value.links, appendPath(path, 'links'), validateLink, errors)
  addUnknownFieldErrors(value, PERSON_PROPERTIES, path, errors)
}
const validateWork: ItemValidator = (input, path, errors) => {
  const value = requireObject(input, path, errors)
  if (!value) return
  validateRequiredString(value, 'organization', path, errors)
  validateRequiredString(value, 'position', path, errors)
  if (Object.hasOwn(value, 'positionReference'))
    validateSemanticReference(
      value.positionReference,
      appendPath(path, 'positionReference'),
      errors,
    )
  validateOptionalString(value, 'location', path, errors)
  validateOptionalFormat(value, 'url', path, 'http-url', isValidHttpUrl, errors)
  if (Object.hasOwn(value, 'dateRange'))
    validateDateRange(value.dateRange, appendPath(path, 'dateRange'), errors)
  validateOptionalString(value, 'summary', path, errors)
  validateOptionalStringArray(value, 'highlights', path, errors)
  addUnknownFieldErrors(value, WORK_PROPERTIES, path, errors)
}
const validateVolunteer: ItemValidator = (input, path, errors) => {
  const value = requireObject(input, path, errors)
  if (!value) return
  validateRequiredString(value, 'organization', path, errors)
  validateRequiredString(value, 'role', path, errors)
  validateOptionalString(value, 'location', path, errors)
  validateOptionalFormat(value, 'url', path, 'http-url', isValidHttpUrl, errors)
  if (Object.hasOwn(value, 'dateRange'))
    validateDateRange(value.dateRange, appendPath(path, 'dateRange'), errors)
  validateOptionalString(value, 'summary', path, errors)
  validateOptionalStringArray(value, 'highlights', path, errors)
  addUnknownFieldErrors(value, VOLUNTEER_PROPERTIES, path, errors)
}
const validateEducation: ItemValidator = (input, path, errors) => {
  const value = requireObject(input, path, errors)
  if (!value) return
  validateRequiredString(value, 'institution', path, errors)
  validateOptionalString(value, 'qualification', path, errors)
  if (Object.hasOwn(value, 'qualificationReference')) {
    const referenceValid = validateSemanticReference(
      value.qualificationReference,
      appendPath(path, 'qualificationReference'),
      errors,
    )
    if (referenceValid && !Object.hasOwn(value, 'qualification'))
      errors.push({
        path: appendPath(path, 'qualificationReference'),
        code: 'missing-dependent-field',
        relatedPath: appendPath(path, 'qualification'),
      })
  }
  validateOptionalString(value, 'field', path, errors)
  validateOptionalString(value, 'location', path, errors)
  validateOptionalFormat(value, 'url', path, 'http-url', isValidHttpUrl, errors)
  if (Object.hasOwn(value, 'dateRange'))
    validateDateRange(value.dateRange, appendPath(path, 'dateRange'), errors)
  validateOptionalString(value, 'score', path, errors)
  validateOptionalStringArray(value, 'highlights', path, errors)
  addUnknownFieldErrors(value, EDUCATION_PROPERTIES, path, errors)
}
const validateCertification: ItemValidator = (input, path, errors) => {
  const value = requireObject(input, path, errors)
  if (!value) return
  validateRequiredString(value, 'name', path, errors)
  validateRequiredString(value, 'issuer', path, errors)
  const datePath = appendPath(path, 'date')
  const dateValid =
    !Object.hasOwn(value, 'date') || validatePartialDate(value.date, datePath, errors)
  const expiresPath = appendPath(path, 'expires')
  if (Object.hasOwn(value, 'expires')) {
    const expiresValid = validatePartialDate(value.expires, expiresPath, errors)
    if (expiresValid && !Object.hasOwn(value, 'date'))
      errors.push({ path: expiresPath, code: 'missing-dependent-field', relatedPath: datePath })
    else if (
      dateValid &&
      expiresValid &&
      typeof value.date === 'string' &&
      typeof value.expires === 'string'
    ) {
      const date = parsePartialDate(value.date)
      const expires = parsePartialDate(value.expires)
      if (date && expires && expires.latest < date.earliest)
        errors.push({ path: expiresPath, code: 'invalid-order', relatedPath: datePath })
    }
  }
  validateOptionalString(value, 'credentialId', path, errors)
  validateOptionalFormat(value, 'url', path, 'http-url', isValidHttpUrl, errors)
  addUnknownFieldErrors(value, CERTIFICATION_PROPERTIES, path, errors)
}
const validateProject: ItemValidator = (input, path, errors) => {
  const value = requireObject(input, path, errors)
  if (!value) return
  validateRequiredString(value, 'name', path, errors)
  validateOptionalString(value, 'role', path, errors)
  validateOptionalFormat(value, 'url', path, 'http-url', isValidHttpUrl, errors)
  if (Object.hasOwn(value, 'dateRange'))
    validateDateRange(value.dateRange, appendPath(path, 'dateRange'), errors)
  validateOptionalString(value, 'summary', path, errors)
  validateOptionalStringArray(value, 'highlights', path, errors)
  addUnknownFieldErrors(value, PROJECT_PROPERTIES, path, errors)
}
const validatePublication: ItemValidator = (input, path, errors) => {
  const value = requireObject(input, path, errors)
  if (!value) return
  validateRequiredString(value, 'name', path, errors)
  validateOptionalStringArray(value, 'authors', path, errors)
  validateOptionalString(value, 'publisher', path, errors)
  if (Object.hasOwn(value, 'date'))
    validatePartialDate(value.date, appendPath(path, 'date'), errors)
  validateOptionalFormat(value, 'url', path, 'http-url', isValidHttpUrl, errors)
  validateOptionalString(value, 'summary', path, errors)
  addUnknownFieldErrors(value, PUBLICATION_PROPERTIES, path, errors)
}
const validateSkill: ItemValidator = (input, path, errors) => {
  const value = requireObject(input, path, errors)
  if (!value) return
  validateRequiredString(value, 'name', path, errors)
  if (Object.hasOwn(value, 'skillReference'))
    validateSemanticReference(value.skillReference, appendPath(path, 'skillReference'), errors)
  validateOptionalString(value, 'level', path, errors)
  validateOptionalStringArray(value, 'keywords', path, errors)
  addUnknownFieldErrors(value, SKILL_PROPERTIES, path, errors)
}
const validateLanguage: ItemValidator = (input, path, errors) => {
  const value = requireObject(input, path, errors)
  if (!value) return
  validateRequiredString(value, 'name', path, errors)
  validateOptionalFormat(
    value,
    'code',
    path,
    'bcp47',
    (code) => VALID_LANGUAGE_TAG.test(code),
    errors,
  )
  validateOptionalString(value, 'fluency', path, errors)
  addUnknownFieldErrors(value, LANGUAGE_PROPERTIES, path, errors)
}
const validateAward: ItemValidator = (input, path, errors) => {
  const value = requireObject(input, path, errors)
  if (!value) return
  validateRequiredString(value, 'title', path, errors)
  validateOptionalString(value, 'issuer', path, errors)
  if (Object.hasOwn(value, 'date'))
    validatePartialDate(value.date, appendPath(path, 'date'), errors)
  validateOptionalString(value, 'summary', path, errors)
  addUnknownFieldErrors(value, AWARD_PROPERTIES, path, errors)
}
const addInvalidJsonError = (
  path: string,
  actual: CvActualType,
  errors: CvDataValidationError[],
): void => {
  errors.push({ path, code: 'invalid-type', expected: 'json-value', actual })
}
const isJsonRecord = (value: JsonObject): boolean => {
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

const validateJsonArray = (
  value: unknown[],
  path: string,
  errors: CvDataValidationError[],
  ancestors: WeakSet<object>,
): void => {
  if (ancestors.has(value)) {
    addInvalidJsonError(path, 'array', errors)
    return
  }
  ancestors.add(value)
  for (const [index, item] of value.entries())
    validateJsonValue(item, appendPath(path, index), errors, ancestors)
  ancestors.delete(value)
}

const validateJsonObject = (
  value: JsonObject,
  path: string,
  errors: CvDataValidationError[],
  ancestors: WeakSet<object>,
): void => {
  if (ancestors.has(value)) {
    addInvalidJsonError(path, 'object', errors)
    return
  }
  if (!isJsonRecord(value)) {
    addInvalidJsonError(path, 'object', errors)
    return
  }
  ancestors.add(value)
  for (const property of sortedKeys(value))
    validateJsonValue(value[property], appendPath(path, property), errors, ancestors)
  ancestors.delete(value)
}

const validateJsonValue = (
  value: unknown,
  path: string,
  errors: CvDataValidationError[],
  ancestors: WeakSet<object>,
): void => {
  if (
    value === null ||
    typeof value === 'boolean' ||
    typeof value === 'string' ||
    (typeof value === 'number' && Number.isFinite(value))
  )
    return
  if (Array.isArray(value)) {
    validateJsonArray(value, path, errors, ancestors)
    return
  }
  if (isObject(value)) {
    validateJsonObject(value, path, errors, ancestors)
    return
  }
  addInvalidJsonError(path, getActualType(value), errors)
}
const validateExtensions = (
  input: unknown,
  path: string,
  errors: CvDataValidationError[],
): void => {
  const value = requireObject(input, path, errors)
  if (!value) return
  const namespaces = sortedKeys(value)
  for (const namespace of namespaces) {
    const namespacePath = appendPath(path, namespace)
    const payload = value[namespace]
    if (!VALID_EXTENSION_NAMESPACE.test(namespace))
      errors.push({ path: namespacePath, code: 'invalid-format', format: 'extension-namespace' })
    if (!isObject(payload))
      errors.push({
        path: namespacePath,
        code: 'invalid-type',
        expected: 'object',
        actual: getActualType(payload),
      })
    else if (!isJsonRecord(payload)) addInvalidJsonError(namespacePath, 'object', errors)
    else {
      const ancestors = new WeakSet<object>([payload])
      for (const property of sortedKeys(payload))
        validateJsonValue(payload[property], appendPath(namespacePath, property), errors, ancestors)
    }
  }
}
const validateOptionalObjectArray = (
  input: JsonObject,
  property: string,
  validateItem: ItemValidator,
  errors: CvDataValidationError[],
): void => {
  if (Object.hasOwn(input, property))
    validateObjectArray(input[property], appendPath('', property), validateItem, errors)
}
const validateCvDataV1Input = (
  input: unknown,
): CvValidationResult<CvDataV1, CvDataValidationError> => {
  if (!isObject(input))
    return {
      success: false,
      errors: [
        { path: '', code: 'invalid-type', expected: 'object', actual: getActualType(input) },
      ],
    }
  const errors: CvDataValidationError[] = []
  if (!Object.hasOwn(input, 'schemaVersion'))
    errors.push({ path: '/schemaVersion', code: 'required' })
  else if (typeof input.schemaVersion !== 'string')
    errors.push({
      path: '/schemaVersion',
      code: 'invalid-type',
      expected: 'string',
      actual: getActualType(input.schemaVersion),
    })
  else if (input.schemaVersion !== '1')
    errors.push({
      path: '/schemaVersion',
      code: 'invalid-literal',
      expected: '1',
      actual: input.schemaVersion,
    })
  if (!Object.hasOwn(input, 'language')) errors.push({ path: '/language', code: 'required' })
  else
    validateFormattedString(
      input.language,
      '/language',
      'bcp47',
      (language) => VALID_LANGUAGE_TAG.test(language),
      errors,
    )
  if (!Object.hasOwn(input, 'person')) errors.push({ path: '/person', code: 'required' })
  else validatePerson(input.person, '/person', errors)
  validateOptionalString(input, 'summary', '', errors)
  validateOptionalObjectArray(input, 'work', validateWork, errors)
  validateOptionalObjectArray(input, 'education', validateEducation, errors)
  validateOptionalObjectArray(input, 'projects', validateProject, errors)
  validateOptionalObjectArray(input, 'skills', validateSkill, errors)
  validateOptionalObjectArray(input, 'languages', validateLanguage, errors)
  validateOptionalObjectArray(input, 'certifications', validateCertification, errors)
  validateOptionalObjectArray(input, 'awards', validateAward, errors)
  validateOptionalObjectArray(input, 'volunteer', validateVolunteer, errors)
  validateOptionalObjectArray(input, 'publications', validatePublication, errors)
  if (Object.hasOwn(input, 'extensions'))
    validateExtensions(input.extensions, '/extensions', errors)
  addUnknownFieldErrors(input, ROOT_PROPERTIES, '', errors)
  return errors.length > 0 ? { success: false, errors } : { success: true, data: input as CvDataV1 }
}
export const validateCvDataV1 = (
  input: unknown,
): CvValidationResult<CvDataV1, CvDataValidationError> => {
  try {
    return validateCvDataV1Input(input)
  } catch {
    return {
      success: false,
      errors: [{ path: '', code: 'invalid-type', expected: 'json-value', actual: typeof input }],
    }
  }
}

type FidelityTextLimit = Exclude<keyof CvFidelityEnvelopeV1['textLimits'], 'unbrokenText'>
type FidelityCollectionLimit = keyof CvFidelityEnvelopeV1['collectionLimits']
export const validateCvFidelityEnvelopeV1 = (
  input: CvDataV1,
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: The specified traversal order is explicit.
): CvValidationResult<CvDataV1, CvFidelityError> => {
  const errors: CvFidelityError[] = []
  let authoredText = 0
  let highlights = 0
  let records = 0
  const addText = (value: string, path: string, textLimit?: FidelityTextLimit): void => {
    const graphemes = countGraphemes(value)
    authoredText += graphemes
    if (textLimit) {
      const limit = CV_FIDELITY_ENVELOPE_V1.textLimits[textLimit]
      if (graphemes > limit) errors.push({ path, code: 'text-length', limit, actual: graphemes })
    }
    const unbrokenText = countLargestUnbrokenText(value)
    const unbrokenLimit = CV_FIDELITY_ENVELOPE_V1.textLimits.unbrokenText
    if (unbrokenText > unbrokenLimit)
      errors.push({ path, code: 'unbroken-text', limit: unbrokenLimit, actual: unbrokenText })
  }
  const addOptionalText = (
    value: string | undefined,
    path: string,
    textLimit?: FidelityTextLimit,
  ): void => {
    if (value !== undefined) addText(value, path, textLimit)
  }
  const addCollection = (
    value: readonly unknown[] | undefined,
    path: string,
    collectionLimit: FidelityCollectionLimit,
  ): void => {
    if (!value) return
    const limit = CV_FIDELITY_ENVELOPE_V1.collectionLimits[collectionLimit]
    if (value.length > limit)
      errors.push({ path, code: 'array-count', limit, actual: value.length })
  }
  const addDateRange = (value: CvDateRangeV1 | undefined, path: string): void => {
    if (!value) return
    addText(value.start, `${path}/start`)
    addOptionalText(value.end, `${path}/end`)
  }
  const addHighlightCollection = (value: readonly string[] | undefined, path: string): void => {
    if (!value) return
    addCollection(value, path, 'recordHighlights')
    highlights += value.length
    for (const [index, highlight] of value.entries())
      addText(highlight, `${path}/${index}`, 'highlight')
  }

  addText(input.person.name, '/person/name', 'nameOrTitle')
  addOptionalText(input.person.headline, '/person/headline', 'nameOrTitle')
  addOptionalText(input.person.email, '/person/email', 'label')
  addOptionalText(input.person.phone, '/person/phone', 'label')
  addOptionalText(input.person.location, '/person/location', 'label')
  addCollection(input.person.links, '/person/links', 'personLinks')
  for (const [index, link] of input.person.links?.entries() ?? [])
    addText(link.label, `/person/links/${index}/label`, 'label')
  addOptionalText(input.summary, '/summary', 'profileSummary')

  addCollection(input.work, '/work', 'work')
  records += input.work?.length ?? 0
  for (const [index, work] of input.work?.entries() ?? []) {
    const path = `/work/${index}`
    addText(work.organization, `${path}/organization`, 'nameOrTitle')
    addText(work.position, `${path}/position`, 'nameOrTitle')
    addOptionalText(work.location, `${path}/location`, 'label')
    addDateRange(work.dateRange, `${path}/dateRange`)
    addOptionalText(work.summary, `${path}/summary`, 'entrySummary')
    addHighlightCollection(work.highlights, `${path}/highlights`)
  }
  addCollection(input.education, '/education', 'education')
  records += input.education?.length ?? 0
  for (const [index, education] of input.education?.entries() ?? []) {
    const path = `/education/${index}`
    addText(education.institution, `${path}/institution`, 'nameOrTitle')
    addOptionalText(education.qualification, `${path}/qualification`, 'nameOrTitle')
    addOptionalText(education.field, `${path}/field`, 'nameOrTitle')
    addOptionalText(education.location, `${path}/location`, 'label')
    addDateRange(education.dateRange, `${path}/dateRange`)
    addOptionalText(education.score, `${path}/score`, 'compact')
    addHighlightCollection(education.highlights, `${path}/highlights`)
  }
  addCollection(input.projects, '/projects', 'projects')
  records += input.projects?.length ?? 0
  for (const [index, project] of input.projects?.entries() ?? []) {
    const path = `/projects/${index}`
    addText(project.name, `${path}/name`, 'nameOrTitle')
    addOptionalText(project.role, `${path}/role`, 'nameOrTitle')
    addDateRange(project.dateRange, `${path}/dateRange`)
    addOptionalText(project.summary, `${path}/summary`, 'entrySummary')
    addHighlightCollection(project.highlights, `${path}/highlights`)
  }
  addCollection(input.skills, '/skills', 'skills')
  records += input.skills?.length ?? 0
  for (const [index, skill] of input.skills?.entries() ?? []) {
    const path = `/skills/${index}`
    addText(skill.name, `${path}/name`, 'nameOrTitle')
    addOptionalText(skill.level, `${path}/level`, 'compact')
    addCollection(skill.keywords, `${path}/keywords`, 'skillKeywords')
    for (const [keywordIndex, keyword] of skill.keywords?.entries() ?? [])
      addText(keyword, `${path}/keywords/${keywordIndex}`, 'compact')
  }
  addCollection(input.languages, '/languages', 'languages')
  records += input.languages?.length ?? 0
  for (const [index, language] of input.languages?.entries() ?? []) {
    const path = `/languages/${index}`
    addText(language.name, `${path}/name`, 'nameOrTitle')
    addOptionalText(language.fluency, `${path}/fluency`, 'compact')
  }
  addCollection(input.certifications, '/certifications', 'certifications')
  records += input.certifications?.length ?? 0
  for (const [index, certification] of input.certifications?.entries() ?? []) {
    const path = `/certifications/${index}`
    addText(certification.name, `${path}/name`, 'nameOrTitle')
    addText(certification.issuer, `${path}/issuer`, 'nameOrTitle')
    addOptionalText(certification.date, `${path}/date`)
    addOptionalText(certification.expires, `${path}/expires`)
    addOptionalText(certification.credentialId, `${path}/credentialId`, 'label')
  }
  addCollection(input.awards, '/awards', 'awards')
  records += input.awards?.length ?? 0
  for (const [index, award] of input.awards?.entries() ?? []) {
    const path = `/awards/${index}`
    addText(award.title, `${path}/title`, 'nameOrTitle')
    addOptionalText(award.issuer, `${path}/issuer`, 'nameOrTitle')
    addOptionalText(award.date, `${path}/date`)
    addOptionalText(award.summary, `${path}/summary`, 'entrySummary')
  }
  addCollection(input.volunteer, '/volunteer', 'volunteer')
  records += input.volunteer?.length ?? 0
  for (const [index, volunteer] of input.volunteer?.entries() ?? []) {
    const path = `/volunteer/${index}`
    addText(volunteer.organization, `${path}/organization`, 'nameOrTitle')
    addText(volunteer.role, `${path}/role`, 'nameOrTitle')
    addOptionalText(volunteer.location, `${path}/location`, 'label')
    addDateRange(volunteer.dateRange, `${path}/dateRange`)
    addOptionalText(volunteer.summary, `${path}/summary`, 'entrySummary')
    addHighlightCollection(volunteer.highlights, `${path}/highlights`)
  }
  addCollection(input.publications, '/publications', 'publications')
  records += input.publications?.length ?? 0
  for (const [index, publication] of input.publications?.entries() ?? []) {
    const path = `/publications/${index}`
    addText(publication.name, `${path}/name`, 'nameOrTitle')
    addCollection(publication.authors, `${path}/authors`, 'publicationAuthors')
    for (const [authorIndex, author] of publication.authors?.entries() ?? [])
      addText(author, `${path}/authors/${authorIndex}`, 'nameOrTitle')
    addOptionalText(publication.publisher, `${path}/publisher`, 'nameOrTitle')
    addOptionalText(publication.date, `${path}/date`)
    addOptionalText(publication.summary, `${path}/summary`, 'entrySummary')
  }

  const recordLimit = CV_FIDELITY_ENVELOPE_V1.documentLimits.records
  if (records > recordLimit)
    errors.push({ path: '', code: 'record-count', limit: recordLimit, actual: records })
  const highlightLimit = CV_FIDELITY_ENVELOPE_V1.documentLimits.highlights
  if (highlights > highlightLimit)
    errors.push({ path: '', code: 'highlight-count', limit: highlightLimit, actual: highlights })
  const authoredTextLimit = CV_FIDELITY_ENVELOPE_V1.documentLimits.authoredText
  if (authoredText > authoredTextLimit)
    errors.push({ path: '', code: 'authored-text', limit: authoredTextLimit, actual: authoredText })
  return errors.length > 0 ? { success: false, errors } : { success: true, data: input }
}

const ENGLISH_LABELS = {
  summary: 'Profile',
  work: 'Experience',
  education: 'Education',
  projects: 'Projects',
  skills: 'Skills',
  languages: 'Languages',
  certifications: 'Certifications',
  awards: 'Awards',
  volunteer: 'Volunteer',
  publications: 'Publications',
  present: 'Present',
} as const satisfies CvLabelsV1
const FRENCH_LABELS = {
  summary: 'Profil',
  work: 'Expérience',
  education: 'Formation',
  projects: 'Projets',
  skills: 'Compétences',
  languages: 'Langues',
  certifications: 'Certifications',
  awards: 'Distinctions',
  volunteer: 'Bénévolat',
  publications: 'Publications',
  present: 'Aujourd’hui',
} as const satisfies CvLabelsV1
const selectLanguage = (language: unknown): 'en' | 'fr' => {
  if (typeof language !== 'string' || !VALID_LANGUAGE_TAG.test(language)) return 'en'
  const normalized = language.replace(/[A-Z]/g, (character) => character.toLowerCase())
  return normalized === 'fr' || normalized.startsWith('fr-') ? 'fr' : 'en'
}
export const getCvLabelsV1 = (language: string): CvLabelsV1 =>
  selectLanguage(language) === 'fr' ? FRENCH_LABELS : ENGLISH_LABELS
const ENGLISH_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const
const FRENCH_MONTHS = [
  'janv.',
  'févr.',
  'mars',
  'avr.',
  'mai',
  'juin',
  'juil.',
  'août',
  'sept.',
  'oct.',
  'nov.',
  'déc.',
] as const
export const formatCvPartialDateV1 = (date: CvPartialDateV1, language: string): string => {
  if (typeof date !== 'string' || typeof language !== 'string' || !parsePartialDate(date))
    throw new RangeError('Invalid partial date')
  const [year, monthText, dayText] = date.split('-')
  if (!monthText) return year
  const isFrench = selectLanguage(language) === 'fr'
  const monthName = (isFrench ? FRENCH_MONTHS : ENGLISH_MONTHS)[Number(monthText) - 1]
  if (!dayText) return `${monthName} ${year}`
  return isFrench
    ? `${Number(dayText)} ${monthName} ${year}`
    : `${monthName} ${Number(dayText)}, ${year}`
}
export const formatCvDateRangeV1 = (range: CvDateRangeV1, language: string): string => {
  if (!isObject(range) || typeof language !== 'string' || typeof range.start !== 'string')
    throw new RangeError('Invalid date range')
  const start = parsePartialDate(range.start)
  const hasEnd = Object.hasOwn(range, 'end')
  const endValue = range.end
  const end = hasEnd && typeof endValue === 'string' ? parsePartialDate(endValue) : undefined
  if (!start || (hasEnd && !end) || (end && end.latest < start.earliest))
    throw new RangeError('Invalid date range')
  const formattedStart = formatCvPartialDateV1(range.start, language)
  const formattedEnd =
    typeof endValue === 'string'
      ? formatCvPartialDateV1(endValue, language)
      : getCvLabelsV1(language).present
  return `${formattedStart}${selectLanguage(language) === 'fr' ? ' à ' : ' to '}${formattedEnd}`
}
