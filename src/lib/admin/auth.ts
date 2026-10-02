import 'server-only'
import { cookies } from 'next/headers'
import { sessionCookie, validSession } from './session'

export async function isAdmin() {
  return validSession((await cookies()).get(sessionCookie)?.value)
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin) return false
  try {
    // Next.js can use an internal hostname in request.url behind a proxy.
    const url = new URL(request.url)
    const host = request.headers.get('host') ?? url.host
    const protocol =
      request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() ??
      url.protocol.slice(0, -1)
    if (protocol !== 'https' && protocol !== 'http') return false
    return new URL(origin).origin === `${protocol}://${host}`
  } catch {
    return false
  }
}

export function json(
  data: unknown,
  status = 200,
  headers: Record<string, string> = {},
) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
      ...headers,
    },
  })
}

export async function readSmallJson(request: Request): Promise<unknown> {
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    throw new Error('Expected JSON.')
  const reader = request.body?.getReader()
  if (!reader) throw new Error('Missing request body.')
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const chunk = await reader.read()
      if (chunk.done) break
      size += chunk.value.byteLength
      if (size > 8192) {
        await reader.cancel()
        throw new Error('Request is too large.')
      }
      chunks.push(chunk.value)
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } finally {
    reader.releaseLock()
  }
}
