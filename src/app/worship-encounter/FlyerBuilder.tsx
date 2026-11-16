'use client'

import '@fontsource/merriweather/700.css'
import '@fontsource/merriweather/800.css'
import '@fontsource/merriweather/900.css'
import '@fontsource/merriweather/900-italic.css'
import '@fontsource/open-sans/400.css'
import '@fontsource/open-sans/600.css'
import '@fontsource/open-sans/700.css'
import '@fontsource/open-sans/800.css'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from 'react'
import { Download, RefreshCw } from 'lucide-react'

const CANVAS_W = 1080
const CANVAS_H = 1460
// render at 1.5x for a crisp, larger download without changing the layout
const RENDER_SCALE = 1.5

const RED = '#b3161c'
const BROWN = '#8a5a28'
const STAMP_BROWN = '#a0622d'

type FlyerState = {
  weekday: string
  day: string
  month: string
  year: string
  time: string
  name: string
  theme: string
  scripture: string
  churchName: string
  address: string
  minister: string
}

/* FIXED EVENT DETAILS — the only things users choose are their photo and name.
   Update these constants when the event details change. */
const DEFAULT_STATE: FlyerState = {
  weekday: 'TUE - SUN',
  day: '1ST - 6TH',
  month: 'DEC',
  year: '2026',
  time: '5:30PM',
  name: '',
  theme: 'DIVINE SETTLEMENT FOR A NEW BEGINNING',
  scripture: '',
  churchName: 'ELIM CHRISTIAN GARDEN INTERNATIONAL',
  address: 'ELIM GARDEN, KILOMETER 2, KUDURU EXPRESS WAY, BWARI, ABUJA',
  minister: 'REV. EMMANUEL O. OLOWONONI',
}

/* ---------- low-level canvas helpers ---------- */

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function drawSpacedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  y: number,
  spacing: number,
) {
  const widths = [...text].map((ch) => ctx.measureText(ch).width)
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (text.length - 1)
  let x = centerX - total / 2
  ctx.textAlign = 'left'
  ;[...text].forEach((ch, i) => {
    ctx.fillText(ch, x, y)
    x += widths[i] + spacing
  })
  ctx.textAlign = 'center'
}

/* Draw text, shrinking until it fits maxW */
function drawFittedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  weight: number | string,
  px: number,
  family = '"Open Sans", sans-serif',
) {
  let size = px
  ctx.font = `${weight} ${size}px ${family}`
  while (ctx.measureText(text).width > maxW && size > 12) {
    size -= 1
    ctx.font = `${weight} ${size}px ${family}`
  }
  ctx.fillText(text, x, y)
}

function drawBars(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dir: 1 | -1,
) {
  ctx.save()
  ctx.fillStyle = RED
  const barW = 62
  const barH = 9
  const gap = 14
  for (let i = 0; i < 3; i++) {
    const yy = y + i * (barH + gap)
    // middle bar is shorter, like the reference
    const w = i === 1 ? barW * 0.7 : barW
    const xx = dir === 1 ? x : x - w
    roundRect(ctx, xx, yy, w, barH, barH / 2)
    ctx.fill()
  }
  ctx.restore()
}

/* Draws the flame that replaces the "O" in WORSHIP */
function drawFlame(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  baseY: number,
  scale: number,
) {
  ctx.save()
  ctx.translate(centerX, baseY)
  ctx.scale(scale, scale)

  const outer = ctx.createLinearGradient(0, -95, 0, 8)
  outer.addColorStop(0, '#f97316')
  outer.addColorStop(0.55, '#ea580c')
  outer.addColorStop(1, '#dc2626')
  ctx.fillStyle = outer
  ctx.beginPath()
  ctx.moveTo(0, -100)
  ctx.bezierCurveTo(16, -70, 34, -52, 34, -24)
  ctx.bezierCurveTo(34, -2, 19, 10, 0, 10)
  ctx.bezierCurveTo(-19, 10, -34, -2, -34, -24)
  ctx.bezierCurveTo(-34, -44, -24, -56, -16, -68)
  ctx.bezierCurveTo(-10, -50, -2, -52, 0, -100)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = '#fde047'
  ctx.beginPath()
  ctx.moveTo(0, -58)
  ctx.bezierCurveTo(10, -40, 18, -32, 18, -16)
  ctx.bezierCurveTo(18, -2, 10, 6, 0, 6)
  ctx.bezierCurveTo(-10, 6, -18, -2, -18, -16)
  ctx.bezierCurveTo(-18, -30, -8, -40, 0, -58)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

/* The church logo sits at the top where the trumpets were in the original */
function drawLogo(
  ctx: CanvasRenderingContext2D,
  logo: HTMLImageElement,
  cx: number,
  cy: number,
  size: number,
) {
  ctx.save()
  ctx.shadowColor = 'rgba(80, 40, 0, 0.3)'
  ctx.shadowBlur = 10
  ctx.shadowOffsetY = 3
  ctx.drawImage(logo, cx - size / 2, cy - size / 2, size, size)
  ctx.restore()
}

/* Decorative gold corner flourishes */
function drawSwirls(ctx: CanvasRenderingContext2D) {
  const swirl = (cx: number, cy: number, flip: boolean) => {
    ctx.save()
    ctx.translate(cx, cy)
    if (flip) ctx.scale(-1, 1)
    const g = ctx.createLinearGradient(0, -220, 220, 0)
    g.addColorStop(0, '#e6c26a')
    g.addColorStop(0.5, '#c9973f')
    g.addColorStop(1, '#a8762a')
    ctx.strokeStyle = g
    ctx.lineWidth = 34
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(-160, -120)
    ctx.bezierCurveTo(-40, -200, 120, -180, 200, -40)
    ctx.stroke()
    ctx.lineWidth = 20
    ctx.beginPath()
    ctx.moveTo(-120, -40)
    ctx.bezierCurveTo(-20, -110, 90, -90, 150, 10)
    ctx.stroke()
    ctx.restore()
  }
  swirl(60, 470, false) // left edge
  swirl(CANVAS_W - 60, 470, true) // right edge
  swirl(50, CANVAS_H - 380, true) // bottom left
  swirl(CANVAS_W - 50, CANVAS_H - 380, false) // bottom right
}

/* Compact confirmation seal at the lower-right edge of the portrait. */
function drawStamp(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale = 1) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(scale, scale)
  ctx.translate(-cx, -cy)
  ctx.globalAlpha = 0.9
  ctx.strokeStyle = STAMP_BROWN
  ctx.fillStyle = STAMP_BROWN

  // outer + inner rings
  ctx.lineWidth = 16
  ctx.beginPath()
  ctx.arc(cx, cy, 240, 0, Math.PI * 2)
  ctx.stroke()
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.arc(cx, cy, 200, 0, Math.PI * 2)
  ctx.stroke()

  // text around the ring
  const word = 'CONFIRMED •'
  ctx.font = '800 36px Merriweather, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const radius = 220
  // top arc
  for (let i = 0; i < word.length; i++) {
    const angle = -Math.PI / 2 + (i - (word.length - 1) / 2) * 0.19
    ctx.save()
    ctx.translate(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius)
    ctx.rotate(angle + Math.PI / 2)
    ctx.fillText(word[i], 0, 0)
    ctx.restore()
  }
  // bottom arc (upside-down reading)
  for (let i = 0; i < word.length; i++) {
    const angle = Math.PI / 2 + (i - (word.length - 1) / 2) * 0.19
    ctx.save()
    ctx.translate(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius)
    ctx.rotate(angle - Math.PI / 2)
    ctx.fillText(word[i], 0, 0)
    ctx.restore()
  }

  // rotated center banner — stamped boldly across the photo
  ctx.translate(cx, cy)
  ctx.rotate(-0.12)
  ctx.shadowColor = 'rgba(60, 30, 0, 0.35)'
  ctx.shadowBlur = 16
  ctx.shadowOffsetY = 4
  roundRect(ctx, -350, -60, 700, 120, 14)
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0

  // inner border, like a rubber stamp
  ctx.strokeStyle = 'rgba(243, 230, 207, 0.85)'
  ctx.lineWidth = 5
  roundRect(ctx, -336, -46, 672, 92, 10)
  ctx.stroke()

  ctx.fillStyle = '#f3e6cf'
  ctx.font = '900 78px Merriweather, serif'
  drawSpacedText(ctx, 'CONFIRMED', 0, 4, 10)
  ctx.restore()
}

function drawPlaceholderPhoto(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
) {
  // render offscreen so the feathered mask only affects the patch itself
  const off = document.createElement('canvas')
  off.width = rx * 2
  off.height = ry * 2
  const octx = off.getContext('2d')
  if (!octx) return

  octx.fillStyle = '#eddfc4'
  octx.fillRect(0, 0, rx * 2, ry * 2)

  // silhouette — head and shoulders, centered like a portrait
  octx.fillStyle = '#c2ab84'
  octx.beginPath()
  octx.arc(rx, ry - ry * 0.42, rx * 0.32, 0, Math.PI * 2)
  octx.fill()
  octx.beginPath()
  octx.ellipse(rx, ry + ry * 0.62, rx * 0.52, ry * 0.42, 0, Math.PI, Math.PI * 2)
  octx.fill()

  octx.fillStyle = '#8a6a3a'
  octx.font = '700 24px "Open Sans", sans-serif'
  octx.textAlign = 'center'
  octx.textBaseline = 'middle'
  octx.fillText('YOUR PHOTO HERE', rx, ry + ry * 0.62)

  featherOval(octx, rx, ry, rx, ry)
  ctx.drawImage(off, cx - rx, cy - ry)
}

/* Softly fade the edges of an oval region to transparent, so a flat photo
   blends like the cutout person in the original design. */
function featherOval(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(1, ry / rx)
  const grad = ctx.createRadialGradient(0, 0, rx * 0.6, 0, 0, rx)
  grad.addColorStop(0, 'rgba(0,0,0,1)')
  grad.addColorStop(0.7, 'rgba(0,0,0,1)')
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.globalCompositeOperation = 'destination-in'
  ctx.fillStyle = grad
  ctx.fillRect(-rx, -rx, rx * 2, rx * 2)
  ctx.restore()
}

/* Cover-crop the uploaded photo into a soft-edged oval, like the cutout
   person in the original flyer. */
function drawUserPhoto(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  zoom: number,
  posY: number, // 0..100, vertical framing within the image
) {
  // render into an offscreen canvas first so the feather applies to the photo
  const off = document.createElement('canvas')
  off.width = rx * 2
  off.height = ry * 2
  const octx = off.getContext('2d')
  if (!octx) return

  // scale so the image always covers the oval (zoom >= 1)
  const baseScale = Math.max((rx * 2) / img.width, (ry * 2) / img.height)
  const scale = baseScale * zoom
  const drawW = img.width * scale
  const drawH = img.height * scale

  const extraH = drawH - ry * 2
  const offsetX = rx - drawW / 2
  const offsetY = -Math.max(0, extraH) * (posY / 100)
  octx.drawImage(img, offsetX, offsetY, drawW, drawH)

  featherOval(octx, rx, ry, rx, ry)

  ctx.drawImage(off, cx - rx, cy - ry)
}

function drawNameBadge(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  name: string,
) {
  const label = (name || 'YOUR NAME').toUpperCase()
  ctx.save()
  ctx.font = '800 42px "Open Sans", sans-serif'
  ctx.textBaseline = 'middle'

  const iconSize = 46
  const iconGap = 18
  const padX = 28
  const textW = ctx.measureText(label).width
  const boxW = iconSize + iconGap + textW + padX * 2
  const boxH = 76

  roundRect(ctx, cx - boxW / 2, cy - boxH / 2, boxW, boxH, 12)
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = 'rgba(0,0,0,0.25)'
  ctx.shadowBlur = 14
  ctx.shadowOffsetY = 4
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0

  // red check tile
  const ix = cx - boxW / 2 + padX
  const iy = cy - iconSize / 2
  roundRect(ctx, ix, iy, iconSize, iconSize, 10)
  ctx.fillStyle = RED
  ctx.fill()
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 7
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(ix + 11, iy + iconSize / 2 + 1)
  ctx.lineTo(ix + iconSize / 2 - 2, iy + iconSize - 12)
  ctx.lineTo(ix + iconSize - 10, iy + 11)
  ctx.stroke()

  ctx.fillStyle = '#111111'
  ctx.textAlign = 'left'
  ctx.fillText(label, ix + iconSize + iconGap, cy + 2)
  ctx.textAlign = 'center'
  ctx.restore()
}

function drawFlyer(
  ctx: CanvasRenderingContext2D,
  state: FlyerState,
  photo: HTMLImageElement | null,
  logo: HTMLImageElement | null,
  zoom: number,
  posY: number,
) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  /* background */
  const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_H)
  bg.addColorStop(0, '#f8eeda')
  bg.addColorStop(0.45, '#ecd8b2')
  bg.addColorStop(1, '#f4e7cd')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

  // warm edge glows
  const glow = ctx.createRadialGradient(0, CANVAS_H * 0.35, 80, 0, CANVAS_H * 0.35, 700)
  glow.addColorStop(0, 'rgba(214, 160, 80, 0.55)')
  glow.addColorStop(1, 'rgba(214, 160, 80, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
  const glow2 = ctx.createRadialGradient(CANVAS_W, CANVAS_H * 0.4, 80, CANVAS_W, CANVAS_H * 0.4, 700)
  glow2.addColorStop(0, 'rgba(214, 160, 80, 0.55)')
  glow2.addColorStop(1, 'rgba(214, 160, 80, 0)')
  ctx.fillStyle = glow2
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

  drawSwirls(ctx)
  if (logo) drawLogo(ctx, logo, CANVAS_W / 2, 76, 124)

  /* date box */
  const dx = 60
  const dy = 400
  const dw = 172
  const dh = 172
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(dx, dy, dw, dh)
  ctx.strokeStyle = RED
  ctx.lineWidth = 6
  ctx.strokeRect(dx, dy, dw, dh)
  ctx.fillStyle = '#f0d9d9'
  ctx.fillRect(dx + 6, dy + dh - 34, dw - 12, 28)

  ctx.fillStyle = RED
  drawFittedText(ctx, state.weekday.toUpperCase(), dx + dw / 2, dy + 46, dw - 16, 800, 34)
  ctx.fillStyle = '#1a1a1a'
  drawFittedText(ctx, state.day.toUpperCase(), dx + dw / 2, dy + 90, dw - 16, 700, 30)
  drawFittedText(ctx, state.month.toUpperCase(), dx + dw / 2, dy + 128, dw - 16, 700, 30)
  drawFittedText(ctx, state.year.toUpperCase(), dx + dw / 2, dy + 166, dw - 16, 700, 30)

  /* time circle */
  const tcx = 950
  const tcy = 548
  ctx.fillStyle = 'rgba(255, 244, 224, 0.85)'
  ctx.beginPath()
  ctx.arc(tcx, tcy, 72, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#7a4a21'
  ctx.beginPath()
  ctx.arc(tcx, tcy, 58, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  drawFittedText(ctx, state.time.toUpperCase(), tcx, tcy + 11, 96, 800, 32)

  /* user photo — large soft-edged oval, framed like a cutout portrait */
  const pcx = CANVAS_W / 2
  const pcy = 730
  const prx = 330
  const pry = 330
  if (photo) {
    drawUserPhoto(ctx, photo, pcx, pcy, prx, pry, zoom, posY)
  } else {
    drawPlaceholderPhoto(ctx, pcx, pcy, prx, pry)
  }

  /* Compact CONFIRMED seal, away from the face */
  drawStamp(ctx, 825, 950, 0.34)

  /* name badge — below the photo */
  drawNameBadge(ctx, CANVAS_W / 2, 1085, state.name)

  /* title — DESTINY / C(flame)NFERENCE 2026, flame as the O */
  ctx.fillStyle = RED
  ctx.font = '900 104px Merriweather, serif'
  ctx.fillText('DESTINY', CANVAS_W / 2, 216)
  const destinyW = ctx.measureText('DESTINY').width
  drawBars(ctx, CANVAS_W / 2 - destinyW / 2 - 105, 216 - 62, 1)
  drawBars(ctx, CANVAS_W / 2 + destinyW / 2 + 105, 216 - 62, -1)

  ctx.font = '900 80px Merriweather, serif'
  const cW = ctx.measureText('C').width
  const cRest = ctx.measureText('NFERENCE 2026').width
  const flameW = 60
  const confW = cW + flameW + cRest
  const confStartX = CANVAS_W / 2 - confW / 2
  const confY = 330
  ctx.textAlign = 'left'
  ctx.fillText('C', confStartX, confY)
  drawFlame(ctx, confStartX + cW + flameW / 2, confY - 4, 0.82)
  ctx.fillText('NFERENCE 2026', confStartX + cW + flameW, confY)
  ctx.textAlign = 'center'
  // subtle shadow pass for depth, like the reference
  ctx.fillStyle = 'rgba(120, 20, 20, 0.2)'
  ctx.textAlign = 'left'
  ctx.fillText('NFERENCE 2026', confStartX + cW + flameW + 3, confY + 4)
  ctx.textAlign = 'center'

  /* theme banner — measure the theme first so the banner fits it */
  const bx = 205
  const by = 1140
  const bw = 670
  const themeText = state.theme.toUpperCase()
  const maxThemeW = bw - 70

  // try one line, shrinking; fall back to two balanced lines
  let size = 50
  ctx.font = `italic 900 ${size}px Merriweather, serif`
  while (ctx.measureText(themeText).width > maxThemeW && size > 34) {
    size -= 1
    ctx.font = `italic 900 ${size}px Merriweather, serif`
  }
  let line1 = themeText
  let line2 = ''
  if (ctx.measureText(themeText).width > maxThemeW) {
    // split into two lines close to equal width
    const words = themeText.split(' ')
    let best = 1
    let bestDiff = Infinity
    for (let i = 1; i < words.length; i++) {
      const l1 = words.slice(0, i).join(' ')
      const l2 = words.slice(i).join(' ')
      const diff = Math.abs(ctx.measureText(l1).width - ctx.measureText(l2).width)
      if (diff < bestDiff) {
        bestDiff = diff
        best = i
      }
    }
    line1 = words.slice(0, best).join(' ')
    line2 = words.slice(best).join(' ')
    ctx.font = 'italic 900 40px Merriweather, serif'
    while (
      (ctx.measureText(line1).width > maxThemeW ||
        ctx.measureText(line2).width > maxThemeW) &&
      size > 28
    ) {
      size -= 1
      ctx.font = `italic 900 ${size}px Merriweather, serif`
    }
  }

  const bh = line2 ? 118 : 82
  const skew = 26
  const grad = ctx.createLinearGradient(bx, by, bx + bw, by)
  grad.addColorStop(0, '#7a4a21')
  grad.addColorStop(0.5, '#a5732f')
  grad.addColorStop(1, '#7a4a21')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.moveTo(bx + skew, by)
  ctx.lineTo(bx + bw, by)
  ctx.lineTo(bx + bw - skew, by + bh)
  ctx.lineTo(bx, by + bh)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  if (line2) {
    ctx.fillText(line1, bx + bw / 2, by + 52)
    ctx.fillText(line2, bx + bw / 2, by + 100)
  } else {
    ctx.fillText(themeText, bx + bw / 2, by + 58)
  }

  // chevrons on both sides
  ctx.fillStyle = BROWN
  ctx.font = '900 60px "Open Sans", sans-serif'
  ctx.fillText('»', bx - 60, by + 58)
  ctx.fillText('«', bx + bw + 60, by + 58)

  /* footer — scripture (optional), church name, address, ministering */
  const scripture = state.scripture.trim()
  const shift = scripture ? 26 : 0

  if (scripture) {
    ctx.fillStyle = '#5b3a16'
    ctx.font = '700 23px "Open Sans", sans-serif'
    drawSpacedText(ctx, scripture.toUpperCase(), CANVAS_W / 2, 1272, 4)
  }

  ctx.fillStyle = '#141414'
  drawFittedText(ctx, state.churchName.toUpperCase(), CANVAS_W / 2, 1302 + shift, 1000, 800, 27)
  ctx.fillStyle = '#3a3a3a'
  drawFittedText(ctx, state.address.toUpperCase(), CANVAS_W / 2, 1338 + shift, 1000, 600, 21)

  ctx.fillStyle = '#141414'
  drawFittedText(
    ctx,
    `MINISTERING: ${state.minister.toUpperCase()}`,
    CANVAS_W / 2,
    1382 + shift,
    1000,
    800,
    24,
  )

  ctx.fillStyle = BROWN
  drawSpacedText(ctx, '»»»»»»»»»»»»»»»»»»»»»»»»»»»', CANVAS_W / 2, 1424 + shift, 3)
}

/* ---------- component ---------- */

const FIELDS: { key: keyof FlyerState; label: string; placeholder?: string; wide?: boolean }[] = [
  { key: 'name', label: 'Your name', placeholder: 'e.g. IFE', wide: true },
]

export default function FlyerBuilder() {
  const [state, setState] = useState<FlyerState>(DEFAULT_STATE)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  // portraits have the face in the upper third — default the crop there
  const [posY, setPosY] = useState(25)
  const [fontsReady, setFontsReady] = useState(false)
  const [logoReady, setLogoReady] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const photoRef = useRef<HTMLImageElement | null>(null)
  const logoRef = useRef<HTMLImageElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // preload the church logo for the canvas
    const logo = new Image()
    logo.onload = () => {
      logoRef.current = logo
      setLogoReady(true)
    }
    logo.src = '/images/logo-removebg-preview.png'
    const fonts = [
      '900 100px Merriweather',
      'italic 900 50px Merriweather',
      '800 34px Merriweather',
      '800 42px "Open Sans"',
      '700 30px "Open Sans"',
      '600 21px "Open Sans"',
    ]
    Promise.all(fonts.map((f) => document.fonts.load(f)))
      .then(() => setFontsReady(true))
      .catch(() => setFontsReady(true))
  }, [])

  const render = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    canvas.width = CANVAS_W * RENDER_SCALE
    canvas.height = CANVAS_H * RENDER_SCALE
    ctx.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0)
    drawFlyer(ctx, state, photoRef.current, logoRef.current, zoom, posY)
  }, [state, zoom, posY])

  useEffect(() => {
    render()
  }, [render, fontsReady, logoReady])

  const handleField = (key: keyof FlyerState, value: string) =>
    setState((s) => ({ ...s, [key]: value }))

  const handlePhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        photoRef.current = img
        setPhotoUrl(reader.result as string)
        render()
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  }

  const clearPhoto = () => {
    photoRef.current = null
    setPhotoUrl(null)
    setZoom(1)
    setPosY(25)
    if (fileInputRef.current) fileInputRef.current.value = ''
    render()
  }

  const download = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const slug = (state.name || 'flyer').toLowerCase().replace(/[^a-z0-9]+/g, '-')
      a.href = url
      a.download = `worship-encounter-${slug}.png`
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }, 'image/png')
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-extrabold text-red-800 sm:text-4xl">
          Worship Encounter — I&apos;m Confirmed!
        </h1>
        <p className="mt-3 text-gray-600">
          Upload your photo, enter your name, and download your personalized
          attendance flyer to share.
        </p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_minmax(320px,430px)] lg:items-start">
        {/* form */}
        <section className="order-2 space-y-8 lg:order-1">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
            <h2 className="text-lg font-bold text-amber-900">1. Your photo</h2>
            <p className="mt-1 text-sm text-gray-600">
              A clear portrait works best — it is trimmed to fit the circular
              frame automatically.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              className="mt-4 block w-full text-sm text-gray-700
                file:mr-3 file:rounded-full file:border-0
                file:bg-red-800 file:px-5 file:py-2.5
                file:text-sm file:font-semibold file:text-white
                hover:file:bg-red-900"
            />

            {photoUrl && (
              <>
                <div className="mt-4 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoUrl}
                    alt="Selected preview"
                    className="h-14 w-14 rounded-full border-2 border-amber-300 object-cover"
                  />
                  <button
                    type="button"
                    onClick={clearPhoto}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-800 hover:underline"
                  >
                    <RefreshCw className="h-4 w-4" /> Remove photo
                  </button>
                </div>

                <label className="mt-5 block text-sm font-semibold text-gray-700">
                  Framing: zoom
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.05}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="mt-1 w-full accent-red-800"
                  />
                </label>
                <label className="mt-3 block text-sm font-semibold text-gray-700">
                  Framing: vertical position
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={posY}
                    onChange={(e) => setPosY(Number(e.target.value))}
                    className="mt-1 w-full accent-red-800"
                  />
                </label>
              </>
            )}
          </div>

          <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-amber-900">
              2. Your name
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Just your name — the event details are already set for you.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {FIELDS.map(({ key, label, placeholder, wide }) => (
                <label
                  key={key}
                  className={`block text-sm font-semibold text-gray-700 ${
                    wide ? 'col-span-2 sm:col-span-3' : ''
                  }`}
                >
                  {label}
                  <input
                    type="text"
                    value={state[key]}
                    placeholder={placeholder}
                    maxLength={key === 'name' ? 24 : 60}
                    onChange={(e) => handleField(key, e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-base font-normal
                      focus:border-red-800 focus:outline-none focus:ring-1 focus:ring-red-800"
                  />
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* preview */}
        <section className="order-1 lg:order-2 lg:sticky lg:top-28">
          <div className="overflow-hidden rounded-2xl border-4 border-amber-200 shadow-lg">
            <canvas
              ref={canvasRef}
              width={CANVAS_W * RENDER_SCALE}
              height={CANVAS_H * RENDER_SCALE}
              className="block h-auto w-full"
              aria-label="Flyer preview"
            />
          </div>
          <button
            type="button"
            onClick={download}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full
              bg-red-800 px-6 py-4 text-lg font-bold text-white shadow-md
              transition hover:bg-red-900 active:scale-[0.99]"
          >
            <Download className="h-5 w-5" />
            Download my flyer
          </button>
          <p className="mt-3 text-center text-sm text-gray-500">
            Saves as a share-ready image — perfect for WhatsApp status and
            Instagram.
          </p>
        </section>
      </div>
    </div>
  )
}
