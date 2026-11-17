import assert from 'node:assert/strict'
import { test } from 'node:test'
import { portraitInputSize, portraitTensorPixels } from '../src/app/worship-encounter/portrait-inference'

test('normalizes RGB channels into the planar tensor required by MODNet', () => {
  const rgba = new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 255, 255])
  assert.deepEqual([...portraitTensorPixels(rgba)], [1, -1, -1, 1, -1, 1])
})

test('alpha is not an extra model channel and does not change the RGB normalization', () => {
  assert.deepEqual(portraitTensorPixels(new Uint8ClampedArray([128, 64, 192, 0])), portraitTensorPixels(new Uint8ClampedArray([128, 64, 192, 255])))
})

test('preserves portrait and landscape proportions within the model dimension constraints', () => {
  assert.deepEqual(portraitInputSize(1122, 1402), { width: 416, height: 512 })
  assert.deepEqual(portraitInputSize(1402, 1122), { width: 512, height: 416 })
  assert.deepEqual(portraitInputSize(10, 2000), { width: 32, height: 512 })
  assert.deepEqual(portraitInputSize(512, 512), { width: 512, height: 512 })
})
