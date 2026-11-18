import assert from 'node:assert/strict'
import { mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { createRequire } from 'node:module'

const sharp = createRequire(import.meta.url)('sharp')
const mobileUpload = process.env.FLYER_MOBILE === '1'
const canvasPixelBudget = Number(process.env.FLYER_CANVAS_BUDGET || 0)

// Start the app and a dedicated Chrome instance with --remote-debugging-port=9339 first.
const portraitPath = resolve(process.argv[2] || 'public/images/seniorpastor.jpg')
await readFile(portraitPath)
const output = await mkdtemp(join(tmpdir(), 'elim-flyer-no-webgl-'))
const cdp = process.env.CDP_URL || 'http://127.0.0.1:9339'
const target = await (await fetch(`${cdp}/json/new?about:blank`, { method: 'PUT' })).json()
const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((resolve, reject) => { ws.addEventListener('open', resolve); ws.addEventListener('error', reject) })
let sequence = 0
const pending = new Map()
const errors = []
const requests = []
ws.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)
  if (message.id) {
    const entry = pending.get(message.id)
    if (entry) {
      clearTimeout(entry.timer); pending.delete(message.id)
      if (message.error) entry.reject(new Error(JSON.stringify(message.error)))
      else entry.resolve(message.result)
    }
  }
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails)
  if (message.method === 'Network.requestWillBeSent') requests.push(message.params.request)
})
function call(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++sequence
    const timer = setTimeout(() => { pending.delete(id); reject(new Error('CDP timeout: ' + method)) }, 60000)
    pending.set(id, { resolve, reject, timer })
    ws.send(JSON.stringify({ id, method, params }))
  })
}
async function evaluate(expression) {
  const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
  return result.result.value
}
async function until(expression, timeout = 60000) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    const result = await evaluate(expression)
    if (result) return result
    await new Promise((resolve) => setTimeout(resolve, 300))
  }
  throw new Error('Condition timed out: ' + expression + '\n' + await evaluate('document.body.innerText'))
}
async function upload(path) {
  const { root } = await call('DOM.getDocument')
  const { nodeId } = await call('DOM.querySelector', { nodeId: root.nodeId, selector: '#flyer-photo' })
  await call('DOM.setFileInputFiles', { nodeId, files: [path] })
}
async function snapshot(name) {
  const data = await evaluate(`document.querySelector('[aria-label="Your personalized flyer"] canvas').toDataURL('image/png').split(',')[1]`)
  await writeFile(output + '/' + name + '.png', Buffer.from(data, 'base64'))
}
try {
  await call('Runtime.enable'); await call('Page.enable'); await call('Network.enable')
  await call('Emulation.setDeviceMetricsOverride', { width: mobileUpload ? 390 : 1440, height: mobileUpload ? 844 : 1100, deviceScaleFactor: 1, mobile: mobileUpload })
  if (mobileUpload) await call('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 2 })
  await call('Page.addScriptToEvaluateOnNewDocument',{source:`(() => {
    const canvasBudget = ${JSON.stringify(canvasPixelBudget)};
    const surfaces = new Set();
    window.__canvasDenied = 0;
    window.__canvasPeak = 0;
    const wrap = (prototype) => {
      const original = prototype.getContext;
      prototype.getContext = function(type,...args) {
        if (/^(webgl2?|experimental-webgl|webgpu)$/.test(type)) return null;
        if (type === '2d' && window.__denyScratch && this.isConnected === false) { window.__canvasDenied++; return null; }
        if (type === '2d' && canvasBudget) {
          let pixels = surfaces.has(this) ? 0 : this.width * this.height;
          for (const surface of surfaces) pixels += surface.width * surface.height;
          if (pixels > canvasBudget) { window.__canvasDenied++; return null; }
          window.__canvasPeak = Math.max(window.__canvasPeak, pixels);
        }
        const context = original.call(this,type,...args);
        if (context && type === '2d') surfaces.add(this);
        return context;
      };
    };
    wrap(HTMLCanvasElement.prototype);
    if (typeof OffscreenCanvas !== 'undefined') wrap(OffscreenCanvas.prototype);
    Object.defineProperty(navigator, 'gpu', { value: undefined, configurable: true });
    const fillText = CanvasRenderingContext2D.prototype.fillText;
    const clearRect = CanvasRenderingContext2D.prototype.clearRect;
    const isFlyer = (ctx) => Boolean(ctx.canvas.closest('[aria-label="Your personalized flyer"]'));
    CanvasRenderingContext2D.prototype.clearRect = function(...args) {
      if (isFlyer(this)) window.__renderedSponsor = '';
      return clearRect.apply(this,args);
    };
    CanvasRenderingContext2D.prototype.fillText = function(text,...args) {
      if (isFlyer(this) && String(text).startsWith('Sponsored By ')) window.__renderedSponsor = String(text);
      return fillText.call(this,text,...args);
    };
  })()`})
  await call('Page.navigate',{url:process.env.FLYER_URL || process.argv[3] || 'http://localhost:3000/worship-encounter'})
  await until(`document.querySelector('#flyer-name') && document.querySelector('[aria-label="Your personalized flyer"]').getAttribute('aria-busy') === 'false'`)
  const gl = await evaluate(`document.createElement('canvas').getContext('webgl2') !== null`)
  assert.equal(gl,false)
  await evaluate(`document.querySelector('#flyer-name').focus()`)
  await call('Input.insertText',{text:'Regression Test'})
  await evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))')
  const withoutPortrait = await evaluate(`document.querySelector('[aria-label="Your personalized flyer"] canvas').toDataURL()`)
  await upload(portraitPath)
  await until(`document.querySelector('#photo-status').textContent.includes('ready') || document.querySelector('#photo-error').textContent`,120000)
  const status = await evaluate(`({status:document.querySelector('#photo-status').textContent,error:document.querySelector('#photo-error').textContent})`)
  console.log(JSON.stringify({webglEnabled:gl,...status}))
  {
    assert.equal(status.error,'')
    await until(`document.querySelector('button[aria-label="Download attendance flyer"]').disabled === false`)
    const poster = `document.querySelector('[aria-label="Your personalized flyer"] canvas')`
    let crop = mobileUpload ? `document.querySelector('[aria-label="Move your photo on the flyer"]')` : `document.querySelector('canvas[aria-label^="Editable photo crop"]')`
    await until(`Boolean(${crop})`)
    await evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))')
    const initial = await evaluate(`${poster}.toDataURL()`)
    const beforeImage = Buffer.from(withoutPortrait.split(',')[1], 'base64')
    const afterImage = Buffer.from(initial.split(',')[1], 'base64')
    const { width: actualWidth } = await sharp(afterImage).metadata()
    const ratio = actualWidth / 1080
    const region = { left: Math.round(300 * ratio), top: Math.round(610 * ratio), width: Math.round(480 * ratio), height: Math.round(650 * ratio) }
    const [beforePixels, afterPixels] = await Promise.all([beforeImage, afterImage].map(data => sharp(data).extract(region).removeAlpha().raw().toBuffer()))
    let changed = 0
    for (let i = 0; i < beforePixels.length; i += 3) {
      if (Math.abs(beforePixels[i] - afterPixels[i]) + Math.abs(beforePixels[i + 1] - afterPixels[i + 1]) + Math.abs(beforePixels[i + 2] - afterPixels[i + 2]) > 60) changed++
    }
    assert.ok(changed / (beforePixels.length / 3) > 0.12, 'The uploaded portrait must visibly appear on the card, not only in its editor.')
    assert.equal(await evaluate(`document.querySelector('#flyer-affiliation').required`), false)
    const setAffiliation = async (value, expected) => {
      await evaluate(`(() => {const input=document.querySelector('#flyer-affiliation');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,${JSON.stringify(value)});input.dispatchEvent(new Event('input',{bubbles:true}));})()`)
      await until(`window.__renderedSponsor === ${JSON.stringify(expected)}`)
      if (expected) assert.equal(await evaluate(`document.querySelector('#flyer-affiliation-note').textContent`), expected)
    }
    for (const [value, expected] of [
      ['Tehilla', 'Sponsored By Tehilla Ministries'],
      ['Brothers', 'Sponsored By Brothers Fellowship'],
      ['Couples', 'Sponsored By Couples Fellowship'],
      ['Sisters', 'Sponsored By Sisters Fellowship'],
      ['Singles', 'Sponsored By Singles Fellowship'],
      ['media unit', 'Sponsored By Media Unit'],
    ]) await setAffiliation(value, expected)
    await setAffiliation('   ', '')
    await until(`${poster}.toDataURL() === ${JSON.stringify(initial)}`)
    assert.equal(await evaluate(`[...document.fonts].some(font => font.family.includes('Merriweather') && font.status === 'loaded')`), true)
    if (!mobileUpload) {
      const layout = await evaluate(`(() => {const editor=document.querySelector('[aria-label="Photo editor"]').getBoundingClientRect();const preview=document.querySelector('[aria-label="Your personalized flyer"]').getBoundingClientRect();return {sameTop:Math.abs(editor.top-preview.top)<3,sideBySide:editor.right<=preview.left};})()`)
      assert.deepEqual(layout, { sameTop: true, sideBySide: true })
    } else assert.equal(await evaluate(`Boolean(document.querySelector('[aria-label="Photo editor"]'))`), false)

    // Drag the crop with a mouse, then fine-tune it with the keyboard.
    await evaluate(`${crop}.scrollIntoView({ block: 'center', behavior: 'instant' })`)
    let rect = await evaluate(`(() => {const r=${crop}.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`)
    await call('Input.dispatchMouseEvent', { type: 'mouseMoved', x: rect.x, y: rect.y })
    await call('Input.dispatchMouseEvent', { type: 'mousePressed', x: rect.x, y: rect.y, button: 'left', buttons: 1, clickCount: 1 })
    await call('Input.dispatchMouseEvent', { type: 'mouseMoved', x: rect.x + 45, y: rect.y + 25, button: 'left', buttons: 1 })
    await call('Input.dispatchMouseEvent', { type: 'mouseReleased', x: rect.x + 45, y: rect.y + 25, button: 'left', clickCount: 1 })
    await until(`${poster}.toDataURL() !== ${JSON.stringify(initial)}`)
    const dragged = await evaluate(`${poster}.toDataURL()`)
    await evaluate(`${crop}.focus()`)
    await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowLeft', code: 'ArrowLeft', windowsVirtualKeyCode: 37 })
    await call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowLeft', code: 'ArrowLeft', windowsVirtualKeyCode: 37 })
    await until(`${poster}.toDataURL() !== ${JSON.stringify(dragged)}`)

    // Rotation, mirroring, and zooming out must also update the exported composition.
    let before = await evaluate(`${poster}.toDataURL()`)
    await evaluate(`document.querySelector('button[aria-label="Rotate photo right"]').click()`)
    await until(`${poster}.toDataURL() !== ${JSON.stringify(before)}`)
    before = await evaluate(`${poster}.toDataURL()`)
    await evaluate(`document.querySelector('button[aria-label="Flip photo horizontally"]').click()`)
    await until(`document.querySelector('button[aria-label="Flip photo horizontally"]').getAttribute('aria-pressed') === 'true'`)
    await until(`${poster}.toDataURL() !== ${JSON.stringify(before)}`)
    await evaluate(`(() => {const input=document.querySelector('input[type=range]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'0.5');input.dispatchEvent(new Event('input',{bubbles:true}));})()`)
    await until(`document.querySelector('input[type=range]').value === '0.5'`)

    // Mobile users edit directly on the card; no second photo canvas is mounted.
    await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
    await call('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 2 })
    crop = `document.querySelector('[aria-label="Move your photo on the flyer"]')`
    await until(`Boolean(${crop})`)
    assert.equal(await evaluate(`Boolean(document.querySelector('[aria-label="Photo editor"]'))`), false)
    await evaluate(`${crop}.scrollIntoView({ block: 'center', behavior: 'instant' })`)
    rect = await evaluate(`(() => {const r=${crop}.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`)
    const touchImage = await evaluate(`${poster}.toDataURL()`)
    const scrollBeforeTouch = await evaluate('window.scrollY')
    await call('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: rect.x, y: rect.y, id: 1 }] })
    await call('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: rect.x + 15, y: rect.y + 15, id: 1 }] })
    await call('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await until(`${poster}.toDataURL() !== ${JSON.stringify(touchImage)}`)
    assert.equal(await evaluate('window.scrollY'), scrollBeforeTouch)
    assert.equal(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), true)
    const zoomBefore = await evaluate(`Number(document.querySelector('input[aria-label="Photo zoom"]').value)`)
    await call('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: rect.x - 15, y: rect.y, id: 2 }, { x: rect.x + 15, y: rect.y, id: 3 }] })
    await call('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: rect.x - 35, y: rect.y, id: 2 }, { x: rect.x + 35, y: rect.y, id: 3 }] })
    await call('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await until(`Number(document.querySelector('input[aria-label="Photo zoom"]').value) > ${zoomBefore}`)
    assert.equal(await evaluate('window.scrollY'), scrollBeforeTouch)
    await evaluate(`document.querySelector('button[aria-label="Reset photo crop"]').click()`)
    await until(`${poster}.toDataURL() === ${JSON.stringify(initial)}`)
    if (mobileUpload) {
      // The original failure must also recover when temporary buffers are refused outright.
      await evaluate('window.__denyScratch = true')
      await evaluate(`${crop}.focus()`)
      await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 })
      await call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 })
      await until(`${poster}.toDataURL() !== ${JSON.stringify(initial)}`)
      const fallback = Buffer.from((await evaluate(`${poster}.toDataURL()`)).split(',')[1], 'base64')
      const pixels = await sharp(fallback).extract(region).removeAlpha().raw().toBuffer()
      let visible = 0
      for (let i = 0; i < pixels.length; i += 3) {
        if (Math.abs(pixels[i] - beforePixels[i]) + Math.abs(pixels[i + 1] - beforePixels[i + 1]) + Math.abs(pixels[i + 2] - beforePixels[i + 2]) > 60) visible++
      }
      assert.ok(visible / (pixels.length / 3) > 0.12, 'The photo must remain visible even when a temporary canvas is refused.')
      await evaluate('window.__denyScratch = false')
      await evaluate(`document.querySelector('button[aria-label="Reset photo crop"]').click()`)
      await until(`${poster}.toDataURL() === ${JSON.stringify(initial)}`)
    }
    const screenshot = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })
    await writeFile(join(output, 'crop-editor-mobile.png'), Buffer.from(screenshot.data, 'base64'))
    await evaluate(`document.querySelector('[aria-label="Your personalized flyer"]').scrollIntoView({block:'start',behavior:'instant'});window.scrollBy(0,-150)`)
    const clip = await evaluate(`(() => {const r=document.querySelector('[aria-label="Your personalized flyer"]').getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,width:r.width,height:r.height,scale:1};})()`)
    const cardScreenshot = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip })
    await writeFile(join(output, 'mobile-card-editing.png'), Buffer.from(cardScreenshot.data, 'base64'))

    await setAffiliation('Tehilla', 'Sponsored By Tehilla Ministries')
    const exportPreview = await evaluate(`${poster}.toDataURL()`)
    await snapshot('technical-no-webgl')
    await call('Page.setDownloadBehavior',{behavior:'allow',downloadPath:output})
    await evaluate(`document.querySelector('button[aria-label="Download attendance flyer"]').click()`)
    await until(`document.body.textContent.includes('Your flyer is ready to share.')`)
    assert.equal(errors.length,0,JSON.stringify(errors))
    const deadline = Date.now() + 10000
    let files = []
    while (Date.now() < deadline) {
      files = (await readdir(output)).filter((file) => file.startsWith('destiny-conference-') && file.endsWith('.png'))
      if (files.length) break
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
    assert.equal(files.length > 0, true, 'A PNG should actually be downloaded.')
    const png = await readFile(join(output, files[0]))
    const exportScale = Number(process.env.FLYER_EXPECT_EXPORT_SCALE || 2)
    assert.equal(png.readUInt32BE(16), 1080 * exportScale)
    assert.equal(png.readUInt32BE(20), 1740 * exportScale)
    const preview = Buffer.from(exportPreview.split(',')[1], 'base64')
    const [previewPixels, downloadedPixels] = await Promise.all([sharp(preview).resize(1080, 1740).ensureAlpha().raw().toBuffer(), sharp(png).resize(1080, 1740).ensureAlpha().raw().toBuffer()])
    let difference = 0
    for (let i = 0; i < previewPixels.length; i++) difference += Math.abs(previewPixels[i] - downloadedPixels[i])
    assert.ok(difference / previewPixels.length < 4, 'The exported card must match the live composition at the different resolutions.')
    await evaluate(`document.querySelector('button[aria-label="Remove uploaded photo"]').click()`)
    await until(`!document.querySelector('[aria-label="Move your photo on the flyer"]') && document.querySelector('button[aria-label="Download attendance flyer"]').disabled`)
    await upload(portraitPath)
    await until(`document.querySelector('#photo-status').textContent.includes('ready') && Boolean(document.querySelector('[aria-label="Move your photo on the flyer"]')) && ${poster}.toDataURL() === ${JSON.stringify(exportPreview)}`, 120000)
    assert.equal(errors.length, 0, JSON.stringify(errors))
    const memory = await evaluate('({denied:window.__canvasDenied,peak:window.__canvasPeak})')
    console.log(`PASS: visible portrait from ${mobileUpload ? 'mobile' : 'desktop'} upload; direct touch drag and pinch; keyboard, rotate, flip, reset; optional sponsorship; ${1080 * exportScale}×${1740 * exportScale} PNG; no WebGL/WebGPU. Canvas: ${JSON.stringify(memory)}. Artifacts: ${output}`)
  }
} finally {
  ws.close()
  await fetch(`${cdp}/json/close/${target.id}`)
}
