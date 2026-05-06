import type { Market, Category, TimelineEntry, Holding, Trade } from './types';

// ── Markets ──────────────────────────────────────────────

export const MARKETS: Record<string, Market> = {
  // ── YES edge: BTC above $108K ──
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
      { text: 'Volume spike 3x above 7d average', signal: 'pos' },
      { text: 'Large option open interest at $108K', signal: 'pos' },
      { text: 'Resistance at $107.5K may slow breakout', signal: 'neg' },
      { text: 'Funding rate slightly elevated', signal: 'neu' },
    ],
    sources: [
      {
        pub: 'CoinDesk',
        date: 'May 5',
        headline: 'BTC Open Interest Hits Record $38B as $108K Call Strike Sees Heavy Accumulation',
        snippet:
          'Open interest concentrated at the $108K strike for May 10 expiry, with over 12,000 contracts outstanding.',
        tag: 'support',
      },
      {
        pub: 'Glassnode',
        date: 'May 4',
        headline: 'Exchange Outflow Spike Suggests Accumulation by Whales',
        snippet:
          'Over 45K BTC moved off exchanges in the past week, the largest 7-day outflow since January.',
        tag: 'support',
      },
      {
        pub: 'The Block',
        date: 'May 5',
        headline: 'Beware the $107.5K Resistance — BTC Rejected at Level 3 Times in 48 Hours',
        snippet:
          'Technical analysts warn that $107.5K has acted as a hard ceiling, with wicks rejecting each attempt.',
        tag: 'against',
      },
    ],
  },

  // ── YES edge (BIGGEST): Fed rate cut ──
  m2: {
    id: 'm2',
    name: 'Fed to cut rates at May FOMC meeting',
    category: 'Finance',
    expiry: 'May 12, 2026 · 6 days',
    expiryUrgent: false,
    price: 32,
    side: 'YES',
    aiConf: 68,
    aiConfLevel: 'med',
    edgeDir: 'yes',
    sparkline: [14, 16, 10, 12, 18, 14, 8, 10, 12, 8],
    bid: 31,
    bidSize: '6.8K',
    ask: 33,
    askSize: '5.2K',
    last: 32,
    chart: [25, 28, 24, 30, 27, 33, 29, 35, 32, 38, 34, 36, 32, 32],
    aiReason: 'CPI data due before FOMC — market expects disinflation trend to hold. Fed funds futures pricing ~40% chance of a cut. Tight labor market data last week reduced odds slightly.',
    factors: [
      { text: 'CPI forecast moderates to 2.8%', signal: 'pos' },
      { text: 'Fed rhetoric remains hawkish', signal: 'neg' },
      { text: 'Market-implied probability ~40%', signal: 'neu' },
      { text: 'Treasury yield curve steepening', signal: 'pos' },
    ],
    sources: [
      {
        pub: 'Reuters',
        date: 'May 5',
        headline: 'Powell Reiterates Data-Dependent Stance Ahead of May FOMC',
        snippet:
          'Fed Chair emphasized that rate decisions remain contingent on incoming data, not a pre-set course.',
        tag: 'neutral',
      },
      {
        pub: 'Bloomberg',
        date: 'May 4',
        headline: 'CPI Forecast Moderates to 2.8%, Opening Door for May Cut',
        snippet:
          'Economists surveyed now expect core CPI to moderate, which could give the Fed cover for a cut.',
        tag: 'support',
      },
      {
        pub: 'WSJ',
        date: 'May 3',
        headline: 'Treasury Yield Curve Steepens as Market Reprices Rate Cut Odds',
        snippet:
          'The 2y-10y spread widened 12bp this week, signaling bond traders are pricing in easier policy.',
        tag: 'support',
      },
    ],
  },

  // ── NO edge: Alien disclosure ──
  m3: {
    id: 'm3',
    name: 'US government to disclose alien existence in 2026',
    category: 'Politics',
    expiry: 'May 8, 2026 · 2 days',
    expiryUrgent: false,
    price: 18,
    side: 'YES',
    aiConf: 5,
    aiConfLevel: 'low',
    edgeDir: 'no',
    sparkline: [12, 14, 16, 18, 16, 18, 20, 18, 19, 18],
    bid: 17,
    bidSize: '3.4K',
    ask: 19,
    askSize: '2.8K',
    last: 18,
    chart: [22, 20, 18, 16, 19, 17, 15, 18, 16, 14, 17, 15, 18, 18],
    aiReason: 'AI assigns very low probability based on historical patterns: US government has consistently denied alien existence for 70+ years, multiple whistleblowers were officially debunked, and no administration has ever signaled a policy shift on disclosure. The recent "UAP report" contained zero extraterrestrial claims. Market is overpricing this on hype.',
    factors: [
      { text: '70+ years of consistent govt denial', signal: 'neg' },
      { text: '2024 UAP report found no ET evidence', signal: 'neg' },
      { text: 'Multiple whistleblowers debunked/punished', signal: 'neg' },
      { text: 'Media hype cycle inflating retail interest', signal: 'pos' },
    ],
    sources: [
      {
        pub: 'NYT',
        date: 'May 2',
        headline: 'Pentagon UAP Report Finds No Evidence of Extraterrestrial Technology',
        snippet:
          'The long-awaited report concluded that of 757 cases investigated, none could be attributed to non-human intelligence.',
        tag: 'support',
      },
      {
        pub: 'Washington Post',
        date: 'Apr 28',
        headline: 'Former Pentagon Official Grusch Sanctioned for Leaking Classified UAP Info',
        snippet:
          "The DoD issued a formal censure, reinforcing its position that unauthorized disclosures will face consequences.",
        tag: 'support',
      },
      {
        pub: 'Reuters',
        date: 'Apr 15',
        headline: 'Bill to Create UAP Disclosure Task Force Stalls in Congress',
        snippet:
          'Bipartisan legislation that would have mandated declassification of UAP records failed to advance.',
        tag: 'support',
      },
      {
        pub: 'The Hill',
        date: 'May 1',
        headline: 'Public Interest in UAP Hits All-Time High After Viral Video',
        snippet:
          'Social media engagement around UAP content is up 340% this quarter, fueling speculation markets.',
        tag: 'against',
      },
    ],
  },

  // ── YES edge (tight): ETH above $4K ──
  m4: {
    id: 'm4',
    name: 'ETH price above $4,000 before May 8',
    category: 'Crypto',
    expiry: 'May 8, 2026 · 4 hours',
    expiryUrgent: true,
    price: 78,
    side: 'YES',
    aiConf: 82,
    aiConfLevel: 'high',
    edgeDir: 'yes',
    sparkline: [20, 22, 16, 12, 8, 10, 6, 8, 4, 2],
    bid: 77,
    bidSize: '3.2K',
    ask: 79,
    askSize: '2.9K',
    last: 78,
    chart: [50, 55, 48, 60, 58, 65, 62, 70, 68, 75, 72, 78, 76, 78],
    aiReason: 'ETH is at $3,980, just 0.5% from $4,000. End-of-day liquidity tends to push prices toward round numbers. Prior 4 similar setups succeeded 3 out of 4 times.',
    factors: [
      { text: 'Only 0.5% away from target', signal: 'pos' },
      { text: 'End-of-day buying typically increases', signal: 'pos' },
      { text: 'Gas fees rising — increased activity', signal: 'pos' },
      { text: 'BTC not rising in sync', signal: 'neg' },
    ],
    sources: [
      {
        pub: 'CoinDesk',
        date: 'May 6',
        headline: 'ETH Nears $4K as Traders Eye Round-Number Breakout',
        snippet:
          'ETH is trading at $3,980 with strong support at $3,950. Traders note that round numbers often act as magnets in low-liquidity windows.',
        tag: 'support',
      },
      {
        pub: 'Cointelegraph',
        date: 'May 5',
        headline: 'Gas Fees Spike 40% as DeFi Activity Surges Ahead of Weekend',
        snippet:
          'Ethereum gas prices rose to 45 Gwei, up from 32 Gwei earlier in the week, signaling increased network activity.',
        tag: 'support',
      },
    ],
  },

  // ── NO edge (BIG): Tesla deliveries ──
  m5: {
    id: 'm5',
    name: 'Tesla delivers > 500K vehicles in Q2 2026',
    category: 'Business',
    expiry: 'May 11, 2026 · 5 days',
    expiryUrgent: false,
    price: 65,
    side: 'YES',
    aiConf: 40,
    aiConfLevel: 'low',
    edgeDir: 'no',
    sparkline: [58, 60, 62, 61, 63, 64, 63, 65, 64, 65],
    bid: 64,
    bidSize: '5.1K',
    ask: 66,
    askSize: '4.6K',
    last: 65,
    chart: [72, 70, 68, 65, 62, 58, 55, 52, 48, 45, 42, 40, 38, 40],
    aiReason: 'Market is pricing a Q2 delivery beat at 65¢, but leading indicators point south: China production data down 15% QoQ, Berlin factory idling for retooling, and inventory days rising. Q1 deliveries missed by 8%, and Q2 guidance was not raised. The 500K threshold is a round number that retail chases.',
    factors: [
      { text: 'China production down 15% QoQ', signal: 'neg' },
      { text: 'Berlin factory idling 2 weeks for retool', signal: 'neg' },
      { text: 'Inventory days rising to 28 from 19', signal: 'neg' },
      { text: 'Q1 deliveries already missed by 8%', signal: 'neg' },
      { text: 'Round-number bias attracts retail bids', signal: 'pos' },
    ],
    sources: [
      {
        pub: 'Bloomberg',
        date: 'May 4',
        headline: 'Tesla China Shipments Fall 15% in April Amid Slowing EV Demand',
        snippet:
          'Wholesale shipments from the Shanghai factory fell to 62,000 units, the lowest since December.',
        tag: 'support',
      },
      {
        pub: 'Reuters',
        date: 'May 3',
        headline: 'Tesla Idles Berlin Plant for Two Weeks — Retooling or Demand Weakness?',
        snippet:
          'The unscheduled downtime has analysts questioning whether demand is sufficient to absorb current capacity.',
        tag: 'support',
      },
      {
        pub: 'Electrek',
        date: 'May 5',
        headline: 'Tesla Inventory Days Climb to 28 — Highest Since 2023',
        snippet:
          'Rising inventory levels suggest production is outpacing demand, a bearish signal for Q2 delivery numbers.',
        tag: 'support',
      },
    ],
  },

  // ── YES edge (medium): S&P 500 ──
  m6: {
    id: 'm6',
    name: 'S&P 500 closes above 5,500 this week',
    category: 'Finance',
    expiry: 'May 9, 2026 · 3 days',
    expiryUrgent: false,
    price: 62,
    side: 'YES',
    aiConf: 74,
    aiConfLevel: 'high',
    edgeDir: 'yes',
    sparkline: [18, 20, 14, 10, 12, 8, 6, 10, 6, 4],
    bid: 61,
    bidSize: '9.5K',
    ask: 63,
    askSize: '7.8K',
    last: 62,
    chart: [45, 48, 50, 52, 49, 54, 51, 56, 58, 55, 60, 62, 59, 62],
    aiReason: "Earnings season beats driving index momentum. VIX below 14 suggests low hedging demand. 5,500 is a psychological level with heavy call open interest. Momentum indicators bullish.",
    factors: [
      { text: 'Earnings beat rate 78% this season', signal: 'pos' },
      { text: 'VIX at 13.2 — low fear', signal: 'pos' },
      { text: '$5,500 is major resistance level', signal: 'neg' },
      { text: 'Institutional flow still net long', signal: 'pos' },
    ],
    sources: [
      {
        pub: 'CNBC',
        date: 'May 5',
        headline: "S&P 500 Charges Toward 5,500 — Here's What Needs to Break",
        snippet:
          'The index is within striking distance of 5,500, a level not seen since March. Analysts split on whether momentum can carry through.',
        tag: 'neutral',
      },
      {
        pub: 'Bloomberg',
        date: 'May 4',
        headline: 'Earnings Beat Rate Hits 78%, Highest in 3 Years',
        snippet:
          "With 82% of S&P 500 companies having reported, the beat rate is driving the strongest earnings season since 2023.",
        tag: 'support',
      },
    ],
  },

  // ── Tight: Lakers Game 7 ──
  m7: {
    id: 'm7',
    name: 'Lakers to win Game 7 vs Warriors',
    category: 'Sports',
    expiry: 'May 6, 2026 · 1 hour',
    expiryUrgent: true,
    price: 51,
    side: 'YES',
    aiConf: 55,
    aiConfLevel: 'med',
    edgeDir: 'yes',
    sparkline: [10, 12, 14, 10, 16, 14, 18, 14, 16, 12],
    bid: 50,
    bidSize: '15.1K',
    ask: 52,
    askSize: '12.3K',
    last: 51,
    chart: [48, 45, 50, 47, 52, 49, 53, 51, 55, 53, 56, 54, 55, 51],
    aiReason: 'Game 7 — near coin flip. Lakers have home court but Warriors have momentum from Game 6 win. Injury reports clean for both sides. Sharps slightly leaning Lakers.',
    factors: [
      { text: 'Home court advantage Game 7', signal: 'pos' },
      { text: 'Warriors won last 2 matchups', signal: 'neg' },
      { text: 'Lakers spread covers -2.5', signal: 'pos' },
      { text: 'O/U total points trending under', signal: 'neu' },
    ],
    sources: [
      {
        pub: 'ESPN',
        date: 'May 6',
        headline: "Game 7 Preview: Lakers' Home Court vs Warriors' Momentum",
        snippet:
          'LeBron is 4-1 in Game 7s at home. Curry is averaging 34 points in the last 2 games of this series.',
        tag: 'neutral',
      },
    ],
  },

  // ── Small YES edge: Starship orbit ──
  m8: {
    id: 'm8',
    name: 'SpaceX Starship achieves orbit this launch',
    category: 'Science',
    expiry: 'May 7, 2026 · 8 hours',
    expiryUrgent: true,
    price: 34,
    side: 'YES',
    aiConf: 41,
    aiConfLevel: 'low',
    edgeDir: 'yes',
    sparkline: [8, 6, 10, 14, 12, 16, 20, 18, 22, 20],
    bid: 33,
    bidSize: '2.1K',
    ask: 35,
    askSize: '1.8K',
    last: 34,
    chart: [40, 38, 42, 36, 38, 34, 36, 32, 34, 30, 32, 28, 34, 34],
    aiReason: 'Previous 3 test flights failed before stage separation. FAA approval received but engine reliability on Raptor 3 still unproven. Insiders suggest 50-50 at best.',
    factors: [
      { text: '3 prior flights failed before separation', signal: 'neg' },
      { text: 'FAA license granted', signal: 'pos' },
      { text: 'Raptor 3 still in validation', signal: 'neg' },
      { text: 'Weather conditions favorable', signal: 'pos' },
    ],
    sources: [
      {
        pub: 'Ars Technica',
        date: 'May 4',
        headline: "FAA Grants Launch License for Starship's 4th Integrated Flight Test",
        snippet:
          'The FAA has cleared SpaceX for launch, though requiring corrective actions from the previous flight to be resolved.',
        tag: 'support',
      },
      {
        pub: 'Space News',
        date: 'May 3',
        headline: 'Raptor 3 Engine Still Awaiting Full Certification — Sources Say',
        snippet:
          'Internal sources indicate the Raptor 3 has not completed its full-duration test campaign, raising reliability concerns.',
        tag: 'against',
      },
    ],
  },

  // ── Small YES edge: Trump 2024 ──
  m9: {
    id: 'm9',
    name: 'Trump wins 2024 US Presidential Election',
    category: 'Politics',
    expiry: 'May 6, 2026 · 2 hours',
    expiryUrgent: true,
    price: 23,
    side: 'YES',
    aiConf: 34,
    aiConfLevel: 'low',
    edgeDir: 'yes',
    sparkline: [6, 8, 12, 14, 18, 20, 18, 20, 22, 24],
    bid: 22,
    bidSize: '45.2K',
    ask: 24,
    askSize: '38.1K',
    last: 23,
    chart: [20, 18, 22, 19, 24, 21, 26, 23, 28, 25, 30, 28, 32, 34],
    aiReason: 'Market pricing heavily against candidate. Late money flowing to NO in the final hours. Polling averages show widening gap. Historical patterns suggest late break rarely reverses.',
    factors: [
      { text: 'Last-minute polling shows 8pt deficit', signal: 'neg' },
      { text: 'Betting volume 4x normal for this stage', signal: 'neg' },
      { text: 'Prediction markets historically accurate at T-2h', signal: 'pos' },
      { text: 'Key swing state data inconclusive', signal: 'neu' },
    ],
    sources: [
      {
        pub: '538',
        date: 'May 6',
        headline: "Final Polling Average Shows 8-Point Gap Narrowing Only Slightly",
        snippet:
          "With just hours to go, the trailing candidate's chances of closing the gap are historically slim.",
        tag: 'support',
      },
      {
        pub: 'Politico',
        date: 'May 5',
        headline: 'Late Money Floods NO Side — Betting Volume 4x Normal',
        snippet:
          'Prediction markets are seeing unprecedented late-stage volume, with 78% of new money flowing to NO.',
        tag: 'support',
      },
    ],
  },
};

// ── Categories ───────────────────────────────────────────

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'All markets', color: 'var(--accent)', count: 9 },
  { id: 'Crypto', name: 'Crypto', color: 'oklch(55% 0.15 145)', count: 2 },
  { id: 'Finance', name: 'Finance', color: 'var(--accent)', count: 2 },
  { id: 'Politics', name: 'Politics', color: 'var(--red)', count: 2 },
  { id: 'Sports', name: 'Sports', color: 'var(--yellow)', count: 1 },
  { id: 'Science', name: 'Science', color: 'var(--blue)', count: 1 },
  { id: 'Business', name: 'Business', color: 'oklch(55% 0.1 300)', count: 1 },
];

// ── Timeline ─────────────────────────────────────────────

export const TIMELINE_ENTRIES: TimelineEntry[] = [
  {
    id: 'tl-1',
    timeAgo: '10 minutes ago',
    type: 'monitor',
    icon: '👀',
    title: 'BTC market volume spike detected',
    description:
      'Trading volume surged 3x above the 7-day average in the last 15 minutes. Price moved from 65c -> 67c, AI confidence steady at 87%. Edge expanded from +15pt -> +20pt.',
    stats: [
      { label: 'Vol', value: '3.2× avg', arrow: '↑' },
      { label: 'Edge', value: '+20pt', color: 'green', arrow: '↑' },
      { label: 'Price', value: '67¢' },
      { label: 'AI', value: '87%', color: 'green' },
    ],
    marketId: 'm1',
  },
  {
    id: 'tl-2',
    timeAgo: '30 minutes ago',
    type: 'rebalance',
    icon: '🔄',
    title: 'AI adjusted view on <strong>Fed rate cut</strong> market',
    description:
      'New CPI data published — AI re-evaluated. Confidence revised from <strong>62% → 68%</strong>. Edge widened from <strong>+10pt → +14pt</strong>. Primary driver: inflation trend moderating faster than expected.',
    stats: [
      { label: 'Conf', value: '68%', color: 'green', arrow: '↑' },
      { label: 'Edge', value: '+14pt', color: 'green', arrow: '↑' },
      { label: 'Price', value: '32¢' },
    ],
    marketId: 'm2',
  },
  {
    id: 'tl-3',
    timeAgo: '2 hours ago',
    type: 'discovery',
    icon: '✨',
    title: 'New market flagged: <strong>S&P 500 closes above 5,500 this week</strong>',
    description:
      'AI identified this as a high-potential opportunity. Earnings season beat rate at 78%, VIX below 14. Initial analysis: <strong>74% confidence</strong>, <strong>+12pt edge</strong> vs market price of 62¢.',
    stats: [
      { label: 'AI', value: '74%', color: 'green' },
      { label: 'Edge', value: '+12pt', color: 'green' },
      { label: 'Price', value: '62¢' },
    ],
    marketId: 'm6',
  },
  {
    id: 'tl-4',
    timeAgo: '45 minutes ago',
    type: 'monitor',
    icon: '👀',
    title: 'Alien disclosure market — retail hype spike detected',
    description:
      'Social media sentiment surged 340% after a viral UAP video. Market price inched up from 16¢ to <strong>18¢</strong> but AI conviction remains at <strong>5%</strong>. Edge has actually <em>widened</em> in favor of NO. <strong>Recommended action: Buy NO at inflated YES price.</strong>',
    stats: [
      { label: 'Price', value: '18¢', arrow: '↑' },
      { label: 'AI', value: '5%', color: 'red' },
      { label: 'Edge', value: '-13pt', color: 'red' },
    ],
    marketId: 'm3',
  },
  {
    id: 'tl-5',
    timeAgo: '1 hour ago',
    type: 'rebalance',
    icon: '🔄',
    title: 'AI downgraded <strong>Tesla Q2 deliveries</strong> confidence',
    description:
      'Berlin factory retooling news broke — AI revised confidence from <strong>44% → 40%</strong>. Market still pricing at <strong>65¢</strong> (YES side), creating a <strong>-25pt NO edge</strong>. All 5 factors now lean negative.',
    stats: [
      { label: 'Conf', value: '40%', color: 'red', arrow: '↓' },
      { label: 'Edge', value: '-25pt', color: 'red' },
      { label: 'Market', value: '65¢' },
    ],
    marketId: 'm5',
  },
  {
    id: 'tl-6',
    timeAgo: '4 hours ago',
    type: 'discovery',
    icon: '✨',
    title: 'New market flagged: <strong>ETH price above $4,000 before May 8</strong>',
    description:
      'ETH at $3,980, just 0.5% from target. AI notes that end-of-day liquidity tends to push prices toward round numbers. <strong>82% confidence</strong>, prior 4 similar setups succeeded 3 out of 4 times.',
    stats: [
      { label: 'AI', value: '82%', color: 'green' },
      { label: 'Edge', value: '+4pt', color: 'green' },
      { label: 'Price', value: '78¢' },
    ],
    marketId: 'm4',
  },
  {
    id: 'tl-7',
    timeAgo: '2 hours ago',
    type: 'monitor',
    icon: '👀',
    title: 'Trump 2024 market — late money flowing to NO',
    description:
      'Volume spiked to 4× normal levels in the final hours. <strong>78% of new bets</strong> are going to NO. Market price dropped from 27¢ to <strong>23¢</strong>. AI conviction at <strong>34%</strong> — consistent with market direction.',
    stats: [
      { label: 'Vol', value: '4× avg', arrow: '↑' },
      { label: 'Price', value: '23¢', color: 'red', arrow: '↓' },
      { label: 'AI', value: '34%' },
    ],
    marketId: 'm9',
  },
];

// ── Holdings ─────────────────────────────────────────────

export const HOLDINGS: Holding[] = [
  {
    marketName: 'Bitcoin above $108K by May 10',
    marketMeta: 'Crypto · Exp May 10 · 4d left',
    side: 'YES',
    entry: 45,
    current: 67,
    contracts: 25,
    staked: 11.25,
    pnl: 5.5,
    aiAtEntry: 87,
    status: 'Open',
  },
  {
    marketName: 'Fed to cut rates at May FOMC',
    marketMeta: 'Finance · Exp May 12 · 6d left',
    side: 'YES',
    entry: 28,
    current: 32,
    contracts: 40,
    staked: 11.2,
    pnl: 1.6,
    aiAtEntry: 68,
    status: 'Open',
  },
  {
    marketName: 'US govt to disclose alien existence in 2026',
    marketMeta: 'Politics · Exp May 8 · 2d left',
    side: 'NO',
    entry: 82,
    current: 82,
    contracts: 20,
    staked: 16.4,
    pnl: null,
    aiAtEntry: 5,
    status: 'Open',
  },
];

// ── Trades ───────────────────────────────────────────────

export const TRADES: Trade[] = [
  {
    marketName: 'ETH price above $4,000 before May 8',
    marketMeta: 'Crypto · Settled May 8, 2026',
    side: 'YES',
    entry: 55,
    exit: 72,
    contracts: 50,
    pnl: 8.5,
    aiAtEntry: 82,
    result: 'Won',
  },
  {
    marketName: 'S&P 500 above 5,500 this week',
    marketMeta: 'Finance · Settled May 6, 2026',
    side: 'YES',
    entry: 58,
    exit: 61,
    contracts: 30,
    pnl: 0.9,
    aiAtEntry: 74,
    result: 'Won',
  },
  {
    marketName: 'Trump wins 2024 US Election',
    marketMeta: 'Politics · Settled May 4, 2026',
    side: 'NO',
    entry: 76,
    exit: 84,
    contracts: 100,
    pnl: 8.0,
    aiAtEntry: 34,
    result: 'Won',
  },
  {
    marketName: 'SpaceX Starship achieves orbit',
    marketMeta: 'Science · Settled May 2, 2026',
    side: 'YES',
    entry: 36,
    exit: 41,
    contracts: 15,
    pnl: 0.75,
    aiAtEntry: 41,
    result: 'Won',
  },
  {
    marketName: 'Lakers to win Game 7 vs Warriors',
    marketMeta: 'Sports · Settled May 6, 2026',
    side: 'YES',
    entry: 51,
    exit: 0,
    contracts: 20,
    pnl: -10.2,
    aiAtEntry: 55,
    result: 'Lost',
  },
  {
    marketName: 'Tesla deliveries > 500K in Q2',
    marketMeta: 'Business · Settled Apr 28, 2026',
    side: 'NO',
    entry: 60,
    exit: 68,
    contracts: 35,
    pnl: 2.8,
    aiAtEntry: 40,
    result: 'Won',
  },
];

// ── Helper functions ─────────────────────────────────────

export function getAllMarkets(): Market[] {
  return Object.values(MARKETS);
}

export function getMarketById(id: string): Market | undefined {
  return MARKETS[id];
}
