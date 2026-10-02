import { revalidatePath, revalidateTag } from 'next/cache'
import { isAdmin, json, sameOrigin } from '@/lib/admin/auth'
import { refreshMessages } from '@/lib/message-cache'

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: 'This request is not allowed.' }, 403)
  if (!(await isAdmin()))
    return json({ error: 'Your session has expired. Please sign in again.' }, 401)
  revalidateTag('gallery', { expire: 0 })
  refreshMessages()
  revalidatePath('/')
  revalidatePath('/gallery')
  revalidatePath('/gallery/[group]', 'page')
  revalidatePath('/gallery/audio')
  return json({ ok: true })
}
