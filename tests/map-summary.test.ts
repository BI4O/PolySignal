import { describe, it, expect } from 'vitest'
import { computeSummary } from '@/lib/map-summary'

describe('computeSummary', () => {
  it('computes with trades and positions', () => {
    const trades = [{ side: 'BUY' }, { side: 'SELL' }, { side: 'SELL' }]
    const positions = [{ conditionId: '0x1' }]
    const result = computeSummary(trades, positions, 56.36)
    expect(result).toEqual({
      balance: 56.36,
      totalPnl: 0,
      tradeCount: 3,
      winRate: 67, // 2 SELL out of 3 = 67%
      openPositions: 1,
      pnlToday: 0,
      sessionRoi: '0%',
    })
  })

  it('handles empty trades and positions', () => {
    const result = computeSummary([], [], 0)
    expect(result).toEqual({
      balance: 0,
      totalPnl: 0,
      tradeCount: 0,
      winRate: 0,
      openPositions: 0,
      pnlToday: 0,
      sessionRoi: '0%',
    })
  })

  it('provides 0 winRate for empty trades', () => {
    const result = computeSummary([], [], 100)
    expect(result.winRate).toBe(0)
  })

  it('handles all BUY trades (zero win rate)', () => {
    const result = computeSummary([{ side: 'BUY' }, { side: 'BUY' }], [], 0)
    expect(result.winRate).toBe(0)
    expect(result.tradeCount).toBe(2)
  })

  it('handles all SELL trades (100% win rate)', () => {
    const result = computeSummary([{ side: 'SELL' }, { side: 'SELL' }], [], 0)
    expect(result.winRate).toBe(100)
    expect(result.tradeCount).toBe(2)
  })

  it('handles null/undefined positions', () => {
    const result = computeSummary([{ side: 'BUY' }], null as any, 0)
    expect(result.openPositions).toBe(0)
  })

  it('preserves balance as-is', () => {
    const result = computeSummary([], [], 1234.56)
    expect(result.balance).toBe(1234.56)
  })
})
