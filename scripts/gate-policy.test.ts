import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import {
  evaluateGovernance,
  evaluateRequired,
  type GovernanceFacts,
  type PullRequestFacts,
  parseGovernanceFindings,
  parseMaintainers,
  type RequiredFacts,
} from './gate-policy'

const headSha = '1111111111111111111111111111111111111111'
const previousSha = '2222222222222222222222222222222222222222'
const acceptance = (sha: string, baselines = 'approved'): string => `Maintainer-Acceptance: ${sha}
Provenance: approved
Licenses: approved
Contract: approved
Safari: approved
Visual-Quality: approved
Catalog-Fit: approved
Baselines: ${baselines}`

const successfulJobs = [
  { name: 'changes', status: 'completed', conclusion: 'success' },
  { name: 'verify', status: 'completed', conclusion: 'success' },
  { name: 'previews', status: 'completed', conclusion: 'success' },
]
const required: RequiredFacts = {
  jobs: successfulJobs,
  previewApplicable: true,
  runConclusion: 'success',
}
const pullRequest: PullRequestFacts = {
  author: 'contributor',
  body: `Adds a template.

Provenance-Declaration: complete
Contribution-Origin: original
Third-Party-Resources: declared`,
  headSha,
  commits: [{ sha: 'abcdef1', message: 'feat: add\n\nSigned-off-by: A Name <a@example.com>' }],
  acceptances: [{ author: 'maintainer', body: acceptance(headSha) }],
  maintainers: ['maintainer'],
}
const governance: GovernanceFacts = { event: 'pull_request', headSha, pullRequest }
const evaluate = (facts: Partial<RequiredFacts> & Partial<GovernanceFacts> = {}) =>
  evaluateRequired({ ...required, ...facts }, evaluateGovernance({ ...governance, ...facts }))
const withPullRequest = (overrides: Partial<PullRequestFacts>) =>
  evaluate({ pullRequest: { ...pullRequest, ...overrides } })

describe('protected CI result', () => {
  it('succeeds for a complete pull request', () => {
    expect(evaluate()).toEqual({ conclusion: 'success', failures: [], pending: [] })
  })

  it('succeeds for merge-group and main without pull request governance', () => {
    for (const event of ['merge_group', 'push'] as const)
      expect(evaluate({ event, pullRequest: null })).toEqual({
        conclusion: 'success',
        failures: [],
        pending: [],
      })
  })

  it('succeeds when preview capture does not apply and the job is skipped', () => {
    const jobs = [
      ...successfulJobs.slice(0, 2),
      { name: 'previews', status: 'completed', conclusion: 'skipped' },
    ]

    expect(evaluate({ previewApplicable: false, jobs })).toMatchObject({ conclusion: 'success' })
    expect(evaluate({ previewApplicable: true, jobs })).toMatchObject({
      conclusion: 'failure',
      failures: ['CI job previews concluded skipped'],
    })
  })

  it('stays pending while an applicable job has not reported', () => {
    expect(
      evaluate({
        runConclusion: null,
        jobs: [successfulJobs[0], { name: 'verify', status: 'in_progress', conclusion: null }],
      }),
    ).toEqual({
      conclusion: 'pending',
      failures: [],
      pending: ['CI job verify is not complete', 'CI job previews has not reported'],
    })
  })

  it('stays pending until a maintainer accepts', () => {
    expect(withPullRequest({ acceptances: [] })).toEqual({
      conclusion: 'pending',
      failures: [],
      pending: ['Maintainer acceptance is missing'],
    })
  })

  it('fails a stale acceptance record after a push', () => {
    expect(
      withPullRequest({ acceptances: [{ author: 'maintainer', body: acceptance(previousSha) }] }),
    ).toMatchObject({
      conclusion: 'failure',
      failures: [`Maintainer acceptance is stale: it accepts ${previousSha}`],
    })
  })

  it('fails failed, cancelled, and missing technical requirements', () => {
    expect(
      evaluate({
        runConclusion: 'failure',
        jobs: [
          successfulJobs[0],
          { name: 'verify', status: 'completed', conclusion: 'failure' },
          { name: 'previews', status: 'completed', conclusion: 'cancelled' },
        ],
      }),
    ).toMatchObject({
      conclusion: 'failure',
      failures: ['CI job verify concluded failure', 'CI job previews concluded cancelled'],
    })
    expect(evaluate({ runConclusion: 'cancelled' })).toMatchObject({
      conclusion: 'failure',
      failures: ['The CI run was cancelled'],
    })
  })

  it('never lets acceptance exempt a technical check', () => {
    expect(
      evaluate({
        jobs: [
          successfulJobs[0],
          { name: 'verify', status: 'completed', conclusion: 'failure' },
          successfulJobs[2],
        ],
      }),
    ).toMatchObject({ conclusion: 'failure' })
  })

  it('fails any commit without a DCO trailer', () => {
    expect(
      withPullRequest({
        commits: [
          { sha: 'abcdef1', message: 'feat: add' },
          { sha: 'abcdef2', message: 'merge main' },
        ],
      }),
    ).toMatchObject({
      conclusion: 'failure',
      failures: [
        'Commit abcdef1 has no DCO Signed-off-by trailer',
        'Commit abcdef2 has no DCO Signed-off-by trailer',
      ],
    })
  })

  it('fails missing or invalid contribution declarations', () => {
    expect(withPullRequest({ body: 'Adds a template.' })).toMatchObject({
      conclusion: 'failure',
      failures: [
        'Pull request is missing Provenance-Declaration',
        'Pull request is missing Contribution-Origin',
        'Pull request is missing Third-Party-Resources',
      ],
    })
    expect(
      withPullRequest({
        body: `Provenance-Declaration: complete
Contribution-Origin: copied
Third-Party-Resources: none`,
      }),
    ).toMatchObject({ failures: ['Invalid Contribution-Origin: copied'] })
  })

  it('fails an incomplete acceptance record', () => {
    expect(
      withPullRequest({
        acceptances: [
          {
            author: 'maintainer',
            body: acceptance(headSha).replace('Safari: approved', 'Safari: skipped'),
          },
        ],
      }),
    ).toMatchObject({ failures: ['Maintainer acceptance field Safari is skipped'] })
    expect(
      withPullRequest({
        acceptances: [
          {
            author: 'maintainer',
            body: acceptance(headSha).replace('Catalog-Fit: approved\n', ''),
          },
        ],
      }),
    ).toMatchObject({ failures: ['Maintainer acceptance field Catalog-Fit is missing'] })
  })

  it('accepts unchanged baselines', () => {
    expect(
      withPullRequest({
        acceptances: [{ author: 'maintainer', body: acceptance(headSha, 'not-changed') }],
      }),
    ).toMatchObject({ conclusion: 'success' })
  })

  it('ignores acceptance from a person who is not a maintainer', () => {
    expect(
      withPullRequest({ acceptances: [{ author: 'outsider', body: acceptance(headSha) }] }),
    ).toMatchObject({ conclusion: 'pending', pending: ['Maintainer acceptance is missing'] })
  })

  it('allows self-acceptance only when no second maintainer exists', () => {
    const selfAccepted = {
      author: 'maintainer',
      acceptances: [{ author: 'maintainer', body: acceptance(headSha) }],
    }

    expect(withPullRequest({ ...selfAccepted, maintainers: ['maintainer'] })).toMatchObject({
      conclusion: 'success',
    })
    expect(
      withPullRequest({ ...selfAccepted, maintainers: ['maintainer', 'other'] }),
    ).toMatchObject({
      conclusion: 'failure',
      failures: ['Self-acceptance is not allowed while another maintainer exists'],
    })
  })

  it('fails a pull-request result that no longer matches an open head', () => {
    expect(evaluate({ pullRequest: null })).toMatchObject({
      conclusion: 'failure',
      failures: [`No open pull request has head commit ${headSha}`],
    })
  })
})

describe('reported governance findings', () => {
  it('fails closed when the governance job reports nothing usable', () => {
    for (const raw of [undefined, '', '{}', '{"failures":"none"}', 'not json'])
      expect(parseGovernanceFindings(raw)).toEqual({
        failures: ['The governance job did not report a result'],
        pending: [],
      })
  })

  it('reuses a reported result', () => {
    expect(parseGovernanceFindings('{"failures":["no DCO"],"pending":[]}')).toEqual({
      failures: ['no DCO'],
      pending: [],
    })
  })
})

describe('maintainer list', () => {
  it('reads one login per line and drops comments', () => {
    expect(parseMaintainers('# who accepts\nalfredmouelle\n\n  other # trailing\n')).toEqual([
      'alfredmouelle',
      'other',
    ])
  })

  it('matches the committed maintainer list used by the gate', () => {
    expect(parseMaintainers(readFileSync('.github/MAINTAINERS', 'utf8'))).not.toHaveLength(0)
  })
})
