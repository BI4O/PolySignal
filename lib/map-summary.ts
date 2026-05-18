import type { SummaryData } from './user-data-provider'

interface TradeSummaryInput {
  side?: string
}

interface PositionSummaryInput {
  conditionId?: string
}

export function computeSummary(
  trades: TradeSummaryInput[],
  positions: PositionSummaryInput[],
  balance: number,
): SummaryData {
  const won = trades.filter(t => t.side === 'SELL').length
  const posArr = Array.isArray(positions) ? positions : []

  return {
    balance,
    totalPnl: 0,
    tradeCount: trades.length,
    winRate: trades.length > 0 ? Math.round((won / trades.length) * 100) : 0,
    openPositions: posArr.length,
    pnlToday: 0,
    sessionRoi: '0%',
  }
}
