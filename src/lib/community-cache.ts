import 'server-only'
import { cache } from 'react'
import { revalidatePath, revalidateTag } from 'next/cache'
import { readGroups, seedGroups } from './community'
import { cloudinaryConfig } from './admin/cloudinary'

// Cache successful Cloudinary responses for ten minutes, and deduplicate the
// read within a render. A failed read is handled here instead of escaping from
// an unstable_cache background refresh into the development error overlay.
const publicGroups = cache(() => readGroups({ strict: true, cacheRead: true }))

export async function cachedGroups(options: { strict?: boolean } = {}) {
  if (!cloudinaryConfig()) return seedGroups
  try {
    return await publicGroups()
  } catch (error) {
    if (options.strict) throw error
    // A temporary storage failure must not cache the seed IDs over saved groups.
    return seedGroups
  }
}

export function invalidateCommunityPages() {
  revalidateTag('community-groups', { expire: 0 })
  revalidatePath('/')
  revalidatePath('/community')
  revalidatePath('/community/[group]', 'page')
  revalidatePath('/gallery')
  revalidatePath('/gallery/[group]', 'page')
  revalidatePath('/admin/fellowships')
  revalidatePath('/admin/media')
}
