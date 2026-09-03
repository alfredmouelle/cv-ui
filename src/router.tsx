import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { ThemeProvider } from './components/theme-provider'
import { parseRepeatedSearchString, stringifyRepeatedSearch } from './lib/search-params'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    parseSearch: parseRepeatedSearchString,
    search: { strict: true },
    stringifySearch: stringifyRepeatedSearch,

    Wrap: (props: { children: ReactNode }) => (
      <ThemeProvider defaultTheme="system">{props.children}</ThemeProvider>
    ),
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
