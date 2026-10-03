import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowDownToLine, ArrowLeft, ArrowUpRight } from 'lucide-react'
import BulletinReader from '@/components/bulletin/BulletinReader'
import { cachedBulletins } from '@/lib/bulletin-cache'
import { bulletinDownloadUrl, bulletinPdfUrl, type Bulletin } from '@/lib/bulletins'
import { formatMonth } from '@/lib/media'
import styles from './read.module.css'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export const metadata: Metadata = {
  title: 'Read bulletin',
  description: 'Read the Elim monthly bulletin on your phone, tablet, or computer.',
}

export default async function ReadBulletinPage({ params }: {
  params: Promise<{ month: string }>
}) {
  const { month } = await params
  if (!/^20\d{2}-(0[1-9]|1[0-2])$/.test(month)) notFound()
  let issues: Bulletin[]
  try {
    issues = await cachedBulletins()
  } catch {
    return (
      <main id="main-content" className={styles.unavailable}>
        <h1>The bulletin is temporarily unavailable.</h1>
        <p>Please try again in a moment.</p>
        <Link href={`/bulletin?month=${month}`}>Back to bulletins</Link>
      </main>
    )
  }
  const bulletin = issues.find((issue) => issue.month === month)
  if (!bulletin) notFound()
  const pdfUrl = bulletinPdfUrl(bulletin)

  return (
    <main id="main-content" className={styles.screen}>
      <header className={styles.header}>
        <Link className={styles.back} href={`/bulletin?month=${month}`} aria-label="Back to bulletins">
          <ArrowLeft size={20} aria-hidden="true" />
          <span>Bulletins</span>
        </Link>
        <div className={styles.title}>
          <p>{formatMonth(month)}</p>
          <h1>{bulletin.title}</h1>
        </div>
        <div className={styles.actions}>
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" aria-label="Open original PDF in a new tab">
            <ArrowUpRight size={18} aria-hidden="true" /><span>Open PDF</span>
          </a>
          <a href={bulletinDownloadUrl(bulletin)} download={`Elim-${month}-Bulletin.pdf`} aria-label="Download bulletin PDF">
            <ArrowDownToLine size={18} aria-hidden="true" /><span>Download</span>
          </a>
        </div>
      </header>
      <BulletinReader key={bulletin.id} url={pdfUrl} title={bulletin.title} />
    </main>
  )
}
