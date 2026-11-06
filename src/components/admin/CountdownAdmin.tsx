'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, LoaderCircle, RefreshCw, Timer } from 'lucide-react'
import { countdownEvent, defaultCountdownInvitation, type CountdownSettings } from '@/lib/countdown'
import { destinyConference, programmeStartsAt, programmeToday } from '@/lib/event-schedule'
import { eventDetails } from '@/lib/event-details'
import type { ChurchEvent } from '@/lib/events'
import { CountdownPanel } from '@/components/announcements/DestinyCountdown'
import Select from '@/components/ui/Select'
import styles from './admin.module.css'
import countdownStyles from './countdown-admin.module.css'

function initialDraft(settings: CountdownSettings | null, events: ChurchEvent[]): CountdownSettings {
  return settings ?? { enabled: Boolean(destinyConference(events)), eventId: destinyConference(events)?.id ?? '', invitation: defaultCountdownInvitation }
}

export default function CountdownAdmin({ initialSettings, initialEvents, initialError, cloudinaryReady }: {
  initialSettings: CountdownSettings | null; initialEvents: ChurchEvent[]; initialError: string; cloudinaryReady: boolean
}) {
  const router = useRouter()
  const [events, setEvents] = useState(initialEvents)
  const [draft, setDraft] = useState(() => initialDraft(initialSettings, initialEvents))
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState(initialError)
  const [unavailable, setUnavailable] = useState(Boolean(initialError))
  const [success, setSuccess] = useState('')
  const selected = events.find((event) => event.id === draft.eventId)
  const eligible = countdownEvent(events, { ...draft, enabled: true })
  const start = selected ? programmeStartsAt(selected) : null
  const details = selected ? eventDetails(selected) : null
  const disabled = Boolean(busy) || unavailable || !cloudinaryReady
  const options = [
    { value: '', label: 'Choose a programme' },
    ...[...events].sort((a, b) => a.date.localeCompare(b.date)).map((event) => ({ value: event.id, label: eventDetails(event).title,
      description: `${event.date} · ${event.time || 'Start time needed'}${event.date < programmeToday() ? ' · Past — hidden automatically' : ''}` })),
    ...(draft.eventId && !selected ? [{ value: draft.eventId, label: 'Previously selected programme is no longer available' }] : []),
  ]
  function change(fields: Partial<CountdownSettings>) { setDraft((current) => ({ ...current, ...fields })); setDirty(true); setSuccess('') }
  async function request(init?: RequestInit) {
    const response = await fetch('/api/admin/countdown', { ...init, cache: 'no-store', signal: AbortSignal.timeout(60000) })
    const result = await response.json()
    if (response.status === 401) router.refresh()
    if (!response.ok) throw new Error(result.error || 'The countdown settings could not be saved.')
    return result
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (disabled) return
    setBusy('Saving…'); setError(''); setSuccess('')
    try {
      const result = await request({ method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) })
      setDraft(result.settings); setDirty(false)
      setSuccess(result.settings.enabled ? 'Countdown saved. Public pages pick up changes within a minute.' : 'Countdown hidden. Public pages pick up the change within a minute.')
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'The countdown could not be saved.') }
    finally { setBusy('') }
  }
  async function refresh() {
    if (busy) return
    setBusy('Refreshing…'); setError(''); setSuccess('')
    try {
      const result = await request()
      setEvents(result.events); setUnavailable(false)
      if (!dirty) setDraft(initialDraft(result.settings, result.events))
      setSuccess(dirty ? 'Programme list refreshed. Your unsaved changes are kept.' : 'Countdown settings refreshed.')
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'The countdown could not be loaded.') }
    finally { setBusy('') }
  }
  return <section className={styles.uploadPanel} aria-labelledby="countdown-heading">
    <div className={styles.panelHeading}>
      <div><span className={styles.eyebrow}>COUNTDOWN CONTROL</span><h2 id="countdown-heading">Make the next <em>gathering known.</em></h2></div>
      <button type="button" className={styles.textButton} onClick={() => void refresh()} disabled={Boolean(busy)}><RefreshCw size={16} className={busy === 'Refreshing…' ? styles.spinning : undefined} aria-hidden="true" /> Refresh</button>
    </div>
    {!cloudinaryReady && <p className={styles.notice}>Connect Cloudinary before saving countdown settings.</p>}
    {unavailable && <p className={styles.notice}>Saved settings could not be confirmed. Refresh successfully before making changes.</p>}
    <form onSubmit={save}>
      <fieldset disabled={disabled} className={styles.uploadFields}>
        <legend className="sr-only">Countdown settings</legend>
        <div className={styles.detailsFields}>
          <div><label htmlFor="countdown-display">Display</label><Select id="countdown-display" value={draft.enabled ? 'show' : 'hide'} onChange={(value) => change({ enabled: value === 'show' })} options={[{ value: 'show', label: 'Show countdown' }, { value: 'hide', label: 'Hide countdown' }]} menuLabel="Countdown visibility" /></div>
          <div><label htmlFor="countdown-event">Programme {draft.enabled && <span>(required)</span>}</label><Select id="countdown-event" value={draft.eventId} onChange={(eventId) => change({ eventId })} options={options} required={draft.enabled} menuLabel="Choose a programme" />
            <p className={styles.fieldHint}>The title, theme, date, and time come from <Link href="/admin/events">Events</Link>. Update them there, then refresh this list.</p></div>
          <div><label htmlFor="countdown-invitation">Invitation message</label><textarea id="countdown-invitation" value={draft.invitation} onChange={(event) => change({ invitation: event.target.value })} rows={3} maxLength={120} placeholder={defaultCountdownInvitation} /></div>
          {selected && (!eligible || start === null) && <p className={styles.notice}>{!eligible ? 'This programme has passed. Choose an upcoming programme to show a countdown.' : 'Add a start time in Events, such as 5:30 PM or 17:30 (Abuja time).'}</p>}
          <p className={styles.uploadNote}>One countdown appears across public pages. It hides automatically after the programme date ends in Abuja time. Choose a different programme here whenever you are ready for the next countdown.</p>
          <button type="submit" className={styles.primaryButton} disabled={disabled || (draft.enabled && (!eligible || start === null))}>{busy ? <LoaderCircle size={17} className={styles.spinning} aria-hidden="true" /> : <Check size={17} aria-hidden="true" />}{busy || 'Save countdown'}</button>
        </div>
        <div className={countdownStyles.previewPane}>
          <span className={styles.eyebrow}>DRAFT PREVIEW</span>
          <p className={styles.fieldHint}>Review the TV messages and timer before saving. {draft.enabled ? '' : 'The public countdown is hidden when you save this setting.'}</p>
          {selected && eligible && start !== null && details ? <CountdownPanel preview start={start} title={details.title} theme={details.theme} invitation={draft.invitation.trim() || defaultCountdownInvitation} />
            : <div className={countdownStyles.placeholder}><Timer size={32} strokeWidth={1.3} aria-hidden="true" /><p>Choose an upcoming programme with a start time to preview its countdown.</p></div>}
        </div>
      </fieldset>
      {error && <p className={styles.error} role="alert">{error}</p>}
      {success && <p className={styles.success} role="status"><Check size={18} aria-hidden="true" />{success}</p>}
    </form>
  </section>
}
