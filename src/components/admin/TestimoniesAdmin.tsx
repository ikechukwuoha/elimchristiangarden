'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  Check,
  LoaderCircle,
  MessageSquareHeart,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import type { Testimony } from '@/lib/testimonies'
import styles from './admin.module.css'

export default function TestimoniesAdmin({
  initialTestimonies,
  cloudinaryReady,
}: {
  initialTestimonies: Testimony[]
  cloudinaryReady: boolean
}) {
  const router = useRouter()
  const [testimonies, setTestimonies] = useState(initialTestimonies)
  const [quote, setQuote] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [busy, setBusy] = useState(false)
  const [removing, setRemoving] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [added, setAdded] = useState('')
  const saved = testimonies.some((testimony) => testimony.id === added)

  function resetForm() {
    setQuote('')
    setName('')
    setRole('')
  }

  async function addTestimony(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || refreshing) return
    setBusy(true)
    setError('')
    setAdded('')
    try {
      const response = await fetch('/api/admin/testimonies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote, name, role }),
      })
      const result = await response.json()
      if (response.status === 401) router.refresh()
      if (!response.ok)
        throw new Error(result.error || 'This testimony could not be saved.')
      setTestimonies(result.testimonies)
      setAdded(result.testimony.id)
      resetForm()
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'This testimony could not be saved.',
      )
    } finally {
      setBusy(false)
    }
  }

  async function removeTestimony(testimony: Testimony) {
    if (removing || busy || refreshing) return
    if (!window.confirm(`Remove the testimony from ${testimony.name}?`)) return
    setRemoving(testimony.id)
    setError('')
    try {
      const response = await fetch('/api/admin/testimonies', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: testimony.id }),
      })
      const result = await response.json()
      if (response.status === 401) router.refresh()
      if (!response.ok)
        throw new Error(result.error || 'This testimony could not be removed.')
      setTestimonies(result.testimonies)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'This testimony could not be removed.',
      )
    } finally {
      setRemoving('')
    }
  }

  async function refreshTestimonies() {
    if (busy || removing || refreshing) return
    setRefreshing(true)
    setError('')
    try {
      const response = await fetch('/api/admin/testimonies', {
        cache: 'no-store',
      })
      const result = await response.json()
      if (response.status === 401) router.refresh()
      if (!response.ok)
        throw new Error(result.error || 'The testimony list could not be loaded.')
      setTestimonies(result.testimonies)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'The testimony list could not be loaded.',
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
            <span className={styles.eyebrow}>SHARE A TESTIMONY</span>
            <h2 id="add-heading">
              Tell of His <em>goodness.</em>
            </h2>
          </div>
          <MessageSquareHeart size={32} strokeWidth={1.2} aria-hidden="true" />
        </div>
        <form onSubmit={addTestimony}>
          <fieldset
            disabled={busy || refreshing || !cloudinaryReady}
            className={styles.uploadFields}
          >
            <legend className="sr-only">Add a testimony</legend>
            <div className={styles.detailsFields}>
              <div>
                <label htmlFor="testimony-quote">
                  Testimony <span>(required)</span>
                </label>
                <textarea
                  id="testimony-quote"
                  value={quote}
                  onChange={(event) => setQuote(event.target.value)}
                  required
                  minLength={20}
                  maxLength={1200}
                  rows={6}
                  placeholder="What did God do? Share the story in the person's own words."
                />
                <p className={styles.fieldHint}>
                  Between 20 and 1200 characters.
                </p>
              </div>
            </div>
            <div className={styles.detailsFields}>
              <div>
                <label htmlFor="testimony-name">
                  Name <span>(required)</span>
                </label>
                <input
                  id="testimony-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  maxLength={60}
                  placeholder="Sarah M."
                />
              </div>
              <div>
                <label htmlFor="testimony-role">
                  Description <span>(optional)</span>
                </label>
                <input
                  id="testimony-role"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  maxLength={80}
                  placeholder="Member since 2018"
                />
              </div>
              <p className={styles.uploadNote}>
                New testimonies appear on the public testimonies page straight
                away.
              </p>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={busy || !quote.trim() || !name.trim()}
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
                {busy ? 'Saving…' : 'Add testimony'}
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
                <strong>Testimony added.</strong>
                <span>
                  It is now live on the testimonies page for everyone to read.
                </span>
              </div>
            </div>
          )}
        </form>
      </section>

      <section className={styles.library} aria-labelledby="list-heading">
        <div className={styles.libraryHeading}>
          <div>
            <span className={styles.eyebrow}>PUBLISHED TESTIMONIES</span>
            <h2 id="list-heading">
              Every testimony <em>matters.</em>
            </h2>
          </div>
          <button
            type="button"
            className={styles.textButton}
            onClick={() => void refreshTestimonies()}
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
        {testimonies.length === 0 ? (
          <div className={styles.empty}>
            <MessageSquareHeart size={32} strokeWidth={1.2} aria-hidden="true" />
            <h3>No testimonies yet.</h3>
            <p>Add the first testimony above.</p>
          </div>
        ) : (
          <div className={styles.groupList}>
            {testimonies.map((testimony) => (
              <article
                className={styles.groupRow}
                key={testimony.id}
              >
                <div className={styles.groupRowCopy}>
                  <h3>{testimony.name}</h3>
                  <p>
                    {testimony.role}
                    {testimony.role ? ' · ' : ''}
                    {testimony.quote.length > 110
                      ? `${testimony.quote.slice(0, 110)}…`
                      : testimony.quote}
                  </p>
                </div>
                <a
                  href="/testimonies"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.textButton}
                >
                  View page
                </a>
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => removeTestimony(testimony)}
                  disabled={Boolean(removing) || busy || refreshing}
                  aria-label={`Remove testimony from ${testimony.name}`}
                >
                  {removing === testimony.id ? (
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
