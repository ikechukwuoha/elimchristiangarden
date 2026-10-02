import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  formatGalleryDate,
  listGroupMedia,
  listAudioMedia,
  safeMediaUrl,
  toGalleryAsset,
} from '../src/lib/gallery'
import { groupInfo, mediaGroups } from '../src/lib/media'

const cloudName = 'test-cloud'
process.env.CLOUDINARY_CLOUD_NAME = cloudName
process.env.CLOUDINARY_API_KEY = 'test-key'
process.env.CLOUDINARY_API_SECRET = 'test-secret'

function resource(overrides: Record<string, unknown> = {}) {
  return {
    asset_id: 'asset-1',
    public_id: 'elim/media/image/brothers/id-1',
    secure_url: `https://res.cloudinary.com/${cloudName}/image/upload/v1/elim/media/image/brothers/id-1.jpg`,
    format: 'jpg',
    bytes: 2048,
    created_at: '2026-10-01T09:00:00Z',
    context: {
      custom: {
        title: 'Sunday worship',
        description: '',
        group: 'brothers',
        month: '',
      },
    },
    ...overrides,
  }
}

test('media URLs are only accepted from the configured Cloudinary cloud over HTTPS', () => {
  assert.ok(safeMediaUrl(`https://res.cloudinary.com/${cloudName}/image/upload/a.jpg`, cloudName))
  assert.equal(safeMediaUrl(`http://res.cloudinary.com/${cloudName}/image/upload/a.jpg`, cloudName), null)
  assert.equal(safeMediaUrl('https://res.cloudinary.com/other-cloud/image/upload/a.jpg', cloudName), null)
  assert.equal(safeMediaUrl('https://evil.example/a.jpg', cloudName), null)
  assert.equal(safeMediaUrl('not a url', cloudName), null)
})

test('resources map to gallery assets with context, and unsafe resources are dropped', () => {
  const asset = toGalleryAsset(resource(), 'image')
  assert.ok(asset)
  assert.equal(asset.kind, 'image')
  assert.equal(asset.group, 'brothers')
  assert.equal(asset.title, 'Sunday worship')
  assert.equal(asset.format, 'jpg')
  assert.equal(
    toGalleryAsset(
      resource({ secure_url: 'https://evil.example/a.jpg' }),
      'image',
    ),
    null,
  )
  const untitled = toGalleryAsset(
    resource({ context: undefined, asset_id: undefined }),
    'image',
  )
  assert.ok(untitled)
  assert.equal(untitled.title, 'Untitled')
  assert.equal(untitled.id, untitled.publicId)
})

test('group galleries keep only their own group and sort newest first', async () => {
  const calls: { tag: string; resourceType: string }[] = []
  const { v2: cloudinary } = await import('cloudinary')
  const original = cloudinary.api.resources_by_tag
  cloudinary.api.resources_by_tag = (async (
    tag: string,
    options: { resource_type?: string },
  ) => {
    calls.push({ tag, resourceType: options.resource_type ?? '' })
    if (options.resource_type === 'video')
      return {
        resources: [
          resource({
            public_id: 'elim/media/video/brothers/older',
            secure_url: `https://res.cloudinary.com/${cloudName}/video/upload/older.mp4`,
            created_at: '2026-09-01T09:00:00Z',
            format: 'mp4',
          }),
        ],
      }
    return {
      resources: [
        resource({
          asset_id: 'asset-new',
          public_id: 'elim/media/image/brothers/new',
          secure_url: `https://res.cloudinary.com/${cloudName}/image/upload/new.jpg`,
          created_at: '2026-10-01T09:00:00Z',
        }),
        resource({
          asset_id: 'asset-other',
          context: {
            custom: { title: 'Stray', group: 'sisters', month: '' },
          },
        }),
      ],
    }
  }) as unknown as typeof cloudinary.api.resources_by_tag
  try {
    const media = await listGroupMedia('brothers')
    assert.deepEqual(calls, [
      { tag: 'elim-group-brothers', resourceType: 'image' },
      { tag: 'elim-group-brothers', resourceType: 'video' },
    ])
    assert.equal(media.photos.length, 1)
    assert.equal(media.photos[0].id, 'asset-new')
    assert.equal(media.videos.length, 1)
    assert.equal(media.videos[0].createdAt < media.photos[0].createdAt, true)
    const audio = await listAudioMedia()
    assert.equal(audio.length, 0)
  } finally {
    cloudinary.api.resources_by_tag = original
  }
})

test('gallery groups follow the fellowships with Church-wide first', () => {
  assert.equal(mediaGroups[0].id, 'church-wide')
  assert.ok(mediaGroups.some((group) => group.id === 'brothers'))
  assert.ok(mediaGroups.every((group) => groupInfo(group.id) !== null))
  assert.equal(groupInfo('not-a-group'), null)
  assert.equal(groupInfo('brothers')?.label, 'Brothers Fellowship')
  assert.ok(groupInfo('church-wide')?.description.length)
})

test('gallery dates render in the shared en-GB format', () => {
  assert.equal(formatGalleryDate('2026-10-01T09:00:00Z'), '1 Oct 2026')
})
