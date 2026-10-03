import assert from 'node:assert/strict'
import { test } from 'node:test'
import { v2 as cloudinary } from 'cloudinary'
import {
  bulletinArchive,
  bulletinDownloadUrl,
  listBulletins,
  toBulletin,
} from '../src/lib/bulletins'
import { validateUpload } from '../src/lib/media'
import { uploadTicket } from '../src/lib/admin/cloudinary'
import { bulletinTextParagraphs } from '../src/lib/bulletin-text'
import type { TextContent, TextItem } from 'pdfjs-dist/types/src/display/api'

const cloudName = 'test-cloud'
process.env.CLOUDINARY_CLOUD_NAME = cloudName
process.env.CLOUDINARY_API_KEY = 'test-key'
process.env.CLOUDINARY_API_SECRET = 'test-secret'

function resource(month = '2026-10', id = 'october') {
  return {
    asset_id: id,
    public_id: `elim/media/bulletin/${month}/${id}.pdf`,
    secure_url: `https://res.cloudinary.com/${cloudName}/raw/upload/v1/elim/media/bulletin/${month}/${id}.pdf`,
    created_at: '2026-10-01T10:00:00Z',
    context: { custom: { month, title: 'October bulletin', theme: 'Hope', quote: 'A living hope.', scripture: '1 Peter 1:3' } },
  }
}

test('bulletin reader accepts only app PDFs with valid months and trusted delivery URLs', () => {
  const item = toBulletin(resource(), cloudName)
  assert.ok(item)
  assert.equal(item.theme, 'Hope')
  assert.equal(item.scripture, '1 Peter 1:3')
  assert.equal(item.quote, 'A living hope.')
  for (const month of ['2026-13', '2026-0', '', '../bad'])
    assert.equal(toBulletin(resource(month), cloudName), null)
  for (const secure_url of ['https://evil.example/a.pdf', 'https://res.cloudinary.com/other-cloud/raw/upload/a.pdf', 'http://res.cloudinary.com/test-cloud/raw/upload/a.pdf'])
    assert.equal(toBulletin({ ...resource(), secure_url }, cloudName), null)
  assert.equal(toBulletin({ ...resource(), public_id: 'other/a.pdf' }, cloudName), null)
  assert.equal(toBulletin({ ...resource(), public_id: 'elim/media/bulletin/not-a-pdf.txt' }, cloudName), null)
  const oldUpload = toBulletin({ ...resource(), context: { custom: { month: '2026-10' } } }, cloudName)
  assert.ok(oldUpload)
  assert.equal(oldUpload.theme, '')
  assert.equal(oldUpload.title, 'Monthly bulletin')
})

test('archive sorts uploaded bulletin months and uses the latest revision', () => {
  const october = toBulletin(resource(), cloudName)!
  const replacement = { ...october, id: 'replacement', createdAt: '2026-10-02T09:00:00Z' }
  const september = toBulletin(resource('2026-09', 'september'), cloudName)!
  // Upload date doesn't determine which month is featured.
  september.createdAt = '2026-10-03T09:00:00Z'
  const archive = bulletinArchive([replacement, september, october])
  assert.deepEqual(archive.map((item) => item.month), ['2026-10', '2026-09'])
  assert.equal(archive[0].id, 'replacement')
  assert.deepEqual(bulletinArchive([]), [])
  const june = toBulletin(resource('2026-06', 'uploaded-june'), cloudName)!
  assert.equal(bulletinArchive([june])[0].id, 'uploaded-june')
  assert.equal(bulletinDownloadUrl(october), '/api/bulletins/2026-10/pdf?id=october&download=1')
})

test('bulletin fields are bounded, trimmed, and included in signed Cloudinary context', () => {
  const input = {
    kind: 'bulletin', month: '2026-10', title: 'October bulletin', description: '',
    filename: 'october.pdf', contentType: 'application/pdf', bytes: 2048,
    theme: ' Hope ', quote: 'Hope | scripture=changed', scripture: '1 Peter 1:3',
  }
  const validated = validateUpload(input)
  assert.equal(validated.theme, 'Hope')
  const ticket = uploadTicket(validated)
  assert.ok(ticket.params.context.includes('theme=Hope'))
  assert.ok(ticket.params.context.includes('quote=Hope \\| scripture\\=changed'))
  assert.ok(ticket.params.context.includes('scripture=1 Peter 1:3'))
  assert.equal(ticket.params.tags, 'elim-media,elim-media-bulletin')
  const { signature: expected } = ticket
  assert.equal(expected, cloudinary.utils.api_sign_request(ticket.params, 'test-secret'))
  for (const change of [{ theme: 'x'.repeat(121) }, { quote: 'x'.repeat(251) }, { scripture: 'x'.repeat(101) }, { theme: 42 }])
    assert.throws(() => validateUpload({ ...input, ...change }))
})

test('bulletin listing follows Cloudinary cursors and propagates failures', async () => {
  const original = cloudinary.api.resources_by_tag
  const calls: string[] = []
  cloudinary.api.resources_by_tag = (async (tag: string, options: { resource_type: string; next_cursor?: string }) => {
    assert.equal(tag, 'elim-media-bulletin')
    assert.equal(options.resource_type, 'raw')
    calls.push(options.next_cursor ?? 'first')
    return options.next_cursor
      ? { resources: [resource('2026-09', 'september')] }
      : { resources: [resource()], next_cursor: 'page-2' }
  }) as unknown as typeof original
  try {
    assert.deepEqual((await listBulletins()).map((item) => item.month), ['2026-10', '2026-09'])
    assert.deepEqual(calls, ['first', 'page-2'])
    cloudinary.api.resources_by_tag = (async () => { throw new Error('Unavailable') }) as unknown as typeof original
    await assert.rejects(listBulletins(), /Unavailable/)
  } finally {
    cloudinary.api.resources_by_tag = original
  }
})

function textItem(str: string, x: number, y: number, height = 12, hasEOL = true): TextItem {
  return { str, transform: [height, 0, 0, height, x, y], height,
    width: str.length * height / 2, dir: 'ltr', fontName: 'test', hasEOL }
}

function textContent(items: TextContent['items']): TextContent {
  return { items, styles: {}, lang: 'en' }
}

test('text view reflows wrapped body text while preserving headings and paragraph gaps', () => {
  const content = textContent([
    textItem('Monthly encouragement', 40, 760, 24),
    textItem('We gather in hope', 40, 724),
    textItem('and grow together.', 40, 709),
    textItem('Join us this Sunday.', 40, 675),
    textItem('• Morning service', 40, 660),
    textItem('• Evening service', 40, 645),
  ])
  assert.deepEqual(bulletinTextParagraphs(content), [
    'Monthly encouragement', 'We gather in hope and grow together.',
    'Join us this Sunday.', '• Morning service', '• Evening service',
  ])
})

test('text view keeps word fragments together, inserts word gaps, and retains column order', () => {
  assert.deepEqual(bulletinTextParagraphs(textContent([
    { type: 'beginMarkedContent', id: 'section' },
    textItem('Wel', 40, 700, 12, false),
    textItem('come', 58, 700, 12, false),
    textItem('home.', 94, 700),
    textItem('A second column', 300, 700),
    textItem('continues here.', 300, 685),
  ])), ['Welcome home.', 'A second column continues here.'])
})

test('text view returns no paragraphs for image-only or blank pages', () => {
  assert.deepEqual(bulletinTextParagraphs(textContent([])), [])
  assert.deepEqual(bulletinTextParagraphs(textContent([textItem('   ', 0, 0)])), [])
})
