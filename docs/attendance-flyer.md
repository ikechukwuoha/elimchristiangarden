# Personalized attendance flyer

Open `/worship-encounter`. The visitor selects a JPG, PNG, or WebP portrait, enters
their name, optionally adjusts the framing, and downloads a 2160 × 3240 PNG.
The route uses the existing Destiny Conference 2026 dates, time, theme, address,
and minister. The name, photograph, and optional Unit/Fellowship vary between visitors.

## How the approved design becomes a template

The approved flyer was converted into a reusable artwork layer with imagegen:
`public/images/flyer/confirmed-background-v3.webp`. It contains the gold and ivory
background, complete distressed CONFIRMED stamp, and empty theme ribbon. It
contains no trumpet, logo, person, date/time badges, or event copy.
The generation prompt is saved in
`output/design-concepts/confirmed-background-v3.prompt.txt`. The 1080 × 1620 layout
has separate vertical space for the church logo, headline, “I WILL BE THERE”,
stamp and portrait, theme, and footer. The code uses the original church logo
from `public/images/logo-removebg-preview.png`. A wider, high-contrast calendar
panel gives “TUE – SUN” its own large header, with serif date and year below.

An example produced by the actual browser code, rather than by imagegen, is
saved at `output/design-concepts/elim-attendance-updated-v3.png`.

`src/app/worship-encounter/flyer-artwork.ts` draws these layers, in order:

1. The artwork, church logo, fixed headline, and attendance statement.
2. The uploaded person, with a transparent background, in front of the stamp.
3. The foreground ribbon and visitor's name with the confirmation check and optional sponsorship line.
4. The fixed date, time, theme, church, address, and minister.

The preview and export use the same canvas. Updating the preview does not call
an image-generation API. Edit `flyerEvent` in that module to change the fixed
event copy, including the two theme lines. The background artwork can be reused
for later events as long as the same layout is retained.

## Optional sponsorship

The optional Unit/Fellowship field sits below the name. Its live hint and the
canvas use the same formatting function in `flyer-sponsor.ts`:

- Tehilla → Sponsored By Tehilla Ministries.
- Brothers, Couples, Sisters, Singles → Sponsored By [name] Fellowship.
- Other names, such as Media → Sponsored By Media Unit.

Matching ignores case and extra whitespace, and existing Unit/Fellowship/Ministries
suffixes are not duplicated. An empty field adds nothing to the card and does not
block downloading. The sponsorship appears beneath the visitor's name in the
same badge; the theme, portrait crop, and event details retain their positions.

## Portrait processing

`prepare-portrait.ts` validates the file (10 MB limit), reduces very large images,
and preserves existing transparent cutouts. Ordinary photographs use the MODNet
portrait matting model through ONNX Runtime's CPU-only WebAssembly backend.
The photograph is processed on the visitor's device and is not uploaded by this
feature. Hair, skin, clothing, and accessories remain part of the portrait.

The pinned model is served from `public/models/modnet-v1.onnx`.
`scripts/copy-portrait-assets.mjs` copies the matching WASM runtime from the pinned
`onnxruntime-web` dependency into `public/onnx` during install,
development startup, and production build. The generated runtime folder is
ignored by Git. Both model and runtime load from the site's own domain. No API
key, paid background-removal service, or third-party CDN is required at runtime.

The runtime imports `onnxruntime-web/wasm` and explicitly selects only the `wasm`
execution provider, with one thread and proxy workers disabled. It needs neither
WebGL/WebGPU nor SharedArrayBuffer. Selecting a CPU inference delegate in the
previous MediaPipe implementation did not remove its WebGL image-input
dependency, which caused `activeTexture` errors in browsers without WebGL.

Portrait extraction is automatic and can vary with image quality. A clear
waist-up photo with one person works best. Visitors can adjust zoom and position,
provide an existing transparent PNG, or turn background removal off. Processing
and errors disable download, and older photo requests cannot overwrite a newer
selection or a removed photo. The download also requires a nonblank name.

## Editing the photo

`PortraitEditor.tsx` appears after the photo has been prepared. Visitors can drag
the photo with a mouse or finger, zoom from 50% to 300%, rotate in quarter turns,
flip it horizontally, use position sliders, or focus the crop and use arrow keys.
Reset restores the initial crop. Edits apply immediately and stay local.

The upload and name fields sit above a shared workspace. The crop editor and
larger flyer preview start beside each other. On small screens, the same two
columns remain and the preview stays sticky while the editing controls scroll,
so users do not have to move between separate sections to see their changes.

The crop editor and flyer renderer share the exact transform in
`portrait-framing.ts`. Cropping affects only the portrait. The attendance text,
large stamp, name, event information, and theme keep their positions. Crop guides
and the transparency checkerboard appear only in the editor, and the downloaded
PNG matches the flyer preview.

## Verification

Run the portrait mask regression tests with `npm run test:flyer`.
Check types with `./node_modules/.bin/tsc --noEmit`, lint the changed feature with
`./node_modules/.bin/eslint src/app/worship-encounter next.config.ts`, and start
the site with `npm run dev`. Verify a real JPG upload, a transparent PNG,
background-removal failure/retry, drag/zoom/rotation/flip, a long name, clearing the photo,
and a PNG download. Confirm the downloaded image matches the preview and that
the mobile page has no horizontal overflow.

For the `activeTexture` regression, start the app and a dedicated Chrome instance
with `--remote-debugging-port=9339`, then run `npm run test:flyer-browser`. It
creates its own tab, disables WebGL and WebGPU, uploads the sample portrait, and
checks mouse/touch/keyboard cropping, rotation, flip, reset, mobile layout, the
actual downloaded PNG dimensions, and equality of preview/export pixels.
Pass an absolute portrait path
after `--` to test a different photo, followed optionally by the app URL.
`CDP_URL` and `FLYER_URL` can override the
debug endpoint and app URL; defaults are `http://127.0.0.1:9339` and
`http://localhost:3000/worship-encounter`.

Model documentation: [MODNet](https://github.com/ZHKKKe/MODNet),
[ONNX model](https://huggingface.co/Xenova/modnet),
[ONNX Runtime Web deployment](https://onnxruntime.ai/docs/tutorials/web/deploy.html).
