import 'server-only'
import { cache } from 'react'
import { revalidatePath, revalidateTag } from 'next/cache'
import { cloudinaryConfig } from './admin/cloudinary'
import { parseCountdownSettings, type CountdownSettings } from './countdown'
import { markStorageFailure, markStorageSuccess, recallStorageGood, rememberStorageGood, storageCircuitOpen } from './storage-health'

export const COUNTDOWN_DATA_ID = 'elim/data/countdown.json'
export class CountdownStorageError extends Error {
  constructor(message: string, public status: 502 | 503 | 504 = 502) { super(message); this.name = 'CountdownStorageError' }
}

function configAndHeaders() {
  const config = cloudinaryConfig()
  if (!config) throw new CountdownStorageError('Connect Cloudinary before saving countdown settings.', 503)
  return { config, headers: { Authorization: `Basic ${Buffer.from(`${config.api_key}:${config.api_secret}`).toString('base64')}` } }
}

async function request(url: string, init: RequestInit, signal: AbortSignal, cacheRead = false, allowMissing = false) {
  const saving = init.method === 'POST'
  try {
    const response = await fetch(url, {
      ...init, signal,
      ...(!saving && cacheRead && process.env.NODE_ENV === 'production'
        ? { cache: 'force-cache', next: { revalidate: 300, tags: ['countdown'] } } as const
        : { cache: 'no-store' } as const),
    })
    if (allowMissing && response.status === 404) { await response.body?.cancel(); return null }
    if (!response.ok) {
      await response.body?.cancel()
      console.warn('Countdown storage request rejected', { operation: saving ? 'save' : 'read', status: response.status })
      throw new CountdownStorageError('Countdown storage is unavailable. Please try again.', response.status === 429 ? 503 : 502)
    }
    return await response.json() as unknown
  } catch (error) {
    if (error instanceof CountdownStorageError) throw error
    console.warn('Countdown storage connection failed', { operation: saving ? 'save' : 'read', timedOut: signal.aborted })
    throw new CountdownStorageError(`Countdown settings could not be ${saving ? 'saved' : 'loaded'}. Please try again.`, signal.aborted ? 504 : 502)
  }
}

export async function readCountdownSettings(options: { cacheRead?: boolean } = {}): Promise<CountdownSettings | null> {
  const { config, headers } = configAndHeaders()
  if (storageCircuitOpen('countdown')) throw new CountdownStorageError('Countdown storage could not be reached. Try again in a minute.')
  const signal = AbortSignal.timeout(14000)
  try {
    const resource = await request(`https://api.cloudinary.com/v1_1/${config.cloud_name}/resources/raw/upload/${encodeURIComponent(COUNTDOWN_DATA_ID)}`, { headers }, signal, options.cacheRead, true) as { secure_url?: string } | null
    let settings: CountdownSettings | null = null
    if (resource !== null) {
      if (!resource.secure_url) throw new CountdownStorageError('The saved countdown settings could not be read.')
      const url = new URL(resource.secure_url)
      if (url.origin !== 'https://res.cloudinary.com' || !url.pathname.startsWith(`/${config.cloud_name}/raw/upload/`))
        throw new CountdownStorageError('Countdown storage returned an invalid file.')
      settings = parseCountdownSettings(await request(url.toString(), {}, signal, options.cacheRead))
    }
    markStorageSuccess('countdown'); rememberStorageGood('countdown', settings)
    return settings
  } catch (error) {
    markStorageFailure('countdown')
    if (error instanceof CountdownStorageError) throw error
    throw new CountdownStorageError('The saved countdown settings could not be read. Please try again.')
  }
}

const publicSettings = cache(() => readCountdownSettings({ cacheRead: true }))
export async function cachedCountdownSettings() {
  try { return { settings: await publicSettings(), available: true, unavailable: false } }
  catch {
    const previous = recallStorageGood<CountdownSettings | null>('countdown')
    return { settings: previous ?? null, available: previous !== undefined, unavailable: true }
  }
}

export async function saveCountdownSettings(input: CountdownSettings) {
  const settings = parseCountdownSettings(input)
  const { config, headers } = configAndHeaders()
  const form = new FormData()
  form.set('file', new Blob([JSON.stringify(settings)], { type: 'application/json' }), 'countdown.json')
  form.set('public_id', COUNTDOWN_DATA_ID); form.set('overwrite', 'true'); form.set('invalidate', 'true')
  const resource = await request(`https://api.cloudinary.com/v1_1/${config.cloud_name}/raw/upload`, { method: 'POST', headers, body: form }, AbortSignal.timeout(20000)) as { public_id?: string }
  if (resource?.public_id !== COUNTDOWN_DATA_ID) throw new CountdownStorageError('The countdown save could not be confirmed. Refresh before trying again.')
  markStorageSuccess('countdown'); rememberStorageGood('countdown', settings)
}

export function invalidateCountdown() {
  revalidateTag('countdown', { expire: 0 }); revalidatePath('/admin/countdown')
}
