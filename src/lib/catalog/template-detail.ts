import clearlineRegistry from '../../../public/r/clearline.json'
import signalLedgerRegistry from '../../../public/r/signal-ledger.json'
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

export type TemplateDetail = {
  readonly entry: TemplateCatalogEntry
  readonly files: readonly [TemplateSourceFile, TemplateSourceFile, TemplateSourceFile]
}

const registryDocuments = [
  clearlineRegistry,
  signalLedgerRegistry,
] satisfies readonly RegistryDocument[]

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

export function getTemplateDetail(templateId: string): TemplateDetail | undefined {
  const entry = TEMPLATE_CATALOG.templates.find((candidate) => candidate.id === templateId)
  const document = registryDocuments.find((candidate) => candidate.name === templateId)

  if (entry === undefined || document === undefined) return undefined
  return { entry, files: readSourceFiles(document) }
}
