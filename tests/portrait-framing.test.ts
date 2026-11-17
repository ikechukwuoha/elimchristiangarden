import assert from 'node:assert/strict'
import { test } from 'node:test'
import { defaultFraming, portraitPlacement } from '../src/app/worship-encounter/portrait-framing'

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
