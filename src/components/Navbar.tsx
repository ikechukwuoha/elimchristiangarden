'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ArrowUpRight, CalendarClock, Menu, X } from 'lucide-react'
import { church } from '@/app/data/church'
import type { ChurchEvent } from '@/lib/events'
import styles from './site.module.css'

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'Our church' },
  { href: '/sermons', label: 'Messages' },
  { href: '/bulletin', label: 'Bulletin' },
  { href: '/community', label: 'Community' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/testimonies', label: 'Testimonies' },
  { href: '/#contact', label: 'Contact' },
]

function formatTickerDate(date: string) {
  return new Date(`${date}T00:00:00Z`)
    .toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    })
    .toUpperCase()
}

export default function Navbar({ events = [] }: { events?: ChurchEvent[] }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const toggleRef = useRef<HTMLButtonElement>(null)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!isMenuOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const desktop = window.matchMedia('(min-width: 1200px)')
    const closeOnDesktop = () => {
      if (desktop.matches) setIsMenuOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
        toggleRef.current?.focus()
      }
      if (event.key === 'Tab') {
        const items = Array.from(headerRef.current?.querySelectorAll<HTMLElement>('a, button') ?? [])
          .filter((item) => item.getClientRects().length > 0 && !item.classList.contains(styles.skipLink))
        const first = items[0]
        const last = items[items.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }
    }
    document.addEventListener('keydown', closeOnEscape)
    desktop.addEventListener('change', closeOnDesktop)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeOnEscape)
      desktop.removeEventListener('change', closeOnDesktop)
    }
  }, [isMenuOpen])

  const tickerItems = events.length
    ? events.map((event) => ({
        id: event.id,
        lead: formatTickerDate(event.date),
        title: event.title,
        detail: [event.time, event.location].filter(Boolean).join(' · '),
      }))
    : Array.from({ length: 3 }, (_, index) => ({
        id: `sunday-${index}`,
        lead: 'JOIN US',
        title: `Sunday worship — ${church.sundayTime}`,
        detail: 'Elim Garden, Kuduru Express Way, Bwari, Abuja',
      }))

  return (
    <>
      {isMenuOpen && (
        <button
          type="button"
          className={styles.menuBackdrop}
          aria-label="Close navigation"
          tabIndex={-1}
          onClick={() => {
            setIsMenuOpen(false)
            toggleRef.current?.focus()
          }}
        />
      )}
      <header ref={headerRef} className={styles.header}>
        <a href="#main-content" className={styles.skipLink}>
          Skip to content
        </a>
        <div className={styles.navInner}>
          <Link
            href="/"
            className={styles.brand}
            aria-label="Elim Christian Garden International home"
            onClick={() => setIsMenuOpen(false)}
          >
            <Image
              src="/images/logo-removebg-preview.png"
              alt=""
              width={54}
              height={54}
            />
            <span>
              <strong>ELIM CHRISTIAN GARDEN</strong>
              <small>INTERNATIONAL</small>
            </span>
          </Link>
          <nav aria-label="Main navigation" className={styles.desktopNav}>
            {links.map((link) => {
              // Read published media instead of a page cached before an upload.
              const NavLink = link.href === '/bulletin' || link.href === '/gallery' ? 'a' : Link
              return (
                <NavLink
                  key={link.href}
                  href={link.href}
                  aria-current={pathname === link.href ? 'page' : undefined}
                >
                  {link.label}
                </NavLink>
              )
            })}
          </nav>
          <Link href="/#visit" className={styles.navCta}>
            Plan your visit <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className={styles.menuToggle}
            aria-label={isMenuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={25} /> : <Menu size={25} />}
          </button>
        </div>
        {isMenuOpen && (
          <nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            className={styles.mobileNav}
          >
            {links.map((link) => {
              const NavLink = link.href === '/bulletin' || link.href === '/gallery' ? 'a' : Link
              return (
                <NavLink
                  key={link.href}
                  href={link.href}
                  aria-current={pathname === link.href ? 'page' : undefined}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                  <ArrowUpRight size={17} aria-hidden="true" />
                </NavLink>
              )
            })}
            <Link
              href="/#visit"
              className={styles.mobileCta}
              onClick={() => setIsMenuOpen(false)}
            >
              Plan your visit <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </nav>
        )}
        <div className={styles.ticker} role="region" aria-label="Upcoming events">
          <span className={styles.tickerLabel}>
            <CalendarClock size={14} aria-hidden="true" />
            {events.length > 0 ? 'UPCOMING EVENTS' : 'WORSHIP WITH US'}
          </span>
          <div className={styles.tickerViewport}>
            {/* Two identical halves make the marquee loop seamless. */}
            <div className={styles.tickerTrack}>
              {[...tickerItems, ...tickerItems].map((item, index) => (
                <span
                  className={styles.tickerItem}
                  key={`${item.id}-${index}`}
                  aria-hidden={index >= tickerItems.length || undefined}
                >
                  <span className={styles.tickerWhen}>{item.lead}</span>
                  <span className={styles.tickerTitle}>{item.title}</span>
                  {item.detail && (
                    <span className={styles.tickerDetail}>{item.detail}</span>
                  )}
                  <span className={styles.tickerDot} aria-hidden="true" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
