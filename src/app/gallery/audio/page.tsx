import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowUpRight,
  AudioLines,
  ChevronRight,
  Clock3,
  MapPin,
} from 'lucide-react'
import { unstable_cache } from 'next/cache'
import Layout from '@/components/Layout'
import { church } from '@/app/data/church'
import { formatGalleryDate, listAudioMedia } from '@/lib/gallery'
import type { MediaAsset } from '@/lib/media'
import styles from '../gallery.module.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Recordings',
  description:
    'Recordings from Elim Christian Garden International — songs and sounds from our gatherings, shared by our media team so you can listen anytime.',
}

// Gallery data is cached for ten minutes so page views don't consume the
// Cloudinary Admin API quota on every visit.
const audioForPage = () =>
  unstable_cache(() => listAudioMedia(), ['gallery-audio', 'page'], {
    revalidate: 600,
    tags: ['gallery'],
  })()

export default async function AudioGalleryPage() {
  let recordings: MediaAsset[] = []
  let unavailable = false
  try {
    recordings = await audioForPage()
  } catch {
    unavailable = true
  }

  return (
    <Layout>
      <div className={styles.gallery}>
        <section className={styles.hero} aria-labelledby="audio-title">
          <div className={styles.container}>
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <ChevronRight size={13} aria-hidden="true" />
              <Link href="/gallery">Gallery</Link>
              <ChevronRight size={13} aria-hidden="true" />
              <span aria-current="page">Recordings</span>
            </nav>
            <div className={styles.heroGrid}>
              <div className={styles.heroCopy}>
                <span className={styles.eyebrow}>
                  <span /> SONGS &amp; RECORDINGS
                </span>
                <h1 id="audio-title">
                  Listen <em>anytime.</em>
                </h1>
                <p>
                  The sounds of our gatherings don’t have to stay behind on
                  Sunday. Press play on any recording and carry the moment with
                  you through the week.
                </p>
                <Link href="/gallery" className={styles.greenButton}>
                  All galleries <ArrowUpRight size={17} aria-hidden="true" />
                </Link>
              </div>
              <div className={styles.heroAside}>
                <AudioLines size={30} strokeWidth={1.2} aria-hidden="true" />
                <span className={styles.smallLabel}>
                  HOW RECORDINGS WORK
                </span>
                <p>
                  Every recording is shared by our media team. Tap play to
                  listen right here, or open the file to save it for later.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className={`${styles.container} ${styles.mediaSections}`}>
          {unavailable && (
            <p className={styles.notice} role="status">
              We couldn’t reach the recordings just now. Please refresh in a
              moment — they are safe.
            </p>
          )}
          {!unavailable && recordings.length === 0 ? (
            <div className={styles.empty}>
              <AudioLines size={32} strokeWidth={1.2} aria-hidden="true" />
              <h3>Nothing to play just yet.</h3>
              <p>
                Recordings shared by our media team will appear here. Check
                back soon.
              </p>
            </div>
          ) : (
            <div className={styles.audioPageList}>
              {recordings.map((recording) => (
                <article
                  className={styles.audioPageCard}
                  key={recording.id}
                >
                  <span className={styles.audioPageIcon}>
                    <AudioLines
                      size={24}
                      strokeWidth={1.3}
                      aria-hidden="true"
                    />
                  </span>
                  <div className={styles.audioPageBody}>
                    <h3>{recording.title}</h3>
                    {recording.description && <p>{recording.description}</p>}
                    <audio
                      controls
                      preload="metadata"
                      src={recording.url}
                      aria-label={`Play ${recording.title}`}
                    />
                    <time dateTime={recording.createdAt}>
                      Shared {formatGalleryDate(recording.createdAt)}
                    </time>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <section
          className={styles.invitation}
          aria-labelledby="invitation-heading"
        >
          <div className={`${styles.container} ${styles.invitationInner}`}>
            <div>
              <span className={styles.eyebrow}>
                <span /> HEAR IT LIVE
              </span>
              <h2 id="invitation-heading">
                Some things are
                <br />
                <em>best in person.</em>
              </h2>
              <div className={styles.visitDetails}>
                <span>
                  <Clock3 size={16} aria-hidden="true" /> Sundays at{' '}
                  {church.sundayTime}
                </span>
                <span>
                  <MapPin size={16} aria-hidden="true" /> Bwari, Abuja
                </span>
              </div>
            </div>
            <div className={styles.invitationActions}>
              <Link href="/#visit" className={styles.greenButton}>
                Plan your visit <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              <Link href="/sermons" className={styles.textLink}>
                Explore our messages <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}
