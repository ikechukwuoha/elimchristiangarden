import 'server-only'
import { createHash } from 'node:crypto'
import { cloudinaryConfig, uploadContext } from './admin/cloudinary'
import { listAudioMedia } from './gallery'
import { validMessageDate, validateYoutubeMessage, type Sermon } from './messages'

const youtubeTag = 'elim-message-youtube'
const youtubePrefix = 'elim/messages/youtube/'

type YoutubeResource = {
  public_id: string
  created_at: string
  context?: { custom?: Record<string, string> }
}

function recordingDate(messageDate: string, createdAt: string) {
  if (validMessageDate(messageDate)) return messageDate
  const uploadedDate = createdAt.slice(0, 10)
  return validMessageDate(uploadedDate) ? uploadedDate : ''
}

export class MessageStorageError extends Error {
  constructor(message: string, public status = 502) {
    super(message)
  }
}

async function cloudinaryRequest(path: string, init: RequestInit = {}) {
  const config = cloudinaryConfig()
  if (!config) throw new MessageStorageError('Media storage is not configured.', 503)
  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloud_name}/${path}`, {
      ...init,
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.api_key}:${config.api_secret}`).toString('base64')}`,
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(12000),
    })
    if (!response.ok) throw new MessageStorageError('Media storage is unavailable. Please try again.')
    return await response.json()
  } catch (error) {
    if (error instanceof MessageStorageError) throw error
    const timedOut = error instanceof Error && ['TimeoutError', 'AbortError'].includes(error.name)
    throw new MessageStorageError(
      timedOut ? 'Media storage took too long. Check the message library before trying again.' : 'Could not reach media storage. Please try again.',
      timedOut ? 504 : 502,
    )
  }
}

async function listYoutubeMessages(): Promise<Sermon[]> {
  const messages: Sermon[] = []
  const seen = new Set<string>()
  let cursor = ''
  do {
    const query = new URLSearchParams({ context: 'true', max_results: '100' })
    if (cursor) query.set('next_cursor', cursor)
    const result = await cloudinaryRequest(`resources/raw/tags/${youtubeTag}?${query}`) as {
      resources: YoutubeResource[]; next_cursor?: string
    }
    if (!Array.isArray(result.resources)) throw new MessageStorageError('Invalid message library response.')
    for (const resource of result.resources) {
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
    cursor = result.next_cursor ?? ''
    if (cursor && seen.has(cursor)) throw new MessageStorageError('Message pagination failed.')
    if (cursor) seen.add(cursor)
  } while (cursor)
  return messages
}

export async function listMessages(): Promise<Sermon[]> {
  if (!cloudinaryConfig()) return []
  const [audio, youtube] = await Promise.all([listAudioMedia(), listYoutubeMessages()])
  const recordings: Sermon[] = audio.map((asset) => ({
    id: `audio-${createHash('sha256').update(asset.publicId).digest('hex').slice(0, 32)}`,
    title: asset.title, description: asset.description,
    preacher: { name: asset.speaker ?? '', role: asset.speakerRole ?? '' },
    date: recordingDate(asset.messageDate ?? '', asset.createdAt),
    publishedAt: asset.createdAt,
    series: asset.series ?? '', duration: asset.duration ?? '', scripture: asset.scripture ?? '',
    tags: [], audioUrl: asset.url, downloadable: true,
  }))
  return [...new Map([...recordings, ...youtube].map((message) => [message.id, message])).values()]
    .sort((a, b) => b.date.localeCompare(a.date) || b.publishedAt.localeCompare(a.publishedAt) || a.title.localeCompare(b.title))
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
