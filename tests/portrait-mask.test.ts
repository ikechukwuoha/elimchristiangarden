import assert from 'node:assert/strict'
import { test } from 'node:test'
import { subjectRegion } from '../src/app/worship-encounter/portrait-mask'

function rectangle(data: Float32Array, width: number, x: number, y: number, w: number, h: number) {
  for (let row = y; row < y + h; row++) for (let col = x; col < x + w; col++) data[row * width + col] = 0
}

test('keeps the person and soft boundary while removing a fragment attached by a narrow bridge', () => {
  const width = 64, height = 64
  const background = new Float32Array(width * height).fill(1)
  rectangle(background, width, 25, 6, 30, 50)
  rectangle(background, width, 2, 15, 10, 10)
  rectangle(background, width, 12, 20, 13, 1)
  const region = subjectRegion(background, width, height)
  assert.equal(region[30 * width + 40], 1)
  assert.equal(region[6 * width + 25], 1)
  assert.equal(region[20 * width + 6], 0)
  assert.equal(region[0], 0)
})

test('does not join opposite sides of consecutive image rows', () => {
  const width = 64, height = 64
  const background = new Float32Array(width * height).fill(1)
  rectangle(background, width, 0, 20, 30, 44)
  rectangle(background, width, 53, 0, 11, 20)
  const region = subjectRegion(background, width, height)
  assert.equal(region[40 * width + 15], 1)
  assert.equal(region[10 * width + 60], 0)
})

test('preserves an image-filling subject and handles a very small foreground', () => {
  const full = subjectRegion(new Float32Array(20 * 20), 20, 20)
  assert.equal(full.every((value) => value === 1), true)
  const tiny = new Float32Array(20 * 20).fill(1)
  tiny[10 * 20 + 10] = 0
  assert.equal(subjectRegion(tiny, 20, 20)[10 * 20 + 10], 1)
})

test('rejects incompatible mask dimensions', () => {
  assert.throws(() => subjectRegion(new Float32Array(5), 10, 10), /dimensions/)
})
