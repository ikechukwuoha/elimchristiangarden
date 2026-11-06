'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { birthdayPeriod, nextCelebrationMidnight, visibleCelebrations, type Birthday } from '@/lib/birthdays'
import { upcomingProgrammes } from '@/lib/event-schedule'
import type { ChurchEvent } from '@/lib/events'
import type { CountdownSettings } from '@/lib/countdown'

type Period = ReturnType<typeof birthdayPeriod>
type Announcements = { period: Period; birthdays: Birthday[]; events?: ChurchEvent[]; countdown?: CountdownSettings | null; countdownAvailable?: boolean; unavailableSources?: string[] }
const AnnouncementsContext = createContext<{ data: Announcements | null; period: Period | null }>({ data: null, period: null })

export function useAnnouncements() {
  return useContext(AnnouncementsContext)
}

export default function AnnouncementsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const enabled = Boolean(pathname && pathname !== '/admin' && !pathname.startsWith('/admin/'))
  const [data, setData] = useState<Announcements | null>(null)
  const [period, setPeriod] = useState<Period | null>(null)

  useEffect(() => {
    if (!enabled) return
    let controller: AbortController | undefined
    let disposed = false
    let midnightTimer: ReturnType<typeof setTimeout>
    async function load() {
      const currentPeriod = birthdayPeriod()
      setPeriod((current) => current?.key === currentPeriod.key && current.day === currentPeriod.day ? current : currentPeriod)
      // Expire locally first: storage or an offline connection cannot keep an
      // old event on the ticker or popup after Abuja midnight.
      setData((current) => {
        if (!current || (current.period.key === currentPeriod.key && current.period.day === currentPeriod.day)) return current
        return { ...current, period: currentPeriod, birthdays: visibleCelebrations(current.birthdays, currentPeriod), events: upcomingProgrammes(current.events ?? [], currentPeriod) }
      })
      if (document.hidden) return
      controller?.abort()
      controller = new AbortController()
      try {
        const response = await fetch('/api/birthdays', { cache: 'no-store', signal: AbortSignal.any([controller.signal, AbortSignal.timeout(20000)]) })
        if (!response.ok || disposed) return
        const result: Announcements = await response.json()
        if (disposed) return
        const freshPeriod = birthdayPeriod()
        setData((current) => ({
          ...result, period: freshPeriod,
          birthdays: visibleCelebrations(result.unavailableSources?.includes('celebrations') && !result.birthdays.length ? current?.birthdays ?? [] : result.birthdays, freshPeriod),
          events: upcomingProgrammes(result.unavailableSources?.includes('events') && !result.events?.length ? current?.events ?? [] : result.events ?? [], freshPeriod),
          countdown: result.countdownAvailable === false && current?.countdownAvailable !== false && current?.countdown !== undefined ? current.countdown : result.countdown,
          countdownAvailable: result.countdownAvailable === false && current?.countdownAvailable !== false && current?.countdown !== undefined ? true : result.countdownAvailable,
        }))
        setPeriod(freshPeriod)
      } catch { /* Announcements never interrupt the page. */ }
    }
    function scheduleMidnight() {
      clearTimeout(midnightTimer)
      midnightTimer = setTimeout(() => { void load(); scheduleMidnight() }, Math.max(1, nextCelebrationMidnight() - Date.now()))
    }
    function onVisibility() {
      if (!document.hidden) { void load(); scheduleMidnight() }
    }
    void load()
    scheduleMidnight()
    const refresh = window.setInterval(() => { void load(); scheduleMidnight() }, 60000)
    document.addEventListener('visibilitychange', onVisibility)
    return () => { disposed = true; controller?.abort(); clearTimeout(midnightTimer); window.clearInterval(refresh); document.removeEventListener('visibilitychange', onVisibility) }
  }, [enabled])

  return <AnnouncementsContext.Provider value={{ data, period }}>{children}</AnnouncementsContext.Provider>
}
