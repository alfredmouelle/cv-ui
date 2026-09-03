import { Link } from '@tanstack/react-router'

import { ThemeToggle } from '~/components/theme-toggle'
import { siteConfig } from '~/lib/site-config'

export function SiteHeader() {
  return (
    <header className="border-border border-b">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-5">
        <Link
          aria-label={`${siteConfig.name} home`}
          className="flex cursor-pointer items-center gap-3"
          to="/"
        >
          <img
            alt=""
            aria-hidden="true"
            className="size-8 rounded-lg"
            height="32"
            src="/logo192.png"
            width="32"
          />
          <span className="font-heading font-semibold tracking-tight">{siteConfig.name}</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link className="cursor-pointer font-medium text-sm hover:underline" to="/templates">
            Templates
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
