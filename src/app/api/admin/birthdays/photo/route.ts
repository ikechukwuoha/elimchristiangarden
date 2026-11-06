import { isAdmin, json, readSmallJson, sameOrigin } from '@/lib/admin/auth'
import { cloudinaryConfig } from '@/lib/admin/cloudinary'
import { birthdayUploadTicket, validateBirthdayUpload } from '@/lib/admin/birthday-upload'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: 'This request is not allowed.' }, 403)
  if (!(await isAdmin())) return json({ error: 'Your session has expired. Please sign in again.' }, 401)
  if (!cloudinaryConfig()) return json({ error: 'Connect Cloudinary before uploading portraits.' }, 503)
  try {
    validateBirthdayUpload(await readSmallJson(request))
    return json(birthdayUploadTicket())
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'The portrait upload could not be prepared.' }, 400)
  }
}
