export type GateEvent = 'pull_request' | 'merge_group' | 'push'

export type CiJobResult = {
  readonly name: string
  readonly status: string
  readonly conclusion: string | null
}

export type AcceptanceSource = {
  readonly author: string
  readonly body: string
}

export type PullRequestFacts = {
  readonly author: string
  readonly body: string
  readonly headSha: string
  readonly commits: readonly { readonly sha: string; readonly message: string }[]
  readonly acceptances: readonly AcceptanceSource[]
  readonly maintainers: readonly string[]
}

export type GateFindings = {
  readonly failures: readonly string[]
  readonly pending: readonly string[]
}

export type GovernanceFacts = {
  readonly event: GateEvent
  readonly headSha: string
  readonly pullRequest: PullRequestFacts | null
}

export type RequiredFacts = {
  readonly jobs: readonly CiJobResult[]
  readonly previewApplicable: boolean
  readonly runConclusion: string | null
}

export type GateResult = GateFindings & {
  readonly conclusion: 'success' | 'failure' | 'pending'
}

type TrailerField = { readonly key: string; readonly values: readonly string[] }

const REQUIRED_JOBS = ['changes', 'verify', 'previews'] as const
const SIGNED_OFF_BY = /^Signed-off-by: .+ <[^<>@\s]+@[^<>@\s]+>$/mu
const DECLARATIONS: readonly TrailerField[] = [
  { key: 'Provenance-Declaration', values: ['complete'] },
  { key: 'Contribution-Origin', values: ['original', 'adapted'] },
  { key: 'Third-Party-Resources', values: ['declared', 'none'] },
]
const ACCEPTANCE_FIELDS: readonly TrailerField[] = [
  { key: 'Provenance', values: ['approved'] },
  { key: 'Licenses', values: ['approved'] },
  { key: 'Contract', values: ['approved'] },
  { key: 'Safari', values: ['approved'] },
  { key: 'Visual-Quality', values: ['approved'] },
  { key: 'Catalog-Fit', values: ['approved'] },
  { key: 'Baselines', values: ['approved', 'not-changed'] },
]

const readTrailer = (body: string, key: string): string | null => {
  const value = new RegExp(`^${key}:[ \\t]*(\\S*)[ \\t]*$`, 'mu').exec(
    body.replaceAll('\r\n', '\n'),
  )?.[1]
  return value ? value : null
}

const findTrailerFailures = (
  body: string,
  fields: readonly TrailerField[],
  describe: (key: string, value: string | null) => string,
): string[] =>
  fields.flatMap(({ key, values }) => {
    const value = readTrailer(body, key)
    return value !== null && values.includes(value) ? [] : [describe(key, value)]
  })

const findSignOffFailures = (commits: PullRequestFacts['commits']): string[] =>
  commits
    .filter((commit) => !SIGNED_OFF_BY.test(commit.message))
    .map((commit) => `Commit ${commit.sha} has no DCO Signed-off-by trailer`)

const findDeclarationFailures = (body: string): string[] =>
  findTrailerFailures(body, DECLARATIONS, (key, value) =>
    value === null ? `Pull request is missing ${key}` : `Invalid ${key}: ${value}`,
  )

type AcceptanceRecord = {
  readonly headSha: string
  readonly failures: readonly string[]
}

const parseAcceptanceRecord = (body: string): AcceptanceRecord | null => {
  const headSha = readTrailer(body, 'Maintainer-Acceptance')
  if (headSha === null) return null
  return {
    headSha,
    failures: [
      ...(/^[0-9a-f]{40}$/u.test(headSha)
        ? []
        : ['Maintainer acceptance does not name a full head commit']),
      ...findTrailerFailures(body, ACCEPTANCE_FIELDS, (key, value) =>
        value === null
          ? `Maintainer acceptance field ${key} is missing`
          : `Maintainer acceptance field ${key} is ${value}`,
      ),
    ],
  }
}

const findAcceptanceFindings = (pullRequest: PullRequestFacts): GateFindings => {
  const records = pullRequest.acceptances
    .filter((acceptance) => pullRequest.maintainers.includes(acceptance.author))
    .map((acceptance) => ({
      author: acceptance.author,
      record: parseAcceptanceRecord(acceptance.body),
    }))
    .filter((entry): entry is { author: string; record: AcceptanceRecord } => entry.record !== null)
  if (records.length === 0) return { failures: [], pending: ['Maintainer acceptance is missing'] }

  const accepted = records.filter(({ record }) => record.headSha === pullRequest.headSha).at(-1)
  if (!accepted)
    return {
      failures: [`Maintainer acceptance is stale: it accepts ${records.at(-1)?.record.headSha}`],
      pending: [],
    }

  const selfAccepted =
    accepted.author === pullRequest.author &&
    pullRequest.maintainers.some((login) => login !== pullRequest.author)
  return {
    failures: [
      ...accepted.record.failures,
      ...(selfAccepted ? ['Self-acceptance is not allowed while another maintainer exists'] : []),
    ],
    pending: [],
  }
}

export const evaluateGovernance = (facts: GovernanceFacts): GateFindings => {
  if (facts.event !== 'pull_request') return { failures: [], pending: [] }
  if (!facts.pullRequest)
    return { failures: [`No open pull request has head commit ${facts.headSha}`], pending: [] }

  const acceptance = findAcceptanceFindings(facts.pullRequest)
  return {
    failures: [
      ...findSignOffFailures(facts.pullRequest.commits),
      ...findDeclarationFailures(facts.pullRequest.body),
      ...acceptance.failures,
    ],
    pending: acceptance.pending,
  }
}

const findJobFindings = (facts: RequiredFacts): GateFindings => {
  const failures: string[] = []
  const pending: string[] = []
  if (facts.runConclusion === 'cancelled') failures.push('The CI run was cancelled')

  for (const name of REQUIRED_JOBS) {
    const skippable = name === 'previews' && !facts.previewApplicable
    const job = facts.jobs.find((candidate) => candidate.name === name)
    if (!job) {
      if (!skippable) pending.push(`CI job ${name} has not reported`)
      continue
    }
    if (job.status !== 'completed') {
      pending.push(`CI job ${name} is not complete`)
      continue
    }
    if (job.conclusion === 'success' || (skippable && job.conclusion === 'skipped')) continue
    failures.push(`CI job ${name} concluded ${job.conclusion ?? 'without a result'}`)
  }
  return { failures, pending }
}

export const evaluateRequired = (facts: RequiredFacts, governance: GateFindings): GateResult => {
  const jobs = findJobFindings(facts)
  const failures = [...jobs.failures, ...governance.failures]
  const pending = [...jobs.pending, ...governance.pending]
  if (failures.length > 0) return { conclusion: 'failure', failures, pending }
  return { conclusion: pending.length > 0 ? 'pending' : 'success', failures, pending }
}

export const parseGovernanceFindings = (raw: string | undefined): GateFindings => {
  const unreported = { failures: ['The governance job did not report a result'], pending: [] }
  if (!raw) return unreported
  try {
    const reported: unknown = JSON.parse(raw)
    const failures = Reflect.get(reported ?? {}, 'failures')
    const pending = Reflect.get(reported ?? {}, 'pending')
    if (!Array.isArray(failures) || !Array.isArray(pending)) return unreported
    return { failures: failures.map(String), pending: pending.map(String) }
  } catch {
    return unreported
  }
}

export const parseMaintainers = (file: string): string[] =>
  file
    .split('\n')
    .map((line) => line.replace(/#.*$/u, '').trim())
    .filter((line) => line.length > 0)
