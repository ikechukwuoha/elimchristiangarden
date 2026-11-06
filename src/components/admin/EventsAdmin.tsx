'use client'

import { useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  CalendarClock,
  Check,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import type { ChurchEvent } from '@/lib/events'
import { eventDetails } from '@/lib/event-details'
import styles from './admin.module.css'

function formatEventDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export default function EventsAdmin({
  initialEvents,
  cloudinaryReady,
}: {
  initialEvents: ChurchEvent[]
  cloudinaryReady: boolean
}) {
  const router = useRouter()
  const [events, setEvents] = useState(initialEvents)
  const [title, setTitle] = useState('')
  const [theme, setTheme] = useState('')
  const [texts, setTexts] = useState('')
  const [editing, setEditing] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [busy, setBusy] = useState(false)
  const [removing, setRemoving] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const titleInput = useRef<HTMLInputElement>(null)

  function resetForm() {
    setTitle('')
    setTheme('')
    setTexts('')
    setEditing('')
    setDate('')
    setTime('')
    setLocation('')
  }

  async function saveEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || refreshing || removing) return
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      const response = await fetch('/api/admin/events', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editing, title, theme, texts, date, time, location }),
        signal: AbortSignal.timeout(60000),
      })
      const result = await response.json()
      if (response.status === 401) router.refresh()
      if (!response.ok)
        throw new Error(result.error || 'This event could not be saved.')
      setEvents(result.events)
      setSuccess(editing ? 'Event updated.' : 'Event added.')
      resetForm()
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'This event could not be saved.',
      )
    } finally {
      setBusy(false)
    }
  }

  function editEvent(event: ChurchEvent) {
    if (busy || removing || refreshing) return
    const details = eventDetails(event)
    setEditing(event.id)
    setTitle(details.title)
    setTheme(details.theme)
    setTexts(details.texts.join(', '))
    setDate(event.date)
    setTime(event.time)
    setLocation(event.location)
    setError('')
    setSuccess('')
    formRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' })
    titleInput.current?.focus({ preventScroll: true })
  }

  async function removeEvent(event: ChurchEvent) {
    if (removing || busy || refreshing) return
    if (!window.confirm(`Remove “${eventDetails(event).title}” from the events bar and popup?`)) return
    setRemoving(event.id)
    setError('')
    setSuccess('')
    try {
      const response = await fetch('/api/admin/events', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: event.id }),
      })
      const result = await response.json()
      if (response.status === 401) router.refresh()
      if (!response.ok)
        throw new Error(result.error || 'This event could not be removed.')
      setEvents(result.events)
      if (editing === event.id) resetForm()
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'This event could not be removed.',
      )
    } finally {
      setRemoving('')
    }
  }

  async function refreshEvents() {
    if (busy || removing || refreshing) return
    setRefreshing(true)
    setError('')
    try {
      const response = await fetch('/api/admin/events', { cache: 'no-store' })
      const result = await response.json()
      if (response.status === 401) router.refresh()
      if (!response.ok)
        throw new Error(result.error || 'The event list could not be loaded.')
      setEvents(result.events)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'The event list could not be loaded.',
      )
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <>
      {!cloudinaryReady && (
        <p className={styles.notice} role="status">
          Cloudinary hasn’t been connected yet. Ask the site administrator to
          add the Cloudinary credentials before making changes.
        </p>
      )}
      <section className={styles.uploadPanel} aria-labelledby="add-heading">
        <div className={styles.panelHeading}>
          <div>
            <span className={styles.eyebrow}>{editing ? 'EDIT EVENT' : 'ADD AN EVENT'}</span>
            <h2 id="add-heading">
              {editing ? <>Update the <em>programme.</em></> : <>Something to <em>look forward to.</em></>}
            </h2>
          </div>
          <CalendarClock size={32} strokeWidth={1.2} aria-hidden="true" />
        </div>
        <form ref={formRef} onSubmit={saveEvent}>
          <fieldset
            disabled={busy || refreshing || Boolean(removing) || !cloudinaryReady}
            className={styles.uploadFields}
          >
            <legend className="sr-only">{editing ? 'Edit event details' : 'Add an upcoming event'}</legend>
            <div className={styles.detailsFields}>
              <div>
                <label htmlFor="event-title">
                  Event <span>(required)</span>
                </label>
                <input
                  id="event-title"
                  ref={titleInput}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                  maxLength={80}
                  placeholder="December thanksgiving service"
                />
              </div>
              <div>
                <label htmlFor="event-theme">Theme <span>(optional)</span></label>
                <input id="event-theme" value={theme} onChange={(event) => setTheme(event.target.value)}
                  maxLength={160} placeholder="Divine Settlement for a New Beginning" />
              </div>
              <div>
                <label htmlFor="event-texts">Bible passages <span>(optional)</span></label>
                <textarea id="event-texts" value={texts} onChange={(event) => setTexts(event.target.value)}
                  rows={3} maxLength={1600} aria-describedby="event-texts-hint"
                  placeholder="1 Peter 5:10, Psalm 126:1–3" />
                <p id="event-texts-hint" className={styles.fieldHint}>
                  Separate passages with commas. Each reference appears separately beneath the theme. Add up to 12 passages.
                </p>
              </div>
              <div>
                <label htmlFor="event-date">
                  Date <span>(required)</span>
                </label>
                <input
                  id="event-date"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="event-time">
                  Time <span>(optional)</span>
                </label>
                <input
                  id="event-time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  maxLength={40}
                  placeholder="5:30 PM"
                />
              </div>
              <div>
                <label htmlFor="event-location">
                  Location <span>(optional)</span>
                </label>
                <input
                  id="event-location"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  maxLength={80}
                  placeholder="Main sanctuary"
                />
              </div>
              <p className={styles.uploadNote}>
                Upcoming programmes appear in the events bar and the site-wide
                popup. Programme cards stay for 12 seconds, alongside birthday
                and anniversary cards at six seconds each. Past programme dates
                leave the popup automatically — remove them here to keep the list tidy.
              </p>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={busy || !title.trim() || !date}
              >
                {busy ? (
                  <LoaderCircle
                    size={18}
                    className={styles.spinning}
                    aria-hidden="true"
                  />
                ) : (
                  editing ? <Check size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />
                )}
                {busy ? 'Saving…' : editing ? 'Save changes' : 'Add event'}
              </button>
              {editing && <button type="button" className={styles.textButton} onClick={() => { resetForm(); setError(''); setSuccess('') }}>Cancel editing</button>}
            </div>
          </fieldset>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          {success && (
            <div className={styles.success} role="status">
              <Check size={21} aria-hidden="true" />
              <div>
                <strong>{success}</strong>
                <span>Upcoming dates appear in the events bar and the popup across the site.</span>
              </div>
            </div>
          )}
        </form>
      </section>

      <section className={styles.library} aria-labelledby="list-heading">
        <div className={styles.libraryHeading}>
          <div>
            <span className={styles.eyebrow}>ALL EVENTS</span>
            <h2 id="list-heading">
              Marked on the <em>calendar.</em>
            </h2>
          </div>
          <button
            type="button"
            className={styles.textButton}
            onClick={() => void refreshEvents()}
            disabled={refreshing || busy || Boolean(removing)}
          >
            <RefreshCw
              size={16}
              className={refreshing ? styles.spinning : undefined}
              aria-hidden="true"
            />{' '}
            Refresh
          </button>
        </div>
        {events.length === 0 ? (
          <div className={styles.empty}>
            <CalendarClock size={32} strokeWidth={1.2} aria-hidden="true" />
            <h3>No events yet.</h3>
            <p>Add the first event above.</p>
          </div>
        ) : (
          <div className={styles.groupList}>
            {[...events]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((event) => {
                const details = eventDetails(event)
                return (
                  <article className={`${styles.groupRow} ${styles.eventRow}`} key={event.id}>
                    <span
                      className={`${styles.kindBadge} ${
                        event.date < new Date().toISOString().slice(0, 10)
                          ? styles.pastBadge
                          : ''
                      }`}
                    >
                      {formatEventDate(event.date)}
                    </span>
                    <div className={styles.groupRowCopy}>
                      <h3>{details.title}</h3>
                      {details.theme && <p>Theme: {details.theme}</p>}
                      {details.texts.length > 0 && <p>Bible passages: {details.texts.join(' · ')}</p>}
                      <p>
                        {[event.time, event.location].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <div className={styles.eventActions}>
                      <button type="button" className={styles.textButton} onClick={() => editEvent(event)}
                        disabled={Boolean(removing) || busy || refreshing || !cloudinaryReady}
                        aria-label={`Edit ${details.title}`}>
                        <Pencil size={15} aria-hidden="true" /> Edit
                      </button>
                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => removeEvent(event)}
                        disabled={Boolean(removing) || busy || refreshing}
                        aria-label={`Remove ${details.title}`}
                      >
                        {removing === event.id ? (
                          <LoaderCircle
                            size={16}
                            className={styles.spinning}
                            aria-hidden="true"
                          />
                        ) : (
                          <Trash2 size={16} aria-hidden="true" />
                        )}
                        Remove
                      </button>
                    </div>
                  </article>
                )
              })}
          </div>
        )}
      </section>
    </>
  )
}
