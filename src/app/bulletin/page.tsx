import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowDownToLine,
  ArrowUpRight,
  ChevronRight,
  FileText,
} from 'lucide-react'
import Layout from '@/components/Layout'
import BulletinReader from '@/components/bulletin/BulletinReader'
import { cachedBulletins } from '@/lib/bulletin-cache'
import { bulletinDownloadUrl, bulletinPdfUrl, type Bulletin } from '@/lib/bulletins'
import { formatMonth } from '@/lib/media'
import styles from './bulletin.module.css'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export const metadata: Metadata = {
  title: 'Monthly Bulletins',
  description:
    'Read the monthly Elim Christian Garden International bulletins, featuring our themes, church news, celebrations, and programmes.',
}

export default async function BulletinPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string | string[] }>
}) {
  let issues: Bulletin[] = []
  let unavailable = false
  try {
    issues = await cachedBulletins()
  } catch {
    unavailable = true
  }
  const { month: requestedMonth } = await searchParams
  const requested = typeof requestedMonth === 'string'
    ? issues.find((issue) => issue.month === requestedMonth)
    : undefined
  const bulletin = requested ?? issues[0]
  if (!bulletin) {
    return (
      <Layout>
        <div className={styles.bulletinPage}>
          <section className={styles.hero} aria-labelledby="bulletin-title">
            <div className={styles.container}>
              <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <ChevronRight size={13} aria-hidden="true" />
                <span aria-current="page">Bulletin</span>
              </nav>
              <div className={styles.emptyState}>
                <span className={styles.monthIcon}>
                  <FileText size={25} strokeWidth={1.4} aria-hidden="true" />
                </span>
                <h1 id="bulletin-title">
                  {unavailable ? 'Bulletins are temporarily unavailable.' : 'No bulletins uploaded yet.'}
                </h1>
                <p role="status">
                  {unavailable
                    ? 'We couldn’t load the bulletins just now. Please refresh to try again.'
                    : 'Our monthly bulletins will appear here once they are uploaded. Please check back soon.'}
                </p>
              </div>
            </div>
          </section>
        </div>
      </Layout>
    )
  }
  const month = formatMonth(bulletin.month)
  const bulletinUrl = bulletinPdfUrl(bulletin)
  return (
    <Layout>
      <div className={styles.bulletinPage}>
        <section className={styles.hero} aria-labelledby="bulletin-title">
          <div className={styles.container}>
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <ChevronRight size={13} aria-hidden="true" />
              <span aria-current="page">Bulletin</span>
            </nav>

            <div className={styles.heroGrid}>
              <div className={styles.heroCopy}>
                <span className={styles.eyebrow}>
                  <span /> THE MONTHLY BULLETIN
                </span>
                <h1 id="bulletin-title">
                  {month}.
                  <br />
                  <em>{bulletin.theme || 'Life in our church.'}</em>
                </h1>
                <p>
                  {bulletin.description || 'Read the latest from our church family: this month’s message, celebrations, and programme of services.'}
                </p>
                <div className={styles.actions}>
                  <a
                    className={styles.primaryButton}
                    href={bulletinDownloadUrl(bulletin)}
                    download={`Elim-${bulletin.month}-Bulletin.pdf`}
                  >
                    Download bulletin{' '}
                    <ArrowDownToLine size={17} aria-hidden="true" />
                  </a>
                  <a
                    className={styles.secondaryButton}
                    href={bulletinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open PDF <ArrowUpRight size={17} aria-hidden="true" />
                  </a>
                </div>
              </div>

              <aside className={styles.monthCard} aria-label={`${month} bulletin details`}>
                <span className={styles.monthIcon}>
                  <FileText size={25} strokeWidth={1.4} aria-hidden="true" />
                </span>
                <span className={styles.cardLabel}>{month.toUpperCase()}</span>
                <h2>{bulletin.theme || bulletin.title}</h2>
                {bulletin.quote && <p>“{bulletin.quote}”</p>}
                {bulletin.scripture && <span className={styles.reference}>{bulletin.scripture}</span>}
              </aside>
            </div>
          </div>
        </section>

        <section className={styles.readerSection} aria-labelledby="reader-title">
          <div className={styles.container}>
            {requestedMonth && !requested && (
              <p className={styles.notice} role="status">
                That edition isn’t available. Showing the latest bulletin instead.
              </p>
            )}
            <div className={styles.readerHeading}>
              <div>
                <span className={styles.eyebrow}>
                  <span /> TAKE A LOOK INSIDE
                </span>
                <h2 id="reader-title">{bulletin.title}</h2>
              </div>
              <p>Encouragement and news from Elim. Read, share, or keep a copy.</p>
            </div>
            <BulletinReader key={bulletin.id} url={bulletinUrl} title={`Elim Christian Garden ${month} bulletin`} />
            <nav className={styles.archive} aria-label="Bulletin editions">
              <span className={styles.eyebrow}><span /> BROWSE BY MONTH</span>
              <div className={styles.editions}>
                {issues.map((issue) => (
                  <Link
                    key={issue.month}
                    href={`/bulletin?month=${issue.month}`}
                    aria-current={issue.month === bulletin.month ? 'page' : undefined}
                    className={styles.edition}
                  >
                    <FileText size={18} aria-hidden="true" />
                    <span>{formatMonth(issue.month)}<small>{issue.theme || issue.title}</small></span>
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        </section>
      </div>
    </Layout>
  )
}
