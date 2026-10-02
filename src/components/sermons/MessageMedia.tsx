'use client'

import { useState } from 'react'
import { ArrowUpRight, Download, Headphones, Video } from 'lucide-react'
import { whatsappLink } from '@/app/data/church'
import { youtubeEmbedUrl } from '@/lib/sermons'
import type { Sermon } from '@/lib/messages'
import MessageArtwork from './MessageArtwork'
import styles from './sermons.module.css'

export default function MessageMedia({ sermon }: { sermon: Sermon }) {
  const embedUrl = youtubeEmbedUrl(sermon.videoUrl)
  const [mode, setMode] = useState<'video' | 'audio'>(
    embedUrl ? 'video' : 'audio',
  )
  const [audioError, setAudioError] = useState(false)
  const requestUrl = whatsappLink(
    `Hello! Please I would like the recording "${sermon.title}".`,
  )
  const available = Boolean(embedUrl || sermon.audioUrl)

  return (
    <section className={styles.mediaPanel} aria-label="Message recording">
      {embedUrl && sermon.audioUrl && (
        <div className={styles.mediaTabs}>
          <button
            type="button"
            aria-pressed={mode === 'video'}
            onClick={() => setMode('video')}
          >
            <Video size={16} aria-hidden="true" />
            Watch
          </button>
          <button
            type="button"
            aria-pressed={mode === 'audio'}
            onClick={() => setMode('audio')}
          >
            <Headphones size={16} aria-hidden="true" />
            Listen
          </button>
        </div>
      )}
      {embedUrl && mode === 'video' ? (
        <iframe
          className={styles.videoFrame}
          src={embedUrl}
          title={`Watch ${sermon.title}`}
          allow="encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <MessageArtwork
          title={sermon.title}
          series={sermon.series}
          imageUrl={sermon.imageUrl}
          large
          eager
        />
      )}
      <div className={styles.recordingStatus}>
        {sermon.audioUrl && mode === 'audio' && !audioError ? (
          <div className={styles.audioPlayer}>
            <span>LISTEN TO THE MESSAGE</span>
            <audio
              controls
              preload="metadata"
              src={sermon.audioUrl}
              onError={() => setAudioError(true)}
              aria-label={`Listen to ${sermon.title}`}
            />
            {sermon.downloadable && (
              <a href={sermon.audioUrl} download className={styles.textLink}>
                <Download size={16} aria-hidden="true" />
                Download audio
              </a>
            )}
          </div>
        ) : !available || (audioError && mode === 'audio') ? (
          <>
            <span className={styles.recordingIcon}>
              <Headphones size={22} strokeWidth={1.4} aria-hidden="true" />
            </span>
            <div>
              <h2>
                {audioError
                  ? 'The recording could not be loaded'
                  : 'Recording not available yet'}
              </h2>
              <p>
                {audioError
                  ? 'Please try again later or ask our team for a copy.'
                  : 'You can explore the message and Scripture below, or ask our team for the recording.'}
              </p>
              <a
                href={requestUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Request this recording{' '}
                <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            </div>
          </>
        ) : (
          <a href={sermon.videoUrl} target="_blank" rel="noopener noreferrer" className={styles.textLink}>
            Open on YouTube <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        )}
      </div>
    </section>
  )
}
