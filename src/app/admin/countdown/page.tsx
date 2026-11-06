import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, LockKeyhole } from 'lucide-react'
import { isAdmin } from '@/lib/admin/auth'
import { authConfig, totpConfig } from '@/lib/admin/session'
import { cloudinaryConfig } from '@/lib/admin/cloudinary'
import { readCountdownSettings } from '@/lib/countdown-store'
import type { CountdownSettings } from '@/lib/countdown'
import { readEvents, type ChurchEvent } from '@/lib/events'
import CountdownAdmin from '@/components/admin/CountdownAdmin'
import AdminLogin from '@/components/admin/AdminLogin'
import AdminTabs from '@/components/admin/AdminTabs'
import styles from '@/components/admin/admin.module.css'

export const metadata: Metadata = { title: 'Countdown', robots: { index: false, follow: false, noarchive: true } }

export default async function AdminCountdownPage() {
  const authenticated = await isAdmin()
  let settings: CountdownSettings | null = null
  let events: ChurchEvent[] = []
  let error = ''
  if (authenticated) {
    const results = await Promise.allSettled([readCountdownSettings(), readEvents({ strict: true })])
    if (results[0].status === 'fulfilled') settings = results[0].value
    if (results[1].status === 'fulfilled') events = results[1].value
    error = results.flatMap((result) => result.status === 'rejected' ? [result.reason instanceof Error ? result.reason.message : 'The countdown could not be loaded. Please refresh.'] : []).join(' ')
  }
  return <div className={styles.admin}>
    <header className={styles.header}>
      <Link href="/" className={styles.brand}><Image src="/images/logo-removebg-preview.png" alt="Elim Christian Garden" width={45} height={45} /><span>ELIM CHRISTIAN GARDEN<small>ADMIN</small></span></Link>
      <Link href="/" className={styles.backLink}>View website <ArrowUpRight size={16} aria-hidden="true" /></Link>
    </header>
    <main id="main-content" className={styles.main}>
      <div className={styles.intro}>
        <span className={styles.eyebrow}><LockKeyhole size={14} aria-hidden="true" /> FOR OUR TEAM</span>
        <h1>Every gathering.<br /><em>Something to anticipate.</em></h1>
        <p>Choose the programme to count down to, shape its invitation, and preview the TV display before it goes live.</p>
      </div>
      {authenticated ? <><AdminTabs active="countdown" /><CountdownAdmin initialSettings={settings} initialEvents={events} initialError={error} cloudinaryReady={Boolean(cloudinaryConfig())} /></>
        : <AdminLogin configured={Boolean(authConfig())} twoFactorEnabled={Boolean(totpConfig())} />}
    </main>
    <footer className={styles.footer}>Elim Christian Garden International <span>Rooted in Christ. Growing together.</span></footer>
  </div>
}
