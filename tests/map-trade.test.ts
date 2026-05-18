import { describe, it, expect } from 'vitest'
import { mapApiTrade } from '@/lib/map-trade'

describe('mapApiTrade', () => {
  it('maps a full trade correctly', () => {
    const result = mapApiTrade({ side: 'BUY', price: 0.55, size: 10, title: 'BTC above $100k' })
    expect(result).toEqual({
      marketName: 'BTC above $100k',
      marketMeta: '',
      side: 'YES',
      entry: 55,
      exit: 55,
      contracts: 10,
      pnl: 0,
      aiAtEntry: 0,
      result: 'Won',
    })
  })

  it('maps a SELL trade correctly', () => {
    const result = mapApiTrade({ side: 'SELL', price: 0.3, size: 5, title: 'ETH up or down' })
    expect(result).toEqual({
      marketName: 'ETH up or down',
      marketMeta: '',
      side: 'NO',
      entry: 30,
      exit: 30,
      contracts: 5,
      pnl: 0,
      aiAtEntry: 0,
      result: 'Lost',
    })
  })

  it('falls back to conditionId when title is missing', () => {
    const result = mapApiTrade({ side: 'BUY', price: 0.5, size: 1, conditionId: '0xabc' })
    expect(result.marketName).toBe('0xabc')
  })

  it('uses empty string when both title and conditionId are missing', () => {
    const result = mapApiTrade({ side: 'BUY', price: 0.5, size: 1 })
    expect(result.marketName).toBe('')
  })

  it('handles string price and size', () => {
    const result = mapApiTrade({ side: 'BUY', price: '0.75', size: '3.5' })
    expect(result.entry).toBe(75)
    expect(result.exit).toBe(75)
    expect(result.contracts).toBe(4) // Math.round(3.5)
  })

  it('handles undefined price and size', () => {
    const result = mapApiTrade({ side: 'BUY' })
    expect(result.entry).toBe(0)
    expect(result.contracts).toBe(0)
  })

  it('handles empty object', () => {
    const result = mapApiTrade({})
    expect(result.side).toBe('NO')
    expect(result.entry).toBe(0)
    expect(result.contracts).toBe(0)
    expect(result.result).toBe('Lost')
  })
})
