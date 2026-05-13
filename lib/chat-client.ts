const HOST = process.env.NEXT_PUBLIC_LANGGRAPH_HOST
const PORT = process.env.NEXT_PUBLIC_LANGGRAPH_PORT
if (!HOST || !PORT) throw new Error('NEXT_PUBLIC_LANGGRAPH_HOST and NEXT_PUBLIC_LANGGRAPH_PORT must be set')
const BASE = `http://${HOST}:${PORT}`

export async function createThread(): Promise<string> {
  const res = await fetch(`${BASE}/threads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
  if (!res.ok) throw new Error('Failed to create thread')
  const data = await res.json()
  return data.thread_id
}

export async function getThreadState(threadId: string): Promise<{ messages: { role: string; content: string }[] }> {
  const res = await fetch(`${BASE}/threads/${threadId}/state`)
  if (!res.ok) throw new Error('Failed to get thread state')
  const data = await res.json()
  return { messages: data.values?.messages ?? [] }
}

export async function streamChat(
  threadId: string,
  messages: { role: string; content: string }[],
  signal: AbortSignal,
  onValue: (fullContent: string) => void,
): Promise<void> {
  const res = await fetch(`${BASE}/threads/${threadId}/runs/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
    body: JSON.stringify({
      assistant_id: 'base',
      input: { messages },
      stream_mode: ['values'],
    }),
    signal,
  })

  if (!res.ok) throw new Error('Failed to stream chat')
  if (!res.body) throw new Error('No response body')

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      // Normalize CRLF -> LF (SSE spec allows both)
      buffer = buffer.replace(/\r\n/g, '\n')
      const events = buffer.split('\n\n')
      buffer = events.pop() ?? ''

      for (const event of events) {
        const lines = event.split('\n')
        let dataLine = ''

        for (const line of lines) {
          if (line.startsWith('event: ') && line.slice(7) !== 'values') {
            dataLine = ''
            break
          }
          if (line.startsWith('data: ')) {
            dataLine = line.slice(6)
          }
        }

        if (!dataLine) continue

        try {
          const state = JSON.parse(dataLine)
          const msgs: Array<{ type?: string; content?: string }> = state.messages ?? []
          const last = msgs[msgs.length - 1]
          if (last && last.type === 'ai' && last.content) {
            onValue(last.content)
          }
        } catch {
          // skip
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}
