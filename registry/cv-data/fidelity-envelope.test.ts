import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, expectTypeOf, it } from 'vitest'

import {
  CV_FIDELITY_ENVELOPE_V1,
  CV_FIDELITY_ENVELOPE_V1_SCHEMA,
  type CvDataV1,
  type CvFidelityEnvelopeV1,
  type CvFidelityError,
  type CvFidelityErrorCode,
  type CvValidationResult,
  validateCvFidelityEnvelopeV1,
} from './cv-data'

const minimum = {
  schemaVersion: '1',
  language: 'en',
  person: { name: 'A' },
} as const satisfies CvDataV1

describe('validateCvFidelityEnvelopeV1', () => {
  it('returns the exact input reference inside the envelope', () => {
    const result = validateCvFidelityEnvelopeV1(minimum)

    expect(result).toEqual({ success: true, data: minimum })
    if (result.success) expect(result.data).toBe(minimum)
  })

  it('exports the fixed V1 contract', () => {
    expectTypeOf<CvFidelityErrorCode>().toEqualTypeOf<CvFidelityError['code']>()
    expectTypeOf<CvValidationResult<CvDataV1, CvFidelityError>>().toMatchTypeOf<
      ReturnType<typeof validateCvFidelityEnvelopeV1>
    >()
    expectTypeOf(CV_FIDELITY_ENVELOPE_V1).toEqualTypeOf<CvFidelityEnvelopeV1>()
    expect(CV_FIDELITY_ENVELOPE_V1).toEqual({
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
    })
  })

  it('counts Unicode grapheme clusters instead of code points', () => {
    const fluency = `${'e\u0301 '.repeat(10)}${'👩🏿‍💻 '.repeat(9)}👩🏿‍💻a`
    const accepted = { ...minimum, languages: [{ name: 'A', fluency }] }
    const invalid = {
      ...minimum,
      languages: [{ name: 'A', fluency: `${fluency}👩🏿‍💻` }],
    }

    expect(validateCvFidelityEnvelopeV1(accepted)).toEqual({ success: true, data: accepted })
    expect(validateCvFidelityEnvelopeV1(invalid)).toEqual({
      success: false,
      errors: [{ path: '/languages/0/fluency', code: 'text-length', limit: 40, actual: 41 }],
    })
  })

  it('reports field, collection, then document errors in traversal order', () => {
    const input = {
      ...minimum,
      person: { name: 'W'.repeat(121) },
      work: [
        {
          organization: 'A',
          position: 'A',
          highlights: Array.from({ length: 6 }, () => 'a'),
        },
      ],
    } satisfies CvDataV1

    expect(validateCvFidelityEnvelopeV1(input)).toEqual({
      success: false,
      errors: [
        { path: '/person/name', code: 'text-length', limit: 120, actual: 121 },
        { path: '/person/name', code: 'unbroken-text', limit: 40, actual: 121 },
        { path: '/work/0/highlights', code: 'array-count', limit: 5, actual: 6 },
      ],
    })
  })
})

describe('CV_FIDELITY_ENVELOPE_V1_SCHEMA', () => {
  it('matches the standalone immutable schema', () => {
    const schemaPath = fileURLToPath(
      new URL('../../schemas/fidelity-envelope/v1.json', import.meta.url),
    )
    const standaloneSchema: unknown = JSON.parse(readFileSync(schemaPath, 'utf8'))

    expect(standaloneSchema).toEqual(CV_FIDELITY_ENVELOPE_V1_SCHEMA)
  })
})
