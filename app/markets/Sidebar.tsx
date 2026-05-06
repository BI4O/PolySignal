'use client';

import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { CATEGORIES } from '@/data/markets';
import { useLanguage } from '@/lib/LanguageProvider';

function pickName(marketId: string, t: any): string {
  const map: Record<string, string> = {
    m1: t.aiPicks.yes1_name,
    m2: t.aiPicks.yes2_name,
    m3: t.aiPicks.no1_name,
    m5: t.aiPicks.no2_name,
  };
  return map[marketId] || '';
}

function pickMeta(marketId: string, t: any): string {
  const map: Record<string, string> = {
    m1: t.aiPicks.yes1_meta,
    m2: t.aiPicks.yes2_meta,
    m3: t.aiPicks.no1_meta,
    m5: t.aiPicks.no2_meta,
  };
  return map[marketId] || '';
}

const YES_EDGE_PICKS = [
  { marketId: 'm1', rank: 1, conf: 87, confClass: 'high' as const },
  { marketId: 'm2', rank: 2, conf: 68, confClass: 'high' as const },
];
const NO_EDGE_PICKS = [
  { marketId: 'm3', rank: 1, conf: 5, confClass: 'no-edge' as const },
  { marketId: 'm5', rank: 2, conf: 40, confClass: 'no-edge' as const },
];

export default function Sidebar() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const activeCat = searchParams.get('cat') || 'all';

  const handleCatClick = (catId: string) => {
    if (catId === 'all') {
      router.replace(pathname);
    } else {
      router.replace(`${pathname}?cat=${catId}`);
    }
  };

  return (
    <aside className="sidebar">
      {/* YES Edge picks */}
      <div className="sidebar-group">
        <div className="sidebar-section-title">{t.sidebar.aiTopPicks}</div>
        <div className="edge-group-label yes">{t.sidebar.yesEdge}</div>
        <div className="ai-picks-list">
          {YES_EDGE_PICKS.map(pick => (
            <Link
              key={pick.marketId}
              href={`/markets/${pick.marketId}`}
              className="ai-pick-card"
            >
              <div className="ai-pick-rank">{pick.rank}</div>
              <div className="ai-pick-info">
                <div className="name">{pickName(pick.marketId, t)}</div>
                <div className="meta">{pickMeta(pick.marketId, t)}</div>
              </div>
              <span className={`ai-pick-conf ${pick.confClass}`}>{pick.conf}%</span>
            </Link>
          ))}
        </div>
      </div>

      {/* NO Edge picks */}
      <div className="sidebar-group">
        <div className="edge-group-label no">{t.sidebar.noEdge}</div>
        <div className="ai-picks-list">
          {NO_EDGE_PICKS.map(pick => (
            <Link
              key={pick.marketId}
              href={`/markets/${pick.marketId}`}
              className="ai-pick-card no-edge"
            >
              <div className="ai-pick-rank">{pick.rank}</div>
              <div className="ai-pick-info">
                <div className="name">{pickName(pick.marketId, t)}</div>
                <div className="meta">{pickMeta(pick.marketId, t)}</div>
              </div>
              <span className={`ai-pick-conf ${pick.confClass}`}>{pick.conf}%</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Categories — flex: 1 to fill remaining space */}
      <div className="sidebar-group" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div className="sidebar-section-title">{t.sidebar.categories}</div>
        <div className="cat-list">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`cat-item ${activeCat === cat.id ? 'active' : ''}`}
              onClick={() => handleCatClick(cat.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="cat-dot" style={{ background: cat.color }}></span>
                {t.categories[cat.id as keyof typeof t.categories] || cat.name}
              </div>
              <span className="cat-count">{t.categoryCounts[cat.id as keyof typeof t.categoryCounts]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Today's Session — pushed to bottom */}
      <div className="sidebar-group" style={{ marginTop: 'auto' }}>
        <div className="sidebar-section-title">{t.sidebar.todaysSession}</div>
        <div style={{fontSize:13,display:'flex',flexDirection:'column',gap:5,padding:'0 2px'}}>
          <div style={{display:'flex',justifyContent:'space-between'}}>
            <span style={{color:'var(--muted)'}}>{t.sidebar.openPositions}</span>
            <strong>{t.session.openPositions}</strong>
          </div>
          <div style={{display:'flex',justifyContent:'space-between'}}>
            <span style={{color:'var(--muted)'}}>{t.sidebar.pnlToday}</span>
            <strong style={{color:'var(--green)'}}>{t.session.pnlToday}</strong>
          </div>
          <div style={{display:'flex',justifyContent:'space-between'}}>
            <span style={{color:'var(--muted)'}}>{t.sidebar.sessionRoi}</span>
            <strong style={{color:'var(--green)'}}>{t.session.roi}</strong>
          </div>
          <div style={{display:'flex',justifyContent:'space-between'}}>
            <span style={{color:'var(--muted)'}}>{t.sidebar.aiAccuracy}</span>
            <strong style={{color:'var(--green)'}}>{t.session.accuracy}</strong>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',paddingTop:4,borderTop:'1px solid var(--border)',marginTop:1}}>
            <span style={{color:'var(--muted)',fontSize:11}}>{t.sidebar.bestPick}</span>
            <span style={{fontSize:11,color:'var(--green)'}}>{t.session.bestPick}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
