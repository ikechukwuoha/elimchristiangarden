'use client'

import { useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  Check,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Users,
} from 'lucide-react'
import type { CommunityGroup, GroupKind } from '@/lib/community'
import { notifyCommunityUpdate } from '@/components/community/CommunityRefresh'
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
  const [details, setDetails] = useState('')
  const [audience, setAudience] = useState('')
  const [leader, setLeader] = useState('')
  const [meetingTime, setMeetingTime] = useState('')
  const [meetingLocation, setMeetingLocation] = useState('')
  const [editingId, setEditingId] = useState('')
  const [savedAction, setSavedAction] = useState<'added' | 'updated'>('added')
  const panelRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)
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
    setDetails('')
    setAudience('')
    setLeader('')
    setMeetingTime('')
    setMeetingLocation('')
    setEditingId('')
  }

  function editGroup(group: CommunityGroup) {
    if (busy || removing || refreshing) return
    setEditingId(group.id)
    setTitle(group.title)
    setKind(group.kind)
    setCategory(group.category)
    setDescription(group.description)
    setImage(group.image)
    setAlt(group.alt)
    setActivities(group.activities.join('\n'))
    setDetails(group.details || '')
    setAudience(group.audience || '')
    setLeader(group.leader || '')
    setMeetingTime(group.meetingTime || '')
    setMeetingLocation(group.meetingLocation || '')
    setError('')
    setAdded('')
    window.requestAnimationFrame(() => {
      titleRef.current?.focus({ preventScroll: true })
      panelRef.current?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
    })
  }

  async function addGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || refreshing || removing) return
    setBusy(true)
    setError('')
    setAdded('')
    try {
      const response = await fetch('/api/admin/community', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(editingId ? { id: editingId } : {}),
          title,
          kind,
          category,
          description,
          image,
          alt,
          details,
          audience,
          leader,
          meetingTime,
          meetingLocation,
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
      setGroups(result.groups)
      setAdded(result.group.id)
      setSavedAction(editingId ? 'updated' : 'added')
      resetForm()
      notifyCommunityUpdate()
      router.refresh()
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
      setGroups(result.groups)
      if (editingId === group.id) resetForm()
      notifyCommunityUpdate()
      router.refresh()
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
      <section ref={panelRef} className={styles.uploadPanel} aria-labelledby="add-heading" style={{ scrollMarginTop: 24 }}>
        <div className={styles.panelHeading}>
          <div>
            <span className={styles.eyebrow}>{editingId ? 'EDIT A GROUP' : 'ADD A GROUP'}</span>
            <h2 id="add-heading">
              {editingId ? <>Tell their <em>story.</em></> : <>A new place to <em>belong.</em></>}
            </h2>
          </div>
          <Users size={32} strokeWidth={1.2} aria-hidden="true" />
        </div>
        <form onSubmit={addGroup}>
          <fieldset
            disabled={busy || refreshing || Boolean(removing) || !cloudinaryReady}
            className={styles.uploadFields}
          >
            <legend className="sr-only">{editingId ? 'Edit' : 'Add'} a fellowship or unit</legend>
            <div className={styles.detailsFields}>
              <div>
                <label htmlFor="group-title">
                  Name <span>(required)</span>
                </label>
                <input
                  ref={titleRef}
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
                  Short description <span>(required)</span>
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
                <label htmlFor="group-details">About this group <span>(optional)</span></label>
                <textarea id="group-details" value={details} onChange={(event) => setDetails(event.target.value)} maxLength={6000} rows={8} placeholder="Tell the group's story, its purpose, and what members can expect. Separate paragraphs with a blank line." />
                <p className={styles.fieldHint}>The full description appears on this group’s details page. Up to 6,000 characters.</p>
              </div>
              <div>
                <label htmlFor="group-audience">Who it’s for <span>(optional)</span></label>
                <input id="group-audience" value={audience} onChange={(event) => setAudience(event.target.value)} maxLength={200} placeholder="Describe who can join this group" />
              </div>
              <div>
                <label htmlFor="group-leader">Group leader <span>(optional)</span></label>
                <input id="group-leader" value={leader} onChange={(event) => setLeader(event.target.value)} maxLength={120} placeholder="Name of the fellowship or unit leader" />
              </div>
              <div>
                <label htmlFor="group-meeting-time">Meeting time <span>(optional)</span></label>
                <input id="group-meeting-time" value={meetingTime} onChange={(event) => setMeetingTime(event.target.value)} maxLength={160} placeholder="When and how often the group meets" />
              </div>
              <div>
                <label htmlFor="group-meeting-location">Meeting location <span>(optional)</span></label>
                <input id="group-meeting-location" value={meetingLocation} onChange={(event) => setMeetingLocation(event.target.value)} maxLength={200} placeholder="Where the group gathers" />
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
                their own details page and gallery, and become available
                in the upload dropdown in the media room. You can edit these
                details at any time using the list below.
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
                ) : editingId ? (
                  <Save size={18} aria-hidden="true" />
                ) : (
                  <Plus size={18} aria-hidden="true" />
                )}
                {busy ? 'Saving…' : editingId ? 'Save changes' : 'Add group'}
              </button>
              {editingId && <button type="button" className={styles.textButton} onClick={() => { resetForm(); setError('') }}>Cancel editing</button>}
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
                <strong>{groups.find((g) => g.id === added)?.title} was {savedAction}.</strong>
                <span>
                  Its community details and gallery are available on the website.
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
                <button type="button" className={styles.textButton} onClick={() => editGroup(group)} disabled={busy || Boolean(removing) || refreshing || !cloudinaryReady} aria-label={`Edit ${group.title}`}>
                  <Pencil size={15} aria-hidden="true" /> Edit details
                </button>
                <a href={`/community/${group.id}`} target="_blank" rel="noopener noreferrer" className={styles.textButton} aria-label={`View details about ${group.title}`}>View details</a>
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
