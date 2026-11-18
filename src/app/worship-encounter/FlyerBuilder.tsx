'use client'

import '@fontsource/open-sans/600.css'
import '@fontsource/open-sans/700.css'
import '@fontsource/open-sans/800.css'
import '@fontsource/merriweather/latin-700.css'
import '@fontsource/merriweather/latin-700-italic.css'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ChangeEvent } from 'react'
import { Check, Download, ImagePlus, LoaderCircle, RefreshCw } from 'lucide-react'
import { defaultFraming, drawFlyer, flyerEvent, FLYER_BACKGROUND, FLYER_LOGO, FLYER_HEIGHT, FLYER_SCALE, FLYER_WIDTH, type PortraitFraming } from './flyer-artwork'
import { preparePortrait, validatePortrait } from './prepare-portrait'
import styles from './flyer-builder.module.css'
import PortraitEditor from './PortraitEditor'
import PortraitControls from './PortraitControls'
import PhotoOnFlyer from './PhotoOnFlyer'
import { flyerSponsor } from './flyer-sponsor'

function loadArtwork(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('The flyer design could not load. Please try again.'))
    image.src = src
  })
}

const directEditQuery = '(max-width: 600px), (pointer: coarse)'
function subscribeDirectEditing(onChange: () => void) {
  const query = window.matchMedia(directEditQuery)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}
function directEditingSnapshot() { return window.matchMedia(directEditQuery).matches }
function serverEditingSnapshot() { return false }
function pngBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(value => value ? resolve(value) : reject(new Error('The image could not be saved. Please try again.')), 'image/png')
  })
}

export default function FlyerBuilder() {
  const directEditing = useSyncExternalStore(subscribeDirectEditing, directEditingSnapshot, serverEditingSnapshot)
  const [name, setName] = useState('')
  const [unitFellowship, setUnitFellowship] = useState('')
  const [portrait, setPortrait] = useState<HTMLCanvasElement | null>(null)
  const [background, setBackground] = useState<HTMLImageElement | null>(null)
  const [logo, setLogo] = useState<HTMLImageElement | null>(null)
  const [framing, setFraming] = useState<PortraitFraming>(defaultFraming)
  const [removeBackground, setRemoveBackground] = useState(true)
  const [filename, setFilename] = useState('')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState('')
  const [photoError, setPhotoError] = useState('')
  const [assetError, setAssetError] = useState('')
  const [exportError, setExportError] = useState('')
  const [renderError, setRenderError] = useState('')
  const [exporting, setExporting] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const [assetAttempt, setAssetAttempt] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<File | null>(null)
  const requestRef = useRef(0)

  useEffect(() => {
    let cancelled = false
    const fonts = ['600 24px "Open Sans"', '700 24px "Open Sans"', '800 34px "Open Sans"', '700 136px Merriweather', 'italic 700 43px Merriweather']
    Promise.all([loadArtwork(FLYER_BACKGROUND), loadArtwork(FLYER_LOGO), ...fonts.map((font) => document.fonts.load(font))])
      .then(([image, churchLogo]) => { if (!cancelled) { setBackground(image); setLogo(churchLogo) } })
      .catch(() => { if (!cancelled) setAssetError('The flyer design could not load. Please check your connection and try again.') })
    return () => { cancelled = true }
  }, [assetAttempt])

  useEffect(() => () => { requestRef.current++ }, [])
  useEffect(() => () => { if (portrait) portrait.width = portrait.height = 0 }, [portrait])
  useEffect(() => {
    const canvas = canvasRef.current
    return () => { if (canvas) canvas.width = canvas.height = 0 }
  }, [])

  const render = useCallback(() => {
    if (!background || !logo) return
    const canvas = canvasRef.current
    if (!canvas) return
    if (canvas.width !== FLYER_WIDTH) canvas.width = FLYER_WIDTH
    if (canvas.height !== FLYER_HEIGHT) canvas.height = FLYER_HEIGHT
    const ctx = canvas?.getContext('2d')
    if (!ctx || ctx.isContextLost?.()) throw new Error('Your browser paused the card preview. Tap Refresh preview to restore it.')
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    drawFlyer(ctx, background, logo, portrait, name, framing, unitFellowship)
    if (ctx.isContextLost?.()) throw new Error('Your browser paused the card preview. Tap Refresh preview to restore it.')
  }, [background, logo, portrait, name, framing, unitFellowship])

  const refreshPreview = useCallback(() => {
    try { render(); setRenderError('') }
    catch (error) { setRenderError(error instanceof Error ? error.message : 'The card preview could not update. Tap Refresh preview to try again.') }
  }, [render])

  useEffect(() => {
    const frame = requestAnimationFrame(() => { refreshPreview(); setDownloaded(false) })
    return () => cancelAnimationFrame(frame)
  }, [refreshPreview])

  useEffect(() => {
    const canvas = canvasRef.current
    const visible = () => { if (document.visibilityState === 'visible') refreshPreview() }
    const lost = () => setRenderError('Your browser paused the card preview. Tap Refresh preview to restore it.')
    canvas?.addEventListener('contextlost', lost)
    canvas?.addEventListener('contextrestored', refreshPreview)
    document.addEventListener('visibilitychange', visible)
    window.addEventListener('pageshow', visible)
    return () => {
      canvas?.removeEventListener('contextlost', lost)
      canvas?.removeEventListener('contextrestored', refreshPreview)
      document.removeEventListener('visibilitychange', visible)
      window.removeEventListener('pageshow', visible)
    }
  }, [refreshPreview])

  const processPhoto = async (file: File, remove: boolean) => {
    const request = ++requestRef.current
    setProcessing(true)
    setPhotoError('')
    setExportError('')
    setPortrait(null)
    setDownloaded(false)
    setFraming(defaultFraming)
    try {
      const prepared = await preparePortrait(file, remove, (message) => {
        if (request === requestRef.current) setProgress(message)
      })
      if (request === requestRef.current) {
        setPortrait(prepared)
        setProgress('Your portrait is ready.')
      } else prepared.width = prepared.height = 0
    } catch (error) {
      if (request === requestRef.current) {
        setProgress('')
        setPhotoError(error instanceof Error ? error.message : 'This photo could not be opened. Please try another JPG, PNG, or WebP.')
      }
    } finally {
      if (request === requestRef.current) setProcessing(false)
    }
  }

  const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try { validatePortrait(file) }
    catch (error) {
      setPhotoError(error instanceof Error ? error.message : 'Choose a JPG, PNG, or WebP photo.')
      event.target.value = ''
      return
    }
    fileRef.current = file
    setFilename(file.name)
    void processPhoto(file, removeBackground)
  }

  const clearPhoto = () => {
    requestRef.current++ // An older upload must never replace a newer photo or a clear action.
    fileRef.current = null
    setPortrait(null)
    setFilename('')
    setProcessing(false)
    setProgress('')
    setPhotoError('')
    setExportError('')
    setFraming(defaultFraming)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const changeRemoval = (checked: boolean) => {
    setRemoveBackground(checked)
    if (fileRef.current) void processPhoto(fileRef.current, checked)
  }

  const ready = Boolean(background && logo && portrait && name.trim() && !processing && !assetError && !photoError && !renderError)

  const download = async () => {
    if (!ready || exporting || !canvasRef.current || !background || !logo || !portrait) return
    setExporting(true)
    setExportError('')
    try {
      render() // Flush the current name and framing before exporting the visible canvas.
      // Keep the live card small; allocate the full-resolution canvas only to save it.
      const output = document.createElement('canvas')
      let blob: Blob
      try {
        output.width = FLYER_WIDTH * FLYER_SCALE
        output.height = FLYER_HEIGHT * FLYER_SCALE
        const ctx = output.getContext('2d')
        if (!ctx) throw new Error('The full-resolution canvas is unavailable.')
        ctx.setTransform(FLYER_SCALE, 0, 0, FLYER_SCALE, 0, 0)
        drawFlyer(ctx, background, logo, portrait, name, framing, unitFellowship)
        if (ctx.isContextLost?.()) throw new Error('The full-resolution canvas was lost.')
        blob = await pngBlob(output)
      } catch {
        output.width = output.height = 0
        blob = await pngBlob(canvasRef.current)
      } finally { output.width = output.height = 0 }
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      const slug = name.trim().toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'guest'
      anchor.href = url
      anchor.download = `destiny-conference-2026-${slug}.png`
      document.body.append(anchor)
      anchor.click()
      anchor.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      setDownloaded(true)
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'The image could not be saved. Please try again.')
    } finally { setExporting(false) }
  }

  return <div className={styles.page}>
    <header className={styles.heading}>
      <p className={styles.eyebrow}>{flyerEvent.title} {flyerEvent.subtitle}</p>
      <h1>I’m <em>confirmed.</em></h1>
      <p>Add your photo and name. Make the flyer yours, then download and share it.</p>
    </header>

      <div className={styles.setup}>
        <section className={styles.panel} aria-labelledby="portrait-heading">
          <span className={styles.step}>01</span>
          <h2 id="portrait-heading">Your photo</h2>
          <p>A clear, waist-up portrait works best. We’ll remove the background so you blend into the design.</p>
          <label className={styles.upload} htmlFor="flyer-photo">
            <ImagePlus size={25} strokeWidth={1.5} aria-hidden="true" />
            <strong>{filename ? 'Choose another photo' : 'Choose your photo'}</strong>
            <span>JPG, PNG, or WebP · up to 10 MB</span>
          </label>
          <input ref={fileInputRef} id="flyer-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhoto} className={styles.fileInput} aria-describedby="photo-status photo-error" />
          {filename && <div className={styles.selectedFile}><span>{filename}</span><button type="button" aria-label="Remove uploaded photo" onClick={clearPhoto}><RefreshCw size={13} aria-hidden="true" /> Remove</button></div>}
          <label className={styles.checkbox}><input type="checkbox" checked={removeBackground} onChange={(event) => changeRemoval(event.target.checked)} /> Remove the photo background automatically</label>
          <p className={styles.privacy}>Your photo stays on your device.</p>
          <p id="photo-status" className={styles.status} role="status" aria-live="polite">{processing && <LoaderCircle size={16} className={styles.spinner} aria-hidden="true" />}{progress}</p>
          <p id="photo-error" className={styles.error} role="alert">{photoError}</p>
          {photoError && filename && <button type="button" className={styles.textButton} onClick={() => { if (fileRef.current) void processPhoto(fileRef.current, removeBackground) }}>Try this photo again</button>}
        </section>

        <section className={styles.panel} aria-labelledby="name-heading">
          <span className={styles.step}>02</span>
          <h2 id="name-heading">Your name</h2>
          <label className={styles.nameLabel} htmlFor="flyer-name">Name on your flyer</label>
          <input id="flyer-name" type="text" autoComplete="name" maxLength={60} value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Bro. John Doe" className={styles.nameInput} />
          <label className={styles.nameLabel} htmlFor="flyer-affiliation">Unit/Fellowship <span className={styles.optional}>(optional)</span></label>
          <input id="flyer-affiliation" type="text" maxLength={60} value={unitFellowship} onChange={(event) => setUnitFellowship(event.target.value)} placeholder="e.g. Tehilla, Brothers, or Media" className={styles.nameInput} aria-describedby="flyer-affiliation-note" />
          <p id="flyer-affiliation-note" className={styles.affiliationNote} role="status">{flyerSponsor(unitFellowship) || 'Leave blank to create your flyer without a sponsorship line.'}</p>
          <p>The conference details are already set for you.</p>
        </section>
      </div>

    <div className={styles.workspace} data-direct-edit={directEditing}>
      {!directEditing && <div className={`${styles.panel} ${styles.editorPanel}`} aria-label="Photo editor">
        {portrait ? <PortraitEditor portrait={portrait} framing={framing} onChange={setFraming} /> : <div className={styles.editorEmpty}>
          {processing ? <LoaderCircle size={30} className={styles.spinner} aria-hidden="true" /> : <ImagePlus size={30} strokeWidth={1.4} aria-hidden="true" />}
          <h2>{processing ? 'Preparing your photo' : 'Your photo editor'}</h2>
          <p>{processing ? 'Your crop controls will appear here when your photo is ready.' : 'Choose a photo above. Then crop and position it here while watching your flyer beside it.'}</p>
        </div>}
      </div>}
      <section className={styles.preview} aria-label="Your personalized flyer" aria-busy={processing || ((!background || !logo) && !assetError)}>
        <div className={styles.canvasFrame}>
          <canvas ref={canvasRef} width={FLYER_WIDTH} height={FLYER_HEIGHT} aria-label={name.trim() ? `Attendance flyer for ${name.trim()}` : 'Attendance flyer preview'}>Your personalized attendance flyer.</canvas>
          {directEditing && portrait && !processing && <PhotoOnFlyer portrait={portrait} framing={framing} onChange={setFraming} />}
          {(!background || !logo) && !assetError && <div className={styles.loading} role="status"><LoaderCircle className={styles.spinner} size={22} aria-hidden="true" /> Loading your flyer…</div>}
        </div>
        {directEditing && portrait && !processing && <div className={styles.mobileControls} aria-label="Photo adjustments">
          <p id="flyer-photo-instructions" className={styles.photoHint}>Drag your photo on the card. Pinch or use Zoom to resize. Arrow keys move it too.</p>
          <PortraitControls framing={framing} onChange={setFraming} showPositions={false} />
        </div>}
        {renderError && <div className={styles.assetError}><p role="alert">{renderError}</p><button type="button" className={styles.textButton} onClick={() => {
          const canvas = canvasRef.current
          if (canvas) { canvas.width = canvas.height = 0 }
          refreshPreview()
        }}>Refresh preview</button></div>}
        {assetError && <div className={styles.assetError}><p role="alert">{assetError}</p><button type="button" className={styles.textButton} onClick={() => { setAssetError(''); setAssetAttempt((attempt) => attempt + 1) }}>Reload design</button></div>}
        <button type="button" aria-label="Download attendance flyer" onClick={() => void download()} disabled={!ready || exporting} className={styles.download}>
          {exporting ? <LoaderCircle size={20} className={styles.spinner} aria-hidden="true" /> : downloaded ? <Check size={20} aria-hidden="true" /> : <Download size={20} aria-hidden="true" />}
          {exporting ? 'Saving your flyer…' : downloaded ? 'Download again' : 'Download my flyer'}
        </button>
        <p className={styles.downloadNote} role="status">{downloaded ? 'Your flyer is ready to share.' : ready ? 'High-resolution PNG · ready for WhatsApp and Instagram.' : 'Add your photo and name to download your flyer.'}</p>
        {exportError && <p className={styles.error} role="alert">{exportError}</p>}
      </section>
    </div>
  </div>
}
