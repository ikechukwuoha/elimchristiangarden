import { Suspense } from 'react'
import Link from 'next/link'
import {
  ArrowDown,
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  Clock3,
  Youtube,
} from 'lucide-react'
import Layout from '@/components/Layout'
import SermonLibrary from '@/components/sermons/SermonLibrary'
import MessageArtwork from '@/components/sermons/MessageArtwork'
import { cachedMessageLibrary } from '@/lib/message-cache'
import type { Sermon } from '@/lib/messages'
import { church } from '@/app/data/church'
import { formatSermonDate } from '@/lib/sermons'
import styles from '@/components/sermons/sermons.module.css'

export default async function SermonsPage() {
  let sermons: Sermon[] = []
  let unavailable = false
  try {
    const library = await cachedMessageLibrary()
    sermons = library.messages
    unavailable = library.unavailableSources.length > 0
  } catch {
    unavailable = true
  }
  const featured = sermons[0]
  return (
    <Layout>
      <div className={styles.sermons}>
        <div className={styles.container}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight size={13} aria-hidden="true" />
            <span aria-current="page">Messages</span>
          </nav>
          <header className={styles.archiveIntro}>
            <div>
              <span className={styles.eyebrow}>
                <span /> SERMONS & TEACHING
              </span>
              <h1>
                A word for
                <br />
                <em>your everyday.</em>
              </h1>
            </div>
            <div className={styles.introAside}>
              <BookOpen size={28} strokeWidth={1.2} aria-hidden="true" />
              <p>
                Truth to stand on. Hope to carry with you. Explore messages that
                help you grow in faith, wherever life finds you.
              </p>
              <a href="#message-library" className={styles.textLink}>
                Explore the library <ArrowDown size={17} aria-hidden="true" />
              </a>
            </div>
          </header>
          {featured && <section
            className={styles.featured}
            aria-labelledby="featured-heading"
          >
            <div className={styles.featuredVisual}>
              <MessageArtwork
                title={featured.title}
                series={featured.series}
                imageUrl={featured.imageUrl}
                large
                eager
              />
              <span className={styles.featuredBadge}>FEATURED MESSAGE</span>
              {featured.scripture && <span className={styles.featuredVisualLabel}>
                <BookOpen size={17} aria-hidden="true" />
                {featured.scripture}
              </span>}
            </div>
            <div className={styles.featuredCopy}>
              {featured.series && <span className={styles.featuredSeries}>{featured.series}</span>}
              <h2 id="featured-heading">{featured.title}</h2>
              {featured.description && <p>{featured.description}</p>}
              <div className={styles.featuredMeta}>
                {featured.preacher.name && <span>{featured.preacher.name}</span>}
                <span>
                  {featured.date && <time dateTime={featured.date}>
                    {formatSermonDate(featured.date)}
                  </time>}
                  {featured.duration && <>
                    {featured.date && <span>·</span>}
                    <Clock3 size={13} aria-hidden="true" />
                    {featured.duration}
                  </>}
                </span>
              </div>
              <Link
                href={`/sermon/${featured.id}`}
                className={styles.goldButton}
              >
                Explore this message{' '}
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </section>}
        </div>
        <section
          className={styles.librarySection}
          id="message-library"
          aria-label="Browse sermons"
        >
          <div className={styles.container}>
            <Suspense
              fallback={
                <div className={styles.libraryLoading} role="status">
                  <BookOpen size={30} aria-hidden="true" />
                  <p>Opening the message library…</p>
                </div>
              }
            >
              <SermonLibrary sermons={sermons} unavailable={unavailable} />
            </Suspense>
          </div>
        </section>
        <section className={styles.invitation}>
          <div className={styles.container}>
            <div>
              <span className={styles.eyebrow}>
                <span /> THERE’S MORE TO EXPERIENCE TOGETHER
              </span>
              <h2>
                Let the Word come alive.
                <br />
                <em>Join us this Sunday.</em>
              </h2>
              <p>
                Worship with our church family in Bwari, Abuja, at{' '}
                {church.sundayTime}.
              </p>
            </div>
            <div className={styles.invitationActions}>
              <Link href="/#visit" className={styles.greenButton}>
                Plan your visit <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              {church.youtubeChannelUrl && (
                <a
                  href={church.youtubeChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.textLink}
                >
                  <Youtube size={18} aria-hidden="true" />
                  Visit our YouTube channel
                </a>
              )}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}
