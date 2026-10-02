import { v2 as cloudinary } from 'cloudinary'
import { cachedBulletins } from '@/lib/bulletin-cache'
import { cloudinaryConfig } from '@/lib/admin/cloudinary'
import { mediaRules } from '@/lib/media'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(
  request: Request,
  { params }: { params: Promise<{ month: string }> },
) {
  const { month } = await params
  if (!/^20\d{2}-(0[1-9]|1[0-2])$/.test(month))
    return Response.json({ error: 'Bulletin not found.' }, { status: 404 })
  try {
    const query = new URL(request.url).searchParams
    const bulletin = (await cachedBulletins()).find((issue) => issue.month === month)
    if (!bulletin || (query.get('id') && query.get('id') !== bulletin.id))
      return Response.json({ error: 'Bulletin not found. Refresh the page for the latest edition.' }, { status: 404 })
    const config = cloudinaryConfig()
    if (!config) throw new Error('Storage unavailable')
    const signedUrl = cloudinary.utils.private_download_url(bulletin.publicId, '', {
      ...config,
      resource_type: 'raw',
      type: 'upload',
      attachment: false,
      expires_at: Math.floor(Date.now() / 1000) + 60,
    })
    const response = await fetch(signedUrl, {
      cache: 'no-store',
      signal: AbortSignal.timeout(25000),
    })
    if (!response.ok || Number(response.headers.get('content-length')) > mediaRules.bulletin.maxBytes)
      throw new Error('Download unavailable')
    const bytes = await response.arrayBuffer()
    if (bytes.byteLength > mediaRules.bulletin.maxBytes || Buffer.from(bytes, 0, 5).toString() !== '%PDF-')
      throw new Error('Invalid PDF')
    const disposition = query.get('download') === '1' ? 'attachment' : 'inline'
    return new Response(bytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': String(bytes.byteLength),
        'Content-Disposition': `${disposition}; filename="Elim-${month}-Bulletin.pdf"`,
        'Cache-Control': query.get('id') ? 'public, max-age=300, s-maxage=600' : 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return Response.json(
      { error: 'The bulletin could not be loaded just now. Please try again.' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
