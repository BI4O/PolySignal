# Polymarket Signals — Next.js Port Design

## Overview

Port the `polymarket-signals.html` prototype into the existing `newsai_v1` Next.js 16 project,
preserving the visual design (oklch color scheme, CSS custom properties) while refactoring
into a component-based architecture with proper routing.

## Routes

| Route | Description |
|---|---|
| `/markets` | Market list with left sidebar (AI picks, categories, session stats) |
| `/markets/[id]` | Market detail page (replaces the right-side detail panel in the prototype) |
| `/aipicks` | AI Surveillance Log timeline view |
| `/me` | User profile with sub-tabs (Positions, History, Settings) |
| `/` | Redirects to `/markets` |

## Component Tree

```
RootLayout (global CSS, fonts, metadata)
├── Topbar (logo, nav tabs, balance, avatar)
├── [route page]
│
├── /markets
│   └── MarketsPage
│       ├── Sidebar
│       │   ├── AIPicksList (YES Edge / NO Edge groups)
│       │   ├── CategoryFilter (list, with count and dot)
│       │   └── SessionStats (open positions, P&L, ROI, accuracy)
│       └── MarketList
│           ├── ListHeader (title + count)
│           └── MarketCard[] (3-tier hierarchy)
│               ├── MarketHeader (eyebrow, urgency chip, AI badge)
│               ├── MarketTitle
│               ├── DivergenceGauge (track, dots, meta, edge display)
│               └── MarketFooter (EV, Buy button)
│
├── /markets/[id]
│   └── MarketDetailPage
│       ├── DetailHeader (category, name, expiry)
│       ├── PriceRow (bid, last, ask)
│       ├── Chart (sparkline bars)
│       ├── AIAnalysisBox (collapsible reason, factors list)
│       ├── SourcesAccordion[]
│       └── QuickOrderForm (side toggle, contract/price inputs, submit)
│
├── /aipicks
│   └── AIPicksPage
│       ├── TimelineHeader (title, subtitle)
│       ├── AccuracyCard (overall/30d accuracy, calibration bars)
│       └── Timeline
│           └── TimelineEntry[] (dot, card, stats, actions)
│
└── /me
    └── MePage
        ├── StatCards[] (P&L, trades, win rate, positions)
        ├── MeTabBar (Positions / History / Settings)
        ├── PositionsTab
        │   └── HoldingsTable
        ├── HistoryTab
        │   └── TradeHistoryTable
        └── SettingsTab
            └── AccountSettingsAccordion
```

## Data Architecture

- `data/markets.ts` — Market data + TypeScript types/interfaces
  - Types: `Market`, `MarketFactor`, `MarketSource`, `TimelineEntry`, `Holding`, `Trade`
  - Export typed market data object (same data as prototype)
  - Clean interface ready for future API swap

## State Management

- React useState for local UI state (active tab, expanded accordions, category filter)
- No global state library needed at this stage
- Navigation between views uses Next.js routing (not JS tab switching)

## CSS Strategy

- Keep prototype's custom CSS approach (oklch colors, CSS custom properties)
- Move CSS variables and base styles into `app/globals.css`
- Component-specific styles can be CSS Modules or inline in globals.css
- No Tailwind utility classes for layout/styling (only existing Tailwind reset)

## Interaction Behavior

- Market card click → navigate to `/markets/[id]`
- AI pick card click → navigate to `/markets/[id]`
- "Buy" button click → navigate to `/markets/[id]` and scroll to order form
- Category filter → filter market list (client-side)
- AI analysis text → expand/collapse toggle
- Sources accordion → expand/collapse per source
- Me sub-tabs → client-side tab switching within `/me`
- "View market →" links in AI Picks → navigate to `/markets/[id]`
- Design tweaks panel → keep as dev-only feature (same as prototype)

## Future Considerations (NOT in scope)

- API integration (data types are prepared for it)
- Real trading / order submission
- Authentication
- Dark mode
