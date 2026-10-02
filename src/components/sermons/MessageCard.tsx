import Link from 'next/link'
import { ArrowUpRight, Clock3 } from 'lucide-react'
import type { Sermon } from '@/lib/messages'
import { formatSermonDate } from '@/lib/sermons'
import MessageArtwork from './MessageArtwork'
import styles from './sermons.module.css'

export default function MessageCard({ sermon }: { sermon: Sermon }) {
  return (
    <article className={styles.messageCard} data-sermon-id={sermon.id}>
      <Link
        href={`/sermon/${sermon.id}`}
        aria-label={`Explore ${sermon.title}`}
      >
        <div className={styles.cardImage}>
          <MessageArtwork title={sermon.title} series={sermon.series} imageUrl={sermon.imageUrl} />
          <span className={styles.cardArrow}>
            <ArrowUpRight size={20} aria-hidden="true" />
          </span>
        </div>
        <div className={styles.cardCopy}>
          <div className={styles.cardMeta}>
            {sermon.date && <time dateTime={sermon.date}>{formatSermonDate(sermon.date)}</time>}
            {sermon.duration && <span>
              <Clock3 size={12} aria-hidden="true" />
              {sermon.duration}
            </span>}
          </div>
          <h3>{sermon.title}</h3>
          {sermon.preacher.name && <p>{sermon.preacher.name}</p>}
          <div className={styles.cardFoot}>
            <span>{sermon.scripture || (sermon.videoUrl ? 'Watch message' : 'Listen to message')}</span>
            <ArrowUpRight size={17} aria-hidden="true" />
          </div>
        </div>
      </Link>
    </article>
  )
}
