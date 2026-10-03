import type { TextContent, TextItem } from 'pdfjs-dist/types/src/display/api'

// Keep the PDF's content order. Join wrapped lines so text can reflow on a
// phone, keeping headings, larger gaps, and column changes as separate blocks.
export function bulletinTextParagraphs(content: TextContent): string[] {
  const lines: { text: string; x: number; y: number; height: number }[] = []
  let line: (typeof lines)[number] | undefined
  let previous: TextItem | undefined
  const flush = () => {
    if (line?.text.trim()) lines.push({ ...line, text: line.text.trim() })
    line = undefined
    previous = undefined
  }

  for (const item of content.items) {
    if (!('str' in item)) continue
    const x = item.transform[4]
    const y = item.transform[5]
    const height = Math.max(item.height, Math.hypot(item.transform[2], item.transform[3]), 1)
    if (line && Math.abs(y - line.y) > Math.max(line.height, height) * 0.5) flush()
    if (!line) line = { text: '', x, y, height }
    const gap = previous ? x - (previous.transform[4] + previous.width) : 0
    if (gap > height * 0.2 && line.text && !/\s$/.test(line.text) && !/^\s/.test(item.str)) line.text += ' '
    line.text += item.str
    previous = item
    if (item.hasEOL) flush()
  }
  flush()

  const paragraphs: string[] = []
  for (let index = 0; index < lines.length; index++) {
    const current = lines[index]
    const prior = lines[index - 1]
    const separate = !prior ||
      Math.abs(current.y - prior.y) > Math.max(current.height, prior.height) * 1.8 ||
      current.y > prior.y + current.height * 0.5 ||
      Math.abs(current.x - prior.x) > current.height * 4 ||
      Math.max(current.height, prior.height) / Math.min(current.height, prior.height) > 1.2 ||
      /^(?:[•●▪–] |\d+[.)] )/.test(current.text)
    if (separate) paragraphs.push(current.text)
    else paragraphs[paragraphs.length - 1] += ` ${current.text}`
  }
  return paragraphs
}
