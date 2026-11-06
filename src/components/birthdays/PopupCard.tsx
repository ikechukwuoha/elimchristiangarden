'use client'

import type { MouseEventHandler, ReactNode } from 'react'
import { CakeSlice, CalendarDays, ChevronLeft, ChevronRight, Heart, Leaf, Pause, Play, X } from 'lucide-react'
import styles from './birthdays.module.css'

export type PopupControls = {
  index: number
  count: number
  paused: boolean
  allowAutoplay?: boolean
  onPrevious: MouseEventHandler<HTMLButtonElement>
  onNext: MouseEventHandler<HTMLButtonElement>
  onPause: () => void
  onClose?: () => void
}

export default function PopupCard({
  variant, slideKey, children, index, count, paused, allowAutoplay = true, onPrevious, onNext, onPause, onClose,
}: PopupControls & { variant: 'birthday' | 'anniversary' | 'programme'; slideKey: string; children: ReactNode }) {
  const programme = variant === 'programme'
  const Icon = programme ? CalendarDays : variant === 'anniversary' ? Heart : CakeSlice
  return <section className={`${styles.card} ${variant === 'birthday' ? '' : styles[variant]}`} aria-label="Elim announcements" aria-roledescription="carousel">
    <header className={styles.header}>
      <span><Icon size={16} strokeWidth={1.5} aria-hidden="true" /> {programme ? 'GATHER WITH ELIM' : 'THE ELIM FAMILY'}</span>
      {onClose ? <button type="button" onClick={onClose} aria-label="Close announcements"><X size={18} aria-hidden="true" /></button> : <Leaf size={18} aria-hidden="true" />}
    </header>
    <div className={styles.slideViewport}>
      <div className={styles.slide} key={slideKey} role="group" aria-live={paused ? 'polite' : 'off'} aria-atomic="true" aria-roledescription="slide" aria-label={`${index + 1} of ${count}`}>
        {children}
      </div>
    </div>
    <footer className={styles.footer}>
      <span className={styles.withLove}>{programme ? <Leaf size={12} strokeWidth={1.5} aria-hidden="true" /> : <Heart size={12} strokeWidth={1.5} aria-hidden="true" />}{programme ? 'There’s a place for you here' : 'With love, your Elim family'}</span>
      {count > 1 && <div className={styles.controls}>
        <button type="button" onClick={onPrevious} aria-label="Previous card"><ChevronLeft size={17} aria-hidden="true" /></button>
        <span>{String(index + 1).padStart(2, '0')} <span>/ {String(count).padStart(2, '0')}</span></span>
        <button type="button" onClick={onNext} aria-label="Next card"><ChevronRight size={17} aria-hidden="true" /></button>
        {allowAutoplay && <button type="button" onClick={onPause} aria-label={paused ? 'Play popup slideshow' : 'Pause popup slideshow'}>{paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}</button>}
      </div>}
    </footer>
  </section>
}
