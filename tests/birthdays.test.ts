import assert from 'node:assert/strict'
import { test } from 'node:test'
import { v2 as cloudinary } from 'cloudinary'
import { birthdayPeriod, celebrationKind, celebrationSummary, isBirthdayArray, monthlyBirthdays, parseBirthdayInput, validBirthdayPhoto } from '../src/lib/birthdays'
import { birthdayUploadTicket, validateBirthdayUpload } from '../src/lib/admin/birthday-upload'
import { BIRTHDAYS_DATA_ID, readBirthdays, saveBirthdays } from '../src/lib/birthday-store'
import { resetStorageHealth } from '../src/lib/storage-health'

const cloudName = 'birthday-test'
process.env.CLOUDINARY_CLOUD_NAME = cloudName
process.env.CLOUDINARY_API_KEY = 'test-key'
process.env.CLOUDINARY_API_SECRET = 'test-secret'
const photoId = 'elim/birthdays/12345678-1234-1234-1234-123456789abc'
const photoUrl = `https://res.cloudinary.com/${cloudName}/image/upload/v123/${photoId}.jpg`
const input = { name: ' Bro. John Doe ', month: 11, day: 6, message: '', photoId, photoUrl }
const birthday = { ...parseBirthdayInput(input, cloudName), id: '22345678-1234-1234-1234-123456789abc' }

test('birthdays validate real month/day pairs, allow leap days, and never need a birth year', () => {
  assert.equal(birthday.name, 'Bro. John Doe')
  assert.equal('year' in birthday, false)
  assert.equal(parseBirthdayInput({ ...input, month: 2, day: 29 }, cloudName).day, 29)
  for (const change of [{ month: 0 }, { month: 13 }, { day: 0 }, { day: 1.5 }, { month: 2, day: 30 }, { month: 4, day: 31 }, { name: ' ' }, { name: 'x'.repeat(81) }, { message: 'x'.repeat(241) }]) {
    assert.throws(() => parseBirthdayInput({ ...input, ...change }, cloudName))
  }
  assert.equal(isBirthdayArray([birthday], cloudName), true)
  assert.equal(isBirthdayArray([birthday, birthday], cloudName), false)
  assert.equal(isBirthdayArray([{ ...birthday, id: '' }], cloudName), false)
})

test('birthdays and anniversaries are distinct, recur together, and preserve legacy birthdays', () => {
  const anniversary = { ...parseBirthdayInput({ ...input, name: 'Bro. John & Sis. Jane Doe', kind: 'anniversary', day: 18 }, cloudName), id: '32345678-1234-1234-1234-123456789abc' }
  assert.equal(anniversary.kind, 'anniversary')
  assert.equal(birthday.kind, 'birthday')
  const { kind: _kind, ...legacy } = birthday
  assert.equal(celebrationKind(legacy), 'birthday')
  assert.equal(isBirthdayArray([legacy, anniversary], cloudName), true)
  assert.equal(celebrationSummary([legacy, anniversary]), 'Birthdays & anniversaries')
  assert.equal(celebrationSummary([anniversary]), 'Anniversaries')
  assert.equal(celebrationSummary([legacy]), 'Birthdays')
  assert.deepEqual(monthlyBirthdays([anniversary, legacy], 11).map(celebrationKind), ['birthday', 'anniversary'])
  for (const kind of ['event', '', null, 42]) assert.throws(() => parseBirthdayInput({ ...input, kind }, cloudName))
})

test('month rollover follows Abuja time, including the year boundary', () => {
  assert.deepEqual(birthdayPeriod(new Date('2026-10-31T23:30:00Z')), { key: '2026-11', month: 11, day: 1, label: 'November' })
  assert.equal(birthdayPeriod(new Date('2026-12-31T23:00:00Z')).key, '2027-01')
  const later = { ...birthday, id: 'later', day: 27 }
  const other = { ...birthday, id: 'other', month: 12 }
  assert.deepEqual(monthlyBirthdays([later, other, birthday], 11).map((item) => item.id), [birthday.id, 'later'])
  assert.equal(monthlyBirthdays([birthday], 1).length, 0)
  assert.equal(monthlyBirthdays([birthday], birthdayPeriod(new Date('2027-11-06T12:00:00Z')).month).length, 1)
})

test('only birthday portraits from the configured Cloudinary account are accepted', () => {
  assert.equal(validBirthdayPhoto(photoId, photoUrl, cloudName), true)
  for (const url of ['https://evil.example/portrait.jpg', photoUrl.replace(cloudName, 'another-cloud'), photoUrl.replace('/birthdays/', '/media/'), photoUrl.replace('https:', 'http:'), `${photoUrl}?anything=1`, photoUrl.replace('.jpg', '.svg')]) {
    assert.equal(validBirthdayPhoto(photoId, url, cloudName), false, url)
  }
  assert.throws(() => parseBirthdayInput({ ...input, photoUrl: '' }, cloudName))
})

test('portrait signatures isolate birthdays from the gallery and enforce image formats', () => {
  validateBirthdayUpload({ filename: 'portrait.jpg', mime: 'image/jpeg', bytes: 1024 })
  for (const change of [{ filename: 'portrait.svg', mime: 'image/svg+xml' }, { mime: 'text/plain' }, { bytes: 0 }, { bytes: 10 * 1024 * 1024 + 1 }]) {
    assert.throws(() => validateBirthdayUpload({ filename: 'portrait.jpg', mime: 'image/jpeg', bytes: 1024, ...change }))
  }
  const ticket = birthdayUploadTicket()
  assert.equal(ticket.params.tags, 'elim-birthday-portrait')
  assert.ok(ticket.params.public_id.startsWith('elim/birthdays/'))
  assert.equal(ticket.params.overwrite, 'false')
  assert.equal(ticket.signature, cloudinary.utils.api_sign_request(ticket.params, 'test-secret'))
  assert.notEqual(ticket.params.public_id, birthdayUploadTicket().params.public_id)
})

test('durable storage distinguishes an empty calendar from a failure and saves confirmed changes', async () => {
  const original = globalThis.fetch
  resetStorageHealth()
  try {
    globalThis.fetch = async () => new Response(null, { status: 404 })
    assert.deepEqual(await readBirthdays(), [])
    globalThis.fetch = async () => new Response(null, { status: 500 })
    await assert.rejects(readBirthdays(), /unavailable/)
    resetStorageHealth()
    globalThis.fetch = async (url) => Response.json(String(url).startsWith('https://api.cloudinary.com/')
      ? { secure_url: `https://res.cloudinary.com/${cloudName}/raw/upload/v1/${BIRTHDAYS_DATA_ID}` } : [birthday])
    assert.deepEqual(await readBirthdays(), [birthday])
    const { kind: _kind, ...legacy } = birthday
    globalThis.fetch = async (url) => Response.json(String(url).startsWith('https://api.cloudinary.com/')
      ? { secure_url: `https://res.cloudinary.com/${cloudName}/raw/upload/v1/${BIRTHDAYS_DATA_ID}` } : [legacy])
    assert.equal((await readBirthdays())[0].kind, 'birthday')
    resetStorageHealth()
    globalThis.fetch = async (url) => Response.json(String(url).startsWith('https://api.cloudinary.com/')
      ? { secure_url: 'https://evil.example/data.json' } : [])
    await assert.rejects(readBirthdays(), /invalid file/)
    globalThis.fetch = async (_url, init) => {
      assert.equal(init?.method, 'POST')
      const form = init?.body as FormData
      assert.equal(form.get('public_id'), BIRTHDAYS_DATA_ID)
      assert.equal(form.get('invalidate'), 'true')
      assert.deepEqual(JSON.parse(await (form.get('file') as Blob).text()), [birthday])
      return Response.json({ public_id: BIRTHDAYS_DATA_ID })
    }
    await saveBirthdays([birthday])
    globalThis.fetch = async () => Response.json({ public_id: 'wrong' })
    await assert.rejects(saveBirthdays([birthday]), /could not be confirmed/)
  } finally { globalThis.fetch = original; resetStorageHealth() }
})
