# Portrait matting model

This is Xenova's float32 ONNX conversion of MODNet, pinned to repository revision
`fa2fa546052fba4c08921230a26cc69a333fca12`. It is hosted locally so a visitor does
not need to contact a model CDN to prepare their flyer. MODNet and these weights
are Apache-2.0 licensed; see `MODNET-LICENSE.txt`.

SHA-256: `07c308cf0fc7e6e8b2065a12ed7fc07e1de8febb7dc7839d7b7f15dd66584df9`.

Original model:
https://huggingface.co/Xenova/modnet/resolve/fa2fa546052fba4c08921230a26cc69a333fca12/onnx/model.onnx

Documentation and model card:
https://huggingface.co/Xenova/modnet
https://github.com/ZHKKKe/MODNet

The CPU-only WebAssembly runtime is provided by the pinned MIT-licensed
`onnxruntime-web` package. It does not depend on WebGL, WebGPU, or hardware
acceleration. Its WASM assets are copied at install/build time; see
`scripts/copy-portrait-assets.mjs`.
