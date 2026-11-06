'use client'

import type { MouseEventHandler } from 'react'
import Image from 'next/image'
import { CakeSlice, ChevronLeft, ChevronRight, Heart, Leaf, Pause, Play, X } from 'lucide-react'
import { anniversaryBlessing, birthdayBlessing, celebrationKind, type Birthday } from '@/lib/birthdays'
import styles from './birthdays.module.css'

export default function BirthdayCard({
  birthdays, index, monthLabel, today, paused, allowAutoplay = true, onPrevious, onNext, onPause, onClose,
}: {
  birthdays: Birthday[]
  index: number
  monthLabel: string
  today?: number
  paused: boolean
  allowAutoplay?: boolean
  onPrevious: MouseEventHandler<HTMLButtonElement>
  onNext: MouseEventHandler<HTMLButtonElement>
  onPause: () => void
  onClose?: () => void
}) {
  const birthday = birthdays[index] ?? birthdays[0]
  if (!birthday) return null
  const anniversary = celebrationKind(birthday) === 'anniversary'
  const Icon = anniversary ? Heart : CakeSlice
  return (
    <section className={`${styles.card} ${anniversary ? styles.anniversary : ''}`} aria-label={`${monthLabel} celebrations`} aria-roledescription="carousel">
      <header className={styles.header}>
        <span><Icon size={16} strokeWidth={1.5} aria-hidden="true" /> THE ELIM FAMILY</span>
        {onClose ? <button type="button" onClick={onClose} aria-label="Close celebrations"><X size={18} aria-hidden="true" /></button> : <Leaf size={18} aria-hidden="true" />}
      </header>
      <div className={styles.slideViewport}>
        <div className={styles.slide} key={`${birthday.id}-${birthday.kind ?? 'birthday'}`} role="group" aria-live={paused ? 'polite' : 'off'} aria-atomic="true" aria-roledescription="slide" aria-label={`${index + 1} of ${birthdays.length}`}>
          {anniversary ? <AnniversaryContent celebration={birthday} monthLabel={monthLabel} today={today} /> : <>
            <div className={styles.intro}>
              <p>A little joy. A lot of love.</p>
              <h2>Celebrating <em>you.</em></h2>
              <span>{monthLabel} · Birthday</span>
            </div>
            <div className={styles.portrait}>
              <Image src={birthday.photoUrl} alt={`Portrait of ${birthday.name}`} fill unoptimized sizes="180px" />
              <span className={styles.portraitLeaf}><Leaf size={20} strokeWidth={1.3} aria-hidden="true" /></span>
              <span className={styles.date}>{birthday.day === today ? 'Today · ' : ''}{birthday.day} {monthLabel}</span>
            </div>
            <div className={styles.copy}>
              <p className={styles.celebrate}>HAPPY BIRTHDAY</p>
              <h3>{birthday.name}</h3>
              <p className={styles.blessing}>{birthday.message || birthdayBlessing}</p>
            </div>
          </>}
        </div>
      </div>
      <footer className={styles.footer}>
        <span className={styles.withLove}><Heart size={12} strokeWidth={1.5} aria-hidden="true" /> With love, your Elim family</span>
        {birthdays.length > 1 && <div className={styles.controls}>
          <button type="button" onClick={onPrevious} aria-label="Previous celebrant"><ChevronLeft size={17} aria-hidden="true" /></button>
          <span>{String(index + 1).padStart(2, '0')} <span>/ {String(birthdays.length).padStart(2, '0')}</span></span>
          <button type="button" onClick={onNext} aria-label="Next celebrant"><ChevronRight size={17} aria-hidden="true" /></button>
          {allowAutoplay && <button type="button" onClick={onPause} aria-label={paused ? 'Play birthday slideshow' : 'Pause birthday slideshow'}>{paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}</button>}
        </div>}
      </footer>
    </section>
  )
}

function AnniversaryContent({ celebration, monthLabel, today }: { celebration: Birthday; monthLabel: string; today?: number }) {
  return <>
    <div className={styles.anniversaryIntro}>
      <span className={styles.rings} aria-hidden="true"><span /><span /></span>
      <p>A JOURNEY BLESSED BY GRACE</p>
      <h2>Happy <em>Anniversary.</em></h2>
    </div>
    <div className={styles.anniversaryPhoto}>
      <Image src={celebration.photoUrl} alt={`Anniversary photograph of ${celebration.name}`} fill unoptimized sizes="310px" />
      <span className={styles.anniversaryDate}><Heart size={12} strokeWidth={1.5} aria-hidden="true" />{celebration.day === today ? 'Celebrating today' : `${celebration.day} ${monthLabel}`}</span>
    </div>
    <div className={styles.anniversaryCopy}>
      <p className={styles.anniversaryLabel}>WITH LOVE, WE CELEBRATE</p>
      <h3>{celebration.name}</h3>
      <span className={styles.anniversaryRule} aria-hidden="true" />
      <p className={styles.anniversaryBlessing}>{celebration.message || anniversaryBlessing}</p>
    </div>
  </>
}
