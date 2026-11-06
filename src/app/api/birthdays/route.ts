import { cachedBirthdays } from '@/lib/birthday-cache'
import { birthdayPeriod, visibleCelebrations } from '@/lib/birthdays'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const result = await cachedBirthdays()
  const period = birthdayPeriod()
  // Filter after reading the cached records so eligibility changes at midnight,
  // independently of the storage cache's lifetime.
  const birthdays = visibleCelebrations(result.birthdays, period)
  return Response.json({ period, birthdays, unavailable: result.unavailable }, {
    status: result.unavailable && birthdays.length === 0 ? 503 : 200,
    headers: { 'Cache-Control': 'no-store' },
  })
}
