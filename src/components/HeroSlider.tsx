'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Pause,
  Play,
} from 'lucide-react'
import { church } from '@/app/data/church'
import styles from '@/app/home.module.css'

type HeroPhoto = {
  id: string
  src: string
  alt: string
}

type Slide = {
  eyebrow: string
  title: [string, string, string]
  subtitle: string
}

const slides: Slide[] = [
  {
    eyebrow: 'A FAMILY OF FAITH. A PLACE TO BELONG.',
    title: ['Rooted in faith.', 'Growing', 'together.'],
    subtitle:
      'Wherever you are on your journey, you are welcome here. Discover a life of purpose in the love of Jesus.',
  },
  {
    eyebrow: 'SUNDAYS AT ELIM',
    title: ['Come as you are.', 'Leave', 'renewed.'],
    subtitle:
      'Worship, the Word, and a warm welcome — a fresh start for your week, every single week.',
  },
  {
    eyebrow: 'LIFE IS BETTER TOGETHER',
    title: ['Find your people.', 'Grow your', 'purpose.'],
    subtitle:
      'From fellowships to serving teams, there is a place for every age and every season of life.',
  },
  {
    eyebrow: 'THE NEXT GENERATION',
    title: ['Raising a', 'generation that', 'loves God.'],
    subtitle:
      'Children and teenagers discover Jesus, build friendships, and grow a faith of their own.',
  },
  {
    eyebrow: 'WATERING LIVES FOR FRUITFULNESS',
    title: ['A place of', 'refreshing and', 'fruitfulness.'],
    subtitle:
      'Like Elim of old — twelve wells of water and seventy palm trees — there is room for you here.',
  },
  {
    eyebrow: 'YOUR NEXT STEP STARTS HERE',
    title: ['There’s a seat', 'for you this', 'Sunday.'],
    subtitle: `Join us at Elim Garden, Bwari, Abuja — Sundays at ${church.sundayTime}. Come and see.`,
  },
]

// Slides are shuffled after mount so every visit meets the hero in a different
// order, without breaking server rendering (which shows the first slide).
function shuffledOrder(length: number) {
  const order = Array.from({ length }, (_, index) => index)
  for (let index = order.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1))
    ;[order[index], order[swap]] = [order[swap], order[index]]
  }
  return order
}

export default function HeroSlider({ photos }: { photos: HeroPhoto[] }) {
  const slideCount = Math.max(photos.length, 1)
  const [order, setOrder] = useState<number[]>(() =>
    Array.from({ length: slideCount }, (_, index) => index),
  )
  const [position, setPosition] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    // Deferred with a timeout so the shuffled order lands after hydration.
    const timeout = window.setTimeout(() => setOrder(shuffledOrder(slideCount)), 0)
    return () => window.clearTimeout(timeout)
  }, [slideCount])

  useEffect(() => {
    if (order.length < 2 || paused || hovered || focused) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let interval: ReturnType<typeof setInterval> | undefined
    const sync = () => {
      clearInterval(interval)
      if (!document.hidden && !motion.matches) {
        interval = setInterval(() => setPosition((value) => (value + 1) % order.length), 6000)
      }
    }
    sync()
    document.addEventListener('visibilitychange', sync)
    motion.addEventListener('change', sync)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', sync)
      motion.removeEventListener('change', sync)
    }
  }, [order.length, paused, hovered, focused, position])

  const move = (step: number) =>
    setPosition((value) => (value + step + order.length) % order.length)

  return (
    <section
      className={styles.hero}
      aria-labelledby="welcome-title"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
      }}
      onTouchStart={(event) => {
        touchStart.current = null
        if (event.touches.length !== 1) return
        if ((event.target as HTMLElement).closest('a, button')) return
        const touch = event.touches[0]
        touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null
      }}
      onTouchEnd={(event) => {
        const start = touchStart.current
        touchStart.current = null
        const touch = event.changedTouches[0]
        if (!start || !touch || order.length < 2) return
        const dx = touch.clientX - start.x
        const dy = touch.clientY - start.y
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
          setPaused(true)
          move(dx < 0 ? 1 : -1)
        }
      }}
      onTouchCancel={() => { touchStart.current = null }}
    >
      <h1 id="welcome-title" className="sr-only">
        Rooted in faith. Growing together. Elim Christian Garden International,
        Bwari, Abuja.
      </h1>
      <div className={styles.heroSlides}>
        {order.map((slideIndex, slidePosition) => {
          const photo = photos[slideIndex]
          if (!photo) return null
          const active = slidePosition === position
          // Keep adjacent photos ready without loading the entire library at once.
          if (
            !active &&
            slidePosition !== (position + 1) % order.length &&
            slidePosition !== (position + order.length - 1) % order.length
          ) return null
          return (
            <div
              key={photo.id}
              className={`${styles.heroSlide} ${active ? styles.heroSlideActive : ''}`}
              aria-hidden={!active}
            >
              <div className={styles.heroImage}>
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  unoptimized
                  sizes="(max-width: 899px) 100vw, 72vw"
                  loading="eager"
                  fetchPriority={active ? 'high' : 'auto'}
                  className={styles.cover}
                />
              </div>
            </div>
          )
        })}
      </div>
      <div className={styles.heroShade} />
      <div className={styles.heroContent}>
        <div className={styles.heroWriteups}>
          {order.map((slideIndex, slidePosition) => {
            const slide = slides[slideIndex % slides.length]
            const active = slidePosition === position
            const [first, second, em] = slide.title
            return (
              <div
                key={slideIndex}
                className={`${styles.heroWriteup} ${active ? styles.heroWriteupActive : ''}`}
                aria-hidden={!active}
              >
                <div className={styles.heroEyebrow}>
                  <span /> {slide.eyebrow}
                </div>
                <p className={styles.heroWriteupTitle}>
                  {first}
                  <br />
                  {second}
                  <br />
                  <em>{em}</em>
                </p>
                <p>{slide.subtitle}</p>
              </div>
            )
          })}
        </div>
        <div className={styles.heroActions}>
          <a href="#visit" className={styles.goldButton}>
            Join us this Sunday <ArrowUpRight size={19} aria-hidden="true" />
          </a>
          <a href="#welcome" className={styles.heroLink}>
            Get to know us <ArrowRight size={17} aria-hidden="true" />
          </a>
        </div>
        <div className={styles.heroLocation}>
          <MapPin size={14} aria-hidden="true" /> BWARI, ABUJA{' '}
          <span>•</span> ONE FAMILY IN CHRIST
        </div>
        {photos.length > 1 && (
          <div className={styles.heroControls} role="group" aria-label="Photo slideshow controls">
            <button
              type="button"
              className={styles.heroArrow}
              onClick={() => move(-1)}
              aria-label="Previous slide"
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            {order.length <= 6 && (
              <div className={styles.heroDots} role="group" aria-label="Slides">
                {order.map((slideIndex, slidePosition) => (
                  <button
                    key={slideIndex}
                    type="button"
                    className={styles.heroDot}
                    aria-current={slidePosition === position}
                    aria-label={`Go to slide ${slidePosition + 1}`}
                    onClick={() => setPosition(slidePosition)}
                  />
                ))}
              </div>
            )}
            <span className={styles.heroCount}>
              <span className="sr-only">Photo </span>{position + 1} / {order.length}
            </span>
            <button
              type="button"
              className={styles.heroArrow}
              onClick={() => move(1)}
              aria-label="Next slide"
            >
              <ChevronRight size={20} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={styles.heroArrow}
              aria-label={paused ? 'Resume slideshow' : 'Pause slideshow'}
              aria-pressed={paused}
              onClick={() => setPaused((value) => !value)}
            >
              {paused ? <Play size={17} aria-hidden="true" /> : <Pause size={17} aria-hidden="true" />}
            </button>
          </div>
        )}
      </div>
      <a
        className={styles.heroScroll}
        href="#welcome"
        aria-label="Discover our church"
      >
        <span>DISCOVER ELIM</span>
        <ArrowDown size={17} aria-hidden="true" />
      </a>
      {photos.length > 0 && (
        <div className={styles.photoCaption}>
          <span className={styles.captionLine} /> REAL PEOPLE. SHARED FAITH.
        </div>
      )}
    </section>
  )
}
