'use client'

import { usePathname } from 'next/navigation'
import BirthdayCelebration from './BirthdayCelebration'

export default function PublicCelebrations() {
  const pathname = usePathname()
  if (!pathname || pathname === '/admin' || pathname.startsWith('/admin/')) return null

  // Each public page opens its own card. Query/filter changes on the same page
  // preserve a visitor's dismissal, while navigating to another page resets it.
  return <BirthdayCelebration key={pathname} />
}
