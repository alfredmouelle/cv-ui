import type { CvData } from '../cv-data/cv-data'

export const signalLedgerExampleCvData = {
  schemaVersion: '1',
  language: 'en',
  person: {
    name: "Camille N'Diaye",
    headline: 'Product engineer for public-interest services',
    email: 'camille.ndiaye@example.com',
    phone: '+33 6 12 34 56 78',
    location: 'Paris, France',
    links: [
      { label: 'Portfolio', url: 'https://example.com/camille' },
      { label: 'Code profile', url: 'https://example.com/camille/code' },
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
      dateRange: { start: '2021-03', end: '2025-06' },
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
      dateRange: { start: '2015', end: '2017' },
      score: 'Distinction',
      highlights: ['Researched form completion across French and English public services.'],
    },
  ],
  projects: [
    {
      name: 'Plain Forms',
      role: 'Maintainer',
      url: 'https://example.com/plain-forms',
      dateRange: { start: '2023-09' },
      summary: 'Open form patterns for services that must work with keyboards and screen readers.',
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
    { name: 'English', code: 'en', fluency: 'Professional' },
    { name: 'French', code: 'fr', fluency: 'Native' },
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
      dateRange: { start: '2020-01' },
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
      summary: 'A field report on translated labels, validation messages, and assisted completion.',
    },
  ],
  extensions: { 'com.example.cv-ui': { source: 'canonical', reviewed: true } },
} as const satisfies CvData
