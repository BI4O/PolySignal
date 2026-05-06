// data/types.ts

export interface MarketFactor {
  text: string;
  signal: 'pos' | 'neg' | 'neu';
}

export interface MarketSource {
  pub: string;
  date: string;
  headline: string;
  snippet: string;
  tag: 'support' | 'against' | 'neutral';
}

export interface Market {
  id: string;
  name: string;
  category: string;
  expiry: string;
  expiryUrgent: boolean;
  price: number;
  side: 'YES' | 'NO';
  aiConf: number;
  aiConfLevel: 'high' | 'med' | 'low';
  edgeDir: 'yes' | 'no';
  sparkline: number[];
  bid: number;
  bidSize: string;
  ask: number;
  askSize: string;
  last: number;
  chart: number[];
  aiReason: string;
  factors: MarketFactor[];
  sources?: MarketSource[];
}

export interface TimelineEntry {
  id: string;
  timeAgo: string;
  type: 'monitor' | 'rebalance' | 'discovery';
  icon: string;
  title: string;
  description: string;
  stats: { label: string; value: string; color?: string; arrow?: string }[];
  marketId: string;
}

export interface Holding {
  marketName: string;
  marketMeta: string;
  side: 'YES' | 'NO';
  entry: number;
  current: number;
  contracts: number;
  staked: number;
  pnl: number | null;
  aiAtEntry: number;
  status: 'Open';
}

export interface Trade {
  marketName: string;
  marketMeta: string;
  side: 'YES' | 'NO';
  entry: number;
  exit: number;
  contracts: number;
  pnl: number;
  aiAtEntry: number;
  result: 'Won' | 'Lost';
}

export interface Category {
  id: string;
  name: string;
  color: string;
  count: number;
}
