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

type DisplayControls = { compact?: boolean; open?: boolean; onOpenChange?: (open: boolean) => void }

export default function DestinyCountdown(controls: DisplayControls) {
  const { data } = useAnnouncements()
  const event = data && data.countdownAvailable !== false && countdownEvent(data.events ?? [], data.countdown ?? null)
  const start = event ? programmeStartsAt(event) : null
  return event && start !== null ? <CountdownPanel {...controls} start={start} title={eventDetails(event).title} theme={eventDetails(event).theme} invitation={data?.countdown?.invitation ?? defaultCountdownInvitation} /> : null
}

export function CountdownPanel({ start, title, theme, invitation = defaultCountdownInvitation, preview = false, compact = false, open, onOpenChange }: { start: number; title: string; theme: string; invitation?: string; preview?: boolean } & DisplayControls) {
  const now = useSyncExternalStore(subscribeClock, clockSnapshot, serverClockSnapshot)
  const [locallyMinimized, setLocallyMinimized] = useState(false)
  const minimized = open === undefined ? locallyMinimized : !open
  const launcher = useRef<HTMLButtonElement>(null)
  const details = useRef<HTMLDivElement>(null)
  const focusOnOpen = useRef(false)
  const restoreFocus = useRef(false)
  useEffect(() => {
    if (!minimized && focusOnOpen.current) {
      details.current?.querySelector<HTMLButtonElement>('[data-countdown-close]')?.focus({ preventScroll: true })
      focusOnOpen.current = false
    }
    if (minimized && restoreFocus.current) {
      launcher.current?.focus({ preventScroll: true })
      restoreFocus.current = false
    }
  }, [minimized])

  function setExpanded(expanded: boolean) {
    if (onOpenChange) onOpenChange(expanded)
    else setLocallyMinimized(!expanded)
  }
  function collapse() {
    restoreFocus.current = Boolean(details.current?.contains(document.activeElement))
    setExpanded(false)
  }
  if (now === null) return null
  const remaining = countdownParts(start, now)
  const dateLabel = new Date(start).toLocaleDateString('en-GB', { timeZone: 'Africa/Lagos', day: 'numeric', month: 'short' })
  const timeLabel = new Date(start).toLocaleTimeString('en-GB', { timeZone: 'Africa/Lagos', hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase()
  const heading = /^(.*?)\s+(20\d{2})$/.exec(title)
  const controlTitle = title.replace(/\s+20\d{2}$/, '')
  const clock = remaining.started ? <p className={styles.started}>HAPPENING TODAY</p> : <div className={styles.clock} role="timer" aria-label={`Time until ${title}`} aria-live="off">
    <span className="sr-only">{remaining.days} days, {remaining.hours} hours, {remaining.minutes} minutes, {remaining.seconds} seconds</span>
    {(['days', 'hours', 'minutes', 'seconds'] as const).map((unit) => <span className={unit === 'seconds' ? styles.seconds : undefined} key={unit} aria-hidden="true"><strong>{String(remaining[unit]).padStart(2, '0')}</strong><small>{compact ? unit.toUpperCase() : unit === 'minutes' ? 'MINS' : unit === 'seconds' ? 'SECS' : unit.toUpperCase()}</small></span>)}
  </div>

  if (compact && !preview) return <aside className={styles.mobileCountdown} data-mobile-countdown aria-label={`${title} countdown`}>
    <span className={styles.mobileTitle}>{title}</span>
    {clock}
  </aside>

  return <aside className={`${styles.countdown} ${minimized ? styles.minimized : ''} ${preview ? styles.preview : ''}`} aria-label={`${title} countdown${preview ? ' preview' : ''}`}>
    <button ref={launcher} type="button" className={styles.expand} hidden={!minimized} aria-label={`Expand ${controlTitle} countdown`} aria-expanded={!minimized} aria-controls="conference-countdown-details" onClick={() => {
      if (!minimized) { collapse(); return }
      focusOnOpen.current = true; setExpanded(true)
    }}>
      <CalendarClock size={16} aria-hidden="true" />
      <span>{title} <span>· {remaining.started ? 'Happening today' : `${remaining.days}d ${remaining.hours}h`}</span></span>
      <ChevronUp size={15} aria-hidden="true" />
    </button>
    {!minimized && <div ref={details} id="conference-countdown-details" className={styles.details} onKeyDown={(event) => {
      if (!preview && event.key === 'Escape') { event.preventDefault(); collapse() }
    }}>
      <ConferenceMessages theme={theme} invitation={invitation} dateLabel={`${dateLabel} · ${timeLabel} WAT`} dateTime={new Date(start).toISOString()} />
      <div className={styles.heading}>
        <span>THE GATHERING IS NEAR</span>
        <strong>{heading ? <>{heading[1]} <em>{heading[2]}</em></> : title}</strong>
      </div>
      {!preview && <button type="button" className={styles.minimize} data-countdown-close aria-label={`Minimize ${controlTitle} countdown`} aria-expanded={true} onClick={collapse}><Minus size={17} aria-hidden="true" /></button>}
      {clock}
    </div>}
  </aside>
}
