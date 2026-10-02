import 'server-only'
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import { cloudinaryConfig } from './admin/cloudinary'
import { readEvents } from './events'

// Cached briefly and invalidated by tag whenever an event changes. The
// ticker renders on every public page, so failures fall back to no events
// (the ticker then shows the Sunday invitation) rather than erroring pages.
export async function cachedEvents(
  options: { strict?: boolean } = {},
) {
  if (!cloudinaryConfig()) return []
  try {
    return await unstable_cache(() => readEvents({ strict: true }), ['events', 'stored-v1'], {
      revalidate: 300,
      tags: ['events'],
    })()
  } catch (error) {
    if (options.strict) throw error
    return []
  }
}

export function invalidateEventPages() {
  revalidateTag('events', { expire: 0 })
  revalidatePath('/admin/events')
}
