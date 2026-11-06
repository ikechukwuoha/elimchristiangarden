import Link from 'next/link'
import {
  CalendarClock,
  Timer,
  CakeSlice,
  MessageSquareHeart,
  Users,
  Youtube,
} from 'lucide-react'
import styles from './admin.module.css'

const tabs = [
  { href: '/admin/media', label: 'Media room' },
  { href: '/admin/youtube', label: 'YouTube messages', icon: Youtube },
  { href: '/admin/birthdays', label: 'Birthdays & anniversaries', icon: CakeSlice },
  { href: '/admin/fellowships', label: 'Fellowships & units', icon: Users },
  { href: '/admin/testimonies', label: 'Testimonies', icon: MessageSquareHeart },
  { href: '/admin/events', label: 'Events', icon: CalendarClock },
  { href: '/admin/countdown', label: 'Countdown', icon: Timer },
]

export default function AdminTabs({
  active,
}: {
  active: 'media' | 'youtube' | 'fellowships' | 'testimonies' | 'events' | 'birthdays' | 'countdown'
}) {
  return (
    <nav className={styles.adminTabs} aria-label="Admin sections">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={active === tab.href.replace('/admin/', '') ? 'page' : undefined}
        >
          {tab.icon ? (
            <tab.icon size={15} aria-hidden="true" />
          ) : null}
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}
