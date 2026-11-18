import assert from 'node:assert/strict'
import { test } from 'node:test'
import { defaultFraming, pinchPortrait, portraitPlacement } from '../src/app/worship-encounter/portrait-framing'

test('fits and centres an uncropped portrait while keeping the head at the top', () => {
  const placement = portraitPlacement(400, 800, 600, 600, defaultFraming)
  assert.equal(placement.width, 600)
  assert.equal(placement.height, 1200)
  assert.equal(placement.left, 0)
  assert.equal(placement.top, 0)
})

test('supports zooming out and positioning on both axes even when the image fits exactly', () => {
  const placement = portraitPlacement(600, 600, 600, 600, { ...defaultFraming, zoom: 0.5, x: 75, y: 10 })
  assert.equal(placement.width, 300)
  assert.equal(placement.height, 300)
  assert.equal(placement.left, 300)
  assert.equal(placement.top, 60)
})

test('quarter turns fit the rotated dimensions rather than clipping against the original aspect ratio', () => {
  const placement = portraitPlacement(400, 800, 600, 600, { ...defaultFraming, rotation: 90 })
  assert.equal(placement.width, 1200)
  assert.equal(placement.height, 600)
  assert.equal(placement.left, -300)
  assert.equal(placement.rotation, 90)
})

test('rotation wraps in either direction and mirroring preserves the crop bounds', () => {
  const normal = portraitPlacement(400, 800, 600, 600, { ...defaultFraming, rotation: 270 })
  const mirrored = portraitPlacement(400, 800, 600, 600, { ...defaultFraming, rotation: -90, flipped: true })
  assert.deepEqual(mirrored, normal)
})

test('pinching keeps the same part of the image under the fingers while they move', () => {
  const start = { ...defaultFraming, x: 65, y: 10, rotation: 90, flipped: true }
  const anchor = { x: 230, y: 280 }
  const movement = { x: 18, y: -12 }
  const before = portraitPlacement(600, 900, 670, 780, start)
  const next = pinchPortrait(600, 900, 670, 780, start, anchor, movement, 1.3)
  const after = portraitPlacement(600, 900, 670, 780, next)
  assert.ok(Math.abs((anchor.x - before.left) / before.width - (anchor.x + movement.x - after.left) / after.width) < 1e-9)
  assert.ok(Math.abs((anchor.y - before.top) / before.height - (anchor.y + movement.y - after.top) / after.height) < 1e-9)
  assert.equal(next.rotation, start.rotation)
  assert.equal(next.flipped, true)
})

test('pinch gestures respect zoom and positioning limits', () => {
  const large = pinchPortrait(600, 900, 670, 780, defaultFraming, { x: 335, y: 300 }, { x: 10000, y: -10000 }, 20)
  assert.equal(large.zoom, 3)
  assert.equal(large.x, 150)
  assert.equal(large.y, -100)
  const small = pinchPortrait(600, 900, 670, 780, defaultFraming, { x: 335, y: 300 }, { x: 0, y: 0 }, 0.01)
  assert.equal(small.zoom, 0.5)
})
