import {
  createHash,
  createHmac,
  randomUUID,
  timingSafeEqual,
} from 'node:crypto'
import { SignJWT, jwtVerify } from 'jose'

export const sessionCookie = 'elim_media_session'
export const sessionSeconds = 8 * 60 * 60
const issuer = 'elim-media-admin'

export function authConfig() {
  const password = process.env.ADMIN_PASSWORD ?? ''
  const secret = process.env.ADMIN_SESSION_SECRET ?? ''
  if (password.length < 16 || password.length > 256 || secret.length < 32)
    return null
  return { password, secret }
}

export function passwordMatches(candidate: string, password: string) {
  return timingSafeEqual(
    createHash('sha256').update(candidate).digest(),
    createHash('sha256').update(password).digest(),
  )
}

function signingKey(config: NonNullable<ReturnType<typeof authConfig>>) {
  // Changing either credential also invalidates previously issued sessions.
  return createHmac('sha256', config.secret).update(config.password).digest()
}

export async function createSession(
  config: NonNullable<ReturnType<typeof authConfig>>,
  now = Math.floor(Date.now() / 1000),
) {
  return new SignJWT({ role: 'media-admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(issuer)
    .setAudience('elim-media')
    .setIssuedAt(now)
    .setExpirationTime(now + sessionSeconds)
    .setJti(randomUUID())
    .sign(signingKey(config))
}

export async function validSession(
  token: string | undefined,
  config = authConfig(),
) {
  if (!token || token.length > 2048 || !config) return false
  try {
    const { payload } = await jwtVerify(token, signingKey(config), {
      algorithms: ['HS256'],
      issuer,
      audience: 'elim-media',
      maxTokenAge: sessionSeconds,
    })
    return payload.role === 'media-admin'
  } catch {
    return false
  }
}

export class LoginLimiter {
  private attempts = new Map<string, { count: number; expires: number }>()
  take(key: string, now = Date.now()) {
    this.attempts.forEach((item, id) => {
      if (item.expires <= now) this.attempts.delete(id)
    })
    const item = this.attempts.get(key)
    if (item && item.count >= 5) return Math.ceil((item.expires - now) / 1000)
    if (item) item.count += 1
    else {
      if (this.attempts.size >= 10000) return 60
      this.attempts.set(key, { count: 1, expires: now + 15 * 60 * 1000 })
    }
    return 0
  }
}

// Optional TOTP second factor (RFC 6238). Set ADMIN_TOTP_SECRET to a base32
// secret from `npm run admin:totp` to require a six-digit code at sign-in;
// leave it unset to sign in with the password alone.
const TOTP_PERIOD = 30
const TOTP_DIGITS = 6
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

export function base32Decode(input: string) {
  const clean = input.toUpperCase().replace(/[\s-]/g, '').replace(/=+$/, '')
  if (!clean.length || clean.length > 200) return null
  let bits = 0
  let value = 0
  const bytes: number[] = []
  for (const char of clean) {
    const index = BASE32_ALPHABET.indexOf(char)
    if (index === -1) return null
    value = (value << 5) | index
    bits += 5
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }
  return Buffer.from(bytes)
}

export function totpConfig() {
  const raw = process.env.ADMIN_TOTP_SECRET ?? ''
  if (!raw) return null
  const key = base32Decode(raw)
  // A real secret has at least 80 bits of entropy (16 base32 characters).
  return key && key.length >= 10 ? key : null
}

function hotp(key: Buffer, counter: number) {
  const message = Buffer.alloc(8)
  message.writeBigUInt64BE(BigInt(counter))
  const digest = createHmac('sha1', key).update(message).digest()
  const offset = digest[digest.length - 1] & 0xf
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    (digest[offset + 1] << 16) |
    (digest[offset + 2] << 8) |
    digest[offset + 3]
  return String(binary % 10 ** TOTP_DIGITS).padStart(TOTP_DIGITS, '0')
}

export function totpCodeAt(
  key: Buffer,
  now = Math.floor(Date.now() / 1000),
) {
  return hotp(key, Math.floor(now / TOTP_PERIOD))
}

export function verifyTotp(
  code: string,
  key: Buffer,
  now = Math.floor(Date.now() / 1000),
) {
  const cleaned = code.replace(/[\s-]/g, '')
  if (!/^\d{6}$/.test(cleaned)) return false
  const counter = Math.floor(now / TOTP_PERIOD)
  // One period back and forward tolerates clock drift and slow typing.
  return [-1, 0, 1].some((delta) =>
    timingSafeEqual(
      Buffer.from(cleaned),
      Buffer.from(hotp(key, counter + delta)),
    ),
  )
}
