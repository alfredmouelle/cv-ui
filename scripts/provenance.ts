import * as v from 'valibot'

const nonEmptyStringSchema = v.pipe(v.string(), v.minLength(1))
const resourcePathSchema = v.pipe(v.string(), v.regex(/^(?:fonts|assets)\/[^/].*/u))
const licensePathSchema = v.pipe(v.string(), v.regex(/^licenses\/[^/].*/u))
const sourceUrlSchema = v.pipe(v.string(), v.url(), v.startsWith('https://'))
export const LICENSE_ALLOWLISTS = {
  design: ['CC0-1.0', 'CC-BY-4.0', 'MIT', 'Apache-2.0'],
  font: ['OFL-1.1', 'Apache-2.0'],
  image: ['CC0-1.0', 'CC-BY-4.0', 'MIT', 'Apache-2.0'],
  other: ['CC0-1.0', 'CC-BY-4.0', 'MIT', 'Apache-2.0'],
} as const

const designLicenseSchema = v.picklist(LICENSE_ALLOWLISTS.design)
const resourceLicenseSchemas = {
  font: v.picklist(LICENSE_ALLOWLISTS.font),
  image: v.picklist(LICENSE_ALLOWLISTS.image),
  other: v.picklist(LICENSE_ALLOWLISTS.other),
} as const

const resourceSchema = (kind: keyof typeof resourceLicenseSchemas) => {
  const common = {
    path: resourcePathSchema,
    kind: v.literal(kind),
    license: resourceLicenseSchemas[kind],
    copyright: nonEmptyStringSchema,
    licensePath: licensePathSchema,
  }
  return v.variant('origin', [
    v.strictObject({ ...common, origin: v.literal('original') }),
    v.strictObject({
      ...common,
      origin: v.literal('third-party'),
      sourceName: nonEmptyStringSchema,
      sourceUrl: sourceUrlSchema,
      sourceVersion: v.optional(nonEmptyStringSchema),
      changes: v.optional(nonEmptyStringSchema),
    }),
  ])
}

const provenanceSchema = v.strictObject({
  schemaVersion: v.literal('1.0'),
  templateId: v.pipe(v.string(), v.regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u)),
  design: v.variant('origin', [
    v.strictObject({ origin: v.literal('original') }),
    v.strictObject({
      origin: v.literal('adapted'),
      sources: v.pipe(
        v.array(
          v.strictObject({
            name: nonEmptyStringSchema,
            url: sourceUrlSchema,
            license: designLicenseSchema,
            copyright: nonEmptyStringSchema,
            changes: nonEmptyStringSchema,
          }),
        ),
        v.minLength(1),
      ),
    }),
  ]),
  resources: v.pipe(
    v.array(
      v.variant('kind', [resourceSchema('font'), resourceSchema('image'), resourceSchema('other')]),
    ),
    v.minLength(1),
  ),
})

export type ProvenanceV1 = v.InferOutput<typeof provenanceSchema>

export type ProvenanceInputs = {
  readonly templateId: string
  readonly provenance: unknown
  readonly distributablePaths: readonly string[]
  readonly licensePaths: readonly string[]
}

const isContained = (path: string): boolean =>
  !path.split('/').includes('..') && !path.startsWith('/')

const findSortAndUniquenessFailures = (
  values: readonly string[],
  sortFailure: string,
  duplicateFailure: (value: string) => string,
): string[] => {
  const failures: string[] = []
  if (values.some((value, index) => value < (values[index - 1] ?? ''))) failures.push(sortFailure)
  const seen = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) failures.push(duplicateFailure(value))
    seen.add(value)
  }
  return failures
}

const findCompletenessFailures = (provenance: ProvenanceV1, inputs: ProvenanceInputs): string[] => {
  const declaredPaths = provenance.resources.map((resource) => resource.path)
  const declared = new Set(declaredPaths)
  const distributable = new Set(inputs.distributablePaths)
  const referenced = new Set(provenance.resources.map((resource) => resource.licensePath))
  const notices = new Set(inputs.licensePaths)

  return [
    ...findSortAndUniquenessFailures(
      declaredPaths,
      'Resources are not path-sorted',
      (path) => `Duplicate resource: ${path}`,
    ),
    ...[...declared]
      .filter((path) => !distributable.has(path))
      .map((path) => `Missing distributable resource: ${path}`),
    ...inputs.distributablePaths
      .filter((path) => !declared.has(path))
      .map((path) => `Undeclared distributable resource: ${path}`),
    ...[...referenced]
      .filter((path) => !notices.has(path))
      .map((path) => `Missing resource license: ${path}`),
    ...inputs.licensePaths
      .filter((path) => !referenced.has(path))
      .map((path) => `Unreferenced resource license: ${path}`),
  ]
}

export const findProvenanceFailures = (inputs: ProvenanceInputs): string[] => {
  const parsed = v.safeParse(provenanceSchema, inputs.provenance)
  if (!parsed.success) return ['Provenance does not match the V1 contract']
  const provenance = parsed.output

  const failures: string[] = []
  if (provenance.templateId !== inputs.templateId)
    failures.push(
      `Provenance declares Template ID ${provenance.templateId} in registry/${inputs.templateId}`,
    )
  if (provenance.design.origin === 'adapted')
    failures.push(
      ...findSortAndUniquenessFailures(
        provenance.design.sources.map((source) => source.url),
        'Design sources are not URL-sorted',
        (url) => `Duplicate design source: ${url}`,
      ),
    )
  for (const resource of provenance.resources) {
    if (!isContained(resource.path)) failures.push(`Invalid resource path: ${resource.path}`)
    if (!isContained(resource.licensePath))
      failures.push(`Invalid license path: ${resource.licensePath}`)
  }
  if (failures.length > 0) return failures

  return findCompletenessFailures(provenance, inputs)
}
