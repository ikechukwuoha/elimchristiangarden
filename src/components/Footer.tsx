import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Mail, MapPin } from 'lucide-react'
import { church } from '@/app/data/church'
import styles from './site.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer} id="contact">
      <div className={styles.footerInner}>
        <div className={styles.footerInvitation}>
          <div>
            <span className={styles.eyebrow}>
              LET’S WALK THIS JOURNEY TOGETHER
            </span>
            <h2>There’s a place for you here.</h2>
          </div>
          <a href={`mailto:${church.email}`} className={styles.footerButton}>
            Get in touch <ArrowUpRight size={19} aria-hidden="true" />
          </a>
        </div>
        <div className={styles.footerGrid}>
          <div className={styles.footerAbout}>
            <Link href="/" className={styles.brand}>
              <Image
                src="/images/logo-removebg-preview.png"
                alt="Elim church logo"
                width={52}
                height={52}
              />
              <span>
                <strong>ELIM CHRISTIAN GARDEN</strong>
                <small>INTERNATIONAL</small>
              </span>
            </Link>
            <p>
              Watering lives for fruitfulness.
              <br />A family of faith in the heart of Bwari, Abuja.
            </p>
          </div>
          <div>
            <h3>Explore</h3>
            <Link href="/about">Our story</Link>
            <Link href="/sermons">Messages</Link>
            {/* Read the current edition rather than a cached browser page. */}
            <a href="/bulletin">Monthly bulletin</a>
            <Link href="/community">Find your community</Link>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Full navigation reads newly published gallery uploads. */}
            <a href="/gallery">Photo gallery</a>
            <Link href="/gallery/audio">Recordings</Link>
            <Link href="/#visit">Your first visit</Link>
          </div>
          <div>
            <h3>Gather with us</h3>
            <p>
              Sunday worship
              <br />
              <strong>
                {church.sundayTime} – {church.sundayEnd}
              </strong>
            </p>
            <p>
              Saturday prayers
              <br />
              <strong>7:00 AM – 8:30 AM</strong>
            </p>
            <Link href="/#gatherings" className={styles.footerTextLink}>
              All gatherings <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <div className={styles.footerContact}>
            <h3>Come say hello</h3>
            <a
              href={church.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MapPin size={18} aria-hidden="true" />
              <span>
                {church.address}
                <small>Get directions ↗</small>
              </span>
            </a>
            <a href={`mailto:${church.email}`}>
              <Mail size={18} aria-hidden="true" />
              <span>{church.email}</span>
            </a>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>
            © {new Date().getFullYear()} {church.name}. All rights reserved.
          </p>
          <span>Rooted in Christ. Growing together.</span>
        </div>
      </div>
    </footer>
  )
}
