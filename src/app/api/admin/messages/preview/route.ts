import { isAdmin, json, readSmallJson, sameOrigin } from '@/lib/admin/auth'
import { youtubeVideoId } from '@/lib/messages'

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: 'This request is not allowed.' }, 403)
  if (!(await isAdmin())) return json({ error: 'Your session has expired. Please sign in again.' }, 401)
  let videoId: string | null
  try {
    const data = await readSmallJson(request) as { videoUrl?: unknown } | null
    videoId = typeof data?.videoUrl === 'string' && data.videoUrl.length <= 1000
      ? youtubeVideoId(data.videoUrl) : null
    if (!videoId) throw new Error('Enter a valid YouTube video link.')
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Invalid video link.' }, 400)
  }
  try {
    const query = new URLSearchParams({ url: `https://www.youtube.com/watch?v=${videoId}`, format: 'json' })
    const response = await fetch(`https://www.youtube.com/oembed?${query}`, {
      cache: 'no-store', signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) throw new Error('Video unavailable.')
    const result = await response.json()
    if (typeof result.title !== 'string' || !result.title.trim()) throw new Error('Title unavailable.')
    return json({ title: result.title.trim().slice(0, 120) })
  } catch {
    return json({ error: 'Could not read this video’s title. You can enter its title yourself.' }, 502)
  }
}
