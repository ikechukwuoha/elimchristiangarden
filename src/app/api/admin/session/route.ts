import { cookies } from 'next/headers'
import { json, readSmallJson, sameOrigin } from '@/lib/admin/auth'
import { logAdminEvent } from '@/lib/admin/audit'
import {
  authConfig,
  createSession,
  LoginLimiter,
  passwordMatches,
  sessionCookie,
  sessionSeconds,
  totpConfig,
  verifyTotp,
} from '@/lib/admin/session'

export const runtime = 'nodejs'
const globalState = globalThis as typeof globalThis & {
  elimLoginLimiter?: LoginLimiter
}
const limiter = (globalState.elimLoginLimiter ??= new LoginLimiter())
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
}

export async function POST(request: Request) {
  if (!sameOrigin(request))
    return json({ error: 'This request is not allowed.' }, 403)
  const config = authConfig()
  if (!config)
    return json(
      {
        error:
          'Admin access is not configured yet. Contact the site administrator.',
      },
      503,
    )
  // The hosting proxy must replace, rather than append untrusted forwarding headers.
  const address =
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  const retryAfter = limiter.take(address.slice(0, 128))
  if (retryAfter) {
    logAdminEvent('login_rate_limited', { ip: address.slice(0, 128) })
    return json(
      { error: 'Too many sign-in attempts. Please try again in 15 minutes.' },
      429,
      { 'Retry-After': String(retryAfter) },
    )
  }
  let data: unknown
  try {
    data = await readSmallJson(request)
  } catch {
    return json({ error: 'Invalid sign-in request.' }, 400)
  }
  const password =
    data && typeof data === 'object' && 'password' in data
      ? data.password
      : null
  if (
    typeof password !== 'string' ||
    password.length > 256 ||
    !passwordMatches(password, config.password)
  ) {
    logAdminEvent('login_failed', { ip: address.slice(0, 128), reason: 'password' })
    return json({ error: 'That password is not correct.' }, 401)
  }
  const twoFactor = totpConfig()
  if (twoFactor) {
    const code =
      data && typeof data === 'object' && 'code' in data
        ? (data as { code: unknown }).code
        : null
    if (typeof code !== 'string' || !verifyTotp(code, twoFactor)) {
      logAdminEvent('login_failed', {
        ip: address.slice(0, 128),
        reason: 'totp',
      })
      return json(
        { error: 'That authentication code is not correct.' },
        401,
      )
    }
  }
  const cookieStore = await cookies()
  cookieStore.set(sessionCookie, await createSession(config), {
    ...cookieOptions,
    maxAge: sessionSeconds,
  })
  logAdminEvent('login_succeeded', { ip: address.slice(0, 128) })
  return json({ ok: true })
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request))
    return json({ error: 'This request is not allowed.' }, 403)
  const cookieStore = await cookies()
  cookieStore.set(sessionCookie, '', { ...cookieOptions, maxAge: 0 })
  return json({ ok: true })
}
