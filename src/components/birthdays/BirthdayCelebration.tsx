'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { CakeSlice, CalendarDays } from 'lucide-react'
import { birthdayPeriod, celebrationKind, celebrationSummary, nextCelebrationMidnight, visibleCelebrations, type Birthday } from '@/lib/birthdays'
import type { ChurchEvent } from '@/lib/events'
import { popupDuration, popupItems, programmeToday, upcomingProgrammes } from '@/lib/popup-items'
import { CelebrationContent } from './BirthdayCard'
import ProgrammeCardContent from './ProgrammeCardContent'
import PopupCard from './PopupCard'
import styles from './birthdays.module.css'

type Celebration = { period: ReturnType<typeof birthdayPeriod>; birthdays: Birthday[]; events?: ChurchEvent[] }

function subscribeVisibility(callback: () => void) {
  document.addEventListener('visibilitychange', callback)
  return () => document.removeEventListener('visibilitychange', callback)
}
function subscribeMotion(callback: () => void) {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)')
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}

export default function BirthdayCelebration() {
  const [data, setData] = useState<Celebration | null>(null)
  const [open, setOpen] = useState(true)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [keyboardFocused, setKeyboardFocused] = useState(false)
  const reducedMotion = useSyncExternalStore(subscribeMotion, () => window.matchMedia('(prefers-reduced-motion: reduce)').matches, () => true)
  const visible = useSyncExternalStore(subscribeVisibility, () => !document.hidden, () => true)
  const launcher = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const restoreFocus = useRef(false)
  const focusOnOpen = useRef(false)
  const items = data ? popupItems(data.birthdays, data.events ?? [], data.period) : []
  const count = items.length
  const safeIndex = count ? index % count : 0
  const active = items[safeIndex]
  const duration = popupDuration(active)
  const activeId = active?.id

  useEffect(() => {
    let controller: AbortController | undefined
    let disposed = false
    let midnightTimer: ReturnType<typeof setTimeout>
    async function load() {
      if (document.hidden) return
      controller?.abort()
      controller = new AbortController()
      const currentPeriod = birthdayPeriod()
      // Expire celebrations and past programmes even if storage is unavailable.
      // Keep genuinely upcoming programmes across the month boundary.
      setData((current) => {
        if (!current) return null
        if (current.period.key === currentPeriod.key && current.period.day === currentPeriod.day) return current
        return { ...current, period: currentPeriod, birthdays: visibleCelebrations(current.birthdays, currentPeriod), events: upcomingProgrammes(current.events ?? [], currentPeriod) }
      })
      try {
        const response = await fetch('/api/birthdays', { cache: 'no-store', signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]) })
        if (!response.ok) return
        const result: Celebration = await response.json()
        if (!disposed) setData({ ...result, birthdays: visibleCelebrations(result.birthdays, result.period), events: upcomingProgrammes(result.events ?? [], result.period) })
      } catch { /* A celebration never interrupts the rest of the page. */ }
    }
    function onVisibility() {
      if (!document.hidden) { void load(); scheduleMidnight() }
    }
    function scheduleMidnight() {
      clearTimeout(midnightTimer)
      midnightTimer = setTimeout(() => {
        void load()
        scheduleMidnight()
      }, Math.max(1, nextCelebrationMidnight() - Date.now()))
    }
    void load()
    scheduleMidnight()
    const refresh = window.setInterval(() => { void load(); scheduleMidnight() }, 60000)
    document.addEventListener('visibilitychange', onVisibility)
    return () => { disposed = true; controller?.abort(); clearTimeout(midnightTimer); window.clearInterval(refresh); document.removeEventListener('visibilitychange', onVisibility) }
  }, [])

  const stopped = paused || keyboardFocused || reducedMotion
  useEffect(() => {
    if (!open || stopped || !visible || count < 2) return
    const timer = window.setTimeout(() => setIndex((current) => (current + 1) % count), duration)
    return () => window.clearTimeout(timer)
  }, [open, stopped, visible, count, index, activeId, duration])

  useEffect(() => {
    if (open && focusOnOpen.current) {
      panel.current?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true })
      focusOnOpen.current = false
    }
    if (!open && restoreFocus.current) {
      launcher.current?.focus({ preventScroll: true })
      restoreFocus.current = false
    }
  }, [open])

  function close() {
    restoreFocus.current = Boolean(panel.current?.contains(document.activeElement))
    setOpen(false)
    setKeyboardFocused(false)
  }

  if (!data || !active) return null
  const hasProgrammes = (data.events?.length ?? 0) > 0
  const LauncherIcon = hasProgrammes ? CalendarDays : CakeSlice
  const summary = hasProgrammes ? data.birthdays.length ? 'Celebrations & programmes' : 'Upcoming programmes' : `${data.period.label} · ${celebrationSummary(data.birthdays)}`
  return <aside className={styles.widget} aria-label="Church announcements">
    <button ref={launcher} type="button" className={styles.launcher} hidden={open} aria-expanded={open} aria-controls="birthday-celebration" onClick={() => { focusOnOpen.current = true; setOpen(true); setPaused(false); setKeyboardFocused(false); setIndex(0) }}>
      <span><LauncherIcon size={19} strokeWidth={1.5} aria-hidden="true" /></span>
      <span>{hasProgrammes ? 'Life at Elim' : 'Celebrate with us'}<small>{summary}</small></span>
      <span className={styles.launcherCount}>{count}</span>
    </button>
    {open && <div id="birthday-celebration" ref={panel} className={styles.popup}
      onFocus={(event) => { if (event.target.matches(':focus-visible')) setKeyboardFocused(true) }}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setKeyboardFocused(false) }}
      onKeyDown={(event) => { if (event.key === 'Escape') { event.preventDefault(); close() } }}>
      <PopupCard variant={active.kind === 'programme' ? 'programme' : celebrationKind(active.celebration)} slideKey={active.id}
        index={safeIndex} count={count} paused={stopped} allowAutoplay={!reducedMotion}
        onPrevious={(event) => { if (event.detail > 0) setKeyboardFocused(false); setIndex((safeIndex - 1 + count) % count) }}
        onNext={(event) => { if (event.detail > 0) setKeyboardFocused(false); setIndex((safeIndex + 1) % count) }}
        onPause={() => { if (stopped) { setPaused(false); setKeyboardFocused(false) } else setPaused(true) }} onClose={close}>
        {active.kind === 'programme'
          ? <ProgrammeCardContent programme={active.programme} today={programmeToday(data.period)} />
          : <CelebrationContent birthday={active.celebration} monthLabel={data.period.label} today={data.period.day} />}
      </PopupCard>
    </div>}
  </aside>
}
