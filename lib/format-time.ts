export function formatTime(iso?: string): string {
  if (!iso) return ''
  try {
    const date = new Date(iso)
    if (isNaN(date.getTime())) return ''
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    if (diffMins < 1) return 'just now'
    if (diffMins < 120) {
      if (diffMins < 60) return `${diffMins}m ago`
      return `${Math.floor(diffMins / 60)}h ago`
    }

    if (date.toDateString() === now.toDateString()) return timeStr

    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) return `Yesterday, ${timeStr}`

    if (date.getFullYear() === now.getFullYear()) {
      return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`
    }

    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}, ${timeStr}`
  } catch {
    return ''
  }
}
