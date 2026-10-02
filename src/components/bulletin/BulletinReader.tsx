'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, LoaderCircle, Maximize, Minus, Plus, RefreshCw } from 'lucide-react'
import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask, TextLayer } from 'pdfjs-dist'
import styles from './reader.module.css'

export default function BulletinReader({ url, title }: { url: string; title: string }) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
  const [page, setPage] = useState(1)
  const [zoom, setZoom] = useState(1)
  const [width, setWidth] = useState(0)
  const [loading, setLoading] = useState(true)
  const [rendering, setRendering] = useState(false)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const surfaceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0, left: 0 })
  }, [page, pdf])

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

  useEffect(() => {
    if (!pdf || width === 0) return
    let cancelled = false
    let renderTask: RenderTask | undefined
    let textLayer: TextLayer | undefined
    async function render() {
      setRendering(true)
      setError('')
      try {
        const currentPage = await pdf!.getPage(page)
        if (cancelled || !surfaceRef.current) return
        const naturalSize = currentPage.getViewport({ scale: 1 })
        const scale = (Math.min(width - 32, 1050) / naturalSize.width) * zoom
        const viewport = currentPage.getViewport({ scale })
        const outputScale = Math.min(window.devicePixelRatio || 1, 2)
        // Each render uses a new canvas so cancelled page/zoom changes cannot
        // draw into the next page's canvas.
        const canvas = document.createElement('canvas')
        canvas.width = Math.ceil(viewport.width * outputScale)
        canvas.height = Math.ceil(viewport.height * outputScale)
        canvas.style.width = `${viewport.width}px`
        canvas.style.height = `${viewport.height}px`
        canvas.setAttribute('aria-hidden', 'true')
        const text = document.createElement('div')
        text.className = styles.textLayer
        text.style.setProperty('--total-scale-factor', String(scale))
        const surface = surfaceRef.current
        surface.style.width = `${viewport.width}px`
        surface.style.height = `${viewport.height}px`
        surface.replaceChildren(canvas, text)
        renderTask = currentPage.render({
          canvas,
          viewport,
          transform: outputScale === 1 ? undefined : [outputScale, 0, 0, outputScale, 0, 0],
        })
        const { TextLayer } = await import('pdfjs-dist')
        if (cancelled) return
        textLayer = new TextLayer({
          textContentSource: currentPage.streamTextContent(),
          container: text,
          viewport,
        })
        await Promise.all([renderTask.promise, textLayer.render()])
      } catch {
        if (!cancelled) setError('This page couldn’t be displayed. Please try again.')
      } finally {
        if (!cancelled) setRendering(false)
      }
    }
    void render()
    return () => {
      cancelled = true
      renderTask?.cancel()
      textLayer?.cancel()
    }
  }, [pdf, page, zoom, width])

  const ready = !!pdf && !loading && !error
  return (
    <div className={styles.reader} aria-label={`${title} reader`}>
      <div className={styles.toolbar} role="toolbar" aria-label="Bulletin reader controls">
        <div className={styles.controls}>
          <button type="button" aria-label="Previous page" disabled={!ready || page === 1} onClick={() => setPage((value) => value - 1)}>
            <ChevronLeft size={19} aria-hidden="true" />
          </button>
          <span className={styles.pageNumber} aria-live="polite">Page {page} of {pdf?.numPages ?? '—'}</span>
          <button type="button" aria-label="Next page" disabled={!ready || page === pdf?.numPages} onClick={() => setPage((value) => value + 1)}>
            <ChevronRight size={19} aria-hidden="true" />
          </button>
        </div>
        <div className={styles.controls}>
          <button type="button" aria-label="Zoom out" disabled={!ready || zoom <= 0.75} onClick={() => setZoom((value) => Math.max(0.75, value - 0.25))}>
            <Minus size={17} aria-hidden="true" />
          </button>
          <span className={styles.zoom}>{Math.round(zoom * 100)}%</span>
          <button type="button" aria-label="Zoom in" disabled={!ready || zoom >= 2.5} onClick={() => setZoom((value) => Math.min(2.5, value + 0.25))}>
            <Plus size={17} aria-hidden="true" />
          </button>
          <button type="button" aria-label="Fit page to width" title="Fit to width" disabled={!ready} onClick={() => setZoom(1)}>
            <Maximize size={17} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div ref={containerRef} className={styles.viewport} tabIndex={0} aria-label="Bulletin page. Scroll to read." aria-busy={loading || rendering}>
        {loading && <p className={styles.status} role="status"><LoaderCircle size={22} className={styles.spinner} aria-hidden="true" />Loading bulletin…</p>}
        {pdf && rendering && !error && <p className={styles.renderStatus} role="status"><LoaderCircle size={16} className={styles.spinner} aria-hidden="true" />Rendering page…</p>}
        {error && <div className={styles.status} role="alert"><p>{error}</p><button type="button" onClick={() => setRetry((value) => value + 1)}><RefreshCw size={16} aria-hidden="true" />Try again</button></div>}
        <div ref={surfaceRef} className={styles.page} hidden={!pdf || !!error} role="document" aria-label={`${title}, page ${page}`} />
      </div>
      <p className={styles.hint}>Use the arrows to turn pages. Zoom in for a closer look.</p>
      <noscript><p>Enable JavaScript to read the bulletin here, or use Open PDF above.</p></noscript>
    </div>
  )
}
