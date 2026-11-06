import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, LockKeyhole } from 'lucide-react'
import { isAdmin } from '@/lib/admin/auth'
import { authConfig, totpConfig } from '@/lib/admin/session'
import { cloudinaryConfig } from '@/lib/admin/cloudinary'
import { readBirthdays } from '@/lib/birthday-store'
import type { Birthday } from '@/lib/birthdays'
import BirthdaysAdmin from '@/components/admin/BirthdaysAdmin'
import AdminLogin from '@/components/admin/AdminLogin'
import AdminTabs from '@/components/admin/AdminTabs'
import styles from '@/components/admin/admin.module.css'

export const metadata: Metadata = { title: 'Birthdays & anniversaries', robots: { index: false, follow: false, noarchive: true } }

export default async function AdminBirthdaysPage() {
  const authenticated = await isAdmin()
  let birthdays: Birthday[] = []
  let error = ''
  if (authenticated && cloudinaryConfig()) {
    try { birthdays = await readBirthdays() }
    catch (failure) { error = failure instanceof Error ? failure.message : 'The celebration list could not be loaded. Refresh to try again.' }
  }
  return <div className={styles.admin}>
    <header className={styles.header}>
      <Link href="/" className={styles.brand}><Image src="/images/logo-removebg-preview.png" alt="Elim Christian Garden" width={45} height={45} /><span>ELIM CHRISTIAN GARDEN<small>ADMIN</small></span></Link>
      <Link href="/" className={styles.backLink}>View website <ArrowUpRight size={16} aria-hidden="true" /></Link>
    </header>
    <main id="main-content" className={styles.main}>
      <div className={styles.intro}><span className={styles.eyebrow}><LockKeyhole size={14} aria-hidden="true" /> FOR OUR TEAM</span><h1>Life is worth <em>celebrating.</em></h1><p>Birthdays, anniversaries, and a little love from the Elim family. Add a celebration once; it appears from its date through the end of that month, every year.</p></div>
      {authenticated ? <><AdminTabs active="birthdays" /><BirthdaysAdmin initialBirthdays={birthdays} initialError={error} cloudinaryReady={Boolean(cloudinaryConfig())} /></> : <AdminLogin configured={Boolean(authConfig())} twoFactorEnabled={Boolean(totpConfig())} />}
    </main>
    <footer className={styles.footer}>Elim Christian Garden International <span>Rooted in Christ. Growing together.</span></footer>
  </div>
}
