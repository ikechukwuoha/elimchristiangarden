# Media room setup

The unlisted `/admin/media` page provides shared-password access to image, video,
audio, and monthly PDF bulletin uploads. It uses the same colours and typography as the
public site, but has no public navigation link. Its metadata asks search engines
not to index it. Password authentication protects both the page and its API routes.

## Connect the account

1. Copy `.env.example` to `.env.local`.
2. Set `ADMIN_PASSWORD` to a unique password of at least 16 characters.
3. Generate `ADMIN_SESSION_SECRET` with the command in the example file.
4. Enter the Cloudinary cloud name, API key, and API secret from the product
   environment's **Settings → API Keys**. Use an API key with upload and read
   access to the Admin API. No unsigned upload preset is needed.
5. Restart the development server. For deployment, configure the same variables
   in the hosting platform and redeploy. Use HTTPS in production.
6. Visit `/admin/media` and sign in. Keep the password and all environment values
   out of chat, source control, and browser code.

Until the variables are configured, the page displays a setup message and the
upload endpoints stay unavailable. There are no default credentials.

## Uploading and finding files

- **Images:** JPG, PNG, WebP, or GIF, up to 10 MB.
- **Videos:** MP4, WebM, or MOV, up to 100 MB.
- **Audio:** MP3, M4A, WAV, or OGG, up to 50 MB.
- **Monthly bulletins:** PDF, up to 10 MB, with a required month and year.

Images and videos also require a **fellowship group** (Church-wide, Teenagers
and Children, Couples, Singles, Brothers, Sisters). The dropdown follows the
fellowships defined in `src/app/data/ministries.ts`, so adding a fellowship
there adds it to the dropdown automatically. The chosen group is stored in the
public ID path (`elim/media/<kind>/<group>/`), as Cloudinary context, and as an
`elim-group-<group>` tag — that is how uploads are later mapped to each
fellowship's gallery. Query `elim-group-brothers` (with the right resource
type) through the Admin API to list a group's gallery assets.

The app checks the selected file's extension, reported MIME type, and size in the
browser and when requesting a signature. Signed `allowed_formats` also restricts
formats at Cloudinary. Browser-declared sizes are not a security boundary;
Cloudinary's account limits (or a separately configured signed upload preset) are
responsible for storage-side size enforcement. Account limits may be lower than
these UI limits. Videos above 100 MB require a future chunked-upload flow.

Enter a title and optional description, then upload one file at a time. Keep the
page open until the completion message appears. The browser sends the file
directly to Cloudinary using parameters signed by the authenticated server. The
API secret never leaves the server. The files do not pass through a Next.js body
upload, avoiding hosting-platform request body limits.

Assets use unique public IDs under `elim/media/<kind>/` and are tagged
`elim-media` and `elim-media-<kind>`. Bulletin public IDs also include the month;
image and video public IDs include the fellowship group. Titles, descriptions,
fellowship groups, and bulletin months are stored as Cloudinary context.
The library reads these tags through the Admin API and survives page refreshes
and deployments. It loads 24 assets at a time and supports pagination. It shows
assets uploaded through this app, not all pre-existing Cloudinary assets.
Public ID paths do not necessarily match Media Library folders in accounts using
dynamic folders; use the tags to locate assets in the Cloudinary console.

Each upload gets its own ID, including repeated uploads for the same month, so
existing files are never overwritten. Use **Open file** or **Copy link** to access
an asset. Deleting, editing, and replacing assets remain available in the
Cloudinary console.

The upload page is private. Uploaded files use public Cloudinary delivery URLs:
anyone with a file's link can access it. Grouped images and videos are published
on the public galleries (`/gallery` and `/gallery/<group>`) under the fellowship
chosen at upload time, and audio is published on `/gallery/audio`. Audio recordings
also appear in the Messages library (`/sermons`), their own message detail pages,
and the homepage's featured message. Bulletins are published on `/bulletin`.
The homepage hero also uses all uploaded images,
across every group, in a shuffled order on each visit. It rotates every six
seconds. Image uploads refresh the hero's photo list; with no uploaded photos,
the hero displays its welcome message on a plain background.

The gallery pages read assets
server-side through the Admin API and cache results for ten minutes, so public
page views do not consume the Admin API quota on every visit. Use the returned
links when updating other public content.

### Publishing messages

Messages come only from uploaded audio and YouTube links published in the media
room. There are no built-in messages, speakers, or series. An empty library shows
**No messages published yet**, and missing message IDs return a not-found page.

For audio, select **Audio**, choose the recording, and enter its actual title.
The description, speaker, speaker role, series, message date, Scripture, and
duration are optional. Blank details remain hidden, and speaker/series filters
contain only values from published recordings. Cloudinary's recording duration
is used when available; without a message date, the upload date is displayed.
Audio files are playable directly on their message pages.

For YouTube, use **Publish YouTube message** on `/admin/media`. Paste a video
link and choose **Use title from YouTube**, or enter the title yourself. Add any
optional message details and publish. The video thumbnail and embedded player
come from YouTube. Videos must allow embedding; an **Open on YouTube** link is
also available. No YouTube API key is needed, and videos are not copied into
Cloudinary. Speaker names and series must be supplied by the media team; they
are not inferred from channel names or recordings.

YouTube entries are small JSON assets under `elim/messages/youtube/<video-id>.json`,
tagged `elim-message-youtube`. Publishing the same video updates its entry.
To remove a YouTube entry, delete its JSON asset in Cloudinary. Audio recordings
are removed by deleting their audio assets. In production, each source's successful
Cloudinary response caches for one minute and is invalidated after an audio upload
or YouTube publication. Local development reads directly. Brief connection failures
get one retry; publishing is never automatically retried. A failed source does not
hide recordings from the other source or become a cached empty library. The library
shows a notice when some recordings cannot be loaded. Connection logs contain only
transport codes and HTTP status, without credentials or upstream response bodies.

### Publishing a monthly bulletin

Choose **Monthly bulletins**, select the PDF, and enter its title and month.
The optional description appears above the reader. To show the theme card,
enter the monthly theme, quote, and Bible reference as written in the PDF.
These fields are stored with the file; the app does not extract them from the
PDF. Leaving them blank shows the bulletin title without a quote or reference.

After upload, **View bulletin** opens the public edition. The newest month
is shown by default, with earlier editions available under **Browse by month**.
Uploading another PDF for the same month makes the latest upload that month's
displayed edition; earlier files remain in Cloudinary. Only uploaded bulletins
are displayed. When there are none, the page shows **No bulletins uploaded yet**.

Uploads refresh the public bulletin cache. The list also revalidates after
one minute as visitors request it, so changes made in Cloudinary are picked up
without a redeployment. If Cloudinary is unavailable, the page explains that
the bulletins couldn't be loaded and asks visitors to try again.

**Read bulletin** opens a dedicated reading screen at `/bulletin/<month>/read`.
The reader starts in **Original PDF** on every device, with fit-to-width pages
and zoom controls. All pages are stacked vertically so visitors simply scroll
through the whole bulletin. Nearby PDF pages render ahead of scrolling, while
distant canvases are released to keep memory use manageable on phones.
**Text view** also scrolls continuously, wraps selectable PDF text to the screen,
and offers adjustable text sizes. Visitors can switch views on any device,
return to the edition, open the PDF, or download it. Pages without
selectable text offer a button to read the original PDF; text view does not
perform OCR or include the PDF's images and layout.

The reader, Open PDF, and Download buttons use the app's PDF
endpoint. It retrieves published files through Cloudinary's authenticated
download API, keeping credentials on the server.

## Sessions and hosting

Sessions are signed, expire after eight hours, and use HttpOnly, SameSite=Strict
cookies (Secure in production). Changing `ADMIN_PASSWORD`,
`ADMIN_SESSION_SECRET`, or `ADMIN_TOTP_SECRET` invalidates existing sessions.
Signing out clears the browser's cookie. Mutation endpoints require the same
origin and check the session independently. API responses are not cached.

### Two-factor sign-in (optional but recommended)

Run `npm run admin:totp` and add the printed secret to an authenticator app
(Google Authenticator, Authy, 1Password) via "Enter a setup key". Then set
`ADMIN_TOTP_SECRET` in `.env.local` and on the hosting platform. Sign-in then
requires a six-digit code from the app; codes from one period (±30 seconds)
away are accepted for clock drift. Leave the variable unset to sign in with
the password alone. Changing or removing the secret signs every admin out.

### Security headers and audit log

Every route sends a Content-Security-Policy allowing this site's scripts,
Cloudinary images/media/uploads, YouTube thumbnails, and privacy-enhanced YouTube
player frames, plus nosniff,
frame-ancestors 'none', Referrer-Policy, Permissions-Policy, and HSTS in
production. Sign-ins (success, failure, rate-limited), upload authorisations,
and group changes are written to the server's structured logs — on Vercel,
see Deployments → Runtime Logs.

Failed and successful sign-in attempts count toward a five-attempt, 15-minute
per-IP window in each server process. This is a best-effort local limiter; it is
not shared between instances and resets on restart. For multi-instance or
serverless production, apply login rate limiting at the hosting edge (for
example a Vercel Firewall rule on `/api/admin/session`) or replace it with a
shared store such as Upstash Redis. The hosting proxy must replace
client-supplied forwarding headers and preserve the original request origin.

If Cloudinary credentials are invalid, its API is unavailable, or the account's
Admin API quota is exhausted, the library displays a retryable error. It never
silently substitutes an empty collection. If an upload times out, refresh the
library before retrying: Cloudinary may have received the file.

## Validation

Run `npm run test:admin`, `npm run lint`, and `npm run build`.
The automated tests cover session expiry/tampering, credential rotation, upload
validation, signature restrictions, and rate limiting. A live account is still
needed to verify uploads against your account's formats, limits, and PDF policy.

References: [Signed uploads](https://cloudinary.com/documentation/upload_images),
[Admin API](https://cloudinary.com/documentation/admin_api).
