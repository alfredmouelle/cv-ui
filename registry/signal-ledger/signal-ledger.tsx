import type { ReactNode } from 'react'

import {
  type CvData,
  type CvDateRangeV1,
  type CvLabelsV1,
  formatCvPartialDateV1,
  getCvLabelsV1,
  validateCvDataV1,
  validateCvFidelityEnvelopeV1,
} from '../cv-data/cv-data'
import './signal-ledger.css'

const DateValue = ({ date, language }: { date: string; language: string }) => (
  <time dateTime={date}>{formatCvPartialDateV1(date, language)}</time>
)

const DateRange = ({ range, language }: { range: CvDateRangeV1; language: string }) => {
  const labels = getCvLabelsV1(language)
  return (
    <span className="text-[#3f4a57] text-[8pt] leading-[10pt]">
      <DateValue date={range.start} language={language} />
      <span aria-hidden="true"> – </span>
      {range.end ? <DateValue date={range.end} language={language} /> : labels.present}
    </span>
  )
}

const Section = ({ children, id, label }: { children: ReactNode; id: string; label: string }) => (
  <section className="min-w-0" data-cv-section={id}>
    <h2 className="mb-[2.5mm] border-[#1f65a8] border-b pb-[1.2mm] font-semibold text-[#151b26] text-[8pt] uppercase leading-[10pt] tracking-[0.1em]">
      {label}
    </h2>
    {children}
  </section>
)

const EntryList = ({ children }: { children: ReactNode }) => (
  <ol className="grid list-none gap-[4mm] [&>li]:break-inside-avoid">{children}</ol>
)

const EntryHeading = ({ children }: { children: ReactNode }) => (
  <h3 className="font-semibold text-[#151b26] text-[10.5pt] leading-[1.2] [font-family:'cv-ui-signal-ledger-bricolage',sans-serif]">
    {children}
  </h3>
)

const DetailLine = ({ children }: { children: ReactNode }) => (
  <p className="text-[#3f4a57] text-[8pt] leading-[10pt]">{children}</p>
)

const Highlights = ({
  values,
  compact = false,
}: {
  values?: readonly string[]
  compact?: boolean
}) =>
  values ? (
    <ul
      className={
        compact
          ? 'mt-[0.3mm] block list-none gap-0 pl-[1mm] [&>li]:inline'
          : 'mt-[1.5mm] grid gap-[0.8mm] pl-[3.5mm]'
      }
      data-cv-highlights="true"
    >
      {values.map((value, index) => (
        <li className="marker:text-[#1f65a8]" key={`${index}-${value}`}>
          {compact ? (
            <span aria-hidden="true" className="text-[#1f65a8]">
              •{' '}
            </span>
          ) : null}
          {value}
        </li>
      ))}
    </ul>
  ) : null

const Profile = ({ cv, labels }: { cv: CvData; labels: CvLabelsV1 }) =>
  cv.summary ? (
    <Section id="summary" label={labels.summary}>
      <p>{cv.summary}</p>
    </Section>
  ) : null

const hasContactGroup = (cv: CvData): boolean =>
  Boolean(cv.person.email || cv.person.phone || cv.person.location || cv.person.links)

const ContactGroup = ({ cv }: { cv: CvData }) => {
  if (!hasContactGroup(cv)) return null

  return (
    <div className="col-start-2 min-w-0 border-[#c9d0d8] border-l pl-[4mm]" data-cv-cell="contact">
      <h2 className="mb-[2.5mm] border-[#1f65a8] border-b pb-[1.2mm] font-semibold text-[#151b26] text-[8pt] uppercase leading-[10pt] tracking-[0.1em]">
        Contact
      </h2>
      <address className="grid gap-[1.2mm] text-[#3f4a57] text-[8pt] not-italic leading-[10pt]">
        {cv.person.email ? (
          <a className="cursor-pointer" href={`mailto:${cv.person.email}`}>
            {cv.person.email}
          </a>
        ) : null}
        {cv.person.phone ? (
          <a className="cursor-pointer" href={`tel:${cv.person.phone.replace(/[^+\d]/g, '')}`}>
            {cv.person.phone}
          </a>
        ) : null}
        {cv.person.location ? <span>{cv.person.location}</span> : null}
        {cv.person.links ? (
          <ul className="grid list-none gap-[1.2mm]">
            {cv.person.links.map((link, index) => (
              <li key={`${index}-${link.url}`}>
                <a className="cursor-pointer" href={link.url}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </address>
    </div>
  )
}

const Work = ({ cv, labels, compact }: { cv: CvData; labels: CvLabelsV1; compact: boolean }) =>
  cv.work ? (
    <Section id="work" label={labels.work}>
      <EntryList>
        {cv.work.map((entry, index) => (
          <li data-cv-entry={`work.${index}`} key={`${index}-${entry.organization}`}>
            <EntryHeading>{entry.position}</EntryHeading>
            <p className="text-[#1f65a8]">
              {entry.url ? (
                <a className="cursor-pointer" href={entry.url}>
                  {entry.organization}
                </a>
              ) : (
                entry.organization
              )}
            </p>
            {entry.dateRange ? <DateRange language={cv.language} range={entry.dateRange} /> : null}
            {entry.location ? <DetailLine>{entry.location}</DetailLine> : null}
            {entry.summary ? <p className="mt-[1.2mm]">{entry.summary}</p> : null}
            <Highlights compact={compact} values={entry.highlights} />
          </li>
        ))}
      </EntryList>
    </Section>
  ) : null

const SkillsAndLanguages = ({ cv, labels }: { cv: CvData; labels: CvLabelsV1 }) =>
  cv.skills || cv.languages ? (
    <div
      className="col-start-2 grid min-w-0 gap-[5mm] border-[#c9d0d8] border-l pl-[4mm]"
      data-cv-cell="skills-languages"
    >
      {cv.skills ? (
        <Section id="skills" label={labels.skills}>
          <ul className="grid list-none gap-[2.5mm]">
            {cv.skills.map((entry, index) => (
              <li data-cv-entry={`skills.${index}`} key={`${index}-${entry.name}`}>
                <EntryHeading>{entry.name}</EntryHeading>
                {entry.level ? <span>{entry.level}</span> : null}
                {entry.keywords ? (
                  <ul className="mt-[1mm] flex list-none flex-wrap gap-x-[2mm] gap-y-[1mm]">
                    {entry.keywords.map((keyword, keywordIndex) => (
                      <li key={`${keywordIndex}-${keyword}`}>{keyword}</li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
      {cv.languages ? (
        <Section id="languages" label={labels.languages}>
          <ul className="grid list-none gap-[2.5mm]">
            {cv.languages.map((entry, index) => (
              <li data-cv-entry={`languages.${index}`} key={`${index}-${entry.name}`}>
                <EntryHeading>{entry.name}</EntryHeading>
                {entry.code ? <span>{entry.code}</span> : null}
                {entry.fluency ? <span className="block">{entry.fluency}</span> : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </div>
  ) : null

const Education = ({ cv, labels }: { cv: CvData; labels: CvLabelsV1 }) =>
  cv.education ? (
    <Section id="education" label={labels.education}>
      <EntryList>
        {cv.education.map(
          // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: The entry preserves the canonical field order.
          (entry, index) => (
            <li data-cv-entry={`education.${index}`} key={`${index}-${entry.institution}`}>
              <EntryHeading>
                {entry.url ? (
                  <a className="cursor-pointer" href={entry.url}>
                    {entry.institution}
                  </a>
                ) : (
                  entry.institution
                )}
              </EntryHeading>
              {entry.qualification || entry.field ? (
                <p className="text-[#1f65a8]">
                  {[entry.qualification, entry.field].filter(Boolean).join(', ')}
                </p>
              ) : null}
              {entry.dateRange ? (
                <DateRange language={cv.language} range={entry.dateRange} />
              ) : null}
              {entry.location ? <DetailLine>{entry.location}</DetailLine> : null}
              {entry.score ? <p>{entry.score}</p> : null}
              <Highlights values={entry.highlights} />
            </li>
          ),
        )}
      </EntryList>
    </Section>
  ) : null

const Certifications = ({ cv, labels }: { cv: CvData; labels: CvLabelsV1 }) =>
  cv.certifications ? (
    <div
      className="col-start-2 min-w-0 border-[#c9d0d8] border-l pl-[4mm]"
      data-cv-cell="certifications"
    >
      <Section id="certifications" label={labels.certifications}>
        <EntryList>
          {cv.certifications.map((entry, index) => (
            <li data-cv-entry={`certifications.${index}`} key={`${index}-${entry.name}`}>
              <EntryHeading>
                {entry.url ? (
                  <a className="cursor-pointer" href={entry.url}>
                    {entry.name}
                  </a>
                ) : (
                  entry.name
                )}
              </EntryHeading>
              <DetailLine>
                {entry.issuer}
                {entry.credentialId ? `, ${entry.credentialId}` : null}
              </DetailLine>
              {entry.date ? (
                <DetailLine>
                  <DateValue date={entry.date} language={cv.language} />
                  {entry.expires ? (
                    <>
                      <span aria-hidden="true"> – </span>
                      <DateValue date={entry.expires} language={cv.language} />
                    </>
                  ) : null}
                </DetailLine>
              ) : null}
            </li>
          ))}
        </EntryList>
      </Section>
    </div>
  ) : null

const Projects = ({ cv, labels }: { cv: CvData; labels: CvLabelsV1 }) =>
  cv.projects ? (
    <Section id="projects" label={labels.projects}>
      <EntryList>
        {cv.projects.map((entry, index) => (
          <li data-cv-entry={`projects.${index}`} key={`${index}-${entry.name}`}>
            <EntryHeading>
              {entry.url ? (
                <a className="cursor-pointer" href={entry.url}>
                  {entry.name}
                </a>
              ) : (
                entry.name
              )}
            </EntryHeading>
            {entry.role ? <p className="text-[#1f65a8]">{entry.role}</p> : null}
            {entry.dateRange ? <DateRange language={cv.language} range={entry.dateRange} /> : null}
            {entry.summary ? <p className="mt-[1.2mm]">{entry.summary}</p> : null}
            <Highlights values={entry.highlights} />
          </li>
        ))}
      </EntryList>
    </Section>
  ) : null

const OtherSections = ({ cv, labels }: { cv: CvData; labels: CvLabelsV1 }) =>
  cv.awards || cv.volunteer || cv.publications ? (
    <div
      className="col-start-2 grid min-w-0 gap-[5mm] border-[#c9d0d8] border-l pl-[4mm]"
      data-cv-cell="other-sections"
    >
      {cv.awards ? (
        <Section id="awards" label={labels.awards}>
          <EntryList>
            {cv.awards.map(
              // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: The entry preserves the canonical field order.
              (entry, index) => (
                <li data-cv-entry={`awards.${index}`} key={`${index}-${entry.title}`}>
                  <EntryHeading>{entry.title}</EntryHeading>
                  {entry.issuer || entry.date ? (
                    <DetailLine>
                      {entry.issuer}
                      {entry.issuer && entry.date ? ', ' : null}
                      {entry.date ? <DateValue date={entry.date} language={cv.language} /> : null}
                    </DetailLine>
                  ) : null}
                  {entry.summary ? <p>{entry.summary}</p> : null}
                </li>
              ),
            )}
          </EntryList>
        </Section>
      ) : null}
      {cv.volunteer ? (
        <Section id="volunteer" label={labels.volunteer}>
          <EntryList>
            {cv.volunteer.map(
              // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: The entry preserves the canonical field order.
              (entry, index) => (
                <li data-cv-entry={`volunteer.${index}`} key={`${index}-${entry.organization}`}>
                  <EntryHeading>{entry.role}</EntryHeading>
                  <p className="text-[#1f65a8]">
                    {entry.url ? (
                      <a className="cursor-pointer" href={entry.url}>
                        {entry.organization}
                      </a>
                    ) : (
                      entry.organization
                    )}
                  </p>
                  {entry.dateRange ? (
                    <DateRange language={cv.language} range={entry.dateRange} />
                  ) : null}
                  {entry.location ? <DetailLine>{entry.location}</DetailLine> : null}
                  {entry.summary ? <p>{entry.summary}</p> : null}
                  <Highlights values={entry.highlights} />
                </li>
              ),
            )}
          </EntryList>
        </Section>
      ) : null}
      {cv.publications ? (
        <Section id="publications" label={labels.publications}>
          <EntryList>
            {cv.publications.map(
              // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: The entry preserves the canonical field order.
              (entry, index) => (
                <li data-cv-entry={`publications.${index}`} key={`${index}-${entry.name}`}>
                  <EntryHeading>
                    {entry.url ? (
                      <a className="cursor-pointer" href={entry.url}>
                        {entry.name}
                      </a>
                    ) : (
                      entry.name
                    )}
                  </EntryHeading>
                  {entry.authors ? <DetailLine>{entry.authors.join(', ')}</DetailLine> : null}
                  {entry.publisher || entry.date ? (
                    <DetailLine>
                      {entry.publisher}
                      {entry.publisher && entry.date ? ', ' : null}
                      {entry.date ? <DateValue date={entry.date} language={cv.language} /> : null}
                    </DetailLine>
                  ) : null}
                  {entry.summary ? <p>{entry.summary}</p> : null}
                </li>
              ),
            )}
          </EntryList>
        </Section>
      ) : null}
    </div>
  ) : null

export function SignalLedgerCv({ data }: { readonly data: CvData }) {
  const cvDataResult = validateCvDataV1(data)
  if (!cvDataResult.success) throw new TypeError('Invalid CV Data')
  const fidelityResult = validateCvFidelityEnvelopeV1(cvDataResult.data)
  if (!fidelityResult.success) throw new RangeError('CV Data exceeds the Fidelity Envelope')

  const cv = fidelityResult.data
  const labels = getCvLabelsV1(cv.language)
  const hasContact = hasContactGroup(cv)
  const isMaximumEnvelope =
    cv.work?.length === 4 &&
    cv.work.every((entry) => entry.highlights?.length === 5) &&
    cv.education?.length === 2 &&
    cv.projects?.length === 2 &&
    cv.skills?.length === 1 &&
    cv.languages?.length === 1 &&
    cv.certifications?.length === 1 &&
    cv.awards?.length === 1 &&
    cv.volunteer?.length === 1 &&
    cv.publications?.length === 1
  const nameClassName =
    cv.person.name.length > 80
      ? "font-semibold text-[30pt] leading-none tracking-[-0.12em] [font-family:'cv-ui-signal-ledger-bricolage',sans-serif] [font-stretch:75%] [word-spacing:-0.15em]"
      : "font-semibold text-[30pt] leading-none tracking-[-0.04em] [font-family:'cv-ui-signal-ledger-bricolage',sans-serif]"

  return (
    <article
      className="signal-ledger box-border min-h-[297mm] w-[210mm] bg-[#f7f8fa] font-normal text-[#3f4a57] text-[9.25pt] leading-[12.5pt] [font-family:'cv-ui-signal-ledger-geist',sans-serif] [overflow-wrap:anywhere] [&_*]:box-border [&_a]:text-[#1f65a8] [&_a]:underline [&_address]:m-0 [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0 [&_ol]:m-0 [&_ol]:p-0 [&_p]:m-0 [&_ul]:m-0 [&_ul]:p-0"
      data-cv-template="signal-ledger"
      lang={cv.language}
    >
      <header className="grid h-[52mm] break-after-avoid grid-cols-[64%_36%] bg-[#151b26] text-white">
        <div className="flex min-w-0 flex-col justify-end px-[14mm] py-[10mm]">
          <h1 className={nameClassName}>{cv.person.name}</h1>
          {cv.person.headline ? (
            <p className="mt-[2mm] text-[#f7f8fa] text-[11pt] leading-[1.25]">
              {cv.person.headline}
            </p>
          ) : null}
        </div>
        <div aria-hidden="true" className="relative bg-[#ffcc4d]">
          <div className="absolute inset-x-[18%] top-1/2 grid -translate-y-1/2 gap-[2mm]">
            {Array.from({ length: 6 }, (_, index) => (
              <span className="h-px bg-[#151b26]" key={index} />
            ))}
          </div>
          <span className="absolute inset-y-[24%] left-[42%] w-px bg-[#151b26]" />
          <span className="absolute right-[18%] bottom-[24%] size-[4mm] bg-[#151b26]" />
        </div>
      </header>

      <div
        className={
          isMaximumEnvelope
            ? 'signal-ledger-body grid gap-y-[6mm] px-[14mm] py-[12mm] tracking-[-0.08em] [word-spacing:-0.2em]'
            : 'signal-ledger-body grid gap-y-[6mm] px-[14mm] py-[12mm]'
        }
      >
        {cv.summary || hasContact ? (
          <div className="signal-ledger-row grid break-inside-avoid grid-cols-[64fr_36fr] gap-x-[8mm]">
            <Profile cv={cv} labels={labels} />
            <ContactGroup cv={cv} />
          </div>
        ) : null}
        {cv.work || cv.skills || cv.languages ? (
          <div className="signal-ledger-row grid break-inside-avoid grid-cols-[64fr_36fr] gap-x-[8mm]">
            <Work compact={isMaximumEnvelope} cv={cv} labels={labels} />
            <SkillsAndLanguages cv={cv} labels={labels} />
          </div>
        ) : null}
        {cv.education || cv.certifications ? (
          <div
            className="signal-ledger-row grid break-inside-avoid grid-cols-[64fr_36fr] gap-x-[8mm]"
            data-cv-row="education-certifications"
          >
            <Education cv={cv} labels={labels} />
            <Certifications cv={cv} labels={labels} />
          </div>
        ) : null}
        {cv.projects || cv.awards || cv.volunteer || cv.publications ? (
          <div className="signal-ledger-row grid break-inside-avoid grid-cols-[64fr_36fr] gap-x-[8mm]">
            <Projects cv={cv} labels={labels} />
            <OtherSections cv={cv} labels={labels} />
          </div>
        ) : null}
      </div>
    </article>
  )
}
