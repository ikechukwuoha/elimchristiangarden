'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { CakeSlice } from 'lucide-react'
import { birthdayPeriod, celebrationSummary, type Birthday } from '@/lib/birthdays'
import BirthdayCard from './BirthdayCard'
import styles from './birthdays.module.css'

type Celebration = { period: ReturnType<typeof birthdayPeriod>; birthdays: Birthday[] }

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
  const count = data?.birthdays.length ?? 0

  useEffect(() => {
    let controller: AbortController | undefined
    let disposed = false
    async function load() {
      if (document.hidden) return
      controller?.abort()
      controller = new AbortController()
      // Clear last month's card even if this month's request cannot complete.
      const currentKey = birthdayPeriod().key
      setData((current) => current && current.period.key !== currentKey ? null : current)
      try {
        const response = await fetch('/api/birthdays', { cache: 'no-store', signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]) })
        if (!response.ok) return
        const result: Celebration = await response.json()
        if (!disposed) setData(result)
      } catch { /* A celebration never interrupts the rest of the page. */ }
    }
    function onVisibility() {
      if (!document.hidden) void load()
    }
    void load()
    const refresh = window.setInterval(load, 60000)
    document.addEventListener('visibilitychange', onVisibility)
    return () => { disposed = true; controller?.abort(); window.clearInterval(refresh); document.removeEventListener('visibilitychange', onVisibility) }
  }, [])

  const stopped = paused || keyboardFocused || reducedMotion
  useEffect(() => {
    if (!open || stopped || !visible || count < 2) return
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % count), 6000)
    return () => window.clearInterval(timer)
  }, [open, stopped, visible, count, index])

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

  if (!data || count === 0) return null
  const safeIndex = index % count
  return <aside className={styles.widget} aria-label="Church celebrations">
    <button ref={launcher} type="button" className={styles.launcher} hidden={open} aria-expanded={open} aria-controls="birthday-celebration" onClick={() => { focusOnOpen.current = true; setOpen(true); setPaused(false); setKeyboardFocused(false); setIndex(0) }}>
      <span><CakeSlice size={19} strokeWidth={1.5} aria-hidden="true" /></span>
      <span>Celebrate with us<small>{data.period.label} · {celebrationSummary(data.birthdays)}</small></span>
      <span className={styles.launcherCount}>{count}</span>
    </button>
    {open && <div id="birthday-celebration" ref={panel} className={styles.popup}
      onFocus={(event) => { if (event.target.matches(':focus-visible')) setKeyboardFocused(true) }}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setKeyboardFocused(false) }}
      onKeyDown={(event) => { if (event.key === 'Escape') { event.preventDefault(); close() } }}>
      <BirthdayCard birthdays={data.birthdays} index={safeIndex} monthLabel={data.period.label} today={data.period.day} paused={stopped} allowAutoplay={!reducedMotion}
        onPrevious={(event) => { if (event.detail > 0) setKeyboardFocused(false); setIndex((safeIndex - 1 + count) % count) }}
        onNext={(event) => { if (event.detail > 0) setKeyboardFocused(false); setIndex((safeIndex + 1) % count) }}
        onPause={() => { if (stopped) { setPaused(false); setKeyboardFocused(false) } else setPaused(true) }} onClose={close} />
    </div>}
  </aside>
}
