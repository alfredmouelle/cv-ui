import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

export const listFilePaths = (root: string): string[] => {
  if (!existsSync(root)) return []
  return readdirSync(root, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(root, entry.name)
      return entry.isDirectory() ? listFilePaths(path) : [path]
    })
    .sort()
}

export const findFileDrift = (expectedRoot: string, actualRoot: string): string[] => {
  const expectedFiles = listFilePaths(expectedRoot).map((file) => relative(expectedRoot, file))
  const actualFiles = listFilePaths(actualRoot).map((file) => relative(actualRoot, file))
  const files = new Set([...expectedFiles, ...actualFiles])

  return [...files].filter((file) => {
    const expected = join(expectedRoot, file)
    const actual = join(actualRoot, file)
    return (
      !existsSync(expected) ||
      !existsSync(actual) ||
      !readFileSync(expected).equals(readFileSync(actual))
    )
  })
}
