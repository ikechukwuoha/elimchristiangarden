'use client'

import { useState } from 'react'
import { Bookmark, Check, Share2 } from 'lucide-react'
import useSavedMessages from './useSavedMessages'
import styles from './sermons.module.css'

export default function MessageActions({
  id,
  title,
}: {
  id: string
  title: string
}) {
  const { savedIds, toggleSaved } = useSavedMessages()
  const [status, setStatus] = useState('')
  const [shareUrl, setShareUrl] = useState('')
  const saved = savedIds.includes(id)

  async function share() {
    const url = new URL(`/sermon/${id}`, window.location.origin).href
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        setStatus('Message shared.')
        return
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setShareUrl('')
      setStatus('Link copied. Ready to share.')
    } catch {
      setShareUrl(url)
      setStatus('Copy the link below to share this message.')
    }
  }

  return (
    <div className={styles.actionsWrap}>
      <div className={styles.actions}>
        <button
          type="button"
          aria-pressed={saved}
          onClick={() =>
            setStatus(
              toggleSaved(id)
                ? saved
                  ? 'Removed from your saved messages.'
                  : 'Saved on this device. Find it in the message library.'
                : 'This browser could not save the message.',
            )
          }
        >
          {saved ? (
            <Check size={17} aria-hidden="true" />
          ) : (
            <Bookmark size={17} aria-hidden="true" />
          )}
          {saved ? 'Saved' : 'Save message'}
        </button>
        <button type="button" onClick={share}>
          <Share2 size={17} aria-hidden="true" />
          Share message
        </button>
      </div>
      <p className={styles.actionStatus} role="status">
        {status}
      </p>
      {shareUrl && (
        <input
          className={styles.shareInput}
          aria-label="Message link"
          value={shareUrl}
          readOnly
          onFocus={(event) => event.target.select()}
        />
      )}
    </div>
  )
}
