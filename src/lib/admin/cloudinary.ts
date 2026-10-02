import 'server-only'
import { randomUUID } from 'node:crypto'
import { v2 as cloudinary } from 'cloudinary'
import {
  mediaRules,
  type MediaKind,
  type MediaPage,
  type UploadDetails,
} from '@/lib/media'

export function cloudinaryConfig() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME ?? ''
  const api_key = process.env.CLOUDINARY_API_KEY ?? ''
  const api_secret = process.env.CLOUDINARY_API_SECRET ?? ''
  if (!/^[a-zA-Z0-9_-]+$/.test(cloud_name) || !api_key || !api_secret)
    return null
  return { cloud_name, api_key, api_secret, secure: true }
}

function contextValue(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/=/g, '\\=')
    .replace(/\|/g, '\\|')
    .replace(/[\r\n]/g, ' ')
}

export function uploadContext(values: Record<string, string>) {
  return Object.entries(values)
    .filter(([, value]) => value.length > 0)
    .map(([key, value]) => `${key}=${contextValue(value)}`)
    .join('|')
}

export function uploadTicket(details: UploadDetails) {
  const config = cloudinaryConfig()
  if (!config) throw new Error('Cloudinary is not configured.')
  const rule = mediaRules[details.kind]
  const filename = `${randomUUID()}${details.kind === 'bulletin' ? '.pdf' : ''}`
  const publicId = `elim/media/${details.kind}/${details.group ? `${details.group}/` : ''}${details.month ? `${details.month}/` : ''}${filename}`
  const context = uploadContext({
    title: details.title,
    description: details.description,
    group: details.group,
    month: details.month,
    theme: details.kind === 'bulletin' ? details.theme ?? '' : '',
    quote: details.kind === 'bulletin' ? details.quote ?? '' : '',
    scripture: details.kind === 'bulletin' || details.kind === 'audio' ? details.scripture ?? '' : '',
    speaker: details.kind === 'audio' ? details.speaker ?? '' : '',
    speaker_role: details.kind === 'audio' ? details.speakerRole ?? '' : '',
    series: details.kind === 'audio' ? details.series ?? '' : '',
    message_date: details.kind === 'audio' ? details.messageDate ?? '' : '',
    duration: details.kind === 'audio' ? details.duration ?? '' : '',
    original_filename: details.filename,
  })
  const tags = [
    'elim-media',
    `elim-media-${details.kind}`,
    ...(details.group ? [`elim-group-${details.group}`] : []),
  ].join(',')
  const params = {
    timestamp: String(Math.floor(Date.now() / 1000)),
    public_id: publicId,
    overwrite: 'false',
    type: 'upload',
    tags,
    context,
    allowed_formats: rule.extensions.join(','),
  }
  return {
    url: `https://api.cloudinary.com/v1_1/${config.cloud_name}/${rule.resourceType}/upload`,
    cloudName: config.cloud_name,
    apiKey: config.api_key,
    signature: cloudinary.utils.api_sign_request(params, config.api_secret),
    params,
  }
}

type CloudinaryResource = {
  asset_id?: string
  public_id: string
  secure_url: string
  format?: string
  bytes: number
  created_at: string
  context?: {
    custom?: {
      title?: string
      description?: string
      group?: string
      month?: string
    }
  }
}

export async function listMedia(
  kind: MediaKind,
  nextCursor?: string,
): Promise<MediaPage> {
  const config = cloudinaryConfig()
  if (!config) throw new Error('Cloudinary is not configured.')
  const result: { resources: CloudinaryResource[]; next_cursor?: string } =
    await cloudinary.api.resources_by_tag(`elim-media-${kind}`, {
      ...config,
      resource_type: mediaRules[kind].resourceType,
      type: 'upload',
      context: true,
      max_results: 24,
      next_cursor: nextCursor,
      timeout: 15000,
    })
  return {
    assets: result.resources
      .filter((asset) => asset.public_id.startsWith(`elim/media/${kind}/`))
      .map((asset) => ({
        id: asset.asset_id || asset.public_id,
        publicId: asset.public_id,
        url: asset.secure_url,
        kind,
        title:
          asset.context?.custom?.title ||
          asset.public_id.split('/').pop() ||
          'Untitled upload',
        description: asset.context?.custom?.description || '',
        group: asset.context?.custom?.group || '',
        month: asset.context?.custom?.month || '',
        format: asset.format || (kind === 'bulletin' ? 'pdf' : ''),
        bytes: asset.bytes,
        createdAt: asset.created_at,
      })),
    nextCursor: result.next_cursor,
  }
}
