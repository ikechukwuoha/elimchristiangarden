'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Youtube, LoaderCircle } from 'lucide-react'
import MessageMetadataFields, { emptyMessageDetails } from './MessageMetadataFields'
import styles from './admin.module.css'

export default function YoutubeMessageAdmin({ cloudinaryReady }: { cloudinaryReady: boolean }) {
  const router = useRouter()
  const [videoUrl, setVideoUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [details, setDetails] = useState(emptyMessageDetails)
  const [busy, setBusy] = useState(false)
  const [readingTitle, setReadingTitle] = useState(false)
  const [error, setError] = useState('')
  const [published, setPublished] = useState<{ id: string; title: string } | null>(null)

  async function readVideoTitle() {
    setReadingTitle(true)
    setError('')
    try {
      const response = await fetch('/api/admin/messages/preview', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl }), signal: AbortSignal.timeout(12000),
      })
      const result = await response.json()
      if (response.status === 401) router.refresh()
      if (!response.ok) throw new Error(result.error || 'Could not read the video title.')
      setTitle(result.title)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not read the video title. Enter it yourself.')
    } finally {
      setReadingTitle(false)
    }
  }

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || readingTitle) return
    setBusy(true)
    setError('')
    setPublished(null)
    try {
      const response = await fetch('/api/admin/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl, title, description, ...details }),
        signal: AbortSignal.timeout(20000),
      })
      const result = await response.json()
      if (response.status === 401) router.refresh()
      if (!response.ok) throw new Error(result.error || 'Could not publish this message.')
      setPublished(result.message)
      setVideoUrl('')
      setTitle('')
      setDescription('')
      setDetails(emptyMessageDetails)
      router.refresh()
    } catch (error) {
      setError(error instanceof Error && error.name === 'TimeoutError'
        ? 'Publishing took too long. Check the message library before trying again.'
        : error instanceof Error ? error.message : 'Could not publish this message.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className={styles.uploadPanel} aria-labelledby="youtube-heading">
      <div className={styles.panelHeading}>
        <div>
          <h2 id="youtube-heading"><Youtube size={22} aria-hidden="true" /> Publish a YouTube message</h2>
          <p>Share a recording on the Messages page. Publishing the same video updates its entry.</p>
        </div>
      </div>
      <form onSubmit={publish}>
        <fieldset className={styles.uploadFields} disabled={busy || readingTitle || !cloudinaryReady}>
          <div className={styles.detailsFields}>
            <div>
              <label htmlFor="youtube-url">YouTube video link <span>(required)</span></label>
              <input id="youtube-url" type="url" value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} required maxLength={1000} />
              <button className={styles.secondaryButton} type="button" onClick={readVideoTitle} disabled={!videoUrl.trim()}>
                {readingTitle ? 'Reading title…' : 'Use title from YouTube'}
              </button>
            </div>
            <div>
              <label htmlFor="youtube-title">Message title <span>(required)</span></label>
              <input id="youtube-title" value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={120} />
            </div>
            <div>
              <label htmlFor="youtube-description">Description <span>(optional)</span></label>
              <textarea id="youtube-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={4} maxLength={500} />
            </div>
            <p className={styles.fieldHint}>Use a public or unlisted video that allows embedding so visitors can watch it on the site.</p>
            <button className={styles.primaryButton} type="submit">
              {busy && <LoaderCircle size={18} aria-hidden="true" />} {busy ? 'Publishing…' : 'Publish message'}
            </button>
          </div>
          <div className={styles.detailsFields}>
            <MessageMetadataFields value={details} onChange={setDetails} prefix="youtube" />
          </div>
        </fieldset>
      </form>
      {!cloudinaryReady && <p className={styles.notice}>Configure media storage to publish YouTube messages.</p>}
      {error && <p className={styles.error} role="alert">{error}</p>}
      {published && <p className={styles.success} role="status">{published.title} published. <Link href={`/sermon/${published.id}`}>View message</Link></p>}
    </section>
  )
}
