import type { TradeData } from './user-data-provider'

interface RawTrade {
  side?: string
  price?: number | string
  size?: number | string
  title?: string
  conditionId?: string
}

export function mapApiTrade(t: RawTrade): TradeData {
  const side = t.side === 'BUY' ? 'YES' : 'NO'
  return {
    marketName: t.title || t.conditionId || '',
    marketMeta: '',
    side: side as 'YES' | 'NO',
    entry: Math.round(Number(t.price ?? 0) * 100),
    exit: Math.round(Number(t.price ?? 0) * 100),
    contracts: Math.round(Number(t.size ?? 0)),
    pnl: 0,
    aiAtEntry: 0,
    result: (t.side === 'BUY' ? 'Won' : 'Lost') as 'Won' | 'Lost',
  }
}
