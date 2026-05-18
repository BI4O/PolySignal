import { describe, it, expect } from 'vitest'
import { mapApiPosition } from '@/lib/map-position'

describe('mapApiPosition', () => {
  it('maps a full position correctly', () => {
    const result = mapApiPosition({ title: 'BTC above $100k', avgPrice: 0.55, curPrice: 0.6, size: 10, cashPnl: 5.5 })
    expect(result).toEqual({
      marketName: 'BTC above $100k',
      marketMeta: '',
      side: 'YES',
      entry: 55,
      current: 60,
      contracts: 10,
      staked: 5.5,
      pnl: 5.5,
      aiAtEntry: 0,
    })
  })

  it('calculates staked as size * avgPrice', () => {
    const result = mapApiPosition({ avgPrice: 0.5, size: 100 })
    expect(result.staked).toBe(50)
    expect(result.contracts).toBe(100)
  })

  it('handles negative pnl', () => {
    const result = mapApiPosition({ avgPrice: 0.5, size: 10, cashPnl: -3.2 })
    expect(result.pnl).toBe(-3.2)
  })

  it('handles null pnl', () => {
    const result = mapApiPosition({ avgPrice: 0.5, size: 10, cashPnl: null })
    expect(result.pnl).toBeNull()
  })

  it('falls back to conditionId when title is missing', () => {
    const result = mapApiPosition({ conditionId: '0xdef', avgPrice: 0.5, size: 1 })
    expect(result.marketName).toBe('0xdef')
  })

  it('uses Unknown when both title and conditionId are missing', () => {
    const result = mapApiPosition({ avgPrice: 0.5, size: 1 })
    expect(result.marketName).toBe('Unknown')
  })

  it('handles string price and size', () => {
    const result = mapApiPosition({ avgPrice: '0.4', curPrice: '0.45', size: '2.6' })
    expect(result.entry).toBe(40)
    expect(result.current).toBe(45)
    expect(result.contracts).toBe(3) // Math.round(2.6)
  })

  it('handles missing optional fields', () => {
    const result = mapApiPosition({})
    expect(result.marketName).toBe('Unknown')
    expect(result.entry).toBe(0)
    expect(result.current).toBe(0)
    expect(result.contracts).toBe(0)
    expect(result.staked).toBe(0)
    expect(result.pnl).toBeNull()
  })
})
