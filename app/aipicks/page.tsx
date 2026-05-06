'use client';

import Link from 'next/link';
import { TIMELINE_ENTRIES } from '@/data/markets';
import { useLanguage } from '@/lib/LanguageProvider';

const STAT_LABEL_KEYS: Record<string, string> = {
  Vol: 'tl_vol',
  Edge: 'tl_edge',
  Price: 'tl_price',
  AI: 'tl_ai',
  Conf: 'tl_conf',
  Market: 'tl_market',
};

export default function AIPicksPage() {
  const { t } = useLanguage();

  const TYPE_LABELS: Record<string, string> = {
    monitor: t.aipicks.monitoring,
    rebalance: t.aipicks.rebalance,
    discovery: t.aipicks.discovery,
  };

  return (
    <div className="aipicks-timeline-body">
      <div className="tl-header">
        <div>
          <h1>
            {t.aipicks.title}
            <small>{t.aipicks.subtitle}</small>
          </h1>
        </div>
        <div className="accuracy-card">
          <div className="title">{t.aipicks.accuracy}</div>
          <div className="row">
            <span className="l">{t.aipicks.overall}</span>
            <span className="r green">73%</span>
          </div>
          <div className="row">
            <span className="l">{t.aipicks.last30d}</span>
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
              <div className="tl-card-title" dangerouslySetInnerHTML={{ __html: t.timeline[(entry.id.replace('-', '') + '_title') as keyof typeof t.timeline] as string || entry.title }} />
              <div className="tl-card-desc" dangerouslySetInnerHTML={{ __html: t.timeline[(entry.id.replace('-', '') + '_desc') as keyof typeof t.timeline] as string || entry.description }} />
              <div className="tl-stats">
                {entry.stats.map((stat, i) => (
                  <div key={i} className="tl-stat">
                    {stat.label && <span className="lbl">{t.timeline[(STAT_LABEL_KEYS[stat.label] || 'tl_vol') as keyof typeof t.timeline] as string}</span>}
                    <span className={`val ${stat.color || ''}`}>{stat.value}</span>
                    {stat.arrow && <span className={`arrow-up ${stat.arrow === '↓' ? 'flip' : ''}`}>
                      {stat.arrow === '↓' ? '↓' : '↑'}
                    </span>}
                  </div>
                ))}
              </div>
              <div className="tl-actions">
                <Link href={`/markets/${entry.marketId}`} className="tl-market-link">
                  {t.aipicks.viewMarket}
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
