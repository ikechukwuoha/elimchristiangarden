'use client'

import Image from 'next/image'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowUpRight,
  AudioLines,
  Check,
  Copy,
  FileText,
  Film,
  ImageIcon,
  LoaderCircle,
  LogOut,
  RefreshCw,
  UploadCloud,
  X,
} from 'lucide-react'
import {
  fileError,
  formatBytes,
  formatMonth,
  mediaKinds,
  mediaRules,
  type MediaAsset,
  type MediaKind,
  type MediaPage,
} from '@/lib/media'
import styles from './admin.module.css'
import Select from './Select'
import MessageMetadataFields, { emptyMessageDetails } from './MessageMetadataFields'

export type GroupOption = { id: string; label: string }

const icons = { image: ImageIcon, video: Film, audio: AudioLines, bulletin: FileText }
type UploadTicket = {
  url: string
  cloudName: string
  apiKey: string
  signature: string
  params: Record<string, string>
}
type UploadedFile = {
  asset_id: string
  public_id: string
  secure_url: string
  resource_type: string
  format?: string
  bytes: number
  created_at: string
}

function uploadFile(
  file: File,
  ticket: UploadTicket,
  onProgress: (progress: number) => void,
): Promise<UploadedFile> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    const body = new FormData()
    for (const [key, value] of Object.entries(ticket.params))
      body.append(key, value)
    body.append('api_key', ticket.apiKey)
    body.append('signature', ticket.signature)
    body.append('file', file)
    request.open('POST', ticket.url)
    request.timeout = 10 * 60 * 1000
    request.upload.onprogress = (event) => {
      if (event.lengthComputable)
        onProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)))
    }
    request.onerror = () =>
      reject(
        new Error(
          'The upload connection was interrupted. Check the library before retrying.',
        ),
      )
    request.ontimeout = () =>
      reject(
        new Error('The upload timed out. Check the library before retrying.'),
      )
    request.onload = () => {
      try {
        const result = JSON.parse(request.responseText)
        if (request.status < 200 || request.status >= 300) {
          throw new Error(
            result.error?.message ||
              'Cloudinary could not upload this file. Please try again.',
          )
        }
        const url = new URL(result.secure_url)
        if (
          result.public_id !== ticket.params.public_id ||
          url.protocol !== 'https:' ||
          url.hostname !== 'res.cloudinary.com' ||
          !url.pathname.startsWith(`/${ticket.cloudName}/`)
        ) {
          throw new Error(
            'The upload response could not be verified. Check the library before retrying.',
          )
        }
        resolve(result)
      } catch (error) {
        reject(
          error instanceof Error
            ? error
            : new Error('The upload returned an unexpected response.'),
        )
      }
    }
    request.send(body)
  })
}

export default function MediaAdmin({
  cloudinaryReady,
  groups,
}: {
  cloudinaryReady: boolean
  groups: GroupOption[]
}) {
  const router = useRouter()
  const [kind, setKind] = useState<MediaKind>('image')
  const [selection, setSelection] = useState<{
    file: File
    preview: string
  } | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [group, setGroup] = useState('')
  const [month, setMonth] = useState('')
  const [theme, setTheme] = useState('')
  const [quote, setQuote] = useState('')
  const [scripture, setScripture] = useState('')
  const [audioDetails, setAudioDetails] = useState(emptyMessageDetails)
  const [publicationRefreshFailed, setPublicationRefreshFailed] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<MediaAsset | null>(null)
  const [libraryKind, setLibraryKind] = useState<MediaKind>('image')
  const [library, setLibrary] = useState<MediaPage>({ assets: [] })
  const [loading, setLoading] = useState(cloudinaryReady)
  const [libraryError, setLibraryError] = useState('')
  const [reload, setReload] = useState(0)
  const [copied, setCopied] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef('')
  const libraryRequest = useRef(0)
  const rule = mediaRules[kind]
  const Icon = icons[kind]
  const groupLabelText = (id: string) =>
    groups.find((group) => group.id === id)?.label ?? id

  useEffect(
    () => () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    },
    [],
  )

  useEffect(() => {
    if (!busy) return
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [busy])

  useEffect(() => {
    if (!cloudinaryReady) return
    const controller = new AbortController()
    const requestId = ++libraryRequest.current
    async function load() {
      try {
        const response = await fetch(`/api/admin/media?kind=${libraryKind}`, {
          signal: controller.signal,
          cache: 'no-store',
        })
        const result = await response.json()
        if (response.status === 401) router.refresh()
        if (!response.ok)
          throw new Error(result.error || 'Could not load the library.')
        if (requestId === libraryRequest.current) setLibrary(result)
      } catch (error) {
        if (!controller.signal.aborted && requestId === libraryRequest.current)
          setLibraryError(
            error instanceof Error
              ? error.message
              : 'Could not load the library.',
          )
      } finally {
        if (!controller.signal.aborted && requestId === libraryRequest.current)
          setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [libraryKind, reload, cloudinaryReady, router])

  function refreshLibrary(nextKind = libraryKind) {
    ++libraryRequest.current
    setLibraryKind(nextKind)
    setLibraryError('')
    setLoading(true)
    setLibrary({ assets: [] })
    setReload((value) => value + 1)
  }

  async function loadMore() {
    if (!library.nextCursor || loading) return
    setLoading(true)
    setLibraryError('')
    const requestId = libraryRequest.current
    try {
      const response = await fetch(
        `/api/admin/media?kind=${libraryKind}&cursor=${encodeURIComponent(library.nextCursor)}`,
        { cache: 'no-store' },
      )
      const result: MediaPage & { error?: string } = await response.json()
      if (response.status === 401) router.refresh()
      if (!response.ok)
        throw new Error(result.error || 'Could not load more files.')
      if (requestId === libraryRequest.current)
        setLibrary((previous) => ({
          assets: [
            ...previous.assets,
            ...result.assets.filter(
              (asset) => !previous.assets.some((item) => item.id === asset.id),
            ),
          ],
          nextCursor: result.nextCursor,
        }))
    } catch (error) {
      if (requestId === libraryRequest.current)
        setLibraryError(
          error instanceof Error ? error.message : 'Could not load more files.',
        )
    } finally {
      if (requestId === libraryRequest.current) setLoading(false)
    }
  }

  function clearFile() {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    previewRef.current = ''
    setSelection(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  function chooseFile(files: FileList | null) {
    const file = files?.[0]
    const count = files?.length ?? 0
    setError('')
    setSuccess(null)
    setPublicationRefreshFailed(false)
    clearFile()
    if (!file) return
    if (count !== 1) {
      setError('Choose one file at a time.')
      return
    }
    const invalid = fileError(kind, file)
    if (invalid) {
      setError(invalid)
      return
    }
    const preview =
      kind === 'bulletin' || kind === 'audio' ? '' : URL.createObjectURL(file)
    previewRef.current = preview
    setSelection({ file, preview })
    if (!title)
      setTitle(
        file.name
          .replace(/\.[^.]+$/, '')
          .replace(/[_-]+/g, ' ')
          .slice(0, 120),
      )
  }

  function changeKind(next: MediaKind) {
    if (busy || next === kind) return
    clearFile()
    setKind(next)
    setTitle('')
    setDescription('')
    setGroup('')
    setMonth('')
    setTheme('')
    setQuote('')
    setScripture('')
    setAudioDetails(emptyMessageDetails)
    setPublicationRefreshFailed(false)
    setError('')
    setSuccess(null)
  }

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selection || busy) return
    setBusy(true)
    setError('')
    setSuccess(null)
    setPublicationRefreshFailed(false)
    setProgress(0)
    try {
      const file = selection.file
      const response = await fetch('/api/admin/uploads/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          group,
          title,
          description,
          month,
          theme,
          quote,
          scripture,
          ...(kind === 'audio' ? audioDetails : {}),
          filename: file.name,
          contentType: file.type,
          bytes: file.size,
        }),
      })
      const ticket = await response.json()
      if (response.status === 401) router.refresh()
      if (!response.ok)
        throw new Error(ticket.error || 'Could not authorise this upload.')
      const result = await uploadFile(file, ticket, setProgress)
      setProgress(100)
      setSuccess({
        id: result.asset_id,
        publicId: result.public_id,
        url: result.secure_url,
        kind,
        group: kind === 'image' || kind === 'video' ? group : '',
        title: title.trim(),
        description: description.trim(),
        month: kind === 'bulletin' ? month : '',
        format: result.format || 'pdf',
        bytes: result.bytes,
        createdAt: result.created_at,
      })
      clearFile()
      setTitle('')
      setDescription('')
      setGroup('')
      setMonth('')
      setTheme('')
      setQuote('')
      setScripture('')
      setAudioDetails(emptyMessageDetails)
      refreshLibrary(kind)
      try {
        const refresh = await fetch(
          kind === 'bulletin' ? '/api/admin/bulletins/refresh' : '/api/admin/media/refresh',
          {
            method: 'POST',
            signal: AbortSignal.timeout(20000),
          },
        )
        setPublicationRefreshFailed(!refresh.ok)
        if (refresh.ok) router.refresh()
      } catch {
        // The file is saved; don't invite a duplicate upload if refresh fails.
        setPublicationRefreshFailed(true)
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Upload failed. Please try again.',
      )
    } finally {
      setBusy(false)
    }
  }

  async function signOut() {
    setSigningOut(true)
    setError('')
    try {
      const response = await fetch('/api/admin/session', { method: 'DELETE' })
      if (!response.ok) throw new Error('Could not sign out. Please try again.')
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not sign out.')
      setSigningOut(false)
    }
  }

  async function copyLink(asset: MediaAsset) {
    try {
      await navigator.clipboard.writeText(asset.url)
      setCopied(asset.id)
    } catch {
      setLibraryError(
        'Your browser couldn’t copy the link. Open the file and copy its address instead.',
      )
    }
  }

  return (
    <>
      <div className={styles.toolbar}>
        <span className={styles.accessBadge}>
          <Check size={14} aria-hidden="true" /> Admin access
        </span>
        <button
          type="button"
          className={styles.textButton}
          onClick={signOut}
          disabled={busy || signingOut}
        >
          <LogOut size={16} aria-hidden="true" />{' '}
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
      {!cloudinaryReady && (
        <p className={styles.notice} role="status">
          Cloudinary hasn’t been connected yet. Ask the site administrator to
          add the Cloudinary credentials before uploading.
        </p>
      )}
      <section className={styles.uploadPanel} aria-labelledby="upload-heading">
        <div className={styles.panelHeading}>
          <div>
            <span className={styles.eyebrow}>ADD SOMETHING NEW</span>
            <h2 id="upload-heading">
              Every moment has <em>a story.</em>
            </h2>
          </div>
          <UploadCloud size={32} strokeWidth={1.2} aria-hidden="true" />
        </div>
        <div
          className={styles.kindPicker}
          role="group"
          aria-label="Upload type"
        >
          {mediaKinds.map((item) => {
            const ItemIcon = icons[item]
            return (
              <button
                key={item}
                type="button"
                aria-pressed={kind === item}
                onClick={() => changeKind(item)}
                disabled={busy}
              >
                <ItemIcon size={18} aria-hidden="true" />
                {mediaRules[item].label}
              </button>
            )
          })}
        </div>
        <form onSubmit={upload}>
          <fieldset
            disabled={busy || !cloudinaryReady || signingOut}
            className={styles.uploadFields}
          >
            <legend className="sr-only">
              Upload {rule.label.toLowerCase()}
            </legend>
            <div>
              <div
                className={`${styles.dropzone} ${dragging ? styles.dragging : ''}`}
                onDragOver={(event) => {
                  event.preventDefault()
                  if (!busy && cloudinaryReady) setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault()
                  setDragging(false)
                  if (!busy && cloudinaryReady)
                    chooseFile(event.dataTransfer.files)
                }}
              >
                {selection ? (
                  <div className={styles.selectedFile}>
                    <div className={styles.preview}>
                      {kind === 'image' ? (
                        <Image
                          src={selection.preview}
                          alt="Selected image preview"
                          fill
                          unoptimized
                          sizes="(max-width: 760px) 90vw, 40vw"
                        />
                      ) : kind === 'video' ? (
                        <video
                          src={selection.preview}
                          controls
                          preload="metadata"
                          aria-label="Selected video preview"
                        />
                      ) : kind === 'audio' ? (
                        <AudioLines
                          size={62}
                          strokeWidth={1}
                          aria-hidden="true"
                        />
                      ) : (
                        <FileText
                          size={62}
                          strokeWidth={1}
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <div className={styles.fileDetails}>
                      <span>
                        {selection.file.name}
                        <small>{formatBytes(selection.file.size)}</small>
                      </span>
                      <button
                        type="button"
                        aria-label="Remove selected file"
                        onClick={clearFile}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label htmlFor="media-file" className={styles.dropLabel}>
                    <span className={styles.iconCircle}>
                      <Icon size={30} strokeWidth={1.3} aria-hidden="true" />
                    </span>
                    <strong>
                      Make room for a new{' '}
                      {kind === 'bulletin'
                        ? 'bulletin'
                        : kind === 'image'
                          ? 'photograph'
                          : kind === 'audio'
                            ? 'recording'
                            : 'video'}
                      .
                    </strong>
                    <span>
                      Drag a file here, or <u>choose a file</u>
                    </span>
                    <small>{rule.hint}</small>
                  </label>
                )}
              </div>
              <input
                ref={inputRef}
                className={styles.fileInput}
                id="media-file"
                type="file"
                accept={rule.accept}
                onChange={(event) => chooseFile(event.target.files)}
                aria-describedby="file-hint"
              />
              <p className={styles.fieldHint} id="file-hint">
                {rule.hint}. Upload one file at a time.
              </p>
            </div>
            <div className={styles.detailsFields}>
              <div>
                <label htmlFor="media-title">
                  Title <span>(required)</span>
                </label>
                <input
                  id="media-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                  maxLength={120}
                  placeholder={
                    kind === 'bulletin'
                      ? 'October church bulletin'
                      : kind === 'audio'
                        ? 'Sunday service recording'
                        : 'A Sunday to remember'
                  }
                />
              </div>
              {(kind === 'image' || kind === 'video') && (
                <div>
                  <label htmlFor="media-group">
                    Fellowship group <span>(required)</span>
                  </label>
                  <Select
                    id="media-group"
                    value={group}
                    onChange={setGroup}
                    placeholder="Choose where this file belongs…"
                    options={groups.map((item) => ({
                      value: item.id,
                      label: item.label,
                    }))}
                  />
                  <p className={styles.fieldHint}>
                    Each file is filed under a group so it can be shown in the
                    right fellowship gallery.
                  </p>
                </div>
              )}
              {kind === 'bulletin' && (
                <>
                  <div>
                    <label htmlFor="bulletin-month">
                      Bulletin month <span>(required)</span>
                    </label>
                    <input
                      id="bulletin-month"
                      type="month"
                      value={month}
                      onChange={(event) => setMonth(event.target.value)}
                      required
                      min="2000-01"
                      max="2099-12"
                    />
                    <p className={styles.fieldHint}>
                      This places the bulletin in the correct month on the public
                      Bulletin page. A new upload for the same month replaces its
                      displayed edition.
                    </p>
                  </div>
                  <div>
                    <label htmlFor="bulletin-theme">
                      Monthly theme <span>(optional)</span>
                    </label>
                    <input
                      id="bulletin-theme"
                      value={theme}
                      onChange={(event) => setTheme(event.target.value)}
                      maxLength={120}
                      placeholder="Total Recovery"
                    />
                  </div>
                  <div>
                    <label htmlFor="bulletin-quote">
                      Theme quote <span>(optional)</span>
                    </label>
                    <input
                      id="bulletin-quote"
                      value={quote}
                      onChange={(event) => setQuote(event.target.value)}
                      maxLength={250}
                      placeholder="I will recover all."
                    />
                  </div>
                  <div>
                    <label htmlFor="bulletin-scripture">
                      Bible reference <span>(optional)</span>
                    </label>
                    <input
                      id="bulletin-scripture"
                      value={scripture}
                      onChange={(event) => setScripture(event.target.value)}
                      maxLength={100}
                      placeholder="1 Samuel 30:18"
                    />
                    <p className={styles.fieldHint}>
                      These details appear in the theme card. Enter them as
                      written in the bulletin.
                    </p>
                  </div>
                </>
              )}
              {kind === 'audio' && <MessageMetadataFields value={audioDetails} onChange={setAudioDetails} prefix="audio" />}
              <div>
                <label htmlFor="media-description">
                  Description <span>(optional)</span>
                </label>
                <textarea
                  id="media-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  maxLength={500}
                  rows={4}
                  placeholder={
                    kind === 'image'
                      ? 'Describe who or what is in the photograph.'
                      : kind === 'bulletin'
                        ? 'A short introduction for the public Bulletin page.'
                        : 'Add a little context for the media team.'
                  }
                />
              </div>
              <p className={styles.uploadNote}>
                Files are stored in Cloudinary and accessible to anyone with
                their link. Grouped images and videos appear in their
                fellowship’s public gallery, and audio appears on the public
                Recordings and Messages pages. Monthly bulletins appear on the public
                Bulletin page after upload.
              </p>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={
                  !selection ||
                  busy ||
                  !title.trim() ||
                  ((kind === 'image' || kind === 'video') && !group)
                }
              >
                {busy ? (
                  <LoaderCircle
                    size={18}
                    className={styles.spinning}
                    aria-hidden="true"
                  />
                ) : (
                  <UploadCloud size={18} aria-hidden="true" />
                )}
                {busy ? 'Uploading…' : 'Upload to Cloudinary'}
              </button>
            </div>
          </fieldset>
          {busy && (
            <div className={styles.progress} role="status">
              <span>
                {progress < 99
                  ? `Uploading · ${progress}%`
                  : 'Finishing your upload…'}
                <small>Keep this page open until the upload finishes.</small>
              </span>
              <progress
                value={progress}
                max={100}
                aria-label="Upload progress"
              />
            </div>
          )}
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          {success && (
            <div className={styles.success} role="status">
              <Check size={21} aria-hidden="true" />
              <div>
                <strong>{success.title} was uploaded.</strong>
                <span>
                  {success.kind === 'bulletin'
                    ? `${formatMonth(success.month)} · `
                    : success.group
                      ? `${groupLabelText(success.group)} · `
                      : ''}
                  {success.kind === 'bulletin'
                    ? 'Published on the Bulletin page.'
                    : 'Saved to your Cloudinary library.'}
                </span>
              </div>
              <a href={success.kind === 'bulletin' ? `/bulletin?month=${success.month}` : success.url} target="_blank" rel="noopener noreferrer">
                {success.kind === 'bulletin' ? 'View bulletin' : 'Open file'} <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            </div>
          )}
          {success && publicationRefreshFailed && (
            <p className={styles.notice} role="status">
              Your file was uploaded successfully. The public page may take a
              little longer to update; refresh it in a moment.
            </p>
          )}
        </form>
      </section>

      <section className={styles.library} aria-labelledby="library-heading">
        <div className={styles.libraryHeading}>
          <div>
            <span className={styles.eyebrow}>YOUR SHARED COLLECTION</span>
            <h2 id="library-heading">
              The media <em>library.</em>
            </h2>
          </div>
          <button
            type="button"
            className={styles.textButton}
            onClick={() => refreshLibrary()}
            disabled={loading || !cloudinaryReady}
          >
            <RefreshCw size={16} aria-hidden="true" /> Refresh
          </button>
        </div>
        <div
          className={styles.libraryFilters}
          role="group"
          aria-label="Library category"
        >
          {mediaKinds.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={libraryKind === item}
              onClick={() => refreshLibrary(item)}
              disabled={!cloudinaryReady}
            >
              {mediaRules[item].label}
            </button>
          ))}
        </div>
        {libraryError && (
          <div className={styles.error} role="alert">
            {libraryError}{' '}
            <button
              type="button"
              className={styles.textButton}
              onClick={() =>
                library.assets.length && library.nextCursor
                  ? void loadMore()
                  : refreshLibrary()
              }
              disabled={loading}
            >
              Try again
            </button>
          </div>
        )}
        {!cloudinaryReady ? (
          <div className={styles.empty}>
            <UploadCloud size={32} strokeWidth={1.2} aria-hidden="true" />
            <h3>Your collection starts here.</h3>
            <p>Connect Cloudinary to start uploading and view your files.</p>
          </div>
        ) : !loading && !libraryError && library.assets.length === 0 ? (
          <div className={styles.empty}>
            <ImageIcon size={32} strokeWidth={1.2} aria-hidden="true" />
            <h3>A little space for something new.</h3>
            <p>
              No {mediaRules[libraryKind].label.toLowerCase()} uploaded here
              yet.
            </p>
          </div>
        ) : null}
        <div className={styles.assetGrid}>
          {library.assets.map((asset) => {
            const AssetIcon = icons[asset.kind]
            return (
              <article className={styles.assetCard} key={asset.id}>
                <div className={styles.assetPreview}>
                  {asset.kind === 'image' ? (
                    <Image
                      src={asset.url}
                      alt={asset.description || asset.title}
                      fill
                      unoptimized
                      sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
                    />
                  ) : asset.kind === 'video' ? (
                    <video
                      src={asset.url}
                      controls
                      preload="none"
                      aria-label={asset.title}
                    />
                  ) : asset.kind === 'audio' ? (
                    <div className={styles.audioPreview}>
                      <AudioLines size={46} strokeWidth={1} aria-hidden="true" />
                      <span>AUDIO RECORDING</span>
                      <strong>{asset.format.toUpperCase()}</strong>
                    </div>
                  ) : (
                    <div className={styles.pdfPreview}>
                      <FileText size={46} strokeWidth={1} aria-hidden="true" />
                      <span>MONTHLY BULLETIN</span>
                      <strong>{formatMonth(asset.month)}</strong>
                    </div>
                  )}
                </div>
                <div className={styles.assetCopy}>
                  <span className={styles.assetMeta}>
                    <AssetIcon size={13} aria-hidden="true" />{' '}
                    {asset.format.toUpperCase()} · {formatBytes(asset.bytes)}
                    {asset.group ? ` · ${groupLabelText(asset.group)}` : ''}
                  </span>
                  <h3>{asset.title}</h3>
                  {asset.description && <p>{asset.description}</p>}
                  <time dateTime={asset.createdAt}>
                    {new Date(asset.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </time>
                  <div className={styles.assetActions}>
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open ${asset.title}`}
                    >
                      Open file <ArrowUpRight size={15} aria-hidden="true" />
                    </a>
                    <button
                      type="button"
                      onClick={() => copyLink(asset)}
                      aria-label={`Copy link to ${asset.title}`}
                    >
                      {copied === asset.id ? (
                        <Check size={15} aria-hidden="true" />
                      ) : (
                        <Copy size={15} aria-hidden="true" />
                      )}
                      {copied === asset.id ? 'Copied' : 'Copy link'}
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
        {loading && (
          <p className={styles.loading} role="status">
            <LoaderCircle
              size={18}
              className={styles.spinning}
              aria-hidden="true"
            />{' '}
            Loading your media…
          </p>
        )}
        {library.nextCursor && !loading && (
          <button className={styles.loadMore} type="button" onClick={loadMore}>
            Load more files
          </button>
        )}
        <span className="sr-only" role="status">
          {copied ? 'File link copied to clipboard.' : ''}
        </span>
      </section>
    </>
  )
}
