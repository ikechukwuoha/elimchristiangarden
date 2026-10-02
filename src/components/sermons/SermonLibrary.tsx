'use client'

import { useSearchParams } from 'next/navigation'
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import type { Sermon } from '@/lib/messages'
import MessageCard from './MessageCard'
import useSavedMessages from './useSavedMessages'
import styles from './sermons.module.css'

const pageSize = 6
const sortOptions = ['newest', 'oldest', 'title-asc', 'title-desc']

export default function SermonLibrary({ sermons, unavailable = false }: { sermons: Sermon[]; unavailable?: boolean }) {
  const params = useSearchParams() ?? new URLSearchParams()
  const { savedIds } = useSavedMessages()
  const query = params.get('q') || ''
  const series = params.get('series') || ''
  const speaker = params.get('speaker') || ''
  const filter = params.get('filter') === 'saved'
    ? params.get('filter')!
    : 'all'
  const sort = sortOptions.includes(params.get('sort') || '')
    ? params.get('sort')!
    : 'newest'
  const seriesOptions = Array.from(
    new Set(sermons.map((sermon) => sermon.series).filter(Boolean)),
  ).sort()
  const speakerOptions = Array.from(
    new Set(sermons.map((sermon) => sermon.preacher.name).filter(Boolean)),
  ).sort()
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const filtered = sermons
    .filter((sermon) => {
      const searchable = [
        sermon.title,
        sermon.description,
        sermon.series,
        sermon.scripture,
        sermon.preacher.name,
        ...sermon.tags,
      ]
        .join(' ')
        .toLowerCase()
      return (
        words.every((word) => searchable.includes(word)) &&
        (!series || sermon.series === series) &&
        (!speaker || sermon.preacher.name === speaker) &&
        (filter !== 'saved' || savedIds.includes(sermon.id))
      )
    })
    .sort((a, b) =>
      sort === 'title-asc'
        ? a.title.localeCompare(b.title)
        : sort === 'title-desc'
          ? b.title.localeCompare(a.title)
          : sort === 'oldest'
            ? a.date.localeCompare(b.date) || a.publishedAt.localeCompare(b.publishedAt)
            : b.date.localeCompare(a.date) || b.publishedAt.localeCompare(a.publishedAt),
    )
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const requestedPage = Number(params.get('page'))
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0
      ? Math.min(requestedPage, totalPages)
      : 1
  const start = (page - 1) * pageSize
  const current = filtered.slice(start, start + pageSize)
  const hasFilters = Boolean(query || series || speaker || filter !== 'all')

  function update(values: Record<string, string>, paginate = false) {
    const next = new URLSearchParams(params.toString())
    if (!paginate) next.delete('page')
    for (const [key, value] of Object.entries(values)) {
      if (
        value &&
        value !== 'all' &&
        !(key === 'sort' && value === 'newest') &&
        !(key === 'page' && value === '1')
      )
        next.set(key, value)
      else next.delete(key)
    }
    const search = next.toString()
    window.history.replaceState(
      null,
      '',
      `/sermons${search ? `?${search}` : ''}#message-library`,
    )
    if (paginate)
      document
        .getElementById('message-library')
        ?.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
            .matches
            ? 'instant'
            : 'smooth',
          block: 'start',
        })
  }

  function reset() {
    window.history.replaceState(null, '', '/sermons#message-library')
  }

  if (!sermons.length) return (
    <div className={styles.emptyState} role="status">
      <h2>{unavailable ? 'Messages could not be loaded' : 'No messages published yet'}</h2>
      <p>{unavailable ? 'Please try again in a moment.' : 'Uploaded audio and published YouTube messages will appear here.'}</p>
    </div>
  )

  return (
    <div className={styles.library}>
      {unavailable && (
        <p className={styles.libraryNotice} role="status">
          Some recordings could not be loaded. Available messages are shown below; please try again later for the rest.
        </p>
      )}
      <div className={styles.libraryHeading}>
        <div>
          <span className={styles.eyebrow}>
            <span /> THE MESSAGE LIBRARY
          </span>
          <h2>
            A message for <em>your season.</em>
          </h2>
        </div>
        <p>
          Search a topic, explore a series, or revisit a message that stayed
          with you.
        </p>
      </div>
      <div className={styles.searchRow}>
        <div className={styles.searchField}>
          <Search size={19} aria-hidden="true" />
          <input
            aria-label="Search messages"
            type="search"
            placeholder="Search a message, speaker, or Scripture…"
            value={query}
            onChange={(event) => update({ q: event.target.value })}
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => update({ q: '' })}
            >
              <X size={17} />
            </button>
          )}
        </div>
        <div
          className={styles.libraryTabs}
          role="group"
          aria-label="Message collection"
        >
          {[
            { value: 'all', label: 'All messages' },
            { value: 'saved', label: 'Saved' },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={filter === item.value}
              onClick={() => update({ filter: item.value })}
            >
              {item.value === 'saved' && (
                <Bookmark size={14} aria-hidden="true" />
              )}
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.filterRow}>
        <span className={styles.filterLabel}>
          <SlidersHorizontal size={16} aria-hidden="true" />
          Refine by
        </span>
        {seriesOptions.length > 0 && <label>
          <span className="sr-only">Series</span>
          <select
            aria-label="Series"
            value={series}
            onChange={(event) => update({ series: event.target.value })}
          >
            <option value="">All series</option>
            {seriesOptions.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>}
        {speakerOptions.length > 0 && <label>
          <span className="sr-only">Speaker</span>
          <select
            aria-label="Speaker"
            value={speaker}
            onChange={(event) => update({ speaker: event.target.value })}
          >
            <option value="">All speakers</option>
            {speakerOptions.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>}
        <label className={styles.sortLabel}>
          <span>Sort by</span>
          <select
            aria-label="Sort messages"
            value={sort}
            onChange={(event) => update({ sort: event.target.value })}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="title-asc">Title: A–Z</option>
            <option value="title-desc">Title: Z–A</option>
          </select>
        </label>
      </div>
      <div className={styles.resultsRow}>
        <p role="status" aria-live="polite">
          {filtered.length ? (
            <>
              Showing{' '}
              <strong>
                {start + 1}–{Math.min(start + pageSize, filtered.length)}
              </strong>{' '}
              of <strong>{filtered.length}</strong> messages
            </>
          ) : (
            'No messages found'
          )}
          {filter === 'saved' && <span> · Saved on this device</span>}
        </p>
        {hasFilters && (
          <button type="button" onClick={reset}>
            Clear filters <X size={13} aria-hidden="true" />
          </button>
        )}
      </div>
      {current.length ? (
        <div className={styles.messageGrid}>
          {current.map((sermon) => (
            <MessageCard key={sermon.id} sermon={sermon} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          {filter === 'saved' ? (
            <Bookmark size={32} strokeWidth={1.3} aria-hidden="true" />
          ) : (
            <Search size={32} strokeWidth={1.3} aria-hidden="true" />
          )}
          <h3>
            {filter === 'saved' && !savedIds.length
              ? 'Keep a little encouragement close.'
              : 'Let’s try a different search.'}
          </h3>
          <p>
            {filter === 'saved' && !savedIds.length
              ? 'Open a message and choose “Save message” to find it here next time on this device.'
              : 'Try another word, speaker, or series. There’s more to explore in the library.'}
          </p>
          <button type="button" className={styles.greenButton} onClick={reset}>
            Browse all messages
          </button>
        </div>
      )}
      {totalPages > 1 && (
        <nav className={styles.pagination} aria-label="Message pages">
          <button
            type="button"
            aria-label="Previous page"
            disabled={page === 1}
            onClick={() => update({ page: String(page - 1) }, true)}
          >
            <ChevronLeft size={16} aria-hidden="true" />
            <span>Previous</span>
          </button>
          <div>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (value) => (
                <button
                  type="button"
                  key={value}
                  aria-label={`Page ${value}`}
                  aria-current={page === value ? 'page' : undefined}
                  onClick={() => update({ page: String(value) }, true)}
                >
                  {value}
                </button>
              ),
            )}
          </div>
          <button
            type="button"
            aria-label="Next page"
            disabled={page === totalPages}
            onClick={() => update({ page: String(page + 1) }, true)}
          >
            <span>Next</span>
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </nav>
      )}
    </div>
  )
}
