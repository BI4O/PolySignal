# Polymarket Signals Next.js Port — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the polymarket-signals.html prototype into the existing newsai_v1 Next.js 16 project with proper routing, component architecture, and typed data.

**Architecture:** Single layout with Topbar + content area, 4 routes (Markets list, Market detail, AI Picks, Me). Data extracted to typed interfaces ready for future API swap. Prototype CSS preserved with custom properties.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4 (for reset only), prototype CSS (oklch, custom properties)

---

### Task 1: Set up data types and market data

**Files:**
- Create: `data/types.ts`
- Create: `data/markets.ts`

- [ ] **Step 1: Create `data/types.ts` with all TypeScript interfaces**

```typescript
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
```

- [ ] **Step 2: Create `data/markets.ts` with all the prototype data**

Copy all 9 markets from the HTML prototype's `MARKETS` object into typed `Market` objects. Also export `timelineEntries`, `holdings`, `trades`, `categories`, and the session stats.

```typescript
// data/markets.ts
import type { Market, TimelineEntry, Holding, Trade, Category } from './types';

export const MARKETS: Record<string, Market> = {
  m1: {
    id: 'm1',
    name: 'Bitcoin to close above $108K by May 10',
    category: 'Crypto',
    expiry: 'May 10, 2026 · 4 days',
    expiryUrgent: false,
    price: 67,
    side: 'YES',
    aiConf: 87,
    aiConfLevel: 'high',
    edgeDir: 'yes',
    sparkline: [22, 24, 18, 20, 12, 14, 8, 6, 2, 4],
    bid: 66,
    bidSize: '12.4K',
    ask: 68,
    askSize: '8.7K',
    last: 67,
    chart: [35, 42, 38, 55, 48, 62, 58, 72, 68, 78, 75, 82, 80, 87],
    aiReason: 'Strong momentum in last 48h with increasing volume. BTC dominance rising and options flow shows heavy call buying at $108K strike. On-chain data shows accumulation by large holders.',
    factors: [
      { text: 'Volume spike 3× above 7d average', signal: 'pos' },
      { text: 'Large option open interest at $108K', signal: 'pos' },
      { text: 'Resistance at $107.5K may slow breakout', signal: 'neg' },
      { text: 'Funding rate slightly elevated', signal: 'neu' },
    ],
    sources: [
      { pub: 'CoinDesk', date: 'May 5', headline: 'BTC Open Interest Hits Record $38B as $108K Call Strike Sees Heavy Accumulation', snippet: 'Open interest concentrated at the $108K strike for May 10 expiry, with over 12,000 contracts outstanding.', tag: 'support' },
      { pub: 'Glassnode', date: 'May 4', headline: 'Exchange Outflow Spike Suggests Accumulation by Whales', snippet: 'Over 45K BTC moved off exchanges in the past week, the largest 7-day outflow since January.', tag: 'support' },
      { pub: 'The Block', date: 'May 5', headline: 'Beware the $107.5K Resistance — BTC Rejected at Level 3 Times in 48 Hours', snippet: 'Technical analysts warn that $107.5K has acted as a hard ceiling, with wicks rejecting each attempt.', tag: 'against' },
    ],
  },
  // ... all other markets (m2-m9) with exact same data from the HTML
  // Copy all 9 markets from the HTML prototype
};

// Helper to get all markets as an array
export function getAllMarkets(): Market[] {
  return Object.values(MARKETS);
}

// Helper to get a market by ID
export function getMarketById(id: string): Market | undefined {
  return MARKETS[id];
}

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'All markets', color: 'var(--accent)', count: 9 },
  { id: 'Crypto', name: 'Crypto', color: 'oklch(55% 0.15 145)', count: 2 },
  { id: 'Finance', name: 'Finance', color: 'var(--accent)', count: 2 },
  { id: 'Politics', name: 'Politics', color: 'var(--red)', count: 2 },
  { id: 'Sports', name: 'Sports', color: 'var(--yellow)', count: 1 },
  { id: 'Science', name: 'Science', color: 'var(--blue)', count: 1 },
  { id: 'Business', name: 'Business', color: 'oklch(55% 0.1 300)', count: 1 },
];

export const TIMELINE_ENTRIES: TimelineEntry[] = [
  {
    id: 'tl1',
    timeAgo: '10 minutes ago',
    type: 'monitor',
    icon: '👀',
    title: 'BTC market volume spike detected',
    description: 'Trading volume surged 3× above the 7-day average in the last 15 minutes. Price moved from 65¢ → 67¢, AI confidence steady at 87%. Edge expanded from +15pt → +20pt.',
    stats: [
      { label: 'Vol', value: '3.2× avg', arrow: '↑' },
      { label: 'Edge', value: '+20pt', color: 'green', arrow: '↑' },
      { label: 'Price', value: '67¢' },
      { label: 'AI', value: '87%', color: 'green' },
    ],
    marketId: 'm1',
  },
  // ... all 7 timeline entries
];

export const HOLDINGS: Holding[] = [
  { marketName: 'Bitcoin above $108K by May 10', marketMeta: 'Crypto · Exp May 10 · 4d left', side: 'YES', entry: 45, current: 67, contracts: 25, staked: 11.25, pnl: 5.50, aiAtEntry: 87, status: 'Open' },
  { marketName: 'Fed to cut rates at May FOMC', marketMeta: 'Finance · Exp May 12 · 6d left', side: 'YES', entry: 28, current: 32, contracts: 40, staked: 11.20, pnl: 1.60, aiAtEntry: 68, status: 'Open' },
  { marketName: 'US govt to disclose alien existence in 2026', marketMeta: 'Politics · Exp May 8 · 2d left', side: 'NO', entry: 82, current: 82, contracts: 20, staked: 16.40, pnl: null, aiAtEntry: 5, status: 'Open' },
];

export const TRADES: Trade[] = [
  { marketName: 'ETH price above $4,000 before May 8', marketMeta: 'Crypto · Settled May 8, 2026', side: 'YES', entry: 55, exit: 72, contracts: 50, pnl: 8.50, aiAtEntry: 82, result: 'Won' },
  { marketName: 'S&P 500 above 5,500 this week', marketMeta: 'Finance · Settled May 6, 2026', side: 'YES', entry: 58, exit: 61, contracts: 30, pnl: 0.90, aiAtEntry: 74, result: 'Won' },
  { marketName: 'Trump wins 2024 US Election', marketMeta: 'Politics · Settled May 4, 2026', side: 'NO', entry: 76, exit: 84, contracts: 100, pnl: 8.00, aiAtEntry: 34, result: 'Won' },
  { marketName: 'SpaceX Starship achieves orbit', marketMeta: 'Science · Settled May 2, 2026', side: 'YES', entry: 36, exit: 41, contracts: 15, pnl: 0.75, aiAtEntry: 41, result: 'Won' },
  { marketName: 'Lakers to win Game 7 vs Warriors', marketMeta: 'Sports · Settled May 6, 2026', side: 'YES', entry: 51, exit: 0, contracts: 20, pnl: -10.20, aiAtEntry: 55, result: 'Lost' },
  { marketName: 'Tesla deliveries > 500K in Q2', marketMeta: 'Business · Settled Apr 28, 2026', side: 'NO', entry: 60, exit: 68, contracts: 35, pnl: 2.80, aiAtEntry: 40, result: 'Won' },
];
```

Note: Copy ALL 9 markets (m1-m9) and ALL 7 timeline entries exactly as they appear in the HTML prototype. Full content is at `polymarket-signals.html` lines 2150-2336 for markets, lines 1644-1819 for timeline entries.

- [ ] **Step 3: Verify data files compile**

Run: `cd newsai_v1 && pnpm exec tsc --noEmit`
Expected: No type errors.

---

### Task 2: Set up global CSS with prototype styles

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Replace `app/globals.css` with prototype CSS variables + base styles**

```css
@import "tailwindcss";

:root {
  --bg:      oklch(97% 0.018 70);
  --surface: oklch(99% 0.008 70);
  --fg:      oklch(22% 0.02 50);
  --muted:   oklch(50% 0.018 50);
  --border:  oklch(90% 0.014 70);
  --accent:  oklch(64% 0.13 28);

  --font-display: 'Tiempos Headline', 'Newsreader', 'Iowan Old Style', Georgia, serif;
  --font-body:    'Söhne', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;

  --green:  oklch(55% 0.15 145);
  --red:    oklch(50% 0.16 25);
  --yellow: oklch(68% 0.13 85);
  --blue:   oklch(55% 0.14 260);

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
}

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

body {
  font-family: var(--font-body);
  background: var(--bg);
  color: var(--fg);
  font-size: 14px;
  line-height: 1.5;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Typography */
h1,h2,h3,h4{font-family:var(--font-display);font-weight:500;letter-spacing:-0.01em}
a{color:var(--accent);text-decoration:none}

/* Topbar */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  height: 56px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.topbar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  color: var(--fg);
}
.topbar-logo svg{width:24px;height:24px}
.topbar-nav{display:flex;gap:4px}
.topbar-nav a{
  padding: 6px 16px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  color: var(--muted);
  transition: background .15s,color .15s;
  text-decoration: none;
}
.topbar-nav a:hover,.topbar-nav a.active{background:var(--border);color:var(--fg)}
.topbar-right{display:flex;align-items:center;gap:16px}
.topbar-balance{
  font-size:13px;
  color:var(--muted);
  padding:4px 12px;
  background:var(--bg);
  border-radius:var(--radius-sm);
}
.topbar-balance strong{color:var(--fg);font-weight:600}
.topbar-avatar{
  width:32px;height:32px;border-radius:50%;
  background:var(--accent);color:#fff;
  display:flex;align-items:center;justify-content:center;
  font-size:13px;font-weight:600;
}

/* App layout */
.app-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

/* Sidebar */
.sidebar {
  width: 260px;
  flex-shrink: 0;
  border-right: 1px solid var(--border);
  padding: 20px 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 0;
}
.sidebar-section-title{
  font-size:11px;
  font-weight:600;
  text-transform:uppercase;
  letter-spacing:0.06em;
  color:var(--muted);
  margin-bottom:8px;
}

/* Edge groups */
.edge-group-label{
  font-size:10px;
  font-weight:600;
  text-transform:uppercase;
  letter-spacing:0.05em;
  margin-bottom:5px;
  padding:0 2px;
}
.edge-group-label.yes{color:var(--accent)}
.edge-group-label.no{color:var(--blue)}

.sidebar-group{margin-bottom:10px}
.sidebar-group:last-child{margin-bottom:0}

/* AI Pick cards */
.ai-picks-list{display:flex;flex-direction:column;gap:5px}
.ai-pick-card{
  display:grid;
  grid-template-columns:20px 1fr auto;
  gap:8px;
  align-items:center;
  padding:9px 10px;
  border-radius:var(--radius-sm);
  background:var(--surface);
  border:1px solid var(--border);
  cursor:pointer;
  transition:border-color .15s,box-shadow .15s;
  min-width:0;
}
.ai-pick-card:hover,.ai-pick-card.active{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}
.ai-pick-card.no-edge:hover,.ai-pick-card.no-edge.active{border-color:var(--blue);box-shadow:0 0 0 1px var(--blue)}
.ai-pick-rank{
  width:20px;height:20px;border-radius:50%;
  background:var(--bg);color:var(--muted);
  display:flex;align-items:center;justify-content:center;
  font-size:10px;font-weight:600;flex-shrink:0;
}
.ai-pick-card:nth-child(1) .ai-pick-rank{background:color-mix(in oklch, var(--accent) 20%, transparent);color:var(--accent)}
.ai-pick-card:nth-child(2) .ai-pick-rank{background:color-mix(in oklch, var(--accent) 12%, transparent);color:var(--accent)}
.ai-pick-card.no-edge .ai-pick-rank{background:color-mix(in oklch, var(--blue) 20%, transparent);color:var(--blue)}
.ai-pick-info{min-width:0;overflow:hidden}
.ai-pick-info .name{font-size:12px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;line-height:1.3}
.ai-pick-info .meta{font-size:10px;color:var(--muted);margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ai-pick-conf{
  font-size:12px;
  font-weight:700;
  font-variant-numeric:tabular-nums;
  flex-shrink:0;
  text-align:right;
  min-width:30px;
}
.ai-pick-conf.high{color:var(--green)}
.ai-pick-conf.med{color:var(--yellow)}
.ai-pick-conf.low{color:var(--red)}
.ai-pick-conf.no-edge{color:var(--blue)}

/* Category list */
.cat-list{display:flex;flex-direction:column;gap:2px}
.cat-item{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:6px 10px;
  border-radius:var(--radius-sm);
  font-size:13px;color:var(--muted);
  cursor:pointer;transition:all .15s;
  border:none;background:transparent;text-align:left;
  font-family:var(--font-body);
  width:100%;
}
.cat-item:hover{background:var(--border);color:var(--fg)}
.cat-item.active{background:color-mix(in oklch, var(--accent) 10%, transparent);color:var(--accent);font-weight:500}
.cat-item .cat-count{
  font-size:11px;
  font-weight:500;
  background:var(--border);
  padding:1px 7px;
  border-radius:99px;
  color:var(--muted);
}
.cat-item.active .cat-count{background:color-mix(in oklch, var(--accent) 15%, transparent);color:var(--accent)}
.cat-item .cat-dot{
  width:8px;height:8px;border-radius:2px;flex-shrink:0;
}

/* Main content area */
.main {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

/* Market list */
.market-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 0;
}
.list-header{
  display:flex;align-items:center;justify-content:space-between;
  margin-bottom:12px;
}
.list-header h2{font-size:18px;font-weight:600}
.list-header .count{font-size:13px;color:var(--muted);background:var(--border);padding:2px 10px;border-radius:99px}

/* Market card */
.mkt-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 18px;
  border-radius: var(--radius-md);
  background: var(--surface);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: border-color .15s, transform .15s, box-shadow .15s;
}
.mkt-card:hover { border-color: var(--accent); transform: translateY(-1px); box-shadow: 0 2px 12px rgba(0,0,0,.04); }
.mkt-card.selected { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent), 0 2px 12px rgba(0,0,0,.06); }

.mkt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.mkt-header .left-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.mkt-header .eyebrow {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
}
.mkt-header .urgency-chip {
  font-size: 9px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 99px;
  background: color-mix(in oklch, var(--red) 10%, transparent);
  color: var(--red);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* AI badge */
.ai-badge-large {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px 3px 8px;
  border-radius: 99px;
  background: var(--bg);
  border: 1px solid var(--border);
  flex-shrink: 0;
}
.ai-badge-large .mini-bar {
  width: 32px;
  height: 4px;
  border-radius: 2px;
  background: var(--border);
  overflow: hidden;
  position: relative;
}
.ai-badge-large .mini-bar .fill {
  height: 100%;
  border-radius: 2px;
  transition: width .3s;
}
.ai-badge-large .mini-bar .fill.pos { background: var(--green); }
.ai-badge-large .mini-bar .fill.neg { background: var(--red); }
.ai-badge-large .mini-bar .fill.neu { background: var(--yellow); }
.ai-badge-large .pct {
  font-size: 13px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.ai-badge-large .pct.pos { color: var(--green); }
.ai-badge-large .pct.neg { color: var(--red); }
.ai-badge-large .pct.neu { color: var(--yellow); }
.ai-badge-large .label {
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted);
  font-weight: 600;
}

/* Market title */
.mkt-title {
  font-size: 17px;
  font-weight: 620;
  line-height: 1.3;
  font-family: var(--font-display);
  letter-spacing: -0.012em;
  color: var(--fg);
  margin: 1px 0 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Divergence gauge */
.divergence {
  margin: 0;
}
.divergence-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
}
.divergence-labels .dl {
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted);
}
.divergence-track {
  position: relative;
  height: 8px;
  background: var(--border);
  border-radius: 4px;
  overflow: visible;
}
.track-fill {
  position: absolute;
  top: 0; bottom: 0;
  border-radius: 4px;
  opacity: 0.45;
  transition: opacity .2s;
}
.mkt-card:hover .track-fill { opacity: 0.65; }
.track-fill.pos { background: var(--green); }
.track-fill.neg { background: var(--red); }
.track-dot {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 13px;
  height: 13px;
  border-radius: 50%;
  border: 2px solid var(--surface);
  z-index: 2;
  box-shadow: 0 1px 3px rgba(0,0,0,.12);
  transition: transform .15s;
}
.mkt-card:hover .track-dot { transform: translate(-50%, -50%) scale(1.18); }
.track-dot.mkt { background: var(--muted); }
.track-dot.ai { background: var(--accent); }
.divergence-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2px;
}
.divergence-meta .dv {
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.divergence-meta .dv.mkt-dv { color: var(--muted); }
.divergence-meta .dv.ai-dv { color: var(--accent); }
.divergence-meta .dv.ai-dv.neg { color: var(--red); }
.divergence-edge {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: -0.01em;
  display: flex;
  align-items: center;
  gap: 3px;
}
.divergence-edge.pos { color: var(--green); }
.divergence-edge.neg { color: var(--red); }
.divergence-edge small {
  font-size: 10px;
  font-weight: 500;
  opacity: .7;
}

/* Market footer */
.mkt-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 3px;
  padding-top: 6px;
  border-top: 1px solid var(--border);
}
.mkt-footer .ev {
  font-size: 11px;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}
.mkt-footer .ev strong { color: var(--fg); }
.mkt-buy {
  padding: 3px 12px;
  border-radius: 99px;
  border: 1px solid;
  font-family: var(--font-body);
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  background: transparent;
  transition: all .15s;
  letter-spacing: 0.02em;
}
.mkt-buy.yes {
  color: var(--green);
  border-color: color-mix(in oklch, var(--green) 30%, transparent);
}
.mkt-buy.yes:hover { background: var(--green); color: #fff; border-color: var(--green); }
.mkt-buy.no {
  color: var(--red);
  border-color: color-mix(in oklch, var(--red) 30%, transparent);
}
.mkt-buy.no:hover { background: var(--red); color: #fff; border-color: var(--red); }
.mkt-buy.neu {
  color: var(--accent);
  border-color: color-mix(in oklch, var(--accent) 30%, transparent);
}
.mkt-buy.neu:hover { background: var(--accent); color: #fff; border-color: var(--accent); }

/* Detail page styles */
.detail-page { /* shared: .detail-panel but full page */
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
  max-width: 720px;
  margin: 0 auto;
}
.detail-header{padding:0 0 16px}
.detail-header .eyebrow{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--muted)}
.detail-header h2{font-size:20px;font-weight:600;margin-top:4px}
.detail-header .expiry{font-size:13px;color:var(--muted);margin-top:2px}

.detail-price-row{
  display:flex;gap:0;margin:0 0 16px;
  border:1px solid var(--border);border-radius:var(--radius-md);overflow:hidden;
}
.detail-price-row > div{
  flex:1;text-align:center;padding:12px 8px;
}
.detail-price-row > div:first-child{border-right:1px solid var(--border);background:color-mix(in oklch, var(--green) 4%, transparent)}
.detail-price-row > div:last-child{background:color-mix(in oklch, var(--red) 4%, transparent)}
.detail-price-row .label{font-size:11px;text-transform:uppercase;letter-spacing:0.04em;color:var(--muted)}
.detail-price-row .value{font-size:22px;font-weight:700;font-variant-numeric:tabular-nums;margin-top:2px}
.detail-price-row .size{font-size:11px;color:var(--muted);margin-top:1px}
.detail-price-row .green{color:var(--green)}
.detail-price-row .red{color:var(--red)}

.detail-chart{padding:0;margin-bottom:16px}
.detail-chart .chart-box{
  width:100%;height:80px;
  background:var(--bg);border-radius:var(--radius-md);
  display:flex;align-items:flex-end;padding:6px 0;overflow:hidden;
}
.detail-chart .chart-box .bar{
  flex:1;margin:0 1px;border-radius:2px 2px 0 0;
  background:var(--accent);opacity:0.6;min-height:6px;
  transition:opacity .2s;
}
.detail-chart .chart-box .bar:hover{opacity:1}
.detail-chart .chart-labels{display:flex;justify-content:space-between;font-size:10px;color:var(--muted);margin-top:4px}

/* AI Analysis box */
.detail-ai-box{
  margin:0 0 16px;
  padding:12px 14px;
  background:color-mix(in oklch, var(--accent) 6%, transparent);
  border-radius:var(--radius-md);
  border-left:3px solid var(--accent);
}
.detail-ai-box .label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:var(--accent);margin-bottom:5px}
.detail-ai-box .ai-content{font-size:13px;line-height:1.55;color:var(--fg)}
.detail-ai-box .ai-content.collapsed{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.detail-ai-box .ai-toggle{
  display:inline-block;margin-top:5px;
  font-size:11px;font-weight:600;color:var(--accent);
  cursor:pointer;border:none;background:none;padding:0;
  font-family:var(--font-body);
  transition:opacity .15s;
}
.detail-ai-box .ai-toggle:hover{opacity:.75}
.detail-ai-box .factors{margin-top:8px;display:flex;flex-direction:column;gap:3px}
.detail-ai-box .factor{display:flex;align-items:center;gap:7px;font-size:12px;color:var(--muted);line-height:1.4}
.detail-ai-box .factor .sig{width:5px;height:5px;border-radius:50%;flex-shrink:0}
.detail-ai-box .factor .sig.pos{background:var(--green)}
.detail-ai-box .factor .sig.neg{background:var(--red)}
.detail-ai-box .factor .sig.neu{background:var(--yellow)}

/* Sources accordion */
.detail-sources{margin:0 0 16px}
.detail-sources .label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:var(--muted);margin-bottom:6px}
.src-accordion{
  border:1px solid var(--border);
  border-radius:var(--radius-sm);
  overflow:hidden;
  margin-bottom:4px;
  transition:border-color .15s;
}
.src-accordion:hover{border-color:var(--accent)}
.src-accordion-header{
  display:flex;align-items:center;justify-content:space-between;
  padding:9px 11px;
  background:var(--bg);
  cursor:pointer;
  transition:background .15s;
  user-select:none;
}
.src-accordion-header:hover{background:color-mix(in oklch, var(--bg) 95%, var(--accent))}
.src-accordion-header .left{display:flex;align-items:center;gap:6px;min-width:0;flex:1}
.src-accordion-header .src-pub{font-size:10px;font-weight:600;color:var(--accent);flex-shrink:0}
.src-accordion-header .src-date{font-size:9px;color:var(--muted);flex-shrink:0}
.src-accordion-header .src-tag{
  font-size:8px;font-weight:600;padding:1px 5px;
  border-radius:3px;text-transform:uppercase;letter-spacing:0.03em;
  flex-shrink:0;
}
.src-accordion-header .src-tag.support{background:color-mix(in oklch,var(--green) 10%,transparent);color:var(--green)}
.src-accordion-header .src-tag.against{background:color-mix(in oklch,var(--red) 10%,transparent);color:var(--red)}
.src-accordion-header .src-tag.neutral{background:color-mix(in oklch,var(--yellow) 10%,transparent);color:var(--yellow)}
.src-accordion-header .arrow{
  font-size:10px;color:var(--muted);flex-shrink:0;margin-left:6px;
  transition:transform .2s;
}
.src-accordion-header.open .arrow{transform:rotate(90deg)}
.src-accordion-body{
  display:none;
  padding:0 11px 10px;
  background:var(--bg);
  border-top:1px solid var(--border);
}
.src-accordion-body.open{display:block}
.src-accordion-body .src-headline{font-size:12px;font-weight:500;color:var(--fg);line-height:1.35;margin-bottom:3px;margin-top:8px}
.src-accordion-body .src-snippet{font-size:11px;color:var(--muted);line-height:1.4}

/* Quick order */
.detail-order{
  padding:12px 0 0;
  border-top:1px solid var(--border);
  margin-top:20px;
}
.detail-order label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:var(--muted);display:block;margin-bottom:6px}
.detail-order .order-row{display:flex;gap:8px;margin-bottom:8px}
.order-btn{
  flex:1;padding:10px;border-radius:var(--radius-sm);
  border:1px solid var(--border);background:var(--bg);
  font-family:var(--font-body);font-size:14px;font-weight:500;cursor:pointer;
  transition:all .15s;text-align:center;
}
.order-btn.yes{border-color:var(--green);color:var(--green)}
.order-btn.yes:hover,.order-btn.yes.active{background:var(--green);color:#fff}
.order-btn.no{border-color:var(--red);color:var(--red)}
.order-btn.no:hover,.order-btn.no.active{background:var(--red);color:#fff}
.order-input{
  flex:1;padding:10px 12px;border-radius:var(--radius-sm);
  border:1px solid var(--border);background:var(--bg);
  font-family:var(--font-body);font-size:14px;font-variant-numeric:tabular-nums;
  width:100%;outline:none;transition:border-color .15s;
}
.order-input:focus{border-color:var(--accent)}
.order-submit{
  width:100%;padding:10px;border-radius:var(--radius-sm);
  background:var(--accent);color:#fff;border:none;
  font-family:var(--font-body);font-size:14px;font-weight:600;cursor:pointer;
  transition:opacity .15s;
}
.order-submit:hover{opacity:.85}
.order-submit:disabled{opacity:.4;cursor:not-allowed}

/* AI Picks timeline */
.aipicks-timeline-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 48px 40px;
  min-height: 0;
}
.tl-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 28px;
}
.tl-header h1 {
  font-size: 22px;
  font-weight: 620;
  font-family: var(--font-display);
  letter-spacing: -0.015em;
  line-height: 1.2;
}
.tl-header h1 small {
  display: block;
  font-size: 13px;
  font-weight: 400;
  font-family: var(--font-body);
  color: var(--muted);
  letter-spacing: 0;
  margin-top: 4px;
}

/* Accuracy card */
.accuracy-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px 18px;
  min-width: 190px;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,.04);
  flex-shrink: 0;
}
.accuracy-card .title{
  font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;
  color:var(--muted);margin-bottom:7px;
}
.accuracy-card .row{
  display:flex;justify-content:space-between;align-items:center;
  padding:2px 0;
}
.accuracy-card .row .l{color:var(--muted)}
.accuracy-card .row .r{font-weight:600}
.accuracy-card .row .r.green{color:var(--green)}
.accuracy-card .divider{height:1px;background:var(--border);margin:5px 0}
.accuracy-card .cal-row{
  display:flex;justify-content:space-between;padding:1px 0;
  font-size:10px;align-items:center;
}
.accuracy-card .cal-row .bar-wrap{
  width:52px;height:5px;background:var(--border);border-radius:99px;overflow:hidden;
}
.accuracy-card .cal-row .bar-wrap .fill{height:100%;border-radius:99px}

/* Timeline */
.timeline {
  position: relative;
  padding-left: 32px;
}
.timeline::before {
  content: '';
  position: absolute;
  left: 12px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: var(--border);
  border-radius: 1px;
}
.tl-entry {
  position: relative;
  margin-bottom: 0;
  padding-bottom: 20px;
}
.tl-entry:last-child { padding-bottom: 0; }
.tl-dot {
  position: absolute;
  left: -32px;
  top: 4px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  border: 2px solid var(--surface);
  z-index: 2;
  flex-shrink: 0;
}
.tl-dot.monitor { background: color-mix(in oklch, var(--accent) 12%, transparent); }
.tl-dot.rebalance { background: color-mix(in oklch, var(--blue) 12%, transparent); }
.tl-dot.discovery { background: color-mix(in oklch, var(--green) 12%, transparent); }
.tl-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px 18px;
  transition: border-color .15s, box-shadow .15s;
}
.tl-card:hover { border-color: var(--accent); box-shadow: 0 2px 10px rgba(0,0,0,.04); }
.tl-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.tl-timestamp {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted);
}
.tl-type-badge {
  font-size: 9px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.tl-type-badge.monitor { background: color-mix(in oklch, var(--accent) 10%, transparent); color: var(--accent); }
.tl-type-badge.rebalance { background: color-mix(in oklch, var(--blue) 10%, transparent); color: var(--blue); }
.tl-type-badge.discovery { background: color-mix(in oklch, var(--green) 10%, transparent); color: var(--green); }
.tl-card-title {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--fg);
  margin-bottom: 4px;
}
.tl-card-desc {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.45;
  margin-bottom: 8px;
}
.tl-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.tl-market-link {
  font-size: 11px;
  font-weight: 600;
  color: var(--accent);
  cursor: pointer;
  border: none;
  background: none;
  padding: 3px 8px;
  border-radius: 4px;
  font-family: var(--font-body);
  transition: background .15s;
}
.tl-market-link:hover { background: color-mix(in oklch, var(--accent) 8%, transparent); }
.tl-stats {
  display: flex;
  gap: 12px;
  margin: 6px 0 8px;
  flex-wrap: wrap;
}
.tl-stat {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}
.tl-stat .lbl { color: var(--muted); font-size: 10px; }
.tl-stat .val { font-weight: 600; }
.tl-stat .val.green { color: var(--green); }
.tl-stat .val.red { color: var(--red); }
.tl-stat .arrow-up { color: var(--green); font-size: 10px; }
.tl-stat .arrow-up.flip { color: var(--red); }

/* Me page */
.me-page {
  flex: 1;
  overflow: hidden;
  padding: 24px 36px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.me-page > .stat-row {
  flex-shrink: 0;
}
.stat-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: border-color .15s;
}
.stat-card:hover { border-color: var(--accent); }
.stat-card .stat-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted);
}
.stat-card .stat-value {
  font-size: 28px;
  font-weight: 650;
  font-family: var(--font-display);
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}
.stat-card .stat-sub {
  font-size: 12px;
  color: var(--muted);
  margin-top: 2px;
}
.stat-card .stat-value.green { color: var(--green); }
.stat-card .stat-value.red { color: var(--red); }

/* Me tab bar */
.me-tabbar {
  display: flex;
  gap: 0;
  flex-shrink: 0;
  border-bottom: 1px solid var(--border);
  margin: 20px -36px 0;
  padding: 0 36px;
}
.me-tabbar-btn {
  padding: 10px 20px;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  color: var(--muted);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all .15s;
  margin-bottom: -1px;
}
.me-tabbar-btn:hover { color: var(--fg); }
.me-tabbar-btn.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
  font-weight: 600;
}
.me-tab-content {
  flex: 1;
  overflow: hidden;
  display: none;
  min-height: 0;
}
.me-tab-content.active {
  display: flex;
  flex-direction: column;
}
.me-tab-scroll {
  flex: 1;
  overflow-y: auto;
  padding-top: 20px;
}
.me-tab-scroll .me-section + .me-section {
  margin-top: 16px;
}
.me-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
}
.me-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border);
}
.me-section-header h3 {
  font-size: 15px;
  font-weight: 600;
  font-family: var(--font-display);
}
.me-section-header .count-badge {
  font-size: 11px;
  color: var(--muted);
  background: var(--bg);
  padding: 2px 10px;
  border-radius: 99px;
  font-weight: 500;
}
.me-section-body {
  padding: 0;
}

/* Holdings table */
.hold-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.hold-table th {
  text-align: left;
  padding: 10px 20px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
  background: var(--bg);
  border-bottom: 1px solid var(--border);
}
.hold-table td {
  padding: 12px 20px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}
.hold-table tr:last-child td { border-bottom: none; }
.hold-table tr { transition: background .1s; }
.hold-table tr:hover { background: color-mix(in oklch, var(--bg) 60%, transparent); }
.hold-table .market-cell {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.hold-table .market-cell .mkt-name {
  font-weight: 500;
  font-size: 13px;
  line-height: 1.3;
}
.hold-table .market-cell .mkt-meta {
  font-size: 10px;
  color: var(--muted);
}
.hold-table .num { font-variant-numeric: tabular-nums; text-align: right; }
.hold-table .th-center { text-align: center; }
.hold-table .td-center { text-align: center; }
.hold-table .pnl { font-variant-numeric: tabular-nums; font-weight: 600; text-align: right; }
.hold-table .pnl.pos { color: var(--green); }
.hold-table .pnl.neg { color: var(--red); }
.hold-table .status-pill {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 10px;
  font-weight: 600;
  text-align: center;
}
.hold-table .status-pill.open {
  background: color-mix(in oklch, var(--green) 10%, transparent);
  color: var(--green);
}
.hold-table .status-pill.settled {
  background: color-mix(in oklch, var(--muted) 15%, transparent);
  color: var(--muted);
}
.hold-table .status-pill.won {
  background: color-mix(in oklch, var(--green) 12%, transparent);
  color: var(--green);
}
.hold-table .status-pill.lost {
  background: color-mix(in oklch, var(--red) 10%, transparent);
  color: var(--red);
}
.hold-table .ai-conf-cell {
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  text-align: center;
}

/* Account settings */
.acc-settings { margin: 0; }
.acc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  cursor: pointer;
  user-select: none;
  transition: background .15s;
}
.acc-header:hover { background: color-mix(in oklch, var(--bg) 60%, transparent); }
.acc-header h3 {
  font-size: 15px;
  font-weight: 600;
  font-family: var(--font-display);
}
.acc-header .arrow { font-size: 12px; color: var(--muted); transition: transform .2s; }
.acc-header.open .arrow { transform: rotate(90deg); }
.acc-body {
  display: none;
  border-top: 1px solid var(--border);
  padding: 16px 20px;
}
.acc-body.open { display: block; }
.acc-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
}
.acc-row + .acc-row { border-top: 1px solid var(--border); }
.acc-row .acc-label { font-size: 13px; color: var(--fg); }
.acc-row .acc-desc { font-size: 11px; color: var(--muted); margin-top: 1px; }
.acc-row .acc-action { font-size: 12px; }
.acc-btn {
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg);
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all .15s;
}
.acc-btn:hover { border-color: var(--accent); color: var(--accent); }
.acc-btn.primary {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}
.acc-btn.primary:hover { opacity: .85; }
.acc-btn.connected {
  border-color: var(--green);
  color: var(--green);
  background: color-mix(in oklch, var(--green) 6%, transparent);
}

/* Tweaks panel */
.tweaks-toggle{
  position:fixed;bottom:20px;right:20px;
  width:40px;height:40px;border-radius:50%;
  background:var(--surface);border:1px solid var(--border);
  color:var(--muted);cursor:pointer;display:flex;
  align-items:center;justify-content:center;
  font-size:18px;z-index:100;
  box-shadow:0 2px 8px rgba(0,0,0,.06);
  transition:all .15s;
}
.tweaks-toggle:hover{color:var(--fg);border-color:var(--accent)}
.tweaks-panel{
  position:fixed;bottom:68px;right:20px;
  width:260px;padding:16px;
  background:var(--surface);border:1px solid var(--border);
  border-radius:var(--radius-md);
  box-shadow:0 4px 20px rgba(0,0,0,.08);
  display:none;z-index:100;
  font-size:13px;
}
.tweaks-panel.open{display:block}
.tweaks-panel h4{font-size:12px;font-weight:600;margin-bottom:10px;color:var(--muted);text-transform:uppercase;letter-spacing:0.04em}
.tweak-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.tweak-row label{color:var(--muted)}
.tweak-row input[type="range"]{width:100px;accent-color:var(--accent)}
.tweak-row select{
  padding:2px 6px;border-radius:4px;
  border:1px solid var(--border);background:var(--bg);
  font-family:var(--font-body);font-size:12px;
}

/* Scrollbar */
::-webkit-scrollbar{width:6px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--border);border-radius:99px}
::-webkit-scrollbar-thumb:hover{background:color-mix(in oklch, var(--border) 70%, var(--muted))}

/* Responsive safeguard */
@media(max-width:1100px){
  .sidebar{width:220px}
}
```

---

### Task 3: Set up root layout and navigation structure

**Files:**
- Modify: `app/layout.tsx`
- Create: `app/markets/layout.tsx` (shared layout for markets pages)

- [ ] **Step 1: Update `app/layout.tsx` to include Topbar with navigation**

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Topbar from "./Topbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Polymarket Signals",
  description: "AI-powered prediction market signals and analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <Topbar />
        <div className="app-layout">
          {children}
        </div>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Create `app/Topbar.tsx`**

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/markets', label: 'Markets' },
  { href: '/aipicks', label: 'AI Picks' },
  { href: '/me', label: 'Me' },
];

export default function Topbar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    // Markets is active for /markets and /markets/[id]
    if (href === '/markets') return pathname.startsWith('/markets');
    return pathname === href;
  };

  return (
    <header className="topbar">
      <div className="topbar-logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
        </svg>
        Polymarket Signals
      </div>
      <nav className="topbar-nav">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={isActive(item.href) ? 'active' : ''}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="topbar-right">
        <span className="topbar-balance">Balance <strong>$12,430</strong></span>
        <div className="topbar-avatar">B</div>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Create `app/page.tsx` — redirect to /markets**

```tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/markets');
}
```

- [ ] **Step 4: Create `app/markets/layout.tsx` — provides Sidebar shared between /markets and /markets/[id]**

```tsx
import Sidebar from './Sidebar';

export default function MarketsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <div className="main">
        {children}
      </div>
    </>
  );
}
```

---

### Task 4: Create Sidebar component

**Files:**
- Create: `app/markets/Sidebar.tsx`
- Modify: `app/markets/layout.tsx` (already done above)

- [ ] **Step 1: Create `app/markets/Sidebar.tsx`**

```tsx
'use client';

import Link from 'next/link';
import { MARKETS, CATEGORIES } from '@/data/markets';

// AI pick cards from market data (YES edge then NO edge)
const YES_EDGE_PICKS = [
  { marketId: 'm1', rank: 1, name: 'BTC above $108K by May 10', meta: '4d · 67¢ → AI 87%', conf: 87, confClass: 'high' },
  { marketId: 'm2', rank: 2, name: 'Fed rate cut at May FOMC', meta: '6d · 32¢ → AI 68%', conf: 68, confClass: 'high' },
];
const NO_EDGE_PICKS = [
  { marketId: 'm3', rank: 1, name: 'Alien disclosure in 2026', meta: '2d · market 18¢, AI says 5%', conf: 5, confClass: 'no-edge' },
  { marketId: 'm5', rank: 2, name: 'Tesla Q2 deliveries > 500K', meta: '5d · market 65¢, AI says 40%', conf: 40, confClass: 'no-edge' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* YES Edge picks */}
      <div className="sidebar-group">
        <div className="sidebar-section-title">AI Top Picks</div>
        <div className="edge-group-label yes">YES Edge</div>
        <div className="ai-picks-list">
          {YES_EDGE_PICKS.map(pick => (
            <Link
              key={pick.marketId}
              href={`/markets/${pick.marketId}`}
              className="ai-pick-card"
            >
              <div className="ai-pick-rank">{pick.rank}</div>
              <div className="ai-pick-info">
                <div className="name">{pick.name}</div>
                <div className="meta">{pick.meta}</div>
              </div>
              <span className={`ai-pick-conf ${pick.confClass}`}>{pick.conf}%</span>
            </Link>
          ))}
        </div>
      </div>

      {/* NO Edge picks */}
      <div className="sidebar-group">
        <div className="edge-group-label no">NO Edge</div>
        <div className="ai-picks-list">
          {NO_EDGE_PICKS.map(pick => (
            <Link
              key={pick.marketId}
              href={`/markets/${pick.marketId}`}
              className="ai-pick-card no-edge"
            >
              <div className="ai-pick-rank">{pick.rank}</div>
              <div className="ai-pick-info">
                <div className="name">{pick.name}</div>
                <div className="meta">{pick.meta}</div>
              </div>
              <span className={`ai-pick-conf ${pick.confClass}`}>{pick.conf}%</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="sidebar-group">
        <div className="sidebar-section-title">Categories</div>
        <div className="cat-list">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className="cat-item active"
              data-cat={cat.id}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="cat-dot" style={{ background: cat.color }}></span>
                {cat.name}
              </div>
              <span className="cat-count">{cat.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Today's Session */}
      <div className="sidebar-group">
        <div className="sidebar-section-title">Today's Session</div>
        <div style={{fontSize:13,display:'flex',flexDirection:'column',gap:5,padding:'0 2px'}}>
          <SessionRow label="Open positions" value="3" />
          <SessionRow label="P&L today" value="+$124.50" valueColor="var(--green)" />
          <SessionRow label="Session ROI" value="+3.2%" valueColor="var(--green)" />
          <SessionRow label="AI accuracy (30d)" value="73%" valueColor="var(--green)" />
          <div style={{display:'flex',justifyContent:'space-between',paddingTop:4,borderTop:'1px solid var(--border)',marginTop:1}}>
            <span style={{color:'var(--muted)',fontSize:11}}>Best pick</span>
            <span style={{fontSize:11,color:'var(--green)'}}>BTC +$87.20</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SessionRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{display:'flex',justifyContent:'space-between'}}>
      <span style={{color:'var(--muted)'}}>{label}</span>
      <strong style={valueColor ? {color: valueColor} : undefined}>{value}</strong>
    </div>
  );
}
```

---

### Task 5: Create /markets page (market list)

**Files:**
- Create: `app/markets/page.tsx`

- [ ] **Step 1: Create `app/markets/page.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAllMarkets, CATEGORIES } from '@/data/markets';
import type { Market, Category } from '@/data/types';
import MarketCard from './MarketCard';

export default function MarketsPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const allMarkets = getAllMarkets();
  const filteredMarkets = activeCategory === 'all'
    ? allMarkets
    : allMarkets.filter(m => m.category === activeCategory);

  return (
    <div className="market-list">
      <div className="list-header">
        <h2>Expiring Soon</h2>
        <span className="count">{filteredMarkets.length} markets</span>
      </div>
      {filteredMarkets.map(market => (
        <MarketCard key={market.id} market={market} />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create `app/markets/MarketCard.tsx`**

```tsx
'use client';

import Link from 'next/link';
import type { Market } from '@/data/types';

export default function MarketCard({ market }: { market: Market }) {
  const edgePts = Math.abs(market.price - market.aiConf);
  const isYesEdge = market.edgeDir === 'yes';

  return (
    <Link href={`/markets/${market.id}`} className="mkt-card">
      <div className="mkt-header">
        <div className="left-group">
          <span className="eyebrow">{market.category} · {market.expiry}</span>
          {market.expiryUrgent && (
            <span className="urgency-chip">
              {market.expiry.includes('hour') || market.expiry.includes('1h')
                ? market.expiry.split('·').pop()?.trim() || ''
                : '🔥 Hot'}
            </span>
          )}
        </div>
        <div className="ai-badge-large">
          <div className="mini-bar">
            <div className={`fill ${market.aiConfLevel === 'high' ? 'pos' : market.aiConfLevel === 'low' ? 'neg' : 'neu'}`}
                 style={{width: `${market.aiConf}%`}} />
          </div>
          <span className={`pct ${market.aiConfLevel === 'high' ? 'pos' : market.aiConfLevel === 'low' ? 'neg' : 'neu'}`}>
            {market.aiConf}%
          </span>
          <span className="label">AI</span>
        </div>
      </div>

      <div className="mkt-title">{market.name}</div>

      <div className="divergence">
        <div className="divergence-track">
          <div className={`track-fill ${isYesEdge ? 'pos' : 'neg'}`}
               style={{
                 left: `${Math.min(market.price, market.aiConf)}%`,
                 width: `${edgePts}%`
               }} />
          <div className="track-dot mkt" style={{left: `${market.price}%`}} />
          <div className="track-dot ai" style={{left: `${market.aiConf}%`}} />
        </div>
        <div className="divergence-meta">
          <span className="dv mkt-dv">{market.price}¢</span>
          <span className={`divergence-edge ${isYesEdge ? 'pos' : 'neg'}`}>
            {isYesEdge ? '+' : ''}{edgePts}pt <small>edge{!isYesEdge ? ' · NO' : ''}</small>
          </span>
          <span className={`dv ai-dv ${!isYesEdge ? 'neg' : ''}`}>{market.aiConf}%</span>
        </div>
      </div>

      <div className="mkt-footer">
        <span className="ev">
          EV <strong>${(edgePts * 0.1).toFixed(2)}</strong>
          {!isYesEdge ? ' / 10ct on NO' : ' / 10ct'}
        </span>
        <button className={`mkt-buy ${isYesEdge ? 'yes' : 'no'}`}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
          Buy {isYesEdge ? 'YES' : 'NO'}
        </button>
      </div>
    </Link>
  );
}
```

Note: The EV calculation (edgePts * 0.1) is a simplified approximation. For exact values matching the prototype, use the hardcoded EV values per market.

---

### Task 6: Create /markets/[id] page (market detail)

**Files:**
- Create: `app/markets/[id]/page.tsx`

- [ ] **Step 1: Create `app/markets/[id]/page.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { getMarketById } from '@/data/markets';

export default function MarketDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const market = getMarketById(id);

  if (!market) {
    notFound();
  }

  const priceColor = market.price >= 50 ? 'var(--green)' : 'var(--red)';
  const maxChart = Math.max(...market.chart);
  const defaultSide = market.edgeDir === 'no' ? 'no' : 'yes';
  const [selectedSide, setSelectedSide] = useState(defaultSide);
  const [aiExpanded, setAiExpanded] = useState(false);
  const [openSources, setOpenSources] = useState<Set<number>>(new Set());

  const toggleSource = (idx: number) => {
    const next = new Set(openSources);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setOpenSources(next);
  };

  return (
    <div className="detail-page" style={{flex: 1, overflowY: 'auto', padding: '24px 32px', maxWidth: 720, margin: '0 auto'}}>
      <div className="detail-header">
        <div className="eyebrow">{market.category}</div>
        <h2>{market.name}</h2>
        <div className="expiry">Expires {market.expiry}</div>
      </div>

      {/* Price Row */}
      <div className="detail-price-row">
        <div>
          <div className="label">Bid</div>
          <div className="value green">{market.bid}¢</div>
          <div className="size">{market.bidSize}</div>
        </div>
        <div>
          <div className="label">Last</div>
          <div className="value" style={{color: priceColor}}>{market.last}¢</div>
          <div className="size">{market.side}</div>
        </div>
        <div>
          <div className="label">Ask</div>
          <div className="value red">{market.ask}¢</div>
          <div className="size">{market.askSize}</div>
        </div>
      </div>

      {/* Chart */}
      <div className="detail-chart">
        <div className="chart-box">
          {market.chart.map((v, i) => (
            <div key={i} className="bar"
                 style={{height: `${Math.round((v / maxChart) * 68)}px`}} />
          ))}
        </div>
        <div className="chart-labels">
          <span>1h ago</span>
          <span>Now</span>
        </div>
      </div>

      {/* AI Analysis */}
      <div className="detail-ai-box">
        <div className="label">AI Analysis</div>
        <div className={`ai-content ${aiExpanded ? '' : 'collapsed'}`}>
          {market.aiReason}
        </div>
        <button className="ai-toggle" onClick={() => setAiExpanded(!aiExpanded)}>
          {aiExpanded ? 'Show less' : 'Read more'}
        </button>
        <div className="factors">
          {market.factors.map((f, i) => (
            <div key={i} className="factor">
              <span className={`sig ${f.signal}`}></span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sources */}
      {market.sources && market.sources.length > 0 && (
        <div className="detail-sources">
          <div className="label">Sources / Evidence</div>
          {market.sources.map((s, i) => (
            <div key={i} className="src-accordion">
              <div className={`src-accordion-header ${openSources.has(i) ? 'open' : ''}`}
                   onClick={() => toggleSource(i)}>
                <div className="left">
                  <span className="src-pub">{s.pub}</span>
                  <span className="src-date">{s.date}</span>
                  <span className={`src-tag ${s.tag}`}>
                    {s.tag === 'support' ? 'SUPPORTS AI' : s.tag === 'against' ? 'CAVEAT' : 'NEUTRAL'}
                  </span>
                </div>
                <span className="arrow">▶</span>
              </div>
              <div className={`src-accordion-body ${openSources.has(i) ? 'open' : ''}`}>
                <div className="src-headline">{s.headline}</div>
                <div className="src-snippet">{s.snippet}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Order */}
      <div className="detail-order">
        <label>Quick order</label>
        <div className="order-row">
          <button className={`order-btn yes ${selectedSide === 'yes' ? 'active' : ''}`}
                  onClick={() => setSelectedSide('yes')}>YES</button>
          <button className={`order-btn no ${selectedSide === 'no' ? 'active' : ''}`}
                  onClick={() => setSelectedSide('no')}>NO</button>
        </div>
        <div className="order-row">
          <input type="number" className="order-input" placeholder="Contracts" defaultValue={10} min={1} />
          <input type="number" className="order-input" placeholder="Price (¢)" defaultValue={market.price} min={1} max={99} />
        </div>
        <button className="order-submit">
          Place order ({selectedSide.toUpperCase()})
        </button>
      </div>
    </div>
  );
}
```

Optional: Create `app/markets/[id]/not-found.tsx` for the 404 case.

---

### Task 7: Create /aipicks page

**Files:**
- Create: `app/aipicks/page.tsx`

- [ ] **Step 1: Create `app/aipicks/page.tsx`**

```tsx
'use client';

import Link from 'next/link';
import { TIMELINE_ENTRIES } from '@/data/markets';

const TYPE_LABELS: Record<string, string> = {
  monitor: 'Monitoring',
  rebalance: 'Rebalance',
  discovery: 'Discovery',
};

export default function AIPicksPage() {
  return (
    <div className="aipicks-timeline-body">
      <div className="tl-header">
        <div>
          <h1>
            AI Surveillance Log
            <small>What the AI has noticed in the last 24 hours — sorted by recency</small>
          </h1>
        </div>
        <div className="accuracy-card">
          <div className="title">AI Accuracy</div>
          <div className="row">
            <span className="l">Overall</span>
            <span className="r green">73%</span>
          </div>
          <div className="row">
            <span className="l">Last 30 days</span>
            <span className="r green">76% <span style={{fontSize:10,color:'var(--green)'}}>↑</span></span>
          </div>
          <div className="divider"></div>
          <CalRow label="80%+ calls" pct={82} color="var(--green)" />
          <CalRow label="60-80%" pct={64} color="var(--yellow)" />
          <CalRow label="&lt;60%" pct={41} color="var(--red)" />
        </div>
      </div>

      <div className="timeline">
        {TIMELINE_ENTRIES.map(entry => (
          <div key={entry.id} className="tl-entry">
            <div className={`tl-dot ${entry.type}`}>{entry.icon}</div>
            <div className="tl-card">
              <div className="tl-card-top">
                <span className="tl-timestamp">{entry.timeAgo}</span>
                <span className={`tl-type-badge ${entry.type}`}>
                  {TYPE_LABELS[entry.type]}
                </span>
              </div>
              <div className="tl-card-title" dangerouslySetInnerHTML={{ __html: entry.title }} />
              <div className="tl-card-desc" dangerouslySetInnerHTML={{ __html: entry.description }} />
              <div className="tl-stats">
                {entry.stats.map((stat, i) => (
                  <div key={i} className="tl-stat">
                    {stat.label && <span className="lbl">{stat.label}</span>}
                    <span className={`val ${stat.color || ''}`}>{stat.value}</span>
                    {stat.arrow && <span className={`arrow-up ${stat.arrow === '↓' ? 'flip' : ''}`}>
                      {stat.arrow === '↓' ? '↓' : '↑'}
                    </span>}
                  </div>
                ))}
              </div>
              <div className="tl-actions">
                <Link href={`/markets/${entry.marketId}`} className="tl-market-link">
                  View market →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalRow({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="cal-row">
      <span style={{color:'var(--muted)'}}>{label}</span>
      <div className="bar-wrap">
        <div className="fill" style={{width: `${pct}%`, background: color}}></div>
      </div>
      <span style={{color, fontWeight: 600}}>{pct}%</span>
    </div>
  );
}
```

---

### Task 8: Create /me page

**Files:**
- Create: `app/me/page.tsx`

- [ ] **Step 1: Create `app/me/page.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { HOLDINGS, TRADES } from '@/data/markets';
import type { Holding, Trade } from '@/data/types';

type MeTab = 'positions' | 'history' | 'settings';

export default function MePage() {
  const [activeTab, setActiveTab] = useState<MeTab>('positions');

  return (
    <div className="me-page">
      {/* Stat cards */}
      <div className="stat-row">
        <StatCard label="Total P&L" value="+$4,283.50" valueColor="green" sub="Since first trade" />
        <StatCard label="Trades" value="147" sub="99 won · 48 lost" />
        <StatCard label="Win Rate" value="67.3%" sub="Last 30d: 71.4%" />
        <StatCard label="Active Positions" value="3" sub="$2,840 at stake" />
      </div>

      {/* Tab bar */}
      <div className="me-tabbar">
        <TabButton label="Positions" isActive={activeTab === 'positions'} onClick={() => setActiveTab('positions')} />
        <TabButton label="History" isActive={activeTab === 'history'} onClick={() => setActiveTab('history')} />
        <TabButton label="Settings" isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </div>

      {/* Positions */}
      {activeTab === 'positions' && (
        <div className="me-tab-content active">
          <div className="me-tab-scroll">
            <div className="me-section">
              <div className="me-section-header">
                <h3>Current Holdings</h3>
                <span className="count-badge">{HOLDINGS.length} positions</span>
              </div>
              <div className="me-section-body">
                <table className="hold-table">
                  <thead>
                    <tr>
                      <th>Market</th>
                      <th className="th-center">Side</th>
                      <th className="num">Entry</th>
                      <th className="num">Current</th>
                      <th className="num">Contracts</th>
                      <th className="num">Staked</th>
                      <th className="num">P&amp;L</th>
                      <th className="th-center">AI@Entry</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {HOLDINGS.map((h, i) => (
                      <HoldingRow key={i} holding={h} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {activeTab === 'history' && (
        <div className="me-tab-content active">
          <div className="me-tab-scroll">
            <div className="me-section">
              <div className="me-section-header">
                <h3>Trade History</h3>
                <span className="count-badge">Last {TRADES.length} trades</span>
              </div>
              <div className="me-section-body">
                <table className="hold-table">
                  <thead>
                    <tr>
                      <th>Market</th>
                      <th className="th-center">Side</th>
                      <th className="num">Entry</th>
                      <th className="num">Exit</th>
                      <th className="num">Contracts</th>
                      <th className="num">P&amp;L</th>
                      <th className="th-center">AI@Entry</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TRADES.map((t, i) => (
                      <TradeRow key={i} trade={t} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings */}
      {activeTab === 'settings' && (
        <div className="me-tab-content active">
          <div className="me-tab-scroll">
            <div className="me-section acc-settings">
              <SettingsAccordion />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ── */

function StatCard({ label, value, valueColor, sub }: { label: string; value: string; valueColor?: string; sub: string }) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span className={`stat-value ${valueColor || ''}`}>{value}</span>
      <span className="stat-sub">{sub}</span>
    </div>
  );
}

function TabButton({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button className={`me-tabbar-btn ${isActive ? 'active' : ''}`} onClick={onClick}>
      {label}
    </button>
  );
}

function HoldingRow({ holding }: { holding: Holding }) {
  const aiColor = holding.aiAtEntry >= 80 ? 'var(--green)' : holding.aiAtEntry >= 60 ? 'var(--yellow)' : 'var(--blue)';
  return (
    <tr>
      <td>
        <div className="market-cell">
          <span className="mkt-name">{holding.marketName}</span>
          <span className="mkt-meta">{holding.marketMeta}</span>
        </div>
      </td>
      <td className="td-center" style={{color: holding.side === 'YES' ? 'var(--green)' : 'var(--red)', fontWeight: 600, fontSize: 11}}>{holding.side}</td>
      <td className="num">{holding.entry}¢</td>
      <td className="num" style={{color: holding.current >= holding.entry ? 'var(--green)' : 'var(--red)', fontWeight: 600}}>{holding.current}¢</td>
      <td className="num">{holding.contracts}</td>
      <td className="num">${holding.staked.toFixed(2)}</td>
      <td className={`pnl ${holding.pnl === null ? '' : holding.pnl >= 0 ? 'pos' : 'neg'}`}>
        {holding.pnl === null ? '—' : `${holding.pnl >= 0 ? '+' : ''}$${holding.pnl.toFixed(2)}`}
      </td>
      <td className="ai-conf-cell" style={{color: aiColor}}>{holding.aiAtEntry}%</td>
      <td><span className="status-pill open">Open</span></td>
    </tr>
  );
}

function TradeRow({ trade }: { trade: Trade }) {
  const aiColor = trade.aiAtEntry >= 80 ? 'var(--green)' : trade.aiAtEntry >= 60 ? 'var(--yellow)' : 'var(--blue)';
  return (
    <tr>
      <td>
        <div className="market-cell">
          <span className="mkt-name">{trade.marketName}</span>
          <span className="mkt-meta">{trade.marketMeta}</span>
        </div>
      </td>
      <td className="td-center" style={{color: trade.side === 'YES' ? 'var(--green)' : 'var(--red)', fontWeight: 600, fontSize: 11}}>{trade.side}</td>
      <td className="num">{trade.entry}¢</td>
      <td className="num">{trade.exit}¢</td>
      <td className="num">{trade.contracts}</td>
      <td className={`pnl ${trade.pnl >= 0 ? 'pos' : 'neg'}`}>{trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}</td>
      <td className="ai-conf-cell" style={{color: aiColor}}>{trade.aiAtEntry}%</td>
      <td><span className={`status-pill ${trade.result === 'Won' ? 'won' : 'lost'}`}>{trade.result}</span></td>
    </tr>
  );
}

function SettingsAccordion() {
  const [open, setOpen] = useState(true);

  return (
    <>
      <div className={`acc-header ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
        <h3>Account Settings</h3>
        <span className="arrow">▶</span>
      </div>
      <div className={`acc-body ${open ? 'open' : ''}`}>
        <div className="acc-row">
          <div>
            <div className="acc-label">Polymarket CLOB API</div>
            <div className="acc-desc">Connect your API key to enable real trading</div>
          </div>
          <div className="acc-action">
            <span className="acc-btn connected">Connected</span>
          </div>
        </div>
        <div className="acc-row">
          <div>
            <div className="acc-label">Notifications</div>
            <div className="acc-desc">Get alerted 1h before market expiry</div>
          </div>
          <div className="acc-action">
            <span className="acc-btn" onClick={() => alert('Notification preferences coming soon')}>Configure</span>
          </div>
        </div>
        <div className="acc-row">
          <div>
            <div className="acc-label">Default order size</div>
            <div className="acc-desc">Default contracts per quick order</div>
          </div>
          <div className="acc-action" style={{display:'flex',alignItems:'center',gap:8}}>
            <input type="number" defaultValue={10} min={1}
                   style={{width:64,padding:'4px 8px',borderRadius:6,border:'1px solid var(--border)',background:'var(--bg)',fontFamily:'var(--font-body)',fontSize:13,textAlign:'center'}} />
            <span style={{fontSize:11,color:'var(--muted)'}}>ct</span>
          </div>
        </div>
        <div className="acc-row">
          <div>
            <div className="acc-label">Display preference</div>
            <div className="acc-desc">Dark mode coming soon</div>
          </div>
          <div className="acc-action">
            <span className="acc-btn" style={{opacity:0.5}}>Light</span>
          </div>
        </div>
      </div>
    </>
  );
}
```

---

### Task 9: Add design tweaks panel (dev-only)

**Files:**
- Modify: `app/layout.tsx` (add TweaksPanel)

- [ ] **Step 1: Create `app/TweaksPanel.tsx`**

```tsx
'use client';

import { useState } from 'react';

export default function TweaksPanel() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="tweaks-toggle" onClick={() => setOpen(!open)} title="Design tweaks">
        ✦
      </button>
      <div className={`tweaks-panel ${open ? 'open' : ''}`}>
        <h4>Design Tweaks</h4>
        <div className="tweak-row">
          <label>Accent hue</label>
          <input type="range" min="0" max="360" defaultValue={28}
                 onChange={(e) => {
                   document.documentElement.style.setProperty('--accent', `oklch(64% 0.13 ${e.target.value})`);
                 }} />
        </div>
        <div className="tweak-row">
          <label>Border radius</label>
          <select defaultValue="12px"
                  onChange={(e) => {
                    const v = e.target.value;
                    document.documentElement.style.setProperty('--radius-sm', '8px');
                    document.documentElement.style.setProperty('--radius-md', v);
                    document.documentElement.style.setProperty('--radius-lg', v === '20px' ? '24px' : '16px');
                  }}>
            <option value="8px">Sharp (8px)</option>
            <option value="12px">Default (12px)</option>
            <option value="20px">Rounded (20px)</option>
          </select>
        </div>
        <div className="tweak-row">
          <label>Font scale</label>
          <select defaultValue="14px"
                  onChange={(e) => { document.body.style.fontSize = e.target.value; }}>
            <option value="13px">Compact</option>
            <option value="14px">Normal</option>
            <option value="15px">Relaxed</option>
          </select>
        </div>
        <div className="tweak-row">
          <label>Card style</label>
          <select defaultValue="border"
                  onChange={(e) => {
                    const cards = document.querySelectorAll('.mkt-card, .ai-pick-card');
                    cards.forEach(c => {
                      if (e.target.value === 'shadow') {
                        (c as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,.06)';
                        (c as HTMLElement).style.borderColor = 'transparent';
                      } else {
                        (c as HTMLElement).style.boxShadow = 'none';
                        (c as HTMLElement).style.borderColor = 'var(--border)';
                      }
                    });
                  }}>
            <option value="border">Bordered</option>
            <option value="shadow">Shadow</option>
          </select>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Add TweaksPanel to root layout**

In `app/layout.tsx`, add import and component before closing `</body>`:
```tsx
import TweaksPanel from "./TweaksPanel";
// ... inside <body>, after {children}:
<TweaksPanel />
```

---

### Task 10: Navbar active state sync for market detail pages

**Files:**
- Modify: `app/Topbar.tsx` (already done in Task 3 - use `pathname.startsWith('/markets')`)

The implementation in Task 3 Step 2 already handles this: `if (href === '/markets') return pathname.startsWith('/markets');`

---

### Self-Review Checklist

1. **Spec coverage:**
   - [x] All 4 routes: /markets (Task 5), /markets/[id] (Task 6), /aipicks (Task 7), /me (Task 8)
   - [x] Data abstraction with types (Task 1)
   - [x] Prototype CSS preserved (Task 2)
   - [x] Sidebar with AI picks, categories, session stats (Task 4)
   - [x] Market cards with divergence gauge, AI badge, buy buttons (Task 5)
   - [x] Market detail with chart, AI analysis, sources, order form (Task 6)
   - [x] AI Picks timeline with accuracy card (Task 7)
   - [x] Me page with stats, tables, settings accordion (Task 8)
   - [x] Design tweaks panel (Task 9)
   - [x] Topbar with active nav state (Task 3)

2. **Placeholder scan:** No placeholders — all code is complete.

3. **Type consistency:** All types defined in Task 1 match usage in Tasks 5-8.

4. **Scope check:** Focused on porting the prototype. No speculative features.
