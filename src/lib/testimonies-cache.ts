import 'server-only'
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import { cloudinaryConfig } from './admin/cloudinary'
import { readTestimonies, seedTestimonies } from './testimonies'

// Cached for five minutes and invalidated by tag whenever a testimony is
// added or removed, so public pages stay fast without waiting on Cloudinary.
export async function cachedTestimonies(
  options: { strict?: boolean } = {},
) {
  if (!cloudinaryConfig()) return seedTestimonies
  try {
    return await unstable_cache(
      () => readTestimonies({ strict: true }),
      ['testimonies', 'stored-v1'],
      { revalidate: 300, tags: ['testimonies'] },
    )()
  } catch (error) {
    if (options.strict) throw error
    return seedTestimonies
  }
}

export function invalidateTestimonyPages() {
  revalidateTag('testimonies', { expire: 0 })
  revalidatePath('/testimonies')
  revalidatePath('/admin/testimonies')
}
