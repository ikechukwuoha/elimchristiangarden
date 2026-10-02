import 'server-only'
import { createHash } from 'node:crypto'
import { cloudinaryConfig, uploadContext } from './admin/cloudinary'
import { toGalleryAsset, type CloudinaryResource } from './gallery'
import { validMessageDate, validateYoutubeMessage, type Sermon } from './messages'

const youtubeTag = 'elim-message-youtube'
const youtubePrefix = 'elim/messages/youtube/'

export type MessageSource = 'audio' | 'youtube'
export type MessageLibrary = { messages: Sermon[]; unavailableSources: MessageSource[] }

function recordingDate(messageDate: string, createdAt: string) {
  if (validMessageDate(messageDate)) return messageDate
  const uploadedDate = createdAt.slice(0, 10)
  return validMessageDate(uploadedDate) ? uploadedDate : ''
}

export class MessageStorageError extends Error {
  constructor(message: string, public status = 502) {
    super(message)
    this.name = 'MessageStorageError'
  }
}

// Log only transport codes, never request URLs, credentials, or upstream bodies.
function connectionCodes(error: unknown, depth = 0): string[] {
  if (!error || typeof error !== 'object' || depth > 3) return []
  const details = error as { code?: unknown; cause?: unknown; errors?: unknown[] }
  const own = typeof details.code === 'string' && /^[A-Z0-9_]+$/.test(details.code)
    ? [details.code] : []
  return [...new Set([
    ...own, ...connectionCodes(details.cause, depth + 1),
    ...(Array.isArray(details.errors) ? details.errors.slice(0, 4).flatMap((item) => connectionCodes(item, depth + 1)) : []),
  ])]
}

async function cloudinaryRequest(path: string, init: RequestInit = {}) {
  const config = cloudinaryConfig()
  if (!config) throw new MessageStorageError('Media storage is not configured.', 503)
  const isRead = !init.method || init.method === 'GET'
  const startedAt = Date.now()
  for (let attempt = 0; attempt < 2; attempt++) {
    const signal = AbortSignal.timeout(12000)
    try {
      const headers = new Headers(init.headers)
      headers.set('Authorization', `Basic ${Buffer.from(`${config.api_key}:${config.api_secret}`).toString('base64')}`)
      const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloud_name}/${path}`, {
        ...init, headers, signal,
        // Cache each source's successful response independently. In development,
        // read directly so a failed refresh is handled by the page, not a background job.
        ...(isRead && process.env.NODE_ENV === 'production'
          ? { cache: 'force-cache', next: { revalidate: 60, tags: ['messages', 'gallery'] } } as const
          : { cache: 'no-store' } as const),
      })
      if (!response.ok) {
        console.warn('Message storage request rejected', { operation: isRead ? 'read' : 'publish', status: response.status })
        await response.body?.cancel()
        if (response.status === 401 || response.status === 403)
          throw new MessageStorageError('Media storage denied access. Check the configured API key and permissions.')
        throw new MessageStorageError('Media storage is unavailable. Please try again.',
          [408, 499, 504].includes(response.status) ? 504 : response.status === 429 ? 503 : 502)
      }
      return await response.json()
    } catch (error) {
      if (error instanceof MessageStorageError) throw error
      const codes = connectionCodes(error)
      const timedOut = signal.aborted || codes.some((code) => ['ETIMEDOUT', 'UND_ERR_CONNECT_TIMEOUT'].includes(code))
      const retryable = codes.some((code) => ['EAI_AGAIN', 'ENOTFOUND', 'ECONNRESET', 'ECONNREFUSED', 'UND_ERR_SOCKET', 'UND_ERR_CONNECT_TIMEOUT'].includes(code))
      // A brief connection failure gets one retry. Never automatically retry a publication.
      if (isRead && attempt === 0 && !signal.aborted && retryable && Date.now() - startedAt < 4000) continue
      console.warn('Message storage request failed', { operation: isRead ? 'read' : 'publish', codes, timedOut })
      throw new MessageStorageError(
        timedOut
          ? isRead ? 'Media storage took too long. Please try again.' : 'Media storage took too long. Check the message library before trying again.'
          : 'Could not reach media storage. Please try again.',
        timedOut ? 504 : 502,
      )
    }
  }
  throw new MessageStorageError('Could not reach media storage. Please try again.')
}

async function resourcesByTag(resourceType: 'raw' | 'video', tag: string) {
  const resources: CloudinaryResource[] = []
  const seen = new Set<string>()
  let cursor = ''
  do {
    const query = new URLSearchParams({ context: 'true', max_results: '100' })
    if (cursor) query.set('next_cursor', cursor)
    const result = await cloudinaryRequest(`resources/${resourceType}/tags/${tag}?${query}`) as {
      resources: CloudinaryResource[]; next_cursor?: string
    }
    if (!Array.isArray(result.resources)) throw new MessageStorageError('Invalid message library response.')
    resources.push(...result.resources)
    cursor = result.next_cursor ?? ''
    if (cursor && seen.has(cursor)) throw new MessageStorageError('Message pagination failed.')
    if (cursor) seen.add(cursor)
  } while (cursor)
  return resources
}

async function listYoutubeMessages(): Promise<Sermon[]> {
  const messages: Sermon[] = []
  const resources = await resourcesByTag('raw', youtubeTag)
  for (const resource of resources) {
    if (!resource.public_id.startsWith(youtubePrefix)) continue
    const context = resource.context?.custom ?? {}
    try {
      const details = validateYoutubeMessage({
        videoUrl: context.video_url, title: context.title, description: context.description ?? '',
        speaker: context.speaker, speakerRole: context.speaker_role, series: context.series,
        messageDate: context.message_date, scripture: context.scripture, duration: context.duration,
      })
      if (resource.public_id !== `${youtubePrefix}${details.videoId}.json`) continue
      messages.push({
        id: `youtube-${details.videoId}`, title: details.title, description: details.description,
        preacher: { name: details.speaker, role: details.speakerRole },
        date: recordingDate(details.messageDate, resource.created_at), publishedAt: resource.created_at, series: details.series,
        duration: details.duration, scripture: details.scripture, tags: [],
        videoUrl: details.videoUrl, imageUrl: `https://i.ytimg.com/vi/${details.videoId}/hqdefault.jpg`,
      })
    } catch {
      // An incomplete entry cannot become a public message.
    }
  }
  return messages
}

async function listAudioMessages(): Promise<Sermon[]> {
  const resources = await resourcesByTag('video', 'elim-media-audio')
  const audio = resources
    .filter((resource) => resource.public_id.startsWith('elim/media/audio/'))
    .map((resource) => toGalleryAsset(resource, 'audio'))
    .filter((asset) => asset !== null)
  return audio.map((asset) => ({
    id: `audio-${createHash('sha256').update(asset.publicId).digest('hex').slice(0, 32)}`,
    title: asset.title, description: asset.description,
    preacher: { name: asset.speaker ?? '', role: asset.speakerRole ?? '' },
    date: recordingDate(asset.messageDate ?? '', asset.createdAt),
    publishedAt: asset.createdAt,
    series: asset.series ?? '', duration: asset.duration ?? '', scripture: asset.scripture ?? '',
    tags: [], audioUrl: asset.url, downloadable: true,
  }))
}

export async function listMessageLibrary(): Promise<MessageLibrary> {
  if (!cloudinaryConfig()) return { messages: [], unavailableSources: [] }
  const sources: MessageSource[] = ['audio', 'youtube']
  const results = await Promise.allSettled([listAudioMessages(), listYoutubeMessages()])
  const unavailableSources = sources.filter((_, index) => results[index].status === 'rejected')
  const recordings = results.flatMap((result) => result.status === 'fulfilled' ? result.value : [])
  const messages = [...new Map(recordings.map((message) => [message.id, message])).values()]
    .sort((a, b) => b.date.localeCompare(a.date) || b.publishedAt.localeCompare(a.publishedAt) || a.title.localeCompare(b.title))
  return { messages, unavailableSources }
}

export async function saveYoutubeMessage(details: ReturnType<typeof validateYoutubeMessage>) {
  const publicId = `${youtubePrefix}${details.videoId}.json`
  const body = new FormData()
  body.set('file', new Blob([JSON.stringify(details)], { type: 'application/json' }), `${details.videoId}.json`)
  body.set('public_id', publicId)
  body.set('overwrite', 'true')
  body.set('tags', youtubeTag)
  body.set('context', uploadContext({
    title: details.title, description: details.description, video_url: details.videoUrl,
    speaker: details.speaker, speaker_role: details.speakerRole, series: details.series,
    message_date: details.messageDate, scripture: details.scripture, duration: details.duration,
  }))
  const result = await cloudinaryRequest('raw/upload', { method: 'POST', body })
  if (result.public_id !== publicId) throw new MessageStorageError('The message could not be confirmed. Check the library before trying again.')
  return { id: `youtube-${details.videoId}`, title: details.title }
}
