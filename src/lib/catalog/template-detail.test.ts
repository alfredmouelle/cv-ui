import { describe, expect, it } from 'vitest'

import { getTemplateDetail } from './template-detail'

describe('getTemplateDetail', () => {
  it('keeps exact safe facts discoverable for a removed Template ID', () => {
    expect(
      getTemplateDetail('retired-template', [
        {
          schemaVersion: '1.0',
          templateId: 'retired-template',
          status: 'removed',
          reason: 'legal-risk',
          removalDate: '2026-09-08',
          replacementTemplateId: 'clearline',
        },
      ]),
    ).toEqual({
      kind: 'removed',
      tombstone: {
        schemaVersion: '1.0',
        templateId: 'retired-template',
        status: 'removed',
        reason: 'legal-risk',
        removalDate: '2026-09-08',
        replacementTemplateId: 'clearline',
      },
    })
  })
})
