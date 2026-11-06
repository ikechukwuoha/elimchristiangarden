import type { ChurchEvent } from './events'

// Older events put the theme in the title. Keep those readable without a
// storage migration, and prefill the separate fields when an admin edits one.
export function eventDetails(event: Pick<ChurchEvent, 'title' | 'theme' | 'texts'>) {
  const match = /\btheme\s*:/i.exec(event.title)
  const legacyTitle = match ? event.title.slice(0, match.index).replace(/[\s.…:;|–—-]+$/, '') : ''
  const legacyTheme = match ? event.title.slice(match.index + match[0].length).trim() : ''
  const split = Boolean(legacyTitle && legacyTheme)
  return {
    title: split ? legacyTitle : event.title,
    theme: event.theme?.trim() || (split ? legacyTheme : ''),
    texts: event.texts ?? [],
  }
}
