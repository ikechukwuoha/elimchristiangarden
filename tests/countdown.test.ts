import assert from 'node:assert/strict'
import { test } from 'node:test'
import { countdownEvent, defaultCountdownInvitation, parseCountdownSettings, validateCountdownSelection } from '../src/lib/countdown'
import { cachedCountdownSettings, COUNTDOWN_DATA_ID, CountdownStorageError, readCountdownSettings, saveCountdownSettings } from '../src/lib/countdown-store'
import { markStorageSuccess, resetStorageHealth } from '../src/lib/storage-health'

const now = new Date('2026-11-06T12:00:00Z')
const destiny = { id: 'destiny', title: 'Destiny Conference 2026', date: '2026-12-01', time: '5:30 PM', location: '' }
const next = { ...destiny, id: 'next', title: 'New Year Gathering 2027', date: '2027-01-01' }
const settings = { enabled: true, eventId: 'next', invitation: 'Come and worship with us.' }

test('countdown settings validate display, programme selection, and invitation text', () => {
  assert.deepEqual(parseCountdownSettings({ ...settings, eventId: ' next ', invitation: ' Come and worship with us. ' }), settings)
  assert.equal(parseCountdownSettings({ enabled: false, eventId: '', invitation: '' }).invitation, defaultCountdownInvitation)
  for (const change of [{ enabled: 'yes' }, { enabled: undefined }, { eventId: '' }, { eventId: 'x'.repeat(81) }, { invitation: 42 }, { invitation: 'x'.repeat(121) }])
    assert.throws(() => parseCountdownSettings({ ...settings, ...change }))
})

test('explicit settings choose future programmes from any year, disable without fallback, and expire at Abuja midnight', () => {
  assert.equal(countdownEvent([destiny, next], null, now)?.id, destiny.id)
  assert.equal(countdownEvent([destiny, next], settings, now)?.id, next.id)
  assert.equal(countdownEvent([destiny, next], { ...settings, enabled: false }, now), undefined)
  assert.equal(countdownEvent([destiny], settings, now), undefined)
  assert.equal(countdownEvent([next], settings, new Date('2027-01-01T22:59:59Z'))?.id, next.id)
  assert.equal(countdownEvent([next], settings, new Date('2027-01-01T23:00:00Z')), undefined)
  assert.doesNotThrow(() => validateCountdownSelection(settings, [next], now))
  assert.throws(() => validateCountdownSelection(settings, [], now), /upcoming programme/)
  assert.throws(() => validateCountdownSelection(settings, [{ ...next, time: '' }], now), /start time/)
  assert.doesNotThrow(() => validateCountdownSelection({ ...settings, enabled: false }, [], now))
})

async function isolated(run: () => Promise<void>) {
  const originalFetch = globalThis.fetch
  const keys = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']
  const previous = keys.map((key) => process.env[key])
  process.env.CLOUDINARY_CLOUD_NAME = 'countdown-test'; process.env.CLOUDINARY_API_KEY = 'key'; process.env.CLOUDINARY_API_SECRET = 'secret'
  resetStorageHealth()
  try { await run() }
  finally {
    globalThis.fetch = originalFetch; resetStorageHealth()
    keys.forEach((key, index) => { if (previous[index] === undefined) delete process.env[key]; else process.env[key] = previous[index] })
  }
}

test('missing settings preserve the original countdown, while an unknown failed read is unavailable', async () => isolated(async () => {
  globalThis.fetch = async () => { throw new Error('Test connection failure') }
  assert.deepEqual(await cachedCountdownSettings(), { settings: null, available: false, unavailable: true })
  markStorageSuccess('countdown')
  globalThis.fetch = async () => Response.json({}, { status: 404 })
  assert.deepEqual(await cachedCountdownSettings(), { settings: null, available: true, unavailable: false })
  globalThis.fetch = async () => { throw new Error('Test connection failure') }
  assert.deepEqual(await cachedCountdownSettings(), { settings: null, available: true, unavailable: true })
}))

test('saved visibility and programme settings persist through reads and temporary outages', async () => isolated(async () => {
  const disabled = { ...settings, enabled: false }
  globalThis.fetch = async (_url, init) => {
    const file = (init?.body as FormData).get('file') as Blob
    assert.deepEqual(JSON.parse(await file.text()), disabled)
    return Response.json({ public_id: COUNTDOWN_DATA_ID })
  }
  await saveCountdownSettings(disabled)
  globalThis.fetch = async () => { throw new Error('Test connection failure') }
  assert.deepEqual(await cachedCountdownSettings(), { settings: disabled, available: true, unavailable: true })
  markStorageSuccess('countdown')
  globalThis.fetch = async (url) => String(url).startsWith('https://api.cloudinary.com/')
    ? Response.json({ secure_url: 'https://res.cloudinary.com/countdown-test/raw/upload/countdown.json' }) : Response.json(settings)
  assert.deepEqual(await readCountdownSettings(), settings)
}))

test('an unconfirmed save is rejected without retrying or changing the last saved settings', async () => isolated(async () => {
  globalThis.fetch = async () => Response.json({ public_id: COUNTDOWN_DATA_ID })
  await saveCountdownSettings(settings)
  let calls = 0
  globalThis.fetch = async () => { calls++; throw new Error('Test connection failure') }
  await assert.rejects(() => saveCountdownSettings({ ...settings, enabled: false }), CountdownStorageError)
  assert.equal(calls, 1)
  assert.equal((await cachedCountdownSettings()).settings?.enabled, true)
}))

test('countdown settings reject delivery URLs outside the configured Cloudinary account', async () => isolated(async () => {
  let calls = 0
  globalThis.fetch = async () => { calls++; return Response.json({ secure_url: 'https://unrelated.example/config.json' }) }
  await assert.rejects(() => readCountdownSettings(), /invalid file/)
  assert.equal(calls, 1)
}))
