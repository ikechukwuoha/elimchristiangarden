'use client'

import { useEffect, useRef, useState } from 'react'
import { LoaderCircle, Maximize, Minus, Plus, RefreshCw } from 'lucide-react'
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from 'pdfjs-dist'
import BulletinReaderPage from './BulletinReaderPage'
import styles from './reader.module.css'

export default function BulletinReader({ url, title }: { url: string; title: string }) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
  const [page, setPage] = useState(1)
  const [zoom, setZoom] = useState(1)
  const [mode, setMode] = useState<'pdf' | 'text'>('pdf')
  const [width, setWidth] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pdf, mode])

  useEffect(() => {
    let cancelled = false
    let task: PDFDocumentLoadingTask | undefined
    async function load() {
      setLoading(true)
      setError('')
      setPdf(null)
      setPage(1)
      setZoom(1)
      try {
        // Import only in the browser: PDF.js depends on browser canvas APIs.
        const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist')
        if (cancelled) return
        GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs'
        task = getDocument({
          url,
          cMapUrl: '/pdfjs/cmaps/',
          cMapPacked: true,
          standardFontDataUrl: '/pdfjs/standard_fonts/',
          wasmUrl: '/pdfjs/wasm/',
          isEvalSupported: false,
          disableRange: true,
        })
        const document = await task.promise
        if (!cancelled) setPdf(document)
      } catch {
        if (!cancelled) setError('We couldn’t load this bulletin. Please try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
      if (task) void task.destroy().catch(() => {})
    }
  }, [url, retry])

  function updatePage() {
    const container = containerRef.current
    if (!container) return
    const readingLine = container.getBoundingClientRect().top + Math.min(container.clientHeight / 3, 48)
    for (const element of container.querySelectorAll<HTMLElement>('[data-page-number]')) {
      if (element.getBoundingClientRect().bottom > readingLine) {
        setPage(Number(element.dataset.pageNumber))
        break
      }
    }
  }

  const ready = !!pdf && !loading && !error
  const minZoom = mode === 'text' ? 1 : 0.75
  const maxZoom = mode === 'text' ? 2 : 3
  function changeMode(value: 'pdf' | 'text') {
    setMode(value)
    setZoom(1)
    setPage(1)
  }
  return (
    <div className={styles.reader} aria-label={`${title} reader`}>
      <div className={styles.toolbar} role="group" aria-label="Bulletin reader controls">
        <div className={styles.modes} role="group" aria-label="Reading view">
          <button type="button" aria-pressed={mode === 'text'} disabled={loading} onClick={() => changeMode('text')}>Text view</button>
          <button type="button" aria-pressed={mode === 'pdf'} disabled={loading} onClick={() => changeMode('pdf')}>Original PDF</button>
        </div>
        <span className={styles.pageNumber} aria-live="polite">Page {page} of {pdf?.numPages ?? '—'}</span>
        <div className={styles.controls}>
          <button type="button" aria-label={mode === 'text' ? 'Decrease text size' : 'Zoom out'} disabled={!ready || zoom <= minZoom} onClick={() => setZoom((value) => Math.max(minZoom, value - 0.25))}>
            <Minus size={17} aria-hidden="true" />
          </button>
          <span className={styles.zoom}>{Math.round(zoom * 100)}%</span>
          <button type="button" aria-label={mode === 'text' ? 'Increase text size' : 'Zoom in'} disabled={!ready || zoom >= maxZoom} onClick={() => setZoom((value) => Math.min(maxZoom, value + 0.25))}>
            <Plus size={17} aria-hidden="true" />
          </button>
          <button className={styles.fitControl} type="button" aria-label={mode === 'text' ? 'Reset text size' : 'Fit page to width'} title={mode === 'text' ? 'Reset text size' : 'Fit to width'} disabled={!ready} onClick={() => setZoom(1)}>
            <Maximize size={17} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div ref={containerRef} onScroll={updatePage} className={`${styles.viewport} ${mode === 'text' ? styles.textViewport : ''}`} tabIndex={0} aria-label="Bulletin pages. Scroll to read." aria-busy={loading}>
        {loading && <p className={styles.status} role="status"><LoaderCircle size={22} className={styles.spinner} aria-hidden="true" />Loading bulletin…</p>}
        {error && <div className={styles.status} role="alert"><p>{error}</p><button type="button" onClick={() => setRetry((value) => value + 1)}><RefreshCw size={16} aria-hidden="true" />Try again</button></div>}
        {pdf && !error && <div className={styles.pages}>
          {Array.from({ length: pdf.numPages }, (_, index) => (
            <BulletinReaderPage key={index + 1} pdf={pdf} pageNumber={index + 1} title={title} width={width} zoom={zoom} mode={mode} scrollRoot={containerRef} onReadPdf={() => changeMode('pdf')} />
          ))}
        </div>}
      </div>
      <p className={styles.hint}>{mode === 'text' ? 'Scroll to keep reading. Adjust the text size for comfort, or choose Original PDF to see the full design.' : 'Scroll down to read the whole bulletin. Zoom in for a closer look.'}</p>
      <noscript><p>Enable JavaScript to read the bulletin here, or use Open PDF above.</p></noscript>
    </div>
  )
}
