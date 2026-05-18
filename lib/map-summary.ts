import type { SummaryData } from './user-data-provider'

interface TradeSummaryInput {
  side?: string
}

interface PositionSummaryInput {
  conditionId?: string
}

interface ClosedPositionInput {
  realizedPnl?: number
}

export function computeSummary(
  _trades: TradeSummaryInput[],
  positions: PositionSummaryInput[],
  balance: number,
  closedPositions: ClosedPositionInput[] = [],
): SummaryData {
  const posArr = Array.isArray(positions) ? positions : []
  const closedArr = Array.isArray(closedPositions) ? closedPositions : []

  const totalPnl = closedArr.reduce((sum, p) => sum + (p.realizedPnl ?? 0), 0)
  const won = closedArr.filter(p => (p.realizedPnl ?? 0) >= 0).length

  return {
    balance,
    totalPnl: Math.round(totalPnl * 100) / 100,
    tradeCount: closedArr.length,
    winRate: closedArr.length > 0 ? Math.round((won / closedArr.length) * 100) : 0,
    openPositions: posArr.length,
    pnlToday: 0,
    sessionRoi: '0%',
  }
}
