import { appendFileSync, readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  type AcceptanceSource,
  type CiJobResult,
  evaluateGovernance,
  evaluateRequired,
  type GateEvent,
  type GateFindings,
  type GateResult,
  type PullRequestFacts,
  parseGovernanceFindings,
  parseMaintainers,
} from './gate-policy.ts'
import { hasPreviewInput } from './preview-inputs.ts'

const REQUIRED_CHECK_NAME = 'CI / required'
const repositoryRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))

type GateContext = {
  readonly repository: string
  readonly runId: number
  readonly event: GateEvent
  readonly headSha: string
  readonly conclusion: string | null
  readonly detailsUrl: string
}

const requireEnv = (name: string): string => {
  const value = process.env[name]
  if (!value) throw new Error(`Missing ${name}`)
  return value
}

const request = async (path: string, body?: unknown): Promise<Response> =>
  fetch(`${process.env.GITHUB_API_URL ?? 'https://api.github.com'}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${requireEnv('GITHUB_TOKEN')}`,
      'content-type': 'application/json',
      'x-github-api-version': '2022-11-28',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

const get = async (path: string): Promise<unknown> => {
  const response = await request(path)
  if (!response.ok) throw new Error(`GitHub request failed: ${path} (${response.status})`)
  return response.json()
}

const asArray = (value: unknown): readonly unknown[] => (Array.isArray(value) ? value : [])
const read = (value: unknown, key: string): unknown =>
  value && typeof value === 'object' ? Reflect.get(value, key) : undefined
const readOptionalString = (value: unknown, key: string): string | null => {
  const property = read(value, key)
  return typeof property === 'string' && property.length > 0 ? property : null
}
const readString = (value: unknown, key: string): string => readOptionalString(value, key) ?? ''

const getPaged = async <T>(path: string, select: (page: unknown) => readonly T[]): Promise<T[]> => {
  const items: T[] = []
  for (let page = 1; page <= 10; page += 1) {
    const separator = path.includes('?') ? '&' : '?'
    const batch = select(await get(`${path}${separator}per_page=100&page=${page}`))
    items.push(...batch)
    if (batch.length < 100) break
  }
  return items
}

const readMaintainers = (): string[] =>
  parseMaintainers(readFileSync(join(repositoryRoot, '.github/MAINTAINERS'), 'utf8'))

const collectAcceptances = async (
  repository: string,
  number: number,
): Promise<AcceptanceSource[]> => {
  const [comments, reviews] = await Promise.all([
    getPaged<unknown>(`/repos/${repository}/issues/${number}/comments`, asArray),
    getPaged<unknown>(`/repos/${repository}/pulls/${number}/reviews`, asArray),
  ])
  return [...comments, ...reviews]
    .map((entry) => ({
      at: readString(entry, 'submitted_at') || readString(entry, 'created_at'),
      author: readString(read(entry, 'user'), 'login'),
      body: readString(entry, 'body'),
    }))
    .sort((left, right) => left.at.localeCompare(right.at))
    .map(({ author, body }) => ({ author, body }))
}

const findOpenPullRequest = async (
  repository: string,
  headSha: string,
): Promise<{ readonly number: number; readonly document: unknown } | null> => {
  const document = asArray(await get(`/repos/${repository}/commits/${headSha}/pulls`)).find(
    (entry) =>
      readString(entry, 'state') === 'open' &&
      readString(read(entry, 'head'), 'sha') === headSha &&
      readString(read(entry, 'base'), 'ref') === 'main',
  )
  const number = read(document, 'number')
  return typeof number === 'number' ? { number, document } : null
}

const collectPullRequestFacts = async (
  repository: string,
  headSha: string,
  pullRequest: { readonly number: number; readonly document: unknown },
): Promise<PullRequestFacts> => {
  const [commits, acceptances] = await Promise.all([
    getPaged<unknown>(`/repos/${repository}/pulls/${pullRequest.number}/commits`, asArray),
    collectAcceptances(repository, pullRequest.number),
  ])
  return {
    author: readString(read(pullRequest.document, 'user'), 'login'),
    body: readString(pullRequest.document, 'body'),
    headSha,
    commits: commits.map((entry) => ({
      sha: readString(entry, 'sha'),
      message: readString(read(entry, 'commit'), 'message'),
    })),
    acceptances,
    maintainers: readMaintainers(),
  }
}

const collectJobs = async (repository: string, runId: number): Promise<CiJobResult[]> =>
  (
    await getPaged<unknown>(`/repos/${repository}/actions/runs/${runId}/jobs`, (page) =>
      asArray(read(page, 'jobs')),
    )
  ).map((job) => ({
    name: readString(job, 'name'),
    status: readString(job, 'status'),
    conclusion: readOptionalString(job, 'conclusion'),
  }))

const isPreviewApplicable = async (
  repository: string,
  event: GateEvent,
  pullRequestNumber: number | null,
): Promise<boolean> => {
  if (event !== 'pull_request' || pullRequestNumber === null) return true
  const files = await getPaged<unknown>(
    `/repos/${repository}/pulls/${pullRequestNumber}/files`,
    asArray,
  )
  return hasPreviewInput(files.map((file) => readString(file, 'filename')))
}

const toGateEvent = (event: string): GateEvent => {
  if (event === 'pull_request' || event === 'merge_group' || event === 'push') return event
  throw new Error(`Unsupported triggering event: ${event}`)
}

const CI_WORKFLOW_FILE = 'ci.yml'

const findLatestCiRun = async (repository: string, headSha: string): Promise<unknown> =>
  asArray(
    read(
      await get(
        `/repos/${repository}/actions/workflows/${CI_WORKFLOW_FILE}/runs?head_sha=${headSha}&per_page=1`,
      ),
      'workflow_runs',
    ),
  )[0]

const resolveHeadSha = async (repository: string, payload: unknown): Promise<string> => {
  const reviewed = readString(read(read(payload, 'pull_request'), 'head'), 'sha')
  if (reviewed) return reviewed
  const number = read(read(payload, 'issue'), 'number')
  if (typeof number !== 'number') throw new Error('No pull request resolves for this event')
  return readString(read(await get(`/repos/${repository}/pulls/${number}`), 'head'), 'sha')
}

const readContext = async (): Promise<GateContext | null> => {
  const payload: unknown = JSON.parse(await readFile(requireEnv('GITHUB_EVENT_PATH'), 'utf8'))
  const repository = readString(read(payload, 'repository'), 'full_name')
  const run =
    read(payload, 'workflow_run') ??
    (await findLatestCiRun(repository, await resolveHeadSha(repository, payload)))
  const runId = read(run, 'id')
  if (typeof runId !== 'number') return null
  return {
    repository,
    runId,
    event: toGateEvent(readString(run, 'event')),
    headSha: readString(run, 'head_sha'),
    conclusion: readOptionalString(run, 'conclusion'),
    detailsUrl: readString(run, 'html_url'),
  }
}

const writeOutput = (name: string, value: string): void => {
  const file = process.env.GITHUB_OUTPUT
  if (file) appendFileSync(file, `${name}=${value}\n`)
}

const summarize = (findings: GateFindings): string =>
  [
    ...findings.failures.map((failure) => `- Failed: ${failure}`),
    ...findings.pending.map((entry) => `- Pending: ${entry}`),
  ].join('\n') || '- All required work passed.'

const publish = async (context: GateContext, result: GateResult): Promise<void> => {
  const response = await request(`/repos/${context.repository}/check-runs`, {
    name: REQUIRED_CHECK_NAME,
    head_sha: context.headSha,
    details_url: context.detailsUrl,
    ...(result.conclusion === 'pending'
      ? { status: 'in_progress' }
      : { status: 'completed', conclusion: result.conclusion }),
    output: {
      title: `${result.conclusion.charAt(0).toUpperCase()}${result.conclusion.slice(1)}`,
      summary: summarize(result),
    },
  })
  if (!response.ok) throw new Error(`Unable to publish ${REQUIRED_CHECK_NAME} (${response.status})`)
}

const runCommand = async (command: string): Promise<number> => {
  const context = await readContext()
  if (!context) {
    process.stdout.write('No CI run exists for this head commit yet.\n')
    return 0
  }
  const { repository, headSha, event } = context
  const pullRequest =
    event === 'pull_request' ? await findOpenPullRequest(repository, headSha) : null

  if (command === 'governance') {
    const governance = evaluateGovernance({
      event,
      headSha,
      pullRequest: pullRequest
        ? await collectPullRequestFacts(repository, headSha, pullRequest)
        : null,
    })
    writeOutput('result', JSON.stringify(governance))
    process.stdout.write(`${summarize(governance)}\n`)
    return governance.failures.length > 0 ? 1 : 0
  }

  if (command !== 'required') throw new Error(`Unknown gate command: ${command}`)

  const [jobs, previewApplicable] = await Promise.all([
    collectJobs(repository, context.runId),
    isPreviewApplicable(repository, event, pullRequest?.number ?? null),
  ])
  const result = evaluateRequired(
    { jobs, previewApplicable, runConclusion: context.conclusion },
    parseGovernanceFindings(process.env.GATE_GOVERNANCE_RESULT),
  )
  await publish(context, result)
  process.stdout.write(`${result.conclusion}\n${summarize(result)}\n`)
  return result.conclusion === 'failure' ? 1 : 0
}

const isMain = process.argv[1] ? resolve(process.argv[1]) === fileURLToPath(import.meta.url) : false
if (isMain) process.exitCode = await runCommand(process.argv[2] ?? 'required')
