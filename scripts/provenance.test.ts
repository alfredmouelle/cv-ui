import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { findProvenanceFailures, LICENSE_ALLOWLISTS } from './provenance'

const font = {
  path: 'fonts/geist-latin-wght-normal.woff2',
  kind: 'font',
  origin: 'third-party',
  sourceName: 'Geist',
  sourceUrl: 'https://github.com/vercel/geist-font',
  license: 'OFL-1.1',
  copyright: 'Copyright 2023 Vercel, Inc.',
  licensePath: 'licenses/OFL-1.1.txt',
}
const provenance = {
  schemaVersion: '1.0',
  templateId: 'clearline',
  design: { origin: 'original' },
  resources: [font],
}
const inputs = {
  templateId: 'clearline',
  provenance,
  distributablePaths: ['fonts/geist-latin-wght-normal.woff2'],
  licensePaths: ['licenses/OFL-1.1.txt'],
}

describe('template provenance', () => {
  it('accepts a complete declaration', () => {
    expect(findProvenanceFailures(inputs)).toEqual([])
  })

  it('accepts an adapted design with URL-sorted unique sources', () => {
    const sources = [
      {
        name: 'A',
        url: 'https://a.example/design',
        license: 'CC-BY-4.0',
        copyright: 'Copyright A',
        changes: 'Rebuilt the header.',
      },
      {
        name: 'B',
        url: 'https://b.example/design',
        license: 'CC0-1.0',
        copyright: 'Copyright B',
        changes: 'Reused the rule weights.',
      },
    ]

    expect(
      findProvenanceFailures({
        ...inputs,
        provenance: { ...provenance, design: { origin: 'adapted', sources } },
      }),
    ).toEqual([])
    expect(
      findProvenanceFailures({
        ...inputs,
        provenance: {
          ...provenance,
          design: { origin: 'adapted', sources: [...sources].reverse() },
        },
      }),
    ).toEqual(['Design sources are not URL-sorted'])
    expect(
      findProvenanceFailures({
        ...inputs,
        provenance: {
          ...provenance,
          design: { origin: 'adapted', sources: [sources[0], sources[0]] },
        },
      }),
    ).toEqual(['Duplicate design source: https://a.example/design'])
  })

  it('rejects a declaration that does not parse', () => {
    expect(
      findProvenanceFailures({ ...inputs, provenance: { ...provenance, schemaVersion: '2.0' } }),
    ).toEqual(['Provenance does not match the V1 contract'])
    expect(findProvenanceFailures({ ...inputs, provenance: null })).toEqual([
      'Provenance does not match the V1 contract',
    ])
  })

  it('rejects a Template ID that does not match its folder', () => {
    expect(findProvenanceFailures({ ...inputs, templateId: 'signal-ledger' })).toEqual([
      'Provenance declares Template ID clearline in registry/signal-ledger',
    ])
  })

  it('enforces the license allowlists', () => {
    expect(
      findProvenanceFailures({
        ...inputs,
        provenance: { ...provenance, resources: [{ ...font, license: 'CC-BY-4.0' }] },
      }),
    ).toEqual(['Provenance does not match the V1 contract'])
    expect(
      findProvenanceFailures({
        ...inputs,
        provenance: {
          ...provenance,
          resources: [{ ...font, kind: 'image', license: 'OFL-1.1' }],
        },
      }),
    ).toEqual(['Provenance does not match the V1 contract'])
  })

  it('rejects paths that escape their required folder', () => {
    expect(
      findProvenanceFailures({
        ...inputs,
        provenance: {
          ...provenance,
          resources: [{ ...font, path: 'fonts/../../secret.woff2' }],
        },
        distributablePaths: [],
      }),
    ).toEqual(['Invalid resource path: fonts/../../secret.woff2'])
    expect(
      findProvenanceFailures({
        ...inputs,
        provenance: {
          ...provenance,
          resources: [{ ...font, licensePath: 'licenses/../../LICENSE' }],
        },
        licensePaths: [],
      }),
    ).toEqual(['Invalid license path: licenses/../../LICENSE'])
  })

  it('requires exactly one entry for every distributable file', () => {
    expect(
      findProvenanceFailures({
        ...inputs,
        distributablePaths: [...inputs.distributablePaths, 'assets/rule.svg'],
      }),
    ).toEqual(['Undeclared distributable resource: assets/rule.svg'])
    expect(findProvenanceFailures({ ...inputs, distributablePaths: [] })).toEqual([
      'Missing distributable resource: fonts/geist-latin-wght-normal.woff2',
    ])
  })

  it('requires path-sorted unique resources', () => {
    const other = { ...font, path: 'fonts/aaa.woff2' }
    expect(
      findProvenanceFailures({
        ...inputs,
        provenance: { ...provenance, resources: [font, other] },
        distributablePaths: ['fonts/aaa.woff2', 'fonts/geist-latin-wght-normal.woff2'],
      }),
    ).toEqual(['Resources are not path-sorted'])
    expect(
      findProvenanceFailures({ ...inputs, provenance: { ...provenance, resources: [font, font] } }),
    ).toEqual(['Duplicate resource: fonts/geist-latin-wght-normal.woff2'])
  })

  it('requires every notice to exist and to be referenced', () => {
    expect(findProvenanceFailures({ ...inputs, licensePaths: [] })).toEqual([
      'Missing resource license: licenses/OFL-1.1.txt',
    ])
    expect(
      findProvenanceFailures({
        ...inputs,
        licensePaths: [...inputs.licensePaths, 'licenses/x.txt'],
      }),
    ).toEqual(['Unreferenced resource license: licenses/x.txt'])
  })
})

describe('license allowlists', () => {
  const schema: unknown = JSON.parse(readFileSync('schemas/provenance/v1.json', 'utf8'))
  const at = (value: unknown, ...keys: readonly (string | number)[]): unknown =>
    keys.reduce<unknown>(
      (current, key) =>
        current && typeof current === 'object' ? Reflect.get(current, key) : undefined,
      value,
    )

  it('matches the canonical provenance schema', () => {
    expect(
      at(
        schema,
        'properties',
        'design',
        'oneOf',
        1,
        'properties',
        'sources',
        'items',
        'properties',
        'license',
        'enum',
      ),
    ).toEqual(LICENSE_ALLOWLISTS.design)
    const resource = at(schema, 'properties', 'resources', 'items', 'oneOf', 0)
    expect(at(resource, 'allOf', 0, 'then', 'properties', 'license', 'enum')).toEqual(
      LICENSE_ALLOWLISTS.font,
    )
    expect(at(resource, 'allOf', 0, 'else', 'properties', 'license', 'enum')).toEqual(
      LICENSE_ALLOWLISTS.image,
    )
    expect(at(resource, 'properties', 'license', 'enum')).toEqual([
      ...new Set([...LICENSE_ALLOWLISTS.font, ...LICENSE_ALLOWLISTS.image]),
    ])
  })
})
