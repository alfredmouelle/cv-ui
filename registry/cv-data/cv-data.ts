export type CvLinkV1 = {
  readonly label: string
  readonly url: string
}

export type CvPersonV1 = {
  readonly name: string
  readonly headline?: string
  readonly email?: string
  readonly phone?: string
  readonly location?: string
  readonly links?: readonly CvLinkV1[]
}

export type CvDataV1 = {
  readonly schemaVersion: '1'
  readonly language: string
  readonly person: CvPersonV1
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

export const CV_DATA_V1_SCHEMA = {
  $id: 'https://cv-ui.alfredmouelle.com/schemas/cv-data/v1.json',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  additionalProperties: false,
  required: ['schemaVersion', 'language', 'person'],
  properties: {
    schemaVersion: { const: '1' },
    language: { type: 'string', pattern: NON_WHITESPACE_PATTERN },
    person: { $ref: '#/$defs/person' },
  },
  $defs: {
    person: {
      type: 'object',
      additionalProperties: false,
      required: ['name'],
      properties: {
        name: { type: 'string', pattern: NON_WHITESPACE_PATTERN },
        headline: { type: 'string', pattern: NON_WHITESPACE_PATTERN },
        email: { type: 'string', pattern: NON_WHITESPACE_PATTERN },
        phone: { type: 'string', pattern: NON_WHITESPACE_PATTERN },
        location: { type: 'string', pattern: NON_WHITESPACE_PATTERN },
        links: {
          type: 'array',
          minItems: 1,
          items: { $ref: '#/$defs/link' },
        },
      },
    },
    link: {
      type: 'object',
      additionalProperties: false,
      required: ['label', 'url'],
      properties: {
        label: { type: 'string', pattern: NON_WHITESPACE_PATTERN },
        url: { type: 'string', pattern: NON_WHITESPACE_PATTERN },
      },
    },
  },
} as const

const ROOT_PROPERTIES = ['schemaVersion', 'language', 'person'] as const
const PERSON_PROPERTIES = ['name', 'headline', 'email', 'phone', 'location', 'links'] as const
const LINK_PROPERTIES = ['label', 'url'] as const
const HAS_NON_WHITESPACE = new RegExp(NON_WHITESPACE_PATTERN, 'u')

type JsonObject = Record<string, unknown>

const getActualType = (value: unknown): CvActualType => {
  if (value === null) {
    return 'null'
  }
  if (Array.isArray(value)) {
    return 'array'
  }
  if (typeof value === 'number' && !Number.isFinite(value)) {
    return 'non-finite-number'
  }
  return typeof value
}

const isObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isEmptyString = (value: string) => !HAS_NON_WHITESPACE.test(value)

const escapePointerSegment = (segment: string) =>
  segment.replaceAll('~', '~0').replaceAll('/', '~1')

const appendPath = (path: string, segment: string | number) =>
  `${path}/${escapePointerSegment(String(segment))}`

const compareByScalarValue = (left: string, right: string) => {
  const leftScalars = Array.from(left, (character) => character.codePointAt(0) ?? 0)
  const rightScalars = Array.from(right, (character) => character.codePointAt(0) ?? 0)
  const length = Math.min(leftScalars.length, rightScalars.length)

  for (let index = 0; index < length; index += 1) {
    const difference = leftScalars[index] - rightScalars[index]
    if (difference !== 0) {
      return difference
    }
  }

  return leftScalars.length - rightScalars.length
}

const addUnknownFieldErrors = (
  value: JsonObject,
  knownProperties: readonly string[],
  path: string,
  errors: CvDataValidationError[],
) => {
  const known = new Set(knownProperties)
  const unknownProperties = Object.keys(value)
    .filter((property) => !known.has(property))
    .sort(compareByScalarValue)

  for (const property of unknownProperties) {
    errors.push({ path: appendPath(path, property), code: 'unexpected-field' })
  }
}

const validateString = (value: unknown, path: string, errors: CvDataValidationError[]) => {
  if (typeof value !== 'string') {
    errors.push({ path, code: 'invalid-type', expected: 'string', actual: getActualType(value) })
    return
  }
  if (isEmptyString(value)) {
    errors.push({ path, code: 'empty-value' })
  }
}

const validateRequiredString = (
  value: JsonObject,
  property: string,
  path: string,
  errors: CvDataValidationError[],
) => {
  const propertyPath = appendPath(path, property)
  if (!Object.hasOwn(value, property)) {
    errors.push({ path: propertyPath, code: 'required' })
    return
  }
  validateString(value[property], propertyPath, errors)
}

const validateOptionalString = (
  value: JsonObject,
  property: string,
  path: string,
  errors: CvDataValidationError[],
) => {
  if (Object.hasOwn(value, property)) {
    validateString(value[property], appendPath(path, property), errors)
  }
}

const validateLink = (value: unknown, path: string, errors: CvDataValidationError[]) => {
  if (!isObject(value)) {
    errors.push({ path, code: 'invalid-type', expected: 'object', actual: getActualType(value) })
    return
  }

  validateRequiredString(value, 'label', path, errors)
  validateRequiredString(value, 'url', path, errors)
  addUnknownFieldErrors(value, LINK_PROPERTIES, path, errors)
}

const validateLinks = (value: unknown, path: string, errors: CvDataValidationError[]) => {
  if (!Array.isArray(value)) {
    errors.push({ path, code: 'invalid-type', expected: 'array', actual: getActualType(value) })
    return
  }
  if (value.length === 0) {
    errors.push({ path, code: 'empty-value' })
    return
  }
  for (const [index, link] of value.entries()) {
    validateLink(link, appendPath(path, index), errors)
  }
}

const validatePerson = (value: unknown, path: string, errors: CvDataValidationError[]) => {
  if (!isObject(value)) {
    errors.push({ path, code: 'invalid-type', expected: 'object', actual: getActualType(value) })
    return
  }

  validateRequiredString(value, 'name', path, errors)
  validateOptionalString(value, 'headline', path, errors)
  validateOptionalString(value, 'email', path, errors)
  validateOptionalString(value, 'phone', path, errors)
  validateOptionalString(value, 'location', path, errors)
  if (Object.hasOwn(value, 'links')) {
    validateLinks(value.links, appendPath(path, 'links'), errors)
  }
  addUnknownFieldErrors(value, PERSON_PROPERTIES, path, errors)
}

const validateCvDataV1Input = (
  input: unknown,
): CvValidationResult<CvDataV1, CvDataValidationError> => {
  if (!isObject(input)) {
    return {
      success: false,
      errors: [
        { path: '', code: 'invalid-type', expected: 'object', actual: getActualType(input) },
      ],
    }
  }

  const errors: CvDataValidationError[] = []

  if (!Object.hasOwn(input, 'schemaVersion')) {
    errors.push({ path: '/schemaVersion', code: 'required' })
  } else if (typeof input.schemaVersion !== 'string') {
    errors.push({
      path: '/schemaVersion',
      code: 'invalid-type',
      expected: 'string',
      actual: getActualType(input.schemaVersion),
    })
  } else if (input.schemaVersion !== '1') {
    errors.push({
      path: '/schemaVersion',
      code: 'invalid-literal',
      expected: '1',
      actual: input.schemaVersion,
    })
  }

  validateRequiredString(input, 'language', '', errors)

  if (!Object.hasOwn(input, 'person')) {
    errors.push({ path: '/person', code: 'required' })
  } else {
    validatePerson(input.person, '/person', errors)
  }

  addUnknownFieldErrors(input, ROOT_PROPERTIES, '', errors)

  if (errors.length > 0) {
    return { success: false, errors }
  }

  return { success: true, data: input as CvDataV1 }
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
