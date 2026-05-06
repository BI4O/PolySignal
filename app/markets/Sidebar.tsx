'use client';

import Link from 'next/link';
import { CATEGORIES } from '@/data/markets';

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
              className="cat-item"
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
          <div style={{display:'flex',justifyContent:'space-between'}}>
            <span style={{color:'var(--muted)'}}>Open positions</span>
            <strong>3</strong>
          </div>
          <div style={{display:'flex',justifyContent:'space-between'}}>
            <span style={{color:'var(--muted)'}}>P&L today</span>
            <strong style={{color:'var(--green)'}}>+$124.50</strong>
          </div>
          <div style={{display:'flex',justifyContent:'space-between'}}>
            <span style={{color:'var(--muted)'}}>Session ROI</span>
            <strong style={{color:'var(--green)'}}>+3.2%</strong>
          </div>
          <div style={{display:'flex',justifyContent:'space-between'}}>
            <span style={{color:'var(--muted)'}}>AI accuracy (30d)</span>
            <strong style={{color:'var(--green)'}}>73%</strong>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',paddingTop:4,borderTop:'1px solid var(--border)',marginTop:1}}>
            <span style={{color:'var(--muted)',fontSize:11}}>Best pick</span>
            <span style={{fontSize:11,color:'var(--green)'}}>BTC +$87.20</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
