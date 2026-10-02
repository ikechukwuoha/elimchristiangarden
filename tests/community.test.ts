import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  addGroup,
  groupDetails,
  groupOptions,
  isGroupArray,
  parseGroupInput,
  removeGroup,
  normalizeGroups,
  seedGroups,
  slugifyTitle,
  readGroups,
  saveGroups,
  COMMUNITY_DATA_ID,
  CommunityStorageError,
} from '../src/lib/community'
import { resetStorageHealth } from '../src/lib/storage-health'

const validInput = {
  title: 'Youths Fellowship',
  kind: 'fellowship',
  category: 'FAITH & FUTURE',
  description: 'A community of young believers growing together.',
  image: '',
  alt: '',
  activities: ['Monthly hangout', 'Bible study'],
}

test('seeded groups keep their ids so existing galleries keep working', () => {
  const ids = seedGroups.map((group) => group.id)
  assert.ok(ids.includes('brothers'))
  assert.ok(ids.includes('children-and-teenagers'))
  assert.equal(
    seedGroups.find((group) => group.id === 'tehilla')?.kind,
    'unit',
  )
  assert.equal(
    seedGroups.find((group) => group.id === 'protocol')?.kind,
    'unit',
  )
  assert.ok(
    seedGroups
      .filter((group) => group.kind === 'fellowship')
      .every((group) => group.activities.length === 0),
  )
})

test('titles become unique, url-safe ids', () => {
  assert.equal(slugifyTitle('Youths Fellowship'), 'youths-fellowship')
  assert.equal(slugifyTitle('  Music  &  Arts!  '), 'music-arts')
  assert.equal(slugifyTitle('Café Sisters'), 'cafe-sisters')
  const existing = [{ ...seedGroups[0], id: 'youths-fellowship' }]
  const record = parseGroupInput(validInput, existing)
  assert.equal(record.id, 'youths-fellowship-2')
  assert.equal(parseGroupInput(validInput, []).id, 'youths-fellowship')
})

test('group input is validated and filled with sensible defaults', () => {
  const record = parseGroupInput(validInput, seedGroups)
  assert.equal(record.category, 'FAITH & FUTURE')
  assert.equal(record.alt, 'Youths Fellowship at Elim Christian Garden')
  assert.deepEqual(record.activities, ['Monthly hangout', 'Bible study'])
  const minimal = parseGroupInput(
    { title: 'Choir', kind: 'unit', description: 'Our worship team.' },
    [],
  )
  assert.equal(minimal.category, 'UNIT')
  assert.deepEqual(minimal.activities, [])
  for (const change of [
    { title: '   ' },
    { title: 'x'.repeat(81) },
    { kind: 'committee' },
    { description: '' },
    { description: 'x'.repeat(501) },
    { image: 'https://evil.example/a.jpg' },
    { image: 'http://res.cloudinary.com/demo/image/upload/a.jpg' },
    { activities: 'not-a-list' },
  ]) {
    assert.throws(
      () => parseGroupInput({ ...validInput, ...change }, []),
      Error,
      JSON.stringify(change),
    )
  }
})

test('groups can be added and removed, and removal fails for unknown ids', () => {
  const record = parseGroupInput(validInput, seedGroups)
  const withNew = addGroup(seedGroups, record)
  assert.equal(withNew.length, seedGroups.length + 1)
  assert.equal(removeGroup(withNew, record.id).length, seedGroups.length)
  assert.throws(() => removeGroup(withNew, 'not-a-group'))
})

test('stored data is only trusted when it matches the group shape', () => {
  const record = parseGroupInput(validInput, [])
  assert.equal(isGroupArray([record]), true)
  assert.equal(isGroupArray([{ ...record, kind: 'department' }]), true)
  assert.equal(isGroupArray([{ ...record, kind: 'other' }]), false)
  assert.equal(normalizeGroups([{ ...record, kind: 'department' }])[0].kind, 'unit')
  assert.equal(isGroupArray([{ ...record, id: '' }]), false)
  assert.equal(isGroupArray([{ ...record, activities: [123] }]), false)
  assert.equal(isGroupArray('groups'), false)
  assert.equal(isGroupArray([]), true)
})

test('gallery options include Church-wide first and resolve group details', () => {
  const options = groupOptions(seedGroups)
  assert.equal(options[0].id, 'church-wide')
  assert.ok(options.some((option) => option.id === 'brothers'))
  assert.equal(groupDetails(seedGroups, 'church-wide')?.label, 'Church-wide')
  assert.equal(groupDetails(seedGroups, 'brothers')?.label, 'Brothers Fellowship')
  assert.equal(groupDetails(seedGroups, 'not-a-group'), null)
})

async function withStorageFetch(fetchMock: typeof fetch, run: () => Promise<void>) {
  const originalFetch = globalThis.fetch
  const keys = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'] as const
  const previous = keys.map((key) => process.env[key])
  process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud'
  process.env.CLOUDINARY_API_KEY = 'test-key'
  process.env.CLOUDINARY_API_SECRET = 'test-secret'
  globalThis.fetch = fetchMock
  // Each scenario starts with the storage circuit closed.
  resetStorageHealth()
  try {
    await run()
  } finally {
    globalThis.fetch = originalFetch
    resetStorageHealth()
    keys.forEach((key, index) => {
      if (previous[index] === undefined) delete process.env[key]
      else process.env[key] = previous[index]
    })
  }
}

test('strict reads load the stored list and only initialize seeds on a confirmed missing asset', async () => {
  const custom = parseGroupInput(validInput, [])
  let calls = 0
  await withStorageFetch(async (url, init) => {
    calls++
    assert.equal(init?.cache, 'no-store')
    assert.ok(init?.signal)
    if (calls === 1) {
      assert.match(String(url), /\/resources\/raw\/upload\/elim%2Fdata%2Fcommunity.json$/)
      assert.equal(new Headers(init?.headers).get('authorization'), `Basic ${Buffer.from('test-key:test-secret').toString('base64')}`)
      return Response.json({ secure_url: 'https://res.cloudinary.com/test-cloud/raw/upload/v1/elim/data/community.json' })
    }
    assert.equal(new Headers(init?.headers).has('authorization'), false)
    return Response.json([custom])
  }, async () => {
    assert.deepEqual(await readGroups({ strict: true }), [custom])
    assert.equal(calls, 2)
  })
  await withStorageFetch(async () => new Response('', { status: 404 }), async () => {
    assert.deepEqual(await readGroups({ strict: true }), seedGroups)
  })
})

test('failed reads cannot silently seed a mutation, while public pages retain their fallback', async () => {
  for (const failure of ['network', 'authorization', 'invalid-data', 'missing-delivery']) {
    await withStorageFetch(async (url) => {
      if (failure === 'network') throw new Error('Connection failed')
      if (failure === 'authorization') return Response.json({ error: { message: 'provider message' } }, { status: 401 })
      if (String(url).startsWith('https://api.cloudinary.com/'))
        return Response.json({ secure_url: 'https://res.cloudinary.com/test-cloud/raw/upload/v1/elim/data/community.json' })
      if (failure === 'missing-delivery') return new Response('', { status: 404 })
      return Response.json({ invalid: true })
    }, async () => {
      await assert.rejects(readGroups({ strict: true }), (error: unknown) => {
        assert.ok(error instanceof CommunityStorageError)
        assert.equal(error.status, 502)
        assert.ok(!error.message.includes('test-secret'))
        return true
      })
      assert.deepEqual(await readGroups(), seedGroups)
    })
  }
})

test('stored file URLs cannot redirect the reader to another host or cloud', async () => {
  for (const secure_url of ['https://evil.example/data.json', 'https://res.cloudinary.com/other-cloud/raw/upload/data.json']) {
    let calls = 0
    await withStorageFetch(async () => {
      calls++
      return Response.json({ secure_url })
    }, async () => {
      await assert.rejects(readGroups({ strict: true }), CommunityStorageError)
      assert.equal(calls, 1)
    })
  }
})

test('group saves use one authenticated multipart request with the complete JSON list', async () => {
  const groups = addGroup(seedGroups, parseGroupInput(validInput, seedGroups))
  let calls = 0
  await withStorageFetch(async (url, init) => {
    calls++
    assert.equal(String(url), 'https://api.cloudinary.com/v1_1/test-cloud/raw/upload')
    assert.equal(init?.method, 'POST')
    const body = init?.body
    assert.ok(body instanceof FormData)
    const file = body.get('file')
    assert.ok(file instanceof Blob)
    assert.equal(file.type, 'application/json')
    assert.deepEqual(JSON.parse(await file.text()), groups)
    assert.equal(body.get('public_id'), COMMUNITY_DATA_ID)
    assert.equal(body.get('overwrite'), 'true')
    assert.equal(body.get('invalidate'), 'true')
    assert.equal(body.has('api_secret'), false)
    return Response.json({ public_id: COMMUNITY_DATA_ID })
  }, async () => {
    await saveGroups(groups)
    assert.equal(calls, 1)
  })
})

test('timeouts return a 504 storage error and never retry an ambiguous save', async () => {
  const originalTimeout = AbortSignal.timeout
  AbortSignal.timeout = (milliseconds) => {
    assert.equal(milliseconds, 20000)
    return AbortSignal.abort(new DOMException('Timed out', 'TimeoutError'))
  }
  let calls = 0
  try {
    await withStorageFetch(async (_url, init) => {
      calls++
      assert.ok(init?.signal?.aborted)
      throw init.signal.reason
    }, async () => {
      await assert.rejects(saveGroups(seedGroups), (error: unknown) => {
        assert.ok(error instanceof CommunityStorageError)
        assert.equal(error.status, 504)
        assert.match(error.message, /may already have been saved/)
        return true
      })
      assert.equal(calls, 1)
    })
  } finally {
    AbortSignal.timeout = originalTimeout
  }
})

test('storage rejections are service errors and an unconfirmed upload is never reported as saved', async () => {
  for (const status of [401, 403, 499, 500]) {
    await withStorageFetch(async () => Response.json({ error: { message: 'Request Timeout' } }, { status }), async () => {
      await assert.rejects(saveGroups(seedGroups), (error: unknown) => {
        assert.ok(error instanceof CommunityStorageError)
        assert.equal(error.status, status === 499 ? 504 : 502)
        return true
      })
    })
  }
  await withStorageFetch(async () => Response.json({ public_id: 'wrong-file' }), async () => {
    await assert.rejects(saveGroups(seedGroups), CommunityStorageError)
  })
})
