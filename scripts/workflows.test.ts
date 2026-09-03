import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url))
const readWorkflow = (path: string): string => readFileSync(join(repositoryRoot, path), 'utf8')
const ci = readWorkflow('.github/workflows/ci.yml')
const gate = readWorkflow('.github/workflows/gate.yml')
const setup = readWorkflow('.github/actions/setup/action.yml')
const all = [ci, gate, setup]

const listUses = (workflow: string): string[] =>
  [...workflow.matchAll(/^\s*uses: (\S+)$/gmu)].map(([, value]) => value)

describe('CI workflow contract', () => {
  it('runs untrusted code with pull_request and a read-only token', () => {
    expect(ci).not.toContain('pull_request_target')
    expect(ci).toContain('permissions:\n  contents: read\n')
    expect(/^\s+\S+: write$/mu.test(ci)).toBe(false)
  })

  it('pins every published action to a full commit SHA', () => {
    const published = all.flatMap(listUses).filter((value) => !value.startsWith('./'))

    expect(published).not.toHaveLength(0)
    expect(published.filter((value) => !/@[0-9a-f]{40}$/u.test(value))).toEqual([])
  })

  it('pins the runner, Node, and pnpm versions', () => {
    expect(ci.match(/runs-on: \S+/gu)).toEqual(Array(3).fill('runs-on: ubuntu-24.04'))
    expect(gate.match(/runs-on: \S+/gu)).toEqual(Array(2).fill('runs-on: ubuntu-24.04'))
    for (const workflow of all)
      for (const version of workflow.match(/node-version: \S+|version: 11\.\S+/gu) ?? [])
        expect(['node-version: 24.20.0', 'version: 11.24.0']).toContain(version)
  })

  it('keeps preview failure diagnostics for seven days', () => {
    expect(ci).toContain('retention-days: 7')
  })

  it('caches only the pnpm store and the Playwright downloads', () => {
    expect(setup).toMatch(
      /key: \$\{\{ runner\.os \}\}-pnpm-\$\{\{ hashFiles\('pnpm-lock\.yaml'\) \}\}/u,
    )
    expect(ci).toContain('path: ~/.cache/ms-playwright')
    expect(ci).toContain('steps.playwright.outputs.builds')
  })
})

describe('trusted gate contract', () => {
  it('runs from the default branch and never uses pull-request code', () => {
    const checkouts = [
      ...gate.matchAll(/uses: actions\/checkout@[0-9a-f]{40}\n[ ]+with:\n((?:[ ]+\S.*\n)+)/gu),
    ]

    expect(checkouts).toHaveLength(2)
    for (const [, options] of checkouts) {
      expect(options).toMatch(/ref: \$\{\{ github\.event\.repository\.default_branch \}\}/u)
      expect(options).toContain('persist-credentials: false')
    }
    for (const forbidden of ['download-artifact', 'actions/cache', 'pnpm install', 'pnpm exec'])
      expect(gate).not.toContain(forbidden)
  })

  it('reads metadata and writes check results only', () => {
    expect(gate).toContain(
      'permissions:\n  checks: write\n  contents: read\n  pull-requests: read\n',
    )
    expect(gate.match(/^\s+\S+: write$/gmu)).toEqual(['  checks: write'])
  })

  it('resolves the untrusted workflow file it reads runs from', () => {
    expect(readWorkflow('scripts/gate.ts')).toContain("CI_WORKFLOW_FILE = 'ci.yml'")
    expect(() => readWorkflow('.github/workflows/ci.yml')).not.toThrow()
  })

  it('runs without installed dependencies', () => {
    for (const path of ['scripts/gate.ts', 'scripts/gate-policy.ts']) {
      const imports = [...readWorkflow(path).matchAll(/^import .*from '([^']+)'$/gmu)]

      expect(imports.filter(([, source]) => !/^(?:node:|\.)/u.test(source))).toEqual([])
    }
  })

  it('reacts to the untrusted workflow instead of pull-request events', () => {
    expect(gate).toContain('workflow_run:\n    workflows: [CI]\n    types: [completed]')
    expect(gate).not.toContain('\n  pull_request:')
  })
})
