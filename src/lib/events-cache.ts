import 'server-only'
import { cache } from 'react'
import { revalidatePath, revalidateTag } from 'next/cache'
import { lastGoodEvents, readEvents } from './events'

// Deduplicate reads within a render. Cache successful upstream responses in
// production; development reads stay in the foreground so their handled
// failures cannot escape an unstable_cache background job into the overlay.
const publicEvents = cache(() => readEvents({ strict: true, cacheRead: true }))

export async function cachedEvents(
  options: { strict?: boolean } = {},
) {
  try {
    return await publicEvents()
  } catch (error) {
    if (options.strict) throw error
    return lastGoodEvents()
  }
}

export function invalidateEventPages() {
  revalidateTag('events', { expire: 0 })
  revalidatePath('/admin/events')
}
