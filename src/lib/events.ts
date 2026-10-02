import 'server-only'
import { cloudinaryConfig } from '@/lib/admin/cloudinary'

// Upcoming events are stored as a JSON document in Cloudinary (raw upload,
// overwritten on each change) and scrolled under the navbar by the ticker.
export const EVENTS_DATA_ID = 'elim/data/events.json'

export type ChurchEvent = {
  id: string
  title: string
  date: string // YYYY-MM-DD
  time: string
  location: string
}

export function slugifyEventTitle(title: string) {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '')
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  // Round-trip: JS would otherwise normalise 2026-02-30 into March.
  return (
    !Number.isNaN(parsed.valueOf()) &&
    parsed.toISOString().slice(0, 10) === value
  )
}

export function isEventArray(value: unknown): value is ChurchEvent[] {
  return (
    Array.isArray(value) &&
    value.length <= 100 &&
    value.every((item) => {
      if (!item || typeof item !== 'object') return false
      const event = item as Record<string, unknown>
      return (
        typeof event.id === 'string' &&
        event.id.length > 0 &&
        event.id.length <= 80 &&
        typeof event.title === 'string' &&
        event.title.trim().length > 0 &&
        event.title.length <= 80 &&
        typeof event.date === 'string' &&
        isValidDate(event.date) &&
        typeof event.time === 'string' &&
        event.time.length <= 40 &&
        typeof event.location === 'string' &&
        event.location.length <= 80
      )
    })
  )
}

export function parseEventInput(
  value: unknown,
  existing: ChurchEvent[],
): ChurchEvent {
  if (existing.length >= 100)
    throw new Error('The maximum of 100 events has been reached.')
  if (!value || typeof value !== 'object')
    throw new Error('Enter the event details.')
  const data = value as Record<string, unknown>
  const title = typeof data.title === 'string' ? data.title.trim() : ''
  if (!title || title.length > 80)
    throw new Error('Enter an event name between 1 and 80 characters.')
  const date = typeof data.date === 'string' ? data.date.trim() : ''
  if (!isValidDate(date))
    throw new Error('Choose a valid event date.')
  const time =
    typeof data.time === 'string' && data.time.trim()
      ? data.time.trim()
      : ''
  if (time.length > 40)
    throw new Error('Keep the time under 40 characters.')
  const location =
    typeof data.location === 'string' && data.location.trim()
      ? data.location.trim()
      : 'Elim Garden, Bwari'
  if (location.length > 80)
    throw new Error('Keep the location under 80 characters.')
  const base = slugifyEventTitle(title)
  if (!base) throw new Error('Choose a name with letters or numbers.')
  let id = base
  for (
    let suffix = 2;
    existing.some((event) => event.id === id);
    suffix++
  )
    id = `${base}-${suffix}`
  return { id, title, date, time, location }
}

export function addEvent(items: ChurchEvent[], record: ChurchEvent) {
  return [...items, record]
}

export function removeEvent(items: ChurchEvent[], id: string) {
  const remaining = items.filter((event) => event.id !== id)
  if (remaining.length === items.length)
    throw new Error('That event could not be found.')
  return remaining
}

// Today in UTC, so the server and the ticker agree regardless of timezone.
export function todayIso(now = new Date()) {
  return now.toISOString().slice(0, 10)
}

export function upcomingEvents(
  events: ChurchEvent[],
  today = todayIso(),
): ChurchEvent[] {
  return events
    .filter((event) => event.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title))
    .slice(0, 8)
}

type StorageOperation = 'read' | 'save'

export class EventStorageError extends Error {
  constructor(
    message: string,
    public readonly status: 502 | 503 | 504,
  ) {
    super(message)
    this.name = 'EventStorageError'
  }
}

function storageError(operation: StorageOperation, timeout = false) {
  const subject = operation === 'save' ? 'save' : 'load'
  return new EventStorageError(
    timeout
      ? `Cloudinary timed out while trying to ${subject} the events. Please try again.`
      : `Cloudinary could not ${subject === 'save' ? 'confirm the save of' : 'load'} the events. Please try again.`,
    timeout ? 504 : 502,
  )
}

async function storageRequest(
  url: string,
  init: RequestInit,
  operation: StorageOperation,
  allowMissing = false,
) {
  const signal = AbortSignal.timeout(operation === 'save' ? 20000 : 15000)
  try {
    const response = await fetch(url, { ...init, cache: 'no-store', signal })
    if (allowMissing && response.status === 404) {
      await response.body?.cancel()
      return null
    }
    if (!response.ok) {
      console.error('Event storage request rejected', {
        operation,
        status: response.status,
      })
      await response.body?.cancel()
      if (response.status === 401 || response.status === 403)
        throw new EventStorageError(
          'Cloudinary denied access to the event data. Check the configured API key and its permissions.',
          502,
        )
      throw storageError(operation, [408, 499, 504].includes(response.status))
    }
    return (await response.json()) as unknown
  } catch (error) {
    if (error instanceof EventStorageError) throw error
    const timedOut = signal.aborted
    console.error('Event storage request failed', { operation, timedOut })
    throw storageError(operation, timedOut)
  }
}

function authHeaders(config: NonNullable<ReturnType<typeof cloudinaryConfig>>) {
  return {
    Authorization: `Basic ${Buffer.from(`${config.api_key}:${config.api_secret}`).toString('base64')}`,
  }
}

async function fetchStoredEvents(
  config: NonNullable<ReturnType<typeof cloudinaryConfig>>,
) {
  const resource = (await storageRequest(
    `https://api.cloudinary.com/v1_1/${config.cloud_name}/resources/raw/upload/${encodeURIComponent(EVENTS_DATA_ID)}`,
    { headers: authHeaders(config) },
    'read',
    true,
  )) as { secure_url?: string } | null
  if (resource === null) return []
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
  const data = await storageRequest(parsed.toString(), {}, 'read')
  if (!isEventArray(data)) throw storageError('read')
  return data
}

export async function readEvents(
  options: { strict?: boolean } = {},
): Promise<ChurchEvent[]> {
  const config = cloudinaryConfig()
  if (!config) {
    if (options.strict)
      throw new EventStorageError('Cloudinary is not configured.', 503)
    return []
  }
  try {
    return await fetchStoredEvents(config)
  } catch (error) {
    if (options.strict) throw error
    return []
  }
}

export async function saveEvents(events: ChurchEvent[]) {
  const config = cloudinaryConfig()
  if (!config)
    throw new EventStorageError('Cloudinary is not configured.', 503)
  if (!isEventArray(events)) throw new Error('The event data is invalid.')
  const form = new FormData()
  form.set(
    'file',
    new Blob([JSON.stringify(events)], { type: 'application/json' }),
    'events.json',
  )
  form.set('public_id', EVENTS_DATA_ID)
  form.set('overwrite', 'true')
  form.set('invalidate', 'true')
  const resource = (await storageRequest(
    `https://api.cloudinary.com/v1_1/${config.cloud_name}/raw/upload`,
    { method: 'POST', headers: authHeaders(config), body: form },
    'save',
  )) as { public_id?: string } | null
  if (resource?.public_id !== EVENTS_DATA_ID) throw storageError('save')
}
