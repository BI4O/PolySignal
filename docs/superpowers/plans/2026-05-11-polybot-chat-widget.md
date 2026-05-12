# PolyBot Chat Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a floating `✦` chat button in the bottom-right corner that opens a slide-out panel connected to PolyBot's LangGraph SSE streaming API with multi-thread conversation management.

**Architecture:** 4 new files in a strict dependency chain — `chat-store` (localStorage) → `chat-client` (SSE) → `ChatPanel` (chat UI) → `ChatWidget` (shell). ChatWidget renders as a sibling of Topbar in the root layout, outside `.app-layout`. Zero new npm dependencies for runtime; only Vitest + @testing-library for tests.

**Tech Stack:** Next.js 16.2.4 (App Router), React 19, TypeScript, Vitest + @testing-library/react, hand-written CSS (no new CSS framework)

---

### Task 0: Test Infrastructure Setup

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json`
- Create: `lib/__tests__/` directory

- [ ] **Step 1: Add Vitest and testing-library dependencies**

Run:
```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitejs/plugin-react
```

- [ ] **Step 2: Create vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './lib/__tests__/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

- [ ] **Step 3: Create test setup file `lib/__tests__/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 4: Add test script to package.json**

Edit `package.json`, add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Verify test infrastructure works**

Run:
```bash
echo "import { describe, it, expect } from 'vitest'; describe('smoke', () => { it('works', () => { expect(1+1).toBe(2) }) })" > /tmp/smoke.test.ts && pnpm vitest run /tmp/smoke.test.ts && rm /tmp/smoke.test.ts
```

Expected: 1 test PASS

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts lib/__tests__/setup.ts
git commit -m "chore: add vitest + testing-library test infrastructure"
```

---

### Task 1: `lib/chat-store.ts` — localStorage Thread ID Store

**Files:**
- Create: `lib/chat-store.ts`
- Create: `lib/__tests__/chat-store.test.ts`

- [ ] **Step 1: Write the failing test file `lib/__tests__/chat-store.test.ts`**

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { getThreadIds, addThreadId } from '@/lib/chat-store'

beforeEach(() => {
  localStorage.clear()
})

describe('getThreadIds', () => {
  it('returns empty array when localStorage is empty', () => {
    expect(getThreadIds()).toEqual([])
  })

  it('returns parsed array from localStorage', () => {
    localStorage.setItem('chat_threads', JSON.stringify(['a', 'b']))
    expect(getThreadIds()).toEqual(['a', 'b'])
  })
})

describe('addThreadId', () => {
  it('appends to existing list', () => {
    localStorage.setItem('chat_threads', JSON.stringify(['a']))
    addThreadId('b')
    expect(JSON.parse(localStorage.getItem('chat_threads')!)).toEqual(['a', 'b'])
  })

  it('works on first call when no key exists', () => {
    addThreadId('first')
    expect(JSON.parse(localStorage.getItem('chat_threads')!)).toEqual(['first'])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run lib/__tests__/chat-store.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation `lib/chat-store.ts`**

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run lib/__tests__/chat-store.test.ts`
Expected: 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add lib/chat-store.ts lib/__tests__/chat-store.test.ts
git commit -m "feat: add chat-store for localStorage thread ID persistence"
```

---

### Task 2: `lib/chat-client.ts` — PolyBot SSE Streaming Client

**Files:**
- Create: `lib/chat-client.ts`
- Create: `lib/__tests__/chat-client.test.ts`

- [ ] **Step 1: Write the failing test file `lib/__tests__/chat-client.test.ts`**

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createThread, getThreadState, streamChat } from '@/lib/chat-client'

const BASE = 'http://localhost:2024'

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('createThread', () => {
  it('returns thread ID on success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ thread_id: 'uuid-123' }), { status: 200 })
    )
    const id = await createThread()
    expect(id).toBe('uuid-123')
    expect(fetch).toHaveBeenCalledWith(`${BASE}/threads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
  })

  it('throws on HTTP error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('Internal Error', { status: 500 })
    )
    await expect(createThread()).rejects.toThrow('Failed to create thread')
  })
})

describe('getThreadState', () => {
  it('returns messages array', async () => {
    const msgs = [{ role: 'user', content: 'hi' }]
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ values: { messages: msgs } }), { status: 200 })
    )
    const result = await getThreadState('uuid-123')
    expect(result).toEqual({ messages: msgs })
    expect(fetch).toHaveBeenCalledWith(`${BASE}/threads/uuid-123/state`)
  })
})

describe('streamChat', () => {
  it('yields tokens from SSE messages events', async () => {
    const sseBody = [
      'event: metadata\ndata: {"run_id":"r1"}',
      'event: messages\ndata: [{"type":"AIMessageChunk","content":"Hello","tool_calls":[]}]',
      'event: messages\ndata: [{"type":"AIMessageChunk","content":" world","tool_calls":[]}]',
      '',
    ].join('\n\n')

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(sseBody))
        controller.close()
      },
    })

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(stream, { status: 200 })
    )

    const tokens: string[] = []
    for await (const token of streamChat('uuid-123', [{ role: 'user', content: 'hi' }])) {
      tokens.push(token)
    }
    expect(tokens).toEqual(['Hello', ' world'])
  })

  it('skips non-messages events', async () => {
    const sseBody = [
      'event: metadata\ndata: {"run_id":"r1"}',
      'event: messages\ndata: [{"type":"AIMessageChunk","content":"ok","tool_calls":[]}]',
      '',
    ].join('\n\n')

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(sseBody))
        controller.close()
      },
    })

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(stream, { status: 200 })
    )

    const tokens: string[] = []
    for await (const token of streamChat('thread', [{ role: 'user', content: 'hi' }])) {
      tokens.push(token)
    }
    expect(tokens).toEqual(['ok'])
  })

  it('skips chunks with empty content (tool calls)', async () => {
    const sseBody = [
      'event: messages\ndata: [{"type":"AIMessageChunk","content":"","tool_calls":[{"name":"search","args":{}}]}]',
      'event: messages\ndata: [{"type":"AIMessageChunk","content":"Result","tool_calls":[]}]',
      '',
    ].join('\n\n')

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(sseBody))
        controller.close()
      },
    })

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(stream, { status: 200 })
    )

    const tokens: string[] = []
    for await (const token of streamChat('thread', [{ role: 'user', content: 'hi' }])) {
      tokens.push(token)
    }
    expect(tokens).toEqual(['Result'])
  })

  it('calls fetch with correct payload', async () => {
    const sseBody = 'event: messages\ndata: [{"type":"AIMessageChunk","content":"x","tool_calls":[]}]\n\n'
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(sseBody))
        controller.close()
      },
    })

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(stream, { status: 200 })
    )

    const msgs = [{ role: 'user', content: 'test' }]
    for await (const _ of streamChat('uuid-123', msgs)) { void _ }

    expect(fetchSpy).toHaveBeenCalledWith(
      `${BASE}/threads/uuid-123/runs/stream`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
        body: JSON.stringify({
          assistant_id: 'base',
          input: { messages: msgs },
          stream_mode: ['messages'],
        }),
        signal: expect.any(AbortSignal),
      }
    )
  })

  it('aborts on signal', async () => {
    const controller = new AbortController()
    controller.abort()

    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new DOMException('Aborted', 'AbortError'))

    const tokens: string[] = []
    try {
      for await (const token of streamChat('uuid-123', [{ role: 'user', content: 'hi' }], controller.signal)) {
        tokens.push(token)
      }
    } catch (_) { /* expected */ }
    expect(tokens).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run lib/__tests__/chat-client.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation `lib/chat-client.ts`**

```ts
const BASE = 'http://localhost:2024'

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

export async function* streamChat(
  threadId: string,
  messages: { role: string; content: string }[],
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const res = await fetch(`${BASE}/threads/${threadId}/runs/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
    body: JSON.stringify({
      assistant_id: 'base',
      input: { messages },
      stream_mode: ['messages'],
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
      const events = buffer.split('\n\n')
      buffer = events.pop() ?? ''

      for (const event of events) {
        const lines = event.split('\n')
        let isMessagesEvent = false
        let dataLine = ''

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            isMessagesEvent = line.slice(7) === 'messages'
          }
          if (line.startsWith('data: ')) {
            dataLine = line.slice(6)
          }
        }

        if (!isMessagesEvent || !dataLine) continue

        try {
          const chunks = JSON.parse(dataLine)
          for (const chunk of chunks) {
            if (chunk.content) {
              yield chunk.content
            }
          }
        } catch {
          // skip unparseable events
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run lib/__tests__/chat-client.test.ts`
Expected: 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add lib/chat-client.ts lib/__tests__/chat-client.test.ts
git commit -m "feat: add chat-client for PolyBot SSE streaming"
```

---

### Task 3: `app/ChatPanel.tsx` — Chat Panel Content Component

**Files:**
- Create: `app/ChatPanel.tsx`
- Create: `app/__tests__/ChatPanel.test.tsx`

- [ ] **Step 1: Write the failing test file `app/__tests__/ChatPanel.test.tsx`**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatPanel } from '@/app/ChatPanel'

// Mock chat-client
vi.mock('@/lib/chat-client', () => ({
  createThread: vi.fn(),
  getThreadState: vi.fn(),
  streamChat: vi.fn(),
}))

// Mock chat-store
vi.mock('@/lib/chat-store', () => ({
  getThreadIds: vi.fn(() => []),
  addThreadId: vi.fn(),
}))

import { createThread, getThreadState, streamChat } from '@/lib/chat-client'
import { getThreadIds, addThreadId } from '@/lib/chat-store'

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getThreadIds).mockReturnValue([])
  vi.mocked(createThread).mockResolvedValue('new-thread-123')
})

describe('ChatPanel', () => {
  it('renders welcome message with auto-created thread', async () => {
    render(<ChatPanel onClose={vi.fn()} />)
    await waitFor(() => {
      expect(screen.getByText(/Ask me about crypto/i)).toBeInTheDocument()
    })
    expect(createThread).toHaveBeenCalled()
  })

  it('does not create thread if threads already exist', () => {
    vi.mocked(getThreadIds).mockReturnValue(['existing-id'])
    render(<ChatPanel onClose={vi.fn()} />)
    expect(createThread).not.toHaveBeenCalled()
  })

  it('sends message and shows streaming response', async () => {
    const user = userEvent.setup()

    async function* mockStream() {
      yield 'Hello'
      yield ' user'
    }

    vi.mocked(streamChat).mockReturnValue(mockStream())

    render(<ChatPanel onClose={vi.fn()} />)

    await waitFor(() => {
      expect(createThread).toHaveBeenCalled()
    })

    const input = screen.getByPlaceholderText(/type a message/i)
    await user.type(input, 'hi')
    await user.click(screen.getByRole('button', { name: /send/i }))

    await waitFor(() => {
      expect(screen.getByText('Hello user')).toBeInTheDocument()
    })
  })

  it('disables send button while streaming', async () => {
    const user = userEvent.setup()
    // never resolves stream to keep isStreaming=true
    vi.mocked(streamChat).mockReturnValue(
      (async function* () { yield '...' })()
    )

    render(<ChatPanel onClose={vi.fn()} />)

    await waitFor(() => expect(createThread).toHaveBeenCalled())

    const input = screen.getByPlaceholderText(/type a message/i)
    await user.type(input, 'hi')
    await user.click(screen.getByRole('button', { name: /send/i }))

    const sendBtn = screen.getByRole('button', { name: /send/i })
    expect(sendBtn).toBeDisabled()
  })

  it('creates new thread on + click', async () => {
    const user = userEvent.setup()
    vi.mocked(createThread).mockResolvedValue('new-thread-456')

    render(<ChatPanel onClose={vi.fn()} />)

    await waitFor(() => expect(createThread).toHaveBeenCalledOnce())

    await user.click(screen.getByRole('button', { name: '+' }))

    expect(createThread).toHaveBeenCalledTimes(2)
    expect(addThreadId).toHaveBeenCalledWith('new-thread-456')
  })

  it('loads history when switching thread', async () => {
    const user = userEvent.setup()
    vi.mocked(getThreadIds).mockReturnValue(['old-id', 'current-id'])
    vi.mocked(getThreadState).mockResolvedValue({
      messages: [{ role: 'user', content: 'old message' }],
    })

    render(<ChatPanel onClose={vi.fn()} />)

    const select = screen.getByRole('combobox')
    await user.selectOptions(select, 'old-id')

    await waitFor(() => {
      expect(getThreadState).toHaveBeenCalledWith('old-id')
      expect(screen.getByText('old message')).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run app/__tests__/ChatPanel.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation `app/ChatPanel.tsx`**

```tsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createThread, getThreadState, streamChat } from '@/lib/chat-client'
import { getThreadIds, addThreadId } from '@/lib/chat-store'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function ChatPanel({ onClose }: { onClose: () => void }) {
  const [threadId, setThreadId] = useState<string | null>(null)
  const [threadIds, setThreadIds] = useState<string[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Initialize: load existing threads or create one
  useEffect(() => {
    const existing = getThreadIds()
    setThreadIds(existing)
    if (existing.length > 0) {
      setThreadId(existing[existing.length - 1])
    } else {
      createThread()
        .then((id) => {
          addThreadId(id)
          setThreadIds([id])
          setThreadId(id)
        })
        .catch(() => setError('Failed to create conversation'))
    }
  }, [])

  const handleNewThread = async () => {
    try {
      const id = await createThread()
      addThreadId(id)
      setThreadIds((prev) => [...prev, id])
      setThreadId(id)
      setMessages([])
      setError(null)
    } catch {
      setError('Failed to create new conversation')
    }
  }

  const handleSwitchThread = async (id: string) => {
    setIsLoadingHistory(true)
    setError(null)
    try {
      const state = await getThreadState(id)
      setThreadId(id)
      setMessages(state.messages)
    } catch {
      setError('Failed to load conversation')
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isStreaming || !threadId) return

    const userMessage: Message = { role: 'user', content: input.trim() }
    setInput('')
    setMessages((prev) => [...prev, userMessage])
    setIsStreaming(true)
    setError(null)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const assistantMessage: Message = { role: 'assistant', content: '' }
      setMessages((prev) => [...prev, assistantMessage])

      for await (const token of streamChat(threadId, [userMessage], controller.signal)) {
        setMessages((prev) => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last && last.role === 'assistant') {
            last.content += token
          }
          return [...updated]
        })
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last && last.role === 'assistant') {
          last.content += ' \u26a0\ufe0f Connection lost. Try again.'
        }
        return [...updated]
      })
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClose = () => {
    abortRef.current?.abort()
    onClose()
  }

  return (
    <div className="chat-panel-inner">
      {/* Header */}
      <div className="chat-panel-header">
        <span className="chat-panel-title">PolyBot</span>
        <div className="chat-panel-header-actions">
          <button
            className="chat-new-btn"
            onClick={handleNewThread}
            aria-label="+"
            title="New conversation"
          >
            +
          </button>
          <button className="chat-close-btn" onClick={handleClose} aria-label="Close">
            ✕
          </button>
        </div>
      </div>

      {/* Thread selector */}
      {threadIds.length > 0 && (
        <div className="chat-thread-selector">
          <select
            value={threadId ?? ''}
            onChange={(e) => handleSwitchThread(e.target.value)}
          >
            {threadIds.map((id) => (
              <option key={id} value={id}>
                {id.slice(0, 8)}...
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Messages */}
      <div className="chat-messages">
        {isLoadingHistory && <div className="chat-loading">Loading...</div>}
        {error && <div className="chat-error">{error}</div>}
        {!isLoadingHistory && messages.length === 0 && (
          <div className="chat-welcome">
            Ask me about crypto, prediction markets, or news.
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}
          >
            {msg.content}
            {isStreaming && i === messages.length - 1 && msg.role === 'assistant' && (
              <span className="chat-cursor">|</span>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <textarea
          className="chat-input"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          disabled={isStreaming}
        />
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={isStreaming || !input.trim()}
          aria-label="Send"
        >
          Send
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests and verify they pass**

Run: `pnpm vitest run app/__tests__/ChatPanel.test.tsx`
Expected: 6 tests PASS

- [ ] **Step 5: Add ChatPanel CSS to `app/globals.css`**

Append at the end of `globals.css`:

```css
/* ChatPanel */
.chat-panel-inner {
  display: flex; flex-direction: column;
  height: 100%;
}

.chat-panel-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  height: 48px; flex-shrink: 0;
}

.chat-panel-title {
  font-weight: 600; font-size: 15px;
}

.chat-panel-header-actions {
  display: flex; align-items: center; gap: 8px;
}

.chat-new-btn {
  background: none; border: 1px solid var(--border);
  border-radius: 4px; cursor: pointer;
  font-size: 18px; line-height: 1;
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  color: var(--muted);
}

.chat-close-btn {
  background: none; border: none; cursor: pointer;
  font-size: 16px; color: var(--muted);
  line-height: 1; padding: 4px;
}

.chat-thread-selector {
  padding: 8px 16px;
  border-bottom: 1px solid var(--border);
}

.chat-thread-selector select {
  width: 100%; padding: 4px 8px;
  font-size: 12px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--surface);
  color: var(--text);
}

.chat-messages {
  flex: 1; overflow-y: auto; padding: 16px;
  display: flex; flex-direction: column; gap: 8px;
}

.chat-welcome {
  text-align: center; color: var(--muted);
  font-size: 14px; margin-top: 40px;
}

.chat-loading {
  text-align: center; color: var(--muted); font-size: 13px;
}

.chat-error {
  text-align: center; color: #d32f2f; font-size: 13px;
  background: rgba(211,47,47,.08);
  padding: 8px 12px; border-radius: 6px;
}

.chat-bubble {
  max-width: 80%; padding: 8px 12px;
  border-radius: 12px; font-size: 14px;
  line-height: 1.5; word-break: break-word;
}

.chat-bubble-user {
  align-self: flex-end;
  background: var(--surface);
  border-bottom-right-radius: 4px;
}

.chat-bubble-assistant {
  align-self: flex-start;
  background: color-mix(in oklch, var(--accent) 8%, transparent);
  border-bottom-left-radius: 4px;
}

.chat-cursor {
  animation: blink 1s step-end infinite;
  font-weight: 100; color: var(--muted);
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.chat-input-area {
  display: flex; gap: 8px; padding: 12px 16px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.chat-input {
  flex: 1; resize: none;
  padding: 8px 12px; font-size: 14px;
  font-family: inherit;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text);
  outline: none;
}

.chat-input:focus {
  border-color: var(--accent);
}

.chat-input:disabled {
  opacity: .5;
}

.chat-send-btn {
  padding: 8px 16px; font-size: 14px; font-weight: 500;
  background: var(--accent); color: #fff;
  border: none; border-radius: 8px; cursor: pointer;
  white-space: nowrap;
}

.chat-send-btn:disabled {
  opacity: .5; cursor: default;
}
```

- [ ] **Step 6: Commit**

```bash
git add app/ChatPanel.tsx app/__tests__/ChatPanel.test.tsx app/globals.css
git commit -m "feat: add ChatPanel with thread management and chat UI"
```

---

### Task 4: `app/ChatWidget.tsx` — Floating Button + Panel Shell

**Files:**
- Create: `app/ChatWidget.tsx`
- Create: `app/__tests__/ChatWidget.test.tsx`

- [ ] **Step 1: Write the failing test file `app/__tests__/ChatWidget.test.tsx`**

```ts
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatWidget } from '@/app/ChatWidget'

describe('ChatWidget', () => {
  it('renders floating button', () => {
    render(<ChatWidget />)
    expect(screen.getByRole('button', { name: /open chat/i })).toBeInTheDocument()
  })

  it('opens panel on button click', async () => {
    const user = userEvent.setup()
    render(<ChatWidget />)
    await user.click(screen.getByRole('button', { name: /open chat/i }))
    // Once open, the ChatPanel renders inside; mock children check
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
  })

  it('shows close button when open', async () => {
    const user = userEvent.setup()
    render(<ChatWidget />)
    await user.click(screen.getByRole('button', { name: /open chat/i }))
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run app/__tests__/ChatWidget.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation `app/ChatWidget.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { ChatPanel } from '@/app/ChatPanel'

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        className="chat-fab"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Close' : 'Open chat'}
      >
        {isOpen ? '✕' : '✦'}
      </button>

      {isOpen && (
        <aside className="chat-panel">
          <ChatPanel onClose={() => setIsOpen(false)} />
        </aside>
      )}
    </>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run app/__tests__/ChatWidget.test.tsx`
Expected: 3 tests PASS

- [ ] **Step 5: Add ChatWidget CSS to `app/globals.css`**

Append at the end of `globals.css`:

```css
/* ChatWidget */
.chat-fab {
  position: fixed; bottom: 20px; right: 20px;
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--surface); border: 1px solid var(--border);
  color: var(--muted); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; z-index: 300;
  box-shadow: 0 2px 8px rgba(0,0,0,.06);
  transition: box-shadow .2s;
}

.chat-fab:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,.12);
}

.chat-panel {
  position: fixed; top: 0; right: 0; bottom: 0;
  width: 25vw; min-width: 320px; max-width: 480px;
  background: var(--bg); border-left: 1px solid var(--border);
  box-shadow: -4px 0 24px rgba(0,0,0,.08);
  z-index: 299;
  animation: slide-in .2s ease-out;
}

@keyframes slide-in {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
```

- [ ] **Step 6: Commit**

```bash
git add app/ChatWidget.tsx app/__tests__/ChatWidget.test.tsx app/globals.css
git commit -m "feat: add ChatWidget floating button and panel shell"
```

---

### Task 5: Wire ChatWidget into Root Layout

**Files:**
- Modify: `app/layout.tsx`
- Read: `app/layout.tsx` first to see current structure

- [ ] **Step 1: Read current layout.tsx**

Run: `cat app/layout.tsx`

- [ ] **Step 2: Edit layout.tsx — add ChatWidget import and render it as a sibling of Topbar**

After reading the file, the edit is:

Add import:
```tsx
import { ChatWidget } from '@/app/ChatWidget'
```

Render `<ChatWidget />` inside `<body>`, after the `{children}` wrapper div, as a sibling to `<Topbar />`:

```tsx
// expected structure after edit:
<body>
  <LanguageProvider>
    <Topbar />
    <div className="app-layout">{children}</div>
    <ChatWidget />
  </LanguageProvider>
</body>
```

- [ ] **Step 3: Build check**

Run: `pnpm build`
Expected: Build succeeds with no errors

- [ ] **Step 4: Manual smoke test**

Start both services:
```bash
# Terminal 1: cd ../PolyBot && uv run langgraph dev
# Terminal 2: cd newsai_v1 && pnpm dev
```

Open the app, verify:
- ✦ button visible in bottom-right
- Click opens panel from right
- Send a message, see streaming response
- Click + to start new thread
- Switch threads via dropdown

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: wire ChatWidget into root layout"
```
