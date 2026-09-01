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
  type CvLinkV1,
  type CvPersonV1,
  type CvSectionIdV1,
  type CvValidationResult,
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
