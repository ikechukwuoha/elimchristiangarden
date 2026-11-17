/** Remove disconnected background fragments without blurring the subject's edges. */
export function subjectRegion(confidence: Float32Array, width: number, height: number): Uint8Array {
  const length = width * height
  if (confidence.length !== length) throw new Error('Invalid portrait mask dimensions.')
  let core = Uint8Array.from(confidence, (background) => background < 0.45 ? 1 : 0)
  // Open narrow bridges so a background fragment cannot remain attached by a pixel.
  for (let pass = 0; pass < 2; pass++) {
    const next = new Uint8Array(length)
    for (let y = 1; y < height - 1; y++) for (let x = 1; x < width - 1; x++) {
      const i = y * width + x
      next[i] = core[i - width - 1] & core[i - width] & core[i - width + 1] & core[i - 1] & core[i] & core[i + 1] & core[i + width - 1] & core[i + width] & core[i + width + 1]
    }
    core = next
  }
  const visited = new Uint8Array(length)
  const queue = new Int32Array(length)
  let largest = new Int32Array(0)
  for (let start = 0; start < length; start++) {
    if (!core[start] || visited[start]) continue
    let count = 1
    queue[0] = start
    visited[start] = 1
    for (let head = 0; head < count; head++) {
      const i = queue[head]
      const x = i % width
      const neighbors = [x > 0 ? i - 1 : -1, x < width - 1 ? i + 1 : -1, i - width, i + width]
      for (const neighbor of neighbors) {
        if (neighbor < 0 || neighbor >= length || !core[neighbor] || visited[neighbor]) continue
        visited[neighbor] = 1
        queue[count++] = neighbor
      }
    }
    if (count > largest.length) largest = queue.slice(0, count)
  }
  // An empty core is handled by the portrait validator; don't destroy thin cutouts.
  if (!largest.length) return Uint8Array.from(confidence, (background) => background < 0.8 ? 1 : 0)
  let region = new Uint8Array(length)
  for (const i of largest) region[i] = 1
  // Restore the soft boundary from the original confidence mask around the core.
  for (let pass = 0; pass < 3; pass++) {
    const next = region.slice()
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const i = y * width + x
      if (!region[i]) continue
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (x + dx >= 0 && x + dx < width && y + dy >= 0 && y + dy < height) next[i + dy * width + dx] = 1
      }
    }
    region = next
  }
  return region
}
