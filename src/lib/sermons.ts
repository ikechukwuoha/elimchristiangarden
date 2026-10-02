export function formatSermonDate(date: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`))
}

export function speakerInitials(name: string) {
  return name
    .replace(/\b(Rev\.?|Dr\.?|Pastor|Mrs\.?)\s*/gi, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
}

export function seriesTone(series: string) {
  const tones = ['forest', 'sage', 'sand', 'clay', 'olive', 'stone']
  const hash = Array.from(series).reduce(
    (value, letter) => value + letter.charCodeAt(0),
    0,
  )
  return tones[hash % tones.length]
}

export function youtubeEmbedUrl(source?: string) {
  if (!source) return null
  try {
    const url = new URL(source)
    if (url.protocol !== 'https:') return null
    const host = url.hostname.replace(/^www\./, '')
    const id =
      host === 'youtu.be'
        ? url.pathname.slice(1)
        : ['youtube.com', 'm.youtube.com', 'youtube-nocookie.com'].includes(
              host,
            )
          ? url.searchParams.get('v') ||
            url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1]
          : null
    return id && /^[\w-]{11}$/.test(id)
      ? `https://www.youtube-nocookie.com/embed/${id}`
      : null
  } catch {
    return null
  }
}
