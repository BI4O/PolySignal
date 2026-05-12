const KEY = 'chat_threads'

export function getThreadIds(): string[] {
  const raw = localStorage.getItem(KEY)
  if (!raw) return []
  return JSON.parse(raw)
}

export function addThreadId(id: string): void {
  const ids = getThreadIds()
  ids.push(id)
  localStorage.setItem(KEY, JSON.stringify(ids))
}
