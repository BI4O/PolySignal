import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { formatTime } from '@/lib/format-time'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-05-16T14:30:00'))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('formatTime', () => {
  it('returns empty string for undefined', () => {
    expect(formatTime()).toBe('')
  })

  it('returns empty string for empty string', () => {
    expect(formatTime('')).toBe('')
  })

  it('returns empty string for invalid date', () => {
    expect(formatTime('not-a-date')).toBe('')
  })

  it('returns "just now" for less than 1 minute ago', () => {
    expect(formatTime('2026-05-16T14:29:31')).toBe('just now')
  })

  it('returns minutes ago for less than 60 minutes', () => {
    expect(formatTime('2026-05-16T14:25:00')).toBe('5m ago')
  })

  it('returns hours ago for 1-2 hours', () => {
    expect(formatTime('2026-05-16T13:00:00')).toBe('1h ago')
    expect(formatTime('2026-05-16T12:30:01')).toBe('1h ago')
  })

  it('returns just time for today but over 2 hours ago', () => {
    const result = formatTime('2026-05-16T11:00:00')
    expect(result).toMatch(/^11:00/)
  })

  it('prefixes "Yesterday" for yesterday', () => {
    expect(formatTime('2026-05-15T14:30:00')).toMatch(/^Yesterday/)
  })

  it('includes date for this year but not yesterday', () => {
    expect(formatTime('2026-05-01T09:00:00')).toMatch(/^May 1/)
  })

  it('includes year for different year', () => {
    expect(formatTime('2025-12-25T10:00:00')).toMatch(/2025/)
  })
})
