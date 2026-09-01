import type { ReactNode } from 'react'

import {
  type CvData,
  type CvDateRangeV1,
  formatCvPartialDateV1,
  getCvLabelsV1,
  validateCvDataV1,
  validateCvFidelityEnvelopeV1,
} from '../cv-data/cv-data'
import './clearline.css'

const DateValue = ({ date, language }: { date: string; language: string }) => (
  <time dateTime={date}>{formatCvPartialDateV1(date, language)}</time>
)

const DateRange = ({ range, language }: { range: CvDateRangeV1; language: string }) => {
  const labels = getCvLabelsV1(language)

  return (
    <span className="shrink-0 text-[#52606d] text-[8.5pt] leading-[1.3]">
      <DateValue date={range.start} language={language} />
      <span aria-hidden="true"> – </span>
      {range.end ? <DateValue date={range.end} language={language} /> : labels.present}
    </span>
  )
}

const Section = ({ children, id, label }: { children: ReactNode; id: string; label: string }) => (
  <section className="mt-[5mm]" data-cv-section={id}>
    <h2 className="mb-[2.5mm] flex items-center gap-[3mm] font-semibold text-[#155eef] text-[8.5pt] uppercase leading-[1.2] tracking-[0.13em] after:h-[0.2mm] after:w-full after:bg-[#155eef] after:content-['']">
      {label}
    </h2>
    {children}
  </section>
)

const Highlights = ({ values }: { values?: readonly string[] }) =>
  values ? (
    <ul
      className="mt-[1.5mm] grid break-inside-avoid gap-[0.7mm] pl-[4mm]"
      data-cv-highlights="true"
    >
      {values.map((value, index) => (
        <li key={`${index}-${value}`}>{value}</li>
      ))}
    </ul>
  ) : null

const EntryList = ({ children }: { children: ReactNode }) => (
  <ol className="grid list-none gap-[4mm] [&>li]:break-inside-avoid">{children}</ol>
)

const DetailLine = ({ children }: { children: ReactNode }) => (
  <p className="text-[#52606d] text-[8.5pt] leading-[1.3]">{children}</p>
)

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: The renderer preserves the required linear DOM order.
export function ClearlineCv({ data }: { readonly data: CvData }) {
  const cvDataResult = validateCvDataV1(data)
  if (!cvDataResult.success) throw new TypeError('Invalid CV Data')

  const fidelityResult = validateCvFidelityEnvelopeV1(cvDataResult.data)
  if (!fidelityResult.success) throw new RangeError('CV Data exceeds the Fidelity Envelope')

  const cv = fidelityResult.data
  const labels = getCvLabelsV1(cv.language)

  return (
    <article
      className="clearline box-border min-h-[297mm] w-[210mm] bg-white px-[15mm] py-[14mm] font-normal text-[#17202a] text-[9.5pt] leading-[1.38] [font-family:'cv-ui-clearline-geist',sans-serif] [&_*]:box-border [&_a]:underline [&_address]:m-0 [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0 [&_ol]:m-0 [&_ol]:p-0 [&_p]:m-0 [&_ul]:m-0 [&_ul]:p-0"
      data-cv-template="clearline"
      lang={cv.language}
    >
      <header className="[&+section]:mt-[6mm]">
        <h1 className="font-medium text-[25pt] leading-none">{cv.person.name}</h1>
        {cv.person.headline ? (
          <p className="mt-[2mm] font-medium text-[#155eef] text-[11pt] leading-[1.2]">
            {cv.person.headline}
          </p>
        ) : null}
        <address className="mt-[2.5mm] flex flex-wrap gap-x-[4mm] gap-y-[1mm] text-[#52606d] text-[8.5pt] not-italic leading-[1.3]">
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
            <ul className="flex list-none flex-wrap gap-x-[4mm] gap-y-[1mm]">
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
      </header>

      {cv.summary ? (
        <Section id="summary" label={labels.summary}>
          <p>{cv.summary}</p>
        </Section>
      ) : null}

      {cv.work ? (
        <Section id="work" label={labels.work}>
          <EntryList>
            {cv.work.map((entry, index) => (
              <li
                data-cv-entry={`work.${index}`}
                key={`${index}-${entry.organization}-${entry.position}`}
              >
                <div className="flex items-baseline justify-between gap-[4mm]">
                  <h3 className="font-semibold text-[10pt] leading-[1.2]">
                    {entry.position},{' '}
                    {entry.url ? (
                      <a className="cursor-pointer" href={entry.url}>
                        {entry.organization}
                      </a>
                    ) : (
                      entry.organization
                    )}
                  </h3>
                  {entry.dateRange ? (
                    <DateRange language={cv.language} range={entry.dateRange} />
                  ) : null}
                </div>
                {entry.location ? <DetailLine>{entry.location}</DetailLine> : null}
                {entry.summary ? <p>{entry.summary}</p> : null}
                <Highlights values={entry.highlights} />
              </li>
            ))}
          </EntryList>
        </Section>
      ) : null}

      {cv.projects ? (
        <Section id="projects" label={labels.projects}>
          <EntryList>
            {cv.projects.map((entry, index) => (
              <li data-cv-entry={`projects.${index}`} key={`${index}-${entry.name}`}>
                <div className="flex items-baseline justify-between gap-[4mm]">
                  <h3 className="font-semibold text-[10pt] leading-[1.2]">
                    {entry.url ? (
                      <a className="cursor-pointer" href={entry.url}>
                        {entry.name}
                      </a>
                    ) : (
                      entry.name
                    )}
                  </h3>
                  {entry.dateRange ? (
                    <DateRange language={cv.language} range={entry.dateRange} />
                  ) : null}
                </div>
                {entry.role ? <DetailLine>{entry.role}</DetailLine> : null}
                {entry.summary ? <p>{entry.summary}</p> : null}
                <Highlights values={entry.highlights} />
              </li>
            ))}
          </EntryList>
        </Section>
      ) : null}

      {cv.skills ? (
        <Section id="skills" label={labels.skills}>
          <ul className="grid list-none gap-[2mm] [&>li>ul]:flex [&>li>ul]:list-none [&>li>ul]:flex-wrap [&>li>ul]:items-baseline [&>li>ul]:gap-x-[3mm] [&>li>ul]:gap-y-[1mm] [&>li]:flex [&>li]:break-inside-avoid [&>li]:flex-wrap [&>li]:items-baseline [&>li]:gap-x-[3mm] [&>li]:gap-y-[1mm]">
            {cv.skills.map((entry, index) => (
              <li data-cv-entry={`skills.${index}`} key={`${index}-${entry.name}`}>
                <h3 className="font-semibold text-[10pt] leading-[1.2]">{entry.name}</h3>
                {entry.level ? <span>{entry.level}</span> : null}
                {entry.keywords ? (
                  <ul>
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

      {cv.education ? (
        <Section id="education" label={labels.education}>
          <EntryList>
            {cv.education.map(
              // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: The entry preserves the canonical field order.
              (entry, index) => (
                <li data-cv-entry={`education.${index}`} key={`${index}-${entry.institution}`}>
                  <div className="flex items-baseline justify-between gap-[4mm]">
                    <h3 className="font-semibold text-[10pt] leading-[1.2]">
                      {entry.url ? (
                        <a className="cursor-pointer" href={entry.url}>
                          {entry.institution}
                        </a>
                      ) : (
                        entry.institution
                      )}
                    </h3>
                    {entry.dateRange ? (
                      <DateRange language={cv.language} range={entry.dateRange} />
                    ) : null}
                  </div>
                  {entry.qualification || entry.field ? (
                    <DetailLine>
                      {[entry.qualification, entry.field].filter(Boolean).join(', ')}
                    </DetailLine>
                  ) : null}
                  {entry.location ? <DetailLine>{entry.location}</DetailLine> : null}
                  {entry.score ? <p>{entry.score}</p> : null}
                  <Highlights values={entry.highlights} />
                </li>
              ),
            )}
          </EntryList>
        </Section>
      ) : null}

      {cv.certifications ? (
        <Section id="certifications" label={labels.certifications}>
          <EntryList>
            {cv.certifications.map((entry, index) => (
              <li
                data-cv-entry={`certifications.${index}`}
                key={`${index}-${entry.name}-${entry.issuer}`}
              >
                <h3 className="font-semibold text-[10pt] leading-[1.2]">
                  {entry.url ? (
                    <a className="cursor-pointer" href={entry.url}>
                      {entry.name}
                    </a>
                  ) : (
                    entry.name
                  )}
                </h3>
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
      ) : null}

      {cv.awards ? (
        <Section id="awards" label={labels.awards}>
          <EntryList>
            {cv.awards.map(
              // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: The entry preserves the canonical field order.
              (entry, index) => (
                <li data-cv-entry={`awards.${index}`} key={`${index}-${entry.title}`}>
                  <h3 className="font-semibold text-[10pt] leading-[1.2]">{entry.title}</h3>
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
            {cv.volunteer.map((entry, index) => (
              <li
                data-cv-entry={`volunteer.${index}`}
                key={`${index}-${entry.organization}-${entry.role}`}
              >
                <div className="flex items-baseline justify-between gap-[4mm]">
                  <h3 className="font-semibold text-[10pt] leading-[1.2]">
                    {entry.role},{' '}
                    {entry.url ? (
                      <a className="cursor-pointer" href={entry.url}>
                        {entry.organization}
                      </a>
                    ) : (
                      entry.organization
                    )}
                  </h3>
                  {entry.dateRange ? (
                    <DateRange language={cv.language} range={entry.dateRange} />
                  ) : null}
                </div>
                {entry.location ? <DetailLine>{entry.location}</DetailLine> : null}
                {entry.summary ? <p>{entry.summary}</p> : null}
                <Highlights values={entry.highlights} />
              </li>
            ))}
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
                  <h3 className="font-semibold text-[10pt] leading-[1.2]">
                    {entry.url ? (
                      <a className="cursor-pointer" href={entry.url}>
                        {entry.name}
                      </a>
                    ) : (
                      entry.name
                    )}
                  </h3>
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

      {cv.languages ? (
        <Section id="languages" label={labels.languages}>
          <ul className="grid list-none gap-[2mm] [&>li]:flex [&>li]:break-inside-avoid [&>li]:flex-wrap [&>li]:items-baseline [&>li]:gap-x-[3mm] [&>li]:gap-y-[1mm]">
            {cv.languages.map((entry, index) => (
              <li data-cv-entry={`languages.${index}`} key={`${index}-${entry.name}`}>
                <h3 className="font-semibold text-[10pt] leading-[1.2]">{entry.name}</h3>
                {entry.code ? <span>{entry.code}</span> : null}
                {entry.fluency ? <span>{entry.fluency}</span> : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </article>
  )
}
