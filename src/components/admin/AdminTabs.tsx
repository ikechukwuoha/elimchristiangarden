import Link from 'next/link'
import {
  CalendarClock,
  MessageSquareHeart,
  Users,
} from 'lucide-react'
import styles from './admin.module.css'

const tabs = [
  { href: '/admin/media', label: 'Media room' },
  { href: '/admin/fellowships', label: 'Fellowships & units', icon: Users },
  { href: '/admin/testimonies', label: 'Testimonies', icon: MessageSquareHeart },
  { href: '/admin/events', label: 'Events', icon: CalendarClock },
]

export default function AdminTabs({
  active,
}: {
  active: 'media' | 'fellowships' | 'testimonies' | 'events'
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
