'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from './auth-provider'
import { deriveSafeWallet } from './derive-wallet'
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

  const doFetch = useCallback(async (silent = false) => {
    if (!address || !isConnected || fetchingRef.current) return

    const hexAddress = address.includes(':') ? `0x${address.split(':').pop()!}` : address

    fetchingRef.current = true
    if (!silent) setLoading(true)
    setError(null)
    try {
      const DATA_API = 'https://data-api.polymarket.com'
      const proxyWallet = deriveSafeWallet(hexAddress)

      const [tradesRes, balRes, posRes, closedPosRes] = await Promise.all([
        fetch(`${DATA_API}/trades?user=${proxyWallet}&limit=200`),
        fetch('/api/balance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eoa: hexAddress }),
        }),
        fetch(`${DATA_API}/positions?user=${proxyWallet}`),
        fetch(`${DATA_API}/closed-positions?user=${proxyWallet}&limit=50`),
      ])

      if (!tradesRes.ok) throw new Error('Failed to fetch trade data')
      const [tradesData, balData, posData, closedPosData] = await Promise.all([
        tradesRes.json(),
        balRes.json(),
        posRes.ok ? posRes.json() : Promise.resolve([]),
        closedPosRes.ok ? closedPosRes.json() : Promise.resolve([]),
      ])

      const tradesArr = Array.isArray(tradesData) ? tradesData : []
      const balance = balData.balance ?? 0
      const positionsArr = Array.isArray(posData) ? posData : []
      const closedPosArr = Array.isArray(closedPosData) ? closedPosData : []

      const historyTrades: TradeData[] = closedPosArr.map((cp: any) => ({
        marketName: cp.title || '',
        marketMeta: '',
        side: cp.outcome === 'Yes' ? 'YES' as const : 'NO' as const,
        entry: Math.round(Number(cp.avgPrice ?? 0) * 100),
        exit: 100,
        contracts: Math.round(Number(cp.totalBought ?? 0)),
        pnl: Number(cp.realizedPnl ?? 0),
        aiAtEntry: 0,
        result: (Number(cp.realizedPnl ?? 0) >= 0 ? 'Won' : 'Lost') as 'Won' | 'Lost',
      }))

      setSummary(computeSummary(tradesArr, positionsArr, balance, closedPosArr))
      setPositions(positionsArr.map(mapApiPosition))
      setTrades(historyTrades)
    } catch (err) {
      setError(err instanceof Error ? err.message : '数据获取失败')
    } finally {
      fetchingRef.current = false
      if (!silent) setLoading(false)
    }
  }, [address, isConnected])

  const fetchAll = useCallback(() => doFetch(false), [doFetch])
  const refresh = useCallback(() => doFetch(true), [doFetch])

  useEffect(() => {
    if (isConnected && address) {
      doFetch(false)
    } else {
      setSummary(null)
      setPositions([])
      setTrades([])
      setError(null)
    }
  }, [isConnected, address, doFetch])

  // Polling: refresh trades/positions/closed-positions every 10s
  useEffect(() => {
    if (!isConnected || !address) return
    const interval = setInterval(() => doFetch(true), 10_000)
    return () => clearInterval(interval)
  }, [isConnected, address, doFetch])

  return (
    <UserDataContext.Provider value={{ summary, positions, trades, loading, error, refresh }}>
      {children}
    </UserDataContext.Provider>
  )
}

export function useUserData() {
  return useContext(UserDataContext)
}

export type { SummaryData, PositionData, TradeData }
