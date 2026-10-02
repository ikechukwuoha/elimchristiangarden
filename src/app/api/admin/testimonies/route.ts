import { isAdmin, json, readSmallJson, sameOrigin } from '@/lib/admin/auth'
import { logAdminEvent } from '@/lib/admin/audit'
import { cloudinaryConfig } from '@/lib/admin/cloudinary'
import { invalidateTestimonyPages } from '@/lib/testimonies-cache'
import {
  addTestimony,
  parseTestimonyInput,
  readTestimonies,
  removeTestimony,
  saveTestimonies,
  TestimonyStorageError,
} from '@/lib/testimonies'

export const runtime = 'nodejs'
export const maxDuration = 60

function failure(error: unknown, fallback: string) {
  return json(
    { error: error instanceof Error ? error.message : fallback },
    error instanceof TestimonyStorageError ? error.status : 400,
  )
}

export async function GET() {
  if (!(await isAdmin()))
    return json(
      { error: 'Your session has expired. Please sign in again.' },
      401,
    )
  try {
    return json({ testimonies: await readTestimonies({ strict: true }) })
  } catch (error) {
    return failure(error, 'The saved testimonies could not be loaded.')
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request))
    return json({ error: 'This request is not allowed.' }, 403)
  if (!(await isAdmin()))
    return json(
      { error: 'Your session has expired. Please sign in again.' },
      401,
    )
  if (!cloudinaryConfig())
    return json(
      {
        error:
          'Cloudinary hasn’t been connected yet, so changes can’t be saved. Contact the site administrator.',
      },
      503,
    )
  let input
  try {
    input = await readSmallJson(request)
    parseTestimonyInput(input, [])
  } catch (error) {
    return failure(error, 'Invalid request.')
  }
  try {
    const current = await readTestimonies({ strict: true })
    const record = parseTestimonyInput(input, current)
    const testimonies = addTestimony(current, record)
    await saveTestimonies(testimonies)
    invalidateTestimonyPages()
    logAdminEvent('testimony_added', { id: record.id })
    return json({ testimony: record, testimonies })
  } catch (error) {
    return failure(error, 'This testimony could not be saved. Please try again.')
  }
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request))
    return json({ error: 'This request is not allowed.' }, 403)
  if (!(await isAdmin()))
    return json(
      { error: 'Your session has expired. Please sign in again.' },
      401,
    )
  if (!cloudinaryConfig())
    return json(
      {
        error:
          'Cloudinary hasn’t been connected yet, so changes can’t be saved. Contact the site administrator.',
      },
      503,
    )
  let input
  try {
    input = await readSmallJson(request)
  } catch {
    return json({ error: 'Invalid request.' }, 400)
  }
  const id =
    input && typeof input === 'object' && typeof (input as { id?: unknown }).id === 'string'
      ? (input as { id: string }).id
      : ''
  if (!id) return json({ error: 'Choose a testimony to remove.' }, 400)
  try {
    const current = await readTestimonies({ strict: true })
    const testimonies = removeTestimony(current, id)
    await saveTestimonies(testimonies)
    invalidateTestimonyPages()
    logAdminEvent('testimony_removed', { id })
    return json({ ok: true, testimonies })
  } catch (error) {
    return failure(error, 'This testimony could not be removed. Please try again.')
  }
}
