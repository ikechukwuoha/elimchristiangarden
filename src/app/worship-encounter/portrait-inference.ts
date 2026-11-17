import type { InferenceSession } from 'onnxruntime-web/wasm'

export const PORTRAIT_MODEL = '/models/modnet-v1.onnx'
type Runtime = { ort: typeof import('onnxruntime-web/wasm'); session: InferenceSession }
let runtimePromise: Promise<Runtime> | undefined

// MODNet accepts RGB tensors with dimensions divisible by 32. Preserve aspect ratio.
export function portraitInputSize(width: number, height: number) {
  const scale = 512 / Math.max(width, height)
  return {
    width: Math.max(32, Math.round(width * scale / 32) * 32),
    height: Math.max(32, Math.round(height * scale / 32) * 32),
  }
}

// The model expects planar RGB normalized to [-1, 1], rather than interleaved RGBA.
export function portraitTensorPixels(rgba: Uint8ClampedArray) {
  const count = rgba.length / 4
  const output = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    output[i] = rgba[i * 4] / 127.5 - 1
    output[count + i] = rgba[i * 4 + 1] / 127.5 - 1
    output[count * 2 + i] = rgba[i * 4 + 2] / 127.5 - 1
  }
  return output
}

function getRuntime(): Promise<Runtime> {
  if (!runtimePromise) {
    runtimePromise = (async () => {
      // The WASM-only entry does not register WebGL, WebGPU, or WebNN backends.
      const ort = await import('onnxruntime-web/wasm')
      ort.env.wasm.numThreads = 1
      ort.env.wasm.proxy = false
      ort.env.wasm.initTimeout = 45000
      ort.env.wasm.wasmPaths = {
        mjs: new URL('/onnx/ort-wasm-simd-threaded.mjs', window.location.origin).href,
        wasm: new URL('/onnx/ort-wasm-simd-threaded.wasm', window.location.origin).href,
      }
      const session = await ort.InferenceSession.create(PORTRAIT_MODEL, {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all',
      })
      return { ort, session }
    })().catch(() => {
      runtimePromise = undefined
      throw new Error('Background removal could not load. Try again, upload a transparent PNG, or turn off background removal.')
    })
  }
  return runtimePromise
}

export async function inferPortrait(image: ImageData, onReady: () => void) {
  const { ort, session } = await getRuntime()
  onReady()
  const input = new ort.Tensor('float32', portraitTensorPixels(image.data), [1, 3, image.height, image.width])
  let outputs: InferenceSession.ReturnType | undefined
  try {
    outputs = await session.run({ [session.inputNames[0]]: input }, [session.outputNames[0]])
    const matte = outputs[session.outputNames[0]]
    const width = matte.dims[matte.dims.length - 1]
    const height = matte.dims[matte.dims.length - 2]
    if (!(matte.data instanceof Float32Array) || matte.data.length !== width * height) {
      throw new Error('Invalid portrait matte.')
    }
    // Keep the mask interface consistent with the existing foreground cleanup.
    const background = Float32Array.from(matte.data, (alpha) => 1 - Math.max(0, Math.min(1, alpha)))
    return { background, width, height }
  } catch {
    throw new Error('Background removal could not finish. Please try again, use a transparent PNG, or turn off background removal.')
  } finally {
    input.dispose()
    if (outputs) for (const tensor of Object.values(outputs)) tensor.dispose()
  }
}
