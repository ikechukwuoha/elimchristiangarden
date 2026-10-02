import 'server-only'
import { unstable_cache } from 'next/cache'
import { deliveryUrl, listUploadedImages } from './gallery'

export const cachedHeroPhotos = unstable_cache(async () => {
  const images = await listUploadedImages()
  return images.map((image) => ({
    id: image.id,
    src: deliveryUrl(image.url, 1600),
    alt: image.description || image.title || 'A moment from our church family',
  }))
}, ['hero-uploaded-photos'], { revalidate: 60, tags: ['gallery'] })
