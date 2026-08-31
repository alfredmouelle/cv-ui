# CV UI

CV UI publishes portable CV templates and the contracts needed to install, render, test, and discover them.

## Language

**CV Data**:
A versioned, presentation-neutral description of one publishable CV.
_Avoid_: Resume state, career profile, template data

**CV Template**:
A named design that renders all supplied human-facing CV Data within the Fidelity Envelope.
_Avoid_: Theme, layout preset, resume template

**Template ID**:
The permanent identifier of one CV Template design and public component contract.
_Avoid_: Slug, package name

**Fidelity Envelope**:
The shared V1 limits within which every CV Template must produce a complete and usable A4 result.
_Avoid_: Template limits, CV Data limits

**CV Registry Item**:
The shadcn-compatible document that installs one CV Template, its example, and its owned resources.
_Avoid_: Package, template bundle

**Template Catalog**:
The versioned set of canonical Template Catalog Entries used by people and software agents to discover CV Templates.
_Avoid_: Gallery data, search index

**Template Catalog Entry**:
The canonical discovery metadata for one CV Template.
_Avoid_: Card, listing

**Acceptance Corpus**:
The shared fixtures, mutation cases, Pagination Signatures, and expected results that every V1 CV Template must pass.
_Avoid_: Sample data, test data

**Reference Output**:
The approved English Reference PDF and ordered lossless page images for one CV Template.
_Avoid_: Screenshot, mockup

**Contact Group**:
Signal Ledger's presentation-only grouping of person contact fields. It is not a CV Data section.
_Avoid_: Contact section

**Mutation Case**:
An Acceptance Corpus case that changes one defined value to prove an exact accepted boundary or rejection.
_Avoid_: Test variant

**Pagination Signature**:
The exact page count and ordered section and entry markers produced by one CV Template for one accepted case.
_Avoid_: Page snapshot

**Release**:
An immutable, commit-addressed set of registry, Catalog, PDF, preview, and tombstone artifacts.
_Avoid_: Deployment, build

**Current Release**:
The one Release selected for all Stable Alias responses.
_Avoid_: Latest version

**Stable Alias**:
A public non-Release URL that resolves an artifact from the Current Release.
_Avoid_: Redirect, mutable artifact
