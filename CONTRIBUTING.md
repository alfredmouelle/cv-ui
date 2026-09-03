# Contributing to CV UI

One pull request adds one CV Template and no unrelated changes. It includes the canonical
component and CSS, metadata, the installed example, provenance, resources and notices, the
required fixtures, and the generated outputs.

## Verification commands

CI supports exactly these commands. Run them before you open a pull request:

```sh
pnpm typecheck
pnpm check
pnpm test
pnpm generate:check
pnpm previews:check
```

Only the local authoring commands `pnpm generate` and `pnpm previews:update` write generated
output. CI stays read-only.

## Sign-off

Every commit carries a DCO 1.1 trailer:

```text
Signed-off-by: Your Name <you@example.com>
```

Use `git commit --signoff`. Contributors keep their copyright and license their contribution
under MIT. Acceptance assigns no copyright, and an accepted license cannot be withdrawn.

## Pull request declarations

The pull request body contains:

```text
Provenance-Declaration: complete
Contribution-Origin: original | adapted
Third-Party-Resources: declared | none
```

## Provenance

Each template declares `registry/<template-id>/provenance.json` against
`schemas/provenance/v1.json`. Design sources are unique and URL-sorted. Resources are non-empty,
path-unique, and path-sorted. Every distributable file under `fonts/` and `assets/` has exactly
one entry, no unreferenced distributable resource is allowed, resource paths stay inside their
folder, and every license path resolves below `licenses/`, exists, and is referenced by at
least one resource.

License allowlists, applied from this repository without network requests:

| Subject                         | Allowed licenses                             |
| ------------------------------- | -------------------------------------------- |
| Code                            | MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC |
| Fonts                           | OFL-1.1, Apache-2.0                          |
| Images, designs, other resources | CC0-1.0, CC-BY-4.0, MIT, Apache-2.0          |

## Review and acceptance

Review runs through provenance and licenses, contract and generated consistency, visual and
language quality, catalog distinction, then changed raster approval. One maintainer accepts.
Self-acceptance is allowed while no second maintainer exists. A maintainer cannot exempt a
technical check.

The acceptance record is a pull request comment or review with the exact head commit:

```text
Maintainer-Acceptance: <full-head-sha>
Provenance: approved
Licenses: approved
Contract: approved
Safari: approved
Visual-Quality: approved
Catalog-Fit: approved
Baselines: approved | not-changed
```

A push makes the record stale, and the protected result fails until a maintainer accepts the
new head. `.github/MAINTAINERS` lists who can accept. The repository squash-merges.
