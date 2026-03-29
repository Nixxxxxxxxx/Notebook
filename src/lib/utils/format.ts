export function formatDate(date: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeDate(date: string) {
  const target = new Date(date)
  const diffMs = target.getTime() - Date.now()
  const diffHours = Math.round(diffMs / (1000 * 60 * 60))
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, 'hour')
  }

  const diffDays = Math.round(diffHours / 24)
  return rtf.format(diffDays, 'day')
}

export function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function formatCount(value: number, noun: string) {
  return `${value} ${noun}${value === 1 ? '' : 's'}`
}
