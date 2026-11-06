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
      <div className={styles.intro}>
        <p>A little joy. A lot of love.</p>
        <h2>{anniversary ? <>A beautiful <em>milestone.</em></> : <>Celebrating <em>you.</em></>}</h2>
        <span>{monthLabel} · {anniversary ? 'Anniversary' : 'Birthday'}</span>
      </div>
      <div className={styles.slideViewport}>
      <div className={styles.slide} key={`${birthday.id}-${birthday.kind ?? 'birthday'}`} role="group" aria-live={paused ? 'polite' : 'off'} aria-atomic="true" aria-roledescription="slide" aria-label={`${index + 1} of ${birthdays.length}`}>
        <div className={styles.portrait}>
          <Image src={birthday.photoUrl} alt={`Portrait of ${birthday.name}`} fill unoptimized sizes="180px" />
          <span className={styles.portraitLeaf}>{anniversary ? <Heart size={20} strokeWidth={1.3} aria-hidden="true" /> : <Leaf size={20} strokeWidth={1.3} aria-hidden="true" />}</span>
          <span className={styles.date}>{birthday.day === today ? 'Today · ' : ''}{birthday.day} {monthLabel}</span>
        </div>
        <div className={styles.copy}>
          <p className={styles.celebrate}>{anniversary ? 'HAPPY ANNIVERSARY' : 'HAPPY BIRTHDAY'}</p>
          <h3>{birthday.name}</h3>
          <p className={styles.blessing}>{birthday.message || (anniversary ? anniversaryBlessing : birthdayBlessing)}</p>
        </div>
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
