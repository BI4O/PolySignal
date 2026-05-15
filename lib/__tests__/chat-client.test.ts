import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createThread, getThreadState, streamChat } from '@/lib/chat-client'

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('createThread', () => {
  it('returns id and createdAt on success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ thread_id: 'uuid-123', created_at: '2025-01-01T00:00:00Z' }), { status: 200 })
    )
    const result = await createThread()
    expect(result).toEqual({ id: 'uuid-123', createdAt: '2025-01-01T00:00:00Z' })
    const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toContain('/api/langgraph/threads')
    expect(init.method).toBe('POST')
    expect(init.headers['Content-Type']).toBe('application/json')
    expect(init.body).toBe(JSON.stringify({}))
  })

  it('throws on HTTP error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('Internal Error', { status: 500 })
    )
    await expect(createThread()).rejects.toThrow('Failed to create thread')
  })
})

describe('getThreadState', () => {
  it('returns messages with mapped roles and createdAt', async () => {
    const apiMessages = [
      { type: 'human', content: 'hi', created_at: '2025-01-01T00:00:00Z' },
      { type: 'ai', content: 'hello there', created_at: '2025-01-01T00:00:05Z' },
    ]
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ values: { messages: apiMessages } }), { status: 200 })
    )
    const result = await getThreadState('uuid-123')
    expect(result).toEqual({
      messages: [
        { role: 'user', content: 'hi', createdAt: '2025-01-01T00:00:00Z' },
        { role: 'assistant', content: 'hello there', createdAt: '2025-01-01T00:00:05Z' },
      ],
    })
    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toContain('/api/langgraph/threads/uuid-123/state')
  })

  it('returns empty messages when no values', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 })
    )
    const result = await getThreadState('uuid-123')
    expect(result).toEqual({ messages: [] })
  })
})

describe('streamChat', () => {
  function sseResponse(...events: string[]) {
    const body = events.join('\n\n') + '\n\n'
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(body))
        controller.close()
      },
    })
    return new Response(stream, { status: 200, headers: { 'Content-Type': 'text/event-stream' } })
  }

  it('yields content from values events', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      sseResponse(
        'event: values\ndata: {"messages":[{"type":"ai","content":"Hello"}]}',
        'event: values\ndata: {"messages":[{"type":"ai","content":"Hello world"}]}'
      )
    )

    const chunks: string[] = []
    await streamChat('uuid-123', [{ role: 'user', content: 'hi' }], new AbortController().signal, (content) => {
      chunks.push(content)
    })
    expect(chunks).toEqual(['Hello', 'Hello world'])
  })

  it('skips non-values events', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      sseResponse(
        'event: metadata\ndata: {"run_id":"r1"}',
        'event: values\ndata: {"messages":[{"type":"ai","content":"ok"}]}'
      )
    )

    const chunks: string[] = []
    await streamChat('uuid-123', [{ role: 'user', content: 'hi' }], new AbortController().signal, (content) => {
      chunks.push(content)
    })
    expect(chunks).toEqual(['ok'])
  })

  it('skips messages with empty content', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      sseResponse(
        'event: values\ndata: {"messages":[{"type":"ai","content":""}]}',
        'event: values\ndata: {"messages":[{"type":"ai","content":"Real answer"}]}'
      )
    )

    const chunks: string[] = []
    await streamChat('uuid-123', [{ role: 'user', content: 'hi' }], new AbortController().signal, (content) => {
      chunks.push(content)
    })
    expect(chunks).toEqual(['Real answer'])
  })

  it('skips non-ai message types in values events', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      sseResponse(
        'event: values\ndata: {"messages":[{"type":"human","content":"hi"}]}',
        'event: values\ndata: {"messages":[{"type":"ai","content":"answer"}]}'
      )
    )

    const chunks: string[] = []
    await streamChat('uuid-123', [{ role: 'user', content: 'hi' }], new AbortController().signal, (content) => {
      chunks.push(content)
    })
    expect(chunks).toEqual(['answer'])
  })

  it('calls fetch with correct payload', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      sseResponse('event: values\ndata: {"messages":[{"type":"ai","content":"x"}]}')
    )

    const msgs = [{ role: 'user', content: 'test' }]
    await streamChat('uuid-123', msgs, new AbortController().signal, () => {})

    const [callUrl, callInit] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(callUrl).toContain('/api/langgraph/threads/uuid-123/runs/stream')
    expect(callInit.method).toBe('POST')
    expect(callInit.headers).toEqual({ 'Content-Type': 'application/json', 'Accept': 'text/event-stream' })
    expect(JSON.parse(callInit.body)).toEqual({
      assistant_id: 'base',
      input: { messages: msgs },
      stream_mode: ['values'],
    })
    expect(callInit.signal).toBeInstanceOf(AbortSignal)
  })

  it('passes aborted signal and throws on abort', async () => {
    const controller = new AbortController()
    controller.abort()

    vi.spyOn(globalThis, 'fetch').mockImplementationOnce((_url, init) => {
      const sig = init?.signal
      expect(sig instanceof AbortSignal).toBe(true)
      expect(sig.aborted).toBe(true)
      return Promise.reject(new DOMException('Aborted', 'AbortError'))
    })

    await expect(
      streamChat('uuid-123', [{ role: 'user', content: 'hi' }], controller.signal, () => {})
    ).rejects.toThrow()
  })

  it('throws on non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('Bad Request', { status: 400 })
    )

    await expect(
      streamChat('uuid-123', [{ role: 'user', content: 'hi' }], new AbortController().signal, () => {})
    ).rejects.toThrow('Failed to stream chat')
  })
})
