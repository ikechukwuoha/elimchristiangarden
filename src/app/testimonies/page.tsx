import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowUpRight,
  ChevronRight,
  Clock3,
  MapPin,
  MessageSquareHeart,
  Quote,
} from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import Layout from '@/components/Layout'
import { church, whatsappLink } from '@/app/data/church'
import { cachedTestimonies } from '@/lib/testimonies-cache'
import styles from './testimonies.module.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Testimonies',
  description:
    'Testimonies of God’s goodness at Elim Christian Garden International in Bwari, Abuja — real stories of faith answered, lives changed, and prayers heard.',
}

export default async function TestimoniesPage() {
  let testimonies: Awaited<ReturnType<typeof cachedTestimonies>> = []
  let unavailable = false
  try {
    testimonies = await cachedTestimonies({ strict: true })
  } catch {
    unavailable = true
  }

  return (
    <Layout>
      <div className={styles.testimonies}>
        <section className={styles.hero} aria-labelledby="testimonies-title">
          <div className={styles.container}>
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <ChevronRight size={13} aria-hidden="true" />
              <span aria-current="page">Testimonies</span>
            </nav>
            <div className={styles.heroGrid}>
              <div className={styles.heroCopy}>
                <span className={styles.eyebrow}>
                  <span /> EVERY TESTIMONY IS A SEED
                </span>
                <h1 id="testimonies-title">
                  What the Lord
                  <br />
                  <em>has done.</em>
                </h1>
                <p>
                  Real stories from our church family — prayers answered,
                  lives changed, and faith that grew through every season.
                  Read them, believe with us, and expect your own.
                </p>
                <a href="#stories" className={styles.greenButton}>
                  Read the testimonies{' '}
                  <ArrowUpRight size={17} aria-hidden="true" />
                </a>
              </div>
              <div className={styles.heroAside}>
                <MessageSquareHeart
                  size={30}
                  strokeWidth={1.2}
                  aria-hidden="true"
                />
                <span className={styles.smallLabel}>
                  HAS GOD DONE SOMETHING IN YOUR LIFE?
                </span>
                <p>
                  Your story could be the encouragement someone is praying
                  for. Share it with our team and let the family celebrate
                  with you.
                </p>
                <a
                  href={whatsappLink(
                    'Hello! I would like to share a testimony of what God has done.',
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.textLink}
                >
                  Share your testimony{' '}
                  <FaWhatsapp size={17} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section
          className={`${styles.container} ${styles.stories}`}
          id="stories"
          aria-labelledby="stories-heading"
        >
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>
                <span /> FROM OUR FAMILY
              </span>
              <h2 id="stories-heading">
                Voices of <em>thanksgiving.</em>
              </h2>
            </div>
            {testimonies.length > 0 && (
              <p>
                {testimonies.length}{' '}
                {testimonies.length === 1 ? 'testimony' : 'testimonies'}{' '}
                shared so far — and counting.
              </p>
            )}
          </div>
          {unavailable && (
            <p className={styles.notice} role="status">
              We couldn’t load the testimonies just now. Please refresh in a
              moment — every story is safe.
            </p>
          )}
          {!unavailable && testimonies.length === 0 ? (
            <div className={styles.testimonyGrid}>
              <div className={styles.empty}>
                <MessageSquareHeart
                  size={32}
                  strokeWidth={1.2}
                  aria-hidden="true"
                />
                <h3>No testimonies shared yet.</h3>
                <p>
                  Be the first to share what the Lord has done — your story
                  will strengthen someone’s faith.
                </p>
              </div>
            </div>
          ) : (
            <div className={styles.testimonyGrid}>
              {testimonies.map((testimony) => (
                <article
                  className={styles.testimonyCard}
                  key={testimony.id}
                >
                  <span className={styles.quoteMark} aria-hidden="true">
                    “
                  </span>
                  <p className={styles.testimonyQuote}>{testimony.quote}</p>
                  <div className={styles.testimonyByline}>
                    <strong>{testimony.name}</strong>
                    {testimony.role && <span>{testimony.role}</span>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section
          className={styles.sharing}
          aria-labelledby="sharing-heading"
        >
          <div className={`${styles.container} ${styles.sharingInner}`}>
            <div className={styles.sharingCopy}>
              <span className={styles.eyebrow}>
                <span /> DON’T KEEP IT TO YOURSELF
              </span>
              <h2 id="sharing-heading">
                Testimonies are
                <br />
                <em>seeds of faith.</em>
              </h2>
              <p>
                Revelation 12:11 says God’s people overcome “by the word of
                their testimony.” When you share what God has done, someone
                else finds the courage to believe Him for their own miracle.
              </p>
            </div>
            <div className={styles.sharingCard}>
              <Quote size={26} strokeWidth={1.3} aria-hidden="true" />
              <h3>Ready to share yours?</h3>
              <p>
                Send it to our team on WhatsApp — a short message is enough.
                We will take care of the rest, with your permission.
              </p>
              <a
                href={whatsappLink(
                  'Hello! I would like to share a testimony of what God has done.',
                )}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.textLink}
              >
                Message the team <FaWhatsapp size={17} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section
          className={styles.invitation}
          aria-labelledby="invitation-heading"
        >
          <div className={`${styles.container} ${styles.invitationInner}`}>
            <div>
              <span className={styles.eyebrow}>
                <span /> YOUR STORY COULD START THIS SUNDAY
              </span>
              <h2 id="invitation-heading">
                Come and <em>see.</em>
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
              <Link href="/community" className={styles.textLink}>
                Find your fellowship <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}
