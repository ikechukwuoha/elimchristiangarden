import { drawPortraitCrop, PORTRAIT_FRAME, type PortraitFraming } from './portrait-framing'
import { flyerSponsor } from './flyer-sponsor'
export { defaultFraming, type PortraitFraming } from './portrait-framing'

export const FLYER_WIDTH = 1080
export const FLYER_HEIGHT = 1740
export const FLYER_SCALE = 2
export const FLYER_BACKGROUND = '/images/flyer/forest-worship-background-v7.webp'
export const FLYER_LOGO = '/images/logo-removebg-preview.png'

// Event information is fixed. Visitors supply a name, portrait and optional affiliation.
export const flyerEvent = {
  title: 'DESTINY',
  subtitle: 'CONFERENCE 2026',
  weekday: 'TUE – SUN',
  day: '1ST – 6TH',
  month: 'DEC',
  year: '2026',
  time: '5:30',
  period: 'PM',
  theme: ['DIVINE SETTLEMENT', 'FOR A NEW BEGINNING'],
  scripture: '',
  churchName: 'ELIM CHRISTIAN GARDEN INTERNATIONAL',
  address: 'ELIM GARDEN, KILOMETER 2, KUDURU EXPRESS WAY, BWARI, ABUJA',
  minister: 'REV. EMMANUEL O. OLOWONONI',
}

// The same forest, leaf, champagne and ivory palette used on the home page.
const FOREST = '#173c30'
const LEAF = '#244c3b'
const GOLD = '#d9bd8b'
const IVORY = '#f9f8f3'
const SANS = '"Open Sans", sans-serif'
const DISPLAY = 'Merriweather, Georgia, serif'
const PORTRAIT = PORTRAIT_FRAME

function fittedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, width: number, size: number, weight = '800', family = SANS) {
  ctx.font = `${weight} ${size}px ${family}`
  while (ctx.measureText(text).width > width && size > 12) {
    ctx.font = `${weight} ${--size}px ${family}`
  }
  ctx.fillText(text, x, y)
}

function trackedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, width: number, size: number, tracking: number, weight = '700') {
  ctx.save()
  const letters = Array.from(text)
  const measure = () => letters.reduce((sum, letter) => sum + ctx.measureText(letter).width, 0) + Math.max(0, letters.length - 1) * tracking
  ctx.font = `${weight} ${size}px ${SANS}`
  while (measure() > width && size > 12) ctx.font = `${weight} ${--size}px ${SANS}`
  let cursor = x - measure() / 2
  ctx.textAlign = 'left'
  for (const letter of letters) {
    ctx.fillText(letter, cursor, y)
    cursor += ctx.measureText(letter).width + tracking
  }
  ctx.restore()
}

function diamond(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath()
  ctx.moveTo(x, y - size)
  ctx.lineTo(x + size, y)
  ctx.lineTo(x, y + size)
  ctx.lineTo(x - size, y)
  ctx.closePath()
  ctx.fill()
}

function forestInk(ctx: CanvasRenderingContext2D, y: number, height: number) {
  const ink = ctx.createLinearGradient(0, y, 1080, y + height)
  ink.addColorStop(0, FOREST)
  ink.addColorStop(0.55, '#32614a')
  ink.addColorStop(1, FOREST)
  return ink
}

function goldInk(ctx: CanvasRenderingContext2D) {
  const ink = ctx.createLinearGradient(100, 0, 980, 0)
  ink.addColorStop(0, '#b18c4a')
  ink.addColorStop(0.45, '#f6e3b6')
  ink.addColorStop(1, '#c8a665')
  return ink
}

function headline(ctx: CanvasRenderingContext2D) {
  ctx.save()
  ctx.fillStyle = FOREST
  trackedText(ctx, flyerEvent.churchName, 540, 225, 850, 17, 2, '700')
  ctx.fillStyle = forestInk(ctx, 260, 110)
  ctx.shadowColor = '#d9bd8b80'
  ctx.shadowOffsetY = 2
  fittedText(ctx, flyerEvent.title, 540, 362, 890, 136, '700', DISPLAY)
  ctx.shadowColor = 'transparent'
  ctx.fillStyle = GOLD
  diamond(ctx, 70, 311, 8)
  diamond(ctx, 1010, 311, 8)

  const conference = flyerEvent.subtitle.replace(/\s+\d{4}$/, '')
  ctx.font = `700 39px ${SANS}`
  const conferenceWidth = Array.from(conference).reduce((sum, letter) => sum + ctx.measureText(letter).width, 0) + (conference.length - 1) * 7
  const left = 540 - (conferenceWidth + 28 + 140) / 2
  ctx.fillStyle = FOREST
  trackedText(ctx, conference, left + conferenceWidth / 2, 421, conferenceWidth, 39, 7)
  ctx.fillStyle = goldInk(ctx)
  ctx.beginPath()
  ctx.roundRect(left + conferenceWidth + 28, 383, 140, 52, 14)
  ctx.fill()
  ctx.fillStyle = FOREST
  fittedText(ctx, flyerEvent.year, left + conferenceWidth + 98, 421, 116, 33)
  ctx.restore()
}

function drawPortrait(ctx: CanvasRenderingContext2D, portrait: HTMLCanvasElement, framing: PortraitFraming) {
  // The subject is already transparent. A circular crop cannot produce this effect.
  const layer = document.createElement('canvas')
  layer.width = PORTRAIT.width * FLYER_SCALE
  layer.height = PORTRAIT.height * FLYER_SCALE
  const pctx = layer.getContext('2d')
  if (!pctx) throw new Error('Your browser could not prepare the portrait.')
  pctx.scale(FLYER_SCALE, FLYER_SCALE)
  drawPortraitCrop(pctx, portrait, PORTRAIT.width, PORTRAIT.height, framing)
  // Only the very bottom fades; hair and shoulders retain their natural outline.
  const fade = pctx.createLinearGradient(0, PORTRAIT.height - 58, 0, PORTRAIT.height)
  fade.addColorStop(0, '#000')
  fade.addColorStop(1, 'transparent')
  pctx.globalCompositeOperation = 'destination-in'
  pctx.fillStyle = fade
  pctx.fillRect(0, 0, PORTRAIT.width, PORTRAIT.height)
  ctx.drawImage(layer, PORTRAIT.x, PORTRAIT.y, PORTRAIT.width, PORTRAIT.height)
}

function drawName(ctx: CanvasRenderingContext2D, name: string) {
  ctx.save()
  const label = (name.trim() || 'YOUR NAME').toLocaleUpperCase()
  let size = 34
  ctx.font = `700 ${size}px ${SANS}`
  while (ctx.measureText(label).width > 515 && size > 14) ctx.font = `700 ${--size}px ${SANS}`
  const nameWidth = ctx.measureText(label).width
  const width = Math.min(620, nameWidth + 96)
  const left = 540 - width / 2
  ctx.fillStyle = IVORY
  ctx.shadowColor = '#173c3026'
  ctx.shadowBlur = 18
  ctx.shadowOffsetY = 4
  ctx.beginPath()
  ctx.roundRect(left, 1346, width, 58, 12)
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.strokeStyle = '#d9bd8b99'
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.fillStyle = FOREST
  ctx.beginPath()
  ctx.arc(left + 32, 1375, 16, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = GOLD
  ctx.lineWidth = 3
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(left + 24, 1374)
  ctx.lineTo(left + 30, 1381)
  ctx.lineTo(left + 42, 1368)
  ctx.stroke()
  ctx.fillStyle = FOREST
  ctx.textAlign = 'left'
  ctx.fillText(label, left + 63, 1387, width - 81)
  ctx.restore()
}

function drawConfirmed(ctx: CanvasRenderingContext2D) {
  // Distress a separate ink layer so its worn spots reveal, rather than erase, the photo.
  const size = 350
  const layer = document.createElement('canvas')
  layer.width = layer.height = size * FLYER_SCALE
  const ink = layer.getContext('2d')
  if (!ink) throw new Error('Your browser could not prepare the attendance stamp.')
  ink.scale(FLYER_SCALE, FLYER_SCALE)
  ink.translate(size / 2, size / 2)
  ink.rotate(-Math.PI / 6) // CONFIRMED rises 30° toward two o'clock.
  ink.textAlign = 'center'
  ink.textBaseline = 'alphabetic'

  // A translucent ground leaves the clothing visible through the circular seal.
  ink.fillStyle = 'rgba(249, 248, 243, 0.3)'
  ink.beginPath()
  ink.arc(0, 0, 140, 0, Math.PI * 2)
  ink.fill()
  ink.strokeStyle = FOREST
  for (const [radius, width] of [[140, 7], [131, 2], [102, 2]]) {
    ink.lineWidth = width
    ink.beginPath()
    ink.arc(0, 0, radius, 0, Math.PI * 2)
    ink.stroke()
  }
  ink.strokeStyle = GOLD
  ink.lineWidth = 1.5
  ink.beginPath()
  ink.arc(0, 0, 146, 0, Math.PI * 2)
  ink.stroke()

  // Curved event lettering makes the seal part of this conference's artwork.
  const label = Array.from(`${flyerEvent.title} ${flyerEvent.subtitle.replace(/\s+\d{4}$/, '')}`)
  const radius = 116
  ink.font = `800 17px ${SANS}`
  const widths = label.map((letter) => ink.measureText(letter).width + 2)
  let angle = -Math.PI / 2 - widths.reduce((sum, width) => sum + width, 0) / radius / 2
  ink.fillStyle = FOREST
  for (let i = 0; i < label.length; i++) {
    const step = widths[i] / radius
    const middle = angle + step / 2
    ink.save()
    ink.translate(Math.cos(middle) * radius, Math.sin(middle) * radius)
    ink.rotate(middle + Math.PI / 2)
    ink.textBaseline = 'middle'
    ink.fillText(label[i], 0, 0)
    ink.restore()
    angle += step
  }

  ink.strokeStyle = FOREST
  ink.lineWidth = 7
  ink.lineCap = 'round'
  ink.lineJoin = 'round'
  ink.beginPath()
  ink.moveTo(-17, -56)
  ink.lineTo(-3, -42)
  ink.lineTo(24, -72)
  ink.stroke()
  ink.fillStyle = 'rgba(249, 248, 243, 0.92)'
  ink.beginPath()
  ink.roundRect(-157, -22, 314, 62, 5)
  ink.fill()
  ink.strokeStyle = FOREST
  ink.lineWidth = 4
  ink.stroke()
  ink.fillStyle = FOREST
  fittedText(ink, 'CONFIRMED', 0, 24, 294, 43)
  fittedText(ink, flyerEvent.year, 0, 127, 100, 22, '700', DISPLAY)
  diamond(ink, -91, 76, 6)
  diamond(ink, 91, 76, 6)

  // Fixed-seed ink wear keeps the live preview and downloaded PNG identical.
  let seed = 2026
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed / 4294967296
  }
  ink.globalCompositeOperation = 'destination-out'
  ink.fillStyle = 'rgba(0, 0, 0, 0.7)'
  for (let i = 0; i < 260; i++) {
    ink.fillRect(random() * 320 - 160, random() * 320 - 160, 0.8 + random() * 3, 0.7 + random() * 1.5)
  }

  // The lower outer edge overlaps the portrait, below the face and outside the name.
  const x = PORTRAIT.x + PORTRAIT.width + 10
  const y = PORTRAIT.y + PORTRAIT.height - 180
  ctx.drawImage(layer, x - size / 2, y - size / 2, size, size)
}

function drawDateAndTime(ctx: CanvasRenderingContext2D) {
  const x = 32, y = 462, width = 200, height = 274
  ctx.save()
  ctx.shadowColor = '#173c3026'
  ctx.shadowBlur = 14
  ctx.shadowOffsetY = 5
  ctx.fillStyle = IVORY
  ctx.strokeStyle = GOLD
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(x, y, width, height, 18)
  ctx.fill()
  ctx.stroke()
  ctx.shadowColor = 'transparent'
  ctx.fillStyle = forestInk(ctx, y, 212)
  ctx.beginPath()
  ctx.roundRect(x + 5, y + 5, width - 10, 210, [13, 13, 0, 0])
  ctx.fill()
  ctx.fillStyle = '#fff9eb'
  fittedText(ctx, flyerEvent.weekday, x + width / 2, y + 45, width - 24, 26, '800')
  ctx.strokeStyle = GOLD
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(x + 30, y + 65)
  ctx.lineTo(x + width - 30, y + 65)
  ctx.stroke()
  const days = flyerEvent.day.replace(/(\d+)(ST|ND|RD|TH)/g, '$1').replace(/\s*–\s*/, '–')
  fittedText(ctx, days, x + width / 2, y + 143, width - 24, 65, '700', DISPLAY)
  ctx.fillStyle = GOLD
  fittedText(ctx, 'DECEMBER', x + width / 2, y + 189, width - 24, 22, '700', DISPLAY)
  ctx.fillStyle = FOREST
  fittedText(ctx, flyerEvent.year, x + width / 2, y + 257, width - 30, 36, '700', DISPLAY)

  const cx = 950, cy = 550
  ctx.fillStyle = IVORY
  ctx.beginPath()
  ctx.arc(cx, cy, 88, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = GOLD
  ctx.beginPath()
  ctx.arc(cx, cy, 79, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = FOREST
  ctx.beginPath()
  ctx.arc(cx, cy, 75, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#fff9e9'
  fittedText(ctx, flyerEvent.time, cx, cy - 2, 132, 44)
  ctx.fillStyle = GOLD
  fittedText(ctx, flyerEvent.period, cx, cy + 38, 118, 28)
  ctx.restore()
}

/** Both the live preview and the PNG export use this exact composition. */
export function drawFlyer(ctx: CanvasRenderingContext2D, background: HTMLImageElement, logo: HTMLImageElement, portrait: HTMLCanvasElement | null, name: string, framing: PortraitFraming, unitFellowship = '') {
  ctx.save()
  ctx.clearRect(0, 0, FLYER_WIDTH, FLYER_HEIGHT)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.drawImage(background, 0, 0, FLYER_WIDTH, FLYER_HEIGHT)
  ctx.fillStyle = IVORY
  ctx.strokeStyle = GOLD
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(540, 114, 82, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  ctx.drawImage(logo, 466, 40, 148, 148)
  headline(ctx)

  // Attendance statement stays above the portrait and remains visible for every crop.
  ctx.fillStyle = forestInk(ctx, 510, 60)
  ctx.strokeStyle = GOLD
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.roundRect(300, 514, 480, 56, 28)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = GOLD
  diamond(ctx, 326, 542, 5)
  diamond(ctx, 754, 542, 5)
  ctx.fillStyle = '#fff9ec'
  trackedText(ctx, 'I WILL BE THERE', 540, 552, 382, 25, 3, '800')

  // Only one CONFIRMED badge remains, across the lower part of the portrait.
  if (portrait) drawPortrait(ctx, portrait, framing)
  else {
    ctx.fillStyle = LEAF
    fittedText(ctx, 'YOUR PORTRAIT WILL APPEAR HERE', 540, PORTRAIT.y + PORTRAIT.height / 2, 590, 23, '600')
  }

  drawConfirmed(ctx)
  drawName(ctx, name)

  // Side information stays legible even with a wide uploaded portrait.
  drawDateAndTime(ctx)

  // Theme lettering is live canvas text, so both lines stay crisp in the export.
  ctx.save()
  ctx.fillStyle = forestInk(ctx, 1422, 120)
  ctx.shadowColor = '#173c3033'
  ctx.shadowBlur = 22
  ctx.shadowOffsetY = 8
  ctx.beginPath()
  ctx.roundRect(85, 1422, 910, 126, 20)
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.strokeStyle = GOLD
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.roundRect(93, 1430, 894, 110, 14)
  ctx.stroke()
  ctx.fillStyle = goldInk(ctx)
  fittedText(ctx, flyerEvent.theme[0], 540, 1476, 835, 43, 'italic 700', DISPLAY)
  ctx.fillStyle = '#fff9ec'
  trackedText(ctx, flyerEvent.theme[1], 540, 1518, 830, 26, 3)
  ctx.restore()

  const sponsor = flyerSponsor(unitFellowship)
  ctx.fillStyle = 'rgba(249, 248, 243, 0.94)'
  ctx.beginPath()
  ctx.roundRect(65, 1565, 950, sponsor ? 169 : 139, 20)
  ctx.fill()
  ctx.fillStyle = FOREST
  fittedText(ctx, flyerEvent.churchName, 540, 1599, 902, 25)
  ctx.fillStyle = LEAF
  fittedText(ctx, flyerEvent.address, 540, 1630, 898, 17, '600')
  fittedText(ctx, `MINISTERING: ${flyerEvent.minister}`, 540, 1661, 898, 20, '700')
  ctx.strokeStyle = '#b3915699'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(140, 1684)
  ctx.lineTo(519, 1684)
  ctx.moveTo(561, 1684)
  ctx.lineTo(940, 1684)
  ctx.stroke()
  ctx.fillStyle = GOLD
  diamond(ctx, 540, 1684, 6)
  ctx.fillStyle = FOREST
  if (sponsor) fittedText(ctx, sponsor, 540, 1720, 898, 22, '700')
  ctx.restore()
}
