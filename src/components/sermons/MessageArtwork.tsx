import Image from 'next/image'
import { BookOpen, Sprout } from 'lucide-react'
import { seriesTone } from '@/lib/sermons'
import styles from './sermons.module.css'

export default function MessageArtwork({
  series,
  title,
  imageUrl,
  large = false,
  eager = false,
}: {
  series: string
  title: string
  imageUrl?: string
  large?: boolean
  eager?: boolean
}) {
  return (
    <div
      className={`${styles.artwork} ${large ? styles.artworkLarge : ''}`}
      data-tone={seriesTone(series)}
      aria-hidden="true"
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          fill
          unoptimized
          loading={eager ? 'eager' : 'lazy'}
          sizes={
            large
              ? '(max-width: 760px) 100vw, 65vw'
              : '(max-width: 760px) 100vw, 33vw'
          }
          className={styles.cover}
        />
      ) : (
        <>
          <span className={styles.artworkBrand}>
            <Sprout size={17} strokeWidth={1.2} /> ELIM{' '}
            <span>{series ? 'MESSAGE SERIES' : 'MESSAGE'}</span>
          </span>
          <span className={styles.artworkTitle}>{series || title}</span>
          <span className={styles.artworkFoot}>
            ROOTED IN THE WORD. GROWING IN FAITH.
          </span>
          <BookOpen className={styles.artworkIcon} strokeWidth={0.6} />
        </>
      )}
    </div>
  )
}
