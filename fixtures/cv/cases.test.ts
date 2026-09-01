import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'

import { validateCvDataV1, validateCvFidelityEnvelopeV1 } from '../../registry/cv-data/cv-data'
import { CV_ACCEPTANCE_CORPUS_V1 } from './cases'

const readFixture = (name: string): unknown =>
  JSON.parse(readFileSync(new URL(`./${name}.json`, import.meta.url), 'utf8'))

describe('CV Acceptance Corpus V1', () => {
  it('has 128 unique cases in normative order', () => {
    expect(CV_ACCEPTANCE_CORPUS_V1).toHaveLength(128)
    expect(new Set(CV_ACCEPTANCE_CORPUS_V1.map(({ id }) => id)).size).toBe(128)
    expect(CV_ACCEPTANCE_CORPUS_V1.slice(0, 5).map(({ id }) => id)).toEqual([
      'minimum',
      'en',
      'fr',
      'maximum-envelope',
      'wrapping',
    ])
    expect(CV_ACCEPTANCE_CORPUS_V1.filter(({ id }) => id.startsWith('boundary-'))).toHaveLength(61)
    expect(CV_ACCEPTANCE_CORPUS_V1.filter(({ id }) => id.startsWith('invalid-'))).toHaveLength(62)
    expect(
      CV_ACCEPTANCE_CORPUS_V1.filter(
        ({ id }) => id.startsWith('invalid-') && id !== 'invalid-error-order',
      ),
    ).toHaveLength(61)
    expect(CV_ACCEPTANCE_CORPUS_V1.at(-1)?.id).toBe('invalid-error-order')
  })

  it('stores literal case and fixture values', () => {
    const casesSource = readFileSync(new URL('./cases.ts', import.meta.url), 'utf8')

    expect(casesSource).not.toMatch(
      /(?:Array\.from|breakableText|structuredClone|unbrokenText|\.repeat\s*\()/u,
    )
  })

  it('contains the approved base fixtures', () => {
    const fixtureNames = ['minimum', 'en', 'fr', 'maximum-envelope', 'wrapping']
    const fixtures = Object.fromEntries(fixtureNames.map((name) => [name, readFixture(name)]))

    expect(fixtures.minimum).toEqual({
      schemaVersion: '1',
      language: 'en',
      person: { name: 'A' },
    })
    expect(fixtures.en).toMatchObject({
      language: 'en',
      person: { name: "Camille N'Diaye" },
      extensions: { 'com.example.cv-ui': { source: 'canonical', reviewed: true } },
    })
    expect(fixtures.fr).toMatchObject({
      language: 'fr',
      person: {
        name: "Camille N'Diaye",
        headline: "Ingénieure produit pour les services d'intérêt public",
      },
    })
    expect(fixtures.wrapping).toMatchObject({
      language: 'fr',
      person: { headline: 'W'.repeat(40) },
      work: [{ highlights: ['W'.repeat(40)] }],
      skills: [{ keywords: ['W'.repeat(40)] }],
    })

    const maximum = fixtures['maximum-envelope']
    const structural = validateCvDataV1(maximum)
    expect(structural.success).toBe(true)
    if (!structural.success) return
    expect(structural.data.work).toHaveLength(4)
    expect(structural.data.education).toHaveLength(2)
    expect(structural.data.projects).toHaveLength(2)
    expect(
      [
        structural.data.skills,
        structural.data.languages,
        structural.data.certifications,
        structural.data.awards,
        structural.data.volunteer,
        structural.data.publications,
      ].every((section) => section?.length === 1),
    ).toBe(true)
    expect(
      [
        ...(structural.data.work ?? []),
        ...(structural.data.education ?? []),
        ...(structural.data.projects ?? []),
        ...(structural.data.volunteer ?? []),
      ].reduce((count, record) => count + (record.highlights?.length ?? 0), 0),
    ).toBe(24)
    expect(validateCvFidelityEnvelopeV1(structural.data)).toEqual({
      success: true,
      data: structural.data,
    })
    const oneOver = {
      ...structural.data,
      person: { ...structural.data.person, name: `${structural.data.person.name}a` },
    }
    expect(validateCvFidelityEnvelopeV1(oneOver)).toEqual({
      success: false,
      errors: [{ path: '', code: 'authored-text', limit: 5000, actual: 5001 }],
    })
  })

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: This checks both result variants in one corpus pass.
  it('matches every expected result and preserves accepted input identity', () => {
    const render = vi.fn((data: unknown) => data)
    const writeOutput = vi.fn()

    for (const corpusCase of CV_ACCEPTANCE_CORPUS_V1) {
      const structural = validateCvDataV1(corpusCase.data)
      expect(structural.success, corpusCase.id).toBe(true)
      if (!structural.success) continue
      const result = validateCvFidelityEnvelopeV1(structural.data)
      if (corpusCase.expected.success) {
        expect(result, corpusCase.id).toEqual({ success: true, data: structural.data })
        if (result.success) expect(result.data, corpusCase.id).toBe(structural.data)
      } else {
        expect(result, corpusCase.id).toEqual(corpusCase.expected)
        if (result.success) {
          writeOutput(render(result.data))
        }
      }
    }

    expect(render).not.toHaveBeenCalled()
    expect(writeOutput).not.toHaveBeenCalled()
  })

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: This validates every nested signature and marker.
  it('materializes valid pagination signatures for every accepted case', () => {
    const twoPageCases = new Set([
      'en',
      'fr',
      'maximum-envelope',
      'boundary-document-authored-text',
    ])

    for (const corpusCase of CV_ACCEPTANCE_CORPUS_V1) {
      if (!('pagination' in corpusCase)) continue
      const structural = validateCvDataV1(corpusCase.data)
      expect(structural.success, corpusCase.id).toBe(true)
      if (!structural.success) continue
      const recordsBySection = {
        work: structural.data.work,
        education: structural.data.education,
        projects: structural.data.projects,
        skills: structural.data.skills,
        languages: structural.data.languages,
        certifications: structural.data.certifications,
        awards: structural.data.awards,
        volunteer: structural.data.volunteer,
        publications: structural.data.publications,
      }
      for (const pages of Object.values(corpusCase.pagination)) {
        expect(pages, corpusCase.id).toHaveLength(twoPageCases.has(corpusCase.id) ? 2 : 1)
        for (const marker of pages.flat()) {
          expect(marker, corpusCase.id).toMatch(
            /^(?:section:(?:summary|work|education|projects|skills|languages|certifications|awards|volunteer|publications)|entry:(?:work|education|projects|skills|languages|certifications|awards|volunteer|publications)\.\d+)$/u,
          )
          const entry = /^entry:([^.]+)\.(\d+)$/u.exec(marker)
          if (!entry) continue
          const section = Object.entries(recordsBySection).find(([id]) => id === entry[1])?.[1]
          expect(section?.[Number(entry[2])], marker).toBeDefined()
        }
      }
    }
  })

  it('matches every installed English example when templates exist', async () => {
    const registryPath = new URL('../../registry/', import.meta.url)
    const examplePaths = readdirSync(registryPath, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name !== 'cv-data')
      .map((entry) => ({
        exportName: `${entry.name.replace(/-([a-z0-9])/gu, (_, character: string) => character.toUpperCase())}ExampleCvData`,
        path: new URL(`${entry.name}/example.ts`, registryPath),
      }))
    const english = readFixture('en')

    for (const example of examplePaths) {
      const module = await import(example.path.href)
      expect(module[example.exportName], example.path.pathname).toEqual(english)
    }
  })
})
