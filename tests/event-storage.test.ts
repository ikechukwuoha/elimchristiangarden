import assert from 'node:assert/strict'
import { test } from 'node:test'
import { cachedEvents } from '../src/lib/events-cache'
import { EVENTS_DATA_ID, EventStorageError, lastGoodEvents, readEvents, saveEvents } from '../src/lib/events'
import { markStorageSuccess, resetStorageHealth } from '../src/lib/storage-health'

const event = { id: 'destiny', title: 'Destiny Conference 2026', date: '2026-12-01', time: '5:30 PM', location: 'Elim Garden' }

async function isolated(run: (warnings: unknown[][], errors: unknown[][]) => Promise<void>) {
  const originalFetch = globalThis.fetch
  const originalWarn = console.warn, originalError = console.error
  const warnings: unknown[][] = [], errors: unknown[][] = []
  const keys = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET', 'NODE_ENV']
  const previous = keys.map((key) => process.env[key])
  process.env.CLOUDINARY_CLOUD_NAME = 'events-test'
  process.env.CLOUDINARY_API_KEY = 'test-key'
  process.env.CLOUDINARY_API_SECRET = 'test-secret'
  console.warn = (...args) => { warnings.push(args) }
  console.error = (...args) => { errors.push(args) }
  resetStorageHealth()
  try { await run(warnings, errors) }
  finally {
    globalThis.fetch = originalFetch
    console.warn = originalWarn; console.error = originalError
    resetStorageHealth()
    keys.forEach((key, index) => {
      if (previous[index] === undefined) delete process.env[key]
      else process.env[key] = previous[index]
    })
  }
}

const stored = (records = [event]) => async (url: string | URL | Request) => String(url).startsWith('https://api.cloudinary.com/')
  ? Response.json({ secure_url: 'https://res.cloudinary.com/events-test/raw/upload/events.json' })
  : Response.json(records)

test('public events survive a storage outage without error-level logs, while strict admin reads still fail', async () => isolated(async (warnings, errors) => {
  globalThis.fetch = stored()
  assert.deepEqual(await cachedEvents(), [event])
  let calls = 0
  globalThis.fetch = async () => { calls++; throw Object.assign(new Error('Do not log request-secret'), { cause: { code: 'UND_ERR_CONNECT_TIMEOUT' } }) }
  assert.deepEqual(await cachedEvents(), [event])
  assert.equal(calls, 2) // One bounded retry for a quick read failure.
  assert.deepEqual(errors, [])
  assert.equal(warnings.length, 1)
  assert.deepEqual(warnings[0][1], { operation: 'read', codes: ['UND_ERR_CONNECT_TIMEOUT'], timedOut: true })
  assert.equal(JSON.stringify(warnings).includes('request-secret'), false)
  await assert.rejects(() => readEvents({ strict: true }), EventStorageError)
  assert.equal(calls, 2) // Circuit breaker does not repeatedly hit storage.
}))

test('a cold outage is unavailable, never a cached successful empty calendar, and a later read recovers', async () => isolated(async (_warnings, errors) => {
  globalThis.fetch = async () => { throw Object.assign(new Error('Connection reset'), { code: 'ECONNRESET' }) }
  assert.deepEqual(await cachedEvents(), [])
  await assert.rejects(() => cachedEvents({ strict: true }), EventStorageError)
  assert.deepEqual(errors, [])
  markStorageSuccess('events')
  globalThis.fetch = stored()
  assert.deepEqual(await cachedEvents({ strict: true }), [event])
  globalThis.fetch = stored([])
  assert.deepEqual(await cachedEvents({ strict: true }), [])
  assert.deepEqual(lastGoodEvents(), []) // A confirmed empty list may replace old events.
}))

test('development handles failed reads in the foreground and production caches public reads without caching admin reads', async () => isolated(async () => {
  const environmentVariables: Record<string, string | undefined> = process.env
  for (const environment of ['development', 'production']) {
    environmentVariables.NODE_ENV = environment
    const requests: RequestInit[] = []
    globalThis.fetch = async (url, init) => { requests.push(init ?? {}); return stored()(url) }
    await cachedEvents({ strict: true })
    assert.equal(requests.length, 2)
    assert.equal(requests[0].cache, environment === 'production' ? 'force-cache' : 'no-store')
    assert.equal(requests[1].cache, requests[0].cache)
    requests.length = 0
    await readEvents({ strict: true })
    assert.equal(requests[0].cache, 'no-store')
    assert.equal(requests[1].cache, 'no-store')
  }
}))

test('quick read failures retry once, but save failures are never retried or reported as success', async () => isolated(async () => {
  let reads = 0
  globalThis.fetch = async (url) => {
    if (reads++ === 0) throw Object.assign(new Error('Connection reset'), { code: 'ECONNRESET' })
    return stored()(url)
  }
  assert.deepEqual(await readEvents({ strict: true }), [event])
  assert.equal(reads, 3)
  let saves = 0
  globalThis.fetch = async () => { saves++; throw Object.assign(new Error('Connection reset'), { code: 'ECONNRESET' }) }
  await assert.rejects(() => saveEvents([{ ...event, title: 'Unsaved change' }]), EventStorageError)
  assert.equal(saves, 1)
  assert.deepEqual(lastGoodEvents(), [event])
  globalThis.fetch = async () => Response.json({ public_id: EVENTS_DATA_ID })
  await saveEvents([{ ...event, title: 'Confirmed change' }])
  assert.equal(lastGoodEvents()[0].title, 'Confirmed change')
}))

test('Cloudinary authorization failures remain explicit and are not retried as transport failures', async () => isolated(async (warnings, errors) => {
  let calls = 0
  globalThis.fetch = async () => { calls++; return Response.json({ error: 'private upstream response' }, { status: 403 }) }
  await assert.rejects(() => readEvents({ strict: true }), /denied access/)
  assert.equal(calls, 1)
  assert.deepEqual(errors, [])
  assert.deepEqual(warnings[0][1], { operation: 'read', status: 403 })
  assert.equal(JSON.stringify(warnings).includes('private upstream response'), false)
}))
