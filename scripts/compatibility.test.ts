import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parseRemovalTombstoneV1, validateTemplateLifecycle } from '../contracts/compatibility'
import englishCv from '../fixtures/cv/en.json'
import frenchCv from '../fixtures/cv/fr.json'
import { validateCvDataV1 } from '../registry/cv-data/cv-data'
import registry from '../registry.json'

const templates = registry.items.flatMap((item) =>
  item.meta === undefined ? [] : [{ id: item.name, meta: item.meta.cvUi }],
)

describe('published compatibility', () => {
  it('validates published CV Data without migration or value replacement', () => {
    for (const document of [englishCv, frenchCv]) {
      const result = validateCvDataV1(document)

      expect(result).toEqual({ success: true, data: document })
      if (result.success) expect(result.data).toBe(document)
    }
  })

  it('keeps every published major and permanent Template ID represented by a fixture', () => {
    const fixture: unknown = JSON.parse(
      readFileSync('fixtures/compatibility/published-v1.json', 'utf8'),
    )

    expect(fixture).toMatchObject({
      cvDataMajors: [{ major: '1' }],
      cvDataMigrations: [],
      catalogMajors: [{ major: '1', path: 'public/catalog/v1/templates.json' }],
      registrySchemaMajors: [{ major: '1' }],
      templateIds: [{ id: 'clearline' }, { id: 'signal-ledger' }],
    })
  })

  it('accepts every fixed removal reason and rejects other values', () => {
    for (const reason of ['legal-risk', 'security-risk', 'redistribution-unavailable'])
      expect(
        parseRemovalTombstoneV1({
          schemaVersion: '1.0',
          templateId: 'retired-template',
          status: 'removed',
          reason,
          removalDate: '2026-09-08',
        }),
      ).toMatchObject({ reason })

    expect(() =>
      parseRemovalTombstoneV1({
        schemaVersion: '1.0',
        templateId: 'retired-template',
        status: 'removed',
        reason: 'old',
        removalDate: '2026-09-08',
      }),
    ).toThrow(/reason/u)
  })

  it('requires real lifecycle dates and active removal replacement Template IDs', () => {
    expect(() =>
      validateTemplateLifecycle({
        permanentTemplateIds: ['current', 'retired'],
        removals: [
          {
            schemaVersion: '1.0',
            templateId: 'retired',
            status: 'removed',
            reason: 'legal-risk',
            removalDate: '2026-02-29',
            replacementTemplateId: 'current',
          },
        ],
        templates: [{ id: 'current', meta: { status: 'active' } }],
      }),
    ).toThrow(/date/u)

    expect(() =>
      validateTemplateLifecycle({
        permanentTemplateIds: ['current', 'retired'],
        removals: [
          {
            schemaVersion: '1.0',
            templateId: 'retired',
            status: 'removed',
            reason: 'security-risk',
            removalDate: '2026-09-08',
            replacementTemplateId: 'current',
          },
        ],
        templates: [
          {
            id: 'current',
            meta: {
              status: 'deprecated',
              deprecation: { reason: 'Use another template.', date: '2026-09-01' },
            },
          },
        ],
      }),
    ).toThrow(/active replacement/u)
  })

  it('allows a deprecated template to name another deprecated Catalog entry', () => {
    expect(() =>
      validateTemplateLifecycle({
        permanentTemplateIds: ['retiring', 'replacement'],
        removals: [],
        templates: [
          {
            id: 'retiring',
            meta: {
              status: 'deprecated',
              deprecation: {
                reason: 'Use the replacement.',
                date: '2026-09-08',
                replacementTemplateId: 'replacement',
              },
            },
          },
          {
            id: 'replacement',
            meta: {
              status: 'deprecated',
              deprecation: { reason: 'Use a newer template.', date: '2026-09-08' },
            },
          },
        ],
      }),
    ).not.toThrow()
  })

  it('requires exact deprecation facts', () => {
    expect(() =>
      validateTemplateLifecycle({
        permanentTemplateIds: ['retiring'],
        removals: [],
        templates: [
          {
            id: 'retiring',
            meta: {
              status: 'deprecated',
              deprecation: { reason: 'Use the replacement.', date: '2026-09-08' },
            },
          },
        ],
      }),
    ).not.toThrow()
    expect(() =>
      validateTemplateLifecycle({
        permanentTemplateIds: ['retiring'],
        removals: [],
        templates: [
          {
            id: 'retiring',
            meta: { status: 'deprecated', deprecation: { reason: ' ', date: '2026-09-08' } },
          },
        ],
      }),
    ).toThrow(/reason/u)
  })

  it('rejects Template ID reuse and missing permanent IDs', () => {
    const removal = {
      schemaVersion: '1.0',
      templateId: 'clearline',
      status: 'removed',
      reason: 'legal-risk',
      removalDate: '2026-09-08',
    } as const

    expect(() =>
      validateTemplateLifecycle({
        permanentTemplateIds: ['clearline'],
        removals: [removal],
        templates: [{ id: 'clearline', meta: { status: 'active' } }],
      }),
    ).toThrow(/reuse/u)
    expect(() =>
      validateTemplateLifecycle({
        permanentTemplateIds: ['clearline'],
        removals: [],
        templates: [],
      }),
    ).toThrow(/Permanent Template ID/u)
  })

  it('accepts the current registry lifecycle', () => {
    expect(() =>
      validateTemplateLifecycle({
        permanentTemplateIds: ['clearline', 'signal-ledger'],
        removals: registry.removals,
        templates,
      }),
    ).not.toThrow()
  })
})
