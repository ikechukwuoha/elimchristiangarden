'use client'

import { usePathname } from 'next/navigation'
import { useState, useSyncExternalStore } from 'react'
import BirthdayCelebration from './BirthdayCelebration'
import DestinyCountdown from '@/components/announcements/DestinyCountdown'
import styles from './public-celebrations.module.css'

function subscribeViewport(notify: () => void) {
  const media = window.matchMedia('(max-width: 760px)')
  media.addEventListener('change', notify)
  return () => media.removeEventListener('change', notify)
}
const compactSnapshot = () => window.matchMedia('(max-width: 760px)').matches
const serverCompactSnapshot = () => true

function AnnouncementWidgets({ compact }: { compact: boolean }) {
  const [celebrationsOpen, setCelebrationsOpen] = useState(!compact)
  const [countdownOpen, setCountdownOpen] = useState(true)

  return <div className={styles.widgets} data-announcement-dock>
    <BirthdayCelebration compact={compact} open={celebrationsOpen} onOpenChange={setCelebrationsOpen} />
    <DestinyCountdown compact={compact} open={countdownOpen} onOpenChange={setCountdownOpen} />
  </div>
}

export default function PublicCelebrations() {
  const pathname = usePathname()
  const compact = useSyncExternalStore(subscribeViewport, compactSnapshot, serverCompactSnapshot)
  if (!pathname || pathname === '/admin' || pathname.startsWith('/admin/')) return null

  // Mobile visits and viewport changes start with celebrations collapsed.
  // Query/filter changes on the same page preserve a visitor's choices.
  return <AnnouncementWidgets key={`${pathname}:${compact}`} compact={compact} />
}
