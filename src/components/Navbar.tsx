'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import styles from './site.module.css'

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'Our church' },
  { href: '/sermons', label: 'Messages' },
  { href: '/bulletin', label: 'Bulletin' },
  { href: '/community', label: 'Community' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/#contact', label: 'Contact' },
]

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isMenuOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [isMenuOpen])

  return (
    <header className={styles.header}>
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
    </header>
  )
}
