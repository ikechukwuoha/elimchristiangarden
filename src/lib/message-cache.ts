import 'server-only'
import { cache } from 'react'
import { unstable_cache, revalidatePath, revalidateTag } from 'next/cache'
import { listMessages } from './message-store'

const publishedMessages = unstable_cache(listMessages, ['published-messages-v1'], {
  revalidate: 60, tags: ['messages', 'gallery'],
})

export const cachedMessages = cache(publishedMessages)

export function refreshMessages() {
  revalidateTag('messages', { expire: 0 })
  revalidatePath('/')
  revalidatePath('/sermons')
  revalidatePath('/sermon/[id]', 'page')
}
