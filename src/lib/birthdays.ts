// The original birthday calendar also stores recurring anniversaries. Keep the
// existing record/photo paths so previously published birthdays remain valid.
export type CelebrationKind = 'birthday' | 'anniversary'

export type Birthday = {
  id: string
  kind?: CelebrationKind // Records published before anniversaries are birthdays.
  name: string
  month: number
  day: number
  message: string
  photoId: string
  photoUrl: string
}

export const birthdayMonths = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export const birthdayBlessing = 'May God fill your new year with joy, grace, and beautiful blessings.'
export const anniversaryBlessing = 'May God bless this beautiful milestone with renewed love, joy, and grace.'

export function celebrationKind(item: Birthday): CelebrationKind {
  return item.kind ?? 'birthday'
}

export function celebrationSummary(items: Birthday[]) {
  const birthday = items.some((item) => celebrationKind(item) === 'birthday')
  const anniversary = items.some((item) => celebrationKind(item) === 'anniversary')
  return birthday && anniversary ? 'Birthdays & anniversaries' : anniversary ? 'Anniversaries' : 'Birthdays'
}

export function daysInBirthdayMonth(month: number) {
  // Leap-day birthdays belong to February every year; no birth year is stored.
  return [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1] ?? 0
}

export function birthdayPeriod(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Lagos', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now)
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? ''
  const month = Number(part('month'))
  return { key: `${part('year')}-${part('month')}`, month, day: Number(part('day')), label: birthdayMonths[month - 1] }
}

export function monthlyBirthdays(items: Birthday[], month: number) {
  return items.filter((item) => item.month === month)
    .sort((a, b) => a.day - b.day || a.name.localeCompare(b.name))
}

export function validBirthdayPhoto(photoId: unknown, photoUrl: unknown, cloudName: string) {
  if (typeof photoId !== 'string' || !/^elim\/birthdays\/[a-f0-9-]{36}$/.test(photoId)) return false
  if (typeof photoUrl !== 'string') return false
  try {
    const url = new URL(photoUrl)
    const path = url.pathname.replace(/\/v\d+\//, '/')
    return url.origin === 'https://res.cloudinary.com' && !url.username && !url.password && !url.search && !url.hash &&
      ['jpg', 'jpeg', 'png', 'webp'].some((format) => path === `/${cloudName}/image/upload/${photoId}.${format}`)
  } catch {
    return false
  }
}

export function parseBirthdayInput(value: unknown, cloudName: string): Omit<Birthday, 'id'> {
  if (!value || typeof value !== 'object') throw new Error('Enter the celebrant’s details.')
  const data = value as Record<string, unknown>
  const kind = data.kind === undefined ? 'birthday' : data.kind
  if (kind !== 'birthday' && kind !== 'anniversary') throw new Error('Choose Birthday or Anniversary.')
  const name = typeof data.name === 'string' ? data.name.trim() : ''
  if (!name || name.length > 80) throw new Error('Enter a name between 1 and 80 characters, including any title.')
  const { month, day } = data
  if (typeof month !== 'number' || !Number.isInteger(month) || month < 1 || month > 12 ||
    typeof day !== 'number' || !Number.isInteger(day) || day < 1 || day > daysInBirthdayMonth(month)) {
    throw new Error('Choose a valid celebration month and day.')
  }
  const message = typeof data.message === 'string' ? data.message.trim() : ''
  if (message.length > 240) throw new Error('Keep the celebration blessing within 240 characters.')
  if (!validBirthdayPhoto(data.photoId, data.photoUrl, cloudName)) throw new Error('Upload a celebration photo before publishing.')
  return { kind, name, month, day, message, photoId: data.photoId as string, photoUrl: data.photoUrl as string }
}

export function isBirthdayArray(value: unknown, cloudName: string): value is Birthday[] {
  if (!Array.isArray(value) || value.length > 500) return false
  const ids = new Set<string>()
  return value.every((item) => {
    if (!item || typeof item.id !== 'string' || !/^[a-f0-9-]{36}$/.test(item.id) || ids.has(item.id)) return false
    ids.add(item.id)
    try { parseBirthdayInput(item, cloudName); return true } catch { return false }
  })
}
