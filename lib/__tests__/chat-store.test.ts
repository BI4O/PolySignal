import { describe, it, expect, beforeEach } from 'vitest'
import { getThreads, addThread } from '@/lib/chat-store'

beforeEach(() => {
  localStorage.clear()
})

describe('getThreads', () => {
  it('returns empty array when localStorage is empty', () => {
    expect(getThreads()).toEqual([])
  })

  it('returns parsed array from localStorage', () => {
    const data = [{ id: 'a', createdAt: '' }, { id: 'b', createdAt: '' }]
    localStorage.setItem('chat_threads', JSON.stringify(data))
    expect(getThreads()).toEqual(data)
  })

  it('handles legacy string[] format', () => {
    localStorage.setItem('chat_threads', JSON.stringify(['a', 'b']))
    const result = getThreads()
    expect(result).toEqual([{ id: 'a', createdAt: '' }, { id: 'b', createdAt: '' }])
  })
})

describe('addThread', () => {
  it('appends to existing list', () => {
    localStorage.setItem('chat_threads', JSON.stringify([{ id: 'a', createdAt: '' }]))
    addThread({ id: 'b', createdAt: '' })
    expect(JSON.parse(localStorage.getItem('chat_threads')!)).toEqual([
      { id: 'a', createdAt: '' },
      { id: 'b', createdAt: '' },
    ])
  })

  it('works on first call when no key exists', () => {
    addThread({ id: 'first', createdAt: '2025-01-01T00:00:00Z' })
    expect(JSON.parse(localStorage.getItem('chat_threads')!)).toEqual([
      { id: 'first', createdAt: '2025-01-01T00:00:00Z' },
    ])
  })
})
