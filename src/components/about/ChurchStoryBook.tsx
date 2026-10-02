'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, ChevronRight, Leaf, List, Sprout, TreePalm, X } from 'lucide-react'
import { churchFoundedYear, churchStoryChapters } from '@/app/data/about'
import aboutStyles from '@/app/about/about.module.css'
import styles from './church-story-book.module.css'

type PageTurn = { direction: 'forward' | 'backward'; label: string; title: string; cover: boolean }

export default function ChurchStoryBook() {
  const [readerVisible, setReaderVisible] = useState(false)
  const [chapterIndex, setChapterIndex] = useState<number | null>(null)
  const [turn, setTurn] = useState<PageTurn | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const openButtonRef = useRef<HTMLButtonElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const bookRef = useRef<HTMLDivElement>(null)
  const readerCoverRef = useRef<HTMLButtonElement>(null)
  const contentsRef = useRef<HTMLDetailsElement>(null)
  const leftContentRef = useRef<HTMLDivElement>(null)
  const rightContentRef = useRef<HTMLDivElement>(null)
  const pointerStartRef = useRef<{ x: number; y: number; scrollTop: number } | null>(null)
  const isOpen = readerVisible
  const chapter = chapterIndex !== null ? churchStoryChapters[chapterIndex] : null

  useEffect(() => {
    if (!turn) return
    // Leave enough time for the page-turn animation to finish. Normally
    // onAnimationEnd clears the turn; this timer is a fallback.
    const timer = window.setTimeout(() => setTurn(null), 2800)
    return () => window.clearTimeout(timer)
  }, [turn])

  function showBookCover() {
    setReaderVisible(true)
    setChapterIndex(null)
    setTurn(null)
    window.requestAnimationFrame(() => {
      readerCoverRef.current?.focus({ preventScroll: true })
      bookRef.current?.scrollIntoView({
        block: 'start',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      })
    })
  }

  function goToChapter(index: number) {
    if (index === -1 && chapterIndex === 0) {
      returnToCover()
      return
    }
    if (turn || index < 0 || index >= churchStoryChapters.length || index === chapterIndex) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setTurn(reducedMotion ? null : {
      direction: chapterIndex !== null && index < chapterIndex ? 'backward' : 'forward',
      label: chapterIndex === null ? 'ELIM CHRISTIAN GARDEN INTERNATIONAL' : `CHAPTER ${String(chapterIndex + 1).padStart(2, '0')}`,
      title: chapter?.title ?? 'Our story.',
      cover: chapterIndex === null,
    })
    setChapterIndex(index)
    if (contentsRef.current) contentsRef.current.open = false
    window.requestAnimationFrame(() => {
      if (leftContentRef.current) leftContentRef.current.scrollTop = 0
      if (rightContentRef.current) rightContentRef.current.scrollTop = 0
      headingRef.current?.focus({ preventScroll: true })
    })
  }

  function rememberPointer(event: PointerEvent<HTMLElement>) {
    const content = event.currentTarget.contains(leftContentRef.current) ? leftContentRef.current : rightContentRef.current
    pointerStartRef.current = { x: event.clientX, y: event.clientY, scrollTop: content?.scrollTop ?? 0 }
  }

  function turnFromPage(event: MouseEvent<HTMLElement>, direction: 'forward' | 'backward') {
    if (chapterIndex === null || event.button !== 0) return
    if (event.target instanceof Element && event.target.closest('a, button, input, textarea, select, summary')) return
    if (window.getSelection()?.toString()) return
    const content = event.currentTarget.contains(leftContentRef.current) ? leftContentRef.current : rightContentRef.current
    const start = pointerStartRef.current
    if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) return
    if (start && content && content.scrollTop !== start.scrollTop) return
    if (content && event.target === content && event.clientX >= content.getBoundingClientRect().left + content.clientWidth) return
    let step = direction === 'forward' ? 1 : -1
    if (window.matchMedia('(max-width: 760px)').matches) {
      const bounds = event.currentTarget.getBoundingClientRect()
      step = event.clientX < bounds.left + bounds.width / 2 ? -1 : 1
    }
    goToChapter(chapterIndex + step)
  }

  function returnToCover() {
    if (turn || chapterIndex === null) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setTurn(reducedMotion ? null : {
      direction: 'backward',
      label: 'ELIM CHRISTIAN GARDEN INTERNATIONAL',
      title: 'Our story.',
      cover: true,
    })
    setChapterIndex(null)
    if (contentsRef.current) contentsRef.current.open = false
    window.requestAnimationFrame(() => readerCoverRef.current?.focus({ preventScroll: true }))
  }

  function dismissReader() {
    setTurn(null)
    setChapterIndex(null)
    setReaderVisible(false)
    window.requestAnimationFrame(() => {
      openButtonRef.current?.focus({ preventScroll: true })
      sectionRef.current?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
    })
  }

  function handleKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    if (event.key === 'Escape') {
      event.preventDefault()
      if (chapterIndex === null) {
        if (!turn) dismissReader()
      } else returnToCover()
    } else if (event.key === 'ArrowRight' && chapterIndex !== null) {
      event.preventDefault()
      goToChapter(chapterIndex + 1)
    } else if (event.key === 'ArrowLeft' && chapterIndex !== null) {
      event.preventDefault()
      goToChapter(chapterIndex - 1)
    }
  }

  return (
    <section ref={sectionRef} className={`${aboutStyles.container} ${isOpen ? styles.openStorySection : ''}`} id="our-story" aria-labelledby="story-heading">
        {!isOpen ? (
          <div className={`${aboutStyles.story} ${styles.bookCover}`}>
            <div className={aboutStyles.storyCopy}>
              <span className={aboutStyles.eyebrow}><span /> OUR STORY</span>
              <h2 id="story-heading">A place of refreshing.<br /><em>A life of fruitfulness.</em></h2>
              <p className={aboutStyles.intro}>
                Every family has a story. Ours began with a simple vision: to
                create a place where lives are refreshed and faith can flourish.
              </p>
              <p>
                Founded in {churchFoundedYear}, Elim Christian Garden International began as a
                small gathering with a heart for worship, spiritual growth, and
                fellowship. Today, that same heart continues to shape our church family.
              </p>
              <p>
                Our name comes from Elim, the place of rest and refreshment
                described in Exodus 15:27. Just as those springs offered renewal
                on a long journey, we want our church to be a place where people
                find hope, encouragement, and new strength in God.
              </p>
              <button ref={openButtonRef} type="button" className={aboutStyles.greenButton} onClick={showBookCover}>
                <BookOpen size={18} aria-hidden="true" /> Open our story <ArrowRight size={17} aria-hidden="true" />
              </button>
              <div className={styles.coverEdition}>
                <span>{String(churchStoryChapters.length).padStart(2, '0')} CHAPTERS</span>
                <span>A SHARED JOURNEY OF FAITH</span>
              </div>
              <div className={aboutStyles.storySignature}>
                <Leaf size={24} strokeWidth={1.3} aria-hidden="true" />
                <span>Our roots are in Christ.<br /><strong>Our hearts are open to you.</strong></span>
              </div>
            </div>
            <div className={styles.coverBook}>
              <button type="button" className={styles.coverPhotoButton} onClick={showBookCover} aria-label="Open our story book">
                <Image src="/images/logo-removebg-preview.png" alt="Elim Christian Garden International church logo" fill sizes="(max-width: 760px) 90vw, 42vw" className={styles.coverLogo} />
                <span><BookOpen size={17} aria-hidden="true" /> OPEN THE BOOK <ArrowRight size={17} aria-hidden="true" /></span>
              </button>
              <aside className={`${aboutStyles.originCard} ${styles.coverOrigin}`} aria-label="The meaning of Elim">
                <TreePalm className={aboutStyles.originPalm} size={180} strokeWidth={0.7} aria-hidden="true" />
                <span className={aboutStyles.originLabel}>THE HEART BEHIND OUR NAME</span>
                <h3>Elim.</h3>
                <span className={aboutStyles.originSubtitle}>A place to be refreshed.</span>
                <blockquote>“And they came to Elim, where were twelve wells of water, and threescore and ten palm trees.”</blockquote>
                <cite>EXODUS 15:27</cite>
                <div className={aboutStyles.originNumbers}>
                  <div><span>12</span><p>WELLS OF WATER</p></div>
                  <div><span>70</span><p>PALM TREES</p></div>
                </div>
                <p className={aboutStyles.originFootnote}>The biblical place that inspires our name and our heart for spiritual renewal.</p>
              </aside>
            </div>
          </div>
        ) : (
          <div ref={bookRef} id="church-story-reader" className={styles.reader} onKeyDown={handleKeys}>
            <div className={styles.readerToolbar}>
              <span><BookOpen size={17} aria-hidden="true" /> THE ELIM STORY</span>
              <button type="button" disabled={Boolean(turn)} onClick={chapterIndex === null ? dismissReader : returnToCover}><X size={16} aria-hidden="true" /> {chapterIndex === null ? 'Close reader' : 'Back to cover'}</button>
            </div>
            <div className={styles.contentsRow}>
              {chapterIndex !== null ? <details ref={contentsRef} className={styles.contents}>
                <summary><List size={16} aria-hidden="true" /> Contents <ChevronRight size={14} aria-hidden="true" /></summary>
                <nav aria-label="Book chapters">
                  {churchStoryChapters.map((item, index) => (
                    <button key={item.id} type="button" disabled={Boolean(turn)} aria-current={chapterIndex === index ? 'page' : undefined} onClick={() => goToChapter(index)}>
                      <span>{String(index + 1).padStart(2, '0')}</span>{item.title}
                    </button>
                  ))}
                </nav>
              </details> : <span className={styles.coverContents}><BookOpen size={16} aria-hidden="true" /> Book cover</span>}
              <p role="status" aria-live="polite" aria-atomic="true">{chapterIndex === null ? 'Tap the cover to open' : `Chapter ${chapterIndex + 1} of ${churchStoryChapters.length}`}</p>
            </div>
            <div className={styles.book}>
              {chapter && chapterIndex !== null ? (
              <div className={styles.spread}>
                <aside className={styles.leftPage} aria-label="Chapter illustration" data-can-turn={!turn} onPointerDownCapture={rememberPointer} onClick={(event) => turnFromPage(event, 'backward')}>
                  <button type="button" className={`${styles.pageTurnTarget} ${styles.backPageTarget}`} aria-label={chapterIndex === 0 ? 'Close the book to its cover' : 'Turn back to the previous chapter'} disabled={Boolean(turn)} onClick={() => goToChapter(chapterIndex - 1)}><ArrowLeft size={17} aria-hidden="true" /></button>
                  <div ref={leftContentRef} className={styles.pageContent} tabIndex={0} aria-label="Scroll the chapter illustration">
                  <span className={styles.runningTitle}>ELIM CHRISTIAN GARDEN INTERNATIONAL</span>
                  <figure>
                    <div className={styles.chapterPhoto}>
                      <Image key={chapter.image} src={chapter.image} alt={chapter.imageAlt} fill sizes="(max-width: 760px) 88vw, 42vw" loading="eager" className={aboutStyles.cover} />
                    </div>
                    <figcaption>{chapter.caption}</figcaption>
                  </figure>
                  <span className={styles.chapterNumber}>{String(chapterIndex + 1).padStart(2, '0')}</span>
                  <p className={styles.chapterSubtitle}>{chapter.subtitle}</p>
                  <blockquote>{chapter.quote}</blockquote>
                  </div>
                  <span className={styles.pageNumber} aria-hidden="true">{String(chapterIndex * 2 + 1).padStart(2, '0')}</span>
                </aside>
                <article className={styles.rightPage} aria-labelledby="story-heading" data-can-turn={chapterIndex < churchStoryChapters.length - 1 && !turn} onPointerDownCapture={rememberPointer} onClick={(event) => turnFromPage(event, 'forward')}>
                  <button type="button" className={`${styles.pageTurnTarget} ${styles.frontPageTarget}`} aria-label="Turn forward to the next chapter" disabled={chapterIndex === churchStoryChapters.length - 1 || Boolean(turn)} onClick={() => goToChapter(chapterIndex + 1)}><ArrowRight size={17} aria-hidden="true" /></button>
                  <button type="button" className={`${styles.pageTurnTarget} ${styles.mobileBackPage}`} aria-label={chapterIndex === 0 ? 'Close the book to its cover' : 'Turn back to the previous chapter'} disabled={Boolean(turn)} onClick={() => goToChapter(chapterIndex - 1)}><ArrowLeft size={17} aria-hidden="true" /></button>
                  <div ref={rightContentRef} className={styles.pageContent} tabIndex={0} aria-labelledby="story-heading">
                  <span className={styles.runningTitle}>OUR STORY / CHAPTER {String(chapterIndex + 1).padStart(2, '0')}</span>
                  <div className={styles.mobileChapterPhoto}><Image src={chapter.image} alt={chapter.imageAlt} fill sizes="(max-width: 760px) 85vw, 1px" className={aboutStyles.cover} /></div>
                  <h2 ref={headingRef} id="story-heading" tabIndex={-1}>{chapter.title}</h2>
                  <div className={styles.prose}>
                    {chapter.paragraphs.map((paragraph, index) => <p key={`${chapter.id}-${index}`}>{paragraph}</p>)}
                  </div>
                  {chapter.notes && (
                    <dl className={styles.chapterNotes}>
                      {chapter.notes.map((note) => <div key={note.title}><dt>{note.title}</dt><dd>{note.text}</dd></div>)}
                    </dl>
                  )}
                  {chapter.scriptures && <div className={styles.scriptureLinks} aria-label="Scripture foundations">
                    {chapter.scriptures.map((reference) => <a key={reference} href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(reference)}&version=KJV`} target="_blank" rel="noopener noreferrer">{reference}<ArrowUpRight size={13} aria-hidden="true" /></a>)}
                  </div>}
                  {chapter.action && <Link href={chapter.action.href} className={styles.chapterAction}>{chapter.action.label}<ArrowUpRight size={16} aria-hidden="true" /></Link>}
                  </div>
                  <span className={styles.pageNumber} aria-hidden="true">{String(chapterIndex * 2 + 2).padStart(2, '0')}</span>
                </article>
              </div>
              ) : (
                <button ref={readerCoverRef} type="button" className={styles.readerCover} aria-disabled={Boolean(turn)} onClick={() => goToChapter(0)} aria-label="Open the cover and read the first chapter">
                  <span className={styles.readerCoverLogo}>
                    <Image src="/images/logo-removebg-preview.png" alt="" fill sizes="140px" className={styles.coverLogoImage} />
                  </span>
                  <span className={styles.readerCoverLabel}>ELIM CHRISTIAN GARDEN INTERNATIONAL</span>
                  <span id="story-heading" role="heading" aria-level={2} className={styles.readerCoverTitle}>Our story.</span>
                  <span className={styles.readerCoverSubtitle}>A place of refreshing. A life of fruitfulness.</span>
                  <span className={styles.readerCoverPrompt}><BookOpen size={18} aria-hidden="true" /> Tap the cover to begin <ArrowRight size={17} aria-hidden="true" /></span>
                </button>
              )}
              {turn && <div className={`${styles.turningPage} ${turn.direction === 'backward' ? styles.turnBackward : styles.turnForward} ${turn.cover ? styles.turningCover : ''}`} aria-hidden="true" onAnimationEnd={() => setTurn(null)}>
                <span>{turn.label}</span><p>{turn.title}</p><Sprout size={50} strokeWidth={0.8} />
              </div>}
            </div>
            {chapterIndex !== null && <>
              <div className={styles.progress} aria-hidden="true">{churchStoryChapters.map((item, index) => <span key={item.id} data-active={index <= chapterIndex} />)}</div>
              <p className={styles.readerHint}>Click the right side of the book to turn forward, or the left side to turn back. Turn back from the first chapter to close the book. Scroll inside the book to read more. You can also use the arrow keys.</p>
            </>}
          </div>
        )}
    </section>
  )
}
