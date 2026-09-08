import {
  createFileRoute,
  Link,
  notFound,
  useLocation,
  useNavigate,
  useParams,
  useSearch,
} from '@tanstack/react-router'
import { Check, Clipboard, Download, X } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useState, useSyncExternalStore } from 'react'

import { CATALOG_TRAIT_LABELS } from '~/lib/catalog/catalog-search'
import { getTemplateDetail, type TemplateSourceFile } from '~/lib/catalog/template-detail'
import { siteConfig } from '~/lib/site-config'

export type TemplateDetailMode = 'preview' | 'code' | 'info'
export type TemplateDetailSearch = {
  readonly mode?: Exclude<TemplateDetailMode, 'preview'>
  readonly file?: string
}

type CommandKey = 'named' | 'direct' | 'view' | 'dry-run'
type Command = {
  readonly key: CommandKey
  readonly label: string
  readonly text: string
}

const COPY_FAILURE = 'Copy failed. Select the text, then press Ctrl+C or Command+C.'
const DESKTOP_INSTALL_QUERY = '(min-width: 1024px)'
const MODE_LABELS = { preview: 'Preview', code: 'Code', info: 'Info' } as const

const subscribeToDesktopInstall = (onChange: () => void): (() => void) => {
  const media = window.matchMedia(DESKTOP_INSTALL_QUERY)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

const desktopInstallSnapshot = (): boolean => window.matchMedia(DESKTOP_INSTALL_QUERY).matches
const serverDesktopInstallSnapshot = (): boolean => false

const firstString = (value: unknown): string | undefined => {
  const first = Array.isArray(value) ? value[0] : value
  return typeof first === 'string' ? first : undefined
}

export function validateTemplateDetailSearch(raw: Record<string, unknown>): TemplateDetailSearch {
  const rawMode = firstString(raw.mode)
  const mode = rawMode === 'code' || rawMode === 'info' ? rawMode : undefined
  const file = firstString(raw.file)?.trim()

  return {
    ...(mode === undefined ? {} : { mode }),
    ...(mode === 'code' && file !== undefined && file !== '' ? { file } : {}),
  }
}

export const Route = createFileRoute('/templates_/$templateId')({
  beforeLoad: ({ params }) => {
    if (getTemplateDetail(params.templateId) === undefined) throw notFound()
  },
  component: TemplateDetailPage,
  head: ({ params }) => {
    const detail = getTemplateDetail(params.templateId)
    const name =
      detail?.kind === 'available'
        ? detail.entry.name
        : (detail?.tombstone.templateId ?? 'Template')
    return { meta: [{ title: `${name} · ${siteConfig.name}` }] }
  },
  validateSearch: validateTemplateDetailSearch,
})

export function TemplateDetailPage() {
  const { templateId } = useParams({ from: '/templates_/$templateId' })
  const search = useSearch({ from: '/templates_/$templateId' })
  const navigate = useNavigate({ from: '/templates/$templateId' })
  const detail = getTemplateDetail(templateId)

  if (detail === undefined) throw notFound()
  if (detail.kind === 'removed') return <RemovedTemplatePage tombstone={detail.tombstone} />

  const mode = search.mode ?? 'preview'
  const [firstFile] = detail.files
  const selectedFile =
    mode === 'code'
      ? (detail.files.find((file) => file.basename === search.file) ?? firstFile)
      : firstFile
  const replaceSearch = (nextMode: TemplateDetailMode, file?: TemplateSourceFile) => {
    const next = {
      ...(nextMode === 'preview' ? {} : { mode: nextMode }),
      ...(nextMode === 'code' && file !== undefined && file !== firstFile
        ? { file: file.basename }
        : {}),
    } satisfies TemplateDetailSearch

    void navigate({ replace: true, search: next })
  }

  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <header>
          <Link
            className="cursor-pointer text-muted-foreground text-sm hover:text-foreground"
            to="/templates"
          >
            Template Catalog
          </Link>
          <h1 className="mt-4 font-heading font-medium text-4xl tracking-[-0.04em]">
            {detail.entry.name}
          </h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">{detail.entry.summary}</p>
        </header>

        <div
          aria-label="Detail mode"
          className="mt-8 flex gap-1 border-border border-b"
          role="tablist"
        >
          {(['preview', 'code', 'info'] as const).map((option) => (
            <button
              aria-selected={mode === option}
              className="cursor-pointer border-transparent border-b-2 px-4 py-3 font-medium text-sm capitalize aria-selected:border-primary aria-selected:text-primary"
              key={option}
              onClick={() => replaceSearch(option)}
              role="tab"
              type="button"
            >
              {MODE_LABELS[option]}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <section aria-label={`${detail.entry.name} ${mode}`}>
            {mode === 'preview' ? <Preview entry={detail.entry} /> : null}
            {mode === 'code' ? (
              <SourceViewer
                files={detail.files}
                onFileChange={(file) => replaceSearch('code', file)}
                selectedFile={selectedFile}
              />
            ) : null}
            {mode === 'info' ? <TemplateInfo entry={detail.entry} /> : null}
          </section>

          <ResponsiveInstallPanel
            key={`${mode}:${selectedFile.basename}`}
            name={detail.entry.name}
            templateId={templateId}
          />
        </div>
      </div>
    </main>
  )
}

function Preview({
  entry,
}: {
  readonly entry: Extract<
    NonNullable<ReturnType<typeof getTemplateDetail>>,
    { kind: 'available' }
  >['entry']
}) {
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-heading font-medium text-2xl">English Reference Output</h2>
          <p className="mt-1 text-muted-foreground text-sm">
            Approved A4 output, shown in page order.
          </p>
        </div>
        <a
          className="hidden cursor-pointer items-center gap-2 rounded-md border border-border bg-card px-3 py-2 font-medium text-sm hover:bg-muted sm:flex"
          href={entry.preview.pdf}
        >
          <Download aria-hidden="true" className="size-4" />
          PDF
        </a>
      </div>
      <ol className="mt-6 grid gap-6 xl:grid-cols-2">
        {entry.preview.pages.map((page, index) => (
          <li key={page.src}>
            <img
              alt={`${entry.name} English Reference Output page ${index + 1}`}
              className="h-auto w-full max-w-[210mm] rounded-md border border-border bg-white object-contain shadow-sm"
              height={page.height}
              src={page.src}
              width={page.width}
            />
          </li>
        ))}
      </ol>
    </div>
  )
}

function SourceViewer({
  files,
  onFileChange,
  selectedFile,
}: {
  readonly files: readonly TemplateSourceFile[]
  readonly onFileChange: (file: TemplateSourceFile) => void
  readonly selectedFile: TemplateSourceFile
}) {
  const sourceId = `source-${selectedFile.basename}`

  return (
    <div>
      <div aria-label="Installed source file" className="flex flex-wrap gap-2" role="tablist">
        {files.map((file) => (
          <button
            aria-selected={file === selectedFile}
            className="cursor-pointer rounded-md border border-border bg-card px-3 py-2 font-mono text-sm aria-selected:border-primary aria-selected:bg-secondary"
            key={file.basename}
            onClick={() => onFileChange(file)}
            role="tab"
            type="button"
          >
            {file.basename}
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-medium font-mono text-sm">{selectedFile.target}</h2>
            <p className="mt-1 text-muted-foreground text-xs">Complete installed file</p>
          </div>
          <CopyButton
            key={selectedFile.basename}
            label="Copy source"
            targetId={sourceId}
            text={selectedFile.content}
          />
        </div>
        <textarea
          aria-label={`${selectedFile.basename} source`}
          className="scrollbar block h-[65svh] w-full resize-none whitespace-pre rounded-md bg-muted p-4 font-mono text-xs leading-5 outline-none focus:ring-2 focus:ring-ring"
          id={sourceId}
          readOnly
          spellCheck={false}
          value={selectedFile.content}
        />
      </div>
    </div>
  )
}

function TemplateInfo({
  entry,
}: {
  readonly entry: Extract<
    NonNullable<ReturnType<typeof getTemplateDetail>>,
    { kind: 'available' }
  >['entry']
}) {
  const deprecationFacts =
    entry.status === 'deprecated'
      ? [
          ['Deprecation reason', entry.deprecation.reason],
          ['Deprecation date', entry.deprecation.date],
          ...(entry.deprecation.replacementTemplateId
            ? [['Replacement Template ID', entry.deprecation.replacementTemplateId]]
            : []),
        ]
      : []
  const facts = [
    ['Author', entry.author],
    ['License', entry.license],
    ['Registry', entry.registryUrl],
    ['CV Data', entry.supportedCvDataVersions.join(', ')],
    ['Layout', CATALOG_TRAIT_LABELS[entry.traits.layout]],
    ['ATS intent', CATALOG_TRAIT_LABELS[entry.traits.atsIntent]],
    ['Visual tone', CATALOG_TRAIT_LABELS[entry.traits.visualTone]],
    ['Density', CATALOG_TRAIT_LABELS[entry.traits.density]],
    ['Photo', CATALOG_TRAIT_LABELS[entry.traits.photoSupport]],
    ['Status', entry.status],
    ...deprecationFacts,
  ] as const

  return (
    <div>
      <h2 className="font-heading font-medium text-2xl">Canonical facts</h2>
      <dl className="mt-6 divide-y divide-border rounded-xl border border-border bg-card px-5">
        {facts.map(([label, value]) => (
          <div className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr]" key={label}>
            <dt className="text-muted-foreground text-sm">{label}</dt>
            <dd className="break-all font-medium text-sm">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

const REMOVAL_REASON_LABELS = {
  'legal-risk': 'Legal risk',
  'security-risk': 'Security risk',
  'redistribution-unavailable': 'Artifact redistribution unavailable',
} as const

function RemovedTemplatePage({
  tombstone,
}: {
  readonly tombstone: Extract<
    NonNullable<ReturnType<typeof getTemplateDetail>>,
    { kind: 'removed' }
  >['tombstone']
}) {
  const facts = [
    ['Template ID', tombstone.templateId],
    ['Status', tombstone.status],
    ['Reason', REMOVAL_REASON_LABELS[tombstone.reason]],
    ['Removal date', tombstone.removalDate],
    ...(tombstone.replacementTemplateId
      ? ([['Replacement Template ID', tombstone.replacementTemplateId]] as const)
      : []),
  ] as const

  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <Link
          className="cursor-pointer text-muted-foreground text-sm hover:text-foreground"
          to="/templates"
        >
          Template Catalog
        </Link>
        <h1 className="mt-4 font-heading font-medium text-4xl tracking-[-0.04em]">
          {tombstone.templateId}
        </h1>
        <p className="mt-3 text-muted-foreground">This CV Template was removed.</p>
        <dl className="mt-8 divide-y divide-border rounded-xl border border-border bg-card px-5">
          {facts.map(([label, value]) => (
            <div className="grid gap-1 py-4 sm:grid-cols-[12rem_1fr]" key={label}>
              <dt className="text-muted-foreground text-sm">{label}</dt>
              <dd className="break-all font-medium text-sm">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </main>
  )
}

function useDesktopInstallPanel(): boolean {
  return useSyncExternalStore(
    subscribeToDesktopInstall,
    desktopInstallSnapshot,
    serverDesktopInstallSnapshot,
  )
}

function ResponsiveInstallPanel({
  name,
  templateId,
}: {
  readonly name: string
  readonly templateId: string
}) {
  const desktop = useDesktopInstallPanel()
  const href = useLocation({ select: (location) => location.href })

  if (desktop)
    return (
      <aside aria-label={`Install ${name}`} className="lg:sticky lg:top-6">
        <InstallPanel name={name} templateId={templateId} />
      </aside>
    )

  return <MobileInstallSheet key={href} name={name} templateId={templateId} />
}

function MobileInstallSheet({
  name,
  templateId,
}: {
  readonly name: string
  readonly templateId: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog.Root onOpenChange={setOpen} open={open}>
      <Dialog.Trigger asChild>
        <button
          className="fixed right-4 bottom-4 z-30 cursor-pointer rounded-full bg-primary px-5 py-3 font-medium text-primary-foreground shadow-lg"
          type="button"
        >
          Install
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" data-testid="install-backdrop" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 max-h-[90svh] overflow-y-auto rounded-t-2xl border-border border-t bg-background p-5 shadow-2xl focus:outline-none">
          <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
            <Dialog.Title className="font-heading font-medium text-xl">Install {name}</Dialog.Title>
            <Dialog.Close asChild>
              <button
                aria-label="Close install panel"
                className="cursor-pointer rounded-md p-2 hover:bg-muted"
                type="button"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            Copy one of the supported shadcn installation or inspection commands.
          </Dialog.Description>
          <div className="mx-auto mt-4 max-w-xl">
            <InstallPanel name={name} templateId={templateId} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function InstallPanel({
  name,
  templateId,
}: {
  readonly name: string
  readonly templateId: string
}) {
  const commands = [
    { key: 'named', label: 'Named', text: `npx shadcn@latest add @cv-ui/${templateId}` },
    {
      key: 'direct',
      label: 'Direct HTTPS',
      text: `npx shadcn@latest add https://cv-ui.alfredmouelle.com/r/${templateId}.json`,
    },
    { key: 'view', label: 'View', text: `npx shadcn@latest view @cv-ui/${templateId}` },
    {
      key: 'dry-run',
      label: 'Dry run',
      text: `npx shadcn@latest add @cv-ui/${templateId} --dry-run`,
    },
  ] as const satisfies readonly Command[]
  const [commandKey, setCommandKey] = useState<CommandKey>('named')
  const command = commands.find((candidate) => candidate.key === commandKey) ?? commands[0]
  const commandTextId = `command-text-${templateId}`

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-heading font-medium text-xl">Install {name}</h2>
      <p className="mt-2 text-muted-foreground text-sm">
        Choose the named command, direct fallback, inspection, or dry run.
      </p>
      <label className="mt-5 block font-medium text-sm" htmlFor={`command-${templateId}`}>
        Command
      </label>
      <select
        className="mt-2 h-10 w-full cursor-pointer rounded-md border border-input bg-background px-3 text-sm"
        id={`command-${templateId}`}
        onChange={(event) => {
          const next = commands.find((candidate) => candidate.key === event.target.value)
          if (next !== undefined) setCommandKey(next.key)
        }}
        value={commandKey}
      >
        {commands.map((option) => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="mt-4">
        <CopyButton
          key={command.key}
          label="Copy command"
          targetId={commandTextId}
          text={command.text}
        />
      </div>
      <textarea
        aria-label="Install command"
        className="mt-3 block h-24 w-full resize-none rounded-md bg-muted p-3 font-mono text-xs leading-5 outline-none focus:ring-2 focus:ring-ring"
        id={commandTextId}
        readOnly
        spellCheck={false}
        value={command.text}
      />
      <p className="mt-4 text-muted-foreground text-xs">
        The shadcn CLI reports conflicts and command failures. Select the direct command if the
        named registry is unavailable.
      </p>
    </div>
  )
}

function CopyButton({
  label,
  targetId,
  text,
}: {
  readonly label: string
  readonly targetId: string
  readonly text: string
}) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle')
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setStatus('copied')
    } catch {
      setStatus('failed')
      const field = document.getElementById(targetId)
      if (field instanceof HTMLTextAreaElement) {
        field.focus()
        field.select()
      }
    }
  }

  return (
    <div>
      <button
        className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-3 py-2 font-medium text-primary-foreground text-sm hover:bg-primary/90"
        onClick={() => void copy()}
        type="button"
      >
        {status === 'copied' ? (
          <Check aria-hidden="true" className="size-4" />
        ) : (
          <Clipboard aria-hidden="true" className="size-4" />
        )}
        {label}
      </button>
      <p className="mt-2 text-sm" role="status">
        {status === 'copied' ? 'Copied' : null}
        {status === 'failed' ? COPY_FAILURE : null}
      </p>
    </div>
  )
}
