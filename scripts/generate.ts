import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as v from 'valibot'

import {
  CV_UI_META_V1_SCHEMA,
  type CvTemplateCatalogDocumentV1,
  type CvTemplateCatalogEntryV1,
  type CvUiMetaV1,
  PROVENANCE_V1_SCHEMA,
  RELEASE_MANIFEST_V1_SCHEMA,
  REMOVAL_TOMBSTONE_V1_SCHEMA,
  TEMPLATE_CATALOG_V1_SCHEMA,
} from '../contracts/catalog.ts'
import {
  tryParseRemovalTombstoneJsonV1,
  validateTemplateLifecycle,
} from '../contracts/compatibility.ts'
import {
  CV_DATA_V1_SCHEMA,
  CV_FIDELITY_ENVELOPE_V1_SCHEMA,
  validateCvDataV1,
} from '../registry/cv-data/cv-data.ts'
import { findFileDrift, listFilePaths } from './file-drift.ts'
import { findProvenanceFailures } from './provenance.ts'

const stringArraySchema = v.array(v.string())
const nonEmptyStringSchema = v.pipe(
  v.string(),
  v.check((value) => value.trim().length > 0),
)
const authoringOrReleasePathSchema = (suffix: RegExp): v.GenericSchema<string> =>
  v.pipe(v.string(), v.regex(suffix))
const traitsSchema = v.strictObject({
  layout: v.union([v.literal('single-column'), v.literal('two-column')]),
  atsIntent: v.union([v.literal('ats-oriented'), v.literal('visual-first')]),
  visualTone: v.union([v.literal('classic'), v.literal('modern'), v.literal('expressive')]),
  density: v.union([v.literal('compact'), v.literal('balanced'), v.literal('spacious')]),
  photoSupport: v.literal('not-supported'),
})
const previewSchema = v.strictObject({
  pdf: authoringOrReleasePathSchema(
    /^(?:\/releases\/[0-9a-f]{40})?\/previews\/[a-z][a-z0-9-]*\/reference\.pdf$/u,
  ),
  pages: v.pipe(
    v.array(
      v.strictObject({
        src: authoringOrReleasePathSchema(
          /^(?:\/releases\/[0-9a-f]{40})?\/previews\/[a-z][a-z0-9-]*\/pages\/00[12]\.png$/u,
        ),
        width: v.literal(1191),
        height: v.literal(1684),
      }),
    ),
    v.minLength(1),
    v.maxLength(2),
    v.check((pages) => pages.every(({ src }, index) => src.endsWith(`/00${index + 1}.png`))),
  ),
})
const deprecationSchema = v.strictObject({
  reason: v.string(),
  date: v.string(),
  replacementTemplateId: v.optional(v.string()),
})
const metaBase = {
  schemaVersion: v.literal('1.0'),
  catalogOrder: v.pipe(v.number(), v.integer(), v.minValue(0)),
  traits: traitsSchema,
  searchAliases: v.pipe(
    v.array(nonEmptyStringSchema),
    v.check((aliases) => new Set(aliases).size === aliases.length),
  ),
  supportedCvDataVersions: v.tuple([v.literal('1')]),
  license: v.literal('MIT'),
  preview: previewSchema,
}
const metaSchema = v.union([
  v.strictObject({ ...metaBase, status: v.literal('active') }),
  v.strictObject({ ...metaBase, status: v.literal('deprecated'), deprecation: deprecationSchema }),
])
const registryFileSchema = v.strictObject({
  path: v.string(),
  type: v.string(),
  target: v.string(),
})
const registryItemSchema = v.strictObject({
  name: v.string(),
  type: v.string(),
  title: v.string(),
  description: v.string(),
  author: v.string(),
  files: v.array(registryFileSchema),
  dependencies: stringArraySchema,
  devDependencies: stringArraySchema,
  registryDependencies: stringArraySchema,
  meta: v.optional(v.strictObject({ cvUi: metaSchema })),
})
const registrySchema = v.strictObject({
  $schema: v.string(),
  name: v.string(),
  homepage: v.string(),
  removals: v.array(v.unknown()),
  items: v.array(registryItemSchema),
})
type Registry = v.InferOutput<typeof registrySchema>
type RegistryItem = Registry['items'][number]
const repositoryRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
type TemplateResource = {
  readonly sourcePath: string
  readonly outputPath: string
  readonly publicUrl?: string
}

const templateResources = {
  clearline: [
    {
      sourcePath: 'registry/clearline/fonts/geist-latin-wght-normal.woff2',
      outputPath: 'cv-ui/clearline/fonts/geist-latin-wght-normal.woff2',
      publicUrl: '/cv-ui/clearline/fonts/geist-latin-wght-normal.woff2',
    },
    {
      sourcePath: 'registry/clearline/licenses/OFL-1.1.txt',
      outputPath: 'cv-ui/clearline/licenses/OFL-1.1.txt',
    },
  ],
  'signal-ledger': [
    {
      sourcePath: 'registry/signal-ledger/fonts/bricolage-grotesque-latin-standard-normal.woff2',
      outputPath: 'cv-ui/signal-ledger/fonts/bricolage-grotesque-latin-standard-normal.woff2',
      publicUrl: '/cv-ui/signal-ledger/fonts/bricolage-grotesque-latin-standard-normal.woff2',
    },
    {
      sourcePath: 'registry/signal-ledger/fonts/geist-latin-wght-normal.woff2',
      outputPath: 'cv-ui/signal-ledger/fonts/geist-latin-wght-normal.woff2',
      publicUrl: '/cv-ui/signal-ledger/fonts/geist-latin-wght-normal.woff2',
    },
    {
      sourcePath: 'registry/signal-ledger/licenses/bricolage-grotesque-OFL-1.1.txt',
      outputPath: 'cv-ui/signal-ledger/licenses/bricolage-grotesque-OFL-1.1.txt',
    },
    {
      sourcePath: 'registry/signal-ledger/licenses/geist-OFL-1.1.txt',
      outputPath: 'cv-ui/signal-ledger/licenses/geist-OFL-1.1.txt',
    },
  ],
} as const satisfies Readonly<Record<string, readonly TemplateResource[]>>
const getTemplateResources = (templateId: string): readonly TemplateResource[] | undefined => {
  if (templateId === 'clearline' || templateId === 'signal-ledger')
    return templateResources[templateId]
  return undefined
}
export const GENERATED_OUTPUT_PATHS = ['schemas', 'r', 'catalog', 'cv-ui'] as const
export const serializeJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`
const write = (root: string, path: string, value: string | Uint8Array): void => {
  const destination = join(root, path)
  mkdirSync(dirname(destination), { recursive: true })
  writeFileSync(destination, value)
}
const readJson = (path: string): unknown => JSON.parse(readFileSync(path, 'utf8'))
const readRegistry = (): Registry => {
  const value = readJson(join(repositoryRoot, 'registry.json'))
  return v.parse(registrySchema, value)
}

const compatibilityTemplateSchema = v.strictObject({
  id: v.string(),
  title: v.string(),
  description: v.string(),
  author: v.string(),
  registryType: v.string(),
  export: v.string(),
  prop: v.string(),
  exportSignature: v.string(),
  traits: traitsSchema,
  installedPaths: v.array(v.string()),
  sourceFiles: v.array(registryFileSchema),
  dependencies: stringArraySchema,
  devDependencies: stringArraySchema,
  registryDependencies: stringArraySchema,
  supportedCvDataMajors: v.array(v.string()),
  metaSchemaVersion: v.string(),
  license: v.string(),
  previewPdf: v.string(),
  previewPages: v.array(v.string()),
  registryPath: v.string(),
})
const compatibilityFixtureSchema = v.strictObject({
  schemaVersion: v.literal('1.0'),
  cvDataMajors: v.array(
    v.strictObject({
      major: v.string(),
      schemaPath: v.string(),
      fixturePaths: v.array(v.string()),
    }),
  ),
  cvDataMigrations: v.array(
    v.strictObject({ fromMajor: v.string(), toMajor: v.string(), name: v.string() }),
  ),
  catalogMajors: v.array(v.strictObject({ major: v.string(), path: v.string() })),
  registrySchemaMajors: v.array(v.strictObject({ major: v.string(), paths: v.array(v.string()) })),
  templateIds: v.array(compatibilityTemplateSchema),
})
type CompatibilityFixture = v.InferOutput<typeof compatibilityFixtureSchema>

const readCompatibilityFixture = (): CompatibilityFixture =>
  v.parse(
    compatibilityFixtureSchema,
    readJson(join(repositoryRoot, 'fixtures/compatibility/published-v1.json')),
  )

const validateCvDataCompatibilityPaths = (
  cvDataMajors: CompatibilityFixture['cvDataMajors'],
): void => {
  for (const cvData of cvDataMajors) {
    if (!existsSync(join(repositoryRoot, cvData.schemaPath)))
      throw new Error(`Published CV Data schema is missing: ${cvData.schemaPath}`)
    for (const fixturePath of cvData.fixturePaths) {
      const fixture = readJson(join(repositoryRoot, fixturePath))
      if (cvData.major === '1' && !validateCvDataV1(fixture).success)
        throw new Error(`Published CV Data fixture is invalid: ${fixturePath}`)
    }
  }
}

const validateCvDataMigrationInventory = (compatibility: CompatibilityFixture): void => {
  const expected = compatibility.cvDataMajors.slice(1).map((current, index) => {
    const previous = compatibility.cvDataMajors[index]
    if (!previous) throw new Error('CV Data compatibility majors are not adjacent')
    if (Number(current.major) !== Number(previous.major) + 1)
      throw new Error('CV Data compatibility majors are not adjacent')
    return {
      fromMajor: previous.major,
      toMajor: current.major,
      name: `migrateCvDataV${previous.major}ToV${current.major}`,
    }
  })
  if (serializeJson(compatibility.cvDataMigrations) !== serializeJson(expected))
    throw new Error('CV Data adjacent migration inventory is incomplete')
}

const validateCatalogCompatibilityPaths = (
  catalogMajors: CompatibilityFixture['catalogMajors'],
): void => {
  for (const catalog of catalogMajors) {
    const document = readJson(join(repositoryRoot, catalog.path))
    if (
      document === null ||
      typeof document !== 'object' ||
      !String(Reflect.get(document, 'schemaVersion')).startsWith(`${catalog.major}.`)
    )
      throw new Error(`Published Catalog fixture is invalid: ${catalog.path}`)
  }
}

const validateRegistryCompatibilityPaths = (
  registrySchemaMajors: CompatibilityFixture['registrySchemaMajors'],
): void => {
  for (const registrySchema of registrySchemaMajors)
    for (const path of registrySchema.paths) {
      const text = readFileSync(join(repositoryRoot, path), 'utf8')
      const document: unknown = JSON.parse(text)
      const tombstone = tryParseRemovalTombstoneJsonV1(text)
      const isRegistryItem =
        document !== null &&
        typeof document === 'object' &&
        Reflect.get(document, '$schema') === 'https://ui.shadcn.com/schema/registry-item.json'
      const isMatchingTombstone = tombstone?.templateId === basename(path, '.json')
      if (registrySchema.major !== '1' || (!isRegistryItem && !isMatchingTombstone))
        throw new Error(`Published registry fixture is invalid: ${path}`)
    }
}

const validateCompatibilityPaths = (compatibility: CompatibilityFixture): void => {
  validateCvDataCompatibilityPaths(compatibility.cvDataMajors)
  validateCvDataMigrationInventory(compatibility)
  validateCatalogCompatibilityPaths(compatibility.catalogMajors)
  validateRegistryCompatibilityPaths(compatibility.registrySchemaMajors)
}

const validateRegistryLifecycle = (
  registry: Registry,
  compatibility: CompatibilityFixture,
): ReturnType<typeof validateTemplateLifecycle> =>
  validateTemplateLifecycle({
    permanentTemplateIds: compatibility.templateIds.map(({ id }) => id),
    removals: registry.removals,
    templates: registry.items.flatMap((item) =>
      item.meta === undefined ? [] : [{ id: item.name, meta: item.meta.cvUi }],
    ),
  })

const validateTemplateProvenance = (templateId: string): void => {
  const templateRoot = join(repositoryRoot, `registry/${templateId}`)
  const listRelativePaths = (directory: string): string[] =>
    listFilePaths(join(templateRoot, directory)).map((file) => relative(templateRoot, file))
  const failures = findProvenanceFailures({
    templateId,
    provenance: readJson(join(templateRoot, 'provenance.json')),
    distributablePaths: ['assets', 'fonts'].flatMap(listRelativePaths).sort(),
    licensePaths: listRelativePaths('licenses'),
  })
  if (failures.length > 0)
    throw new Error(`Invalid ${templateId} provenance:\n${failures.join('\n')}`)
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Validation keeps all root registry invariants together.
const validateRegistry = (registry: Registry, compatibility: CompatibilityFixture): void => {
  const names = new Set<string>()
  const catalogOrders = new Set<number>()
  for (const item of registry.items) {
    if (names.has(item.name)) throw new Error(`Duplicate registry item: ${item.name}`)
    names.add(item.name)
    if (!item.name || !item.title || !item.description || !item.author)
      throw new Error(`Incomplete registry item: ${item.name}`)
    if (!Array.isArray(item.files) || !Array.isArray(item.dependencies))
      throw new Error(`Invalid registry item: ${item.name}`)
    for (const file of item.files) {
      const path = resolve(repositoryRoot, file.path)
      if (!path.startsWith(`${repositoryRoot}/`) || !existsSync(path))
        throw new Error(`Missing registry file: ${file.path}`)
    }
  }
  for (const item of registry.items) {
    const catalogOrder = item.meta?.cvUi.catalogOrder
    if (catalogOrder === undefined) continue
    if (catalogOrders.has(catalogOrder)) throw new Error(`Duplicate catalog order: ${catalogOrder}`)
    catalogOrders.add(catalogOrder)
  }

  for (const item of registry.items.filter((candidate) => candidate.meta !== undefined)) {
    if (
      item.dependencies.length > 0 ||
      item.devDependencies.length > 0 ||
      serializeJson(item.registryDependencies) !==
        serializeJson(['https://cv-ui.alfredmouelle.com/r/cv-data.json'])
    )
      throw new Error(`Invalid ${item.title} dependencies`)
  }
  for (const item of registry.items) if (item.meta) validateTemplateProvenance(item.name)

  validateRegistryLifecycle(registry, compatibility)

  for (const published of compatibility.templateIds) {
    const item = registry.items.find(({ name }) => name === published.id)
    if (!item) continue
    if (!item.meta) throw new Error(`Published Template metadata is missing: ${published.id}`)
    if (
      item.title !== published.title ||
      item.description !== published.description ||
      item.author !== published.author ||
      item.type !== published.registryType ||
      serializeJson(item.files) !== serializeJson(published.sourceFiles) ||
      serializeJson(item.dependencies) !== serializeJson(published.dependencies) ||
      serializeJson(item.devDependencies) !== serializeJson(published.devDependencies) ||
      serializeJson(item.registryDependencies) !== serializeJson(published.registryDependencies) ||
      serializeJson(item.meta.cvUi.traits) !== serializeJson(published.traits) ||
      serializeJson(item.meta.cvUi.supportedCvDataVersions) !==
        serializeJson(published.supportedCvDataMajors) ||
      `/r/${item.name}.json` !== published.registryPath ||
      item.meta.cvUi.schemaVersion !== published.metaSchemaVersion ||
      item.meta.cvUi.license !== published.license ||
      item.meta.cvUi.preview.pdf !== published.previewPdf ||
      serializeJson(item.meta.cvUi.preview.pages.map(({ src }) => src)) !==
        serializeJson(published.previewPages) ||
      serializeJson(item.files.map(({ target }) => target)) !==
        serializeJson(published.installedPaths)
    )
      throw new Error(`Published Template contract changed: ${published.id}`)
    const component = item.files.find(({ type }) => type === 'registry:component')
    const source = component ? readFileSync(join(repositoryRoot, component.path), 'utf8') : ''
    if (
      !published.exportSignature.includes(published.export) ||
      !published.exportSignature.includes(`{ ${published.prop} }`) ||
      !source.includes(published.exportSignature)
    )
      throw new Error(`Published Template export or prop changed: ${published.id}`)
  }
}

const registryItemDocument = (item: RegistryItem): Record<string, unknown> => ({
  $schema: 'https://ui.shadcn.com/schema/registry-item.json',
  name: item.name,
  type: item.type,
  title: item.title,
  description: item.description,
  author: item.author,
  files: item.files.map((file) => {
    let content = readFileSync(join(repositoryRoot, file.path), 'utf8').replaceAll(
      "from '../cv-data/cv-data'",
      "from '~/lib/cv/cv-data'",
    )
    const resources = getTemplateResources(item.name)
    if (file.type === 'registry:style' && resources) {
      for (const resource of resources) {
        if (!('publicUrl' in resource) || !resource.publicUrl) continue
        const font = readFileSync(join(repositoryRoot, resource.sourcePath)).toString('base64')
        content = content.replace(resource.publicUrl, `data:font/woff2;base64,${font}`)
      }
    }
    return { path: file.path, type: file.type, target: file.target, content }
  }),
  dependencies: item.dependencies,
  devDependencies: item.devDependencies,
  registryDependencies: item.registryDependencies,
  ...(item.meta ? { meta: item.meta } : {}),
})

const toCatalogEntry = (
  item: RegistryItem & { readonly meta: { readonly cvUi: CvUiMetaV1 } },
): CvTemplateCatalogEntryV1 => {
  const common = {
    id: item.name,
    name: item.title,
    summary: item.description,
    author: item.author,
    registryUrl: `/r/${item.name}.json`,
    catalogOrder: item.meta.cvUi.catalogOrder,
    traits: item.meta.cvUi.traits,
    searchAliases: item.meta.cvUi.searchAliases,
    supportedCvDataVersions: item.meta.cvUi.supportedCvDataVersions,
    license: item.meta.cvUi.license,
    preview: item.meta.cvUi.preview,
  }
  return item.meta.cvUi.status === 'deprecated'
    ? { ...common, status: 'deprecated', deprecation: item.meta.cvUi.deprecation }
    : { ...common, status: 'active' }
}

const catalogDocument = (registry: Registry): CvTemplateCatalogDocumentV1 => ({
  schemaVersion: '1.0',
  templates: registry.items
    .filter((item): item is RegistryItem & { readonly meta: { readonly cvUi: CvUiMetaV1 } } =>
      Boolean(item.meta),
    )
    .sort((left, right) => left.meta.cvUi.catalogOrder - right.meta.cvUi.catalogOrder)
    .map(toCatalogEntry),
})

const buildInto = (root: string): void => {
  const registry = readRegistry()
  const compatibility = readCompatibilityFixture()
  validateCompatibilityPaths(compatibility)
  validateRegistry(registry, compatibility)

  const schemas = {
    'cv-data/v1.json': CV_DATA_V1_SCHEMA,
    'fidelity-envelope/v1.json': CV_FIDELITY_ENVELOPE_V1_SCHEMA,
    'template-catalog/v1.json': TEMPLATE_CATALOG_V1_SCHEMA,
    'cv-ui-meta/v1.json': CV_UI_META_V1_SCHEMA,
    'provenance/v1.json': PROVENANCE_V1_SCHEMA,
    'release-manifest/v1.json': RELEASE_MANIFEST_V1_SCHEMA,
    'removal-tombstone/v1.json': REMOVAL_TOMBSTONE_V1_SCHEMA,
  } as const
  for (const [path, schema] of Object.entries(schemas)) {
    const sourceSchema = readJson(join(repositoryRoot, 'schemas', path))
    if (serializeJson(sourceSchema) !== serializeJson(schema))
      throw new Error(`Canonical schema drift: ${path}`)
    write(root, `schemas/${path}`, serializeJson(schema))
  }
  for (const item of registry.items)
    write(root, `r/${item.name}.json`, serializeJson(registryItemDocument(item)))
  for (const removal of validateRegistryLifecycle(registry, compatibility))
    write(root, `r/${removal.templateId}.json`, serializeJson(removal))

  for (const item of registry.items) {
    const resources = getTemplateResources(item.name) ?? []
    for (const resource of resources)
      write(root, resource.outputPath, readFileSync(join(repositoryRoot, resource.sourcePath)))
  }

  const catalog = serializeJson(catalogDocument(registry))
  write(root, 'catalog/templates.json', catalog)
  write(root, 'catalog/v1/templates.json', catalog)
}

const replaceOwnedPaths = (sourceRoot: string, outputRoot: string): void => {
  mkdirSync(outputRoot, { recursive: true })
  const backupRoot = mkdtempSync(join(tmpdir(), 'cv-ui-generate-backup-'))
  const replaced: string[] = []
  try {
    for (const path of GENERATED_OUTPUT_PATHS) {
      const target = join(outputRoot, path)
      if (existsSync(target)) renameSync(target, join(backupRoot, path))
      renameSync(join(sourceRoot, path), target)
      replaced.push(path)
    }
    rmSync(backupRoot, { recursive: true, force: true })
  } catch (error) {
    for (const path of replaced.reverse())
      rmSync(join(outputRoot, path), { recursive: true, force: true })
    for (const path of GENERATED_OUTPUT_PATHS) {
      const backup = join(backupRoot, path)
      if (existsSync(backup)) renameSync(backup, join(outputRoot, path))
    }
    throw error
  }
}

export const generateArtifacts = (outputRoot: string): void => {
  const stagingRoot = mkdtempSync(join(tmpdir(), 'cv-ui-generate-'))
  try {
    buildInto(stagingRoot)
    replaceOwnedPaths(stagingRoot, outputRoot)
  } finally {
    rmSync(stagingRoot, { recursive: true, force: true })
  }
}

export const checkGeneratedArtifacts = (outputRoot: string): void => {
  const expectedRoot = mkdtempSync(join(tmpdir(), 'cv-ui-generate-check-'))
  try {
    buildInto(expectedRoot)
    const changed = GENERATED_OUTPUT_PATHS.flatMap((path) =>
      findFileDrift(join(expectedRoot, path), join(outputRoot, path)).map((file) =>
        join(path, file),
      ),
    )
    if (changed.length > 0) throw new Error(`Generated output drift:\n${changed.sort().join('\n')}`)
  } finally {
    rmSync(expectedRoot, { recursive: true, force: true })
  }
}

const isMain = process.argv[1] ? resolve(process.argv[1]) === fileURLToPath(import.meta.url) : false
if (isMain) {
  const outputRoot = join(repositoryRoot, 'public')
  if (process.argv.includes('--check')) checkGeneratedArtifacts(outputRoot)
  else generateArtifacts(outputRoot)
}
