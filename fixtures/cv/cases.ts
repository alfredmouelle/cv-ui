import type { CvFidelityError } from '../../registry/cv-data/cv-data'

export type CvPaginationSignatureV1 = Readonly<
  Record<'clearline' | 'signal-ledger', readonly (readonly string[])[]>
>
export type CvAcceptanceCorpusCaseV1 =
  | {
      readonly id: string
      readonly data: unknown
      readonly expected: { readonly success: true }
      readonly pagination: CvPaginationSignatureV1
    }
  | {
      readonly id: string
      readonly data: unknown
      readonly expected: { readonly success: false; readonly errors: readonly CvFidelityError[] }
    }

export const CV_ACCEPTANCE_CORPUS_V1: readonly CvAcceptanceCorpusCaseV1[] = [
  {
    id: 'minimum',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [[]],
      'signal-ledger': [[]],
    },
  },
  {
    id: 'en',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: "Camille N'Diaye",
        headline: 'Product engineer for public-interest services',
        email: 'camille.ndiaye@example.com',
        phone: '+33 6 12 34 56 78',
        location: 'Paris, France',
        links: [
          {
            label: 'Portfolio',
            url: 'https://example.com/camille',
          },
          {
            label: 'Code profile',
            url: 'https://example.com/camille/code',
          },
        ],
      },
      summary:
        'Product engineer who builds accessible services for multilingual communities and turns policy constraints into reliable software.',
      work: [
        {
          organization: 'Civic Works Cooperative',
          position: 'Senior product engineer',
          positionReference: {
            vocabulary: 'ESCO',
            uri: 'https://data.europa.eu/esco/occupation/example',
            version: '1.2',
          },
          location: 'Paris, France',
          url: 'https://example.com/civic-works',
          dateRange: {
            start: '2021-03',
            end: '2025-06',
          },
          summary: 'Led delivery of case-management services used by municipal support teams.',
          highlights: ['Cut application processing time by 38% without removing manual review.'],
        },
      ],
      education: [
        {
          institution: 'University of Lyon',
          qualification: 'Master of Science',
          qualificationReference: {
            vocabulary: 'ISCED',
            uri: 'https://example.com/isced/7',
            version: '2011',
          },
          field: 'Human-computer interaction',
          location: 'Lyon, France',
          url: 'https://example.com/university-lyon',
          dateRange: {
            start: '2015',
            end: '2017',
          },
          score: 'Distinction',
          highlights: ['Researched form completion across French and English public services.'],
        },
      ],
      projects: [
        {
          name: 'Plain Forms',
          role: 'Maintainer',
          url: 'https://example.com/plain-forms',
          dateRange: {
            start: '2023-09',
          },
          summary:
            'Open form patterns for services that must work with keyboards and screen readers.',
          highlights: ['Published tested patterns in two languages.'],
        },
      ],
      skills: [
        {
          name: 'Accessible product engineering',
          skillReference: {
            vocabulary: 'ESCO',
            uri: 'https://example.com/skills/accessibility',
          },
          level: 'Advanced',
          keywords: ['React', 'TypeScript', 'Design systems'],
        },
      ],
      languages: [
        {
          name: 'English',
          code: 'en',
          fluency: 'Professional',
        },
        {
          name: 'French',
          code: 'fr',
          fluency: 'Native',
        },
      ],
      certifications: [
        {
          name: 'Web Accessibility Specialist',
          issuer: 'Accessibility Guild',
          date: '2022-05-12',
          expires: '2026-05-12',
          credentialId: 'WAS-2048',
          url: 'https://example.com/credentials/was-2048',
        },
      ],
      awards: [
        {
          title: 'Public Service Software Prize',
          issuer: 'Digital Commons Forum',
          date: '2024',
          summary: 'Recognized a multilingual intake service built with community reviewers.',
        },
      ],
      volunteer: [
        {
          organization: 'Code Neighbours',
          role: 'Workshop mentor',
          location: 'Saint-Denis, France',
          url: 'https://example.com/code-neighbours',
          dateRange: {
            start: '2020-01',
          },
          summary: 'Runs monthly web workshops for career changers.',
          highlights: ['Prepared accessible exercises used by twelve volunteer mentors.'],
        },
      ],
      publications: [
        {
          name: 'Designing forms across language boundaries',
          authors: ["Camille N'Diaye", 'Amina Diallo'],
          publisher: 'Public Digital Review',
          date: '2024-11-08',
          url: 'https://example.com/publications/language-boundaries',
          summary:
            'A field report on translated labels, validation messages, and assisted completion.',
        },
      ],
      extensions: {
        'com.example.cv-ui': {
          source: 'canonical',
          reviewed: true,
        },
      },
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [
        [
          'section:summary',
          'section:work',
          'entry:work.0',
          'section:projects',
          'entry:projects.0',
          'section:skills',
          'entry:skills.0',
        ],
        [
          'section:education',
          'entry:education.0',
          'section:certifications',
          'entry:certifications.0',
          'section:awards',
          'entry:awards.0',
          'section:volunteer',
          'entry:volunteer.0',
          'section:publications',
          'entry:publications.0',
          'section:languages',
          'entry:languages.0',
          'entry:languages.1',
        ],
      ],
      'signal-ledger': [
        [
          'section:summary',
          'section:work',
          'entry:work.0',
          'section:skills',
          'entry:skills.0',
          'section:languages',
          'entry:languages.0',
          'entry:languages.1',
        ],
        [
          'section:education',
          'entry:education.0',
          'section:certifications',
          'entry:certifications.0',
          'section:projects',
          'entry:projects.0',
          'section:awards',
          'entry:awards.0',
          'section:volunteer',
          'entry:volunteer.0',
          'section:publications',
          'entry:publications.0',
        ],
      ],
    },
  },
  {
    id: 'fr',
    data: {
      schemaVersion: '1',
      language: 'fr',
      person: {
        name: "Camille N'Diaye",
        headline: "Ingénieure produit pour les services d'intérêt public",
        email: 'camille.ndiaye@example.com',
        phone: '+33 6 12 34 56 78',
        location: 'Paris, France',
        links: [
          {
            label: 'Portfolio',
            url: 'https://example.com/camille',
          },
          {
            label: 'Profil de code',
            url: 'https://example.com/camille/code',
          },
        ],
      },
      summary:
        'Ingénieure produit qui conçoit des services accessibles pour des communautés multilingues et transforme les contraintes publiques en logiciels fiables.',
      work: [
        {
          organization: 'Civic Works Cooperative',
          position: 'Ingénieure produit senior',
          positionReference: {
            vocabulary: 'ESCO',
            uri: 'https://data.europa.eu/esco/occupation/example',
            version: '1.2',
          },
          location: 'Paris, France',
          url: 'https://example.com/civic-works',
          dateRange: {
            start: '2021-03',
            end: '2025-06',
          },
          summary:
            'Pilotage de services de gestion de dossiers utilisés par des équipes municipales.',
          highlights: [
            'Réduction de 38 % du délai de traitement sans supprimer la vérification humaine.',
          ],
        },
      ],
      education: [
        {
          institution: 'University of Lyon',
          qualification: 'Master sciences et technologies',
          qualificationReference: {
            vocabulary: 'ISCED',
            uri: 'https://example.com/isced/7',
            version: '2011',
          },
          field: 'Interaction humain-machine',
          location: 'Lyon, France',
          url: 'https://example.com/university-lyon',
          dateRange: {
            start: '2015',
            end: '2017',
          },
          score: 'Mention très bien',
          highlights: [
            'Recherche sur les formulaires des services publics en français et en anglais.',
          ],
        },
      ],
      projects: [
        {
          name: 'Formulaires clairs',
          role: 'Mainteneuse',
          url: 'https://example.com/plain-forms',
          dateRange: {
            start: '2023-09',
          },
          summary: "Modèles de formulaires ouverts pour le clavier et les lecteurs d'écran.",
          highlights: ['Publication de modèles testés dans deux langues.'],
        },
      ],
      skills: [
        {
          name: 'Ingénierie produit accessible',
          skillReference: {
            vocabulary: 'ESCO',
            uri: 'https://example.com/skills/accessibility',
          },
          level: 'Avancé',
          keywords: ['React', 'TypeScript', 'Systèmes de conception'],
        },
      ],
      languages: [
        {
          name: 'Anglais',
          code: 'en',
          fluency: 'Professionnel',
        },
        {
          name: 'Français',
          code: 'fr',
          fluency: 'Langue maternelle',
        },
      ],
      certifications: [
        {
          name: 'Web Accessibility Specialist',
          issuer: 'Accessibility Guild',
          date: '2022-05-12',
          expires: '2026-05-12',
          credentialId: 'WAS-2048',
          url: 'https://example.com/credentials/was-2048',
        },
      ],
      awards: [
        {
          title: 'Prix du logiciel de service public',
          issuer: 'Digital Commons Forum',
          date: '2024',
          summary: 'Récompense pour un service multilingue conçu avec des évaluateurs locaux.',
        },
      ],
      volunteer: [
        {
          organization: 'Code Neighbours',
          role: "Mentore d'atelier",
          location: 'Saint-Denis, France',
          url: 'https://example.com/code-neighbours',
          dateRange: {
            start: '2020-01',
          },
          summary: 'Anime chaque mois des ateliers web pour des personnes en reconversion.',
          highlights: ["Création d'exercices accessibles utilisés par douze mentors bénévoles."],
        },
      ],
      publications: [
        {
          name: 'Concevoir des formulaires au-delà des frontières linguistiques',
          authors: ["Camille N'Diaye", 'Amina Diallo'],
          publisher: 'Public Digital Review',
          date: '2024-11-08',
          url: 'https://example.com/publications/language-boundaries',
          summary:
            "Étude des libellés traduits, des messages de validation et de l'accompagnement.",
        },
      ],
      extensions: {
        'com.example.cv-ui': {
          source: 'canonical',
          reviewed: true,
        },
      },
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [
        [
          'section:summary',
          'section:work',
          'entry:work.0',
          'section:projects',
          'entry:projects.0',
          'section:skills',
          'entry:skills.0',
        ],
        [
          'section:education',
          'entry:education.0',
          'section:certifications',
          'entry:certifications.0',
          'section:awards',
          'entry:awards.0',
          'section:volunteer',
          'entry:volunteer.0',
          'section:publications',
          'entry:publications.0',
          'section:languages',
          'entry:languages.0',
          'entry:languages.1',
        ],
      ],
      'signal-ledger': [
        [
          'section:summary',
          'section:work',
          'entry:work.0',
          'section:skills',
          'entry:skills.0',
          'section:languages',
          'entry:languages.0',
          'entry:languages.1',
        ],
        [
          'section:education',
          'entry:education.0',
          'section:certifications',
          'entry:certifications.0',
          'section:projects',
          'entry:projects.0',
          'section:awards',
          'entry:awards.0',
          'section:volunteer',
          'entry:volunteer.0',
          'section:publications',
          'entry:publications.0',
        ],
      ],
    },
  },
  {
    id: 'maximum-envelope',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      summary:
        'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
      work: [
        {
          organization: 'A',
          position: 'A',
          summary: 'a a a a a a a a a a a a a a a a a a a a a a a a a a',
          highlights: [
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
          ],
        },
        {
          organization: 'A',
          position: 'A',
          summary: 'a',
          highlights: [
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
          ],
        },
        {
          organization: 'A',
          position: 'A',
          summary: 'a',
          highlights: [
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
          ],
        },
        {
          organization: 'A',
          position: 'A',
          summary: 'a',
          highlights: [
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
          ],
        },
      ],
      education: [
        {
          institution: 'A',
          highlights: [
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
          ],
        },
        {
          institution: 'A',
        },
      ],
      projects: [
        {
          name: 'A',
          summary: 'a',
        },
        {
          name: 'A',
          summary: 'a',
        },
      ],
      skills: [
        {
          name: 'A',
        },
      ],
      languages: [
        {
          name: 'A',
        },
      ],
      certifications: [
        {
          name: 'A',
          issuer: 'A',
        },
      ],
      awards: [
        {
          title: 'A',
          summary: 'a',
        },
      ],
      volunteer: [
        {
          organization: 'A',
          role: 'A',
          summary: 'a',
        },
      ],
      publications: [
        {
          name: 'A',
          summary: 'a',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [
        [
          'section:summary',
          'section:work',
          'entry:work.0',
          'entry:work.1',
          'entry:work.2',
          'entry:work.3',
          'section:projects',
          'entry:projects.0',
          'entry:projects.1',
          'section:skills',
          'entry:skills.0',
        ],
        [
          'section:education',
          'entry:education.0',
          'entry:education.1',
          'section:certifications',
          'entry:certifications.0',
          'section:awards',
          'entry:awards.0',
          'section:volunteer',
          'entry:volunteer.0',
          'section:publications',
          'entry:publications.0',
          'section:languages',
          'entry:languages.0',
        ],
      ],
      'signal-ledger': [
        [
          'section:summary',
          'section:work',
          'entry:work.0',
          'entry:work.1',
          'entry:work.2',
          'entry:work.3',
          'section:skills',
          'entry:skills.0',
          'section:languages',
          'entry:languages.0',
        ],
        [
          'section:education',
          'entry:education.0',
          'entry:education.1',
          'section:certifications',
          'entry:certifications.0',
          'section:projects',
          'entry:projects.0',
          'entry:projects.1',
          'section:awards',
          'entry:awards.0',
          'section:volunteer',
          'entry:volunteer.0',
          'section:publications',
          'entry:publications.0',
        ],
      ],
    },
  },
  {
    id: 'wrapping',
    data: {
      schemaVersion: '1',
      language: 'fr',
      person: {
        name: "Camille N'Diaye",
        headline: 'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
        email: 'camille.ndiaye@example.com',
        phone: '+237 699 88 77 66',
        location: 'Nkolbisson, arrondissement de Yaoundé VII, Cameroun',
        links: [
          {
            label: 'Documentation professionnelle accessible',
            url: 'https://example.com/camille',
          },
        ],
      },
      summary:
        'Une phrase avec plusieurs occasions de retour à la ligne doit rester lisible dans la colonne étroite sans réduction du corps du texte.',
      work: [
        {
          organization: 'Coopérative des services publics numériques',
          position: 'Ingénieure produit et accessibilité',
          dateRange: {
            start: '2021-03',
          },
          summary:
            "Ce contenu vérifie les retours à la ligne autorisés et la conservation de l'ordre de lecture.",
          highlights: ['WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW'],
        },
      ],
      skills: [
        {
          name: 'Accessibilité numérique',
          keywords: ['WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW'],
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [
        ['section:summary', 'section:work', 'entry:work.0', 'section:skills', 'entry:skills.0'],
      ],
      'signal-ledger': [
        ['section:summary', 'section:work', 'entry:work.0', 'section:skills', 'entry:skills.0'],
      ],
    },
  },
  {
    id: 'boundary-text-education-score',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      education: [
        {
          institution: 'A',
          score: 'a a a a a a a a a a a a a a a a a a a aa',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:education', 'entry:education.0']],
      'signal-ledger': [['section:education', 'entry:education.0']],
    },
  },
  {
    id: 'boundary-text-skills-level',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      skills: [
        {
          name: 'A',
          level: 'a a a a a a a a a a a a a a a a a a a aa',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:skills', 'entry:skills.0']],
      'signal-ledger': [['section:skills', 'entry:skills.0']],
    },
  },
  {
    id: 'boundary-text-skills-keyword',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      skills: [
        {
          name: 'A',
          keywords: ['a a a a a a a a a a a a a a a a a a a aa'],
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:skills', 'entry:skills.0']],
      'signal-ledger': [['section:skills', 'entry:skills.0']],
    },
  },
  {
    id: 'boundary-text-languages-fluency',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      languages: [
        {
          name: 'A',
          fluency:
            'é 👩🏿‍💻 é 👩🏿‍💻 é 👩🏿‍💻 é 👩🏿‍💻 é 👩🏿‍💻 é 👩🏿‍💻 é 👩🏿‍💻 é 👩🏿‍💻 é 👩🏿‍💻 é 👩🏿‍💻a',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:languages', 'entry:languages.0']],
      'signal-ledger': [['section:languages', 'entry:languages.0']],
    },
  },
  {
    id: 'boundary-text-person-email',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
        email: 'aaaaaaaaaaaaaaaaaaaaaaaaa-aaaaaaaaaaaaaaaaaaaaaaaaa-aaaaaaaaaaaaaaaaaaaaaaa@a.co',
      },
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [[]],
      'signal-ledger': [[]],
    },
  },
  {
    id: 'boundary-text-person-phone',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
        phone: 'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
      },
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [[]],
      'signal-ledger': [[]],
    },
  },
  {
    id: 'boundary-text-person-location',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
        location:
          'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
      },
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [[]],
      'signal-ledger': [[]],
    },
  },
  {
    id: 'boundary-text-person-link-label',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
        links: [
          {
            label:
              'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            url: 'https://example.com',
          },
        ],
      },
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [[]],
      'signal-ledger': [[]],
    },
  },
  {
    id: 'boundary-text-work-location',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      work: [
        {
          organization: 'A',
          position: 'A',
          location:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:work', 'entry:work.0']],
      'signal-ledger': [['section:work', 'entry:work.0']],
    },
  },
  {
    id: 'boundary-text-education-location',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      education: [
        {
          institution: 'A',
          location:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:education', 'entry:education.0']],
      'signal-ledger': [['section:education', 'entry:education.0']],
    },
  },
  {
    id: 'boundary-text-volunteer-location',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      volunteer: [
        {
          organization: 'A',
          role: 'A',
          location:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:volunteer', 'entry:volunteer.0']],
      'signal-ledger': [['section:volunteer', 'entry:volunteer.0']],
    },
  },
  {
    id: 'boundary-text-certifications-credential-id',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      certifications: [
        {
          name: 'A',
          issuer: 'A',
          credentialId:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:certifications', 'entry:certifications.0']],
      'signal-ledger': [['section:certifications', 'entry:certifications.0']],
    },
  },
  {
    id: 'boundary-text-person-name',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
      },
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [[]],
      'signal-ledger': [[]],
    },
  },
  {
    id: 'boundary-text-person-headline',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
        headline:
          'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
      },
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [[]],
      'signal-ledger': [[]],
    },
  },
  {
    id: 'boundary-text-work-organization',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      work: [
        {
          organization:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
          position: 'A',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:work', 'entry:work.0']],
      'signal-ledger': [['section:work', 'entry:work.0']],
    },
  },
  {
    id: 'boundary-text-work-position',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      work: [
        {
          organization: 'A',
          position:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:work', 'entry:work.0']],
      'signal-ledger': [['section:work', 'entry:work.0']],
    },
  },
  {
    id: 'boundary-text-education-institution',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      education: [
        {
          institution:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:education', 'entry:education.0']],
      'signal-ledger': [['section:education', 'entry:education.0']],
    },
  },
  {
    id: 'boundary-text-education-qualification',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      education: [
        {
          institution: 'A',
          qualification:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:education', 'entry:education.0']],
      'signal-ledger': [['section:education', 'entry:education.0']],
    },
  },
  {
    id: 'boundary-text-education-field',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      education: [
        {
          institution: 'A',
          field:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:education', 'entry:education.0']],
      'signal-ledger': [['section:education', 'entry:education.0']],
    },
  },
  {
    id: 'boundary-text-projects-name',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      projects: [
        {
          name: 'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:projects', 'entry:projects.0']],
      'signal-ledger': [['section:projects', 'entry:projects.0']],
    },
  },
  {
    id: 'boundary-text-projects-role',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      projects: [
        {
          name: 'A',
          role: 'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:projects', 'entry:projects.0']],
      'signal-ledger': [['section:projects', 'entry:projects.0']],
    },
  },
  {
    id: 'boundary-text-skills-name',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      skills: [
        {
          name: 'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:skills', 'entry:skills.0']],
      'signal-ledger': [['section:skills', 'entry:skills.0']],
    },
  },
  {
    id: 'boundary-text-languages-name',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      languages: [
        {
          name: 'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:languages', 'entry:languages.0']],
      'signal-ledger': [['section:languages', 'entry:languages.0']],
    },
  },
  {
    id: 'boundary-text-certifications-name',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      certifications: [
        {
          name: 'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
          issuer: 'A',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:certifications', 'entry:certifications.0']],
      'signal-ledger': [['section:certifications', 'entry:certifications.0']],
    },
  },
  {
    id: 'boundary-text-certifications-issuer',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      certifications: [
        {
          name: 'A',
          issuer:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:certifications', 'entry:certifications.0']],
      'signal-ledger': [['section:certifications', 'entry:certifications.0']],
    },
  },
  {
    id: 'boundary-text-awards-title',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      awards: [
        {
          title:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:awards', 'entry:awards.0']],
      'signal-ledger': [['section:awards', 'entry:awards.0']],
    },
  },
  {
    id: 'boundary-text-awards-issuer',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      awards: [
        {
          title: 'A',
          issuer:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:awards', 'entry:awards.0']],
      'signal-ledger': [['section:awards', 'entry:awards.0']],
    },
  },
  {
    id: 'boundary-text-volunteer-organization',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      volunteer: [
        {
          organization:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
          role: 'A',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:volunteer', 'entry:volunteer.0']],
      'signal-ledger': [['section:volunteer', 'entry:volunteer.0']],
    },
  },
  {
    id: 'boundary-text-volunteer-role',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      volunteer: [
        {
          organization: 'A',
          role: 'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:volunteer', 'entry:volunteer.0']],
      'signal-ledger': [['section:volunteer', 'entry:volunteer.0']],
    },
  },
  {
    id: 'boundary-text-publications-name',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      publications: [
        {
          name: 'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:publications', 'entry:publications.0']],
      'signal-ledger': [['section:publications', 'entry:publications.0']],
    },
  },
  {
    id: 'boundary-text-publications-publisher',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      publications: [
        {
          name: 'A',
          publisher:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:publications', 'entry:publications.0']],
      'signal-ledger': [['section:publications', 'entry:publications.0']],
    },
  },
  {
    id: 'boundary-text-publications-author',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      publications: [
        {
          name: 'A',
          authors: [
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
          ],
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:publications', 'entry:publications.0']],
      'signal-ledger': [['section:publications', 'entry:publications.0']],
    },
  },
  {
    id: 'boundary-text-work-highlight',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      work: [
        {
          organization: 'A',
          position: 'A',
          highlights: [
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
          ],
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:work', 'entry:work.0']],
      'signal-ledger': [['section:work', 'entry:work.0']],
    },
  },
  {
    id: 'boundary-text-education-highlight',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      education: [
        {
          institution: 'A',
          highlights: [
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
          ],
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:education', 'entry:education.0']],
      'signal-ledger': [['section:education', 'entry:education.0']],
    },
  },
  {
    id: 'boundary-text-projects-highlight',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      projects: [
        {
          name: 'A',
          highlights: [
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
          ],
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:projects', 'entry:projects.0']],
      'signal-ledger': [['section:projects', 'entry:projects.0']],
    },
  },
  {
    id: 'boundary-text-volunteer-highlight',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      volunteer: [
        {
          organization: 'A',
          role: 'A',
          highlights: [
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
          ],
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:volunteer', 'entry:volunteer.0']],
      'signal-ledger': [['section:volunteer', 'entry:volunteer.0']],
    },
  },
  {
    id: 'boundary-text-work-summary',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      work: [
        {
          organization: 'A',
          position: 'A',
          summary:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:work', 'entry:work.0']],
      'signal-ledger': [['section:work', 'entry:work.0']],
    },
  },
  {
    id: 'boundary-text-projects-summary',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      projects: [
        {
          name: 'A',
          summary:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:projects', 'entry:projects.0']],
      'signal-ledger': [['section:projects', 'entry:projects.0']],
    },
  },
  {
    id: 'boundary-text-awards-summary',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      awards: [
        {
          title: 'A',
          summary:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:awards', 'entry:awards.0']],
      'signal-ledger': [['section:awards', 'entry:awards.0']],
    },
  },
  {
    id: 'boundary-text-volunteer-summary',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      volunteer: [
        {
          organization: 'A',
          role: 'A',
          summary:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:volunteer', 'entry:volunteer.0']],
      'signal-ledger': [['section:volunteer', 'entry:volunteer.0']],
    },
  },
  {
    id: 'boundary-text-publications-summary',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      publications: [
        {
          name: 'A',
          summary:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:publications', 'entry:publications.0']],
      'signal-ledger': [['section:publications', 'entry:publications.0']],
    },
  },
  {
    id: 'boundary-text-summary',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      summary:
        'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:summary']],
      'signal-ledger': [['section:summary']],
    },
  },
  {
    id: 'boundary-collection-person-links',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
        links: [
          {
            label: 'A',
            url: 'https://example.com',
          },
          {
            label: 'A',
            url: 'https://example.com',
          },
          {
            label: 'A',
            url: 'https://example.com',
          },
          {
            label: 'A',
            url: 'https://example.com',
          },
          {
            label: 'A',
            url: 'https://example.com',
          },
        ],
      },
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [[]],
      'signal-ledger': [[]],
    },
  },
  {
    id: 'boundary-collection-work',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      work: [
        {
          organization: 'A',
          position: 'A',
        },
        {
          organization: 'A',
          position: 'A',
        },
        {
          organization: 'A',
          position: 'A',
        },
        {
          organization: 'A',
          position: 'A',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:work', 'entry:work.0', 'entry:work.1', 'entry:work.2', 'entry:work.3']],
      'signal-ledger': [
        ['section:work', 'entry:work.0', 'entry:work.1', 'entry:work.2', 'entry:work.3'],
      ],
    },
  },
  {
    id: 'boundary-collection-education',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      education: [
        {
          institution: 'A',
        },
        {
          institution: 'A',
        },
        {
          institution: 'A',
        },
        {
          institution: 'A',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [
        [
          'section:education',
          'entry:education.0',
          'entry:education.1',
          'entry:education.2',
          'entry:education.3',
        ],
      ],
      'signal-ledger': [
        [
          'section:education',
          'entry:education.0',
          'entry:education.1',
          'entry:education.2',
          'entry:education.3',
        ],
      ],
    },
  },
  {
    id: 'boundary-collection-projects',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      projects: [
        {
          name: 'A',
        },
        {
          name: 'A',
        },
        {
          name: 'A',
        },
        {
          name: 'A',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [
        [
          'section:projects',
          'entry:projects.0',
          'entry:projects.1',
          'entry:projects.2',
          'entry:projects.3',
        ],
      ],
      'signal-ledger': [
        [
          'section:projects',
          'entry:projects.0',
          'entry:projects.1',
          'entry:projects.2',
          'entry:projects.3',
        ],
      ],
    },
  },
  {
    id: 'boundary-collection-certifications',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      certifications: [
        {
          name: 'A',
          issuer: 'A',
        },
        {
          name: 'A',
          issuer: 'A',
        },
        {
          name: 'A',
          issuer: 'A',
        },
        {
          name: 'A',
          issuer: 'A',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [
        [
          'section:certifications',
          'entry:certifications.0',
          'entry:certifications.1',
          'entry:certifications.2',
          'entry:certifications.3',
        ],
      ],
      'signal-ledger': [
        [
          'section:certifications',
          'entry:certifications.0',
          'entry:certifications.1',
          'entry:certifications.2',
          'entry:certifications.3',
        ],
      ],
    },
  },
  {
    id: 'boundary-collection-awards',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      awards: [
        {
          title: 'A',
        },
        {
          title: 'A',
        },
        {
          title: 'A',
        },
        {
          title: 'A',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [
        ['section:awards', 'entry:awards.0', 'entry:awards.1', 'entry:awards.2', 'entry:awards.3'],
      ],
      'signal-ledger': [
        ['section:awards', 'entry:awards.0', 'entry:awards.1', 'entry:awards.2', 'entry:awards.3'],
      ],
    },
  },
  {
    id: 'boundary-collection-volunteer',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      volunteer: [
        {
          organization: 'A',
          role: 'A',
        },
        {
          organization: 'A',
          role: 'A',
        },
        {
          organization: 'A',
          role: 'A',
        },
        {
          organization: 'A',
          role: 'A',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [
        [
          'section:volunteer',
          'entry:volunteer.0',
          'entry:volunteer.1',
          'entry:volunteer.2',
          'entry:volunteer.3',
        ],
      ],
      'signal-ledger': [
        [
          'section:volunteer',
          'entry:volunteer.0',
          'entry:volunteer.1',
          'entry:volunteer.2',
          'entry:volunteer.3',
        ],
      ],
    },
  },
  {
    id: 'boundary-collection-publications',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      publications: [
        {
          name: 'A',
        },
        {
          name: 'A',
        },
        {
          name: 'A',
        },
        {
          name: 'A',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [
        [
          'section:publications',
          'entry:publications.0',
          'entry:publications.1',
          'entry:publications.2',
          'entry:publications.3',
        ],
      ],
      'signal-ledger': [
        [
          'section:publications',
          'entry:publications.0',
          'entry:publications.1',
          'entry:publications.2',
          'entry:publications.3',
        ],
      ],
    },
  },
  {
    id: 'boundary-collection-skills',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      skills: [
        {
          name: 'A',
        },
        {
          name: 'A',
        },
        {
          name: 'A',
        },
        {
          name: 'A',
        },
        {
          name: 'A',
        },
        {
          name: 'A',
        },
        {
          name: 'A',
        },
        {
          name: 'A',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [
        [
          'section:skills',
          'entry:skills.0',
          'entry:skills.1',
          'entry:skills.2',
          'entry:skills.3',
          'entry:skills.4',
          'entry:skills.5',
          'entry:skills.6',
          'entry:skills.7',
        ],
      ],
      'signal-ledger': [
        [
          'section:skills',
          'entry:skills.0',
          'entry:skills.1',
          'entry:skills.2',
          'entry:skills.3',
          'entry:skills.4',
          'entry:skills.5',
          'entry:skills.6',
          'entry:skills.7',
        ],
      ],
    },
  },
  {
    id: 'boundary-collection-skills-keywords',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      skills: [
        {
          name: 'A',
          keywords: ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A'],
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:skills', 'entry:skills.0']],
      'signal-ledger': [['section:skills', 'entry:skills.0']],
    },
  },
  {
    id: 'boundary-collection-languages',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      languages: [
        {
          name: 'A',
        },
        {
          name: 'A',
        },
        {
          name: 'A',
        },
        {
          name: 'A',
        },
        {
          name: 'A',
        },
        {
          name: 'A',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [
        [
          'section:languages',
          'entry:languages.0',
          'entry:languages.1',
          'entry:languages.2',
          'entry:languages.3',
          'entry:languages.4',
          'entry:languages.5',
        ],
      ],
      'signal-ledger': [
        [
          'section:languages',
          'entry:languages.0',
          'entry:languages.1',
          'entry:languages.2',
          'entry:languages.3',
          'entry:languages.4',
          'entry:languages.5',
        ],
      ],
    },
  },
  {
    id: 'boundary-collection-publications-authors',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      publications: [
        {
          name: 'A',
          authors: ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A'],
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:publications', 'entry:publications.0']],
      'signal-ledger': [['section:publications', 'entry:publications.0']],
    },
  },
  {
    id: 'boundary-collection-work-highlights',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      work: [
        {
          organization: 'A',
          position: 'A',
          highlights: ['A', 'A', 'A', 'A', 'A'],
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:work', 'entry:work.0']],
      'signal-ledger': [['section:work', 'entry:work.0']],
    },
  },
  {
    id: 'boundary-collection-education-highlights',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      education: [
        {
          institution: 'A',
          highlights: ['A', 'A', 'A', 'A', 'A'],
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:education', 'entry:education.0']],
      'signal-ledger': [['section:education', 'entry:education.0']],
    },
  },
  {
    id: 'boundary-collection-projects-highlights',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      projects: [
        {
          name: 'A',
          highlights: ['A', 'A', 'A', 'A', 'A'],
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:projects', 'entry:projects.0']],
      'signal-ledger': [['section:projects', 'entry:projects.0']],
    },
  },
  {
    id: 'boundary-collection-volunteer-highlights',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      volunteer: [
        {
          organization: 'A',
          role: 'A',
          highlights: ['A', 'A', 'A', 'A', 'A'],
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [['section:volunteer', 'entry:volunteer.0']],
      'signal-ledger': [['section:volunteer', 'entry:volunteer.0']],
    },
  },
  {
    id: 'boundary-document-records',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      work: [
        {
          organization: 'A',
          position: 'A',
        },
        {
          organization: 'A',
          position: 'A',
        },
        {
          organization: 'A',
          position: 'A',
        },
        {
          organization: 'A',
          position: 'A',
        },
      ],
      education: [
        {
          institution: 'A',
        },
        {
          institution: 'A',
        },
        {
          institution: 'A',
        },
        {
          institution: 'A',
        },
      ],
      projects: [
        {
          name: 'A',
        },
        {
          name: 'A',
        },
        {
          name: 'A',
        },
        {
          name: 'A',
        },
      ],
      certifications: [
        {
          name: 'A',
          issuer: 'A',
        },
        {
          name: 'A',
          issuer: 'A',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [
        [
          'section:work',
          'entry:work.0',
          'entry:work.1',
          'entry:work.2',
          'entry:work.3',
          'section:projects',
          'entry:projects.0',
          'entry:projects.1',
          'entry:projects.2',
          'entry:projects.3',
          'section:education',
          'entry:education.0',
          'entry:education.1',
          'entry:education.2',
          'entry:education.3',
          'section:certifications',
          'entry:certifications.0',
          'entry:certifications.1',
        ],
      ],
      'signal-ledger': [
        [
          'section:work',
          'entry:work.0',
          'entry:work.1',
          'entry:work.2',
          'entry:work.3',
          'section:education',
          'entry:education.0',
          'entry:education.1',
          'entry:education.2',
          'entry:education.3',
          'section:certifications',
          'entry:certifications.0',
          'entry:certifications.1',
          'section:projects',
          'entry:projects.0',
          'entry:projects.1',
          'entry:projects.2',
          'entry:projects.3',
        ],
      ],
    },
  },
  {
    id: 'boundary-document-highlights',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      work: [
        {
          organization: 'A',
          position: 'A',
          highlights: ['A', 'A', 'A', 'A', 'A'],
        },
        {
          organization: 'A',
          position: 'A',
          highlights: ['A', 'A', 'A', 'A', 'A'],
        },
        {
          organization: 'A',
          position: 'A',
          highlights: ['A', 'A', 'A', 'A', 'A'],
        },
        {
          organization: 'A',
          position: 'A',
          highlights: ['A', 'A', 'A', 'A', 'A'],
        },
      ],
      education: [
        {
          institution: 'A',
          highlights: ['A', 'A', 'A', 'A'],
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [
        [
          'section:work',
          'entry:work.0',
          'entry:work.1',
          'entry:work.2',
          'entry:work.3',
          'section:education',
          'entry:education.0',
        ],
      ],
      'signal-ledger': [
        [
          'section:work',
          'entry:work.0',
          'entry:work.1',
          'entry:work.2',
          'entry:work.3',
          'section:education',
          'entry:education.0',
        ],
      ],
    },
  },
  {
    id: 'boundary-document-authored-text',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      summary:
        'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
      work: [
        {
          organization: 'A',
          position: 'A',
          summary:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
          highlights: [
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
          ],
        },
      ],
      education: [
        {
          institution: 'A',
          highlights: [
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
          ],
        },
      ],
      projects: [
        {
          name: 'A',
          summary:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
          highlights: [
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
          ],
        },
      ],
      skills: [
        {
          name: 'A',
        },
      ],
      languages: [
        {
          name: 'A',
        },
      ],
      certifications: [
        {
          name: 'A',
          issuer: 'A',
        },
      ],
      awards: [
        {
          title: 'A',
          summary:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a',
        },
      ],
      volunteer: [
        {
          organization: 'A',
          role: 'A',
          summary: 'a',
          highlights: [
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
          ],
        },
      ],
      publications: [
        {
          name: 'A',
          summary: 'a',
        },
      ],
    },
    expected: {
      success: true,
    },
    pagination: {
      clearline: [
        [
          'section:summary',
          'section:work',
          'entry:work.0',
          'section:projects',
          'entry:projects.0',
          'section:skills',
          'entry:skills.0',
        ],
        [
          'section:education',
          'entry:education.0',
          'section:certifications',
          'entry:certifications.0',
          'section:awards',
          'entry:awards.0',
          'section:volunteer',
          'entry:volunteer.0',
          'section:publications',
          'entry:publications.0',
          'section:languages',
          'entry:languages.0',
        ],
      ],
      'signal-ledger': [
        [
          'section:summary',
          'section:work',
          'entry:work.0',
          'section:skills',
          'entry:skills.0',
          'section:languages',
          'entry:languages.0',
        ],
        [
          'section:education',
          'entry:education.0',
          'section:certifications',
          'entry:certifications.0',
          'section:projects',
          'entry:projects.0',
          'section:awards',
          'entry:awards.0',
          'section:volunteer',
          'entry:volunteer.0',
          'section:publications',
          'entry:publications.0',
        ],
      ],
    },
  },
  {
    id: 'invalid-text-education-score',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      education: [
        {
          institution: 'A',
          score: 'a a a a a a a a a a a a a a a a a a a aaa',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/education/0/score',
          code: 'text-length',
          limit: 40,
          actual: 41,
        },
      ],
    },
  },
  {
    id: 'invalid-text-skills-level',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      skills: [
        {
          name: 'A',
          level: 'a a a a a a a a a a a a a a a a a a a aaa',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/skills/0/level',
          code: 'text-length',
          limit: 40,
          actual: 41,
        },
      ],
    },
  },
  {
    id: 'invalid-text-skills-keyword',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      skills: [
        {
          name: 'A',
          keywords: ['a a a a a a a a a a a a a a a a a a a aaa'],
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/skills/0/keywords/0',
          code: 'text-length',
          limit: 40,
          actual: 41,
        },
      ],
    },
  },
  {
    id: 'invalid-text-languages-fluency',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      languages: [
        {
          name: 'A',
          fluency:
            'é 👩🏿‍💻 é 👩🏿‍💻 é 👩🏿‍💻 é 👩🏿‍💻 é 👩🏿‍💻 é 👩🏿‍💻 é 👩🏿‍💻 é 👩🏿‍💻 é 👩🏿‍💻 é 👩🏿‍💻a👩🏿‍💻',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/languages/0/fluency',
          code: 'text-length',
          limit: 40,
          actual: 41,
        },
      ],
    },
  },
  {
    id: 'invalid-text-person-email',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
        email: 'aaaaaaaaaaaaaaaaaaaaaaaaa-aaaaaaaaaaaaaaaaaaaaaaaaa-aaaaaaaaaaaaaaaaaaaaaaaa@a.co',
      },
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/person/email',
          code: 'text-length',
          limit: 80,
          actual: 81,
        },
      ],
    },
  },
  {
    id: 'invalid-text-person-phone',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
        phone: 'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aaa',
      },
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/person/phone',
          code: 'text-length',
          limit: 80,
          actual: 81,
        },
      ],
    },
  },
  {
    id: 'invalid-text-person-location',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
        location:
          'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aaa',
      },
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/person/location',
          code: 'text-length',
          limit: 80,
          actual: 81,
        },
      ],
    },
  },
  {
    id: 'invalid-text-person-link-label',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
        links: [
          {
            label:
              'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aaa',
            url: 'https://example.com',
          },
        ],
      },
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/person/links/0/label',
          code: 'text-length',
          limit: 80,
          actual: 81,
        },
      ],
    },
  },
  {
    id: 'invalid-text-work-location',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      work: [
        {
          organization: 'A',
          position: 'A',
          location:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aaa',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/work/0/location',
          code: 'text-length',
          limit: 80,
          actual: 81,
        },
      ],
    },
  },
  {
    id: 'invalid-text-education-location',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      education: [
        {
          institution: 'A',
          location:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aaa',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/education/0/location',
          code: 'text-length',
          limit: 80,
          actual: 81,
        },
      ],
    },
  },
  {
    id: 'invalid-text-volunteer-location',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      volunteer: [
        {
          organization: 'A',
          role: 'A',
          location:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aaa',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/volunteer/0/location',
          code: 'text-length',
          limit: 80,
          actual: 81,
        },
      ],
    },
  },
  {
    id: 'invalid-text-certifications-credential-id',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      certifications: [
        {
          name: 'A',
          issuer: 'A',
          credentialId:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aaa',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/certifications/0/credentialId',
          code: 'text-length',
          limit: 80,
          actual: 81,
        },
      ],
    },
  },
  {
    id: 'invalid-text-person-name',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aaa',
      },
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/person/name',
          code: 'text-length',
          limit: 120,
          actual: 121,
        },
      ],
    },
  },
  {
    id: 'invalid-text-person-headline',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
        headline:
          'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aaa',
      },
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/person/headline',
          code: 'text-length',
          limit: 120,
          actual: 121,
        },
      ],
    },
  },
  {
    id: 'invalid-text-work-organization',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      work: [
        {
          organization:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aaa',
          position: 'A',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/work/0/organization',
          code: 'text-length',
          limit: 120,
          actual: 121,
        },
      ],
    },
  },
  {
    id: 'invalid-text-work-position',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      work: [
        {
          organization: 'A',
          position:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aaa',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/work/0/position',
          code: 'text-length',
          limit: 120,
          actual: 121,
        },
      ],
    },
  },
  {
    id: 'invalid-text-education-institution',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      education: [
        {
          institution:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aaa',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/education/0/institution',
          code: 'text-length',
          limit: 120,
          actual: 121,
        },
      ],
    },
  },
  {
    id: 'invalid-text-education-qualification',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      education: [
        {
          institution: 'A',
          qualification:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aaa',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/education/0/qualification',
          code: 'text-length',
          limit: 120,
          actual: 121,
        },
      ],
    },
  },
  {
    id: 'invalid-text-education-field',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      education: [
        {
          institution: 'A',
          field:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aaa',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/education/0/field',
          code: 'text-length',
          limit: 120,
          actual: 121,
        },
      ],
    },
  },
  {
    id: 'invalid-text-projects-name',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      projects: [
        {
          name: 'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aaa',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/projects/0/name',
          code: 'text-length',
          limit: 120,
          actual: 121,
        },
      ],
    },
  },
  {
    id: 'invalid-text-projects-role',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      projects: [
        {
          name: 'A',
          role: 'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aaa',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/projects/0/role',
          code: 'text-length',
          limit: 120,
          actual: 121,
        },
      ],
    },
  },
  {
    id: 'invalid-text-skills-name',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      skills: [
        {
          name: 'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aaa',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/skills/0/name',
          code: 'text-length',
          limit: 120,
          actual: 121,
        },
      ],
    },
  },
  {
    id: 'invalid-text-languages-name',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      languages: [
        {
          name: 'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aaa',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/languages/0/name',
          code: 'text-length',
          limit: 120,
          actual: 121,
        },
      ],
    },
  },
  {
    id: 'invalid-text-certifications-name',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      certifications: [
        {
          name: 'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aaa',
          issuer: 'A',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/certifications/0/name',
          code: 'text-length',
          limit: 120,
          actual: 121,
        },
      ],
    },
  },
  {
    id: 'invalid-text-certifications-issuer',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      certifications: [
        {
          name: 'A',
          issuer:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aaa',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/certifications/0/issuer',
          code: 'text-length',
          limit: 120,
          actual: 121,
        },
      ],
    },
  },
  {
    id: 'invalid-text-awards-title',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      awards: [
        {
          title:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aaa',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/awards/0/title',
          code: 'text-length',
          limit: 120,
          actual: 121,
        },
      ],
    },
  },
  {
    id: 'invalid-text-awards-issuer',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      awards: [
        {
          title: 'A',
          issuer:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aaa',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/awards/0/issuer',
          code: 'text-length',
          limit: 120,
          actual: 121,
        },
      ],
    },
  },
  {
    id: 'invalid-text-volunteer-organization',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      volunteer: [
        {
          organization:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aaa',
          role: 'A',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/volunteer/0/organization',
          code: 'text-length',
          limit: 120,
          actual: 121,
        },
      ],
    },
  },
  {
    id: 'invalid-text-volunteer-role',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      volunteer: [
        {
          organization: 'A',
          role: 'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aaa',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/volunteer/0/role',
          code: 'text-length',
          limit: 120,
          actual: 121,
        },
      ],
    },
  },
  {
    id: 'invalid-text-publications-name',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      publications: [
        {
          name: 'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aaa',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/publications/0/name',
          code: 'text-length',
          limit: 120,
          actual: 121,
        },
      ],
    },
  },
  {
    id: 'invalid-text-publications-publisher',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      publications: [
        {
          name: 'A',
          publisher:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aaa',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/publications/0/publisher',
          code: 'text-length',
          limit: 120,
          actual: 121,
        },
      ],
    },
  },
  {
    id: 'invalid-text-publications-author',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      publications: [
        {
          name: 'A',
          authors: [
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aaa',
          ],
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/publications/0/authors/0',
          code: 'text-length',
          limit: 120,
          actual: 121,
        },
      ],
    },
  },
  {
    id: 'invalid-text-work-highlight',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      work: [
        {
          organization: 'A',
          position: 'A',
          highlights: [
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aaa',
          ],
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/work/0/highlights/0',
          code: 'text-length',
          limit: 180,
          actual: 181,
        },
      ],
    },
  },
  {
    id: 'invalid-text-education-highlight',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      education: [
        {
          institution: 'A',
          highlights: [
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aaa',
          ],
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/education/0/highlights/0',
          code: 'text-length',
          limit: 180,
          actual: 181,
        },
      ],
    },
  },
  {
    id: 'invalid-text-projects-highlight',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      projects: [
        {
          name: 'A',
          highlights: [
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aaa',
          ],
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/projects/0/highlights/0',
          code: 'text-length',
          limit: 180,
          actual: 181,
        },
      ],
    },
  },
  {
    id: 'invalid-text-volunteer-highlight',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      volunteer: [
        {
          organization: 'A',
          role: 'A',
          highlights: [
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aaa',
          ],
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/volunteer/0/highlights/0',
          code: 'text-length',
          limit: 180,
          actual: 181,
        },
      ],
    },
  },
  {
    id: 'invalid-text-work-summary',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      work: [
        {
          organization: 'A',
          position: 'A',
          summary:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aaa',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/work/0/summary',
          code: 'text-length',
          limit: 320,
          actual: 321,
        },
      ],
    },
  },
  {
    id: 'invalid-text-projects-summary',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      projects: [
        {
          name: 'A',
          summary:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aaa',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/projects/0/summary',
          code: 'text-length',
          limit: 320,
          actual: 321,
        },
      ],
    },
  },
  {
    id: 'invalid-text-awards-summary',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      awards: [
        {
          title: 'A',
          summary:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aaa',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/awards/0/summary',
          code: 'text-length',
          limit: 320,
          actual: 321,
        },
      ],
    },
  },
  {
    id: 'invalid-text-volunteer-summary',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      volunteer: [
        {
          organization: 'A',
          role: 'A',
          summary:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aaa',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/volunteer/0/summary',
          code: 'text-length',
          limit: 320,
          actual: 321,
        },
      ],
    },
  },
  {
    id: 'invalid-text-publications-summary',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      publications: [
        {
          name: 'A',
          summary:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aaa',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/publications/0/summary',
          code: 'text-length',
          limit: 320,
          actual: 321,
        },
      ],
    },
  },
  {
    id: 'invalid-text-summary',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      summary:
        'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aaa',
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/summary',
          code: 'text-length',
          limit: 600,
          actual: 601,
        },
      ],
    },
  },
  {
    id: 'invalid-collection-person-links',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
        links: [
          {
            label: 'A',
            url: 'https://example.com',
          },
          {
            label: 'A',
            url: 'https://example.com',
          },
          {
            label: 'A',
            url: 'https://example.com',
          },
          {
            label: 'A',
            url: 'https://example.com',
          },
          {
            label: 'A',
            url: 'https://example.com',
          },
          {
            label: 'A',
            url: 'https://example.com',
          },
        ],
      },
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/person/links',
          code: 'array-count',
          limit: 5,
          actual: 6,
        },
      ],
    },
  },
  {
    id: 'invalid-collection-work',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      work: [
        {
          organization: 'A',
          position: 'A',
        },
        {
          organization: 'A',
          position: 'A',
        },
        {
          organization: 'A',
          position: 'A',
        },
        {
          organization: 'A',
          position: 'A',
        },
        {
          organization: 'A',
          position: 'A',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/work',
          code: 'array-count',
          limit: 4,
          actual: 5,
        },
      ],
    },
  },
  {
    id: 'invalid-collection-education',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      education: [
        {
          institution: 'A',
        },
        {
          institution: 'A',
        },
        {
          institution: 'A',
        },
        {
          institution: 'A',
        },
        {
          institution: 'A',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/education',
          code: 'array-count',
          limit: 4,
          actual: 5,
        },
      ],
    },
  },
  {
    id: 'invalid-collection-projects',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      projects: [
        {
          name: 'A',
        },
        {
          name: 'A',
        },
        {
          name: 'A',
        },
        {
          name: 'A',
        },
        {
          name: 'A',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/projects',
          code: 'array-count',
          limit: 4,
          actual: 5,
        },
      ],
    },
  },
  {
    id: 'invalid-collection-certifications',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      certifications: [
        {
          name: 'A',
          issuer: 'A',
        },
        {
          name: 'A',
          issuer: 'A',
        },
        {
          name: 'A',
          issuer: 'A',
        },
        {
          name: 'A',
          issuer: 'A',
        },
        {
          name: 'A',
          issuer: 'A',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/certifications',
          code: 'array-count',
          limit: 4,
          actual: 5,
        },
      ],
    },
  },
  {
    id: 'invalid-collection-awards',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      awards: [
        {
          title: 'A',
        },
        {
          title: 'A',
        },
        {
          title: 'A',
        },
        {
          title: 'A',
        },
        {
          title: 'A',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/awards',
          code: 'array-count',
          limit: 4,
          actual: 5,
        },
      ],
    },
  },
  {
    id: 'invalid-collection-volunteer',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      volunteer: [
        {
          organization: 'A',
          role: 'A',
        },
        {
          organization: 'A',
          role: 'A',
        },
        {
          organization: 'A',
          role: 'A',
        },
        {
          organization: 'A',
          role: 'A',
        },
        {
          organization: 'A',
          role: 'A',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/volunteer',
          code: 'array-count',
          limit: 4,
          actual: 5,
        },
      ],
    },
  },
  {
    id: 'invalid-collection-publications',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      publications: [
        {
          name: 'A',
        },
        {
          name: 'A',
        },
        {
          name: 'A',
        },
        {
          name: 'A',
        },
        {
          name: 'A',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/publications',
          code: 'array-count',
          limit: 4,
          actual: 5,
        },
      ],
    },
  },
  {
    id: 'invalid-collection-skills',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      skills: [
        {
          name: 'A',
        },
        {
          name: 'A',
        },
        {
          name: 'A',
        },
        {
          name: 'A',
        },
        {
          name: 'A',
        },
        {
          name: 'A',
        },
        {
          name: 'A',
        },
        {
          name: 'A',
        },
        {
          name: 'A',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/skills',
          code: 'array-count',
          limit: 8,
          actual: 9,
        },
      ],
    },
  },
  {
    id: 'invalid-collection-skills-keywords',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      skills: [
        {
          name: 'A',
          keywords: ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A'],
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/skills/0/keywords',
          code: 'array-count',
          limit: 8,
          actual: 9,
        },
      ],
    },
  },
  {
    id: 'invalid-collection-languages',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      languages: [
        {
          name: 'A',
        },
        {
          name: 'A',
        },
        {
          name: 'A',
        },
        {
          name: 'A',
        },
        {
          name: 'A',
        },
        {
          name: 'A',
        },
        {
          name: 'A',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/languages',
          code: 'array-count',
          limit: 6,
          actual: 7,
        },
      ],
    },
  },
  {
    id: 'invalid-collection-publications-authors',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      publications: [
        {
          name: 'A',
          authors: ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A'],
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/publications/0/authors',
          code: 'array-count',
          limit: 10,
          actual: 11,
        },
      ],
    },
  },
  {
    id: 'invalid-collection-work-highlights',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      work: [
        {
          organization: 'A',
          position: 'A',
          highlights: ['A', 'A', 'A', 'A', 'A', 'A'],
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/work/0/highlights',
          code: 'array-count',
          limit: 5,
          actual: 6,
        },
      ],
    },
  },
  {
    id: 'invalid-collection-education-highlights',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      education: [
        {
          institution: 'A',
          highlights: ['A', 'A', 'A', 'A', 'A', 'A'],
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/education/0/highlights',
          code: 'array-count',
          limit: 5,
          actual: 6,
        },
      ],
    },
  },
  {
    id: 'invalid-collection-projects-highlights',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      projects: [
        {
          name: 'A',
          highlights: ['A', 'A', 'A', 'A', 'A', 'A'],
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/projects/0/highlights',
          code: 'array-count',
          limit: 5,
          actual: 6,
        },
      ],
    },
  },
  {
    id: 'invalid-collection-volunteer-highlights',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      volunteer: [
        {
          organization: 'A',
          role: 'A',
          highlights: ['A', 'A', 'A', 'A', 'A', 'A'],
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/volunteer/0/highlights',
          code: 'array-count',
          limit: 5,
          actual: 6,
        },
      ],
    },
  },
  {
    id: 'invalid-document-records',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      work: [
        {
          organization: 'A',
          position: 'A',
        },
        {
          organization: 'A',
          position: 'A',
        },
        {
          organization: 'A',
          position: 'A',
        },
        {
          organization: 'A',
          position: 'A',
        },
      ],
      education: [
        {
          institution: 'A',
        },
        {
          institution: 'A',
        },
        {
          institution: 'A',
        },
        {
          institution: 'A',
        },
      ],
      projects: [
        {
          name: 'A',
        },
        {
          name: 'A',
        },
        {
          name: 'A',
        },
        {
          name: 'A',
        },
      ],
      certifications: [
        {
          name: 'A',
          issuer: 'A',
        },
        {
          name: 'A',
          issuer: 'A',
        },
        {
          name: 'A',
          issuer: 'A',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '',
          code: 'record-count',
          limit: 14,
          actual: 15,
        },
      ],
    },
  },
  {
    id: 'invalid-document-highlights',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      work: [
        {
          organization: 'A',
          position: 'A',
          highlights: ['A', 'A', 'A', 'A', 'A'],
        },
        {
          organization: 'A',
          position: 'A',
          highlights: ['A', 'A', 'A', 'A', 'A'],
        },
        {
          organization: 'A',
          position: 'A',
          highlights: ['A', 'A', 'A', 'A', 'A'],
        },
        {
          organization: 'A',
          position: 'A',
          highlights: ['A', 'A', 'A', 'A', 'A'],
        },
      ],
      education: [
        {
          institution: 'A',
          highlights: ['A', 'A', 'A', 'A', 'A'],
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '',
          code: 'highlight-count',
          limit: 24,
          actual: 25,
        },
      ],
    },
  },
  {
    id: 'invalid-document-authored-text',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'A',
      },
      summary:
        'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
      work: [
        {
          organization: 'A',
          position: 'A',
          summary:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
          highlights: [
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
          ],
        },
      ],
      education: [
        {
          institution: 'A',
          highlights: [
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
          ],
        },
      ],
      projects: [
        {
          name: 'A',
          summary:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
          highlights: [
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
          ],
        },
      ],
      skills: [
        {
          name: 'Aa',
        },
      ],
      languages: [
        {
          name: 'A',
        },
      ],
      certifications: [
        {
          name: 'A',
          issuer: 'A',
        },
      ],
      awards: [
        {
          title: 'A',
          summary:
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a',
        },
      ],
      volunteer: [
        {
          organization: 'A',
          role: 'A',
          summary: 'a',
          highlights: [
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
          ],
        },
      ],
      publications: [
        {
          name: 'A',
          summary: 'a',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '',
          code: 'authored-text',
          limit: 5000,
          actual: 5001,
        },
      ],
    },
  },
  {
    id: 'invalid-error-order',
    data: {
      schemaVersion: '1',
      language: 'en',
      person: {
        name: 'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a',
      },
      summary:
        'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
      work: [
        {
          organization: 'A',
          position: 'A',
          summary: 'a',
          highlights: [
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
          ],
        },
        {
          organization: 'A',
          position: 'A',
          summary: 'a',
          highlights: [
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
          ],
        },
        {
          organization: 'A',
          position: 'A',
          summary: 'a',
          highlights: [
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
          ],
        },
        {
          organization: 'A',
          position: 'A',
          summary: 'a',
          highlights: [
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
          ],
        },
      ],
      education: [
        {
          institution: 'A',
          highlights: [
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
            'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a aa',
          ],
        },
        {
          institution: 'A',
        },
        {
          institution: 'A',
        },
        {
          institution: 'A',
        },
      ],
      projects: [
        {
          name: 'A',
          summary: 'a',
        },
        {
          name: 'A',
          summary: 'a',
        },
        {
          name: 'A',
          summary: 'a',
        },
        {
          name: 'A',
          summary: 'a',
        },
      ],
      certifications: [
        {
          name: 'A',
          issuer: 'A',
        },
        {
          name: 'A',
          issuer: 'A',
        },
        {
          name: 'A',
          issuer: 'A',
        },
      ],
    },
    expected: {
      success: false,
      errors: [
        {
          path: '/person/name',
          code: 'text-length',
          limit: 120,
          actual: 121,
        },
        {
          path: '/work/0/highlights',
          code: 'array-count',
          limit: 5,
          actual: 6,
        },
        {
          path: '',
          code: 'record-count',
          limit: 14,
          actual: 15,
        },
        {
          path: '',
          code: 'highlight-count',
          limit: 24,
          actual: 25,
        },
        {
          path: '',
          code: 'authored-text',
          limit: 5000,
          actual: 5001,
        },
      ],
    },
  },
]
