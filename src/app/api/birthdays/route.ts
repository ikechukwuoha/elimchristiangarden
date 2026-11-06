import { cachedBirthdays } from '@/lib/birthday-cache'
import { birthdayPeriod, visibleCelebrations } from '@/lib/birthdays'
import { cachedEvents } from '@/lib/events-cache'
import { lastGoodEvents } from '@/lib/events'
import { upcomingProgrammes } from '@/lib/popup-items'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const [celebrations, programmes] = await Promise.allSettled([
    cachedBirthdays(), cachedEvents({ strict: true }),
  ])
  const period = birthdayPeriod()
  // Filter after reading the cached records so eligibility changes at midnight,
  // independently of the storage cache's lifetime.
  const birthdays = visibleCelebrations(celebrations.status === 'fulfilled' ? celebrations.value.birthdays : [], period)
  const events = upcomingProgrammes(programmes.status === 'fulfilled' ? programmes.value : lastGoodEvents(), period)
  const unavailableSources = [
    ...(celebrations.status === 'rejected' || celebrations.value.unavailable ? ['celebrations'] : []),
    ...(programmes.status === 'rejected' ? ['events'] : []),
  ]
  const unavailable = unavailableSources.length > 0
  return Response.json({ period, birthdays, events, unavailable, unavailableSources }, {
    status: unavailable && birthdays.length === 0 && events.length === 0 ? 503 : 200,
    headers: { 'Cache-Control': 'no-store' },
  })
}
