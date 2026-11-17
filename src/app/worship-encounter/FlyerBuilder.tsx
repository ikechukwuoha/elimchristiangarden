'use client'

import '@fontsource/open-sans/600.css'
import '@fontsource/open-sans/700.css'
import '@fontsource/open-sans/800.css'
import '@fontsource/open-sans/800-italic.css'
import '@fontsource/merriweather/latin-700.css'

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Check, Download, ImagePlus, LoaderCircle, RefreshCw } from 'lucide-react'
import { defaultFraming, drawFlyer, flyerEvent, FLYER_BACKGROUND, FLYER_LOGO, FLYER_HEIGHT, FLYER_SCALE, FLYER_WIDTH, type PortraitFraming } from './flyer-artwork'
import { preparePortrait, validatePortrait } from './prepare-portrait'
import styles from './flyer-builder.module.css'
import PortraitEditor from './PortraitEditor'
import { flyerSponsor } from './flyer-sponsor'

function loadArtwork(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('The flyer design could not load. Please try again.'))
    image.src = src
  })
}

export default function FlyerBuilder() {
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
  const [exporting, setExporting] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const [assetAttempt, setAssetAttempt] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<File | null>(null)
  const requestRef = useRef(0)

  useEffect(() => {
    let cancelled = false
    const fonts = ['600 24px "Open Sans"', '700 24px "Open Sans"', '800 34px "Open Sans"', 'italic 800 44px "Open Sans"', '700 43px Merriweather']
    Promise.all([loadArtwork(FLYER_BACKGROUND), loadArtwork(FLYER_LOGO), ...fonts.map((font) => document.fonts.load(font))])
      .then(([image, churchLogo]) => { if (!cancelled) { setBackground(image); setLogo(churchLogo) } })
      .catch(() => { if (!cancelled) setAssetError('The flyer design could not load. Please check your connection and try again.') })
    return () => { cancelled = true }
  }, [assetAttempt])

  useEffect(() => () => { requestRef.current++ }, [])

  const render = useCallback(() => {
    if (!background || !logo) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.setTransform(FLYER_SCALE, 0, 0, FLYER_SCALE, 0, 0)
    drawFlyer(ctx, background, logo, portrait, name, framing, unitFellowship)
  }, [background, logo, portrait, name, framing, unitFellowship])

  useEffect(() => {
    const frame = requestAnimationFrame(() => { render(); setDownloaded(false) })
    return () => cancelAnimationFrame(frame)
  }, [render])

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
      }
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

  const ready = Boolean(background && logo && portrait && name.trim() && !processing && !assetError && !photoError)

  const download = async () => {
    if (!ready || exporting || !canvasRef.current) return
    setExporting(true)
    setExportError('')
    try {
      render() // Flush the current name and framing before exporting the visible canvas.
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvasRef.current!.toBlob((value) => value ? resolve(value) : reject(new Error('The image could not be saved. Please try again.')), 'image/png')
      })
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
          {filename && <div className={styles.selectedFile}><span>{filename}</span><button type="button" onClick={clearPhoto}><RefreshCw size={13} aria-hidden="true" /> Remove</button></div>}
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

    <div className={styles.workspace}>
      <div className={`${styles.panel} ${styles.editorPanel}`} aria-label="Photo editor">
        {portrait ? <PortraitEditor portrait={portrait} framing={framing} onChange={setFraming} /> : <div className={styles.editorEmpty}>
          {processing ? <LoaderCircle size={30} className={styles.spinner} aria-hidden="true" /> : <ImagePlus size={30} strokeWidth={1.4} aria-hidden="true" />}
          <h2>{processing ? 'Preparing your photo' : 'Your photo editor'}</h2>
          <p>{processing ? 'Your crop controls will appear here when your photo is ready.' : 'Choose a photo above. Then crop and position it here while watching your flyer beside it.'}</p>
        </div>}
      </div>
      <section className={styles.preview} aria-label="Your personalized flyer" aria-busy={processing || ((!background || !logo) && !assetError)}>
        <div className={styles.canvasFrame}>
          <canvas ref={canvasRef} width={FLYER_WIDTH * FLYER_SCALE} height={FLYER_HEIGHT * FLYER_SCALE} aria-label={name.trim() ? `Attendance flyer for ${name.trim()}` : 'Attendance flyer preview'}>Your personalized attendance flyer.</canvas>
          {(!background || !logo) && !assetError && <div className={styles.loading} role="status"><LoaderCircle className={styles.spinner} size={22} aria-hidden="true" /> Loading your flyer…</div>}
        </div>
        {assetError && <div className={styles.assetError}><p role="alert">{assetError}</p><button type="button" className={styles.textButton} onClick={() => { setAssetError(''); setAssetAttempt((attempt) => attempt + 1) }}>Reload design</button></div>}
        <button type="button" onClick={() => void download()} disabled={!ready || exporting} className={styles.download}>
          {exporting ? <LoaderCircle size={20} className={styles.spinner} aria-hidden="true" /> : downloaded ? <Check size={20} aria-hidden="true" /> : <Download size={20} aria-hidden="true" />}
          {exporting ? 'Saving your flyer…' : downloaded ? 'Download again' : 'Download my flyer'}
        </button>
        <p className={styles.downloadNote} role="status">{downloaded ? 'Your flyer is ready to share.' : ready ? 'High-resolution PNG · ready for WhatsApp and Instagram.' : 'Add your photo and name to download your flyer.'}</p>
        {exportError && <p className={styles.error} role="alert">{exportError}</p>}
      </section>
    </div>
  </div>
}
