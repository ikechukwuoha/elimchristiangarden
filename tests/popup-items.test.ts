import assert from 'node:assert/strict'
import { test } from 'node:test'
import { birthdayPeriod, type Birthday } from '../src/lib/birthdays'
import { popupDuration, popupItems, programmeToday, upcomingProgrammes } from '../src/lib/popup-items'
import type { ChurchEvent } from '../src/lib/events'
import { EVENTS_DATA_ID, lastGoodEvents, readEvents, saveEvents } from '../src/lib/events'
import { resetStorageHealth } from '../src/lib/storage-health'

const period = birthdayPeriod(new Date('2026-11-06T12:00:00Z'))
const birthday: Birthday = { id: 'shared-id', name: 'Bro. John Doe', month: 11, day: 1, message: '', photoId: '', photoUrl: '' }
const anniversary: Birthday = { ...birthday, id: 'anniversary', kind: 'anniversary', name: 'Bro. John & Sis. Jane Doe', day: 6 }
const programme: ChurchEvent = { id: 'shared-id', title: 'Thanksgiving service', date: '2026-11-08', time: '8:30 AM', location: 'Main sanctuary' }

test('upcoming programmes include today and future dates sorted in order, across month/year boundaries', () => {
  const records = [programme,
    { ...programme, id: 'past', date: '2026-11-05' },
    { ...programme, id: 'today', date: '2026-11-06' },
    { ...programme, id: 'next-year', date: '2027-01-01' },
    { ...programme, id: 'next-month', date: '2026-12-01' },
  ]
  const original = JSON.stringify(records)
  assert.equal(programmeToday(period), '2026-11-06')
  assert.deepEqual(upcomingProgrammes(records, period).map((event) => event.id), ['today', programme.id, 'next-month', 'next-year'])
  assert.equal(JSON.stringify(records), original)
  assert.deepEqual(upcomingProgrammes(records, birthdayPeriod(new Date('2026-12-31T23:00:00Z'))).map((event) => event.id), ['next-year'])
})

test('popup alternates programmes with eligible celebrations and keeps their identities distinct', () => {
  const futureBirthday = { ...birthday, id: 'future-birthday', day: 7 }
  const pastProgramme = { ...programme, id: 'past-programme', date: '2026-11-05' }
  const secondProgramme = { ...programme, id: 'later-programme', date: '2026-11-09' }
  const items = popupItems([anniversary, futureBirthday, birthday], [secondProgramme, pastProgramme, programme], period)
  assert.deepEqual(items.map((item) => item.kind), ['celebration', 'programme', 'celebration', 'programme'])
  assert.deepEqual(items.map((item) => item.id), ['celebration:shared-id', 'programme:shared-id', 'celebration:anniversary', 'programme:later-programme'])
  assert.deepEqual(items.map(popupDuration), [6000, 12000, 6000, 12000])
})

test('either source can populate the popup on its own, including every upcoming programme', () => {
  assert.equal(popupItems([], [programme], period)[0].kind, 'programme')
  assert.equal(popupItems([birthday], [], period)[0].kind, 'celebration')
  assert.deepEqual(popupItems([], [], period), [])
  const events = Array.from({ length: 12 }, (_, index) => ({ ...programme, id: `programme-${index}` }))
  assert.equal(popupItems([], events, period).length, 12)
})

test('programme cards expire at Abuja midnight, while upcoming cards survive celebration month-end expiry', () => {
  const eventToday = { ...programme, date: '2026-11-06' }
  const before = birthdayPeriod(new Date('2026-11-06T22:59:59.999Z'))
  const after = birthdayPeriod(new Date('2026-11-06T23:00:00.000Z'))
  assert.equal(upcomingProgrammes([eventToday], before).length, 1)
  assert.equal(upcomingProgrammes([eventToday], after).length, 0)
  const decemberProgramme = { ...programme, date: '2026-12-02' }
  const nextMonth = popupItems([birthday, anniversary], [decemberProgramme], birthdayPeriod(new Date('2026-11-30T23:00:00Z')))
  assert.equal(nextMonth.length, 1)
  assert.equal(nextMonth[0].kind, 'programme')
})

test('a confirmed event save remains available if the following storage read fails', async () => {
  const originalFetch = globalThis.fetch
  const keys = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']
  const previous = keys.map((key) => process.env[key])
  process.env.CLOUDINARY_CLOUD_NAME = 'popup-test'
  process.env.CLOUDINARY_API_KEY = 'test-key'
  process.env.CLOUDINARY_API_SECRET = 'test-secret'
  resetStorageHealth()
  try {
    const detailed = { ...programme, theme: 'Divine Settlement', texts: ['1 Peter 5:10', 'Psalm 126:1–3'] }
    globalThis.fetch = async (_url, init) => {
      const file = (init?.body as FormData).get('file') as Blob
      assert.deepEqual(JSON.parse(await file.text()), [detailed])
      return Response.json({ public_id: EVENTS_DATA_ID })
    }
    await saveEvents([detailed])
    assert.deepEqual(lastGoodEvents(), [detailed])
    resetStorageHealth()
    globalThis.fetch = async (url) => String(url).startsWith('https://api.cloudinary.com/')
      ? Response.json({ secure_url: 'https://res.cloudinary.com/popup-test/raw/upload/events.json' })
      : Response.json([detailed])
    assert.deepEqual(await readEvents({ strict: true }), [detailed])
    globalThis.fetch = async () => { throw new Error('Test connection failure') }
    assert.deepEqual(await readEvents(), [detailed])
  } finally {
    globalThis.fetch = originalFetch
    resetStorageHealth()
    keys.forEach((key, index) => {
      if (previous[index] === undefined) delete process.env[key]
      else process.env[key] = previous[index]
    })
  }
})
