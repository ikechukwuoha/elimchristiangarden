import 'server-only'
import { unstable_cache } from 'next/cache'
import { listBulletins } from './bulletins'

// Match the site's existing cache setup without enabling Cache Components
// for every route. Admin uploads invalidate this entry after they finish.
export const cachedBulletins = unstable_cache(listBulletins, ['bulletins', 'uploaded-only-v3'], {
  revalidate: 60,
  tags: ['bulletins'],
})
