'use client'

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { FlipHorizontal2, RotateCcw, RotateCw, Undo2 } from 'lucide-react'
import { defaultFraming, drawPortraitCrop, PORTRAIT_FRAME, type PortraitFraming } from './portrait-framing'
import styles from './flyer-builder.module.css'

type Props = { portrait: HTMLCanvasElement; framing: PortraitFraming; onChange: (value: PortraitFraming) => void }
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export default function PortraitEditor({ portrait, framing, onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dragRef = useRef<{ pointerId: number; clientX: number; clientY: number; x: number; y: number } | null>(null)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.setTransform(2, 0, 0, 2, 0, 0)
    ctx.clearRect(0, 0, PORTRAIT_FRAME.width, PORTRAIT_FRAME.height)
    drawPortraitCrop(ctx, portrait, PORTRAIT_FRAME.width, PORTRAIT_FRAME.height, framing)
  }, [portrait, framing])

  const startDrag = (event: PointerEvent<HTMLCanvasElement>) => {
    if (event.button !== 0 || dragRef.current) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY, x: framing.x, y: framing.y }
    setDragging(true)
  }

  const moveDrag = (event: PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current
    if (!drag || event.pointerId !== drag.pointerId) return
    const bounds = event.currentTarget.getBoundingClientRect()
    onChange({
      ...framing,
      x: clamp(drag.x + (event.clientX - drag.clientX) / bounds.width * 100, -50, 150),
      y: clamp(drag.y + (event.clientY - drag.clientY) / bounds.height * 100, -100, 100),
    })
  }

  const endDrag = (event: PointerEvent<HTMLCanvasElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return
    dragRef.current = null
    setDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const nudge = (event: KeyboardEvent<HTMLCanvasElement>) => {
    const step = event.shiftKey ? 5 : 1
    const directions: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
    const direction = directions[event.key]
    if (!direction) return
    event.preventDefault()
    onChange({ ...framing, x: clamp(framing.x + direction[0], -50, 150), y: clamp(framing.y + direction[1], -100, 100) })
  }

  return <section className={styles.editor} aria-labelledby="crop-heading">
    <h3 id="crop-heading">Crop &amp; position your photo</h3>
    <p id="crop-instructions">Drag to position your photo. See every change on the flyer beside it.</p>
    <div className={styles.cropFrame} data-dragging={dragging}>
      <canvas ref={canvasRef} width={PORTRAIT_FRAME.width * 2} height={PORTRAIT_FRAME.height * 2} tabIndex={0} role="img" aria-label="Editable photo crop. Drag to reposition or use the arrow keys." aria-describedby="crop-instructions" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag} onKeyDown={nudge}>Your editable photo crop.</canvas>
      <div className={styles.cropGuides} aria-hidden="true" />
    </div>
    <div className={styles.cropTools}>
      <button type="button" onClick={() => onChange({ ...framing, rotation: ((framing.rotation ?? 0) + 270) % 360 })} aria-label="Rotate photo left"><RotateCcw size={17} aria-hidden="true" /> Left</button>
      <button type="button" onClick={() => onChange({ ...framing, rotation: ((framing.rotation ?? 0) + 90) % 360 })} aria-label="Rotate photo right"><RotateCw size={17} aria-hidden="true" /> Right</button>
      <button type="button" onClick={() => onChange({ ...framing, flipped: !framing.flipped })} aria-label="Flip photo horizontally" aria-pressed={framing.flipped ?? false}><FlipHorizontal2 size={17} aria-hidden="true" /> Flip</button>
      <button type="button" onClick={() => onChange(defaultFraming)} aria-label="Reset photo crop"><Undo2 size={17} aria-hidden="true" /> Reset</button>
    </div>
    <label className={styles.cropSlider}>Zoom <span>{Math.round(framing.zoom * 100)}%</span><input type="range" min="0.5" max="3" step="0.05" value={framing.zoom} onChange={(event) => onChange({ ...framing, zoom: Number(event.target.value) })} /></label>
    <div className={styles.cropPositions}>
      <label className={styles.cropSlider}>Horizontal position<input type="range" min="-50" max="150" value={framing.x} onChange={(event) => onChange({ ...framing, x: Number(event.target.value) })} /></label>
      <label className={styles.cropSlider}>Vertical position<input type="range" min="-100" max="100" value={framing.y} onChange={(event) => onChange({ ...framing, y: Number(event.target.value) })} /></label>
    </div>
    <p className={styles.cropNote}>Only the photo inside this frame is used. Crop guides won’t appear on your downloaded flyer.</p>
  </section>
}
