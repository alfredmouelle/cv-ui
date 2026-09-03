import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { CV_ACCEPTANCE_CORPUS_V1 } from '../../fixtures/cv/cases'
import { type CvDataV1, validateCvDataV1 } from '../cv-data/cv-data'
import { SignalLedgerCv } from './signal-ledger'

const readFixture = (name: string): CvDataV1 => {
  const path = fileURLToPath(new URL(`../../fixtures/cv/${name}.json`, import.meta.url))
  const value: unknown = JSON.parse(readFileSync(path, 'utf8'))
  const result = validateCvDataV1(value)
  if (!result.success) throw new Error(`Invalid fixture: ${name}`)
  return result.data
}

describe('SignalLedgerCv', () => {
  it('renders the accepted identity and paired-row reading order', () => {
    const markup = renderToStaticMarkup(<SignalLedgerCv data={readFixture('en')} />)

    expect(markup).toContain('lang="en"')
    expect(markup).toContain('data-cv-template="signal-ledger"')
    expect(markup).toMatch(/<h1[^>]*>Camille N&#x27;Diaye<\/h1>/)
    expect(markup).toContain('<address class=')
    expect(markup).toContain('aria-hidden="true"')
    expect(markup.match(/data-cv-section="contact"/g)).toBeNull()

    const contactIndex = markup.indexOf('<address')
    const profileIndex = markup.indexOf('data-cv-section="summary"')
    const experienceIndex = markup.indexOf('data-cv-section="work"')
    expect(contactIndex).toBeGreaterThan(profileIndex)
    expect(contactIndex).toBeLessThan(experienceIndex)

    expect(Array.from(markup.matchAll(/data-cv-section="([^"]+)"/g), (match) => match[1])).toEqual([
      'summary',
      'work',
      'skills',
      'languages',
      'education',
      'certifications',
      'projects',
      'awards',
      'volunteer',
      'publications',
    ])
  })

  it('keeps surviving cells in their assigned columns', () => {
    const markup = renderToStaticMarkup(
      <SignalLedgerCv
        data={{
          schemaVersion: '1',
          language: 'en',
          person: { name: 'A', email: 'a@example.com' },
          skills: [{ name: 'TypeScript' }],
          certifications: [{ name: 'CPACC', issuer: 'IAAP' }],
        }}
      />,
    )

    expect(markup).not.toContain('data-cv-section="summary"')
    expect(markup).not.toContain('data-cv-section="work"')
    expect(markup).toContain('data-cv-cell="contact"')
    expect(markup).toContain('data-cv-cell="skills-languages"')
    expect(markup).toContain('data-cv-cell="certifications"')
  })

  it('rejects invalid and out-of-envelope CV Data before rendering', () => {
    expect(() =>
      SignalLedgerCv({ data: { schemaVersion: '1', language: 'en', person: { name: '' } } }),
    ).toThrow('Invalid CV Data')
    expect(() =>
      SignalLedgerCv({
        data: { schemaVersion: '1', language: 'en', person: { name: 'A'.repeat(121) } },
      }),
    ).toThrow('CV Data exceeds the Fidelity Envelope')
  })

  it('renders exactly the accepted Fidelity Envelope corpus', () => {
    for (const corpusCase of CV_ACCEPTANCE_CORPUS_V1) {
      const result = validateCvDataV1(corpusCase.data)
      expect(result.success, corpusCase.id).toBe(true)
      if (!result.success) continue

      const render = () => renderToStaticMarkup(<SignalLedgerCv data={result.data} />)
      if (corpusCase.expected.success) {
        if (!('pagination' in corpusCase)) throw new Error(`Missing pagination: ${corpusCase.id}`)
        const markup = render()
        const markers = Array.from(
          markup.matchAll(/data-cv-(section|entry)="([^"]+)"/g),
          (match) => `${match[1]}:${match[2]}`,
        )
        expect(markers, corpusCase.id).toEqual(corpusCase.pagination['signal-ledger'].flat())
      } else expect(render, corpusCase.id).toThrow('CV Data exceeds the Fidelity Envelope')
    }
  })
})
