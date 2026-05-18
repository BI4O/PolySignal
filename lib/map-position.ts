import type { PositionData } from './user-data-provider'

interface RawPosition {
  title?: string
  conditionId?: string
  avgPrice?: number | string
  curPrice?: number | string
  size?: number | string
  cashPnl?: number | null
}

export function mapApiPosition(p: RawPosition): PositionData {
  const avgPrice = Number(p.avgPrice ?? 0)
  const size = Number(p.size ?? 0)
  return {
    marketName: p.title || p.conditionId || 'Unknown',
    marketMeta: '',
    side: 'YES' as 'YES' | 'NO',
    entry: Math.round(avgPrice * 100),
    current: Math.round(Number(p.curPrice ?? 0) * 100),
    contracts: Math.round(size),
    staked: size * avgPrice,
    pnl: p.cashPnl ?? null,
    aiAtEntry: 0,
  }
}
