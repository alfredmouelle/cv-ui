import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { CV_ACCEPTANCE_CORPUS_V1 } from '../../fixtures/cv/cases'
import { type CvDataV1, validateCvDataV1 } from '../cv-data/cv-data'
import { ClearlineCv } from './clearline'

const readFixture = (name: string): CvDataV1 => {
  const path = fileURLToPath(new URL(`../../fixtures/cv/${name}.json`, import.meta.url))
  const value: unknown = JSON.parse(readFileSync(path, 'utf8'))
  const result = validateCvDataV1(value)

  if (!result.success) throw new Error(`Invalid fixture: ${name}`)
  return result.data
}
const hiddenFields = new Set([
  'schemaVersion',
  'language',
  'url',
  'positionReference',
  'qualificationReference',
  'skillReference',
  'extensions',
  'dateRange',
  'date',
  'expires',
])
const collectVisibleValues = (value: unknown): string[] => {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(collectVisibleValues)
  if (!value || typeof value !== 'object') return []
  return Object.entries(value).flatMap(([key, entry]) =>
    hiddenFields.has(key) ? [] : collectVisibleValues(entry),
  )
}
const collectDates = (value: unknown, key = ''): string[] => {
  if (typeof value === 'string')
    return ['start', 'end', 'date', 'expires'].includes(key) ? [value] : []
  if (Array.isArray(value)) return value.flatMap((entry) => collectDates(entry, key))
  if (!value || typeof value !== 'object') return []
  return Object.entries(value).flatMap(([entryKey, entry]) => collectDates(entry, entryKey))
}
const escapePattern = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

describe('ClearlineCv', () => {
  it('renders the English fixture in the required semantic order', () => {
    const markup = renderToStaticMarkup(<ClearlineCv data={readFixture('en')} />)

    expect(markup).toContain('lang="en"')
    expect(markup).toContain('data-cv-template="clearline"')
    expect(markup).toMatch(/<h1[^>]*>Camille N&#x27;Diaye<\/h1>/)
    expect(markup).toContain('<address class=')
    expect(markup).toContain('href="mailto:camille.ndiaye@example.com"')
    expect(markup).toContain('href="tel:+33612345678"')
    expect(markup).toContain('<time dateTime="2021-03">Mar 2021</time>')
    expect(markup).toContain('data-cv-entry="work.0"')
    expect(markup).toContain('data-cv-highlights="true"')

    const sectionMarkers = Array.from(
      markup.matchAll(/data-cv-section="([^"]+)"/g),
      (match) => match[1],
    )
    expect(sectionMarkers).toEqual([
      'summary',
      'work',
      'projects',
      'skills',
      'education',
      'certifications',
      'awards',
      'volunteer',
      'publications',
      'languages',
    ])
  })

  it('uses the shared French labels and present value', () => {
    const markup = renderToStaticMarkup(<ClearlineCv data={readFixture('fr')} />)

    expect(markup).toContain('>Projets<')
    expect(markup).toContain('>Aujourd’hui<')
    expect(markup).toContain('lang="fr"')
  })

  it('has named links, unique markers, and no heading-level skips', () => {
    const markup = renderToStaticMarkup(<ClearlineCv data={readFixture('en')} />)
    const levels = Array.from(markup.matchAll(/<h([1-3])(?:\s|>)/g), (match) => Number(match[1]))
    const links = Array.from(markup.matchAll(/<a\s[^>]*>(.*?)<\/a>/g), (match) => match[1])

    expect(markup.match(/<article(?:\s|>)/g)).toHaveLength(1)
    expect(markup.match(/<h1(?:\s|>)/g)).toHaveLength(1)
    expect(links.every((link) => link?.trim())).toBe(true)
    expect(
      levels.every((level, index) => index === 0 || level <= (levels[index - 1] ?? 0) + 1),
    ).toBe(true)

    const markers = Array.from(
      markup.matchAll(/data-cv-(?:section|entry)="([^"]+)"/g),
      (match) => match[1],
    )
    expect(new Set(markers).size).toBe(markers.length)
  })

  it('renders each supplied English core value once per occurrence', () => {
    const fixture = readFixture('en')
    const markup = renderToStaticMarkup(<ClearlineCv data={fixture} />)
    const visibleText = markup
      .replace(/<[^>]+>/g, ' ')
      .replaceAll('&#x27;', "'")
      .replace(/\s+/g, ' ')
    const expectedCounts = new Map<string, number>()
    for (const value of collectVisibleValues(fixture))
      expectedCounts.set(value, (expectedCounts.get(value) ?? 0) + 1)

    let remainingText = visibleText
    for (const [value, count] of [...expectedCounts].sort(
      ([left], [right]) => right.length - left.length,
    )) {
      const pattern = new RegExp(
        `(?<![\\p{L}\\p{N}])${escapePattern(value)}(?![\\p{L}\\p{N}])`,
        'gu',
      )
      expect(remainingText.match(pattern), value).toHaveLength(count)
      remainingText = remainingText.replace(pattern, ' ')
    }
    for (const date of collectDates(fixture))
      expect(markup.match(new RegExp(`dateTime="${escapePattern(date)}"`, 'g')), date).toHaveLength(
        1,
      )
  })

  it('rejects invalid CV Data before rendering', () => {
    expect(() =>
      ClearlineCv({
        data: { schemaVersion: '1', language: 'en', person: { name: '' } },
      }),
    ).toThrow('Invalid CV Data')
  })

  it('rejects data outside the Fidelity Envelope before rendering', () => {
    expect(() =>
      ClearlineCv({
        data: {
          schemaVersion: '1',
          language: 'en',
          person: { name: 'A'.repeat(121) },
        },
      }),
    ).toThrow('CV Data exceeds the Fidelity Envelope')
  })

  it('renders exactly the accepted Fidelity Envelope corpus', () => {
    for (const corpusCase of CV_ACCEPTANCE_CORPUS_V1) {
      const result = validateCvDataV1(corpusCase.data)
      expect(result.success, corpusCase.id).toBe(true)
      if (!result.success) continue

      const render = () => renderToStaticMarkup(<ClearlineCv data={result.data} />)
      if (corpusCase.expected.success) {
        if (!('pagination' in corpusCase)) throw new Error(`Missing pagination: ${corpusCase.id}`)
        const markup = render()
        const markers = Array.from(
          markup.matchAll(/data-cv-(section|entry)="([^"]+)"/g),
          (match) => `${match[1]}:${match[2]}`,
        )
        expect(markers, corpusCase.id).toEqual(corpusCase.pagination.clearline.flat())
      } else expect(render, corpusCase.id).toThrow('CV Data exceeds the Fidelity Envelope')
    }
  })
})
