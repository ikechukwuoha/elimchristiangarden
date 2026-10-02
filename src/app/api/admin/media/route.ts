import { isAdmin, json } from '@/lib/admin/auth'
import { cloudinaryConfig, listMedia } from '@/lib/admin/cloudinary'
import { isMediaKind } from '@/lib/media'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  if (!(await isAdmin()))
    return json(
      { error: 'Your session has expired. Please sign in again.' },
      401,
    )
  if (!cloudinaryConfig())
    return json(
      {
        error:
          'The media library is not configured yet. Contact the site administrator.',
      },
      503,
    )
  const params = new URL(request.url).searchParams
  const kind = params.get('kind') ?? 'image'
  const cursor = params.get('cursor') ?? undefined
  if (!isMediaKind(kind) || (cursor && cursor.length > 1024))
    return json({ error: 'Invalid library request.' }, 400)
  try {
    return json(await listMedia(kind, cursor))
  } catch {
    return json(
      {
        error:
          'We couldn’t load the Cloudinary library. Please try again. If this continues, check the Cloudinary credentials and account limits.',
      },
      502,
    )
  }
}
