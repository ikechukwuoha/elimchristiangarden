import 'server-only'
import { unstable_cache } from 'next/cache'
import { readGroups, seedGroups } from './community'
import { cloudinaryConfig } from './admin/cloudinary'

// Cached for ten minutes and invalidated by tag whenever a group is added or
// removed, so public pages stay fast without waiting on Cloudinary.
export async function cachedGroups() {
  if (!cloudinaryConfig()) return seedGroups
  try {
    return await unstable_cache(() => readGroups({ strict: true }), ['community-groups', 'stored'], {
      revalidate: 600,
      tags: ['community-groups'],
    })()
  } catch {
    // A temporary storage failure must not cache the seed IDs over saved groups.
    return seedGroups
  }
}
