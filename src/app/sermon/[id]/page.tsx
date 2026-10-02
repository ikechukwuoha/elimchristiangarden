import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Clock3,
  Sprout,
} from 'lucide-react'
import Layout from '@/components/Layout'
import MessageActions from '@/components/sermons/MessageActions'
import MessageMedia from '@/components/sermons/MessageMedia'
import MessageCard from '@/components/sermons/MessageCard'
import { cachedMessages } from '@/lib/message-cache'
import { formatSermonDate, speakerInitials } from '@/lib/sermons'
import styles from '@/components/sermons/sermons.module.css'

export default async function SermonPage({
  params,
}: PageProps<'/sermon/[id]'>) {
  const { id } = await params
  const sermons = await cachedMessages()
  const sermon = sermons.find((item) => item.id === id)
  if (!sermon) notFound()
  const seriesMessages = sermon.series ? sermons.filter((item) => item.series === sermon.series) : []
  const related = sermons
    .filter((item) => item.id !== id)
    .sort(
      (a, b) =>
        Number(Boolean(sermon.series) && b.series === sermon.series) -
          Number(Boolean(sermon.series) && a.series === sermon.series) || b.date.localeCompare(a.date),
    )
    .slice(0, 3)
  const seriesHref = `/sermons?series=${encodeURIComponent(sermon.series)}#message-library`
  const speakerHref = `/sermons?speaker=${encodeURIComponent(sermon.preacher.name)}#message-library`

  return (
    <Layout>
      <div className={styles.sermons}>
        <div className={styles.container}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight size={13} aria-hidden="true" />
            <Link href="/sermons">Messages</Link>
            <ChevronRight size={13} aria-hidden="true" />
            <span aria-current="page">{sermon.title}</span>
          </nav>
          <header className={styles.detailHeader}>
            {sermon.series && <Link href={seriesHref} className={styles.seriesPill}>
              <BookOpen size={13} aria-hidden="true" />
              {sermon.series}
            </Link>}
            <h1>{sermon.title}</h1>
            <div className={styles.detailMeta}>
              {sermon.preacher.name && <Link href={speakerHref}>{sermon.preacher.name}</Link>}
              {sermon.date && <span>
                <CalendarDays size={15} aria-hidden="true" />
                <time dateTime={sermon.date}>
                  {formatSermonDate(sermon.date)}
                </time>
              </span>}
              {sermon.duration && <span>
                <Clock3 size={15} aria-hidden="true" />
                {sermon.duration}
              </span>}
            </div>
          </header>
          <div className={styles.detailGrid}>
            <div className={styles.detailMain}>
              <MessageMedia key={sermon.id} sermon={sermon} />
              <MessageActions
                key={sermon.id}
                id={sermon.id}
                title={sermon.title}
              />
              {(sermon.description || sermon.tags.length > 0) && <section
                className={styles.messageAbout}
                aria-labelledby="about-message-heading"
              >
                <span className={styles.eyebrow}>
                  <span /> GO A LITTLE DEEPER
                </span>
                <h2 id="about-message-heading">
                  About this <em>message.</em>
                </h2>
                <p>{sermon.description}</p>
                <div className={styles.topicLinks} aria-label="Message topics">
                  {sermon.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/sermons?q=${encodeURIComponent(tag)}#message-library`}
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </section>}
              {sermon.scripture && <section
                className={styles.scriptureCard}
                aria-labelledby="scripture-heading"
              >
                <BookOpen size={26} strokeWidth={1.3} aria-hidden="true" />
                <div>
                  <span className={styles.smallLabel}>OPEN THE WORD</span>
                  <h2 id="scripture-heading">Scripture for reflection</h2>
                  <p>Read the passages at the heart of this message.</p>
                  <div>
                    {sermon.scripture.split(',').map((reference) => (
                      <a
                        key={reference}
                        href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(reference.trim())}&version=KJV`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {reference.trim()}
                        <ArrowUpRight size={15} aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                </div>
              </section>}
              {sermon.scripture && <section
                className={styles.reflection}
                aria-labelledby="reflection-heading"
              >
                <span className={styles.eyebrow}>
                  <span /> TAKE IT INTO YOUR WEEK
                </span>
                <h2 id="reflection-heading">
                  A moment to <em>reflect.</em>
                </h2>
                <p>
                  As you read the Scripture, take a little time to pray and
                  consider:
                </p>
                <ol>
                  <li>What does this passage help me understand about God?</li>
                  <li>
                    How can I put what I’ve learned into practice this week?
                  </li>
                  <li>Who could I encourage with this Scripture?</li>
                </ol>
              </section>}
            </div>
            <aside
              className={styles.detailAside}
              aria-label="Speaker and series information"
            >
              {sermon.preacher.name && <section className={styles.speakerCard}>
                <span className={styles.smallLabel}>BEHIND THE MESSAGE</span>
                <div className={styles.speakerIdentity}>
                  {sermon.preacher.image ? (
                    <Image
                      src={sermon.preacher.image}
                      alt={sermon.preacher.name}
                      width={68}
                      height={68}
                    />
                  ) : (
                    <span className={styles.initials} aria-hidden="true">
                      {speakerInitials(sermon.preacher.name)}
                    </span>
                  )}
                  <div>
                    <h2>{sermon.preacher.name}</h2>
                    {sermon.preacher.role && <p>{sermon.preacher.role}</p>}
                  </div>
                </div>
                <Link href={speakerHref} className={styles.textLink}>
                  More from this speaker{' '}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              </section>}
              {sermon.series && <section className={styles.seriesCard}>
                <span className={styles.smallLabel}>KEEP EXPLORING</span>
                <h2>{sermon.series}</h2>
                <p>
                  {seriesMessages.length}{' '}
                  {seriesMessages.length === 1 ? 'message' : 'messages'} in this
                  series
                </p>
                <ol>
                  {seriesMessages.map((item, index) => (
                    <li key={item.id}>
                      <Link
                        href={`/sermon/${item.id}`}
                        aria-current={item.id === id ? 'page' : undefined}
                      >
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <div>
                          {item.title}
                          <small>{formatSermonDate(item.date)}</small>
                        </div>
                        <ChevronRight size={15} aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ol>
                <Link href={seriesHref} className={styles.textLink}>
                  Explore the series <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </section>}
              <div className={styles.asideInvitation}>
                <Sprout size={27} strokeWidth={1.2} aria-hidden="true" />
                <h2>
                  Faith grows
                  <br />
                  <em>in community.</em>
                </h2>
                <p>
                  Bring your questions. Share your journey. There’s a place for
                  you at Elim.
                </p>
                <Link href="/#visit" className={styles.textLink}>
                  Come worship with us{' '}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
        {related.length > 0 && <section
          className={styles.relatedSection}
          aria-labelledby="related-heading"
        >
          <div className={styles.container}>
            <div className={styles.relatedHeading}>
              <div>
                <span className={styles.eyebrow}>
                  <span /> CONTINUE YOUR JOURNEY
                </span>
                <h2 id="related-heading">
                  More to <em>encourage you.</em>
                </h2>
              </div>
              <Link href="/sermons" className={styles.textLink}>
                All messages <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </div>
            <div className={styles.messageGrid}>
              {related.map((item) => (
                <MessageCard key={item.id} sermon={item} />
              ))}
            </div>
            <Link href="/sermons" className={styles.backLink}>
              <ArrowLeft size={16} aria-hidden="true" />
              Back to the message library
            </Link>
          </div>
        </section>}
      </div>
    </Layout>
  )
}
