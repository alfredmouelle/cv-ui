import { createFileRoute, Link } from '@tanstack/react-router'

import { TEMPLATE_CATALOG } from '~/lib/catalog/catalog-document'
import { siteConfig } from '~/lib/site-config'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-12 sm:py-20">
        <section className="max-w-3xl">
          <p className="font-mono text-primary text-xs uppercase tracking-[0.16em]">
            {TEMPLATE_CATALOG.templates.length} templates, one contract
          </p>
          <h1 className="mt-4 text-balance font-heading font-medium text-5xl tracking-[-0.05em] sm:text-7xl">
            CV templates you can copy, install, and trust.
          </h1>
          <p className="mt-6 text-balance text-lg text-muted-foreground sm:text-xl">
            {siteConfig.description}
          </p>
          <Link
            className="mt-8 inline-flex cursor-pointer items-center rounded-md bg-primary px-5 py-3 font-medium text-primary-foreground text-sm hover:bg-primary/90"
            to="/templates"
          >
            Browse the Template Catalog
          </Link>
        </section>
      </div>
    </main>
  )
}
