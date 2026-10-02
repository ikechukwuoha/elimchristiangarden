import 'server-only'
import { v2 as cloudinary } from 'cloudinary'
import { cloudinaryConfig } from '@/lib/admin/cloudinary'
import type { MediaAsset } from '@/lib/media'
import { formatMediaDuration } from './messages'

// A bounded page size keeps Admin API responses (and their quota cost) predictable.
const GALLERY_MAX_RESULTS = 100

type GalleryKind = 'image' | 'video' | 'audio'

export type CloudinaryResource = {
  asset_id?: string
  public_id: string
  secure_url: string
  format?: string
  bytes: number
  created_at: string
  duration?: number
  context?: {
    custom?: Record<string, string>
  }
}

export type GroupMedia = { photos: MediaAsset[]; videos: MediaAsset[] }

export function safeMediaUrl(url: string, cloudName: string) {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' &&
      parsed.hostname === 'res.cloudinary.com' &&
      parsed.pathname.startsWith(`/${cloudName}/`)
      ? url
      : null
  } catch {
    return null
  }
}

// Cloudinary optimises and resizes on its own CDN, so gallery pages request a
// right-sized image directly instead of proxying through the Next.js image
// optimiser (which timed out fetching large originals).
export function deliveryUrl(url: string, width: number) {
  const marker = '/image/upload/'
  const index = url.indexOf(marker)
  if (index === -1) return url
  return `${url.slice(0, index + marker.length)}f_auto,q_auto,c_limit,w_${width}/${url.slice(index + marker.length)}`
}

export function toGalleryAsset(
  resource: CloudinaryResource,
  kind: GalleryKind,
): MediaAsset | null {
  const config = cloudinaryConfig()
  if (!config) return null
  const url = safeMediaUrl(resource.secure_url, config.cloud_name)
  if (!url) return null
  return {
    id: resource.asset_id || resource.public_id,
    publicId: resource.public_id,
    url,
    kind,
    group: resource.context?.custom?.group || '',
    title: resource.context?.custom?.title || resource.context?.custom?.original_filename || resource.public_id.split('/').pop() || '',
    description: resource.context?.custom?.description || '',
    month: resource.context?.custom?.month || '',
    format: resource.format || '',
    bytes: resource.bytes,
    createdAt: resource.created_at,
    ...(kind === 'audio' ? {
      speaker: resource.context?.custom?.speaker || '',
      speakerRole: resource.context?.custom?.speaker_role || '',
      series: resource.context?.custom?.series || '',
      messageDate: resource.context?.custom?.message_date || '',
      scripture: resource.context?.custom?.scripture || '',
      duration: formatMediaDuration(resource.duration) || resource.context?.custom?.duration || '',
    } : {}),
  }
}

function sortNewestFirst(assets: MediaAsset[]) {
  return [...assets].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

async function resourcesByTag(
  tag: string,
  resourceType: 'image' | 'video',
  maxResults: number,
  allPages = false,
) {
  const config = cloudinaryConfig()
  if (!config) return []
  const resources: CloudinaryResource[] = []
  const cursors = new Set<string>()
  let cursor: string | undefined
  do {
    const result: { resources: CloudinaryResource[]; next_cursor?: string } =
      await cloudinary.api.resources_by_tag(tag, {
        ...config,
        resource_type: resourceType,
        type: 'upload',
        context: true,
        max_results: maxResults,
        next_cursor: cursor,
        timeout: 15000,
      })
    resources.push(...result.resources)
    cursor = allPages ? result.next_cursor : undefined
    if (cursor && cursors.has(cursor)) throw new Error('Gallery pagination failed.')
    if (cursor) cursors.add(cursor)
  } while (cursor)
  return resources
}

export async function listUploadedImages(): Promise<MediaAsset[]> {
  const resources = await resourcesByTag(
    'elim-media-image', 'image', GALLERY_MAX_RESULTS, true,
  )
  const images = resources
    .map((resource) => toGalleryAsset(resource, 'image'))
    .filter((asset): asset is MediaAsset => asset !== null)
    .filter((asset) => asset.publicId.startsWith('elim/media/image/'))
  return sortNewestFirst([...new Map(images.map((asset) => [asset.id, asset])).values()])
}

export async function listGroupMedia(group: string): Promise<GroupMedia> {
  const [imageResources, videoResources] = await Promise.all([
    resourcesByTag(`elim-group-${group}`, 'image', GALLERY_MAX_RESULTS),
    resourcesByTag(`elim-group-${group}`, 'video', GALLERY_MAX_RESULTS),
  ])
  const photos = imageResources
    .map((resource) => toGalleryAsset(resource, 'image'))
    .filter((asset): asset is MediaAsset => asset !== null)
    .filter((asset) => asset.group === group)
  const videos = videoResources
    .map((resource) => toGalleryAsset(resource, 'video'))
    .filter((asset): asset is MediaAsset => asset !== null)
    .filter((asset) => asset.group === group)
  return { photos: sortNewestFirst(photos), videos: sortNewestFirst(videos) }
}

export async function listGroupCover(group: string) {
  const [cover] = (
    await resourcesByTag(`elim-group-${group}`, 'image', 1)
  )
    .map((resource) => toGalleryAsset(resource, 'image'))
    .filter((asset): asset is MediaAsset => asset !== null)
    .filter((asset) => asset.group === group)
  return cover ?? null
}

export async function listAudioMedia(): Promise<MediaAsset[]> {
  const resources = await resourcesByTag('elim-media-audio', 'video', GALLERY_MAX_RESULTS, true)
  const audio = resources
    .map((resource) => toGalleryAsset(resource, 'audio'))
    .filter((asset): asset is MediaAsset => asset !== null)
    .filter((asset) => asset.publicId.startsWith('elim/media/audio/'))
  return sortNewestFirst(audio)
}

export function formatGalleryDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
