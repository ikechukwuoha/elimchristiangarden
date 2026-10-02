import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, LockKeyhole, Users } from 'lucide-react'
import { isAdmin } from '@/lib/admin/auth'
import { authConfig, totpConfig } from '@/lib/admin/session'
import { cloudinaryConfig } from '@/lib/admin/cloudinary'
import { groupOptions, readGroups } from '@/lib/community'
import MediaAdmin from '@/components/admin/MediaAdmin'
import YoutubeMessageAdmin from '@/components/admin/YoutubeMessageAdmin'
import AdminLogin from '@/components/admin/AdminLogin'
import styles from '@/components/admin/admin.module.css'

export const metadata: Metadata = {
  title: 'Media Room',
  robots: { index: false, follow: false, noarchive: true },
}

export default async function AdminMediaPage() {
  const authenticated = await isAdmin()
  return (
    <div className={styles.admin}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          <Image
            src="/images/logo-removebg-preview.png"
            alt="Elim Christian Garden"
            width={45}
            height={45}
          />
          <span>
            ELIM CHRISTIAN GARDEN<small>MEDIA ROOM</small>
          </span>
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
          <h1>
            Share the life of <em>our church.</em>
          </h1>
          <p>
            A home for our photographs, videos, audio, YouTube messages, and monthly bulletins.
          </p>
        </div>
        {authenticated ? (
          <>
            <div className={styles.adminTabs}>
              <Link href="/admin/media" aria-current="page">
                Media room
              </Link>
              <Link href="/admin/fellowships">
                <Users size={15} aria-hidden="true" /> Fellowships & units
              </Link>
              <a href="#youtube-heading">Publish YouTube message</a>
            </div>
            <MediaAdmin
              cloudinaryReady={Boolean(cloudinaryConfig())}
              groups={groupOptions(await readGroups())}
            />
            <YoutubeMessageAdmin cloudinaryReady={Boolean(cloudinaryConfig())} />
          </>
        ) : (
          <AdminLogin
            configured={Boolean(authConfig())}
            twoFactorEnabled={Boolean(totpConfig())}
          />
        )}
      </main>
      <footer className={styles.footer}>
        Elim Christian Garden International{' '}
        <span>Rooted in Christ. Growing together.</span>
      </footer>
    </div>
  )
}
