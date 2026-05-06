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
