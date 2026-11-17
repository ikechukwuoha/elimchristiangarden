const fellowships = new Map([
  ['brothers', 'Brothers'],
  ['couples', 'Couples'],
  ['sisters', 'Sisters'],
  ['singles', 'Singles'],
])

/** Convert an optional unit/fellowship name to its card sponsorship line. */
export function flyerSponsor(value: string): string {
  const entered = value.trim().replace(/\s+/g, ' ')
  if (!entered) return ''
  const base = entered.replace(/\s+(unit|fellowship|ministries|ministry)$/i, '').trim()
  if (!base) return ''
  const key = base.toLowerCase()
  if (key === 'tehilla') return 'Sponsored By Tehilla Ministries'
  const fellowship = fellowships.get(key)
  if (fellowship) return `Sponsored By ${fellowship} Fellowship`
  const label = base.replace(/\p{L}[\p{L}\p{M}'’-]*/gu, (word) => word[0].toLocaleUpperCase() + word.slice(1))
  return `Sponsored By ${label} Unit`
}
