import 'server-only'

// Shared circuit breaker for the Cloudinary JSON stores. When a read fails
// (for example on a flaky network), further reads fail fast for a short
// cooldown instead of waiting out the full timeout on every page load, and
// the last successful data is served in the meantime.

const COOLDOWN_MS = 60_000

type Entry = { failedUntil: number; lastGood?: unknown }
const state = new Map<string, Entry>()

function entry(key: string) {
  let item = state.get(key)
  if (!item) {
    item = { failedUntil: 0 }
    state.set(key, item)
  }
  return item
}

export function storageCircuitOpen(key: string, now = Date.now()) {
  return entry(key).failedUntil > now
}

export function markStorageFailure(
  key: string,
  cooldownMs = COOLDOWN_MS,
  now = Date.now(),
) {
  entry(key).failedUntil = now + cooldownMs
}

export function markStorageSuccess(key: string) {
  entry(key).failedUntil = 0
}

export function rememberStorageGood<T>(key: string, value: T) {
  entry(key).lastGood = value
}

export function recallStorageGood<T>(key: string): T | undefined {
  return entry(key).lastGood as T | undefined
}

export function resetStorageHealth() {
  state.clear()
}
