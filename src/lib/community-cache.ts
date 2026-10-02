import 'server-only'
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import { normalizeGroups, readGroups, seedGroups } from './community'
import { cloudinaryConfig } from './admin/cloudinary'

// Cached for ten minutes and invalidated by tag whenever a group is added or
// removed, so public pages stay fast without waiting on Cloudinary.
export async function cachedGroups(options: { strict?: boolean } = {}) {
  if (!cloudinaryConfig()) return seedGroups
  try {
    const groups = await unstable_cache(() => readGroups({ strict: true }), ['community-groups', 'stored-v2'], {
      revalidate: 600,
      tags: ['community-groups'],
    })()
    return normalizeGroups(groups)
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
