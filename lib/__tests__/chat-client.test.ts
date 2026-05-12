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
  it('yields token deltas from cumulative messages/partial events', async () => {
    const sseBody = [
      'event: metadata\ndata: {"run_id":"r1"}',
      'event: messages/partial\ndata: [{"type":"ai","content":"Hello","tool_calls":[]}]',
      'event: messages/partial\ndata: [{"type":"ai","content":"Hello world","tool_calls":[]}]',
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
      'event: messages/partial\ndata: [{"type":"ai","content":"ok","tool_calls":[]}]',
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

  it('skips thinking phase (empty content with reasoning)', async () => {
    const sseBody = [
      'event: messages/partial\ndata: [{"type":"ai","content":"","additional_kwargs":{"reasoning_content":"thinking..."}}]',
      'event: messages/partial\ndata: [{"type":"ai","content":"Real answer","tool_calls":[]}]',
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
    expect(tokens).toEqual(['Real answer'])
  })

  it('skips non-ai message types', async () => {
    const sseBody = [
      'event: messages/partial\ndata: [{"type":"ToolMessage","content":"tool result"}]',
      'event: messages/partial\ndata: [{"type":"ai","content":"answer","tool_calls":[]}]',
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
    expect(tokens).toEqual(['answer'])
  })

  it('calls fetch with correct payload', async () => {
    const sseBody = 'event: messages/partial\ndata: [{"type":"ai","content":"x","tool_calls":[]}]\n\n'
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

  it('passes aborted signal to fetch', () => {
    const controller = new AbortController()
    controller.abort()

    vi.spyOn(globalThis, 'fetch').mockImplementationOnce((_url, init) => {
      const sig = init?.signal
      expect(sig instanceof AbortSignal).toBe(true)
      expect(sig.aborted).toBe(true)
      return Promise.reject(new DOMException('Aborted', 'AbortError'))
    })

    // The generator won't yield anything since fetch rejects
    return expect(async () => {
      for await (const _ of streamChat('uuid-123', [{ role: 'user', content: 'hi' }], controller.signal)) {
        void _
      }
    }).rejects.toThrow()
  })
})
