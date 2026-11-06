'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { Pause, Play } from 'lucide-react'
import styles from './countdown.module.css'

function subscribeMotion(notify: () => void) {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)')
  media.addEventListener('change', notify)
  return () => media.removeEventListener('change', notify)
}
function subscribeVisibility(notify: () => void) {
  document.addEventListener('visibilitychange', notify)
  return () => document.removeEventListener('visibilitychange', notify)
}

export default function ConferenceMessages({ theme, invitation, dateLabel, dateTime }: { theme: string; invitation: string; dateLabel: string; dateTime: string }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [keyboardFocused, setKeyboardFocused] = useState(false)
  const reducedMotion = useSyncExternalStore(subscribeMotion, () => window.matchMedia('(prefers-reduced-motion: reduce)').matches, () => true)
  const visible = useSyncExternalStore(subscribeVisibility, () => !document.hidden, () => true)
  const messages = [
    ...(theme ? [{ kind: 'theme', label: 'THEME', text: theme, duration: 7000, control: 'Show conference theme' }] : []),
    { kind: 'invitation', label: 'YOU’RE INVITED', text: invitation, duration: 4000, control: 'Show conference invitation' },
    { kind: 'date', label: 'SAVE THE DATE', text: dateLabel, duration: 5000, control: 'Show conference date and time' },
  ]
  const safeIndex = index % messages.length
  const stopped = paused || keyboardFocused || reducedMotion
  const duration = messages[safeIndex].duration
  const count = messages.length
  useEffect(() => {
    if (stopped || !visible) return
    const timer = window.setTimeout(() => setIndex((current) => (current + 1) % count), duration)
    return () => window.clearTimeout(timer)
  }, [stopped, visible, safeIndex, count, duration, theme, invitation, dateTime])

  return <div className={styles.messageScreen} role="region" aria-label="Conference messages" aria-roledescription="carousel"
    onFocus={(event) => { if (event.target.matches(':focus-visible')) setKeyboardFocused(true) }}
    onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setKeyboardFocused(false) }}>
    <span className={styles.tvQuality} aria-hidden="true">SMART · HD</span>
    <div className={styles.screenViewport} aria-live={stopped ? 'polite' : 'off'} aria-atomic="true">
      {messages.map((message, position) => <div key={message.kind} className={`${styles.message} ${position === safeIndex ? styles.messageActive : ''}`} aria-hidden={position !== safeIndex}>
        <span>{message.label}</span>
        <p>{message.kind === 'date' ? <time dateTime={dateTime}>{message.text}</time> : message.text}</p>
      </div>)}
    </div>
    <span className={styles.tvBrand} aria-hidden="true"><i /> ELIM</span>
    <div className={styles.messageControls}>
      {messages.map((message, position) => <button key={message.kind} type="button" aria-label={message.control} aria-pressed={position === safeIndex}
        onClick={(event) => { setIndex(position); if (event.detail > 0) setKeyboardFocused(false) }}><span /></button>)}
      {!reducedMotion && <button type="button" aria-label={stopped ? 'Play conference messages' : 'Pause conference messages'}
        onClick={() => { if (stopped) { setPaused(false); setKeyboardFocused(false) } else setPaused(true) }}>
        {stopped ? <Play size={10} aria-hidden="true" /> : <Pause size={10} aria-hidden="true" />}
      </button>}
    </div>
  </div>
}
