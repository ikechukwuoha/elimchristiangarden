import 'server-only'
import { unstable_cache } from 'next/cache'
import type { CommunityGroup } from './community'
import { listGroupCover } from './gallery'

const uploadedCoverFor = (group: string) =>
  unstable_cache(
    () => listGroupCover(group),
    ['community-uploaded-cover', group],
    { revalidate: 600, tags: ['gallery', 'community-groups'] },
  )()

// An explicit group image takes priority. Otherwise, use an uploaded gallery
// photo so a group added without a cover can still show its own photograph.
export async function communityWithPhotos(groups: CommunityGroup[]): Promise<CommunityGroup[]> {
  return Promise.all(groups.map(async (group) => {
    if (group.image) return group
    try {
      const photo = await uploadedCoverFor(group.id)
      return photo ? {
        ...group,
        image: photo.url,
        alt: photo.description || photo.title || group.alt,
      } : group
    } catch {
      // Keep the group visible even if its gallery cannot be reached.
      return group
    }
  }))
}
