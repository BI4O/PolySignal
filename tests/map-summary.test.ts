import { describe, it, expect } from 'vitest'
import { computeSummary } from '@/lib/map-summary'

describe('computeSummary', () => {
  it('computes from closed positions and open positions', () => {
    const closedPositions = [{ realizedPnl: 5.5 }, { realizedPnl: -2.0 }, { realizedPnl: 3.2 }]
    const positions = [{ conditionId: '0x1' }]
    const result = computeSummary([], positions, 56.36, closedPositions)
    expect(result).toEqual({
      balance: 56.36,
      totalPnl: 6.7, // 5.5 - 2.0 + 3.2
      tradeCount: 3,
      winRate: 67, // 2 profitable out of 3
      openPositions: 1,
      pnlToday: 0,
      sessionRoi: '0%',
    })
  })

  it('handles empty data', () => {
    const result = computeSummary([], [], 0, [])
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

  it('provides 0 winRate for empty closed positions', () => {
    const result = computeSummary([], [], 100, [])
    expect(result.winRate).toBe(0)
  })

  it('handles all profitable closed positions', () => {
    const result = computeSummary([], [], 0, [{ realizedPnl: 1 }, { realizedPnl: 2 }])
    expect(result.winRate).toBe(100)
    expect(result.tradeCount).toBe(2)
  })

  it('handles all losing closed positions', () => {
    const result = computeSummary([], [], 0, [{ realizedPnl: -1 }, { realizedPnl: -2 }])
    expect(result.winRate).toBe(0)
    expect(result.tradeCount).toBe(2)
  })

  it('handles null/undefined positions', () => {
    const result = computeSummary([], null as any, 0, [])
    expect(result.openPositions).toBe(0)
  })

  it('preserves balance as-is', () => {
    const result = computeSummary([], [], 1234.56, [])
    expect(result.balance).toBe(1234.56)
  })
})
