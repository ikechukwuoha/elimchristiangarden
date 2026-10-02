import { isAdmin, json, readSmallJson, sameOrigin } from '@/lib/admin/auth'
import { logAdminEvent } from '@/lib/admin/audit'
import { validateYoutubeMessage } from '@/lib/messages'
import { MessageStorageError, saveYoutubeMessage } from '@/lib/message-store'
import { refreshMessages } from '@/lib/message-cache'

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: 'This request is not allowed.' }, 403)
  if (!(await isAdmin())) return json({ error: 'Your session has expired. Please sign in again.' }, 401)
  let details: ReturnType<typeof validateYoutubeMessage>
  try {
    details = validateYoutubeMessage(await readSmallJson(request))
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Invalid message details.' }, 400)
  }
  try {
    const message = await saveYoutubeMessage(details)
    refreshMessages()
    logAdminEvent('youtube-message.published', { id: message.id })
    return json({ message })
  } catch (error) {
    return json({ error: error instanceof MessageStorageError ? error.message : 'Could not publish this message.' },
      error instanceof MessageStorageError ? error.status : 502)
  }
}
