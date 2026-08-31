# CV UI

CV UI publishes portable CV documents and installable presentation templates from one versioned contract.

## Language

**CV Data**:
A versioned, presentation-neutral description of one publishable CV.
_Avoid_: Resume data, profile data

**CV Template**:
An installable React renderer that presents valid CV Data as browser and A4 output.
_Avoid_: Theme, layout

**Fidelity Envelope**:
The shared presentation-size limits that every V1 CV Template must render within two A4 pages.
_Avoid_: Template limits, CV Data limits

**Acceptance Corpus**:
The complete set of Base Fixtures, Mutation Cases, expected validation results, and proof-template output assertions used to accept every V1 CV Template.
_Avoid_: Test data, sample data

**Base Fixture**:
A checked-in CV Data document that represents one named acceptance scenario.
_Avoid_: Sample CV, test object

**Mutation Case**:
A named, deterministic change to a Base Fixture with an exact expected validation result.
_Avoid_: Generated fixture, test variant

**Catalog Reference Output**:
The committed Reference PDF and ordered page PNGs generated from the English Base Fixture for one CV Template. The same PNGs are the Catalog Preview and approved raster baseline.
_Avoid_: Preview baseline, golden image

**Pagination Signature**:
The exact page count and ordered CV section and record markers assigned to each page for one accepted Base Fixture or Mutation Case.
_Avoid_: Page snapshot, break map

**Installed Example**:
The self-contained English CV Data literal installed with one CV Registry Item. It must remain deeply equal to the English Base Fixture.
_Avoid_: Demo data, sample CV
