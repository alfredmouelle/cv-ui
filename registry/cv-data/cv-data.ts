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
