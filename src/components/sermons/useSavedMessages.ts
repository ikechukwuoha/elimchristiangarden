'use client'

import { useMemo, useSyncExternalStore } from 'react'

const storageKey = 'elim:saved-messages'
const changeEvent = 'elim:saved-messages-changed'

function readSnapshot() {
  try {
    return window.localStorage.getItem(storageKey) || '[]'
  } catch {
    return '[]'
  }
}
function serverSnapshot() {
  return '[]'
}
function parseIds(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value)
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string')
      : []
  } catch {
    return []
  }
}
function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener(changeEvent, callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener(changeEvent, callback)
  }
}

export default function useSavedMessages() {
  const snapshot = useSyncExternalStore(subscribe, readSnapshot, serverSnapshot)
  const savedIds = useMemo(() => parseIds(snapshot), [snapshot])
  function toggleSaved(id: string) {
    try {
      const current = parseIds(readSnapshot())
      const next = current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id]
      window.localStorage.setItem(storageKey, JSON.stringify(next))
      window.dispatchEvent(new Event(changeEvent))
      return true
    } catch {
      return false
    }
  }
  return { savedIds, toggleSaved }
}
