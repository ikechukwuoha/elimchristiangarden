import 'server-only'
import { cloudinaryConfig } from '@/lib/admin/cloudinary'
import { testimonials } from '@/app/data/testimonies'

// Testimonies are stored as a JSON document in Cloudinary (raw upload,
// overwritten on each change), following the same pattern as fellowships.
// Until an admin saves changes, the seeded testimonies from
// src/app/data/testimonies.ts are shown.
export const TESTIMONIES_DATA_ID = 'elim/data/testimonies.json'

export type Testimony = {
  id: string
  quote: string
  name: string
  role: string
}

export const seedTestimonies: Testimony[] = testimonials.map(
  (testimony, index) => ({
    id: `${slugifyName(testimony.name)}-${index + 1}`,
    quote: testimony.quote,
    name: testimony.name,
    role: testimony.role,
  }),
)

export function slugifyName(name: string) {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
    .replace(/-+$/g, '')
}

export function isTestimonyArray(value: unknown): value is Testimony[] {
  return (
    Array.isArray(value) &&
    value.length <= 200 &&
    value.every((item) => {
      if (!item || typeof item !== 'object') return false
      const testimony = item as Record<string, unknown>
      return (
        typeof testimony.id === 'string' &&
        testimony.id.length > 0 &&
        testimony.id.length <= 70 &&
        typeof testimony.quote === 'string' &&
        testimony.quote.trim().length > 0 &&
        testimony.quote.length <= 1200 &&
        typeof testimony.name === 'string' &&
        testimony.name.trim().length > 0 &&
        testimony.name.length <= 60 &&
        typeof testimony.role === 'string' &&
        testimony.role.length <= 80
      )
    })
  )
}

export function parseTestimonyInput(
  value: unknown,
  existing: Testimony[],
): Testimony {
  if (existing.length >= 200)
    throw new Error('The maximum of 200 testimonies has been reached.')
  if (!value || typeof value !== 'object')
    throw new Error('Enter the testimony details.')
  const data = value as Record<string, unknown>
  const quote = typeof data.quote === 'string' ? data.quote.trim() : ''
  if (quote.length < 20 || quote.length > 1200)
    throw new Error('Share the testimony in 20–1200 characters.')
  const name = typeof data.name === 'string' ? data.name.trim() : ''
  if (!name || name.length > 60)
    throw new Error('Enter a name between 1 and 60 characters.')
  const role =
    typeof data.role === 'string' && data.role.trim()
      ? data.role.trim().slice(0, 80)
      : 'Member'
  const base = slugifyName(name)
  if (!base) throw new Error('Choose a name with letters or numbers.')
  let id = base
  for (
    let suffix = 2;
    existing.some((testimony) => testimony.id === id);
    suffix++
  )
    id = `${base}-${suffix}`
  return { id, quote, name, role }
}

export function addTestimony(
  items: Testimony[],
  record: Testimony,
): Testimony[] {
  return [record, ...items]
}

export function removeTestimony(
  items: Testimony[],
  id: string,
): Testimony[] {
  const remaining = items.filter((testimony) => testimony.id !== id)
  if (remaining.length === items.length)
    throw new Error('That testimony could not be found.')
  return remaining
}

type StorageOperation = 'read' | 'save'

export class TestimonyStorageError extends Error {
  constructor(
    message: string,
    public readonly status: 502 | 503 | 504,
  ) {
    super(message)
    this.name = 'TestimonyStorageError'
  }
}

function storageError(operation: StorageOperation, timeout = false) {
  const subject = operation === 'save' ? 'save' : 'load'
  return new TestimonyStorageError(
    timeout
      ? `Cloudinary timed out while trying to ${subject} the testimonies. Please try again.`
      : `Cloudinary could not ${subject === 'save' ? 'confirm the save of' : 'load'} the testimonies. Please try again.`,
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
      console.error('Testimony storage request rejected', {
        operation,
        status: response.status,
      })
      await response.body?.cancel()
      if (response.status === 401 || response.status === 403)
        throw new TestimonyStorageError(
          'Cloudinary denied access to the testimony data. Check the configured API key and its permissions.',
          502,
        )
      throw storageError(operation, [408, 499, 504].includes(response.status))
    }
    return (await response.json()) as unknown
  } catch (error) {
    if (error instanceof TestimonyStorageError) throw error
    const timedOut = signal.aborted
    console.error('Testimony storage request failed', { operation, timedOut })
    throw storageError(operation, timedOut)
  }
}

function authHeaders(config: NonNullable<ReturnType<typeof cloudinaryConfig>>) {
  return {
    Authorization: `Basic ${Buffer.from(`${config.api_key}:${config.api_secret}`).toString('base64')}`,
  }
}

async function fetchStoredTestimonies(
  config: NonNullable<ReturnType<typeof cloudinaryConfig>>,
) {
  const resource = (await storageRequest(
    `https://api.cloudinary.com/v1_1/${config.cloud_name}/resources/raw/upload/${encodeURIComponent(TESTIMONIES_DATA_ID)}`,
    { headers: authHeaders(config) },
    'read',
    true,
  )) as { secure_url?: string } | null
  if (resource === null) return seedTestimonies
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
  if (!isTestimonyArray(data)) throw storageError('read')
  return data
}

export async function readTestimonies(
  options: { strict?: boolean } = {},
): Promise<Testimony[]> {
  const config = cloudinaryConfig()
  if (!config) {
    if (options.strict)
      throw new TestimonyStorageError('Cloudinary is not configured.', 503)
    return seedTestimonies
  }
  try {
    return await fetchStoredTestimonies(config)
  } catch (error) {
    if (options.strict) throw error
    return seedTestimonies
  }
}

export async function saveTestimonies(testimonies: Testimony[]) {
  const config = cloudinaryConfig()
  if (!config)
    throw new TestimonyStorageError('Cloudinary is not configured.', 503)
  if (!isTestimonyArray(testimonies))
    throw new Error('The testimony data is invalid.')
  const form = new FormData()
  form.set(
    'file',
    new Blob([JSON.stringify(testimonies)], { type: 'application/json' }),
    'testimonies.json',
  )
  form.set('public_id', TESTIMONIES_DATA_ID)
  form.set('overwrite', 'true')
  form.set('invalidate', 'true')
  const resource = (await storageRequest(
    `https://api.cloudinary.com/v1_1/${config.cloud_name}/raw/upload`,
    { method: 'POST', headers: authHeaders(config), body: form },
    'save',
  )) as { public_id?: string } | null
  if (resource?.public_id !== TESTIMONIES_DATA_ID)
    throw storageError('save')
}
