import { revalidatePath, revalidateTag } from 'next/cache'
import { isAdmin, json, sameOrigin } from '@/lib/admin/auth'

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: 'This request is not allowed.' }, 403)
  if (!(await isAdmin()))
    return json({ error: 'Your session has expired. Please sign in again.' }, 401)
  revalidateTag('bulletins', { expire: 0 })
  revalidatePath('/bulletin')
  return json({ ok: true })
}
