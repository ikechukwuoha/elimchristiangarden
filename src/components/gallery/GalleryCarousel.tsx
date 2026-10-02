'use client'

import Image from 'next/image'
import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from 'react'
import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import styles from './gallery-carousel.module.css'

export type GallerySlide = {
  id: string
  src: string
  thumbnail: string
  originalUrl: string
  title: string
  description: string
}

function subscribeMotionPreference(listener: () => void) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)')
  query.addEventListener('change', listener)
  return () => query.removeEventListener('change', listener)
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function serverMotionPreference() {
  return true
}

export default function GalleryCarousel({ photos, label }: { photos: GallerySlide[]; label: string }) {
  const [slide, setSlide] = useState<{ index: number; previous: number | null }>({ index: 0, previous: null })
  const [playing, setPlaying] = useState(true)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [loadedPhotoId, setLoadedPhotoId] = useState<string | null>(null)
  const thumbnailsRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useSyncExternalStore(subscribeMotionPreference, prefersReducedMotion, serverMotionPreference)
  const multiple = photos.length > 1
  const automatic = multiple && playing && !reducedMotion
  const index = photos.length ? slide.index % photos.length : 0
  const photo = photos[index]
  const previous = slide.previous !== null ? photos[slide.previous] : null

  useEffect(() => {
    if (!automatic || hovered || focused || loadedPhotoId !== photo?.id) return
    const timer = window.setInterval(() => {
      if (document.hidden) return
      setSlide((current) => ({ index: (current.index + 1) % photos.length, previous: current.index }))
    }, 5500)
    return () => window.clearInterval(timer)
  }, [automatic, hovered, focused, photos.length, slide.index, loadedPhotoId, photo?.id])

  useEffect(() => {
    if (slide.previous === null || loadedPhotoId !== photo?.id) return
    const timer = window.setTimeout(() => setSlide((current) => ({ ...current, previous: null })), 1000)
    return () => window.clearTimeout(timer)
  }, [slide.index, slide.previous, loadedPhotoId, photo?.id])

  useEffect(() => {
    const rail = thumbnailsRef.current
    const thumbnail = rail?.children[index] as HTMLElement | undefined
    if (!rail || !thumbnail) return
    rail.scrollTo({
      left: thumbnail.offsetLeft - rail.clientWidth / 2 + thumbnail.offsetWidth / 2,
      behavior: reducedMotion ? 'instant' : 'smooth',
    })
  }, [index, reducedMotion])

  function selectSlide(next: number) {
    if (!photos.length) return
    const destination = (next + photos.length) % photos.length
    if (destination === index) return
    setSlide({ index: destination, previous: reducedMotion ? null : index })
  }

  function handleKeys(event: KeyboardEvent<HTMLElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      selectSlide(index + 1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      selectSlide(index - 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      selectSlide(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      selectSlide(photos.length - 1)
    }
  }

  if (!photo) return null

  return (
    <section
      className={styles.carousel}
      aria-label={`${label} photographs`}
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={handleKeys}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
      }}
    >
      <div className={styles.viewport}>
        {previous && previous.id !== photo.id && (
          <div className={styles.slide} aria-hidden="true">
            <Image src={previous.src} alt="" fill unoptimized sizes="(max-width: 760px) calc(100vw - 32px), (max-width: 1664px) calc(100vw - 64px), 1600px" className={styles.image} />
          </div>
        )}
        <div key={photo.id} className={`${styles.slide} ${loadedPhotoId === photo.id ? styles.activeSlide : styles.pendingSlide}`} role="group" aria-roledescription="slide" aria-label={`Photograph ${index + 1} of ${photos.length}`}>
          <Image src={photo.src} alt={photo.description || photo.title} fill unoptimized loading="eager" fetchPriority={index === 0 ? 'high' : 'auto'} sizes="(max-width: 760px) calc(100vw - 32px), (max-width: 1664px) calc(100vw - 64px), 1600px" className={styles.image} onLoad={() => setLoadedPhotoId(photo.id)} />
        </div>
        <div className={styles.caption}>
          <span>{label}</span>
          <h2>{photo.title}</h2>
          {photo.description && <p>{photo.description}</p>}
        </div>
        {multiple && <>
          <button type="button" className={`${styles.arrow} ${styles.previous}`} aria-label="Previous photograph" onClick={() => selectSlide(index - 1)}><ChevronLeft size={26} aria-hidden="true" /></button>
          <button type="button" className={`${styles.arrow} ${styles.next}`} aria-label="Next photograph" onClick={() => selectSlide(index + 1)}><ChevronRight size={26} aria-hidden="true" /></button>
        </>}
      </div>
      <div className={styles.toolbar}>
        <span className={styles.counter} aria-live={automatic && !focused ? 'off' : 'polite'} aria-atomic="true">{String(index + 1).padStart(2, '0')} <span>/ {String(photos.length).padStart(2, '0')}</span></span>
        <div className={styles.actions}>
          {multiple && !reducedMotion && <button type="button" onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pause automatic slideshow' : 'Play automatic slideshow'}>{playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}<span>{playing ? 'Pause' : 'Play'}</span></button>}
          <a href={photo.originalUrl} target="_blank" rel="noopener noreferrer">Open photograph <ArrowUpRight size={16} aria-hidden="true" /></a>
        </div>
      </div>
      {multiple && <div ref={thumbnailsRef} className={styles.thumbnails} role="group" aria-label="Choose a photograph">
        {photos.map((item, position) => <button key={item.id} type="button" className={styles.thumbnail} aria-label={`Show photograph ${position + 1}: ${item.title}`} aria-current={position === index ? 'true' : undefined} onClick={() => selectSlide(position)}>
          <Image src={item.thumbnail} alt="" width={96} height={72} unoptimized loading="lazy" />
        </button>)}
      </div>}
    </section>
  )
}
