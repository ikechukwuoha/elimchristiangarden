'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  CalendarClock,
  Check,
  LoaderCircle,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import type { ChurchEvent } from '@/lib/events'
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
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [busy, setBusy] = useState(false)
  const [removing, setRemoving] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [added, setAdded] = useState('')
  const saved = events.some((event) => event.id === added)

  function resetForm() {
    setTitle('')
    setDate('')
    setTime('')
    setLocation('')
  }

  async function addEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || refreshing) return
    setBusy(true)
    setError('')
    setAdded('')
    try {
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, date, time, location }),
      })
      const result = await response.json()
      if (response.status === 401) router.refresh()
      if (!response.ok)
        throw new Error(result.error || 'This event could not be saved.')
      setEvents(result.events)
      setAdded(result.event.id)
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

  async function removeEvent(event: ChurchEvent) {
    if (removing || busy || refreshing) return
    if (!window.confirm(`Remove “${event.title}” from the ticker?`)) return
    setRemoving(event.id)
    setError('')
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
            <span className={styles.eyebrow}>ADD AN EVENT</span>
            <h2 id="add-heading">
              Something to <em>look forward to.</em>
            </h2>
          </div>
          <CalendarClock size={32} strokeWidth={1.2} aria-hidden="true" />
        </div>
        <form onSubmit={addEvent}>
          <fieldset
            disabled={busy || refreshing || !cloudinaryReady}
            className={styles.uploadFields}
          >
            <legend className="sr-only">Add an upcoming event</legend>
            <div className={styles.detailsFields}>
              <div>
                <label htmlFor="event-title">
                  Event <span>(required)</span>
                </label>
                <input
                  id="event-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                  maxLength={80}
                  placeholder="December thanksgiving service"
                />
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
                Upcoming events scroll beneath the navbar on every page. Past
                dates stop scrolling automatically — remove them here to keep
                the list tidy.
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
                  <Plus size={18} aria-hidden="true" />
                )}
                {busy ? 'Saving…' : 'Add event'}
              </button>
            </div>
          </fieldset>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          {saved && (
            <div className={styles.success} role="status">
              <Check size={21} aria-hidden="true" />
              <div>
                <strong>Event added.</strong>
                <span>It now scrolls in the events bar across the site.</span>
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
              .map((event) => (
                <article className={styles.groupRow} key={event.id}>
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
                    <h3>{event.title}</h3>
                    <p>
                      {[event.time, event.location].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => removeEvent(event)}
                    disabled={Boolean(removing) || busy || refreshing}
                    aria-label={`Remove ${event.title}`}
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
                </article>
              ))}
          </div>
        )}
      </section>
    </>
  )
}
