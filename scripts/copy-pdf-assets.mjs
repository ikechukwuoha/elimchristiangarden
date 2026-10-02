import { cpSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const source = dirname(require.resolve('pdfjs-dist/package.json'))
const destination = new URL('../public/pdfjs/', import.meta.url)
mkdirSync(destination, { recursive: true })
cpSync(join(source, 'build/pdf.worker.min.mjs'), new URL('pdf.worker.min.mjs', destination))
for (const folder of ['cmaps', 'standard_fonts', 'wasm']) {
  cpSync(join(source, folder), new URL(`${folder}/`, destination), { recursive: true })
}
