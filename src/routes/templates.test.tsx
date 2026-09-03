// @vitest-environment jsdom
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { validateCatalogSearch } from '~/lib/catalog/catalog-search'
import { parseRepeatedSearchString, stringifyRepeatedSearch } from '~/lib/search-params'
import { TemplateCatalogPage } from './templates'

const renderCatalog = async (entries: readonly string[] = ['/templates']) => {
  const rootRoute = createRootRoute()
  const indexRoute = createRoute({
    component: () => null,
    getParentRoute: () => rootRoute,
    path: '/',
  })
  const templatesRoute = createRoute({
    component: TemplateCatalogPage,
    getParentRoute: () => rootRoute,
    path: '/templates',
    validateSearch: validateCatalogSearch,
  })
  const history = createMemoryHistory({ initialEntries: [...entries] })
  const router = createRouter({
    history,
    parseSearch: parseRepeatedSearchString,
    routeTree: rootRoute.addChildren([indexRoute, templatesRoute]),
    search: { strict: true },
    stringifySearch: stringifyRepeatedSearch,
  })

  render(<RouterProvider router={router} />)
  await screen.findByRole('heading', { level: 1, name: 'Template Catalog' })

  return history
}
const cardNames = (): readonly string[] =>
  screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent ?? '')
const searchField = () => screen.getByRole('searchbox', { name: 'Search templates' })
const filter = (name: RegExp) => screen.getByRole('checkbox', { name })

afterEach(cleanup)

describe('Template Catalog cards', () => {
  it('shows the canonical entry metadata and ordered English preview pages', async () => {
    await renderCatalog()

    expect(cardNames()).toEqual(['Clearline', 'Signal Ledger'])

    const [firstCard] = screen.getAllByRole('article')

    expect(firstCard).toBeDefined()
    expect(
      within(firstCard as HTMLElement).getByRole('link', { name: 'Clearline' }),
    ).toHaveProperty('pathname', '/templates/clearline')
    expect(
      within(firstCard as HTMLElement).getByText(
        'A one-column ATS-oriented CV with restrained blue rules and one linear reading order.',
      ),
    ).toBeDefined()
    expect(
      within(firstCard as HTMLElement)
        .getAllByRole('img')
        .map((image) => [
          image.getAttribute('src'),
          image.getAttribute('width'),
          image.getAttribute('height'),
        ]),
    ).toEqual([
      ['/previews/clearline/pages/001.png', '1191', '1684'],
      ['/previews/clearline/pages/002.png', '1191', '1684'],
    ])
  })

  it('names each Controlled Trait and installation fact', async () => {
    await renderCatalog(['/templates?q=signal'])

    const [card] = screen.getAllByRole('article')

    for (const label of ['Two column', 'Visual first', 'Modern', 'Balanced', 'No photo support'])
      expect(within(card as HTMLElement).getByText(label)).toBeDefined()

    expect(within(card as HTMLElement).getByText('Alfred Mouelle')).toBeDefined()
    expect(within(card as HTMLElement).getByText('MIT')).toBeDefined()
  })
})

describe('Template Catalog accessibility', () => {
  it('names the search landmark, every filter group, and the live result count', async () => {
    await renderCatalog()

    expect(document.querySelector('search')).not.toBeNull()
    for (const label of ['Layout', 'ATS intent', 'Visual tone', 'Density', 'Photo'])
      expect(screen.getByRole('group', { name: label })).toBeDefined()

    expect(screen.getAllByRole('group')).toHaveLength(5)
    expect(screen.getByRole('status').textContent).toBe('2 templates')
    expect(searchField()).toBeDefined()
    expect(screen.getByRole('combobox', { name: 'Sort' })).toBeDefined()
  })

  it('reserves the A4 aspect ratio and never enlarges a preview page', async () => {
    await renderCatalog(['/templates?q=clearline'])

    const [page] = screen.getAllByRole('img')
    const className = page?.getAttribute('class') ?? ''

    expect(page?.getAttribute('alt')).toBe('Clearline preview page 1')
    expect(className).toContain('max-w-[210mm]')
    expect(className).toContain('h-auto')
    expect(className).toContain('w-full')
    expect(className).toContain('object-contain')
  })
})

describe('Template Catalog discovery', () => {
  it('stores normalized search text and replaces the history entry', async () => {
    const history = await renderCatalog()
    const before = history.length

    fireEvent.change(searchField(), { target: { value: '  two   column ' } })

    await waitFor(() => expect(history.location.href).toBe('/templates?q=two+column'))
    expect(cardNames()).toEqual(['Signal Ledger'])
    expect(history.length).toBe(before)
    expect(searchField()).toHaveProperty('value', '  two   column ')
  })

  it('writes repeated filter values in contract order and collapses duplicates', async () => {
    const history = await renderCatalog(['/templates?layout=two-column&layout=two-column'])

    expect(filter(/Two column/)).toHaveProperty('checked', true)

    fireEvent.click(filter(/Single column/))

    await waitFor(() =>
      expect(history.location.href).toBe('/templates?layout=single-column&layout=two-column'),
    )
    expect(cardNames()).toEqual(['Clearline', 'Signal Ledger'])
  })

  it('shows counts and disables unavailable unselected values', async () => {
    await renderCatalog(['/templates?tone=modern'])

    expect(filter(/Single column \(0\)/)).toHaveProperty('disabled', true)
    expect(filter(/Two column \(1\)/)).toHaveProperty('disabled', false)
    expect(filter(/Classic \(1\)/)).toHaveProperty('disabled', false)
  })

  it('keeps a selected zero-count value visible and enabled', async () => {
    await renderCatalog(['/templates?layout=single-column&tone=modern'])

    expect(filter(/Single column \(0\)/)).toHaveProperty('checked', true)
    expect(filter(/Single column \(0\)/)).toHaveProperty('disabled', false)
  })

  it('sorts by name and keeps the default order implicit', async () => {
    const history = await renderCatalog()

    fireEvent.change(screen.getByRole('combobox', { name: 'Sort' }), { target: { value: 'name' } })

    await waitFor(() => expect(history.location.href).toBe('/templates?sort=name'))
    expect(cardNames()).toEqual(['Clearline', 'Signal Ledger'])

    fireEvent.change(screen.getByRole('combobox', { name: 'Sort' }), {
      target: { value: 'catalog' },
    })

    await waitFor(() => expect(history.location.href).toBe('/templates'))
  })

  it('ignores unknown keys and values, then removes them on the next update', async () => {
    const history = await renderCatalog(['/templates?page=2&sort=popularity&layout=three-column'])

    expect(cardNames()).toEqual(['Clearline', 'Signal Ledger'])

    fireEvent.click(filter(/Two column/))

    await waitFor(() => expect(history.location.href).toBe('/templates?layout=two-column'))
  })

  it('restores the exact Catalog URL and discovery state on Back', async () => {
    const history = await renderCatalog(['/templates?q=ledger&layout=two-column', '/templates'])

    expect(cardNames()).toEqual(['Clearline', 'Signal Ledger'])

    history.back()

    await waitFor(() => expect(cardNames()).toEqual(['Signal Ledger']))
    expect(history.location.href).toBe('/templates?q=ledger&layout=two-column')
    expect(searchField()).toHaveProperty('value', 'ledger')
    expect(filter(/Two column/)).toHaveProperty('checked', true)
  })

  it('preserves discovery state on an empty result and clears it in one action', async () => {
    const history = await renderCatalog(['/templates?q=nothing-matches-this&layout=two-column'])

    expect(screen.queryAllByRole('article')).toEqual([])
    expect(screen.getByRole('status').textContent).toBe('0 templates')
    expect(searchField()).toHaveProperty('value', 'nothing-matches-this')
    expect(filter(/Two column/)).toHaveProperty('checked', true)

    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }))

    await waitFor(() => expect(history.location.href).toBe('/templates'))
    expect(cardNames()).toEqual(['Clearline', 'Signal Ledger'])
    expect(searchField()).toHaveProperty('value', '')
  })
})
