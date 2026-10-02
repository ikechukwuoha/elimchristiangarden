import { youtubeEmbedUrl } from './sermons'

export type Sermon = {
  id: string
  title: string
  description: string
  preacher: { name: string; role: string; image?: string }
  date: string
  publishedAt: string
  series: string
  duration: string
  scripture: string
  tags: string[]
  audioUrl?: string
  videoUrl?: string
  imageUrl?: string
  downloadable?: boolean
}

export type MessageDetails = {
  speaker: string
  speakerRole: string
  series: string
  messageDate: string
  scripture: string
  duration: string
}

export function validMessageDate(value: string) {
  return /^20\d{2}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(`${value}T12:00:00Z`)) &&
    new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value
}

export function messageDetails(data: Record<string, unknown>): MessageDetails {
  const text = (key: string, label: string, max: number) => {
    const value = data[key] ?? ''
    if (typeof value !== 'string' || value.trim().length > max)
      throw new Error(`Keep ${label} under ${max} characters.`)
    return value.trim()
  }
  const messageDate = text('messageDate', 'the message date', 10)
  if (messageDate && !validMessageDate(messageDate))
    throw new Error('Choose a valid message date (2000–2099).')
  const duration = text('duration', 'the duration', 12)
  if (duration && !/^\d{1,3}:[0-5]\d(?::[0-5]\d)?$/.test(duration))
    throw new Error('Enter the duration as minutes:seconds or hours:minutes:seconds.')
  return {
    speaker: text('speaker', 'the speaker name', 120),
    speakerRole: text('speakerRole', 'the speaker role', 100),
    series: text('series', 'the series name', 120),
    messageDate,
    scripture: text('scripture', 'the Bible reference', 250),
    duration,
  }
}

export function youtubeVideoId(source: string) {
  return youtubeEmbedUrl(source)?.split('/').pop() ?? null
}

export function validateYoutubeMessage(input: unknown) {
  if (!input || typeof input !== 'object') throw new Error('Invalid message details.')
  const data = input as Record<string, unknown>
  if (typeof data.videoUrl !== 'string' || data.videoUrl.length > 1000)
    throw new Error('Enter a valid YouTube video link.')
  const videoId = youtubeVideoId(data.videoUrl)
  if (!videoId) throw new Error('Enter a YouTube video link, including its video ID.')
  if (typeof data.title !== 'string' || !data.title.trim() || data.title.trim().length > 120)
    throw new Error('Enter a message title between 1 and 120 characters.')
  if (typeof data.description !== 'string' || data.description.trim().length > 500)
    throw new Error('Keep the description under 500 characters.')
  return {
    ...messageDetails(data),
    title: data.title.trim(),
    description: data.description.trim(),
    videoId,
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
  }
}

export function formatMediaDuration(seconds?: number) {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds <= 0) return ''
  const total = Math.round(seconds)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const remainder = String(total % 60).padStart(2, '0')
  return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${remainder}` : `${minutes}:${remainder}`
}
