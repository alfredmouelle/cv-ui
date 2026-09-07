// @vitest-environment jsdom
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { parseRepeatedSearchString, stringifyRepeatedSearch } from '~/lib/search-params'
import { routeTree } from '~/routeTree.gen'
import clearlineRegistry from '../../public/r/clearline.json'

vi.mock('~/components/devtools', () => ({ default: () => null }))
vi.mock('./__root', async () => {
  const { createRootRoute } = await import('@tanstack/react-router')

  return {
    Route: createRootRoute({ notFoundComponent: () => <h1>404 - Not Found</h1> }),
  }
})

const mockMatchMedia = (matches: boolean): void => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation(() => ({
      addEventListener: vi.fn(),
      matches,
      media: '(min-width: 1024px)',
      removeEventListener: vi.fn(),
    })),
  })
}

const renderDetail = async (
  entry = '/templates/clearline',
  options: { readonly desktop?: boolean } = {},
): Promise<{
  readonly history: ReturnType<typeof createMemoryHistory>
  readonly navigate: (href: string) => Promise<void>
}> => {
  const matches = options.desktop ?? true
  mockMatchMedia(matches)

  const history = createMemoryHistory({ initialEntries: [entry] })
  const router = createRouter({
    history,
    parseSearch: parseRepeatedSearchString,
    routeTree,
    search: { strict: true },
    stringifySearch: stringifyRepeatedSearch,
  })

  render(<RouterProvider router={router} />)
  await screen.findByRole('heading', { level: 1 })

  return {
    history,
    navigate: async (href) => {
      history.push(href)
      await router.load()
    },
  }
}

const deferred = <T,>(): {
  readonly promise: Promise<T>
  readonly reject: (reason?: unknown) => void
  readonly resolve: (value: T) => void
} => {
  let resolve: (value: T) => void = () => undefined
  let reject: (reason?: unknown) => void = () => undefined
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve
    reject = promiseReject
  })

  return { promise, reject, resolve }
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('Template detail modes', () => {
  it('uses the normal not-found page for an unknown Template ID', async () => {
    mockMatchMedia(false)
    const history = createMemoryHistory({ initialEntries: ['/templates/unknown-template'] })
    const router = createRouter({
      history,
      parseSearch: parseRepeatedSearchString,
      routeTree,
      search: { strict: true },
      stringifySearch: stringifyRepeatedSearch,
    })

    render(<RouterProvider router={router} />)

    expect(await screen.findByRole('heading', { name: '404 - Not Found' })).toBeDefined()
  })

  it('shows only the ordered English Reference Output in implicit Preview mode', async () => {
    await renderDetail('/templates/clearline?lang=fr&mode=preview')

    expect(screen.getByRole('tab', { name: 'Preview' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getAllByRole('img').map((image) => image.getAttribute('src'))).toEqual([
      '/previews/clearline/pages/001.png',
      '/previews/clearline/pages/002.png',
    ])
    expect(screen.queryByText(/French/u)).toBeNull()
  })

  it('replaces history and canonicalizes invalid and default search on an internal update', async () => {
    const { history } = await renderDetail(
      '/templates/clearline?lang=fr&mode=preview&file=missing.ts',
    )
    const before = history.length

    fireEvent.click(screen.getByRole('tab', { name: 'Code' }))

    await waitFor(() => expect(history.location.href).toBe('/templates/clearline?mode=code'))
    expect(history.length).toBe(before)
  })

  it('shows component, CSS, then installed example and keeps the first file implicit', async () => {
    const { history } = await renderDetail('/templates/clearline?mode=code')
    const tabs = screen.getAllByRole('tab').map((tab) => tab.textContent)

    expect(tabs).toEqual([
      'Preview',
      'Code',
      'Info',
      'clearline.tsx',
      'clearline.css',
      'clearline.ts',
    ])
    expect(screen.getByRole('textbox', { name: 'clearline.tsx source' })).toHaveProperty(
      'value',
      expect.stringContaining('export function Clearline'),
    )

    fireEvent.click(screen.getByRole('tab', { name: 'clearline.css' }))

    await waitFor(() =>
      expect(history.location.href).toBe('/templates/clearline?mode=code&file=clearline.css'),
    )
    expect(screen.getByRole('textbox', { name: 'clearline.css source' })).toHaveProperty(
      'value',
      expect.stringContaining('@page clearline'),
    )
  })

  it('shows canonical Catalog and installation facts in Info mode', async () => {
    await renderDetail('/templates/signal-ledger?mode=info')

    expect(screen.getByText('Alfred Mouelle')).toBeDefined()
    expect(screen.getByText('MIT')).toBeDefined()
    expect(screen.getByText('Two column')).toBeDefined()
    expect(screen.getByText('/r/signal-ledger.json')).toBeDefined()
  })
})

describe('Template detail copy behavior', () => {
  it('reports source success only after Clipboard resolves and clears it on file change', async () => {
    const copy = deferred<void>()
    const writeText = vi.fn().mockReturnValue(copy.promise)
    Object.assign(navigator, { clipboard: { writeText } })
    await renderDetail('/templates/clearline?mode=code')

    fireEvent.click(screen.getByRole('button', { name: 'Copy source' }))
    expect(screen.queryByText('Copied')).toBeNull()
    const component = clearlineRegistry.files.find(
      (file) => file.path === 'registry/clearline/clearline.tsx',
    )
    expect(writeText).toHaveBeenCalledWith(component?.content)

    copy.resolve()
    await screen.findByText('Copied')
    fireEvent.click(screen.getByRole('tab', { name: 'clearline.css' }))
    await waitFor(() => expect(screen.queryByText('Copied')).toBeNull())

    fireEvent.click(screen.getByRole('button', { name: 'Copy source' }))
    await screen.findByText('Copied')
    fireEvent.click(screen.getByRole('tab', { name: 'Info' }))
    await waitFor(() => expect(screen.queryByText('Copied')).toBeNull())
  })

  it('keeps exact text visible, focused, and selected after Clipboard rejects', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    })
    await renderDetail('/templates/clearline?mode=code')
    const source = screen.getByRole('textbox', { name: 'clearline.tsx source' })
    if (!(source instanceof HTMLTextAreaElement))
      throw new Error('Source control is not a textarea')
    const select = vi.spyOn(source, 'select')

    fireEvent.click(screen.getByRole('button', { name: 'Copy source' }))

    expect(
      await screen.findByText('Copy failed. Select the text, then press Ctrl+C or Command+C.'),
    ).toBeDefined()
    expect(document.activeElement).toBe(source)
    expect(select).toHaveBeenCalledOnce()
    expect(source).toHaveProperty('value', expect.stringContaining('export function Clearline'))
    expect(document.execCommand).toBeUndefined()
  })

  it('offers all four commands and retains copy state until the command changes', async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
    await renderDetail()
    const install = screen.getByRole('complementary', { name: 'Install Clearline' })

    for (const label of ['Named', 'Direct HTTPS', 'View', 'Dry run'])
      expect(within(install).getByRole('option', { name: label })).toBeDefined()

    const commandSelect = within(install).getByRole('combobox', { name: 'Command' })
    const commandText = within(install).getByRole('textbox', { name: 'Install command' })
    const commands = [
      ['named', 'npx shadcn@latest add @cv-ui/clearline'],
      ['direct', 'npx shadcn@latest add https://cv-ui.alfredmouelle.com/r/clearline.json'],
      ['view', 'npx shadcn@latest view @cv-ui/clearline'],
      ['dry-run', 'npx shadcn@latest add @cv-ui/clearline --dry-run'],
    ] as const

    fireEvent.click(within(install).getByRole('button', { name: 'Copy command' }))
    await within(install).findByText('Copied')

    for (const [key, text] of commands) {
      fireEvent.change(commandSelect, { target: { value: key } })
      expect(commandText).toHaveProperty('value', text)
    }

    expect(within(install).queryByText('Copied')).toBeNull()
  })

  it('uses the same recovery behavior when command copy fails', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    })
    await renderDetail()
    const command = screen.getByRole('textbox', { name: 'Install command' })
    if (!(command instanceof HTMLTextAreaElement))
      throw new Error('Install command control is not a textarea')
    const select = vi.spyOn(command, 'select')

    fireEvent.click(screen.getByRole('button', { name: 'Copy command' }))

    expect(
      await screen.findByText('Copy failed. Select the text, then press Ctrl+C or Command+C.'),
    ).toBeDefined()
    expect(document.activeElement).toBe(command)
    expect(select).toHaveBeenCalledOnce()
  })
})

describe('Template detail responsive install sheet', () => {
  it('uses a sticky desktop panel at 1024 px and wider', async () => {
    await renderDetail()

    expect(screen.getByRole('complementary', { name: 'Install Clearline' }).className).toContain(
      'lg:sticky',
    )
    expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 1024px)')
    expect(screen.queryByRole('button', { name: 'Install' })).toBeNull()
  })

  it('traps focus, stays open after copy, and returns focus for each close action', async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
    await renderDetail('/templates/clearline', { desktop: false })
    const trigger = screen.getByRole('button', { name: 'Install' })

    fireEvent.click(trigger)
    const dialog = await screen.findByRole('dialog', { name: 'Install Clearline' })
    expect(dialog.contains(document.activeElement)).toBe(true)
    fireEvent.click(within(dialog).getByRole('button', { name: 'Copy command' }))
    await within(dialog).findByText('Copied')
    expect(dialog).toBeDefined()

    fireEvent.keyDown(dialog, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(document.activeElement).toBe(trigger)

    fireEvent.click(trigger)
    fireEvent.click(await screen.findByRole('button', { name: 'Close install panel' }))
    await waitFor(() => expect(document.activeElement).toBe(trigger))

    fireEvent.click(trigger)
    await screen.findByRole('dialog')
    fireEvent.pointerDown(screen.getByTestId('install-backdrop'))
    fireEvent.click(screen.getByTestId('install-backdrop'))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(document.activeElement).toBe(trigger)
  })

  it('closes on route navigation without storing sheet state in the URL', async () => {
    const { history, navigate } = await renderDetail('/templates/clearline?mode=info', {
      desktop: false,
    })
    fireEvent.click(screen.getByRole('button', { name: 'Install' }))
    await screen.findByRole('dialog')

    await navigate('/templates')

    expect(await screen.findByRole('heading', { name: 'Template Catalog' })).toBeDefined()
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(history.location.href).toBe('/templates')
  })
})
