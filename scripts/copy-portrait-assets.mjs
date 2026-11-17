import { cpSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const source = dirname(require.resolve('onnxruntime-web/wasm'))
const destination = new URL('../public/onnx/', import.meta.url)
mkdirSync(destination, { recursive: true })
for (const file of ['ort-wasm-simd-threaded.mjs', 'ort-wasm-simd-threaded.wasm']) {
  cpSync(join(source, file), new URL(file, destination))
}
