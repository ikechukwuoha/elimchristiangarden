import 'server-only'
import { cloudinaryConfig } from './admin/cloudinary'
import { isBirthdayArray, celebrationKind, type Birthday } from './birthdays'
import { markStorageFailure, markStorageSuccess, recallStorageGood, rememberStorageGood, storageCircuitOpen } from './storage-health'

export const BIRTHDAYS_DATA_ID = 'elim/data/birthdays.json'

export class BirthdayStorageError extends Error {
  constructor(message: string, public readonly status: 502 | 503 | 504 = 502) {
    super(message)
    this.name = 'BirthdayStorageError'
  }
}

async function storageRequest(url: string, init: RequestInit = {}, allowMissing = false, readSignal?: AbortSignal) {
  const signal = readSignal ?? AbortSignal.timeout(init.method === 'POST' ? 20000 : 8000)
  try {
    const response = await fetch(url, { ...init, cache: 'no-store', signal })
    if (allowMissing && response.status === 404) { await response.body?.cancel(); return null }
    if (!response.ok) {
      console.warn('Celebration storage request rejected', { status: response.status })
      await response.body?.cancel()
      throw new BirthdayStorageError('Celebration storage is unavailable. Please try again.')
    }
    return await response.json()
  } catch (error) {
    if (error instanceof BirthdayStorageError) throw error
    console.warn('Celebration storage connection failed', { timedOut: signal.aborted })
    throw new BirthdayStorageError('Celebration storage could not be reached. Check the connection to Cloudinary and try again.', signal.aborted ? 504 : 502)
  }
}

function storageConfig() {
  const config = cloudinaryConfig()
  if (!config) throw new BirthdayStorageError('Cloudinary is not configured.', 503)
  const headers = { Authorization: `Basic ${Buffer.from(`${config.api_key}:${config.api_secret}`).toString('base64')}` }
  return { config, headers }
}

export async function readBirthdays(): Promise<Birthday[]> {
  const { config, headers } = storageConfig()
  if (storageCircuitOpen('birthdays')) throw new BirthdayStorageError('Celebration storage could not be reached. Try again in a minute.')
  const readSignal = AbortSignal.timeout(8000)
  try {
    const resource = await storageRequest(
      `https://api.cloudinary.com/v1_1/${config.cloud_name}/resources/raw/upload/${encodeURIComponent(BIRTHDAYS_DATA_ID)}`,
      { headers }, true, readSignal,
    )
    let items: Birthday[] = []
    if (resource !== null) {
      const url = new URL(resource.secure_url)
      if (url.origin !== 'https://res.cloudinary.com' || !url.pathname.startsWith(`/${config.cloud_name}/raw/upload/`)) {
        throw new BirthdayStorageError('Birthday storage returned an invalid file.')
      }
      const data: unknown = await storageRequest(url.toString(), {}, false, readSignal)
      if (!isBirthdayArray(data, config.cloud_name)) throw new BirthdayStorageError('The saved birthday data could not be read.')
      items = data.map((item) => ({ ...item, kind: celebrationKind(item) }))
    }
    markStorageSuccess('birthdays')
    rememberStorageGood('birthdays', items)
    return items
  } catch (error) {
    markStorageFailure('birthdays')
    if (error instanceof BirthdayStorageError) throw error
    throw new BirthdayStorageError('The birthday list could not be loaded. Please try again.')
  }
}

export function lastGoodBirthdays() {
  return recallStorageGood<Birthday[]>('birthdays') ?? []
}

export async function saveBirthdays(items: Birthday[]) {
  const { config, headers } = storageConfig()
  if (!isBirthdayArray(items, config.cloud_name)) throw new Error('The birthday data is invalid.')
  const form = new FormData()
  form.set('file', new Blob([JSON.stringify(items)], { type: 'application/json' }), 'birthdays.json')
  form.set('public_id', BIRTHDAYS_DATA_ID)
  form.set('overwrite', 'true')
  form.set('invalidate', 'true')
  const result = await storageRequest(`https://api.cloudinary.com/v1_1/${config.cloud_name}/raw/upload`, { method: 'POST', headers, body: form })
  if (result?.public_id !== BIRTHDAYS_DATA_ID) throw new BirthdayStorageError('The birthday save could not be confirmed. Refresh the list before trying again.')
  markStorageSuccess('birthdays')
  rememberStorageGood('birthdays', items)
}
