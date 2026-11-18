'use client'

import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { FLYER_WIDTH, FLYER_HEIGHT } from './flyer-artwork'
import { defaultFraming, pinchPortrait, PORTRAIT_FRAME, type PortraitFraming } from './portrait-framing'
import styles from './flyer-builder.module.css'

type Point = { x: number; y: number }
type Props = { portrait: HTMLCanvasElement; framing: PortraitFraming; onChange: (value: PortraitFraming) => void }
type Gesture = { framing: PortraitFraming; center: Point; distance: number; rect: DOMRect }
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const centerOf = (points: Point[]) => ({ x: points.reduce((sum, p) => sum + p.x, 0) / points.length, y: points.reduce((sum, p) => sum + p.y, 0) / points.length })
const distanceOf = (points: Point[]) => points.length === 2 ? Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y) : 0

export default function PhotoOnFlyer({ portrait, framing, onChange }: Props) {
  const pointers = useRef(new Map<number, Point>())
  const gesture = useRef<Gesture | null>(null)
  const latest = useRef<PortraitFraming | null>(null)
  const [dragging, setDragging] = useState(false)

  const rebase = (element: HTMLDivElement) => {
    const points = [...pointers.current.values()]
    gesture.current = points.length ? { framing: latest.current || framing, center: centerOf(points), distance: distanceOf(points), rect: element.getBoundingClientRect() } : null
  }
  const update = (value: PortraitFraming) => { latest.current = value; onChange(value) }

  const start = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || pointers.current.size === 2) return
    event.preventDefault()
    if (!pointers.current.size) latest.current = framing
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    event.currentTarget.setPointerCapture(event.pointerId)
    rebase(event.currentTarget)
    setDragging(true)
  }
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId) || !gesture.current) return
    event.preventDefault()
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    const points = [...pointers.current.values()]
    const base = gesture.current
    const center = centerOf(points)
    const dx = (center.x - base.center.x) / base.rect.width * PORTRAIT_FRAME.width
    const dy = (center.y - base.center.y) / base.rect.height * PORTRAIT_FRAME.height
    if (points.length === 2 && base.distance > 0) {
      update(pinchPortrait(portrait.width, portrait.height, PORTRAIT_FRAME.width, PORTRAIT_FRAME.height, base.framing,
        { x: (base.center.x - base.rect.left) / base.rect.width * PORTRAIT_FRAME.width, y: (base.center.y - base.rect.top) / base.rect.height * PORTRAIT_FRAME.height },
        { x: dx, y: dy }, distanceOf(points) / base.distance))
    } else {
      update({ ...base.framing, x: clamp(base.framing.x + dx / PORTRAIT_FRAME.width * 100, -50, 150), y: clamp(base.framing.y + dy / PORTRAIT_FRAME.height * 100, -100, 100) })
    }
  }
  const end = (event: PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.delete(event.pointerId)) return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    rebase(event.currentTarget)
    setDragging(pointers.current.size > 0)
  }
  const nudge = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 5 : 1
    const directions: Record<string, Point> = { ArrowLeft: { x: -step, y: 0 }, ArrowRight: { x: step, y: 0 }, ArrowUp: { x: 0, y: -step }, ArrowDown: { x: 0, y: step } }
    const delta = directions[event.key]
    if (delta) {
      event.preventDefault()
      update({ ...framing, x: clamp(framing.x + delta.x, -50, 150), y: clamp(framing.y + delta.y, -100, 100) })
    } else if (event.key === 'Home') { event.preventDefault(); update(defaultFraming) }
  }

  return <div className={styles.cardPhotoArea} role="group" tabIndex={0} aria-label="Move your photo on the flyer" aria-describedby="flyer-photo-instructions" data-dragging={dragging}
    style={{ left: `${PORTRAIT_FRAME.x / FLYER_WIDTH * 100}%`, top: `${PORTRAIT_FRAME.y / FLYER_HEIGHT * 100}%`, width: `${PORTRAIT_FRAME.width / FLYER_WIDTH * 100}%`, height: `${PORTRAIT_FRAME.height / FLYER_HEIGHT * 100}%` }}
    onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end} onKeyDown={nudge} />
}
