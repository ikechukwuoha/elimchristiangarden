import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, LockKeyhole } from 'lucide-react'
import { isAdmin } from '@/lib/admin/auth'
import { authConfig, totpConfig } from '@/lib/admin/session'
import { cloudinaryConfig } from '@/lib/admin/cloudinary'
import AdminTabs from '@/components/admin/AdminTabs'
import AdminLogin from '@/components/admin/AdminLogin'
import YoutubeMessageAdmin from '@/components/admin/YoutubeMessageAdmin'
import styles from '@/components/admin/admin.module.css'

export const metadata: Metadata = {
  title: 'YouTube messages',
  robots: { index: false, follow: false, noarchive: true },
}

export default async function AdminYoutubePage() {
  const authenticated = await isAdmin()
  return (
    <div className={styles.admin}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          <Image src="/images/logo-removebg-preview.png" alt="Elim Christian Garden" width={45} height={45} />
          <span>ELIM CHRISTIAN GARDEN<small>ADMIN</small></span>
        </Link>
        <Link href="/" className={styles.backLink}>
          View website <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </header>
      <main id="main-content" className={styles.main}>
        <div className={styles.intro}>
          <span className={styles.eyebrow}>
            <LockKeyhole size={14} aria-hidden="true" /> FOR OUR MEDIA TEAM
          </span>
          <h1>Share the <em>Word.</em></h1>
          <p>Publish a YouTube recording for our church family to watch in the Messages library.</p>
        </div>
        {authenticated ? (
          <>
            <AdminTabs active="youtube" />
            <YoutubeMessageAdmin cloudinaryReady={Boolean(cloudinaryConfig())} />
          </>
        ) : (
          <AdminLogin configured={Boolean(authConfig())} twoFactorEnabled={Boolean(totpConfig())} />
        )}
      </main>
      <footer className={styles.footer}>
        Elim Christian Garden International <span>Rooted in Christ. Growing together.</span>
      </footer>
    </div>
  )
}
