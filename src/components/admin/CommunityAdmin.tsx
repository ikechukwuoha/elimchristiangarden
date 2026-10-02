'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  Check,
  LoaderCircle,
  Plus,
  RefreshCw,
  Trash2,
  Users,
} from 'lucide-react'
import type { CommunityGroup, GroupKind } from '@/lib/community'
import Select from './Select'
import styles from './admin.module.css'

export default function CommunityAdmin({
  initialGroups,
  cloudinaryReady,
}: {
  initialGroups: CommunityGroup[]
  cloudinaryReady: boolean
}) {
  const router = useRouter()
  const [groups, setGroups] = useState(initialGroups)
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState<GroupKind>('fellowship')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [alt, setAlt] = useState('')
  const [activities, setActivities] = useState('')
  const [busy, setBusy] = useState(false)
  const [removing, setRemoving] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [added, setAdded] = useState('')
  const saved = groups.some((group) => group.id === added)

  function resetForm() {
    setTitle('')
    setKind('fellowship')
    setCategory('')
    setDescription('')
    setImage('')
    setAlt('')
    setActivities('')
  }

  async function addGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || refreshing) return
    setBusy(true)
    setError('')
    setAdded('')
    try {
      const response = await fetch('/api/admin/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          kind,
          category,
          description,
          image,
          alt,
          activities: activities
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean),
        }),
      })
      const result = await response.json()
      if (response.status === 401) router.refresh()
      if (!response.ok)
        throw new Error(result.error || 'This group could not be saved.')
      setGroups((previous) => [...previous, result.group])
      setAdded(result.group.id)
      resetForm()
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'This group could not be saved.',
      )
    } finally {
      setBusy(false)
    }
  }

  async function removeGroup(group: CommunityGroup) {
    if (removing || busy || refreshing) return
    if (
      !window.confirm(
        `Remove ${group.title}? Its section on the community page will be taken down. Photos already uploaded to its gallery are kept in Cloudinary.`,
      )
    )
      return
    setRemoving(group.id)
    setError('')
    try {
      const response = await fetch('/api/admin/community', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: group.id }),
      })
      const result = await response.json()
      if (response.status === 401) router.refresh()
      if (!response.ok)
        throw new Error(result.error || 'This group could not be removed.')
      setGroups((previous) =>
        previous.filter((item) => item.id !== group.id),
      )
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'This group could not be removed.',
      )
    } finally {
      setRemoving('')
    }
  }

  async function refreshGroups() {
    if (busy || removing || refreshing) return
    setRefreshing(true)
    setError('')
    try {
      const response = await fetch('/api/admin/community', { cache: 'no-store' })
      const result = await response.json()
      if (response.status === 401) router.refresh()
      if (!response.ok)
        throw new Error(result.error || 'The group list could not be loaded.')
      setGroups(result.groups)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'The group list could not be loaded.',
      )
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <>
      {!cloudinaryReady && (
        <p className={styles.notice} role="status">
          Cloudinary hasn’t been connected yet. Ask the site administrator to
          add the Cloudinary credentials before making changes.
        </p>
      )}
      <section className={styles.uploadPanel} aria-labelledby="add-heading">
        <div className={styles.panelHeading}>
          <div>
            <span className={styles.eyebrow}>ADD A GROUP</span>
            <h2 id="add-heading">
              A new place to <em>belong.</em>
            </h2>
          </div>
          <Users size={32} strokeWidth={1.2} aria-hidden="true" />
        </div>
        <form onSubmit={addGroup}>
          <fieldset
            disabled={busy || refreshing || !cloudinaryReady}
            className={styles.uploadFields}
          >
            <legend className="sr-only">Add a fellowship or unit</legend>
            <div className={styles.detailsFields}>
              <div>
                <label htmlFor="group-title">
                  Name <span>(required)</span>
                </label>
                <input
                  id="group-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                  maxLength={80}
                  placeholder="Youths Fellowship"
                />
              </div>
              <div>
                <label htmlFor="group-kind">
                  Type <span>(required)</span>
                </label>
                <Select
                  id="group-kind"
                  value={kind}
                  onChange={(next) => setKind(next as GroupKind)}
                  options={[
                    { value: 'fellowship', label: 'Fellowship' },
                    { value: 'unit', label: 'Unit' },
                  ]}
                />
                <p className={styles.fieldHint}>
                  Fellowships gather people in a season of life; units are
                  serving teams.
                </p>
              </div>
              <div>
                <label htmlFor="group-category">
                  Tagline <span>(optional)</span>
                </label>
                <input
                  id="group-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  maxLength={60}
                  placeholder="FAITH & BROTHERHOOD"
                />
              </div>
              <div>
                <label htmlFor="group-image">
                  Photo <span>(optional)</span>
                </label>
                <input
                  id="group-image"
                  value={image}
                  onChange={(event) => setImage(event.target.value)}
                  maxLength={500}
                  placeholder="Paste an uploaded photo link, or leave empty"
                />
                <p className={styles.fieldHint}>
                  Copy a photo link from the media room, or use one from this
                  site (starts with /images/).
                </p>
              </div>
              <div>
                <label htmlFor="group-alt">
                  Photo description <span>(optional)</span>
                </label>
                <input
                  id="group-alt"
                  value={alt}
                  onChange={(event) => setAlt(event.target.value)}
                  maxLength={200}
                  placeholder="Members of the Youths Fellowship together"
                />
              </div>
            </div>
            <div className={styles.detailsFields}>
              <div>
                <label htmlFor="group-description">
                  Description <span>(required)</span>
                </label>
                <textarea
                  id="group-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  required
                  maxLength={500}
                  rows={4}
                  placeholder="Tell visitors who this group is for and what joining looks like."
                />
              </div>
              <div>
                <label htmlFor="group-activities">
                  Activities <span>(optional — one per line)</span>
                </label>
                <textarea
                  id="group-activities"
                  value={activities}
                  onChange={(event) => setActivities(event.target.value)}
                  rows={5}
                  placeholder={'Monthly prayer breakfast\nBible study — 2nd Saturday'}
                />
                <p className={styles.fieldHint}>
                  Up to 12 activities. Each appears on the community page.
                </p>
              </div>
              <p className={styles.uploadNote}>
                New groups appear on the community page straight away, get
                their own gallery at /gallery/&lt;name&gt;, and become available
                in the upload dropdown in the media room.
              </p>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={busy || !title.trim() || !description.trim()}
              >
                {busy ? (
                  <LoaderCircle
                    size={18}
                    className={styles.spinning}
                    aria-hidden="true"
                  />
                ) : (
                  <Plus size={18} aria-hidden="true" />
                )}
                {busy ? 'Saving…' : 'Add group'}
              </button>
            </div>
          </fieldset>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          {saved && (
            <div className={styles.success} role="status">
              <Check size={21} aria-hidden="true" />
              <div>
                <strong>{groups.find((g) => g.id === added)?.title} was added.</strong>
                <span>
                  It now appears on the community page and in the media room’s
                  upload dropdown.
                </span>
              </div>
            </div>
          )}
        </form>
      </section>

      <section className={styles.library} aria-labelledby="groups-heading">
        <div className={styles.libraryHeading}>
          <div>
            <span className={styles.eyebrow}>CURRENT GROUPS</span>
            <h2 id="groups-heading">
              The church <em>family.</em>
            </h2>
          </div>
          <button
            type="button"
            className={styles.textButton}
            onClick={refreshGroups}
            disabled={busy || Boolean(removing) || refreshing || !cloudinaryReady}
          >
            <RefreshCw
              size={16}
              className={refreshing ? styles.spinning : undefined}
              aria-hidden="true"
            />
            {refreshing ? 'Refreshing…' : 'Refresh list'}
          </button>
        </div>
        {groups.length === 0 ? (
          <div className={styles.empty}>
            <Users size={32} strokeWidth={1.2} aria-hidden="true" />
            <h3>No groups yet.</h3>
            <p>Add your first fellowship or unit above.</p>
          </div>
        ) : (
          <div className={styles.groupList}>
            {groups.map((group) => (
              <article className={styles.groupRow} key={group.id}>
                <span className={styles.kindBadge}>
                  {group.kind === 'fellowship' ? 'FELLOWSHIP' : 'UNIT'}
                </span>
                <div className={styles.groupRowCopy}>
                  <h3>{group.title}</h3>
                  <p>
                    {group.category}
                    {group.activities.length > 0
                      ? ` · ${group.activities.length} ${group.activities.length === 1 ? 'activity' : 'activities'}`
                      : ''}
                  </p>
                </div>
                <a
                  href={`/gallery/${group.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.textButton}
                >
                  View gallery
                </a>
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => removeGroup(group)}
                  disabled={Boolean(removing) || busy || refreshing}
                  aria-label={`Remove ${group.title}`}
                >
                  {removing === group.id ? (
                    <LoaderCircle
                      size={16}
                      className={styles.spinning}
                      aria-hidden="true"
                    />
                  ) : (
                    <Trash2 size={16} aria-hidden="true" />
                  )}
                  Remove
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
