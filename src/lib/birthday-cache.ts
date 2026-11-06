import 'server-only'
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import { cloudinaryConfig } from './admin/cloudinary'
import { lastGoodBirthdays, readBirthdays } from './birthday-store'

export async function cachedBirthdays() {
  if (!cloudinaryConfig()) return { birthdays: [], unavailable: true }
  try {
    const birthdays = await unstable_cache(readBirthdays, ['birthdays', 'v2'], {
      revalidate: 300, tags: ['birthdays'],
    })()
    return { birthdays, unavailable: false }
  } catch {
    return { birthdays: lastGoodBirthdays(), unavailable: true }
  }
}

export function invalidateBirthdays() {
  revalidateTag('birthdays', { expire: 0 })
  revalidatePath('/admin/birthdays')
}
