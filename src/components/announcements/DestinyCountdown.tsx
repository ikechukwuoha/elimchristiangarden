'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { CalendarClock, ChevronUp, Minus } from 'lucide-react'
import { countdownParts, programmeStartsAt } from '@/lib/event-schedule'
import { countdownEvent, defaultCountdownInvitation } from '@/lib/countdown'
import { eventDetails } from '@/lib/event-details'
import { useAnnouncements } from './AnnouncementsProvider'
import ConferenceMessages from './ConferenceMessages'
import styles from './countdown.module.css'

function subscribeClock(notify: () => void) {
  let timer: ReturnType<typeof setTimeout>
  function tick() {
    clearTimeout(timer)
    notify()
    if (!document.hidden) timer = setTimeout(tick, 1000 - Date.now() % 1000)
  }
  tick()
  document.addEventListener('visibilitychange', tick)
  return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', tick) }
}
const clockSnapshot = () => Math.floor(Date.now() / 1000) * 1000
const serverClockSnapshot = () => null

export default function DestinyCountdown() {
  const { data } = useAnnouncements()
  const event = data && data.countdownAvailable !== false && countdownEvent(data.events ?? [], data.countdown ?? null)
  const start = event ? programmeStartsAt(event) : null
  return event && start !== null ? <CountdownPanel start={start} title={eventDetails(event).title} theme={eventDetails(event).theme} invitation={data?.countdown?.invitation ?? defaultCountdownInvitation} /> : null
}

export function CountdownPanel({ start, title, theme, invitation = defaultCountdownInvitation, preview = false }: { start: number; title: string; theme: string; invitation?: string; preview?: boolean }) {
  const now = useSyncExternalStore(subscribeClock, clockSnapshot, serverClockSnapshot)
  const [minimized, setMinimized] = useState(false)
  const panel = useRef<HTMLElement>(null)
  useEffect(() => {
    if (preview) return
    const root = document.documentElement
    const previous = root.style.getPropertyValue('--conference-countdown-space')
    const measure = () => {
      if (panel.current) root.style.setProperty('--conference-countdown-space', `${Math.ceil(panel.current.getBoundingClientRect().height) + 20}px`)
    }
    const observer = new ResizeObserver(measure)
    if (panel.current) observer.observe(panel.current)
    measure()
    return () => {
      observer.disconnect()
      if (previous) root.style.setProperty('--conference-countdown-space', previous)
      else root.style.removeProperty('--conference-countdown-space')
    }
  }, [minimized, preview])
  if (now === null) return null
  const remaining = countdownParts(start, now)
  const dateLabel = new Date(start).toLocaleDateString('en-GB', { timeZone: 'Africa/Lagos', day: 'numeric', month: 'short' })
  const timeLabel = new Date(start).toLocaleTimeString('en-GB', { timeZone: 'Africa/Lagos', hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase()
  const heading = /^(.*?)\s+(20\d{2})$/.exec(title)
  const controlTitle = title.replace(/\s+20\d{2}$/, '')
  return <aside ref={panel} className={`${styles.countdown} ${minimized ? styles.minimized : ''} ${preview ? styles.preview : ''}`} aria-label={`${title} countdown${preview ? ' preview' : ''}`}>
    {minimized ? <button type="button" className={styles.expand} aria-label={`Expand ${controlTitle} countdown`} aria-expanded={false} onClick={() => setMinimized(false)}>
      <CalendarClock size={16} aria-hidden="true" />
      <span>{title} <span>· {remaining.started ? 'Happening today' : `${remaining.days}d ${remaining.hours}h`}</span></span>
      <ChevronUp size={15} aria-hidden="true" />
    </button> : <>
      <ConferenceMessages theme={theme} invitation={invitation} dateLabel={`${dateLabel} · ${timeLabel} WAT`} dateTime={new Date(start).toISOString()} />
      <div className={styles.heading}>
        <span>THE GATHERING IS NEAR</span>
        <strong>{heading ? <>{heading[1]} <em>{heading[2]}</em></> : title}</strong>
      </div>
      {!preview && <button type="button" className={styles.minimize} aria-label={`Minimize ${controlTitle} countdown`} aria-expanded={true} onClick={() => setMinimized(true)}><Minus size={17} aria-hidden="true" /></button>}
      {remaining.started ? <p className={styles.started}>HAPPENING TODAY</p> : <div className={styles.clock} role="timer" aria-label={`Time until ${title}`} aria-live="off">
        <span className="sr-only">{remaining.days} days, {remaining.hours} hours, {remaining.minutes} minutes, {remaining.seconds} seconds</span>
        {(['days', 'hours', 'minutes', 'seconds'] as const).map((unit) => <span className={unit === 'seconds' ? styles.seconds : undefined} key={unit} aria-hidden="true"><strong>{String(remaining[unit]).padStart(2, '0')}</strong><small>{unit === 'minutes' ? 'MINS' : unit === 'seconds' ? 'SECS' : unit.toUpperCase()}</small></span>)}
      </div>}
    </>}
  </aside>
}
