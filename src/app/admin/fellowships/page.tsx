import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, LockKeyhole, Users } from 'lucide-react'
import { isAdmin } from '@/lib/admin/auth'
import { authConfig, totpConfig } from '@/lib/admin/session'
import { cloudinaryConfig } from '@/lib/admin/cloudinary'
import { readGroups } from '@/lib/community'
import CommunityAdmin from '@/components/admin/CommunityAdmin'
import AdminLogin from '@/components/admin/AdminLogin'
import styles from '@/components/admin/admin.module.css'

export const metadata: Metadata = {
  title: 'Fellowships & Units',
  robots: { index: false, follow: false, noarchive: true },
}

export default async function AdminCommunityPage() {
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
            ELIM CHRISTIAN GARDEN<small>ADMIN</small>
          </span>
        </Link>
        <Link href="/" className={styles.backLink}>
          View website <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </header>
      <main id="main-content" className={styles.main}>
        <div className={styles.intro}>
          <span className={styles.eyebrow}>
            <LockKeyhole size={14} aria-hidden="true" /> FOR OUR TEAM
          </span>
          <h1>
            Fellowships &<br />
            <em>units.</em>
          </h1>
          <p>
            Add the groups that make up our church family. Each one gets its
            own section on the community page and its own photo gallery.
          </p>
        </div>
        {authenticated ? (
          <>
            <div className={styles.adminTabs}>
              <Link href="/admin/fellowships" aria-current="page">
                <Users size={15} aria-hidden="true" /> Fellowships & units
              </Link>
              <Link href="/admin/media">
                Media room
              </Link>
            </div>
            <CommunityAdmin
              initialGroups={await readGroups()}
              cloudinaryReady={Boolean(cloudinaryConfig())}
            />
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
