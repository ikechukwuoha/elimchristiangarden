import type { ChurchEvent } from './events'
import { destinyConference, programmeStartsAt, upcomingProgrammes } from './event-schedule'
import { birthdayPeriod } from './birthdays'

export type CountdownSettings = { enabled: boolean; eventId: string; invitation: string }
export const defaultCountdownInvitation = 'Don’t miss out.'

export function parseCountdownSettings(value: unknown): CountdownSettings {
  if (!value || typeof value !== 'object') throw new Error('Enter the countdown settings.')
  const input = value as Record<string, unknown>
  if (typeof input.enabled !== 'boolean') throw new Error('Choose whether to show the countdown.')
  if (typeof input.eventId !== 'string' || input.eventId.length > 80 || (input.enabled && !input.eventId.trim()))
    throw new Error('Choose a programme for the countdown.')
  if (typeof input.invitation !== 'string' || input.invitation.length > 120)
    throw new Error('Keep the invitation message within 120 characters.')
  return { enabled: input.enabled, eventId: input.eventId.trim(), invitation: input.invitation.trim() || defaultCountdownInvitation }
}

export function countdownEvent(events: ChurchEvent[], settings: CountdownSettings | null, now = new Date()) {
  // Preserve the existing conference until the first settings save. After
  // that, only the explicitly selected programme may display a countdown.
  if (settings === null) return destinyConference(events, now)
  if (!settings.enabled) return undefined
  return upcomingProgrammes(events, birthdayPeriod(now)).find((event) => event.id === settings.eventId)
}

export function validateCountdownSelection(settings: CountdownSettings, events: ChurchEvent[], now = new Date()) {
  if (!settings.enabled) return
  const event = countdownEvent(events, settings, now)
  if (!event) throw new Error('Choose an upcoming programme from Events before showing the countdown.')
  if (programmeStartsAt(event) === null) throw new Error('Add a valid start time to this programme in Events, such as 5:30 PM or 17:30.')
}
