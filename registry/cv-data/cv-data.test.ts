import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, expectTypeOf, it } from 'vitest'

import {
  CV_DATA_V1_SCHEMA,
  CV_SECTION_IDS_V1,
  type CvData,
  type CvDataV1,
  type CvDataValidationError,
  type CvDataValidationErrorCode,
  type CvLabelsV1,
  type CvLinkV1,
  type CvPersonV1,
  type CvSectionIdV1,
  type CvValidationResult,
  formatCvDateRangeV1,
  formatCvPartialDateV1,
  getCvLabelsV1,
  validateCvDataV1,
} from './cv-data'

const minimum = {
  schemaVersion: '1',
  language: 'en',
  person: { name: 'A' },
} as const

describe('validateCvDataV1', () => {
  it('returns the exact minimum document reference', () => {
    const result = validateCvDataV1(minimum)

    expect(result).toEqual({ success: true, data: minimum })
    if (result.success) {
      expect(result.data).toBe(minimum)
    }
  })

  it('exposes the minimum public contracts', () => {
    expectTypeOf<CvData>().toEqualTypeOf<CvDataV1>()
    expectTypeOf<CvPersonV1>().toMatchObjectType<{ readonly name: string }>()
    expectTypeOf<CvLinkV1>().toEqualTypeOf<{
      readonly label: string
      readonly url: string
    }>()
    expectTypeOf<CvSectionIdV1>().toEqualTypeOf<(typeof CV_SECTION_IDS_V1)[number]>()
    expectTypeOf<CvDataValidationErrorCode>().toEqualTypeOf<CvDataValidationError['code']>()
    expectTypeOf<CvValidationResult<CvDataV1, CvDataValidationError>>().toMatchTypeOf<
      ReturnType<typeof validateCvDataV1>
    >()
    expect(CV_SECTION_IDS_V1).toEqual([
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
    ])
  })

  it('reports missing fields in contract order', () => {
    expect(validateCvDataV1({})).toEqual({
      success: false,
      errors: [
        { path: '/schemaVersion', code: 'required' },
        { path: '/language', code: 'required' },
        { path: '/person', code: 'required' },
      ],
    })
  })

  it('suppresses checks below values with the wrong type', () => {
    expect(
      validateCvDataV1({ schemaVersion: 1, language: null, person: ['not', 'an', 'object'] }),
    ).toEqual({
      success: false,
      errors: [
        { path: '/schemaVersion', code: 'invalid-type', expected: 'string', actual: 'number' },
        { path: '/language', code: 'invalid-type', expected: 'string', actual: 'null' },
        { path: '/person', code: 'invalid-type', expected: 'object', actual: 'array' },
      ],
    })
  })

  it('reports wrong literals and empty values without changing them', () => {
    const input = {
      schemaVersion: '',
      language: '\u2003',
      person: { name: '  ', links: [] },
    }

    expect(validateCvDataV1(input)).toEqual({
      success: false,
      errors: [
        { path: '/schemaVersion', code: 'invalid-literal', expected: '1', actual: '' },
        { path: '/language', code: 'empty-value' },
        { path: '/person/name', code: 'empty-value' },
        { path: '/person/links', code: 'empty-value' },
      ],
    })
    expect(input).toEqual({
      schemaVersion: '',
      language: '\u2003',
      person: { name: '  ', links: [] },
    })
  })

  it('walks known properties, array items, then unknown properties', () => {
    const input = {
      z: true,
      person: {
        z: true,
        links: [{ z: true, url: '', label: 0 }, { url: 1 }],
        name: '',
      },
      language: '',
      schemaVersion: '2',
      a: true,
    }

    expect(validateCvDataV1(input)).toEqual({
      success: false,
      errors: [
        { path: '/schemaVersion', code: 'invalid-literal', expected: '1', actual: '2' },
        { path: '/language', code: 'empty-value' },
        { path: '/person/name', code: 'empty-value' },
        {
          path: '/person/links/0/label',
          code: 'invalid-type',
          expected: 'string',
          actual: 'number',
        },
        { path: '/person/links/0/url', code: 'empty-value' },
        { path: '/person/links/0/z', code: 'unexpected-field' },
        { path: '/person/links/1/label', code: 'required' },
        {
          path: '/person/links/1/url',
          code: 'invalid-type',
          expected: 'string',
          actual: 'number',
        },
        { path: '/person/z', code: 'unexpected-field' },
        { path: '/a', code: 'unexpected-field' },
        { path: '/z', code: 'unexpected-field' },
      ],
    })
  })

  it('sorts unknown fields by Unicode scalar value and escapes JSON Pointer paths', () => {
    expect(
      validateCvDataV1({
        ...minimum,
        '\ud83d\ude00': true,
        '\ue000': true,
        '/': true,
        '~': true,
      }),
    ).toEqual({
      success: false,
      errors: [
        { path: '/~1', code: 'unexpected-field' },
        { path: '/~0', code: 'unexpected-field' },
        { path: '/\ue000', code: 'unexpected-field' },
        { path: '/\ud83d\ude00', code: 'unexpected-field' },
      ],
    })
  })

  it.each([null, undefined, true, 1, Number.NaN, 1n, Symbol('cv'), () => minimum])(
    'returns an error instead of throwing for %s',
    (input) => {
      expect(() => validateCvDataV1(input)).not.toThrow()
      expect(validateCvDataV1(input)).toEqual({
        success: false,
        errors: [
          {
            path: '',
            code: 'invalid-type',
            expected: 'object',
            actual:
              typeof input === 'number' && !Number.isFinite(input)
                ? 'non-finite-number'
                : Array.isArray(input)
                  ? 'array'
                  : input === null
                    ? 'null'
                    : typeof input,
          },
        ],
      })
    },
  )

  it('returns an error when an invalid object cannot be inspected', () => {
    const throwingAccessor = Object.defineProperty(
      { language: 'en', person: { name: 'A' } },
      'schemaVersion',
      {
        enumerable: true,
        get: () => {
          throw new Error('unreadable')
        },
      },
    )
    const revoked = Proxy.revocable(minimum, {})
    revoked.revoke()

    for (const input of [throwingAccessor, revoked.proxy]) {
      expect(() => validateCvDataV1(input)).not.toThrow()
      expect(validateCvDataV1(input)).toEqual({
        success: false,
        errors: [{ path: '', code: 'invalid-type', expected: 'json-value', actual: 'object' }],
      })
    }
  })
})

describe('CV_DATA_V1_SCHEMA', () => {
  it('matches the standalone closed minimum schema', () => {
    const schemaPath = fileURLToPath(new URL('../../schemas/cv-data/v1.json', import.meta.url))
    const standaloneSchema: unknown = JSON.parse(readFileSync(schemaPath, 'utf8'))

    expect(standaloneSchema).toEqual(CV_DATA_V1_SCHEMA)
    expect(CV_DATA_V1_SCHEMA).toMatchObject({
      $id: 'https://cv-ui.alfredmouelle.com/schemas/cv-data/v1.json',
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      required: ['schemaVersion', 'language', 'person'],
      properties: {
        schemaVersion: { const: '1' },
        language: { type: 'string' },
        person: { $ref: '#/$defs/person' },
      },
      $defs: {
        person: {
          type: 'object',
          additionalProperties: false,
          required: ['name'],
        },
        link: {
          type: 'object',
          additionalProperties: false,
          required: ['label', 'url'],
        },
      },
    })
  })
})

describe('complete CV Data V1', () => {
  it('accepts every core section and an opaque JSON extension', () => {
    const input = {
      schemaVersion: '1',
      language: 'fr-CM',
      person: {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        links: [{ label: 'Web', url: 'https://example.com' }],
      },
      summary: 'Ingénieure',
      work: [
        {
          organization: 'Example',
          position: 'Engineer',
          positionReference: {
            vocabulary: 'ESCO',
            uri: 'https://data.europa.eu/esco/occupation/1#entry',
          },
          dateRange: { start: '2024-01', end: '2024-12' },
          highlights: ['Built it'],
        },
      ],
      education: [{ institution: 'School', qualification: 'BSc' }],
      projects: [{ name: 'Compiler' }],
      skills: [{ name: 'TypeScript', keywords: ['Types'] }],
      languages: [{ name: 'French', code: 'fr-CM' }],
      certifications: [{ name: 'Certificate', issuer: 'Issuer', date: '2024' }],
      awards: [{ title: 'Prize' }],
      volunteer: [{ organization: 'Community', role: 'Mentor' }],
      publications: [{ name: 'Paper', authors: ['Ada'] }],
      extensions: { 'com.example.cv': { enabled: true, values: [null, 1, 'x'] } },
    } as const

    const result = validateCvDataV1(input)

    expect(result).toEqual({ success: true, data: input })
    if (result.success) {
      expect(result.data).toBe(input)
    }
  })

  it('reports format, dependency, order, extension, and unknown-field errors in traversal order', () => {
    expect(
      validateCvDataV1({
        ...minimum,
        language: 'not_a_tag',
        person: { name: 'A', email: 'a@', links: [{ label: 'Web', url: 'ftp://example.com' }] },
        education: [
          {
            institution: 'School',
            qualificationReference: { vocabulary: 'ESCO', uri: 'relative' },
          },
        ],
        certifications: [{ name: 'C', issuer: 'I', expires: '2023' }],
        projects: [{ name: 'P', dateRange: { start: '2024', end: '2023-12-31' } }],
        extensions: { invalid: {}, 'com.example.valid': { value: undefined } },
        extra: true,
      }),
    ).toEqual({
      success: false,
      errors: [
        { path: '/language', code: 'invalid-format', format: 'bcp47' },
        { path: '/person/email', code: 'invalid-format', format: 'email' },
        { path: '/person/links/0/url', code: 'invalid-format', format: 'http-url' },
        {
          path: '/education/0/qualificationReference/uri',
          code: 'invalid-format',
          format: 'absolute-uri',
        },
        {
          path: '/projects/0/dateRange/end',
          code: 'invalid-order',
          relatedPath: '/projects/0/dateRange/start',
        },
        {
          path: '/certifications/0/expires',
          code: 'missing-dependent-field',
          relatedPath: '/certifications/0/date',
        },
        {
          path: '/extensions/com.example.valid/value',
          code: 'invalid-type',
          expected: 'json-value',
          actual: 'undefined',
        },
        {
          path: '/extensions/invalid',
          code: 'invalid-format',
          format: 'extension-namespace',
        },
        { path: '/extra', code: 'unexpected-field' },
      ],
    })
  })

  it('accepts empty extensions and reports cycles at their exact path', () => {
    expect(validateCvDataV1({ ...minimum, extensions: {} })).toEqual({
      success: true,
      data: { ...minimum, extensions: {} },
    })

    const cycle: Record<string, unknown> = {}
    cycle.self = cycle
    expect(validateCvDataV1({ ...minimum, extensions: { 'com.example.cycle': cycle } })).toEqual({
      success: false,
      errors: [
        {
          path: '/extensions/com.example.cycle/self',
          code: 'invalid-type',
          expected: 'json-value',
          actual: 'object',
        },
      ],
    })
  })

  it.each(['a:#x#y', 'a:[]', 'https://exa[mple].com', 'urn:value%ZZ'])(
    'rejects the malformed absolute URI %s',
    (uri) => {
      expect(
        validateCvDataV1({
          ...minimum,
          skills: [{ name: 'Skill', skillReference: { vocabulary: 'test', uri } }],
        }),
      ).toEqual({
        success: false,
        errors: [
          {
            path: '/skills/0/skillReference/uri',
            code: 'invalid-format',
            format: 'absolute-uri',
          },
        ],
      })
    },
  )

  it.each(['http://a.b.c.xn--pokxncvks', 'https://xn--/'])(
    'accepts the pinned URL snapshot case %s',
    (url) => {
      expect(
        validateCvDataV1({
          ...minimum,
          person: { name: 'A', links: [{ label: 'Legacy domain', url }] },
        }),
      ).toMatchObject({ success: true })
    },
  )
})

describe('CV Data V1 labels and dates', () => {
  it('selects French by complete tag, primary tag, then falls back to English', () => {
    expectTypeOf(getCvLabelsV1('en')).toEqualTypeOf<CvLabelsV1>()
    expect(getCvLabelsV1('FR-cm')).toMatchObject({ summary: 'Profil', present: 'Aujourd’hui' })
    expect(getCvLabelsV1('de')).toMatchObject({ summary: 'Profile', present: 'Present' })
    expect(getCvLabelsV1('not_a_tag')).toMatchObject({ summary: 'Profile' })
  })

  it('formats partial dates and ranges without changing precision', () => {
    expect(formatCvPartialDateV1('2024', 'en')).toBe('2024')
    expect(formatCvPartialDateV1('2024-01', 'en-US')).toBe('Jan 2024')
    expect(formatCvPartialDateV1('2024-01-02', 'fr-CM')).toBe('2 janv. 2024')
    expect(formatCvDateRangeV1({ start: '2024-01' }, 'fr')).toBe('janv. 2024 à Aujourd’hui')
    expect(formatCvDateRangeV1({ start: '2024', end: '2024-02' }, 'en')).toBe('2024 to Feb 2024')
  })

  it('throws RangeError for invalid formatter input and order', () => {
    expect(() => formatCvPartialDateV1('2023-02-29', 'en')).toThrow(RangeError)
    expect(() => formatCvPartialDateV1(2024 as never, 'en')).toThrow(RangeError)
    expect(() => formatCvDateRangeV1({ start: '2024', end: '2023' }, 'en')).toThrow(RangeError)
  })
})

describe('CV Data V1 schema lexical patterns', () => {
  it('asserts language tags and real partial dates without custom format support', () => {
    const languagePattern = new RegExp(CV_DATA_V1_SCHEMA.properties.language.pattern)
    const datePattern = new RegExp(CV_DATA_V1_SCHEMA.$defs.partialDate.pattern)
    const urlPattern = new RegExp(CV_DATA_V1_SCHEMA.$defs.link.properties.url.pattern)

    expect(languagePattern.test('fr-CM')).toBe(true)
    expect(languagePattern.test('I-KlInGoN')).toBe(true)
    expect(languagePattern.test('not_a_tag')).toBe(false)
    expect(datePattern.test('2024-02-29')).toBe(true)
    expect(datePattern.test('2000-02-29')).toBe(true)
    expect(datePattern.test('1900-02-29')).toBe(false)
    expect(datePattern.test('2023-02-29')).toBe(false)
    expect(datePattern.test('0000')).toBe(false)
    expect(urlPattern.test('http:')).toBe(false)
    expect(urlPattern.test('http:example.com')).toBe(true)
    expect(urlPattern.test('https://example.com')).toBe(true)
    expect(urlPattern.test(' http://example.com ')).toBe(true)
    expect(
      validateCvDataV1({
        ...minimum,
        person: { name: 'A', links: [{ label: 'Spaced URL', url: ' http://example.com ' }] },
      }),
    ).toMatchObject({ success: true })
  })
})
