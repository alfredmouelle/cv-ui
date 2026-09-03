import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'

import { IMMUTABLE_CACHE_CONTROL } from './contracts/catalog.ts'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    nitro({
      routeRules: { '/schemas/**': { headers: { 'cache-control': IMMUTABLE_CACHE_CONTROL } } },
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
