import type { Birthday } from './birthdays'
import { birthdayPeriod, visibleCelebrations } from './birthdays'
import type { ChurchEvent } from './events'

export type PopupItem =
  | { id: string; kind: 'celebration'; celebration: Birthday }
  | { id: string; kind: 'programme'; programme: ChurchEvent }

export function programmeToday(period = birthdayPeriod()) {
  return `${period.key}-${String(period.day).padStart(2, '0')}`
}

export function upcomingProgrammes(events: ChurchEvent[], period = birthdayPeriod()) {
  const today = programmeToday(period)
  return events.filter((event) => event.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title))
}

export function popupItems(birthdays: Birthday[], events: ChurchEvent[], period = birthdayPeriod()): PopupItem[] {
  const celebrations = visibleCelebrations(birthdays, period)
  const programmes = upcomingProgrammes(events, period)
  const items: PopupItem[] = []
  // Alternate the two sources so programmes appear throughout the rotation.
  for (let index = 0; index < Math.max(celebrations.length, programmes.length); index++) {
    if (celebrations[index]) items.push({ id: `celebration:${celebrations[index].id}`, kind: 'celebration', celebration: celebrations[index] })
    if (programmes[index]) items.push({ id: `programme:${programmes[index].id}`, kind: 'programme', programme: programmes[index] })
  }
  return items
}

export function popupDuration(item?: PopupItem) {
  return item?.kind === 'programme' ? 12000 : 6000
}
