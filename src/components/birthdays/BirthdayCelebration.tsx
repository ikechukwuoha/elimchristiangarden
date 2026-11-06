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
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const reducedMotion = useSyncExternalStore(subscribeMotion, () => window.matchMedia('(prefers-reduced-motion: reduce)').matches, () => true)
  const visible = useSyncExternalStore(subscribeVisibility, () => !document.hidden, () => true)
  const launcher = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const restoreFocus = useRef(false)
  const focusOnOpen = useRef(false)
  const openedPeriod = useRef('')
  const periodKey = data?.period.key ?? ''
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
      } catch { /* A celebration never interrupts the rest of the homepage. */ }
    }
    function onVisibility() {
      if (!document.hidden) void load()
    }
    void load()
    const refresh = window.setInterval(load, 60000)
    document.addEventListener('visibilitychange', onVisibility)
    return () => { disposed = true; controller?.abort(); window.clearInterval(refresh); document.removeEventListener('visibilitychange', onVisibility) }
  }, [])

  useEffect(() => {
    if (open || !visible || !periodKey || count === 0) return
    // Only one automatic opening per month in this tab, even after navigation.
    let dismissed = false
    try { dismissed = Boolean(sessionStorage.getItem(`elim-birthdays:${periodKey}`)) } catch { /* Storage may be blocked. */ }
    if (dismissed || openedPeriod.current === periodKey) return
    const timeout = window.setTimeout(() => {
      openedPeriod.current = periodKey
      try { sessionStorage.setItem(`elim-birthdays:${periodKey}`, 'seen') } catch { /* Storage may be blocked. */ }
      setIndex(0)
      setOpen(true)
    }, 2500)
    return () => window.clearTimeout(timeout)
  }, [periodKey, count, open, visible])

  const stopped = paused || reducedMotion
  useEffect(() => {
    if (!open || stopped || hovered || focused || !visible || count < 2) return
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % count), 6000)
    return () => window.clearInterval(timer)
  }, [open, stopped, hovered, focused, visible, count, index])

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
    setHovered(false)
    setFocused(false)
    try { sessionStorage.setItem(`elim-birthdays:${periodKey}`, 'dismissed') } catch { /* Dismissal still works without storage. */ }
  }

  if (!data || count === 0) return null
  const safeIndex = index % count
  return <aside className={styles.widget} aria-label="Church celebrations">
    <button ref={launcher} type="button" className={styles.launcher} hidden={open} aria-expanded={open} aria-controls="birthday-celebration" onClick={() => { focusOnOpen.current = true; setOpen(true); setPaused(true); setIndex(0) }}>
      <span><CakeSlice size={19} strokeWidth={1.5} aria-hidden="true" /></span>
      <span>Celebrate with us<small>{data.period.label} · {celebrationSummary(data.birthdays)}</small></span>
      <span className={styles.launcherCount}>{count}</span>
    </button>
    {open && <div id="birthday-celebration" ref={panel} className={styles.popup}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false) }}
      onKeyDown={(event) => { if (event.key === 'Escape') { event.preventDefault(); close() } }}>
      <BirthdayCard birthdays={data.birthdays} index={safeIndex} monthLabel={data.period.label} today={data.period.day} paused={stopped} allowAutoplay={!reducedMotion}
        onPrevious={() => { setPaused(true); setIndex((safeIndex - 1 + count) % count) }}
        onNext={() => { setPaused(true); setIndex((safeIndex + 1) % count) }}
        onPause={() => setPaused((current) => !current)} onClose={close} />
    </div>}
  </aside>
}
