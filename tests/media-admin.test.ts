import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { test } from 'node:test'
import {
  createSession,
  validSession,
  passwordMatches,
  LoginLimiter,
  sessionSeconds,
  base32Decode,
  totpConfig,
  totpCodeAt,
  verifyTotp,
} from '../src/lib/admin/session'
import {
  fileError,
  validateUpload,
  formatMonth,
  mediaRules,
} from '../src/lib/media'
import { uploadTicket } from '../src/lib/admin/cloudinary'
import { sameOrigin, readSmallJson } from '../src/lib/admin/auth'

const config = {
  password: 'test-only-admin-password',
  secret: 'test-only-session-secret-with-more-than-32-characters',
}
const imageUpload = {
  kind: 'image',
  group: 'brothers',
  title: 'Sunday worship',
  description: '',
  month: '',
  filename: 'worship.jpg',
  contentType: 'image/jpeg',
  bytes: 1024,
}

test('sessions accept valid signatures and reject missing, tampered, expired, or rotated credentials', async () => {
  const token = await createSession(config)
  assert.equal(await validSession(token, config), true)
  assert.equal(await validSession(undefined, config), false)
  assert.equal(
    await validSession(`${token.slice(0, -12)}tampered`, config),
    false,
  )
  assert.equal(
    await validSession(
      await createSession(
        config,
        Math.floor(Date.now() / 1000) - sessionSeconds - 60,
      ),
      config,
    ),
    false,
  )
  assert.equal(
    await validSession(token, { ...config, password: 'changed-password' }),
    false,
  )
  assert.equal(
    await validSession(token, { ...config, secret: 'changed-secret' }),
    false,
  )
  assert.equal(await validSession('x'.repeat(3000), config), false)
})

test('password matching compares complete passwords', () => {
  assert.equal(passwordMatches(config.password, config.password), true)
  assert.equal(passwordMatches('wrong-password', config.password), false)
  assert.equal(passwordMatches('', config.password), false)
})

test('login rate limiter blocks attempt six and permits a new time window', () => {
  const limiter = new LoginLimiter()
  for (let index = 0; index < 5; index++)
    assert.equal(limiter.take('test-address', 1000), 0)
  assert.equal(limiter.take('test-address', 1000), 900)
  assert.equal(limiter.take('another-address', 1000), 0)
  assert.equal(limiter.take('test-address', 901000), 0)
})

test('totp second factor accepts current codes, tolerates drift, rejects the rest', () => {
  // RFC 4648 / RFC 6238 reference vectors.
  const key = base32Decode('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ')
  assert.ok(key)
  assert.equal(key?.toString('latin1'), '12345678901234567890')
  assert.equal(totpCodeAt(key!, 59), '287082')
  assert.equal(verifyTotp('287082', key!, 59), true)
  assert.equal(verifyTotp('287082', key!, 88), true)
  assert.equal(verifyTotp('287082', key!, 91), false)
  assert.equal(verifyTotp('000000', key!, 59), false)
  assert.equal(verifyTotp('28708a', key!, 59), false)
  assert.equal(verifyTotp('', key!, 59), false)
  const previous = process.env.ADMIN_TOTP_SECRET
  process.env.ADMIN_TOTP_SECRET = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ'
  assert.deepEqual(totpConfig(), key)
  process.env.ADMIN_TOTP_SECRET = 'short'
  assert.equal(totpConfig(), null)
  if (previous === undefined) delete process.env.ADMIN_TOTP_SECRET
  else process.env.ADMIN_TOTP_SECRET = previous
  assert.equal(totpConfig(), null)
})

test('upload validation rejects bad categories, formats, sizes, and metadata', () => {
  assert.equal(validateUpload(imageUpload).title, 'Sunday worship')
  assert.equal(validateUpload(imageUpload).group, 'brothers')
  for (const change of [
    { kind: 'raw' },
    { group: '' },
    { group: 'unknown-group' },
    { filename: 'script.svg', contentType: 'image/svg+xml' },
    { bytes: 0 },
    { bytes: -1 },
    { bytes: mediaRules.image.maxBytes + 1 },
    { title: '   ' },
    { title: 'x'.repeat(121) },
    { description: 'x'.repeat(501) },
  ]) {
    assert.throws(() => validateUpload({ ...imageUpload, ...change }))
  }
  assert.ok(
    fileError('image', { name: 'fake.jpg', type: 'text/html', size: 100 }),
  )
  assert.equal(
    fileError('image', { name: 'PHOTO.JPG', type: '', size: 100 }),
    null,
  )
  assert.equal(
    fileError('video', {
      name: 'service.mp4',
      type: 'video/mp4',
      size: mediaRules.video.maxBytes,
    }),
    null,
  )
  assert.throws(() => validateUpload(null))
})

test('audio uploads accept supported formats and need no group', () => {
  const audio = {
    ...imageUpload,
    kind: 'audio',
    group: '',
    title: 'Sunday recording',
    filename: 'service.mp3',
    contentType: 'audio/mpeg',
  }
  assert.equal(validateUpload(audio).group, '')
  for (const change of [
    { filename: 'service.txt', contentType: 'text/plain' },
    { bytes: mediaRules.audio.maxBytes + 1 },
  ]) {
    assert.throws(() => validateUpload({ ...audio, ...change }))
  }
  assert.equal(fileError('audio', { name: 'TAPE.MP3', type: '', size: 100 }), null)
  assert.ok(
    fileError('audio', { name: 'tape.m4a', type: 'video/mp4', size: 100 }),
  )
  assert.equal(
    fileError('audio', {
      name: 'tape.m4a',
      type: 'audio/x-m4a',
      size: mediaRules.audio.maxBytes,
    }),
    null,
  )
})

test('upload groups follow the fellowships managed by the admin', () => {
  const groups = ['church-wide', 'brothers', 'youths-fellowship']
  const upload = {
    ...imageUpload,
    group: 'youths-fellowship',
    title: 'Youths Sunday',
  }
  assert.equal(validateUpload(upload, groups).group, 'youths-fellowship')
  assert.throws(() => validateUpload({ ...upload, group: 'sisters' }, groups))
  assert.equal(validateUpload(imageUpload).group, 'brothers')
  assert.throws(() => validateUpload({ ...imageUpload, group: 'youths-fellowship' }))
})

test('bulletins require a valid month and a PDF', () => {
  const bulletin = {
    ...imageUpload,
    kind: 'bulletin',
    filename: 'october.pdf',
    contentType: 'application/pdf',
    month: '2026-10',
  }
  assert.equal(validateUpload(bulletin).month, '2026-10')
  assert.equal(validateUpload(bulletin).group, '')
  assert.equal(formatMonth('2026-10'), 'October 2026')
  for (const month of [
    '',
    '2026-13',
    '2026-00',
    '2026-1',
    '../bad',
    '2026-10-01',
  ]) {
    assert.throws(() => validateUpload({ ...bulletin, month }))
  }
  assert.throws(() =>
    validateUpload({
      ...bulletin,
      filename: 'october.html',
      contentType: 'text/html',
    }),
  )
  assert.equal(validateUpload({ ...imageUpload, month: 'ignored' }).month, '')
})

test('upload tickets sign server-selected paths, types, formats, and escaped context without exposing the secret', () => {
  const keys = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ] as const
  const previous = keys.map((key) => process.env[key])
  process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud'
  process.env.CLOUDINARY_API_KEY = 'test-key'
  process.env.CLOUDINARY_API_SECRET = 'test-secret'
  try {
    const details = validateUpload({
      ...imageUpload,
      title: 'Sunday | title=overridden \\ test',
    })
    const ticket = uploadTicket(details)
    assert.equal(
      ticket.url,
      'https://api.cloudinary.com/v1_1/test-cloud/image/upload',
    )
    assert.match(
      ticket.params.public_id,
      /^elim\/media\/image\/brothers\/[a-f0-9-]+$/,
    )
    assert.equal(ticket.params.overwrite, 'false')
    assert.equal(ticket.params.allowed_formats, 'jpg,jpeg,png,webp,gif')
    assert.equal(ticket.params.tags, 'elim-media,elim-media-image,elim-group-brothers')
    assert.ok(
      ticket.params.context.includes(
        'title=Sunday \\| title\\=overridden \\\\ test',
      ),
    )
    assert.ok(ticket.params.context.includes('group=brothers'))
    assert.ok(!ticket.params.context.includes('description='))
    const signed = Object.entries(ticket.params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&')
    assert.equal(
      ticket.signature,
      createHash('sha1').update(`${signed}test-secret`).digest('hex'),
    )
    assert.ok(!JSON.stringify(ticket).includes('test-secret'))
    assert.notEqual(
      uploadTicket(details).params.public_id,
      ticket.params.public_id,
    )
    const bulletin = uploadTicket(
      validateUpload({
        ...imageUpload,
        kind: 'bulletin',
        filename: 'october.pdf',
        contentType: 'application/pdf',
        month: '2026-10',
      }),
    )
    assert.equal(
      bulletin.url,
      'https://api.cloudinary.com/v1_1/test-cloud/raw/upload',
    )
    assert.match(
      bulletin.params.public_id,
      /^elim\/media\/bulletin\/2026-10\/.+\.pdf$/,
    )
    assert.equal(bulletin.params.allowed_formats, 'pdf')
    const audio = uploadTicket(
      validateUpload({
        ...imageUpload,
        kind: 'audio',
        group: '',
        filename: 'service.mp3',
        contentType: 'audio/mpeg',
      }),
    )
    assert.equal(
      audio.url,
      'https://api.cloudinary.com/v1_1/test-cloud/video/upload',
    )
    assert.match(audio.params.public_id, /^elim\/media\/audio\/[a-f0-9-]+$/)
    assert.equal(audio.params.allowed_formats, 'mp3,m4a,wav,ogg')
    assert.equal(audio.params.tags, 'elim-media,elim-media-audio')
    assert.ok(!audio.params.context.includes('group='))
  } finally {
    keys.forEach((key, index) => {
      if (previous[index] === undefined) delete process.env[key]
      else process.env[key] = previous[index]
    })
  }
})

test('mutation origin checks reject missing and cross-origin requests', () => {
  const url = 'https://church.example/api/admin/session'
  assert.equal(
    sameOrigin(
      new Request(url, { headers: { origin: 'https://church.example' } }),
    ),
    true,
  )
  assert.equal(
    sameOrigin(
      new Request(url, { headers: { origin: 'https://elsewhere.example' } }),
    ),
    false,
  )
  assert.equal(sameOrigin(new Request(url)), false)
})

test('JSON request reader limits actual streamed bytes, not just content-length', async () => {
  const request = (
    body: string,
    headers = { 'Content-Type': 'application/json' },
  ) => new Request('https://church.example', { method: 'POST', headers, body })
  assert.deepEqual(await readSmallJson(request('{"ok":true}')), { ok: true })
  await assert.rejects(readSmallJson(request('not-json')))
  await assert.rejects(
    readSmallJson(request(JSON.stringify({ data: 'x'.repeat(9000) }))),
  )
  await assert.rejects(
    readSmallJson(request('{}', { 'Content-Type': 'text/plain' })),
  )
})

test('origin validation supports Next.js internal URLs behind a trusted HTTPS proxy', () => {
  const url = 'http://localhost:3000/api/admin/session'
  assert.equal(
    sameOrigin(
      new Request(url, {
        headers: {
          host: 'church.example',
          'x-forwarded-proto': 'https',
          origin: 'https://church.example',
        },
      }),
    ),
    true,
  )
  assert.equal(
    sameOrigin(
      new Request(url, {
        headers: {
          host: 'church.example',
          'x-forwarded-proto': 'https',
          origin: 'https://attacker.example',
        },
      }),
    ),
    false,
  )
  assert.equal(
    sameOrigin(
      new Request(url, {
        headers: {
          host: 'church.example',
          'x-forwarded-proto': 'https',
          origin: 'http://church.example',
        },
      }),
    ),
    false,
  )
})
