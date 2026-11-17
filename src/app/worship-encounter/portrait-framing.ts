export type PortraitFraming = { zoom: number; x: number; y: number; rotation: number; flipped: boolean }
export const defaultFraming: PortraitFraming = { zoom: 1, x: 50, y: 0, rotation: 0, flipped: false }
export const PORTRAIT_FRAME = { x: 205, y: 720, width: 670, height: 600 }

export function portraitPlacement(imageWidth: number, imageHeight: number, frameWidth: number, frameHeight: number, framing: PortraitFraming) {
  const rotation = ((framing.rotation ?? 0) % 360 + 360) % 360
  const sideways = rotation === 90 || rotation === 270
  const rotatedWidth = sideways ? imageHeight : imageWidth
  const rotatedHeight = sideways ? imageWidth : imageHeight
  const scale = Math.max(frameWidth / rotatedWidth, frameHeight / rotatedHeight) * framing.zoom
  const width = rotatedWidth * scale
  const height = rotatedHeight * scale
  return {
    width, height, scale, rotation,
    left: (frameWidth - width) / 2 + (framing.x - 50) / 100 * frameWidth,
    top: framing.y / 100 * frameHeight,
  }
}

// Shared by the crop editor and exported flyer so every edit has the same result.
export function drawPortraitCrop(ctx: CanvasRenderingContext2D, portrait: HTMLCanvasElement, width: number, height: number, framing: PortraitFraming) {
  const placement = portraitPlacement(portrait.width, portrait.height, width, height, framing)
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 0, width, height)
  ctx.clip()
  ctx.translate(placement.left + placement.width / 2, placement.top + placement.height / 2)
  ctx.scale(framing.flipped ? -1 : 1, 1)
  ctx.rotate(placement.rotation * Math.PI / 180)
  ctx.scale(placement.scale, placement.scale)
  ctx.drawImage(portrait, -portrait.width / 2, -portrait.height / 2)
  ctx.restore()
}
