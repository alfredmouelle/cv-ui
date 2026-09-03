import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const previewInputFiles = new Set([
  '.github/workflows/ci.yml',
  '.github/workflows/gate.yml',
  'package.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'registry.json',
  'src/styles.css',
  'tsr.config.json',
])
const previewInputDirectories = [
  '.github/actions/',
  'contracts/',
  'fixtures/cv/',
  'public/previews/',
  'registry/',
  'scripts/',
]
const previewInputConfigurations =
  /^(?:playwright|postcss|tailwind|vite|vitest)\.config\.[cm]?[jt]sx?$|^tsconfig(?:\.[^/]+)?\.json$/u

export const isPreviewInput = (path: string): boolean =>
  previewInputFiles.has(path) ||
  previewInputConfigurations.test(path) ||
  previewInputDirectories.some((directory) => path.startsWith(directory))

export const hasPreviewInput = (paths: readonly string[]): boolean => paths.some(isPreviewInput)

const isMain = process.argv[1] ? resolve(process.argv[1]) === fileURLToPath(import.meta.url) : false
if (isMain) {
  const changedPaths = readFileSync(0, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
  process.stdout.write(`previews=${hasPreviewInput(changedPaths)}\n`)
}
