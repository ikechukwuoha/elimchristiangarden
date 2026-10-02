import { isAdmin, json, readSmallJson, sameOrigin } from '@/lib/admin/auth'
import { logAdminEvent } from '@/lib/admin/audit'
import { cloudinaryConfig } from '@/lib/admin/cloudinary'
import { invalidateCommunityPages } from '@/lib/community-cache'
import {
  addGroup,
  CommunityStorageError,
  parseGroupInput,
  readGroups,
  removeGroup,
  saveGroups,
  updateGroup,
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
    input = await readSmallJson(request, 65536)
    // Reject invalid form fields before making any storage requests.
    parseGroupInput(input, [])
  } catch (error) {
    return failure(error, 'Invalid request.')
  }
  try {
    const current = await readGroups({ strict: true })
    const record = parseGroupInput(input, current)
    const groups = addGroup(current, record)
    await saveGroups(groups)
    invalidateCommunityPages()
    logAdminEvent('group_added', { id: record.id, kind: record.kind })
    return json({ group: record, groups })
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
    const groups = removeGroup(current, id)
    await saveGroups(groups)
    invalidateCommunityPages()
    logAdminEvent('group_removed', { id })
    return json({ ok: true, groups })
  } catch (error) {
    return failure(error, 'This group could not be removed. Please try again.')
  }
}

export async function PATCH(request: Request) {
  if (!sameOrigin(request))
    return json({ error: 'This request is not allowed.' }, 403)
  if (!(await isAdmin()))
    return json({ error: 'Your session has expired. Please sign in again.' }, 401)
  if (!cloudinaryConfig())
    return json({ error: 'Cloudinary hasn’t been connected yet, so changes can’t be saved.' }, 503)

  let input
  let id: string
  try {
    input = await readSmallJson(request, 65536)
    id = input && typeof input === 'object' && typeof (input as { id?: unknown }).id === 'string'
      ? (input as { id: string }).id : ''
    if (!id || id.length > 80) throw new Error('Choose a group to edit.')
    parseGroupInput(input, [])
  } catch (error) {
    return failure(error, 'Invalid request.')
  }
  try {
    const groups = updateGroup(await readGroups({ strict: true }), id, input)
    await saveGroups(groups)
    invalidateCommunityPages()
    const group = groups.find((item) => item.id === id)
    logAdminEvent('group_updated', { id, kind: group?.kind })
    return json({ group, groups })
  } catch (error) {
    return failure(error, 'This group could not be updated. Please try again.')
  }
}
