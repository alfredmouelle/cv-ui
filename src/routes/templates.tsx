import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useState } from 'react'

import type { TemplateCatalogEntry } from '~/lib/catalog/catalog-document'
import { TEMPLATE_CATALOG } from '~/lib/catalog/catalog-document'
import {
  CATALOG_FILTER_DIMENSIONS,
  CATALOG_TRAIT_LABELS,
  type CatalogFilterKey,
  normalizeQueryText,
  selectedFilterValues,
  validateCatalogSearch,
} from '~/lib/catalog/catalog-search'
import type { CatalogFacet } from '~/lib/catalog/discovery'
import { discoverTemplates } from '~/lib/catalog/discovery'
import { siteConfig } from '~/lib/site-config'

export const Route = createFileRoute('/templates')({
  component: TemplateCatalogPage,
  head: () => ({ meta: [{ title: `CV templates · ${siteConfig.name}` }] }),
  validateSearch: validateCatalogSearch,
})

export function TemplateCatalogPage() {
  const search = useSearch({ from: '/templates' })
  const navigate = useNavigate()
  const { results, facets } = discoverTemplates(TEMPLATE_CATALOG, search)
  const replaceSearch = (next: Record<string, unknown>) => {
    void navigate({ replace: true, search: validateCatalogSearch(next), to: '/templates' })
  }
  const toggleFilter = (key: CatalogFilterKey, value: string) => {
    const selected = selectedFilterValues(search, key)
    const next = selected.includes(value)
      ? selected.filter((candidate) => candidate !== value)
      : [...selected, value]

    replaceSearch({ ...search, [key]: next })
  }

  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <h1 className="font-heading font-medium text-4xl tracking-[-0.04em]">Template Catalog</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          The same canonical entries software agents read. Search, filter, and compare every English
          Reference Output.
        </p>

        <search className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end">
          <CatalogSearchField
            onQueryChange={(text) => replaceSearch({ ...search, q: text })}
            query={search.q ?? ''}
          />
          <div className="flex flex-col gap-2">
            <label className="font-medium text-sm" htmlFor="catalog-sort">
              Sort
            </label>
            <select
              className="h-10 cursor-pointer rounded-md border border-input bg-card px-3 text-sm"
              id="catalog-sort"
              onChange={(event) => replaceSearch({ ...search, sort: event.target.value })}
              value={search.sort ?? 'catalog'}
            >
              <option value="catalog">Catalog order</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </search>

        <div className="mt-8 grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
          <div className="grid gap-6">
            {facets.map((facet) => (
              <CatalogFacetGroup
                facet={facet}
                key={facet.key}
                onToggle={(value) => toggleFilter(facet.key, value)}
              />
            ))}
          </div>

          <section className="grid gap-6">
            <p className="text-muted-foreground text-sm" role="status">
              {results.length === 1 ? '1 template' : `${results.length} templates`}
            </p>

            {results.length === 0 ? (
              <div className="rounded-2xl border border-border border-dashed p-8 text-center">
                <p className="font-medium">No template matches this search and these filters.</p>
                <p className="mt-2 text-muted-foreground text-sm">
                  Your search text and filters stay active until you clear them.
                </p>
                <button
                  className="mt-6 cursor-pointer rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm hover:bg-primary/90"
                  onClick={() => replaceSearch({})}
                  type="button"
                >
                  Clear all
                </button>
              </div>
            ) : (
              results.map((entry) => <TemplateCard entry={entry} key={entry.id} />)
            )}
          </section>
        </div>
      </div>
    </main>
  )
}

function CatalogSearchField({
  onQueryChange,
  query,
}: {
  readonly onQueryChange: (text: string) => void
  readonly query: string
}) {
  const [urlQuery, setUrlQuery] = useState(query)
  const [text, setText] = useState(query)

  if (query !== urlQuery) {
    setUrlQuery(query)
    if (query !== normalizeQueryText(text)) setText(query)
  }

  return (
    <div className="flex flex-1 flex-col gap-2">
      <label className="font-medium text-sm" htmlFor="catalog-search">
        Search templates
      </label>
      <input
        autoComplete="off"
        className="h-10 rounded-md border border-input bg-card px-3 text-sm"
        id="catalog-search"
        onChange={(event) => {
          setText(event.target.value)
          onQueryChange(event.target.value)
        }}
        placeholder="ATS, two column, modern"
        type="search"
        value={text}
      />
    </div>
  )
}

function CatalogFacetGroup({
  facet,
  onToggle,
}: {
  readonly facet: CatalogFacet
  readonly onToggle: (value: string) => void
}) {
  return (
    <fieldset className="grid gap-2">
      <legend className="font-medium text-sm">{facet.label}</legend>
      {facet.values.map((option) => (
        <label
          className="flex cursor-pointer items-center gap-2 text-sm has-disabled:cursor-not-allowed has-disabled:text-muted-foreground"
          key={option.value}
        >
          <input
            checked={option.selected}
            className="size-4 cursor-pointer accent-primary disabled:cursor-not-allowed"
            disabled={option.disabled}
            onChange={() => onToggle(option.value)}
            type="checkbox"
          />
          <span>
            {option.label} <span className="text-muted-foreground text-xs">({option.count})</span>
          </span>
        </label>
      ))}
    </fieldset>
  )
}

function TemplateCard({ entry }: { readonly entry: TemplateCatalogEntry }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] lg:items-start">
        <div>
          <h2 className="font-heading font-medium text-2xl tracking-tight">
            <a className="cursor-pointer hover:underline" href={`/templates/${entry.id}`}>
              {entry.name}
            </a>
          </h2>
          <p className="mt-2 text-muted-foreground">{entry.summary}</p>

          <ul className="mt-4 flex flex-wrap gap-2">
            {CATALOG_FILTER_DIMENSIONS.map((dimension) => (
              <li
                className="rounded-full border border-border px-3 py-1 text-xs"
                key={dimension.key}
              >
                {CATALOG_TRAIT_LABELS[entry.traits[dimension.trait]]}
              </li>
            ))}
          </ul>

          <dl className="mt-4 grid gap-1 text-sm">
            <div className="flex gap-2">
              <dt className="text-muted-foreground">Author</dt>
              <dd>{entry.author}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-muted-foreground">License</dt>
              <dd>{entry.license}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-muted-foreground">CV Data</dt>
              <dd>{entry.supportedCvDataVersions.join(', ')}</dd>
            </div>
          </dl>
        </div>

        <ol className="flex gap-3">
          {entry.preview.pages.map((page, index) => (
            <li className="min-w-0 flex-1" key={page.src}>
              <img
                alt={`${entry.name} preview page ${index + 1}`}
                className="h-auto w-full max-w-[210mm] rounded-md border border-border object-contain"
                height={page.height}
                loading="lazy"
                src={page.src}
                width={page.width}
              />
            </li>
          ))}
        </ol>
      </div>
    </article>
  )
}
