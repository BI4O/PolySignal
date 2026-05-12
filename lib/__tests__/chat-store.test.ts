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
