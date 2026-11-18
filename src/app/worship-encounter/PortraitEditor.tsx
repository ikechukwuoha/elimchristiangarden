'use client'

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { drawPortraitCrop, PORTRAIT_FRAME, type PortraitFraming } from './portrait-framing'
import PortraitControls from './PortraitControls'
import styles from './flyer-builder.module.css'

type Props = { portrait: HTMLCanvasElement; framing: PortraitFraming; onChange: (value: PortraitFraming) => void }
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export default function PortraitEditor({ portrait, framing, onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dragRef = useRef<{ pointerId: number; clientX: number; clientY: number; x: number; y: number } | null>(null)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (canvas.width !== PORTRAIT_FRAME.width) canvas.width = PORTRAIT_FRAME.width
    if (canvas.height !== PORTRAIT_FRAME.height) canvas.height = PORTRAIT_FRAME.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, PORTRAIT_FRAME.width, PORTRAIT_FRAME.height)
    drawPortraitCrop(ctx, portrait, PORTRAIT_FRAME.width, PORTRAIT_FRAME.height, framing)
  }, [portrait, framing])

  useEffect(() => {
    const canvas = canvasRef.current
    return () => { if (canvas) canvas.width = canvas.height = 0 }
  }, [])

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
      <canvas ref={canvasRef} width={PORTRAIT_FRAME.width} height={PORTRAIT_FRAME.height} tabIndex={0} role="img" aria-label="Editable photo crop. Drag to reposition or use the arrow keys." aria-describedby="crop-instructions" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag} onKeyDown={nudge}>Your editable photo crop.</canvas>
      <div className={styles.cropGuides} aria-hidden="true" />
    </div>
    <PortraitControls framing={framing} onChange={onChange} />
    <p className={styles.cropNote}>Only the photo inside this frame is used. Crop guides won’t appear on your downloaded flyer.</p>
  </section>
}
