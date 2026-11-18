import { subjectRegion } from './portrait-mask'
import { inferPortrait, portraitInputSize } from './portrait-inference'

const MAX_BYTES = 10 * 1024 * 1024
const MAX_EDGE = 1600

function canvas(width: number, height: number) {
  const result = document.createElement('canvas')
  result.width = width
  result.height = height
  const ctx = result.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('Your browser could not open this photo. Please try another browser.')
  return { canvas: result, ctx }
}

export function validatePortrait(file: File) {
  const supported = ['image/jpeg', 'image/png', 'image/webp']
  if (file.type ? !supported.includes(file.type) : !/\.(jpe?g|png|webp)$/i.test(file.name)) {
    throw new Error('Choose a JPG, PNG, or WebP photo.')
  }
  if (!file.size || file.size > MAX_BYTES) throw new Error('Choose a photo smaller than 10 MB.')
}

async function openPhoto(file: File) {
  const url = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > 60_000_000) {
      throw new Error('This photo is too large. Please choose a smaller version.')
    }
    const scale = Math.min(1, MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight))
    const source = canvas(Math.max(1, Math.round(image.naturalWidth * scale)), Math.max(1, Math.round(image.naturalHeight * scale)))
    source.ctx.drawImage(image, 0, 0, source.canvas.width, source.canvas.height)
    return source
  } finally {
    URL.revokeObjectURL(url)
  }
}

function hasTransparentBorder(data: Uint8ClampedArray, width: number, height: number) {
  let transparent = 0
  let samples = 0
  for (let x = 0; x < width; x++) {
    if (data[x * 4 + 3] < 16) transparent++
    if (data[((height - 1) * width + x) * 4 + 3] < 16) transparent++
    samples += 2
  }
  for (let y = 0; y < height; y++) {
    if (data[(y * width) * 4 + 3] < 16) transparent++
    if (data[(y * width + width - 1) * 4 + 3] < 16) transparent++
    samples += 2
  }
  return transparent > samples * 0.2
}

function trimPortrait(source: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const { width, height } = source
  const { data } = ctx.getImageData(0, 0, width, height)
  let left = width, top = height, right = -1, bottom = -1, visible = 0
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] < 32) continue
      left = Math.min(left, x); top = Math.min(top, y)
      right = Math.max(right, x); bottom = Math.max(bottom, y)
      visible++
    }
  }
  if (right < left || bottom < top || visible < width * height * 0.01) {
    throw new Error('We could not find a clear person in this photo. Try a closer portrait, or turn off background removal.')
  }
  const padding = 3
  left = Math.max(0, left - padding); top = Math.max(0, top - padding)
  right = Math.min(width - 1, right + padding); bottom = Math.min(height - 1, bottom + padding)
  const output = canvas(right - left + 1, bottom - top + 1)
  output.ctx.drawImage(source, left, top, output.canvas.width, output.canvas.height, 0, 0, output.canvas.width, output.canvas.height)
  return output.canvas
}

export async function preparePortrait(file: File, removeBackground: boolean, onProgress: (message: string) => void): Promise<HTMLCanvasElement> {
  validatePortrait(file)
  onProgress('Opening your photo…')
  const source = await openPhoto(file)
  const temporary = [source.canvas]
  try {
    const pixels = source.ctx.getImageData(0, 0, source.canvas.width, source.canvas.height)
    // Preserve a supplied cutout exactly; do not segment its hair or clothing again.
    if (!removeBackground || hasTransparentBorder(pixels.data, source.canvas.width, source.canvas.height)) {
      return trimPortrait(source.canvas, source.ctx)
    }
    onProgress('Removing the background… The first photo may take a moment.')
    // Only plain pixels go to the CPU runtime; no WebGL context or texture is used.
    const size = portraitInputSize(source.canvas.width, source.canvas.height)
    const analysis = canvas(size.width, size.height)
    temporary.push(analysis.canvas)
    analysis.ctx.drawImage(source.canvas, 0, 0, analysis.canvas.width, analysis.canvas.height)
    const matte = await inferPortrait(analysis.ctx.getImageData(0, 0, size.width, size.height), () => {
      onProgress('Blending your portrait into the flyer…')
    })
    const region = subjectRegion(matte.background, matte.width, matte.height)
    const mask = canvas(matte.width, matte.height)
    temporary.push(mask.canvas)
    const alpha = mask.ctx.createImageData(matte.width, matte.height)
    for (let i = 0; i < matte.background.length; i++) {
      alpha.data[i * 4 + 3] = region[i] ? Math.round((1 - matte.background[i]) * 255) : 0
    }
    mask.ctx.putImageData(alpha, 0, 0)
    source.ctx.globalCompositeOperation = 'destination-in'
    source.ctx.drawImage(mask.canvas, 0, 0, source.canvas.width, source.canvas.height)
    source.ctx.globalCompositeOperation = 'source-over'
    return trimPortrait(source.canvas, source.ctx)
  } finally {
    // Safari can retain detached canvas buffers until they are explicitly released.
    for (const surface of temporary) surface.width = surface.height = 0
  }
}
