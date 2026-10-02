import 'server-only'
import { v2 as cloudinary } from 'cloudinary'
import { cloudinaryConfig } from './admin/cloudinary'
import { safeMediaUrl } from './gallery'

export type Bulletin = {
  id: string
  publicId: string
  month: string
  title: string
  description: string
  url: string
  theme: string
  quote: string
  scripture: string
  createdAt: string
}

type BulletinResource = {
  asset_id?: string
  public_id: string
  secure_url: string
  created_at: string
  context?: { custom?: Record<string, string> }
}

export function toBulletin(resource: BulletinResource, cloudName: string): Bulletin | null {
  const details = resource.context?.custom ?? {}
  const url = safeMediaUrl(resource.secure_url, cloudName)
  if (
    !url ||
    !resource.public_id.startsWith('elim/media/bulletin/') ||
    !resource.public_id.toLowerCase().endsWith('.pdf') ||
    !/^20\d{2}-(0[1-9]|1[0-2])$/.test(details.month ?? '')
  ) return null
  return {
    id: resource.asset_id || resource.public_id,
    publicId: resource.public_id,
    month: details.month,
    title: details.title || 'Monthly bulletin',
    description: details.description || '',
    url,
    theme: details.theme || '',
    quote: details.quote || '',
    scripture: details.scripture || '',
    createdAt: resource.created_at,
  }
}

// The latest upload for each month replaces that month's earlier edition.
export function bulletinArchive(uploaded: Bulletin[]): Bulletin[] {
  const months = new Map<string, Bulletin>()
  for (const bulletin of [...uploaded].sort((a, b) => a.createdAt.localeCompare(b.createdAt)))
    months.set(bulletin.month, bulletin)
  return [...months.values()].sort((a, b) => b.month.localeCompare(a.month))
}

export function bulletinDownloadUrl(bulletin: Bulletin) {
  const url = bulletinPdfUrl(bulletin)
  return `${url}&download=1`
}

export function bulletinPdfUrl(bulletin: Bulletin) {
  // The server retrieves published PDFs through Cloudinary's authenticated
  // download API; public CDN delivery can be disabled on free accounts.
  return `/api/bulletins/${bulletin.month}/pdf?id=${encodeURIComponent(bulletin.id)}`
}

export async function listBulletins(): Promise<Bulletin[]> {
  const config = cloudinaryConfig()
  if (!config) return bulletinArchive([])
  const uploaded: Bulletin[] = []
  const cursors = new Set<string>()
  let cursor: string | undefined
  do {
    const result: { resources: BulletinResource[]; next_cursor?: string } =
      await cloudinary.api.resources_by_tag('elim-media-bulletin', {
        ...config,
        resource_type: 'raw',
        type: 'upload',
        context: true,
        max_results: 100,
        next_cursor: cursor,
        timeout: 8000,
      })
    for (const resource of result.resources) {
      const bulletin = toBulletin(resource, config.cloud_name)
      if (bulletin) uploaded.push(bulletin)
    }
    cursor = result.next_cursor
    if (cursor && cursors.has(cursor)) throw new Error('Bulletin pagination failed.')
    if (cursor) cursors.add(cursor)
  } while (cursor)
  return bulletinArchive(uploaded)
}
