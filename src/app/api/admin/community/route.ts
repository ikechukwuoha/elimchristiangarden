import { revalidateTag } from 'next/cache'
import { isAdmin, json, readSmallJson, sameOrigin } from '@/lib/admin/auth'
import { logAdminEvent } from '@/lib/admin/audit'
import { cloudinaryConfig } from '@/lib/admin/cloudinary'
import {
  addGroup,
  CommunityStorageError,
  parseGroupInput,
  readGroups,
  removeGroup,
  saveGroups,
} from '@/lib/community'

export const runtime = 'nodejs'
export const maxDuration = 60

function failure(error: unknown, fallback: string) {
  return json(
    { error: error instanceof Error ? error.message : fallback },
    error instanceof CommunityStorageError ? error.status : 400,
  )
}

export async function GET() {
  if (!(await isAdmin()))
    return json(
      { error: 'Your session has expired. Please sign in again.' },
      401,
    )
  try {
    return json({ groups: await readGroups({ strict: true }) })
  } catch (error) {
    return failure(error, 'The saved group list could not be loaded.')
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
    // Reject invalid form fields before making any storage requests.
    parseGroupInput(input, [])
  } catch (error) {
    return failure(error, 'Invalid request.')
  }
  try {
    const current = await readGroups({ strict: true })
    const record = parseGroupInput(input, current)
    await saveGroups(addGroup(current, record))
    revalidateTag('community-groups', { expire: 0 })
    logAdminEvent('group_added', { id: record.id, kind: record.kind })
    return json({ group: record })
  } catch (error) {
    return failure(error, 'This group could not be saved. Please try again.')
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
  if (!id) return json({ error: 'Choose a group to remove.' }, 400)
  try {
    const current = await readGroups({ strict: true })
    await saveGroups(removeGroup(current, id))
    revalidateTag('community-groups', { expire: 0 })
    logAdminEvent('group_removed', { id })
    return json({ ok: true })
  } catch (error) {
    return failure(error, 'This group could not be removed. Please try again.')
  }
}
