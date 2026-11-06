import 'server-only'
import { randomUUID } from 'node:crypto'
import { v2 as cloudinary } from 'cloudinary'
import { cloudinaryConfig } from './cloudinary'

export function validateBirthdayUpload(input: unknown) {
  const data = input as { filename?: unknown; mime?: unknown; bytes?: unknown } | null
  const formats: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }
  const ext = typeof data?.filename === 'string' ? data.filename.split('.').pop()?.toLowerCase() ?? '' : ''
  if (!formats[ext] || formats[ext] !== data?.mime) throw new Error('Choose a JPG, PNG, or WebP portrait.')
  if (typeof data?.bytes !== 'number' || !Number.isInteger(data.bytes) || data.bytes <= 0 || data.bytes > 10 * 1024 * 1024) {
    throw new Error('Choose a portrait smaller than 10 MB.')
  }
}

export function birthdayUploadTicket() {
  const config = cloudinaryConfig()
  if (!config) throw new Error('Cloudinary is not configured.')
  const params = {
    timestamp: String(Math.floor(Date.now() / 1000)),
    public_id: `elim/birthdays/${randomUUID()}`,
    overwrite: 'false', type: 'upload', tags: 'elim-birthday-portrait', allowed_formats: 'jpg,jpeg,png,webp',
  }
  return {
    url: `https://api.cloudinary.com/v1_1/${config.cloud_name}/image/upload`,
    apiKey: config.api_key, params,
    signature: cloudinary.utils.api_sign_request(params, config.api_secret),
  }
}
