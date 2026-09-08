import type { CvTemplateDeprecationV1 } from './catalog'

export type RemovalReasonV1 = 'legal-risk' | 'security-risk' | 'redistribution-unavailable'

export type RemovalTombstoneV1 = {
  readonly schemaVersion: '1.0'
  readonly templateId: string
  readonly status: 'removed'
  readonly reason: RemovalReasonV1
  readonly removalDate: string
  readonly replacementTemplateId?: string
}

type LifecycleTemplate = {
  readonly id: string
  readonly meta:
    | { readonly status: 'active' }
    | { readonly status: 'deprecated'; readonly deprecation: CvTemplateDeprecationV1 }
}

type TemplateLifecycle = {
  readonly permanentTemplateIds: readonly string[]
  readonly removals: readonly unknown[]
  readonly templates: readonly unknown[]
}

const TEMPLATE_ID_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u
const UTC_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/u
const isRemovalReason = (value: string): value is RemovalReasonV1 =>
  value === 'legal-risk' || value === 'security-risk' || value === 'redistribution-unavailable'

const property = (value: object, key: string): unknown => Reflect.get(value, key)

const requireString = (value: object, key: string): string => {
  const result = property(value, key)
  if (typeof result !== 'string') throw new Error(`Removal tombstone has an invalid ${key}`)
  return result
}

const parseTombstoneObject = (value: unknown): object => {
  if (value === null || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Removal tombstone must be an object')
  const allowedKeys = new Set([
    'schemaVersion',
    'templateId',
    'status',
    'reason',
    'removalDate',
    'replacementTemplateId',
  ])
  for (const key of Object.keys(value))
    if (!allowedKeys.has(key)) throw new Error(`Removal tombstone has an unknown field: ${key}`)
  return value
}

const parseReplacementTemplateId = (value: object): string | undefined => {
  const replacement = property(value, 'replacementTemplateId')
  if (replacement === undefined) return undefined
  if (typeof replacement !== 'string' || !TEMPLATE_ID_PATTERN.test(replacement))
    throw new Error('Removal tombstone has an invalid replacement Template ID')
  return replacement
}

export const isRealUtcDate = (value: string): boolean => {
  const match = UTC_DATE_PATTERN.exec(value)
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (year < 1) return false
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  )
}

export function parseRemovalTombstoneV1(value: unknown): RemovalTombstoneV1 {
  const input = parseTombstoneObject(value)
  const schemaVersion = requireString(input, 'schemaVersion')
  const templateId = requireString(input, 'templateId')
  const status = requireString(input, 'status')
  const reason = requireString(input, 'reason')
  const removalDate = requireString(input, 'removalDate')
  const replacementTemplateId = parseReplacementTemplateId(input)

  if (schemaVersion !== '1.0')
    throw new Error('Removal tombstone has an unsupported schema version')
  if (!TEMPLATE_ID_PATTERN.test(templateId))
    throw new Error('Removal tombstone has an invalid Template ID')
  if (status !== 'removed') throw new Error('Removal tombstone has an invalid status')
  if (!isRemovalReason(reason)) throw new Error('Removal tombstone has an invalid reason')
  if (!isRealUtcDate(removalDate)) throw new Error('Removal tombstone has an invalid removal date')
  return {
    schemaVersion: '1.0',
    templateId,
    status: 'removed',
    reason,
    removalDate,
    ...(replacementTemplateId ? { replacementTemplateId } : {}),
  }
}

export const tryParseRemovalTombstoneJsonV1 = (text: string): RemovalTombstoneV1 | undefined => {
  try {
    return parseRemovalTombstoneV1(JSON.parse(text))
  } catch {
    return undefined
  }
}

const collectLifecycleIds = (
  templates: readonly LifecycleTemplate[],
  removals: readonly RemovalTombstoneV1[],
): ReadonlySet<string> => {
  const templateIds = new Set<string>()
  for (const template of templates) {
    if (templateIds.has(template.id)) throw new Error(`Duplicate Template ID: ${template.id}`)
    templateIds.add(template.id)
  }
  const representedIds = new Set(templateIds)
  for (const removal of removals) {
    if (representedIds.has(removal.templateId))
      throw new Error(`Template ID reuse is not allowed: ${removal.templateId}`)
    representedIds.add(removal.templateId)
  }
  return representedIds
}

const assertCompatibilityCoverage = (
  permanentTemplateIds: readonly string[],
  representedIds: ReadonlySet<string>,
): void => {
  for (const id of permanentTemplateIds)
    if (!representedIds.has(id)) throw new Error(`Permanent Template ID is missing: ${id}`)
  for (const id of representedIds)
    if (!permanentTemplateIds.includes(id))
      throw new Error(`Template ID has no compatibility fixture: ${id}`)
}

const assertLifecycleFacts = (
  templates: readonly LifecycleTemplate[],
  removals: readonly RemovalTombstoneV1[],
): void => {
  const catalogIds = new Set(templates.map(({ id }) => id))
  const activeIds = new Set(
    templates.filter(({ meta }) => meta.status === 'active').map(({ id }) => id),
  )
  const assertReplacement = (
    ownerId: string,
    replacementId: string | undefined,
    replacementIds: ReadonlySet<string>,
    requirement: string,
  ): void => {
    if (replacementId === undefined) return
    if (replacementId === ownerId || !replacementIds.has(replacementId))
      throw new Error(`Template ${ownerId} does not name ${requirement}`)
  }
  for (const template of templates) {
    if (template.meta.status !== 'deprecated') continue
    const { deprecation } = template.meta
    if (deprecation.reason.trim().length === 0)
      throw new Error(`Template ${template.id} has no deprecation reason`)
    if (!isRealUtcDate(deprecation.date))
      throw new Error(`Template ${template.id} has an invalid deprecation date`)
    assertReplacement(
      template.id,
      deprecation.replacementTemplateId,
      catalogIds,
      'a different replacement Template ID in the Catalog',
    )
  }
  for (const removal of removals)
    assertReplacement(
      removal.templateId,
      removal.replacementTemplateId,
      activeIds,
      'an active replacement Template ID',
    )
}

export function validateTemplateLifecycle({
  permanentTemplateIds,
  removals: removalInputs,
  templates,
}: TemplateLifecycle): readonly RemovalTombstoneV1[] {
  const removals = removalInputs.map(parseRemovalTombstoneV1)
  const parsedTemplates = templates.map(parseLifecycleTemplate)
  const representedIds = collectLifecycleIds(parsedTemplates, removals)
  assertCompatibilityCoverage(permanentTemplateIds, representedIds)
  assertLifecycleFacts(parsedTemplates, removals)

  return removals
}

const parseLifecycleTemplate = (value: unknown): LifecycleTemplate => {
  if (value === null || typeof value !== 'object') throw new Error('Template lifecycle is invalid')
  const id = property(value, 'id')
  const meta = property(value, 'meta')
  if (typeof id !== 'string' || !TEMPLATE_ID_PATTERN.test(id))
    throw new Error('Template lifecycle has an invalid Template ID')
  if (meta === null || typeof meta !== 'object')
    throw new Error(`Template ${id} metadata is invalid`)
  const status = property(meta, 'status')
  if (status === 'active') return { id, meta: { status } }
  if (status !== 'deprecated') throw new Error(`Template ${id} status is invalid`)
  const deprecation = property(meta, 'deprecation')
  if (deprecation === null || typeof deprecation !== 'object')
    throw new Error(`Template ${id} deprecation facts are missing`)
  const reason = property(deprecation, 'reason')
  const date = property(deprecation, 'date')
  const replacementTemplateId = property(deprecation, 'replacementTemplateId')
  if (typeof reason !== 'string' || typeof date !== 'string')
    throw new Error(`Template ${id} deprecation facts are invalid`)
  if (replacementTemplateId !== undefined && typeof replacementTemplateId !== 'string')
    throw new Error(`Template ${id} deprecation replacement is invalid`)
  return {
    id,
    meta: {
      status,
      deprecation: {
        reason,
        date,
        ...(typeof replacementTemplateId === 'string' ? { replacementTemplateId } : {}),
      },
    },
  }
}

export const templateIdFromArtifactPath = (path: string): string | undefined => {
  const match = /^(?:r\/([a-z][a-z0-9-]*)\.json|previews\/([a-z][a-z0-9-]*)\/)/u.exec(path)
  return match?.[1] ?? match?.[2]
}
