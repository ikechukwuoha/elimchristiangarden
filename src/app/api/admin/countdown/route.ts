import { isAdmin, json, readSmallJson, sameOrigin } from '@/lib/admin/auth'
import { logAdminEvent } from '@/lib/admin/audit'
import { parseCountdownSettings, validateCountdownSelection } from '@/lib/countdown'
import { CountdownStorageError, invalidateCountdown, readCountdownSettings, saveCountdownSettings } from '@/lib/countdown-store'
import { EventStorageError, readEvents } from '@/lib/events'

export const runtime = 'nodejs'
export const maxDuration = 60

function failure(error: unknown) {
  return json({ error: error instanceof Error ? error.message : 'The countdown settings could not be saved.' },
    error instanceof CountdownStorageError || error instanceof EventStorageError ? error.status : 400)
}

export async function GET() {
  if (!(await isAdmin())) return json({ error: 'Your session has expired. Please sign in again.' }, 401)
  try {
    const [settings, events] = await Promise.all([readCountdownSettings(), readEvents({ strict: true })])
    return json({ settings, events })
  } catch (error) { return failure(error) }
}

export async function PUT(request: Request) {
  if (!sameOrigin(request)) return json({ error: 'This request is not allowed.' }, 403)
  if (!(await isAdmin())) return json({ error: 'Your session has expired. Please sign in again.' }, 401)
  try {
    const settings = parseCountdownSettings(await readSmallJson(request))
    if (settings.enabled) validateCountdownSelection(settings, await readEvents({ strict: true }))
    await saveCountdownSettings(settings)
    invalidateCountdown()
    logAdminEvent('countdown_saved', { enabled: settings.enabled, eventId: settings.eventId })
    return json({ settings })
  } catch (error) { return failure(error) }
}
