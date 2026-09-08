import { parseRemovalTombstoneV1, type RemovalTombstoneV1 } from '../../../contracts/compatibility'
import clearlineRegistry from '../../../public/r/clearline.json'
import signalLedgerRegistry from '../../../public/r/signal-ledger.json'
import registry from '../../../registry.json'
import { TEMPLATE_CATALOG, type TemplateCatalogEntry } from './catalog-document'

type RegistryFile = {
  readonly path: string
  readonly type: string
  readonly target: string
  readonly content: string
}

type RegistryDocument = {
  readonly name: string
  readonly files: readonly RegistryFile[]
}

export type TemplateSourceFile = {
  readonly basename: string
  readonly content: string
  readonly target: string
  readonly type: 'component' | 'css' | 'example'
}

export type AvailableTemplateDetail = {
  readonly kind: 'available'
  readonly entry: TemplateCatalogEntry
  readonly files: readonly [TemplateSourceFile, TemplateSourceFile, TemplateSourceFile]
}
export type RemovedTemplateDetail = {
  readonly kind: 'removed'
  readonly tombstone: RemovalTombstoneV1
}
export type TemplateDetail = AvailableTemplateDetail | RemovedTemplateDetail

const parseRegistryFile = (value: unknown): RegistryFile | undefined => {
  if (value === null || typeof value !== 'object') return undefined
  const path = Reflect.get(value, 'path')
  const type = Reflect.get(value, 'type')
  const target = Reflect.get(value, 'target')
  const content = Reflect.get(value, 'content')
  if (
    typeof path !== 'string' ||
    typeof type !== 'string' ||
    typeof target !== 'string' ||
    typeof content !== 'string'
  )
    return undefined
  return { path, type, target, content }
}

const parseRegistryDocument = (value: unknown): RegistryDocument | undefined => {
  if (value === null || typeof value !== 'object') return undefined
  const name = Reflect.get(value, 'name')
  const files = Reflect.get(value, 'files')
  if (typeof name !== 'string' || !Array.isArray(files)) return undefined
  const parsedFiles = files.map(parseRegistryFile)
  if (parsedFiles.some((file) => file === undefined)) return undefined
  return { name, files: parsedFiles.filter((file) => file !== undefined) }
}

const registryDocuments = [clearlineRegistry, signalLedgerRegistry].flatMap((document) => {
  const parsed = parseRegistryDocument(document)
  return parsed ? [parsed] : []
})

const sourceFileType = (file: RegistryFile): TemplateSourceFile['type'] | undefined => {
  if (file.type === 'registry:component') return 'component'
  if (file.type === 'registry:style') return 'css'
  if (file.type === 'registry:lib') return 'example'
  return undefined
}

const basename = (path: string): string => path.split('/').at(-1) ?? path

const readSourceFiles = (
  document: RegistryDocument,
): readonly [TemplateSourceFile, TemplateSourceFile, TemplateSourceFile] => {
  const files = document.files.flatMap((file) => {
    const type = sourceFileType(file)

    return type === undefined
      ? []
      : [{ basename: basename(file.target), content: file.content, target: file.target, type }]
  })
  const component = files.find((file) => file.type === 'component')
  const css = files.find((file) => file.type === 'css')
  const example = files.find((file) => file.type === 'example')

  if (component === undefined || css === undefined || example === undefined)
    throw new Error(`Template ${document.name} does not contain its three installed source files`)

  return [component, css, example]
}

export function getTemplateDetail(
  templateId: string,
  removalInputs: readonly unknown[] = registry.removals,
): TemplateDetail | undefined {
  const entry = TEMPLATE_CATALOG.templates.find((candidate) => candidate.id === templateId)
  const document = registryDocuments.find((candidate) => candidate.name === templateId)

  if (entry !== undefined && document !== undefined)
    return { kind: 'available', entry, files: readSourceFiles(document) }

  const tombstone = removalInputs
    .map((removal) => parseRemovalTombstoneV1(removal))
    .find((removal) => removal.templateId === templateId)
  return tombstone ? { kind: 'removed', tombstone } : undefined
}
