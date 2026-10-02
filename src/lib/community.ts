import 'server-only'
import { cloudinaryConfig } from '@/lib/admin/cloudinary'
import {
  markStorageFailure,
  markStorageSuccess,
  recallStorageGood,
  rememberStorageGood,
  storageCircuitOpen,
} from './storage-health'
import { ministries } from '@/app/data/ministries'
import type { GroupInfo } from '@/lib/media'

// Fellowships and units are stored as a JSON document in Cloudinary
// (raw upload, overwritten on each change), so the site needs no database.
// When nothing is stored — or Cloudinary can't be reached — the seeded groups
// from src/app/data/ministries.ts are used instead.
// Mutations use strict reads so a failed lookup cannot overwrite saved groups.
export const COMMUNITY_DATA_ID = 'elim/data/community.json'

export const groupKinds = ['fellowship', 'unit'] as const
export type GroupKind = (typeof groupKinds)[number]

export type CommunityGroup = {
  id: string
  title: string
  kind: GroupKind
  category: string
  description: string
  image: string
  alt: string
  activities: string[]
  details?: string
  audience?: string
  leader?: string
  meetingTime?: string
  meetingLocation?: string
}

export const seedGroups: CommunityGroup[] = ministries.map((ministry) => ({
  id: ministry.id,
  title: ministry.title,
  kind: ministry.kind === 'fellowship' ? 'fellowship' : 'unit',
  category: ministry.category,
  description: ministry.description,
  image: ministry.image,
  alt: ministry.alt,
  activities: [],
}))

export function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '')
}

export function isGroupKind(value: unknown): value is GroupKind {
  return value === 'fellowship' || value === 'unit'
}

function isImageRef(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 500) return false
  if (value === '') return true
  if (/^\/[a-zA-Z0-9._-]+(\/[a-zA-Z0-9._-]+)*\.(jpg|jpeg|png|webp|gif)$/i.test(value))
    return true
  try {
    const parsed = new URL(value)
    return (
      parsed.protocol === 'https:' && parsed.hostname === 'res.cloudinary.com'
    )
  } catch {
    return false
  }
}

function optionalText(value: unknown, maxLength: number) {
  return value === undefined || (typeof value === 'string' && value.length <= maxLength)
}

export function isGroupArray(value: unknown): value is CommunityGroup[] {
  return (
    Array.isArray(value) &&
    value.length <= 100 &&
    value.every((item) => {
      if (!item || typeof item !== 'object') return false
      const group = item as Record<string, unknown>
      return (
        typeof group.id === 'string' &&
        group.id.length > 0 &&
        group.id.length <= 80 &&
        typeof group.title === 'string' &&
        group.title.trim().length > 0 &&
        (isGroupKind(group.kind) ||
          (group as { kind: unknown }).kind === 'department') &&
        typeof group.category === 'string' &&
        group.category.length <= 80 &&
        typeof group.description === 'string' &&
        group.description.length <= 800 &&
        isImageRef(group.image) &&
        typeof group.alt === 'string' &&
        group.alt.length <= 250 &&
        optionalText(group.details, 6000) &&
        optionalText(group.audience, 200) &&
        optionalText(group.leader, 120) &&
        optionalText(group.meetingTime, 160) &&
        optionalText(group.meetingLocation, 200) &&
        Array.isArray(group.activities) &&
        group.activities.length <= 12 &&
        group.activities.every(
          (activity) =>
            typeof activity === 'string' && activity.length <= 200,
        )
      )
    })
  )
}

export function parseGroupInput(
  value: unknown,
  existing: CommunityGroup[],
): CommunityGroup {
  if (existing.length >= 100)
    throw new Error('The maximum of 100 fellowships and units has been reached.')
  if (!value || typeof value !== 'object')
    throw new Error('Enter the group details.')
  const data = value as Record<string, unknown>
  function detail(field: string, limit: number, label: string) {
    if (data[field] === undefined) return ''
    if (typeof data[field] !== 'string' || (data[field] as string).trim().length > limit)
      throw new Error(`Enter ${label} using no more than ${limit} characters.`)
    return (data[field] as string).trim()
  }
  const details = detail('details', 6000, 'the full description')
  const audience = detail('audience', 200, 'who the group is for')
  const leader = detail('leader', 120, 'the group leader’s name')
  const meetingTime = detail('meetingTime', 160, 'the meeting time')
  const meetingLocation = detail('meetingLocation', 200, 'the meeting location')
  const title =
    typeof data.title === 'string' ? data.title.trim() : ''
  if (!title || title.length > 80)
    throw new Error('Enter a name between 1 and 80 characters.')
  if (!isGroupKind(data.kind))
    throw new Error('Choose whether this is a fellowship or a unit.')
  const category =
    typeof data.category === 'string' && data.category.trim()
      ? data.category.trim().slice(0, 60)
      : data.kind === 'fellowship'
        ? 'FELLOWSHIP'
        : 'UNIT'
  const description =
    typeof data.description === 'string' ? data.description.trim() : ''
  if (!description || description.length > 500)
    throw new Error('Enter a description between 1 and 500 characters.')
  const image = typeof data.image === 'string' ? data.image.trim() : ''
  if (!isImageRef(image))
    throw new Error(
      'Use an image from this site (/images/…) or an https://res.cloudinary.com link.',
    )
  const alt =
    typeof data.alt === 'string' && data.alt.trim()
      ? data.alt.trim().slice(0, 200)
      : `${title} at Elim Christian Garden`
  const activities = (() => {
    if (data.activities === undefined) return []
    if (!Array.isArray(data.activities))
      throw new Error('List each activity on its own line.')
    return data.activities
      .map((activity) =>
        typeof activity === 'string' ? activity.trim().slice(0, 160) : '',
      )
      .filter((activity) => activity.length > 0)
      .slice(0, 12)
  })()
  const base = slugifyTitle(title)
  if (!base) throw new Error('Choose a name with letters or numbers.')
  let id = base
  for (let suffix = 2; existing.some((group) => group.id === id); suffix++)
    id = `${base}-${suffix}`
  return {
    id,
    title,
    kind: data.kind,
    category,
    description,
    image,
    alt,
    activities,
    ...(details ? { details } : {}),
    ...(audience ? { audience } : {}),
    ...(leader ? { leader } : {}),
    ...(meetingTime ? { meetingTime } : {}),
    ...(meetingLocation ? { meetingLocation } : {}),
  }
}

export function addGroup(
  items: CommunityGroup[],
  record: CommunityGroup,
): CommunityGroup[] {
  return [...items, record]
}

export function removeGroup(
  items: CommunityGroup[],
  id: string,
): CommunityGroup[] {
  const remaining = items.filter((group) => group.id !== id)
  if (remaining.length === items.length)
    throw new Error('That group could not be found.')
  return remaining
}

export function updateGroup(items: CommunityGroup[], id: string, input: unknown): CommunityGroup[] {
  if (!items.some((group) => group.id === id))
    throw new Error('That group could not be found.')
  const updated = { ...parseGroupInput(input, items.filter((group) => group.id !== id)), id }
  // Keep the existing ID so editing a name does not detach its gallery.
  return items.map((group) => group.id === id ? updated : group)
}

// Galleries and upload grouping are keyed by group id, with Church-wide
// always available for uploads that belong to no single group.
export function groupOptions(groups: CommunityGroup[]) {
  return [
    { id: 'church-wide', label: 'Church-wide' },
    ...groups.map((group) => ({ id: group.id, label: group.title })),
  ]
}

export function groupDetails(
  groups: CommunityGroup[],
  id: string,
): GroupInfo | null {
  if (id === 'church-wide')
    return {
      id,
      label: 'Church-wide',
      category: 'THE WHOLE CHURCH FAMILY',
      description:
        'Church-wide moments — Sunday services, celebrations, and everyday life in the Elim family.',
    }
  const group = groups.find((item) => item.id === id)
  if (!group) return null
  return {
    id,
    label: group.title,
    category: group.category,
    description: group.description,
  }
}

type StorageOperation = 'read' | 'save'

export class CommunityStorageError extends Error {
  constructor(
    message: string,
    public readonly status: 502 | 503 | 504,
  ) {
    super(message)
    this.name = 'CommunityStorageError'
  }
}

function storageError(operation: StorageOperation, timeout = false) {
  if (operation === 'save') {
    return new CommunityStorageError(
      timeout
        ? 'Cloudinary did not confirm the save in time. Refresh the group list before retrying; the change may already have been saved.'
        : 'Cloudinary could not confirm the save. Refresh the group list before retrying.',
      timeout ? 504 : 502,
    )
  }
  return new CommunityStorageError(
    timeout
      ? 'Cloudinary timed out while loading the current group list. No changes were sent. Please try again.'
      : 'The saved group list could not be loaded from Cloudinary. No changes were sent. Please try again.',
    timeout ? 504 : 502,
  )
}

// Only inspect transport codes. Error messages and request details may contain
// authentication headers, so never include them in logs.
function connectionCodes(error: unknown, depth = 0): string[] {
  if (!error || typeof error !== 'object' || depth > 3) return []
  const details = error as { code?: unknown; cause?: unknown; errors?: unknown[] }
  const own = typeof details.code === 'string' && /^[A-Z0-9_]+$/.test(details.code)
    ? [details.code] : []
  return [...new Set([
    ...own,
    ...connectionCodes(details.cause, depth + 1),
    ...(Array.isArray(details.errors)
      ? details.errors.slice(0, 4).flatMap((item) => connectionCodes(item, depth + 1))
      : []),
  ])]
}

async function storageRequest(
  url: string,
  init: RequestInit,
  operation: StorageOperation,
  allowMissing = false,
  cacheRead = false,
) {
  const startedAt = Date.now()
  const budget = operation === 'save' ? 20000 : 15000
  for (let attempt = 0; attempt < 2; attempt++) {
    // Both read attempts share one deadline; saves are never retried.
    const signal = AbortSignal.timeout(Math.max(1, budget - (Date.now() - startedAt)))
    try {
      const response = await fetch(url, {
        ...init,
        signal,
        // Public reads cache successful responses. Admin reads always go to
        // storage so an outdated group list cannot overwrite newer changes.
        ...(operation === 'read' && cacheRead
          ? { cache: 'force-cache', next: { revalidate: 600, tags: ['community-groups'] } } as const
          : { cache: 'no-store' } as const),
      })
      if (allowMissing && response.status === 404) {
        await response.body?.cancel()
        return null
      }
      if (!response.ok) {
        await response.body?.cancel()
        // Retry a quick temporary upstream read failure once.
        if (operation === 'read' && attempt === 0 &&
          [408, 500, 502, 503, 504].includes(response.status) && Date.now() - startedAt < 4000)
          continue
        console.warn('Community storage request rejected', { operation, status: response.status })
        if (response.status === 401 || response.status === 403)
          throw new CommunityStorageError(
            'Cloudinary denied access to the group data. Check the configured API key and its permissions.',
            502,
          )
        if (response.status === 429)
          throw new CommunityStorageError('Cloudinary is receiving too many requests. Please try again shortly.', 503)
        throw storageError(operation, [408, 499, 504].includes(response.status))
      }
      return (await response.json()) as unknown
    } catch (error) {
      if (error instanceof CommunityStorageError) throw error
      const codes = connectionCodes(error)
      const timedOut = signal.aborted || codes.some((code) =>
        ['ETIMEDOUT', 'UND_ERR_CONNECT_TIMEOUT', 'UND_ERR_HEADERS_TIMEOUT', 'UND_ERR_BODY_TIMEOUT'].includes(code))
      const retryable = codes.some((code) =>
        ['EAI_AGAIN', 'ENOTFOUND', 'ECONNRESET', 'ECONNREFUSED', 'UND_ERR_SOCKET', 'UND_ERR_CONNECT_TIMEOUT'].includes(code))
      if (operation === 'read' && attempt === 0 && !signal.aborted && retryable && Date.now() - startedAt < 4000)
        continue
      // Expected storage outages are handled by the page's retry UI. Use a
      // warning with useful diagnostics instead of triggering the dev overlay.
      console.warn('Community storage request failed', { operation, codes, timedOut })
      throw storageError(operation, timedOut)
    }
  }
  throw storageError(operation)
}

function authHeaders(config: NonNullable<ReturnType<typeof cloudinaryConfig>>) {
  return {
    Authorization: `Basic ${Buffer.from(`${config.api_key}:${config.api_secret}`).toString('base64')}`,
  }
}

async function fetchStoredGroups(
  config: NonNullable<ReturnType<typeof cloudinaryConfig>>,
  cacheRead = false,
) {
  const resource = (await storageRequest(
    `https://api.cloudinary.com/v1_1/${config.cloud_name}/resources/raw/upload/${encodeURIComponent(COMMUNITY_DATA_ID)}`,
    { headers: authHeaders(config) },
    'read',
    true,
    cacheRead,
  )) as { secure_url?: string } | null
  // Only a confirmed missing asset may start from the seeded groups.
  if (resource === null) return seedGroups
  const url = resource?.secure_url
  if (!url) throw storageError('read')
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw storageError('read')
  }
  if (
    parsed.protocol !== 'https:' ||
    parsed.hostname !== 'res.cloudinary.com' ||
    !parsed.pathname.startsWith(`/${config.cloud_name}/raw/upload/`)
  )
    throw storageError('read')
  const data = await storageRequest(parsed.toString(), {}, 'read', false, cacheRead)
  if (!isGroupArray(data)) throw storageError('read')
  return data
}

// Data saved before units were renamed from "departments" still validates;
// normalise it on read so the rest of the app only ever sees 'fellowship' | 'unit'.
type LegacyGroup = Omit<CommunityGroup, 'kind'> & {
  kind: GroupKind | 'department'
}

export function normalizeGroups(groups: LegacyGroup[]): CommunityGroup[] {
  return groups.map(({ kind, ...rest }) => ({
    ...rest,
    kind: kind === 'fellowship' ? 'fellowship' : 'unit',
  }))
}

export async function readGroups(
  options: { strict?: boolean; cacheRead?: boolean } = {},
): Promise<CommunityGroup[]> {
  const config = cloudinaryConfig()
  if (!config) {
    if (options.strict)
      throw new CommunityStorageError('Cloudinary is not configured.', 503)
    return seedGroups
  }
  // Fail fast while the network is known-bad, serving the last good list.
  if (storageCircuitOpen('community-groups')) {
    if (options.strict)
      throw new CommunityStorageError(
        'Cloudinary could not be reached just now. Try again in a minute.',
        502,
      )
    return (
      recallStorageGood<CommunityGroup[]>('community-groups') ?? seedGroups
    )
  }
  try {
    const groups = normalizeGroups(await fetchStoredGroups(config, options.cacheRead))
    markStorageSuccess('community-groups')
    rememberStorageGood('community-groups', groups)
    return groups
  } catch (error) {
    markStorageFailure('community-groups')
    if (options.strict) throw error
    return (
      recallStorageGood<CommunityGroup[]>('community-groups') ?? seedGroups
    )
  }
}

export async function saveGroups(groups: CommunityGroup[]) {
  const config = cloudinaryConfig()
  if (!config)
    throw new CommunityStorageError('Cloudinary is not configured.', 503)
  if (!isGroupArray(groups)) throw new Error('The group data is invalid.')
  const form = new FormData()
  form.set(
    'file',
    new Blob([JSON.stringify(groups)], { type: 'application/json' }),
    'community.json',
  )
  form.set('public_id', COMMUNITY_DATA_ID)
  form.set('overwrite', 'true')
  form.set('invalidate', 'true')
  // Send an actual multipart file through fetch. The SDK's base64 upload
  // request was timing out locally. Basic auth stays entirely on the server.
  const resource = (await storageRequest(
    `https://api.cloudinary.com/v1_1/${config.cloud_name}/raw/upload`,
    { method: 'POST', headers: authHeaders(config), body: form },
    'save',
  )) as { public_id?: string } | null
  if (resource?.public_id !== COMMUNITY_DATA_ID) throw storageError('save')
}
