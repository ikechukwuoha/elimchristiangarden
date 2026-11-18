'use client'

import { FlipHorizontal2, RotateCcw, RotateCw, Undo2 } from 'lucide-react'
import { defaultFraming, type PortraitFraming } from './portrait-framing'
import styles from './flyer-builder.module.css'

type Props = { framing: PortraitFraming; onChange: (value: PortraitFraming) => void; showPositions?: boolean }

export default function PortraitControls({ framing, onChange, showPositions = true }: Props) {
  return <>
    <div className={styles.cropTools}>
      <button type="button" onClick={() => onChange({ ...framing, rotation: ((framing.rotation ?? 0) + 270) % 360 })} aria-label="Rotate photo left"><RotateCcw size={17} aria-hidden="true" /> Left</button>
      <button type="button" onClick={() => onChange({ ...framing, rotation: ((framing.rotation ?? 0) + 90) % 360 })} aria-label="Rotate photo right"><RotateCw size={17} aria-hidden="true" /> Right</button>
      <button type="button" onClick={() => onChange({ ...framing, flipped: !framing.flipped })} aria-label="Flip photo horizontally" aria-pressed={framing.flipped ?? false}><FlipHorizontal2 size={17} aria-hidden="true" /> Flip</button>
      <button type="button" onClick={() => onChange(defaultFraming)} aria-label="Reset photo crop"><Undo2 size={17} aria-hidden="true" /> Reset</button>
    </div>
    <label className={styles.cropSlider}>Zoom <span>{Math.round(framing.zoom * 100)}%</span><input aria-label="Photo zoom" type="range" min="0.5" max="3" step="0.05" value={framing.zoom} onChange={(event) => onChange({ ...framing, zoom: Number(event.target.value) })} /></label>
    {showPositions && <div className={styles.cropPositions}>
      <label className={styles.cropSlider}>Horizontal position<input aria-label="Photo horizontal position" type="range" min="-50" max="150" value={framing.x} onChange={(event) => onChange({ ...framing, x: Number(event.target.value) })} /></label>
      <label className={styles.cropSlider}>Vertical position<input aria-label="Photo vertical position" type="range" min="-100" max="100" value={framing.y} onChange={(event) => onChange({ ...framing, y: Number(event.target.value) })} /></label>
    </div>}
  </>
}
