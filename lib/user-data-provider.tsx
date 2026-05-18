'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from './auth-provider'
import { mapApiTrade } from './map-trade'
import { mapApiPosition } from './map-position'
import { computeSummary } from './map-summary'

interface SummaryData {
  balance: number
  totalPnl: number
  tradeCount: number
  winRate: number
  openPositions: number
  pnlToday: number
  sessionRoi: string
}

interface PositionData {
  marketName: string
  marketMeta: string
  side: 'YES' | 'NO'
  entry: number
  current: number
  contracts: number
  staked: number
  pnl: number | null
  aiAtEntry: number
}

interface TradeData {
  marketName: string
  marketMeta: string
  side: 'YES' | 'NO'
  entry: number
  exit: number
  contracts: number
  pnl: number
  aiAtEntry: number
  result: 'Won' | 'Lost'
}

interface UserDataContextValue {
  summary: SummaryData | null
  positions: PositionData[]
  trades: TradeData[]
  loading: boolean
  error: string | null
  refresh: () => void
}

const UserDataContext = createContext<UserDataContextValue>({
  summary: null,
  positions: [],
  trades: [],
  loading: false,
  error: null,
  refresh: () => {},
})

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAuth()
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [positions, setPositions] = useState<PositionData[]>([])
  const [trades, setTrades] = useState<TradeData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fetchingRef = useRef(false)

  const fetchAll = useCallback(async () => {
    if (!address || !isConnected || fetchingRef.current) return
    fetchingRef.current = true
    setLoading(true)
    setError(null)
    try {
      // Fetch trades from Data API
      const tradesRes = await fetch(`/api/data/trades?maker_address=${address}&limit=100`)
      if (!tradesRes.ok) throw new Error('Failed to fetch trade data')
      const tradesData: any[] = await tradesRes.json()
      const tradesArr = Array.isArray(tradesData) ? tradesData : []

      // Read pUSD balance via deterministic Safe wallet derivation
      const balRes = await fetch('/api/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eoa: address }),
      })
      const balData = await balRes.json()
      const balance = balData.balance ?? 0

      // Fetch open positions
      const posRes = await fetch(`/api/data/positions?user=${address}`)
      const posData: any[] = posRes.ok ? await posRes.json() : []

      setSummary(computeSummary(tradesArr, posData, balance))
      setPositions((Array.isArray(posData) ? posData : []).map(mapApiPosition))
      setTrades(tradesArr.map(mapApiTrade))
    } catch (err) {
      setError(err instanceof Error ? err.message : '数据获取失败')
    } finally {
      fetchingRef.current = false
      setLoading(false)
    }
  }, [address, isConnected])

  useEffect(() => {
    if (isConnected && address) {
      fetchAll()
    } else {
      setSummary(null)
      setPositions([])
      setTrades([])
      setError(null)
    }
  }, [isConnected, address, fetchAll])

  return (
    <UserDataContext.Provider value={{ summary, positions, trades, loading, error, refresh: fetchAll }}>
      {children}
    </UserDataContext.Provider>
  )
}

export function useUserData() {
  return useContext(UserDataContext)
}

export type { SummaryData, PositionData, TradeData }
