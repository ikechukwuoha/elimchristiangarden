import { drawPortraitCrop, PORTRAIT_FRAME, type PortraitFraming } from './portrait-framing'
import { flyerSponsor } from './flyer-sponsor'
export { defaultFraming, type PortraitFraming } from './portrait-framing'

export const FLYER_WIDTH = 1080
export const FLYER_HEIGHT = 1620
export const FLYER_SCALE = 2
export const FLYER_BACKGROUND = '/images/flyer/confirmed-background-v3.webp'
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

const RED = '#a90000'
const SANS = '"Open Sans", sans-serif'
const SERIF = '"Times New Roman", Georgia, serif'
const DATE_SERIF = 'Merriweather, Georgia, serif'
const PORTRAIT = PORTRAIT_FRAME
const FOREGROUND_Y = 1295

function fittedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, width: number, size: number, weight = '800', family = SANS) {
  ctx.font = `${weight} ${size}px ${family}`
  while (ctx.measureText(text).width > width && size > 12) {
    ctx.font = `${weight} ${--size}px ${family}`
  }
  ctx.fillText(text, x, y)
}

function flame(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(size / 100, size / 100)
  ctx.fillStyle = '#ff3018'
  ctx.beginPath()
  ctx.moveTo(0, -100)
  ctx.bezierCurveTo(30, -76, 39, -42, 36, -21)
  ctx.bezierCurveTo(32, 14, -31, 14, -36, -15)
  ctx.bezierCurveTo(-40, -40, -22, -55, -17, -71)
  ctx.lineTo(-8, -55)
  ctx.bezierCurveTo(1, -67, 2, -85, 0, -100)
  ctx.fill()
  ctx.fillStyle = '#fff237'
  ctx.beginPath()
  ctx.moveTo(0, -53)
  ctx.bezierCurveTo(7, -33, 24, -19, 16, -4)
  ctx.bezierCurveTo(6, 10, -18, 5, -18, -8)
  ctx.bezierCurveTo(-18, -24, -5, -31, 0, -53)
  ctx.fill()
  ctx.restore()
}

function headline(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = RED
  fittedText(ctx, flyerEvent.title, 540, 306, 720, 132, '400', SERIF)
  // Three crisp side bars, in the same arrangement as the reference.
  for (const left of [true, false]) {
    const x = left ? 125 : 870
    ctx.fillRect(x, 245, 57, 6)
    ctx.fillRect(left ? x - 27 : x, 262, 84, 6)
    ctx.fillRect(x, 279, 57, 6)
  }
  // Replace the O with a flame while measuring the complete second line.
  ctx.font = `400 100px ${SERIF}`
  const prefix = 'C'
  const suffix = flyerEvent.subtitle.slice(2)
  const flameWidth = 73
  const width = ctx.measureText(prefix).width + flameWidth + ctx.measureText(suffix).width
  ctx.save()
  ctx.translate(540, 0)
  ctx.scale(Math.min(1, 980 / width), 1)
  ctx.textAlign = 'left'
  ctx.fillText(prefix, -width / 2, 421)
  const prefixWidth = ctx.measureText(prefix).width
  flame(ctx, -width / 2 + prefixWidth + flameWidth / 2, 417, 86)
  ctx.fillStyle = RED
  ctx.fillText(suffix, -width / 2 + prefixWidth + flameWidth, 421)
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

function drawName(ctx: CanvasRenderingContext2D, name: string, sponsor: string) {
  ctx.save()
  ctx.translate(0, sponsor ? 181 : 217)
  const label = (name.trim() || 'YOUR NAME').toLocaleUpperCase()
  let size = 34
  ctx.font = `800 ${size}px ${SANS}`
  while (ctx.measureText(label).width > 515 && size > 14) ctx.font = `800 ${--size}px ${SANS}`
  const nameWidth = ctx.measureText(label).width
  const nameFont = ctx.font
  ctx.font = `700 21px ${SANS}`
  const width = sponsor ? Math.min(760, Math.max(nameWidth + 96, ctx.measureText(sponsor).width + 48)) : Math.min(620, nameWidth + 96)
  ctx.font = nameFont
  const left = 540 - width / 2
  const nameDisplayWidth = Math.min(nameWidth, width - 96)
  const rowLeft = sponsor ? 540 - (nameDisplayWidth + 45) / 2 - 18 : left
  ctx.fillStyle = 'rgba(255, 250, 239, 0.95)'
  ctx.beginPath()
  ctx.roundRect(left, 1009, width, sponsor ? 94 : 58, 8)
  ctx.fill()
  ctx.strokeStyle = '#d9412b'
  ctx.lineWidth = 4
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.roundRect(rowLeft + 18, 1024, 28, 28, 4)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(rowLeft + 23, 1036)
  ctx.lineTo(rowLeft + 32, 1045)
  ctx.lineTo(rowLeft + 49, 1024)
  ctx.stroke()
  ctx.fillStyle = '#15120d'
  ctx.textAlign = 'left'
  ctx.fillText(label, rowLeft + 63, 1050, sponsor ? nameDisplayWidth : width - 81)
  ctx.textAlign = 'center'
  if (sponsor) {
    ctx.strokeStyle = '#b7823540'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(left + 24, 1067)
    ctx.lineTo(left + width - 24, 1067)
    ctx.stroke()
    ctx.fillStyle = '#79451d'
    fittedText(ctx, sponsor, 540, 1090, width - 44, 21, '700')
  }
  ctx.restore()
}

function drawDateAndTime(ctx: CanvasRenderingContext2D) {
  const x = 30, y = 448, width = 210, height = 300
  ctx.save()
  ctx.shadowColor = '#713b2026'
  ctx.shadowBlur = 14
  ctx.shadowOffsetY = 5
  ctx.fillStyle = '#fff2d7'
  ctx.strokeStyle = '#b37a30'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(x, y, width, height, 12)
  ctx.fill()
  ctx.stroke()
  ctx.shadowColor = 'transparent'
  const red = ctx.createLinearGradient(x, y, x, y + 238)
  red.addColorStop(0, '#b5080b')
  red.addColorStop(1, '#790007')
  ctx.fillStyle = red
  ctx.beginPath()
  ctx.roundRect(x + 5, y + 5, width - 10, 228, [8, 8, 0, 0])
  ctx.fill()
  ctx.fillStyle = '#fff9eb'
  fittedText(ctx, flyerEvent.weekday, x + width / 2, y + 49, width - 26, 29, '800')
  ctx.strokeStyle = '#f1d7a4'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(x + 34, y + 72)
  ctx.lineTo(x + width - 34, y + 72)
  ctx.stroke()
  const days = flyerEvent.day.replace(/(\d+)(ST|ND|RD|TH)/g, '$1').replace(/\s*–\s*/, '–')
  fittedText(ctx, days, x + width / 2, y + 153, width - 30, 65, '700', DATE_SERIF)
  fittedText(ctx, 'DECEMBER', x + width / 2, y + 203, width - 28, 24, '700', DATE_SERIF)
  ctx.fillStyle = RED
  fittedText(ctx, flyerEvent.year, x + width / 2, y + 288, width - 30, 42, '700', DATE_SERIF)

  const cx = 950, cy = 540
  ctx.fillStyle = '#fff5dfd9'
  ctx.beginPath()
  ctx.arc(cx, cy, 96, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#a45508'
  ctx.beginPath()
  ctx.arc(cx, cy, 77, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#fff9e9'
  fittedText(ctx, flyerEvent.time, cx, cy - 3, 132, 48)
  fittedText(ctx, flyerEvent.period, cx, cy + 46, 118, 36)
  ctx.restore()
}

/** Both the live preview and the PNG export use this exact composition. */
export function drawFlyer(ctx: CanvasRenderingContext2D, background: HTMLImageElement, logo: HTMLImageElement, portrait: HTMLCanvasElement | null, name: string, framing: PortraitFraming, unitFellowship = '') {
  ctx.save()
  ctx.clearRect(0, 0, FLYER_WIDTH, FLYER_HEIGHT)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.drawImage(background, 0, 0, FLYER_WIDTH, FLYER_HEIGHT)
  ctx.drawImage(logo, 466, 28, 148, 148)
  headline(ctx)

  // Attendance statement stays above the portrait and remains visible for every crop.
  ctx.fillStyle = '#fff8e9'
  ctx.strokeStyle = '#c7964d'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.roundRect(280, 463, 520, 60, 30)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = RED
  fittedText(ctx, 'I WILL BE THERE', 540, 505, 466, 33, '700', DATE_SERIF)

  // Layer order matters: stamp (in artwork), person, then name and theme.
  if (portrait) drawPortrait(ctx, portrait, framing)
  else {
    ctx.fillStyle = '#694b28'
    fittedText(ctx, 'YOUR PORTRAIT WILL APPEAR HERE', 540, 1150, 590, 23, '600')
  }

  // Restore the lower artwork in front of the photo, including its skewed banner.
  const sourceY = background.naturalHeight * FOREGROUND_Y / FLYER_HEIGHT
  ctx.drawImage(background, 0, sourceY, background.naturalWidth, background.naturalHeight - sourceY, 0, FOREGROUND_Y, FLYER_WIDTH, FLYER_HEIGHT - FOREGROUND_Y)
  drawName(ctx, name, flyerSponsor(unitFellowship))

  // Side information stays legible even with a wide uploaded portrait.
  drawDateAndTime(ctx)

  ctx.fillStyle = '#fff2ce'
  fittedText(ctx, flyerEvent.theme[0], 540, 1342, 610, 44, 'italic 800')
  fittedText(ctx, flyerEvent.theme[1], 540, 1387, 610, 39, 'italic 800')
  ctx.fillStyle = '#17120c'
  fittedText(ctx, flyerEvent.churchName, 540, 1456, 930, 28)
  fittedText(ctx, flyerEvent.address, 540, 1493, 930, 19, '600')
  fittedText(ctx, `MINISTERING: ${flyerEvent.minister}`, 540, 1533, 930, 22, '700')
  ctx.fillStyle = '#795126'
  fittedText(ctx, '›'.repeat(80), 540, 1574, 930, 18, '600')
  ctx.restore()
}
