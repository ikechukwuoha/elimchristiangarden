import { ministries } from '@/app/data/ministries'
import { messageDetails, type MessageDetails } from './messages'

export const mediaKinds = ['image', 'video', 'audio', 'bulletin'] as const
export type MediaKind = (typeof mediaKinds)[number]

export const mediaRules = {
  image: {
    label: 'Images',
    accept: 'image/jpeg,image/png,image/webp,image/gif',
    extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxBytes: 10 * 1024 * 1024,
    hint: 'JPG, PNG, WebP or GIF · up to 10 MB',
    resourceType: 'image',
  },
  video: {
    label: 'Videos',
    accept: 'video/mp4,video/webm,video/quicktime',
    extensions: ['mp4', 'webm', 'mov'],
    mimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    maxBytes: 100 * 1024 * 1024,
    hint: 'MP4, WebM or MOV · up to 100 MB',
    resourceType: 'video',
  },
  audio: {
    label: 'Audio',
    accept:
      'audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,audio/wav,audio/x-wav,audio/wave,audio/vnd.wave,audio/ogg,application/ogg',
    extensions: ['mp3', 'm4a', 'wav', 'ogg'],
    mimeTypes: [
      'audio/mpeg',
      'audio/mp3',
      'audio/mp4',
      'audio/x-m4a',
      'audio/wav',
      'audio/x-wav',
      'audio/wave',
      'audio/vnd.wave',
      'audio/ogg',
      'application/ogg',
    ],
    maxBytes: 50 * 1024 * 1024,
    hint: 'MP3, M4A, WAV or OGG · up to 50 MB',
    // Cloudinary stores audio under its video resource type.
    resourceType: 'video',
  },
  bulletin: {
    label: 'Monthly bulletins',
    accept: 'application/pdf',
    extensions: ['pdf'],
    mimeTypes: ['application/pdf'],
    maxBytes: 10 * 1024 * 1024,
    hint: 'PDF · up to 10 MB',
    resourceType: 'raw',
  },
} as const

// Galleries are keyed by ministry id, so the dropdown follows the fellowships
// on the community page. Church-wide covers uploads that belong to no fellowship.
export const mediaGroups = [
  { id: 'church-wide', label: 'Church-wide' },
  ...ministries
    .filter((ministry) => ministry.kind === 'fellowship')
    .map((ministry) => ({ id: ministry.id, label: ministry.title })),
]

export function isMediaGroup(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    mediaGroups.some((group) => group.id === value)
  )
}

export function groupLabel(id: string) {
  return mediaGroups.find((group) => group.id === id)?.label ?? id
}

export type GroupInfo = {
  id: string
  label: string
  category: string
  description: string
}

export function groupInfo(id: string): GroupInfo | null {
  if (!isMediaGroup(id)) return null
  const ministry = ministries.find((item) => item.id === id)
  if (ministry)
    return {
      id,
      label: ministry.title,
      category: ministry.category,
      description: ministry.description,
    }
  return {
    id,
    label: groupLabel(id),
    category: 'THE WHOLE CHURCH FAMILY',
    description:
      'Church-wide moments — Sunday services, celebrations, and everyday life in the Elim family.',
  }
}

export type UploadDetails = Partial<MessageDetails> & {
  kind: MediaKind
  group: string
  title: string
  description: string
  month: string
  theme?: string
  quote?: string
  scripture?: string
  filename: string
  contentType: string
  bytes: number
}

export type MediaAsset = Partial<MessageDetails> & {
  id: string
  publicId: string
  url: string
  kind: MediaKind
  group: string
  title: string
  description: string
  month: string
  format: string
  bytes: number
  createdAt: string
}

export type MediaPage = { assets: MediaAsset[]; nextCursor?: string }

export function isMediaKind(value: unknown): value is MediaKind {
  return typeof value === 'string' && mediaKinds.includes(value as MediaKind)
}

export function fileError(
  kind: MediaKind,
  file: { name: string; type: string; size: number },
) {
  const rule = mediaRules[kind]
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (
    !(rule.extensions as readonly string[]).includes(extension) ||
    (file.type && !(rule.mimeTypes as readonly string[]).includes(file.type))
  ) {
    return `Choose a supported file. ${rule.hint}.`
  }
  if (!Number.isSafeInteger(file.size) || file.size <= 0)
    return 'This file is empty or invalid.'
  if (file.size > rule.maxBytes) return `This file is too large. ${rule.hint}.`
  return null
}

export function validateUpload(
  value: unknown,
  allowedGroups: readonly string[] = mediaGroups.map((group) => group.id),
): UploadDetails {
  if (!value || typeof value !== 'object')
    throw new Error('Invalid upload details.')
  const data = value as Record<string, unknown>
  if (!isMediaKind(data.kind)) throw new Error('Choose an upload type.')
  const wantsGroup = data.kind === 'image' || data.kind === 'video'
  if (
    wantsGroup &&
    (typeof data.group !== 'string' || !allowedGroups.includes(data.group))
  )
    throw new Error('Choose the fellowship group this file belongs to.')
  if (
    typeof data.title !== 'string' ||
    !data.title.trim() ||
    data.title.trim().length > 120
  ) {
    throw new Error('Enter a title between 1 and 120 characters.')
  }
  if (typeof data.description !== 'string' || data.description.length > 500) {
    throw new Error('Keep the description under 500 characters.')
  }
  if (
    typeof data.filename !== 'string' ||
    data.filename.length > 255 ||
    typeof data.contentType !== 'string' ||
    typeof data.bytes !== 'number'
  ) {
    throw new Error('Invalid file details.')
  }
  if (
    data.kind === 'bulletin' &&
    (typeof data.month !== 'string' ||
      !/^20\d{2}-(0[1-9]|1[0-2])$/.test(data.month))
  ) {
    throw new Error('Choose a valid bulletin month and year (2000–2099).')
  }
  const error = fileError(data.kind, {
    name: data.filename,
    type: data.contentType,
    size: data.bytes,
  })
  if (error) throw new Error(error)
  const bulletinText = (field: string, label: string, max: number) => {
    if (data.kind !== 'bulletin' || data[field] === undefined) return ''
    if (typeof data[field] !== 'string' || data[field].length > max)
      throw new Error(`Keep the ${label} under ${max} characters.`)
    return data[field].trim()
  }
  return {
    kind: data.kind,
    group: wantsGroup ? (data.group as string) : '',
    title: data.title.trim(),
    description: data.description.trim(),
    month: data.kind === 'bulletin' ? (data.month as string) : '',
    theme: bulletinText('theme', 'theme', 120),
    quote: bulletinText('quote', 'quote', 250),
    scripture: bulletinText('scripture', 'Bible reference', 100),
    ...(data.kind === 'audio' ? messageDetails(data) : {}),
    filename: data.filename,
    contentType: data.contentType,
    bytes: data.bytes,
  }
}

export function formatBytes(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.ceil(bytes / 1024)} KB`
}

export function formatMonth(month: string) {
  if (!/^20\d{2}-(0[1-9]|1[0-2])$/.test(month)) return month
  return new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${month}-01T00:00:00Z`))
}
