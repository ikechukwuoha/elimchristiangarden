import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  addTestimony,
  isTestimonyArray,
  parseTestimonyInput,
  removeTestimony,
  seedTestimonies,
  slugifyName,
} from '../src/lib/testimonies'
import {
  addEvent,
  isEventArray,
  parseEventInput,
  removeEvent,
  slugifyEventTitle,
  todayIso,
  upcomingEvents,
  updateEvent,
} from '../src/lib/events'
import { eventDetails } from '../src/lib/event-details'

const validTestimony = {
  quote:
    'The Lord healed my mother after the church prayed for her throughout the fasting season.',
  name: 'Grace A.',
  role: 'Choir member',
}

test('seeded testimonies follow the shape shown on the page', () => {
  assert.ok(seedTestimonies.length >= 1)
  assert.ok(seedTestimonies.every((item) => item.quote && item.name))
  assert.ok(slugifyName('Grace A.') === 'grace-a')
})

test('testimony input is validated and ids stay unique', () => {
  const first = parseTestimonyInput(validTestimony, seedTestimonies)
  assert.equal(first.name, 'Grace A.')
  assert.equal(first.role, 'Choir member')
  const again = parseTestimonyInput(validTestimony, [
    ...seedTestimonies,
    first,
  ])
  assert.notEqual(again.id, first.id)
  const minimal = parseTestimonyInput(
    { quote: 'God provided a job after many months of trusting Him.', name: 'Dan' },
    [],
  )
  assert.equal(minimal.role, 'Member')
  for (const change of [
    { quote: 'too short' },
    { quote: '' },
    { quote: 'x'.repeat(1201) },
    { name: '' },
    { name: 'x'.repeat(61) },
  ]) {
    assert.throws(
      () => parseTestimonyInput({ ...validTestimony, ...change }, []),
      Error,
      JSON.stringify(change),
    )
  }
  const withNew = addTestimony(seedTestimonies, first)
  assert.equal(withNew.length, seedTestimonies.length + 1)
  assert.equal(removeTestimony(withNew, first.id).length, seedTestimonies.length)
  assert.throws(() => removeTestimony(withNew, 'missing'))
  assert.equal(isTestimonyArray([{ ...first, id: '' }]), false)
  assert.equal(isTestimonyArray([{ ...first, quote: 5 }]), false)
  assert.equal(isTestimonyArray([first]), true)
})

const validEvent = {
  title: 'December thanksgiving service',
  date: '2026-12-20',
  time: '8:30 AM',
  location: 'Main sanctuary',
}

test('event input is validated and ids stay unique', () => {
  const first = parseEventInput(validEvent, [])
  assert.equal(first.time, '8:30 AM')
  const second = parseEventInput(validEvent, [first])
  assert.notEqual(second.id, first.id)
  const minimal = parseEventInput({ title: 'Prayer meeting', date: '2026-11-05' }, [])
  assert.equal(minimal.location, 'Elim Garden, Bwari')
  assert.equal(minimal.time, '')
  for (const change of [
    { title: '' },
    { title: 'x'.repeat(81) },
    { date: '2026-13-40' },
    { date: 'soon' },
    { date: '' },
    { time: 'x'.repeat(41) },
  ]) {
    assert.throws(
      () => parseEventInput({ ...validEvent, ...change }, []),
      Error,
      JSON.stringify(change),
    )
  }
  const events = addEvent([first, second], minimal)
  assert.throws(() => removeEvent(events, 'missing'))
  assert.equal(removeEvent(events, minimal.id).length, 2)
  assert.equal(isEventArray([{ ...first, date: '2026-02-30' }]), false)
  assert.equal(isEventArray([first]), true)
  assert.ok(slugifyEventTitle('Carols & Candle light!') === 'carols-candle-light')
})

test('upcoming events keep future dates sorted and drop the past', () => {
  const events = [
    { id: 'a', title: 'Past event', date: '2026-01-01', time: '', location: '' },
    { id: 'b', title: 'Christmas', date: '2026-12-25', time: '9 AM', location: '' },
    { id: 'c', title: 'Harvest', date: '2026-11-08', time: '', location: '' },
    { id: 'd', title: 'Today’s gathering', date: '2026-10-02', time: '', location: '' },
  ]
  const upcoming = upcomingEvents(events, '2026-10-02')
  assert.deepEqual(
    upcoming.map((event) => event.id),
    ['d', 'c', 'b'],
  )
  assert.equal(upcomingEvents(events, '2027-01-01').length, 0)
  assert.match(todayIso(new Date('2026-10-02T23:30:00Z')), /^2026-10-02$/)
})

test('event themes and comma-separated Bible passages retain legacy event support', () => {
  const legacy = { id: 'destiny', ...validEvent, title: 'Destiny Conference 2026... Theme: Divine Settlement for a New Beginning' }
  assert.equal(isEventArray([legacy]), true)
  assert.deepEqual(eventDetails(legacy), { title: 'Destiny Conference 2026', theme: 'Divine Settlement for a New Beginning', texts: [] })
  const event = parseEventInput({ ...validEvent, theme: '  Divine Settlement  ', texts: '1 Peter 5:10, Psalm 126:1–3, , 1 Peter 5:10, ' }, [])
  assert.equal(event.theme, 'Divine Settlement')
  assert.deepEqual(event.texts, ['1 Peter 5:10', 'Psalm 126:1–3'])
  assert.equal(isEventArray([event]), true)
  const split = parseEventInput(legacy, [])
  assert.equal(split.title, 'Destiny Conference 2026')
  assert.equal(split.theme, 'Divine Settlement for a New Beginning')
  assert.equal(eventDetails({ title: legacy.title, theme: 'A new theme' }).theme, 'A new theme')
  assert.deepEqual(eventDetails({ title: 'Prayer night' }), { title: 'Prayer night', theme: '', texts: [] })
  assert.equal(eventDetails({ title: 'Theme: worship' }).title, 'Theme: worship')
  for (const change of [
    { theme: 'x'.repeat(161) }, { theme: 42 }, { texts: ['x'.repeat(121)] },
    { texts: [42] }, { texts: {} }, { texts: null },
    { texts: Array.from({ length: 13 }, (_, index) => `Passage ${index}`) },
  ]) assert.throws(() => parseEventInput({ ...validEvent, ...change }, []), Error, JSON.stringify(change))
  assert.equal(isEventArray([{ ...event, theme: 42 }]), false)
  assert.equal(isEventArray([{ ...event, texts: [null] }]), false)
  assert.equal(isEventArray([{ ...event, texts: [''] }]), false)
})

test('editing an event keeps its ID and list position without duplicating or changing other events', () => {
  const first = parseEventInput(validEvent, [])
  const second = parseEventInput({ ...validEvent, title: 'Prayer meeting' }, [first])
  const events = [first, second]
  const original = JSON.stringify(events)
  const updated = updateEvent(events, first.id, { ...validEvent, title: 'Destiny Conference', theme: 'Divine Settlement', texts: '1 Peter 5:10, Psalm 126:1–3' })
  assert.equal(updated.length, 2)
  assert.equal(updated[0].id, first.id)
  assert.equal(updated[0].title, 'Destiny Conference')
  assert.deepEqual(updated[0].texts, ['1 Peter 5:10', 'Psalm 126:1–3'])
  assert.equal(updated[1], second)
  assert.equal(JSON.stringify(events), original)
  assert.throws(() => updateEvent(events, 'missing', validEvent), /could not be found/)
  assert.throws(() => updateEvent(events, first.id, { ...validEvent, date: 'invalid' }))
  const full = Array.from({ length: 100 }, (_, index) => ({ ...first, id: `event-${index}` }))
  assert.throws(() => parseEventInput(validEvent, full), /maximum/)
  assert.equal(updateEvent(full, 'event-50', validEvent).length, 100)
  const cleared = updateEvent(updated, first.id, { ...validEvent, theme: '', texts: '' })[0]
  assert.equal(cleared.theme, '')
  assert.deepEqual(cleared.texts, [])
})
