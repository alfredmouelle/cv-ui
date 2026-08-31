import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

const variants = ['A', 'B', 'C'] as const
const languages = ['en', 'fr'] as const

type Variant = (typeof variants)[number]
type Language = (typeof languages)[number]

type Search = {
  variant: Variant
  lang: Language
}

const variantNames: Record<Variant, string> = {
  A: 'Cobalt rail',
  B: 'Signal ledger',
  C: 'Split field',
}

function isVariant(value: unknown): value is Variant {
  return typeof value === 'string' && variants.includes(value as Variant)
}

function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && languages.includes(value as Language)
}

export const Route = createFileRoute('/prototype/visual-cv')({
  validateSearch: (search): Search => ({
    variant: isVariant(search.variant) ? search.variant : 'B',
    lang: isLanguage(search.lang) ? search.lang : 'en',
  }),
  component: VisualCvPrototype,
})

const copy = {
  en: {
    name: 'Amelia Clarke',
    initials: 'AC',
    headline: 'Product designer shaping public digital services',
    summary:
      'I turn complex public services into clear, inclusive products. My work joins field research, service design, and practical delivery with engineering teams.',
    contact: 'Contact',
    profile: 'Profile',
    experience: 'Experience',
    education: 'Education',
    skills: 'Skills',
    languages: 'Languages',
    projects: 'Selected projects',
    certifications: 'Certifications',
    awards: 'Awards',
    volunteer: 'Volunteer',
    publications: 'Publications',
    present: 'Present',
    location: 'Lyon, France',
    work: [
      {
        role: 'Lead product designer',
        org: 'Civic Works Studio',
        place: 'Lyon, France',
        date: '2022 - Present',
        summary:
          'Lead a six-person design practice working on health and local-government services.',
        highlights: [
          'Redesigned an appointment service used by 1.2 million residents, reducing incomplete bookings by 31%.',
          'Built a research library and weekly decision review used by four product teams.',
        ],
      },
      {
        role: 'Senior service designer',
        org: 'Northline Digital',
        place: 'Manchester, UK',
        date: '2018 - 2022',
        summary:
          'Worked with policy, operations, and engineering teams on national public services.',
        highlights: [
          'Mapped a benefits appeal journey across nine agencies and set the shared delivery plan.',
          'Coached eight designers and introduced accessible prototype reviews.',
        ],
      },
    ],
    educationItems: [
      ['MA Service Design', 'Royal College of Art', '2016 - 2018'],
      ['BA Graphic Design', 'University of Leeds', '2012 - 2015'],
    ],
    skillItems: ['Service design', 'Research', 'Prototyping', 'Design systems', 'Facilitation'],
    languageItems: [
      ['English', 'Native'],
      ['French', 'Professional'],
    ],
    projectItems: [
      [
        'Care Pathways',
        'Design lead',
        '2024',
        'A shared referral model for regional health and social-care teams.',
      ],
      [
        'Civic Patterns',
        'Maintainer',
        '2021 - Present',
        'An open library of accessible patterns for public services.',
      ],
    ],
    certificationItems: [
      ['IAAP CPACC', 'IAAP', '2023'],
      ['Systems Practice', 'Acumen Academy', '2020'],
    ],
    awardItems: [['Design for Social Good', 'D&AD', '2024']],
    volunteerItems: [['Design mentor', 'Out in Tech', '2021 - Present']],
    publicationItems: [['Research without theatre', 'Designing Services Quarterly', '2023']],
  },
  fr: {
    name: 'Amélie Clarke',
    initials: 'AC',
    headline: 'Designer produit au service des services publics numériques',
    summary:
      "Je transforme des services publics complexes en produits clairs et inclusifs. Mon travail réunit recherche de terrain, design de services et réalisation avec les équipes d'ingénierie.",
    contact: 'Coordonnées',
    profile: 'Profil',
    experience: 'Expérience',
    education: 'Formation',
    skills: 'Compétences',
    languages: 'Langues',
    projects: 'Projets choisis',
    certifications: 'Certifications',
    awards: 'Distinctions',
    volunteer: 'Bénévolat',
    publications: 'Publications',
    present: "Aujourd'hui",
    location: 'Lyon, France',
    work: [
      {
        role: 'Lead product designer',
        org: 'Civic Works Studio',
        place: 'Lyon, France',
        date: "2022 - Aujourd'hui",
        summary: 'Je dirige une équipe de six designers sur des services de santé et de proximité.',
        highlights: [
          "Refonte d'un service de rendez-vous utilisé par 1,2 million de personnes, avec 31 % de réservations incomplètes en moins.",
          'Création d’une base de recherche et d’une revue hebdomadaire utilisée par quatre équipes produit.',
        ],
      },
      {
        role: 'Senior service designer',
        org: 'Northline Digital',
        place: 'Manchester, Royaume-Uni',
        date: '2018 - 2022',
        summary:
          "Travail avec les équipes des politiques publiques, des opérations et de l'ingénierie.",
        highlights: [
          "Cartographie d'un parcours de recours impliquant neuf organismes, puis définition du plan commun.",
          'Accompagnement de huit designers et création de revues de prototypes accessibles.',
        ],
      },
    ],
    educationItems: [
      ['MA Design de services', 'Royal College of Art', '2016 - 2018'],
      ['BA Design graphique', 'Université de Leeds', '2012 - 2015'],
    ],
    skillItems: [
      'Design de services',
      'Recherche',
      'Prototypage',
      'Systèmes de design',
      'Facilitation',
    ],
    languageItems: [
      ['Anglais', 'Langue maternelle'],
      ['Français', 'Courant'],
    ],
    projectItems: [
      [
        'Parcours de soins',
        'Direction du design',
        '2024',
        "Un modèle d'orientation commun aux équipes sanitaires et sociales.",
      ],
      [
        'Civic Patterns',
        'Mainteneuse',
        "2021 - Aujourd'hui",
        'Une bibliothèque ouverte de modèles accessibles pour les services publics.',
      ],
    ],
    certificationItems: [
      ['IAAP CPACC', 'IAAP', '2023'],
      ['Pratique des systèmes', 'Acumen Academy', '2020'],
    ],
    awardItems: [['Design pour le bien commun', 'D&AD', '2024']],
    volunteerItems: [['Mentore design', 'Out in Tech', "2021 - Aujourd'hui"]],
    publicationItems: [['La recherche sans théâtre', 'Designing Services Quarterly', '2023']],
  },
} as const

function VisualCvPrototype() {
  const { variant, lang } = Route.useSearch()
  const data = copy[lang]

  return (
    <main className="min-h-svh bg-[#dce2e4] px-3 py-8 text-[#17202a] sm:px-6 sm:py-12">
      <div className="mx-auto mb-5 flex max-w-[210mm] items-end justify-between gap-6 text-[#27333b]">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em]">Throwaway prototype</p>
          <h1 className="mt-1 font-heading font-semibold text-lg tracking-tight">
            Three visual two-column CV directions
          </h1>
        </div>
        <p className="hidden max-w-xs text-right text-xs leading-5 sm:block">
          Evaluate hierarchy, tone, density, and column behavior. Production pagination will use
          normal document flow.
        </p>
      </div>

      {variant === 'A' && <VariantA data={data} lang={lang} />}
      {variant === 'B' && <VariantB data={data} lang={lang} />}
      {variant === 'C' && <VariantC data={data} lang={lang} />}

      {import.meta.env.DEV ? <PrototypeSwitcher lang={lang} variant={variant} /> : null}
    </main>
  )
}

type CvCopy = (typeof copy)[Language]

function VariantA({ data, lang }: { data: CvCopy; lang: Language }) {
  return (
    <article
      className="mx-auto grid aspect-[210/297] w-full max-w-[210mm] grid-cols-[34%_66%] overflow-hidden bg-white shadow-[0_18px_70px_rgba(26,38,48,0.22)]"
      data-cv-template="cobalt-rail"
      lang={lang}
    >
      <aside className="flex min-w-0 flex-col bg-[#173f7a] px-[10%] py-[12%] text-white">
        <div className="grid size-[clamp(3rem,8vw,5.25rem)] place-items-center rounded-full border border-[#9cc7ff] bg-[#2361ad] font-heading font-semibold text-[clamp(1.2rem,3vw,2rem)] tracking-[-0.06em]">
          {data.initials}
        </div>
        <SideSection title={data.contact}>
          <address className="space-y-1.5 not-italic">
            <a href="mailto:amelia@example.com">amelia@example.com</a>
            <a href="tel:+33472123456">+33 4 72 12 34 56</a>
            <span>{data.location}</span>
            <a href="https://ameliac.example">ameliac.example</a>
          </address>
        </SideSection>
        <SideSection title={data.skills}>
          <ul className="flex flex-wrap gap-1.5">
            {data.skillItems.map((skill) => (
              <li className="rounded-full border border-[#8db8eb] px-2 py-1" key={skill}>
                {skill}
              </li>
            ))}
          </ul>
        </SideSection>
        <SideSection title={data.languages}>
          <ul className="space-y-2">
            {data.languageItems.map(([name, level]) => (
              <li className="grid gap-0.5" key={name}>
                <strong className="font-medium text-white">{name}</strong>
                <span className="text-[#c9dcf3]">{level}</span>
              </li>
            ))}
          </ul>
        </SideSection>
        <div className="mt-auto border-[#6c99cc] border-t pt-4 font-mono text-[#b9d3ef] text-[clamp(0.4rem,1vw,0.58rem)] uppercase tracking-[0.16em]">
          Design · Research · Delivery
        </div>
      </aside>

      <div className="min-w-0 px-[8%] py-[8%]">
        <header className="border-[#c8d7e7] border-b pb-[5%]">
          <p className="font-mono text-[#2361ad] text-[clamp(0.42rem,1.1vw,0.62rem)] uppercase tracking-[0.18em]">
            Product and service design
          </p>
          <h2 className="mt-2 text-balance font-heading font-semibold text-[clamp(1.5rem,4.5vw,3.15rem)] leading-[0.94] tracking-[-0.06em]">
            {data.name}
          </h2>
          <p className="mt-3 max-w-[38rem] text-pretty font-medium text-[#3c536a] text-[clamp(0.6rem,1.65vw,0.95rem)] leading-[1.25]">
            {data.headline}
          </p>
        </header>
        <MainSection title={data.profile}>
          <p>{data.summary}</p>
        </MainSection>
        <MainSection title={data.experience}>
          <div className="space-y-[4%]">
            {data.work.map((item) => (
              <WorkItem item={item} key={item.org} />
            ))}
          </div>
        </MainSection>
        <div className="mt-[4%] grid grid-cols-2 gap-[6%]">
          <CompactList items={data.educationItems} title={data.education} />
          <CompactList items={data.projectItems} title={data.projects} />
        </div>
        <div className="mt-[4%] grid grid-cols-3 gap-[4%] border-[#c8d7e7] border-t pt-[4%]">
          <TinyList items={data.certificationItems} title={data.certifications} />
          <TinyList items={data.awardItems} title={data.awards} />
          <TinyList
            items={[...data.volunteerItems, ...data.publicationItems]}
            title={data.volunteer}
          />
        </div>
      </div>
    </article>
  )
}

function VariantB({ data, lang }: { data: CvCopy; lang: Language }) {
  return (
    <article
      className="mx-auto aspect-[210/297] w-full max-w-[210mm] overflow-hidden bg-[#f7f8fa] shadow-[0_18px_70px_rgba(26,38,48,0.22)]"
      data-cv-template="signal-ledger"
      lang={lang}
    >
      <header className="grid h-[17.5%] grid-cols-[64%_36%] bg-[#151b26] text-white">
        <div className="flex min-w-0 flex-col justify-end px-[10.4%] py-[9%]">
          <h2 className="font-heading font-semibold text-[clamp(1.4rem,5vw,30pt)] leading-none tracking-[-0.055em]">
            {data.name}
          </h2>
          <p className="mt-2 max-w-xl text-[#dbe3ef] text-[clamp(0.55rem,1.85vw,11pt)] leading-[1.25]">
            {data.headline}
          </p>
        </div>
        <div aria-hidden="true" className="relative bg-[#ffcc4d]">
          <div className="absolute inset-x-[18%] top-1/2 grid -translate-y-1/2 gap-[clamp(0.18rem,0.7vw,0.35rem)]">
            {Array.from({ length: 6 }, (_, index) => (
              <span className="h-px bg-[#151b26]" key={index} />
            ))}
          </div>
          <span className="absolute inset-y-[24%] left-[42%] w-px bg-[#151b26]" />
          <span className="absolute right-[18%] bottom-[24%] size-[clamp(0.45rem,1.5vw,0.75rem)] bg-[#151b26]" />
        </div>
      </header>

      <div className="grid h-[82.5%] grid-cols-[64fr_36fr] content-start gap-x-[3.8%] gap-y-[3.2%] px-[6.67%] py-[4.04%]">
        <section className="min-w-0 text-[#3f4a57] text-[clamp(0.44rem,1.55vw,9.25pt)] leading-[1.35]">
          <LedgerHeading title={data.profile} />
          <p className="mt-[2%]">{data.summary}</p>
        </section>
        <section className="min-w-0 border-[#c9d0d8] border-l pl-[10%] text-[#3f4a57] text-[clamp(0.44rem,1.55vw,9.25pt)] leading-[1.35]">
          <LedgerHeading title={data.contact} />
          <address className="mt-[5%] grid gap-1 font-normal not-italic">
            <a href="mailto:amelia@example.com">amelia@example.com</a>
            <a href="tel:+33472123456">+33 4 72 12 34 56</a>
            <span>{data.location}</span>
            <a href="https://ameliac.example">ameliac.example</a>
          </address>
        </section>

        <section className="min-w-0">
          <LedgerHeading title={data.experience} />
          <div className="mt-[3%] space-y-[4%]">
            {data.work.map((item) => (
              <div className="grid grid-cols-[24%_76%] gap-[4%]" key={item.org}>
                <div className="text-[#4f5b69] text-[clamp(0.4rem,1.34vw,8pt)] uppercase leading-[1.25] tracking-[0.06em]">
                  <p>{item.date}</p>
                  <p className="mt-1">{item.place}</p>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-[clamp(0.58rem,1.76vw,10.5pt)] leading-[1.2] tracking-[-0.025em]">
                    {item.role}
                  </h3>
                  <p className="mt-0.5 font-medium text-[#1f65a8] text-[clamp(0.44rem,1.55vw,9.25pt)] leading-[1.35]">
                    {item.org}
                  </p>
                  <p className="mt-1 text-[#3f4a57] text-[clamp(0.44rem,1.55vw,9.25pt)] leading-[1.35]">
                    {item.summary}
                  </p>
                  <ul className="mt-1 space-y-0.5 text-[clamp(0.44rem,1.55vw,9.25pt)] leading-[1.35]">
                    {item.highlights.map((highlight) => (
                      <li className="grid grid-cols-[0.5rem_1fr] gap-1" key={highlight}>
                        <span className="text-[#1f65a8]">→</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>
        <aside className="min-w-0 border-[#c9d0d8] border-l pl-[10%]">
          <LedgerHeading title={data.skills} />
          <ul className="mt-[5%] space-y-1.5 text-[clamp(0.44rem,1.55vw,9.25pt)] leading-[1.35]">
            {data.skillItems.map((skill) => (
              <li className="flex items-center gap-2" key={skill}>
                <span aria-hidden="true" className="size-1.5 shrink-0 bg-[#1f65a8]" />
                <span>{skill}</span>
              </li>
            ))}
          </ul>
          <div className="mt-[10%]">
            <LedgerHeading title={data.languages} />
            <ul className="mt-[5%] space-y-1.5 text-[clamp(0.44rem,1.55vw,9.25pt)] leading-[1.35]">
              {data.languageItems.map(([name, level]) => (
                <li key={name}>
                  <strong className="font-semibold">{name}</strong>
                  <span className="block text-[#3f4a57]">{level}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section className="min-w-0">
          <LedgerHeading title={data.education} />
          <CompactRows items={data.educationItems} />
        </section>
        <aside className="min-w-0 border-[#c9d0d8] border-l pl-[10%]">
          <LedgerHeading title={data.certifications} />
          <CompactRows items={data.certificationItems} />
        </aside>

        <section className="min-w-0">
          <LedgerHeading title={data.projects} />
          <CompactRows items={data.projectItems} />
        </section>
        <aside className="min-w-0 border-[#c9d0d8] border-l pl-[10%]">
          <LedgerHeading title={data.awards} />
          <CompactRows items={data.awardItems} />
          <div className="mt-[9%]">
            <LedgerHeading title={data.volunteer} />
            <CompactRows items={data.volunteerItems} />
          </div>
          <div className="mt-[9%]">
            <LedgerHeading title={data.publications} />
            <CompactRows items={data.publicationItems} />
          </div>
        </aside>
      </div>
    </article>
  )
}

function VariantC({ data, lang }: { data: CvCopy; lang: Language }) {
  return (
    <article
      className="relative mx-auto aspect-[210/297] w-full max-w-[210mm] overflow-hidden bg-[#f2f5f2] shadow-[0_18px_70px_rgba(26,38,48,0.22)]"
      data-cv-template="split-field"
      lang={lang}
    >
      <div className="absolute inset-y-0 left-[47%] w-px bg-[#b9c6bf]" />
      <header className="relative grid h-[24%] grid-cols-[47%_53%]">
        <div className="flex items-end bg-[#b8ff62] px-[10%] py-[9%]">
          <p className="font-mono text-[clamp(0.42rem,1vw,0.6rem)] uppercase leading-[1.5] tracking-[0.14em]">
            Independent designer
            <br />
            Lyon / Europe
          </p>
        </div>
        <div className="flex min-w-0 flex-col justify-end bg-[#f2f5f2] px-[9%] py-[8%]">
          <h2 className="font-heading font-semibold text-[clamp(1.7rem,5.3vw,3.65rem)] leading-[0.87] tracking-[-0.075em]">
            {data.name}
          </h2>
          <p className="mt-3 max-w-lg text-[#34443b] text-[clamp(0.55rem,1.45vw,0.82rem)] leading-[1.28]">
            {data.headline}
          </p>
        </div>
      </header>

      <div className="relative grid h-[76%] grid-cols-[47%_53%]">
        <div className="min-w-0 px-[9%] py-[8%]">
          <FrameSection title={data.profile}>
            <p>{data.summary}</p>
          </FrameSection>
          <FrameSection title={data.skills}>
            <ol className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              {data.skillItems.map((skill, index) => (
                <li className="flex gap-1.5" key={skill}>
                  <span className="font-mono text-[#5d6c63]">{index + 1}</span>
                  <span>{skill}</span>
                </li>
              ))}
            </ol>
          </FrameSection>
          <FrameSection title={data.education}>
            <CompactRows items={data.educationItems} />
          </FrameSection>
          <FrameSection title={data.projects}>
            <CompactRows items={data.projectItems} />
          </FrameSection>
          <FrameSection title={data.contact}>
            <address className="grid gap-1 not-italic">
              <a href="mailto:amelia@example.com">amelia@example.com</a>
              <a href="tel:+33472123456">+33 4 72 12 34 56</a>
              <span>{data.location}</span>
            </address>
          </FrameSection>
        </div>

        <div className="min-w-0 bg-white/65 px-[8%] py-[7%]">
          <FrameSection title={data.experience}>
            <div className="space-y-[6%]">
              {data.work.map((item) => (
                <div className="grid grid-cols-[1rem_1fr] gap-2" key={item.org}>
                  <div className="mt-1.5 size-2 bg-[#315e50]" />
                  <div>
                    <p className="font-mono text-[#5d6c63] text-[clamp(0.38rem,0.9vw,0.54rem)] uppercase tracking-[0.08em]">
                      {item.date} · {item.place}
                    </p>
                    <h3 className="mt-1 font-heading font-semibold text-[clamp(0.68rem,1.6vw,0.96rem)] leading-tight tracking-[-0.03em]">
                      {item.role}
                    </h3>
                    <p className="font-medium text-[#315e50] text-[clamp(0.46rem,1.05vw,0.62rem)]">
                      {item.org}
                    </p>
                    <p className="mt-1.5 text-[#34443b] text-[clamp(0.46rem,1.05vw,0.62rem)] leading-[1.45]">
                      {item.summary}
                    </p>
                    <ul className="mt-1.5 space-y-1 text-[clamp(0.44rem,1vw,0.6rem)] leading-[1.4]">
                      {item.highlights.map((highlight) => (
                        <li className="grid grid-cols-[0.5rem_1fr] gap-1" key={highlight}>
                          <span>•</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </FrameSection>
          <div className="grid grid-cols-2 gap-[7%]">
            <FrameSection title={data.certifications}>
              <CompactRows items={data.certificationItems} />
            </FrameSection>
            <FrameSection title={data.languages}>
              <CompactRows items={data.languageItems} />
            </FrameSection>
          </div>
          <div className="grid grid-cols-2 gap-[7%]">
            <FrameSection title={data.awards}>
              <CompactRows items={data.awardItems} />
            </FrameSection>
            <FrameSection title={data.volunteer}>
              <CompactRows items={data.volunteerItems} />
            </FrameSection>
          </div>
          <FrameSection title={data.publications}>
            <CompactRows items={data.publicationItems} />
          </FrameSection>
        </div>
      </div>
    </article>
  )
}

function SideSection({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="mt-[14%] text-[#e0ebf7] text-[clamp(0.43rem,1vw,0.62rem)] leading-[1.45]">
      <h3 className="mb-2 border-[#6c99cc] border-b pb-1.5 font-medium font-mono text-[clamp(0.4rem,0.9vw,0.56rem)] text-white uppercase tracking-[0.14em]">
        {title}
      </h3>
      {children}
    </section>
  )
}

function MainSection({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="mt-[4%] text-[#33485d] text-[clamp(0.48rem,1.15vw,0.68rem)] leading-[1.45]">
      <h3 className="mb-2 flex items-center gap-2 font-heading font-semibold text-[#172b40] text-[clamp(0.66rem,1.6vw,0.95rem)] tracking-[-0.025em]">
        <span className="h-2 w-5 bg-[#2361ad]" />
        {title}
      </h3>
      {children}
    </section>
  )
}

function WorkItem({ item }: { item: CvCopy['work'][number] }) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-heading font-semibold text-[#172b40] text-[clamp(0.62rem,1.45vw,0.86rem)] leading-tight tracking-[-0.02em]">
            {item.role}
          </h4>
          <p className="font-medium text-[#2361ad]">{item.org}</p>
        </div>
        <p className="shrink-0 font-mono text-[#5b6c7b] text-[clamp(0.38rem,0.9vw,0.52rem)] uppercase">
          {item.date}
        </p>
      </div>
      <p className="mt-1">{item.summary}</p>
      <ul className="mt-1 space-y-0.5">
        {item.highlights.map((highlight) => (
          <li className="grid grid-cols-[0.5rem_1fr] gap-1" key={highlight}>
            <span className="text-[#2361ad]">•</span>
            <span>{highlight}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function CompactList({ items, title }: { items: readonly (readonly string[])[]; title: string }) {
  return (
    <section>
      <h3 className="mb-2 font-heading font-semibold text-[clamp(0.62rem,1.45vw,0.86rem)] tracking-[-0.02em]">
        {title}
      </h3>
      <CompactRows items={items} />
    </section>
  )
}

function TinyList({ items, title }: { items: readonly (readonly string[])[]; title: string }) {
  return (
    <section className="min-w-0">
      <h3 className="font-medium font-mono text-[#2361ad] text-[clamp(0.34rem,0.8vw,0.48rem)] uppercase tracking-[0.08em]">
        {title}
      </h3>
      <CompactRows items={items} />
    </section>
  )
}

function CompactRows({ items }: { items: readonly (readonly string[])[] }) {
  return (
    <ul className="mt-2 space-y-2 text-[#34443b] text-[clamp(0.42rem,1vw,0.6rem)] leading-[1.35]">
      {items.map((item) => (
        <li key={item.join('-')}>
          <strong className="block font-semibold text-[#17202a]">{item[0]}</strong>
          <span>{item.slice(1).join(' · ')}</span>
        </li>
      ))}
    </ul>
  )
}

function LedgerHeading({ title }: { title: string }) {
  return (
    <h3 className="flex items-center gap-2 border-[#c9d0d8] border-b pb-1.5 font-semibold text-[clamp(0.42rem,1.34vw,8pt)] uppercase leading-[1.25] tracking-[0.1em]">
      <span aria-hidden="true" className="size-1.5 shrink-0 bg-[#1f65a8]" />
      <span className="text-[#151b26]">{title}</span>
    </h3>
  )
}

function FrameSection({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="mb-[9%] text-[#34443b] text-[clamp(0.46rem,1.08vw,0.64rem)] leading-[1.5]">
      <h3 className="mb-2 flex items-center justify-between gap-3 font-mono font-semibold text-[#17202a] text-[clamp(0.42rem,0.95vw,0.56rem)] uppercase tracking-[0.1em]">
        <span>{title}</span>
        <span className="h-px flex-1 bg-[#9dad9f]" />
      </h3>
      {children}
    </section>
  )
}

function PrototypeSwitcher({ lang, variant }: Search) {
  const navigate = useNavigate({ from: Route.fullPath })
  const currentIndex = variants.indexOf(variant)

  const selectVariant = (nextVariant: Variant) => {
    void navigate({ search: { lang, variant: nextVariant }, replace: true })
  }

  const cycle = (direction: -1 | 1) => {
    const nextIndex = (currentIndex + direction + variants.length) % variants.length
    selectVariant(variants[nextIndex])
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return
      }
      if (event.key === 'ArrowLeft') {
        cycle(-1)
      }
      if (event.key === 'ArrowRight') {
        cycle(1)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/15 bg-[#101722] p-1.5 text-white shadow-2xl">
      <button
        aria-label="Previous variant"
        className="grid size-9 cursor-pointer place-items-center rounded-full hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[#b8ff62]"
        onClick={() => cycle(-1)}
        type="button"
      >
        ←
      </button>
      <div className="min-w-36 px-2 text-center">
        <p className="font-medium text-xs">
          {variant} · {variantNames[variant]}
        </p>
      </div>
      <button
        aria-label="Next variant"
        className="grid size-9 cursor-pointer place-items-center rounded-full hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[#b8ff62]"
        onClick={() => cycle(1)}
        type="button"
      >
        →
      </button>
      <div className="ml-1 flex border-white/15 border-l pl-1">
        {languages.map((language) => (
          <button
            className={`h-9 cursor-pointer rounded-full px-3 font-mono text-[10px] uppercase ${
              language === lang ? 'bg-white text-[#101722]' : 'text-white/70 hover:text-white'
            }`}
            key={language}
            onClick={() => void navigate({ search: { lang: language, variant }, replace: true })}
            type="button"
          >
            {language}
          </button>
        ))}
      </div>
    </div>
  )
}
