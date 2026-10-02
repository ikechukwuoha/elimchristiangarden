'use client'

import { useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'

const updateEvent = 'elim-community-updated'

export function notifyCommunityUpdate() {
  window.dispatchEvent(new Event(updateEvent))
  try {
    window.localStorage.setItem(updateEvent, String(Date.now()))
  } catch {
    // Saving groups still succeeds when the browser disables local storage.
  }
}

export default function CommunityRefresh({ unavailable = false, className, message = 'We couldn’t load the fellowships and units just now. Please try again shortly.' }: { unavailable?: boolean; className?: string; message?: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    let lastRefresh = 0
    function refresh() {
      if (document.hidden || Date.now() - lastRefresh < 1000) return
      lastRefresh = Date.now()
      startTransition(() => router.refresh())
    }
    function storageChanged(event: StorageEvent) {
      if (event.key === updateEvent) refresh()
    }
    window.addEventListener('focus', refresh)
    window.addEventListener(updateEvent, refresh)
    window.addEventListener('storage', storageChanged)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.removeEventListener('focus', refresh)
      window.removeEventListener(updateEvent, refresh)
      window.removeEventListener('storage', storageChanged)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [router])

  if (!unavailable) return null

  return (
    <div className={className} role="status">
      <p>{message}</p>
      <button type="button" disabled={pending} onClick={() => startTransition(() => router.refresh())}>
        {pending ? 'Loading…' : 'Try again'}
      </button>
    </div>
  )
}
