# CI and the protected result

Two workflows implement the V1 contract in `docs/spec/v1.md` sections 13 and 14.

| Workflow                     | Trust     | Jobs                            |
| ---------------------------- | --------- | ------------------------------- |
| `.github/workflows/ci.yml`   | Untrusted | `changes`, `verify`, `previews` |
| `.github/workflows/gate.yml` | Trusted   | `governance`, `required`        |

`ci.yml` uses `pull_request`, never `pull_request_target`. Its token is `contents: read` and it
receives no secrets.

`gate.yml` runs on `workflow_run`, `pull_request_review`, and `issue_comment`, so it always uses
the default branch. It never checks out pull-request code, downloads its artifacts, restores its
caches, imports its code, or runs its scripts. It reads GitHub metadata and writes one check run.
The review and comment triggers exist so a maintainer acceptance re-evaluates the result without
a new CI run.

The gate installs no dependencies, so `scripts/gate.ts` and `scripts/gate-policy.ts` import only
the Node standard library and each other. That is why they parse untrusted GitHub payloads by
hand instead of with valibot, which the rest of the repository uses.

## The protected result

`required` publishes the single check run `CI / required` on the exact head commit of the pull
request, merge group, or `main` commit. Until it first publishes, the ruleset already blocks the
merge, because a required context that is absent counts as pending. The result is:

- `pending` while an applicable job has not completed, or while maintainer acceptance is missing;
- `failure` for a cancelled run, a failed job, a required job that was skipped, a stale
  acceptance record, or any governance failure;
- `success` only when every applicable requirement passed.

Governance never exempts a technical check. When the `governance` job reports nothing usable,
`required` fails closed.

The gate jobs turn red only for a `failure`. A pending result is a normal state, so the jobs stay
green and the pending verdict shows on `CI / required` alone.

## Preview applicability

`scripts/preview-inputs.ts` is the one classifier. For a pull request, the `changes` job runs it
over the changed paths and the trusted gate runs the default-branch copy over the file list it
reads from the API, so both sides classify the same set. Merge-group and `main` events always
capture previews, which keeps the two sides in agreement without a shared commit range.
Documentation-only and unrelated Catalog UI changes skip preview capture; generation drift still
runs.

## Caches

Caching covers the pnpm store and the Playwright downloads, never generated output or
baselines. The Playwright key carries the runner OS, the lockfile hash, the Playwright version,
and a digest of the exact browser builds that `playwright install --dry-run` reports. The pnpm
store key stops at the runner OS and the lockfile hash, because the lockfile already fixes the
Playwright version and, through it, the browser builds.

## Repository rules

`.github/rulesets/main.json` is the branch ruleset for `main`. Apply it with:

```sh
gh api repos/{owner}/{repo}/rulesets --method POST --input .github/rulesets/main.json
```

It requires pull requests, resolved conversations, squash merge, and `CI / required`, blocks
force pushes and branch deletion, and lists no bypass actors, so administrators are covered.

## Maintainer detection

`.github/MAINTAINERS` lists one GitHub login per line. The gate reads it from the default-branch
checkout, so the list is deterministic, versioned, and needs no repository-administration token.
An acceptance record counts only when its author is on that list, and self-acceptance is allowed
only while the list names no other maintainer.

## Known gap

Section 14 also states a code-license allowlist (`MIT`, `Apache-2.0`, `BSD-2-Clause`,
`BSD-3-Clause`, `ISC`). No V1 contract field carries a code license: `schemas/provenance/v1.json`
covers design, font, image, and other resources only, and section 11 fixes the template license
to `MIT`. The allowlist is therefore documented in `CONTRIBUTING.md` for review, and CI has no
field to check it against.

This fails closed. A contributor who adapts code under a listed licence has nowhere to declare
it, and the strict schema rejects any added property, so no unlisted licence can enter through
provenance. Carrying a code source would need a new provenance category, which changes a
published contract.
