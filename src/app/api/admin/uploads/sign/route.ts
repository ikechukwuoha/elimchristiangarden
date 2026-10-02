import { isAdmin, json, readSmallJson, sameOrigin } from '@/lib/admin/auth'
import { logAdminEvent } from '@/lib/admin/audit'
import { cloudinaryConfig, uploadTicket } from '@/lib/admin/cloudinary'
import { cachedGroups } from '@/lib/community-cache'
import { groupOptions } from '@/lib/community'
import { validateUpload } from '@/lib/media'

export const runtime = 'nodejs'

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
          'Uploads are not configured yet. Contact the site administrator.',
      },
      503,
    )
  let details
  try {
    const input = await readSmallJson(request)
    const wantsGroup = input && typeof input === 'object' && 'kind' in input &&
      (input.kind === 'image' || input.kind === 'video')
    const groups = wantsGroup
      ? groupOptions(await cachedGroups()).map((option) => option.id)
      : undefined
    details = validateUpload(input, groups)
  } catch (error) {
    return json(
      {
        error:
          error instanceof Error ? error.message : 'Invalid upload details.',
      },
      400,
    )
  }
  logAdminEvent('upload_authorised', {
    kind: details.kind,
    group: details.group,
    filename: details.filename.slice(0, 100),
  })
  return json(uploadTicket(details))
}
