import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, Languages, Printer } from 'lucide-react'
import { useEffect } from 'react'

const variants = ['a', 'b', 'c'] as const
const languages = ['en', 'fr'] as const

type Variant = (typeof variants)[number]
type Language = (typeof languages)[number]

type CvContent = {
  language: Language
  headline: string
  location: string
  summary: string
  labels: {
    profile: string
    experience: string
    skills: string
    education: string
    projects: string
    certifications: string
    awards: string
    volunteer: string
    publications: string
    languages: string
  }
  experience: Array<{
    role: string
    organization: string
    location: string
    date: string
    summary: string
    highlights: string[]
  }>
  skills: Array<{ name: string; keywords: string }>
  education: Array<{ qualification: string; institution: string; date: string }>
  projects: Array<{ name: string; role: string; summary: string }>
  certifications: string[]
  awards: Array<{ title: string; issuer: string; date: string; summary: string }>
  volunteer: Array<{
    role: string
    organization: string
    date: string
    summary: string
  }>
  publications: Array<{ name: string; publisher: string; date: string }>
  spokenLanguages: string[]
}

const contentByLanguage = {
  en: {
    language: 'en',
    headline: 'Frontend engineer',
    location: 'Yaoundé, Cameroon',
    summary:
      'Frontend engineer with six years of experience building accessible public services and internal tools. I turn complex workflows into reliable interfaces and help teams ship maintainable React systems.',
    labels: {
      profile: 'Profile',
      experience: 'Experience',
      skills: 'Skills',
      education: 'Education',
      projects: 'Selected projects',
      certifications: 'Certifications',
      awards: 'Awards',
      volunteer: 'Volunteer experience',
      publications: 'Publications',
      languages: 'Languages',
    },
    experience: [
      {
        role: 'Senior frontend engineer',
        organization: 'Civic Systems Lab',
        location: 'Remote',
        date: '2022 – Present',
        summary: 'Lead frontend delivery for case-management products used by municipal teams.',
        highlights: [
          'Cut the median application time from 18 to 11 minutes across three public-service forms.',
          'Built an accessible component library adopted by five product teams.',
          'Mentor four engineers and run design reviews with product and support teams.',
        ],
      },
      {
        role: 'Frontend engineer',
        organization: 'Kora Digital',
        location: 'Douala, Cameroon',
        date: '2019 – 2022',
        summary:
          'Built multilingual commerce and operations tools for businesses in Central Africa.',
        highlights: [
          'Delivered offline order capture for sales teams working with unstable connections.',
          'Raised automated accessibility coverage from 42% to 91% of key user journeys.',
        ],
      },
    ],
    skills: [
      { name: 'Frontend', keywords: 'React, TypeScript, Tailwind CSS, HTML, CSS' },
      { name: 'Quality', keywords: 'Accessibility, testing, performance, design systems' },
      { name: 'Delivery', keywords: 'Technical planning, mentoring, product discovery' },
    ],
    education: [
      {
        qualification: 'BSc, Software Engineering',
        institution: 'University of Yaoundé I',
        date: '2015 – 2019',
      },
    ],
    projects: [
      {
        name: 'Form Relay',
        role: 'Maintainer',
        summary: 'Open-source form state tools for resilient, multilingual public-service forms.',
      },
    ],
    certifications: ['IAAP Web Accessibility Specialist, 2024'],
    awards: [
      {
        title: 'Cameroon Digital Service Award',
        issuer: 'Digital Transformation Network',
        date: '2023',
        summary: 'Recognized for accessible public-service form design.',
      },
    ],
    volunteer: [
      {
        role: 'Frontend mentor',
        organization: 'Women Techmakers Yaoundé',
        date: '2021 – Present',
        summary: 'Run a monthly frontend clinic for early-career engineers.',
      },
    ],
    publications: [
      {
        name: 'Designing resilient public forms',
        publisher: 'Interface Practice',
        date: '2024',
      },
    ],
    spokenLanguages: ['French, native', 'English, professional working proficiency'],
  },
  fr: {
    language: 'fr',
    headline: 'Ingénieure frontend',
    location: 'Yaoundé, Cameroun',
    summary:
      'Ingénieure frontend avec six ans d’expérience dans les services publics numériques et les outils internes. Je transforme des processus complexes en interfaces fiables et j’aide les équipes à livrer des systèmes React maintenables.',
    labels: {
      profile: 'Profil',
      experience: 'Expérience',
      skills: 'Compétences',
      education: 'Formation',
      projects: 'Projets sélectionnés',
      certifications: 'Certifications',
      awards: 'Distinctions',
      volunteer: 'Bénévolat',
      publications: 'Publications',
      languages: 'Langues',
    },
    experience: [
      {
        role: 'Ingénieure frontend senior',
        organization: 'Civic Systems Lab',
        location: 'À distance',
        date: '2022 – Aujourd’hui',
        summary:
          'Direction frontend de produits de gestion de dossiers pour les équipes municipales.',
        highlights: [
          'Réduction du temps médian de demande de 18 à 11 minutes sur trois formulaires de service public.',
          'Création d’une bibliothèque de composants accessible, adoptée par cinq équipes produit.',
          'Accompagnement de quatre ingénieurs et animation des revues avec les équipes produit et support.',
        ],
      },
      {
        role: 'Ingénieure frontend',
        organization: 'Kora Digital',
        location: 'Douala, Cameroun',
        date: '2019 – 2022',
        summary:
          'Création d’outils multilingues de vente et d’exploitation pour l’Afrique centrale.',
        highlights: [
          'Livraison d’une saisie de commandes hors ligne pour les équipes avec une connexion instable.',
          'Passage de la couverture d’accessibilité automatisée de 42 % à 91 % des parcours clés.',
        ],
      },
    ],
    skills: [
      { name: 'Frontend', keywords: 'React, TypeScript, Tailwind CSS, HTML, CSS' },
      { name: 'Qualité', keywords: 'Accessibilité, tests, performance, systèmes de design' },
      { name: 'Livraison', keywords: 'Planification technique, mentorat, découverte produit' },
    ],
    education: [
      {
        qualification: 'Licence en génie logiciel',
        institution: 'Université de Yaoundé I',
        date: '2015 – 2019',
      },
    ],
    projects: [
      {
        name: 'Form Relay',
        role: 'Mainteneuse',
        summary: 'Outils open source pour des formulaires publics résilients et multilingues.',
      },
    ],
    certifications: ['IAAP Web Accessibility Specialist, 2024'],
    awards: [
      {
        title: 'Prix camerounais du service numérique',
        issuer: 'Digital Transformation Network',
        date: '2023',
        summary: 'Distinction pour la conception accessible de formulaires de service public.',
      },
    ],
    volunteer: [
      {
        role: 'Mentore frontend',
        organization: 'Women Techmakers Yaoundé',
        date: '2021 – Aujourd’hui',
        summary:
          'Animation mensuelle d’une clinique frontend pour les ingénieurs en début de carrière.',
      },
    ],
    publications: [
      {
        name: 'Concevoir des formulaires publics résilients',
        publisher: 'Interface Practice',
        date: '2024',
      },
    ],
    spokenLanguages: ['Français, langue maternelle', 'Anglais, compétence professionnelle'],
  },
} satisfies Record<Language, CvContent>

const variantDetails = {
  a: {
    name: 'Clear signal',
    description: 'Conventional hierarchy, quick scanning, experience first.',
    hierarchy: 'Profile → Experience → Projects → Skills → Education → remaining sections',
    typography: 'Geist, 9.5 pt body, 25 pt name',
    color: 'Ink #17202A, blue #155EEF',
  },
  b: {
    name: 'Quiet ledger',
    description: 'Section labels form a stable rail while content stays in one reading stream.',
    hierarchy: 'Profile → Skills → Experience → Projects → Education',
    typography: 'Geist, 9.25 pt body, 22 pt name',
    color: 'Ink #202523, green #126B55',
  },
  c: {
    name: 'Working brief',
    description: 'A compact profile block gives evidence and capabilities equal weight.',
    hierarchy: 'Profile + Skills → Experience → Projects → Education',
    typography: 'Geist, 9 pt body, 24 pt name',
    color: 'Ink #222222, red #9E2A2B',
  },
} satisfies Record<Variant, Record<string, string>>

export const Route = createFileRoute('/prototype/minimal-ats')({
  validateSearch: (search: Record<string, unknown>) => ({
    language: isLanguage(search.language) ? search.language : 'en',
    variant: isVariant(search.variant) ? search.variant : 'a',
  }),
  component: MinimalAtsPrototype,
})

function isVariant(value: unknown): value is Variant {
  return typeof value === 'string' && variants.some((variant) => variant === value)
}

function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && languages.some((language) => language === value)
}

function MinimalAtsPrototype() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const details = variantDetails[search.variant]
  const content = contentByLanguage[search.language]

  const selectVariant = (variant: Variant) => {
    void navigate({ search: (previous) => ({ ...previous, variant }), replace: true })
  }

  const cycleVariant = (direction: -1 | 1) => {
    const currentIndex = variants.indexOf(search.variant)
    const nextIndex = (currentIndex + direction + variants.length) % variants.length
    const nextVariant = variants[nextIndex]

    if (nextVariant) {
      selectVariant(nextVariant)
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target

      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return
      }

      if (event.key === 'ArrowLeft') {
        cycleVariant(-1)
      }

      if (event.key === 'ArrowRight') {
        cycleVariant(1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  return (
    <main className="min-h-svh bg-[#e8eaec] pb-32 text-[#17202a]">
      <style>{printStyles}</style>
      <header className="prototype-chrome border-[#cad0d6] border-b bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:px-8">
          <div>
            <p className="font-mono text-[#155eef] text-xs uppercase tracking-[0.16em]">
              Throwaway prototype · issue 16
            </p>
            <h1 className="mt-3 font-heading font-medium text-3xl tracking-[-0.035em] sm:text-4xl">
              Minimal ATS proof template
            </h1>
            <p className="mt-3 max-w-3xl text-[#52606d] text-sm leading-6">
              Three directions for one candidate contract. Compare hierarchy and scan behavior, then
              print the selected direction to inspect its A4 flow.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="flex cursor-pointer items-center gap-2 rounded-md border border-[#b7c0c8] bg-white px-3 py-2 font-medium text-sm hover:bg-[#f4f6f7] focus-visible:outline-2 focus-visible:outline-[#155eef]"
              onClick={() =>
                void navigate({
                  search: (previous) => ({
                    ...previous,
                    language: previous.language === 'en' ? 'fr' : 'en',
                  }),
                  replace: true,
                })
              }
              type="button"
            >
              <Languages aria-hidden="true" className="size-4" />
              {search.language === 'en' ? 'View French' : 'Voir en anglais'}
            </button>
            <button
              className="flex cursor-pointer items-center gap-2 rounded-md bg-[#17202a] px-3 py-2 font-medium text-sm text-white hover:bg-[#2d3a45] focus-visible:outline-2 focus-visible:outline-[#155eef] focus-visible:outline-offset-2"
              onClick={() => window.print()}
              type="button"
            >
              <Printer aria-hidden="true" className="size-4" />
              Print A4
            </button>
          </div>
        </div>
        <div className="mx-auto grid max-w-7xl gap-px border-[#cad0d6] border-t bg-[#cad0d6] sm:grid-cols-2 lg:grid-cols-4">
          <PrototypeFact label="Candidate identity" value="clearline · ClearlineCv" />
          <PrototypeFact
            label="Direction"
            value={`${search.variant.toUpperCase()} · ${details.name}`}
          />
          <PrototypeFact label="Typography" value={details.typography} />
          <PrototypeFact label="Content order" value={details.hierarchy} />
        </div>
      </header>

      <section className="prototype-page-shell mx-auto max-w-[calc(210mm+4rem)] overflow-x-auto px-4 py-8 sm:px-8 sm:py-12">
        <div className="prototype-sheet mx-auto min-h-[297mm] w-[210mm] max-w-none bg-white shadow-[0_20px_60px_rgba(31,41,55,0.18)]">
          {search.variant === 'a' && <ClearSignal content={content} />}
          {search.variant === 'b' && <QuietLedger content={content} />}
          {search.variant === 'c' && <WorkingBrief content={content} />}
        </div>
      </section>

      {import.meta.env.DEV ? (
        <PrototypeSwitcher
          current={search.variant}
          onNext={() => cycleVariant(1)}
          onPrevious={() => cycleVariant(-1)}
          onSelect={selectVariant}
        />
      ) : null}
    </main>
  )
}

function PrototypeFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white px-5 py-3 lg:px-8">
      <p className="font-mono text-[#687782] text-[10px] uppercase tracking-[0.12em]">{label}</p>
      <p className="mt-1 text-xs">{value}</p>
    </div>
  )
}

function PrototypeSwitcher({
  current,
  onNext,
  onPrevious,
  onSelect,
}: {
  current: Variant
  onNext: () => void
  onPrevious: () => void
  onSelect: (variant: Variant) => void
}) {
  return (
    <nav
      aria-label="Prototype variants"
      className="prototype-chrome fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/15 bg-[#12181d] p-1.5 text-white shadow-2xl"
    >
      <button
        aria-label="Previous variant"
        className="grid size-9 cursor-pointer place-items-center rounded-full hover:bg-white/12 focus-visible:outline-2 focus-visible:outline-white"
        onClick={onPrevious}
        type="button"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
      </button>
      <div className="flex items-center gap-1 px-1">
        {variants.map((variant) => (
          <button
            aria-label={`Show variant ${variant.toUpperCase()}`}
            aria-pressed={variant === current}
            className="min-w-28 cursor-pointer rounded-full px-3 py-2 text-xs transition-colors hover:bg-white/12 aria-pressed:bg-white aria-pressed:text-[#12181d]"
            key={variant}
            onClick={() => onSelect(variant)}
            type="button"
          >
            {variant.toUpperCase()} · {variantDetails[variant].name}
          </button>
        ))}
      </div>
      <button
        aria-label="Next variant"
        className="grid size-9 cursor-pointer place-items-center rounded-full hover:bg-white/12 focus-visible:outline-2 focus-visible:outline-white"
        onClick={onNext}
        type="button"
      >
        <ArrowRight aria-hidden="true" className="size-4" />
      </button>
    </nav>
  )
}

function ClearSignal({ content }: { content: CvContent }) {
  return (
    <article
      className="px-[15mm] py-[14mm] font-sans text-[#17202a] text-[9.5pt] leading-[1.38]"
      data-cv-template="clearline"
      lang={content.language}
    >
      <CvHeader accent="#155eef" content={content} nameClassName="text-[25pt]" />
      <section className="mt-6" data-cv-section="summary">
        <LineHeading color="#155eef">{content.labels.profile}</LineHeading>
        <p className="mt-2.5">{content.summary}</p>
      </section>
      <section className="mt-5" data-cv-section="work">
        <LineHeading color="#155eef">{content.labels.experience}</LineHeading>
        <ExperienceList content={content} direction="signal" />
      </section>
      <section className="mt-5" data-cv-section="projects">
        <LineHeading color="#155eef">{content.labels.projects}</LineHeading>
        <ProjectsList content={content} />
      </section>
      <section className="mt-5" data-cv-section="skills">
        <LineHeading color="#155eef">{content.labels.skills}</LineHeading>
        <SkillsList content={content} />
      </section>
      <section className="mt-5" data-cv-section="education">
        <LineHeading color="#155eef">{content.labels.education}</LineHeading>
        <EducationList content={content} />
      </section>
      <ClearlineRemainingSections content={content} />
    </article>
  )
}

function QuietLedger({ content }: { content: CvContent }) {
  return (
    <article
      className="px-[14mm] py-[13mm] font-sans text-[#202523] text-[9.25pt] leading-[1.4]"
      data-cv-template="clearline"
      lang={content.language}
    >
      <header className="border-[#126b55] border-t-[3px] pt-5">
        <div className="grid grid-cols-[42mm_1fr] gap-7">
          <div>
            <p className="font-medium text-[#126b55] text-[9pt] uppercase tracking-[0.16em]">
              {content.headline}
            </p>
          </div>
          <div>
            <h1 className="font-heading font-medium text-[22pt] leading-none tracking-[-0.035em]">
              Camille N'Diaye
            </h1>
            <Contact className="mt-3" content={content} />
          </div>
        </div>
      </header>
      <LedgerSection label={content.labels.profile} section="summary">
        <p>{content.summary}</p>
      </LedgerSection>
      <LedgerSection label={content.labels.skills} section="skills">
        <SkillsList compact content={content} />
      </LedgerSection>
      <LedgerSection label={content.labels.experience} section="work">
        <ExperienceList content={content} direction="ledger" />
      </LedgerSection>
      <LedgerSection label={content.labels.projects} section="projects">
        <ProjectsList content={content} />
      </LedgerSection>
      <LedgerSection label={content.labels.education} section="education">
        <EducationList content={content} />
        <div className="mt-4 grid grid-cols-2 gap-6">
          <PlainCompactSection
            label={content.labels.certifications}
            values={content.certifications}
          />
          <PlainCompactSection label={content.labels.languages} values={content.spokenLanguages} />
        </div>
      </LedgerSection>
    </article>
  )
}

function WorkingBrief({ content }: { content: CvContent }) {
  return (
    <article
      className="px-[15mm] py-[14mm] font-sans text-[#222] text-[9pt] leading-[1.42]"
      data-cv-template="clearline"
      lang={content.language}
    >
      <header className="grid grid-cols-[1fr_52mm] gap-8 border-[#222] border-b-2 pb-5">
        <div>
          <p className="font-mono text-[#9e2a2b] text-[8pt] uppercase tracking-[0.15em]">
            Curriculum vitae
          </p>
          <h1 className="mt-2 font-heading font-medium text-[24pt] leading-none tracking-[-0.04em]">
            Camille N'Diaye
          </h1>
          <p className="mt-2 font-medium text-[11pt]">{content.headline}</p>
        </div>
        <Contact className="self-end text-right" content={content} stacked />
      </header>
      <section
        className="mt-5 grid grid-cols-[1.1fr_0.9fr] gap-8 bg-[#f4f1f1] px-5 py-4"
        data-cv-section="summary"
      >
        <div>
          <BracketHeading>{content.labels.profile}</BracketHeading>
          <p className="mt-2.5">{content.summary}</p>
        </div>
        <div data-cv-section="skills">
          <BracketHeading>{content.labels.skills}</BracketHeading>
          <SkillsList compact content={content} />
        </div>
      </section>
      <section className="mt-5" data-cv-section="work">
        <BracketHeading>{content.labels.experience}</BracketHeading>
        <ExperienceList content={content} direction="brief" />
      </section>
      <div className="mt-5 grid grid-cols-2 gap-8">
        <section data-cv-section="projects">
          <BracketHeading>{content.labels.projects}</BracketHeading>
          <ProjectsList content={content} />
        </section>
        <section data-cv-section="education">
          <BracketHeading>{content.labels.education}</BracketHeading>
          <EducationList content={content} />
          <div className="mt-4 grid grid-cols-2 gap-4">
            <PlainCompactSection
              label={content.labels.certifications}
              values={content.certifications}
            />
            <PlainCompactSection
              label={content.labels.languages}
              values={content.spokenLanguages}
            />
          </div>
        </section>
      </div>
    </article>
  )
}

function CvHeader({
  accent,
  content,
  nameClassName,
}: {
  accent: string
  content: CvContent
  nameClassName: string
}) {
  return (
    <header>
      <h1 className={`font-heading font-medium leading-none tracking-[-0.04em] ${nameClassName}`}>
        Camille N'Diaye
      </h1>
      <p className="mt-2 font-medium text-[11pt]" style={{ color: accent }}>
        {content.headline}
      </p>
      <Contact className="mt-3" content={content} />
    </header>
  )
}

function Contact({
  className,
  content,
  stacked = false,
}: {
  className?: string
  content: CvContent
  stacked?: boolean
}) {
  return (
    <address
      className={`${className ?? ''} flex gap-x-3 gap-y-1 text-[8.5pt] not-italic ${stacked ? 'flex-col items-end' : 'flex-wrap items-center'}`}
    >
      <span>{content.location}</span>
      <a
        className="cursor-pointer underline underline-offset-2"
        href="mailto:camille.ndiaye@example.com"
      >
        camille.ndiaye@example.com
      </a>
      <a className="cursor-pointer underline underline-offset-2" href="tel:+237600000000">
        +237 600 000 000
      </a>
      <a className="cursor-pointer underline underline-offset-2" href="https://example.com/camille">
        example.com/camille
      </a>
    </address>
  )
}

function LineHeading({ children, color }: { children: string; color: string }) {
  return (
    <h2
      className="flex items-center gap-3 font-semibold text-[8.5pt] uppercase tracking-[0.13em]"
      style={{ color }}
    >
      <span>{children}</span>
      <span aria-hidden="true" className="h-px flex-1 bg-current opacity-35" />
    </h2>
  )
}

function BracketHeading({ children }: { children: string }) {
  return (
    <h2 className="font-semibold text-[#9e2a2b] text-[8.5pt] uppercase tracking-[0.12em]">
      [ {children} ]
    </h2>
  )
}

function LedgerSection({
  children,
  label,
  section,
}: {
  children: React.ReactNode
  label: string
  section: string
}) {
  return (
    <section
      className="mt-5 grid grid-cols-[42mm_1fr] gap-7 border-[#d8dedb] border-t pt-5"
      data-cv-section={section}
    >
      <h2 className="font-semibold text-[#126b55] text-[8.5pt] uppercase tracking-[0.13em]">
        {label}
      </h2>
      <div>{children}</div>
    </section>
  )
}

function ExperienceList({
  content,
  direction,
}: {
  content: CvContent
  direction: 'signal' | 'ledger' | 'brief'
}) {
  return (
    <ol className="mt-3 space-y-4">
      {content.experience.map((entry, index) => (
        <li data-cv-entry={`work.${index}`} key={`${entry.organization}-${entry.role}`}>
          <div
            className={
              direction === 'brief'
                ? 'grid grid-cols-[32mm_1fr] gap-5'
                : 'grid grid-cols-[1fr_auto] gap-x-5 gap-y-1'
            }
          >
            {direction === 'brief' ? (
              <p className="font-mono text-[#5b5b5b] text-[8.5pt]">{entry.date}</p>
            ) : null}
            <div>
              <h3 className="font-semibold text-[10pt]">{entry.role}</h3>
              <p className="font-medium text-[9pt]">
                {entry.organization} · {entry.location}
              </p>
              <p className="mt-1.5">{entry.summary}</p>
              <ul className="mt-1.5 list-disc space-y-0.5 pl-4" data-cv-highlights>
                {entry.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </div>
            {direction === 'brief' ? null : (
              <p className="row-start-1 whitespace-nowrap font-mono text-[#52606d] text-[8.5pt] [grid-column:2]">
                {entry.date}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}

function SkillsList({ compact = false, content }: { compact?: boolean; content: CvContent }) {
  return (
    <ul className={`${compact ? 'mt-2 space-y-1' : 'mt-3 space-y-1.5'}`}>
      {content.skills.map((skill) => (
        <li key={skill.name}>
          <span className="font-semibold">{skill.name}:</span> {skill.keywords}
        </li>
      ))}
    </ul>
  )
}

function EducationList({ content }: { content: CvContent }) {
  return (
    <ol className="mt-3 space-y-3">
      {content.education.map((entry, index) => (
        <li data-cv-entry={`education.${index}`} key={entry.qualification}>
          <h3 className="font-semibold">{entry.qualification}</h3>
          <p>{entry.institution}</p>
          <time className="font-mono text-[#52606d] text-[8.5pt]">{entry.date}</time>
        </li>
      ))}
    </ol>
  )
}

function ProjectsList({ content }: { content: CvContent }) {
  return (
    <ol className="mt-3">
      {content.projects.map((entry, index) => (
        <li data-cv-entry={`projects.${index}`} key={entry.name}>
          <h3 className="font-semibold">
            {entry.name} · {entry.role}
          </h3>
          <p className="mt-1">{entry.summary}</p>
        </li>
      ))}
    </ol>
  )
}

function ClearlineRemainingSections({ content }: { content: CvContent }) {
  return (
    <>
      <section className="mt-5" data-cv-section="certifications">
        <LineHeading color="#155eef">{content.labels.certifications}</LineHeading>
        <ul className="mt-3 space-y-1">
          {content.certifications.map((certification) => (
            <li key={certification}>{certification}</li>
          ))}
        </ul>
      </section>
      <section className="mt-5" data-cv-section="awards">
        <LineHeading color="#155eef">{content.labels.awards}</LineHeading>
        <ol className="mt-3">
          {content.awards.map((award, index) => (
            <li data-cv-entry={`awards.${index}`} key={award.title}>
              <h3 className="font-semibold">
                {award.title} · {award.issuer}
              </h3>
              <time className="font-mono text-[#52606d] text-[8.5pt]">{award.date}</time>
              <p className="mt-1">{award.summary}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="mt-5" data-cv-section="volunteer">
        <LineHeading color="#155eef">{content.labels.volunteer}</LineHeading>
        <ol className="mt-3">
          {content.volunteer.map((entry, index) => (
            <li data-cv-entry={`volunteer.${index}`} key={`${entry.organization}-${entry.role}`}>
              <h3 className="font-semibold">
                {entry.role} · {entry.organization}
              </h3>
              <time className="font-mono text-[#52606d] text-[8.5pt]">{entry.date}</time>
              <p className="mt-1">{entry.summary}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="mt-5" data-cv-section="publications">
        <LineHeading color="#155eef">{content.labels.publications}</LineHeading>
        <ol className="mt-3">
          {content.publications.map((publication, index) => (
            <li data-cv-entry={`publications.${index}`} key={publication.name}>
              <h3 className="font-semibold">{publication.name}</h3>
              <p>
                {publication.publisher} ·{' '}
                <time className="font-mono text-[#52606d] text-[8.5pt]">{publication.date}</time>
              </p>
            </li>
          ))}
        </ol>
      </section>
      <section className="mt-5" data-cv-section="languages">
        <LineHeading color="#155eef">{content.labels.languages}</LineHeading>
        <ul className="mt-3 space-y-1">
          {content.spokenLanguages.map((language) => (
            <li key={language}>{language}</li>
          ))}
        </ul>
      </section>
    </>
  )
}

function PlainCompactSection({ label, values }: { label: string; values: string[] }) {
  return (
    <section>
      <h3 className="font-semibold text-[8pt] uppercase tracking-[0.1em]">{label}</h3>
      <ul className="mt-1.5 space-y-1">
        {values.map((value) => (
          <li key={value}>{value}</li>
        ))}
      </ul>
    </section>
  )
}

const printStyles = `
  @page {
    size: A4;
    margin: 0;
  }

  @media print {
    body {
      background: white;
    }

    .prototype-chrome {
      display: none;
    }

    .prototype-page-shell {
      max-width: none;
      overflow: visible;
      padding: 0;
    }

    .prototype-sheet {
      box-shadow: none;
      margin: 0;
      width: 210mm;
      min-height: 297mm;
    }
  }
`
