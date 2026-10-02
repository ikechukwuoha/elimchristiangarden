import 'server-only'
import { cache } from 'react'
import { revalidatePath, revalidateTag } from 'next/cache'
import { listMessageLibrary } from './message-store'

// Cross-request caching happens on each successful Cloudinary read. This wrapper
// only deduplicates work within a render and never persists a failed/partial result.
export const cachedMessageLibrary = cache(listMessageLibrary)

export function refreshMessages() {
  revalidateTag('messages', { expire: 0 })
  revalidatePath('/')
  revalidatePath('/sermons')
  revalidatePath('/sermon/[id]', 'page')
}
