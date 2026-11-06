import { birthdayPeriod } from './birthdays'
import { eventDetails } from './event-details'
import type { ChurchEvent } from './events'

export function programmeToday(period = birthdayPeriod()) {
  return `${period.key}-${String(period.day).padStart(2, '0')}`
}

export function upcomingProgrammes(events: ChurchEvent[], period = birthdayPeriod()) {
  return events.filter((event) => event.date >= programmeToday(period))
    .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title))
}

// Times entered in Events are local to Abuja (UTC+1), independently of the
// visitor's time zone. Accept the common 12- and 24-hour formats in the form.
export function programmeStartsAt(event: Pick<ChurchEvent, 'date' | 'time'>) {
  const twelve = /^(\d{1,2})(?:[:.](\d{2}))?\s*([ap])\.?m\.?(?=$|\s|[–—-])/i.exec(event.time.trim())
  const twentyFour = /^(\d{1,2}):(\d{2})(?=$|\s*[–—-])/.exec(event.time.trim())
  if (!twelve && !twentyFour) return null
  let hour = Number((twelve ?? twentyFour)![1])
  const minute = Number((twelve ?? twentyFour)![2] ?? 0)
  if (minute > 59 || hour > (twelve ? 12 : 23) || (twelve && hour < 1)) return null
  if (twelve) hour = hour % 12 + (twelve[3].toLowerCase() === 'p' ? 12 : 0)
  const timestamp = Date.parse(`${event.date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+01:00`)
  return Number.isFinite(timestamp) ? timestamp : null
}

export function destinyConference(events: ChurchEvent[], now = new Date()) {
  return upcomingProgrammes(events, birthdayPeriod(now)).find((event) =>
    event.date.startsWith('2026-') && /\bdestiny\s+conference\b/i.test(eventDetails(event).title))
}

export function countdownParts(target: number, now: number) {
  const total = Math.max(0, Math.ceil((target - now) / 1000))
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor(total % 86400 / 3600),
    minutes: Math.floor(total % 3600 / 60),
    seconds: total % 60,
    started: now >= target,
  }
}
