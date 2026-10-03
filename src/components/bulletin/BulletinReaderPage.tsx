'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'
import { LoaderCircle, RefreshCw } from 'lucide-react'
import type { PDFDocumentProxy, PDFPageProxy, RenderTask, TextLayer } from 'pdfjs-dist'
import { bulletinTextParagraphs } from '@/lib/bulletin-text'
import styles from './reader.module.css'

export default function BulletinReaderPage({ pdf, pageNumber, title, width, zoom, mode, scrollRoot, onReadPdf }: {
  pdf: PDFDocumentProxy
  pageNumber: number
  title: string
  width: number
  zoom: number
  mode: 'pdf' | 'text'
  scrollRoot: RefObject<HTMLDivElement | null>
  onReadPdf: () => void
}) {
  const [page, setPage] = useState<PDFPageProxy | null>(null)
  const [nearby, setNearby] = useState(pageNumber === 1)
  const [rendering, setRendering] = useState(true)
  const [paragraphs, setParagraphs] = useState<string[] | null>(null)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const pageRef = useRef<HTMLElement>(null)
  const surfaceRef = useRef<HTMLDivElement>(null)
  const enabled = mode === 'text' || nearby
  const naturalSize = page?.getViewport({ scale: 1 })
  const pageWidth = Math.max(1, Math.min(width - 32, 1400)) * zoom
  const pageHeight = pageWidth * (naturalSize ? naturalSize.height / naturalSize.width : 842 / 595)

  useEffect(() => {
    let cancelled = false
    void pdf.getPage(pageNumber).then((loadedPage) => {
      if (!cancelled) {
        setError('')
        setPage(loadedPage)
      }
    }).catch(() => {
      if (!cancelled) setError('This page couldn’t be loaded. Please try again.')
    })
    return () => { cancelled = true }
  }, [pdf, pageNumber, retry])

  useEffect(() => {
    const element = pageRef.current
    if (!element) return
    // Prepare nearby pages before they scroll into view, and release distant
    // canvases so long bulletins stay manageable on phones.
    const observer = new IntersectionObserver(([entry]) => setNearby(entry.isIntersecting), {
      root: scrollRoot.current,
      rootMargin: '1000px 0px',
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [scrollRoot])

  useEffect(() => {
    if (!page || !width || !enabled) return
    let cancelled = false
    let renderTask: RenderTask | undefined
    let textLayer: TextLayer | undefined
    let canvas: HTMLCanvasElement | undefined
    const surface = surfaceRef.current
    async function render() {
      setRendering(true)
      setError('')
      try {
        if (mode === 'text') {
          const content = await page!.getTextContent()
          if (!cancelled) setParagraphs(bulletinTextParagraphs(content))
          return
        }
        const { TextLayer } = await import('pdfjs-dist')
        if (cancelled || !surface) return
        const scale = pageWidth / page!.getViewport({ scale: 1 }).width
        const viewport = page!.getViewport({ scale })
        const outputScale = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(16_000_000 / (viewport.width * viewport.height)))
        canvas = document.createElement('canvas')
        canvas.width = Math.ceil(viewport.width * outputScale)
        canvas.height = Math.ceil(viewport.height * outputScale)
        canvas.style.width = `${viewport.width}px`
        canvas.style.height = `${viewport.height}px`
        canvas.setAttribute('aria-hidden', 'true')
        const text = document.createElement('div')
        text.className = styles.textLayer
        text.style.setProperty('--total-scale-factor', String(scale))
        surface.replaceChildren(canvas, text)
        renderTask = page!.render({
          canvas,
          viewport,
          transform: outputScale === 1 ? undefined : [outputScale, 0, 0, outputScale, 0, 0],
        })
        textLayer = new TextLayer({ textContentSource: page!.streamTextContent(), container: text, viewport })
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
      surface?.replaceChildren()
      if (canvas) { canvas.width = 0; canvas.height = 0 }
    }
  }, [page, width, pageWidth, mode, enabled, retry])

  return (
    <section ref={pageRef} className={styles.pageSection} data-page-number={pageNumber} aria-label={`${title}, page ${pageNumber}`}>
      <p className={styles.pageLabel}>Page {pageNumber}</p>
      <div className={mode === 'pdf' ? styles.page : styles.textPage} style={mode === 'pdf' ? { width: pageWidth, height: pageHeight } : { fontSize: `${18 * zoom}px` }} aria-busy={enabled && rendering && !error}>
        {mode === 'pdf' && <div ref={surfaceRef} hidden={!!error} className={styles.surface} role="document" aria-label={`PDF page ${pageNumber}`} />}
        {enabled && rendering && !error && <p className={styles.renderStatus} role="status"><LoaderCircle size={16} className={styles.spinner} aria-hidden="true" />Loading page {pageNumber}…</p>}
        {error && <div className={styles.status} role="alert"><p>{error}</p><button type="button" onClick={() => setRetry((value) => value + 1)}><RefreshCw size={16} aria-hidden="true" />Try page {pageNumber} again</button></div>}
        {mode === 'text' && !error && paragraphs !== null && (
          paragraphs.length ? <article aria-label={`Text of page ${pageNumber}`}>
            {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </article> : <div className={styles.status}>
            <p>Text view isn’t available for this page.</p>
            <button type="button" onClick={onReadPdf}>Read original PDF</button>
          </div>
        )}
      </div>
    </section>
  )
}
