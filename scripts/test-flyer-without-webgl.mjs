import assert from 'node:assert/strict'
import { mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { createRequire } from 'node:module'

const sharp = createRequire(import.meta.url)('sharp')

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
  await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false })
  await call('Page.addScriptToEvaluateOnNewDocument',{source:`(() => {
    const wrap = (prototype) => {
      const original = prototype.getContext;
      prototype.getContext = function(type,...args) {
        if (/^(webgl2?|experimental-webgl|webgpu)$/.test(type)) return null;
        return original.call(this,type,...args);
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
  await upload(portraitPath)
  await until(`document.querySelector('#photo-status').textContent.includes('ready') || document.querySelector('#photo-error').textContent`,120000)
  const status = await evaluate(`({status:document.querySelector('#photo-status').textContent,error:document.querySelector('#photo-error').textContent})`)
  console.log(JSON.stringify({webglEnabled:gl,...status}))
  {
    assert.equal(status.error,'')
    assert.equal(await evaluate(`document.querySelector('[aria-label="Your personalized flyer"] button:last-of-type').disabled`),false)
    const poster = `document.querySelector('[aria-label="Your personalized flyer"] canvas')`
    const crop = `document.querySelector('canvas[aria-label^="Editable photo crop"]')`
    await until(`Boolean(${crop})`)
    await evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))')
    const initial = await evaluate(`${poster}.toDataURL()`)
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
    const desktopLayout = await evaluate(`(() => {const editor=document.querySelector('[aria-label="Photo editor"]').getBoundingClientRect();const preview=document.querySelector('[aria-label="Your personalized flyer"]').getBoundingClientRect();return {sameTop:Math.abs(editor.top-preview.top)<3,sideBySide:editor.right<=preview.left};})()`)
    if (!desktopLayout.sameTop) console.log('Layout positions:', await evaluate(`(() => {const editor=document.querySelector('[aria-label="Photo editor"]');const preview=document.querySelector('[aria-label="Your personalized flyer"]');return {scrollY:window.scrollY,editorTop:editor.getBoundingClientRect().top,previewTop:preview.getBoundingClientRect().top,editorPosition:getComputedStyle(editor).position,editorInset:getComputedStyle(editor).top,previewInset:getComputedStyle(preview).top,editorHeight:editor.getBoundingClientRect().height,previewHeight:preview.getBoundingClientRect().height};})()`))
    assert.deepEqual(desktopLayout, { sameTop: true, sideBySide: true })

    // Drag the crop with a mouse, then fine-tune it with the keyboard.
    await evaluate(`${crop}.scrollIntoView({ block: 'center', behavior: 'instant' })`)
    let rect = await evaluate(`(() => {const r=${crop}.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`)
    await call('Input.dispatchMouseEvent', { type: 'mouseMoved', x: rect.x, y: rect.y })
    await call('Input.dispatchMouseEvent', { type: 'mousePressed', x: rect.x, y: rect.y, button: 'left', buttons: 1, clickCount: 1 })
    await call('Input.dispatchMouseEvent', { type: 'mouseMoved', x: rect.x + 45, y: rect.y + 25, button: 'left', buttons: 1 })
    await call('Input.dispatchMouseEvent', { type: 'mouseReleased', x: rect.x + 45, y: rect.y + 25, button: 'left', clickCount: 1 })
    await until(`Number(document.querySelectorAll('input[type=range]')[1].value) > 50 && Number(document.querySelectorAll('input[type=range]')[2].value) > 0`)
    await until(`${poster}.toDataURL() !== ${JSON.stringify(initial)}`)
    const draggedX = await evaluate(`Number(document.querySelectorAll('input[type=range]')[1].value)`)
    await evaluate(`${crop}.focus()`)
    await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowLeft', code: 'ArrowLeft', windowsVirtualKeyCode: 37 })
    await call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowLeft', code: 'ArrowLeft', windowsVirtualKeyCode: 37 })
    await until(`Number(document.querySelectorAll('input[type=range]')[1].value) < ${draggedX}`)

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

    // Mobile users can drag the same crop with a finger without scrolling the image.
    await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
    await call('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 })
    await evaluate(`${crop}.scrollIntoView({ block: 'center', behavior: 'instant' })`)
    rect = await evaluate(`(() => {const r=${crop}.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`)
    const touchY = await evaluate(`Number(document.querySelectorAll('input[type=range]')[2].value)`)
    await call('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: rect.x, y: rect.y, id: 1 }] })
    await call('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: rect.x + 15, y: rect.y + 15, id: 1 }] })
    await call('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await until(`Number(document.querySelectorAll('input[type=range]')[2].value) > ${touchY}`)
    assert.equal(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), true)
    assert.equal(await evaluate(`document.querySelector('[aria-label="Photo editor"]').getBoundingClientRect().right <= document.querySelector('[aria-label="Your personalized flyer"]').getBoundingClientRect().left`), true)
    await evaluate(`document.querySelector('button[aria-label="Reset photo crop"]').click()`)
    await until(`${poster}.toDataURL() === ${JSON.stringify(initial)}`)
    const screenshot = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })
    await writeFile(join(output, 'crop-editor-mobile.png'), Buffer.from(screenshot.data, 'base64'))

    await setAffiliation('Tehilla', 'Sponsored By Tehilla Ministries')
    const exportPreview = await evaluate(`${poster}.toDataURL()`)
    await snapshot('technical-no-webgl')
    await call('Page.setDownloadBehavior',{behavior:'allow',downloadPath:output})
    await evaluate(`document.querySelector('[aria-label="Your personalized flyer"] button:last-of-type').click()`)
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
    assert.equal(png.readUInt32BE(16), 2160)
    assert.equal(png.readUInt32BE(20), 3240)
    const preview = Buffer.from(exportPreview.split(',')[1], 'base64')
    const [previewPixels, downloadedPixels] = await Promise.all([sharp(preview).ensureAlpha().raw().toBuffer(), sharp(png).ensureAlpha().raw().toBuffer()])
    assert.deepEqual(downloadedPixels, previewPixels)
    console.log(`PASS: optional sponsorship rules, blank omission, mouse/touch crop, keyboard positioning, zoom out, rotate, flip, reset, mobile layout, matching PNG export, and no WebGL/WebGPU. Artifacts: ${output}`)
  }
} finally {
  ws.close()
  await fetch(`${cdp}/json/close/${target.id}`)
}
