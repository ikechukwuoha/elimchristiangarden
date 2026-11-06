import { cachedBirthdays } from '@/lib/birthday-cache'
import { birthdayPeriod, monthlyBirthdays } from '@/lib/birthdays'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const result = await cachedBirthdays()
  const period = birthdayPeriod()
  const birthdays = monthlyBirthdays(result.birthdays, period.month)
  return Response.json({ period, birthdays, unavailable: result.unavailable }, {
    status: result.unavailable && birthdays.length === 0 ? 503 : 200,
    headers: { 'Cache-Control': 'no-store' },
  })
}
