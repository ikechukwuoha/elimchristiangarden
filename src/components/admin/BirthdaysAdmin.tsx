'use client'

import Image from 'next/image'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { CakeSlice, Check, ImagePlus, LoaderCircle, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { birthdayMonths, daysInBirthdayMonth, celebrationKind, type Birthday, type CelebrationKind } from '@/lib/birthdays'
import BirthdayCard from '@/components/birthdays/BirthdayCard'
import styles from './admin.module.css'
import birthdayStyles from './birthdays-admin.module.css'
import cardStyles from '@/components/birthdays/birthdays.module.css'
import Select from '@/components/ui/Select'

export default function BirthdaysAdmin({ initialBirthdays, initialError, cloudinaryReady }: {
  initialBirthdays: Birthday[]; initialError: string; cloudinaryReady: boolean
}) {
  const router = useRouter()
  const [birthdays, setBirthdays] = useState(initialBirthdays)
  const [editing, setEditing] = useState('')
  const [kind, setKind] = useState<CelebrationKind>('birthday')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [name, setName] = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [message, setMessage] = useState('')
  const [photo, setPhoto] = useState({ photoId: '', photoUrl: '' })
  const [file, setFile] = useState<File | null>(null)
  const [localPreview, setLocalPreview] = useState('')
  const [filter, setFilter] = useState('all')
  const [busy, setBusy] = useState('')
  const [error, setError] = useState(initialError)
  const [calendarUnavailable, setCalendarUnavailable] = useState(Boolean(initialError))
  const [success, setSuccess] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  const nameInput = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const previewButton = useRef<HTMLButtonElement>(null)
  const previewPanel = useRef<HTMLDivElement>(null)
  const anniversary = kind === 'anniversary'

  useEffect(() => {
    if (previewOpen) previewPanel.current?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true })
  }, [previewOpen])

  function closePreview() {
    setPreviewOpen(false)
    previewButton.current?.focus({ preventScroll: true })
  }

  useEffect(() => {
    return () => { if (localPreview) URL.revokeObjectURL(localPreview) }
  }, [localPreview])

  function resetForm() {
    setEditing(''); setKind('birthday'); setName(''); setMonth(''); setDay(''); setMessage(''); setPreviewOpen(false)
    setPhoto({ photoId: '', photoUrl: '' }); setFile(null); setLocalPreview('')
    if (fileInput.current) fileInput.current.value = ''
  }

  async function request(url: string, init?: RequestInit) {
    const response = await fetch(url, { ...init, cache: 'no-store', signal: AbortSignal.timeout(60000) })
    const result = await response.json()
    if (response.status === 401) router.refresh()
    if (!response.ok) throw new Error(result.error || 'The request could not be completed. Refresh the list before retrying.')
    return result
  }

  function choosePhoto(selected: File | undefined) {
    setError(''); setSuccess('')
    if (!selected) { setFile(null); setLocalPreview(''); return }
    const mimeByExtension: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }
    const extension = selected.name.split('.').pop()?.toLowerCase() ?? ''
    if (!mimeByExtension[extension] || mimeByExtension[extension] !== selected.type || selected.size === 0 || selected.size > 10 * 1024 * 1024) {
      setError('Choose a JPG, PNG, or WebP portrait smaller than 10 MB.')
      setFile(null)
      setLocalPreview('')
      if (fileInput.current) fileInput.current.value = ''
      return
    }
    setFile(selected)
    setLocalPreview(URL.createObjectURL(selected))
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setError(''); setSuccess('')
    try {
      let uploaded = photo
      if (file) {
        setBusy('Uploading portrait…')
        const ticket = await request('/api/admin/birthdays/photo', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, mime: file.type, bytes: file.size }),
        })
        const form = new FormData()
        form.set('file', file)
        form.set('api_key', ticket.apiKey)
        form.set('signature', ticket.signature)
        for (const [key, value] of Object.entries(ticket.params)) form.set(key, String(value))
        const response = await fetch(ticket.url, { method: 'POST', body: form, signal: AbortSignal.timeout(60000) })
        const result = await response.json()
        if (!response.ok || !result.secure_url || result.public_id !== ticket.params.public_id) throw new Error('The portrait upload could not be confirmed. Please try again.')
        uploaded = { photoId: result.public_id, photoUrl: result.secure_url }
        setPhoto(uploaded); setFile(null); setLocalPreview('')
        if (fileInput.current) fileInput.current.value = ''
      }
      if (!uploaded.photoUrl) throw new Error('Choose a portrait before publishing.')
      setBusy('Saving celebration…')
      const result = await request('/api/admin/birthdays', {
        method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editing, kind, name, month: Number(month), day: Number(day), message, ...uploaded }),
      })
      setBirthdays(result.birthdays)
      setCalendarUnavailable(false)
      setSuccess(`${name}’s ${kind} has been ${editing ? 'updated' : 'published'}. It will appear every ${birthdayMonths[Number(month) - 1]}.`)
      resetForm()
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'The celebration could not be saved. Refresh the list before retrying.') }
    finally { setBusy('') }
  }

  async function refresh() {
    if (busy) return
    setBusy('Refreshing…'); setError('')
    try { setBirthdays((await request('/api/admin/birthdays')).birthdays); setCalendarUnavailable(false) }
    catch (failure) { setCalendarUnavailable(true); setError(failure instanceof Error ? failure.message : 'The celebration list could not be loaded.') }
    finally { setBusy('') }
  }

  async function remove(birthday: Birthday) {
    if (busy || !window.confirm(`Remove ${birthday.name}’s ${celebrationKind(birthday)} from the celebration display?`)) return
    setBusy(`Removing ${birthday.name}…`); setError(''); setSuccess('')
    try {
      const result = await request('/api/admin/birthdays', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: birthday.id }) })
      setBirthdays(result.birthdays)
      setCalendarUnavailable(false)
      if (editing === birthday.id) resetForm()
      setSuccess(`${birthday.name}’s ${celebrationKind(birthday)} has been removed from the celebration display.`)
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'The celebration could not be removed.') }
    finally { setBusy('') }
  }

  function edit(birthday: Birthday) {
    if (busy) return
    setEditing(birthday.id); setKind(celebrationKind(birthday)); setName(birthday.name); setMonth(String(birthday.month)); setDay(String(birthday.day))
    setMessage(birthday.message); setPhoto({ photoId: birthday.photoId, photoUrl: birthday.photoUrl }); setFile(null); setLocalPreview('')
    setError(''); setSuccess('')
    if (fileInput.current) fileInput.current.value = ''
    formRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' })
    nameInput.current?.focus({ preventScroll: true })
  }

  const preview: Birthday = { id: editing || 'preview', kind, name: name.trim() || (anniversary ? 'Our anniversary celebrants' : 'Our birthday celebrant'), month: Number(month) || 1, day: Number(day) || 1, message, ...photo, photoUrl: localPreview || photo.photoUrl }
  const filtered = birthdays.filter((item) => filter === 'all' || item.month === Number(filter))
    .sort((a, b) => a.month - b.month || a.day - b.day || a.name.localeCompare(b.name))

  return <>
    {!cloudinaryReady && <p className={styles.notice} role="status">Connect Cloudinary in the site settings before publishing celebrations. You can still try the local preview below.</p>}
    {calendarUnavailable && <p className={styles.notice}>The saved calendar could not be loaded. This does not mean it is empty. Refresh the list once the Cloudinary connection is restored.</p>}
    <section className={styles.uploadPanel} aria-labelledby="birthday-add-heading">
      <div className={styles.panelHeading}>
        <div><span className={styles.eyebrow}>{editing ? 'EDIT A CELEBRATION' : 'A REASON TO CELEBRATE'}</span><h2 id="birthday-add-heading">Every milestone, <em>a blessing.</em></h2></div>
        <CakeSlice size={32} strokeWidth={1.2} aria-hidden="true" />
      </div>
      <div className={birthdayStyles.editor}>
        <form onSubmit={save} ref={formRef}>
          <fieldset disabled={Boolean(busy)} className={birthdayStyles.fields}>
            <legend className="sr-only">Celebration details</legend>
            <div><label htmlFor="celebration-kind">Celebration type</label><Select id="celebration-kind" value={kind} onChange={(value) => setKind(value as CelebrationKind)} menuLabel="A reason to celebrate" options={[
              { value: 'birthday', label: 'Birthday', description: 'Celebrate another year of life.' },
              { value: 'anniversary', label: 'Anniversary', description: 'Honour a beautiful milestone.' },
            ]} /></div>
            <div><label htmlFor="birthday-name">{anniversary ? 'Celebrant or couple’s names' : 'Celebrant’s name'} <span>(include Bro., Sis., or another title)</span></label><input ref={nameInput} id="birthday-name" value={name} onChange={(event) => setName(event.target.value)} placeholder={anniversary ? 'Bro. John & Sis. Jane Doe' : 'Bro. John Doe'} maxLength={80} required /></div>
            <div className={birthdayStyles.dateFields}>
              <div><label htmlFor="birthday-month">{anniversary ? 'Anniversary month' : 'Birthday month'}</label><Select id="birthday-month" value={month} onChange={(value) => { setMonth(value); if (Number(day) > daysInBirthdayMonth(Number(value))) setDay('') }} placeholder="Choose a month" menuLabel="Choose a month" required options={birthdayMonths.map((label, index) => ({ value: String(index + 1), label }))} /></div>
              <div><label htmlFor="birthday-day">Day</label><Select id="birthday-day" value={day} onChange={setDay} placeholder="Day" menuLabel="Choose a day" required disabled={!month} options={Array.from({ length: daysInBirthdayMonth(Number(month)) }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))} /></div>
            </div>
            <div className={birthdayStyles.photoField}><label htmlFor="birthday-photo">{anniversary ? 'Celebration photo' : 'Portrait photo'} <span>{editing ? '(choose a file to replace)' : '(required)'}</span></label><input ref={fileInput} id="birthday-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => choosePhoto(event.target.files?.[0])} required={!photo.photoUrl} /><p className={styles.uploadNote}>JPG, PNG, or WebP, up to 10 MB. {anniversary ? 'A photo with both faces near the centre works well for couples.' : 'A clear portrait with the face near the centre works best.'}</p></div>
            <div><label htmlFor="birthday-message">{anniversary ? 'Anniversary blessing' : 'Birthday blessing'} <span>(optional)</span></label><textarea id="birthday-message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={240} placeholder={`Leave blank to use our family ${kind} blessing.`} rows={3} /></div>
            <p className={styles.uploadNote}>Add once and celebrate every year. Only the month and day are needed. The homepage automatically shows this month’s celebrants; future months stay scheduled.</p>
            <div className={birthdayStyles.actions}><button type="submit" className={styles.primaryButton} disabled={!cloudinaryReady}>{busy ? <LoaderCircle size={17} className={styles.spinning} aria-hidden="true" /> : editing ? <Check size={17} aria-hidden="true" /> : <Plus size={17} aria-hidden="true" />}{busy || (editing ? 'Save changes' : `Publish ${kind}`)}</button>{editing && <button type="button" className={styles.secondaryButton} onClick={resetForm}>Cancel edit</button>}</div>
          </fieldset>
        </form>
        <div className={birthdayStyles.preview}>
          <span className={styles.eyebrow}>YOUR HOMEPAGE PREVIEW</span>
          {preview.photoUrl ? <BirthdayCard birthdays={[preview]} index={0} monthLabel={birthdayMonths[preview.month - 1]} paused onNext={() => {}} onPrevious={() => {}} onPause={() => {}} /> : <div className={birthdayStyles.previewEmpty}><ImagePlus size={34} strokeWidth={1.2} aria-hidden="true" /><h3>A face to celebrate.</h3><p>Choose a portrait to see how your birthday card will look.</p></div>}
          <p className={styles.uploadNote}>A gentle, sliding card in the homepage corner. Visitors can pause, close, and reopen it.</p>
          <button ref={previewButton} type="button" className={styles.secondaryButton} disabled={!preview.photoUrl || Boolean(busy)} onClick={() => setPreviewOpen(true)}>Preview popup</button>
          <p className={styles.uploadNote}>The preview stays on this device and works before publishing. The public homepage shows a popup only after a celebration for the current month is published.</p>
        </div>
      </div>
      {error && <p className={styles.error} role="alert">{error}</p>}
      {success && <p className={styles.success} role="status"><Check size={18} aria-hidden="true" />{success}</p>}
      {busy && <p className={styles.uploadNote} role="status" aria-live="polite">{busy}</p>}
    </section>
    <section className={styles.library} aria-labelledby="birthday-library-heading">
      <div className={styles.libraryHeading}><div><span className={styles.eyebrow}>OUR FAMILY CALENDAR</span><h2 id="birthday-library-heading">Family <em>celebrations.</em></h2></div><button type="button" className={styles.secondaryButton} onClick={refresh} disabled={Boolean(busy) || !cloudinaryReady}><RefreshCw size={15} aria-hidden="true" /> Refresh list</button></div>
      <div className={birthdayStyles.filter}><label htmlFor="birthday-filter">Show celebrations</label><Select id="birthday-filter" value={filter} onChange={setFilter} menuLabel="Our family calendar" options={[
        { value: 'all', label: `All months (${birthdays.length})` },
        ...birthdayMonths.map((label, index) => ({ value: String(index + 1), label: `${label} (${birthdays.filter((item) => item.month === index + 1).length})` })),
      ]} /></div>
      {!filtered.length ? <div className={styles.empty}><CakeSlice size={30} strokeWidth={1.2} aria-hidden="true" /><h3>{calendarUnavailable ? 'Calendar could not be loaded.' : birthdays.length ? 'No celebrations in this month yet.' : 'Make someone’s month.'}</h3><p>{calendarUnavailable ? 'Restore the Cloudinary connection and refresh the list to see saved celebrations.' : 'Add a name, birthday or anniversary date, and photo above to start celebrating our church family.'}</p></div> : <div className={styles.groupList}>{filtered.map((birthday) => <article key={birthday.id} className={styles.groupRow}>
        <Image src={birthday.photoUrl} alt={birthday.name} width={52} height={62} unoptimized className={birthdayStyles.thumbnail} />
        <div className={styles.groupRowCopy}><h3>{birthday.name}</h3><p>{celebrationKind(birthday) === 'anniversary' ? 'Anniversary' : 'Birthday'} · {birthday.day} {birthdayMonths[birthday.month - 1]} · Celebrated every year</p></div>
        <button type="button" className={styles.textButton} disabled={Boolean(busy)} onClick={() => edit(birthday)} aria-label={`Edit ${birthday.name}`}><Pencil size={15} aria-hidden="true" /> Edit</button>
        <button type="button" className={styles.removeButton} disabled={Boolean(busy)} onClick={() => remove(birthday)} aria-label={`Remove ${birthday.name}`}><Trash2 size={15} aria-hidden="true" /> Remove</button>
      </article>)}</div>}
    </section>
    {previewOpen && preview.photoUrl && <aside className={cardStyles.widget} aria-label="Celebration popup preview">
      <div ref={previewPanel} className={cardStyles.popup} onKeyDown={(event) => { if (event.key === 'Escape') { event.preventDefault(); closePreview() } }}>
        <span className={birthdayStyles.previewLabel}>PREVIEW ONLY · NOT PUBLISHED</span>
        <BirthdayCard birthdays={[preview]} index={0} monthLabel={birthdayMonths[preview.month - 1]} paused onNext={() => {}} onPrevious={() => {}} onPause={() => {}} onClose={closePreview} />
      </div>
    </aside>}
  </>
}
