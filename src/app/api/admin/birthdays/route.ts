import { randomUUID } from 'node:crypto'
import { isAdmin, json, readSmallJson, sameOrigin } from '@/lib/admin/auth'
import { logAdminEvent } from '@/lib/admin/audit'
import { cloudinaryConfig } from '@/lib/admin/cloudinary'
import { parseBirthdayInput } from '@/lib/birthdays'
import { BirthdayStorageError, readBirthdays, saveBirthdays } from '@/lib/birthday-store'
import { invalidateBirthdays } from '@/lib/birthday-cache'

export const runtime = 'nodejs'
export const maxDuration = 60

function failure(error: unknown) {
  return json({ error: error instanceof Error ? error.message : 'The birthday change could not be saved.' },
    error instanceof BirthdayStorageError ? error.status : 400)
}

export async function GET() {
  if (!(await isAdmin())) return json({ error: 'Your session has expired. Please sign in again.' }, 401)
  try { return json({ birthdays: await readBirthdays() }) } catch (error) { return failure(error) }
}

async function mutate(request: Request, method: 'POST' | 'PUT' | 'DELETE') {
  if (!sameOrigin(request)) return json({ error: 'This request is not allowed.' }, 403)
  if (!(await isAdmin())) return json({ error: 'Your session has expired. Please sign in again.' }, 401)
  const config = cloudinaryConfig()
  if (!config) return json({ error: 'Connect Cloudinary before publishing birthdays.' }, 503)
  try {
    const input = await readSmallJson(request) as Record<string, unknown> | null
    const details = method !== 'DELETE' ? parseBirthdayInput(input, config.cloud_name) : null
    const id = method === 'POST' ? randomUUID() : typeof input?.id === 'string' ? input.id : ''
    if (!id) throw new Error('Choose a birthday to change.')
    const current = await readBirthdays()
    if (method !== 'POST' && !current.some((item) => item.id === id)) throw new Error('That birthday could not be found. Refresh the list.')
    if (method === 'POST' && current.length >= 500) throw new Error('The maximum of 500 birthdays has been reached.')
    const record = details ? { ...details, id } : null
    const birthdays = method === 'POST' ? [...current, record!] : method === 'PUT'
      ? current.map((item) => item.id === id ? record! : item) : current.filter((item) => item.id !== id)
    await saveBirthdays(birthdays)
    invalidateBirthdays()
    logAdminEvent(`birthday_${method === 'DELETE' ? 'removed' : 'saved'}`, { id })
    return json({ birthdays, birthday: record })
  } catch (error) { return failure(error) }
}

export async function POST(request: Request) { return mutate(request, 'POST') }
export async function PUT(request: Request) { return mutate(request, 'PUT') }
export async function DELETE(request: Request) { return mutate(request, 'DELETE') }
