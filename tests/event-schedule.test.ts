import assert from 'node:assert/strict'
import { test } from 'node:test'
import { birthdayPeriod } from '../src/lib/birthdays'
import { countdownParts, destinyConference, programmeStartsAt, upcomingProgrammes } from '../src/lib/event-schedule'
import { todayIso, upcomingEvents, type ChurchEvent } from '../src/lib/events'

const conference: ChurchEvent = { id: 'destiny', title: 'Destiny Conference 2026... Theme: Divine Settlement', date: '2026-12-01', time: '5:30 PM', location: '' }

test('scroller and popup expire the same dates at Abuja midnight, across month and year boundaries', () => {
  for (const date of ['2026-11-06', '2026-11-30', '2026-12-31']) {
    const event = { ...conference, date }
    const before = new Date(`${date}T22:59:59.999Z`)
    const after = new Date(`${date}T23:00:00.000Z`)
    assert.equal(todayIso(before), date)
    assert.notEqual(todayIso(after), date)
    assert.equal(upcomingEvents([event], todayIso(before)).length, 1)
    assert.equal(upcomingProgrammes([event], birthdayPeriod(before)).length, 1)
    assert.equal(upcomingEvents([event], todayIso(after)).length, 0)
    assert.equal(upcomingProgrammes([event], birthdayPeriod(after)).length, 0)
  }
})

test('conference start times use Abuja time and support the event form’s common time formats', () => {
  for (const time of ['5:30 PM', '5:30pm', '5.30 p.m.', '17:30', '5:30 PM – 8:00 PM']) {
    assert.equal(programmeStartsAt({ ...conference, time }), Date.parse('2026-12-01T16:30:00Z'), time)
  }
  assert.equal(programmeStartsAt({ ...conference, time: '12 AM' }), Date.parse('2026-11-30T23:00:00Z'))
  assert.equal(programmeStartsAt({ ...conference, time: '12 PM' }), Date.parse('2026-12-01T11:00:00Z'))
  for (const time of ['', 'After worship', '25:00', '0 PM', '13 PM', '5:70 PM', '5'])
    assert.equal(programmeStartsAt({ ...conference, time }), null, time)
  assert.equal(programmeStartsAt({ ...conference, date: '2026-12-02', time: '6:00 PM' }), Date.parse('2026-12-02T17:00:00Z'))
})

test('countdown selects the saved 2026 Destiny Conference and excludes expired or unrelated programmes', () => {
  const unrelated = { ...conference, id: 'other', title: 'Prayer conference' }
  const nextYear = { ...conference, id: '2027', title: 'Destiny Conference 2027', date: '2027-12-01' }
  const now = new Date('2026-11-06T12:00:00Z')
  assert.equal(destinyConference([unrelated, nextYear, conference], now)?.id, conference.id)
  assert.equal(destinyConference([nextYear], now), undefined)
  assert.equal(destinyConference([conference], new Date('2026-12-01T22:59:59Z'))?.id, conference.id)
  assert.equal(destinyConference([conference], new Date('2026-12-01T23:00:00Z')), undefined)
})

test('countdown changes to started at the exact target and never displays negative values', () => {
  const now = Date.parse('2026-11-06T12:00:00Z')
  assert.deepEqual(countdownParts(now + (2 * 86400 + 3 * 3600 + 4 * 60 + 5) * 1000, now), { days: 2, hours: 3, minutes: 4, seconds: 5, started: false })
  assert.equal(countdownParts(now + 1, now).seconds, 1)
  assert.deepEqual(countdownParts(now, now), { days: 0, hours: 0, minutes: 0, seconds: 0, started: true })
  assert.deepEqual(countdownParts(now - 10000, now), { days: 0, hours: 0, minutes: 0, seconds: 0, started: true })
})
