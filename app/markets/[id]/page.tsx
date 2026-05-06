'use client';

import { useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { getMarketById } from '@/data/markets';
import { useLanguage } from '@/lib/LanguageProvider';

export default function MarketDetailPage() {
  const { t } = useLanguage();
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
    <div className="detail-page-wrap">
    <div className="detail-page">
      <Link href="/markets" className="detail-back">← {t.nav.markets}</Link>
      <div className="detail-header">
        <div className="eyebrow">{market.category}</div>
        <h2>{t.marketNames[market.id as keyof typeof t.marketNames] || market.name}</h2>
        <div className="expiry">{t.detail.expires} {market.expiry}</div>
      </div>

      {/* Price Row */}
      <div className="detail-price-row">
        <div>
          <div className="label">{t.detail.bid}</div>
          <div className="value green">{market.bid}¢</div>
          <div className="size">{market.bidSize}</div>
        </div>
        <div>
          <div className="label">{t.detail.last}</div>
          <div className="value" style={{color: priceColor}}>{market.last}¢</div>
          <div className="size">{market.side}</div>
        </div>
        <div>
          <div className="label">{t.detail.ask}</div>
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
          <span>{t.detail.chart1hAgo}</span>
          <span>{t.detail.chartNow}</span>
        </div>
      </div>

      {/* AI Analysis */}
      <div className="detail-ai-box">
        <div className="label">{t.detail.aiAnalysis}</div>
        <div className={`ai-content ${aiExpanded ? '' : 'collapsed'}`}>
          {t.aiReasons[market.id as keyof typeof t.aiReasons] || market.aiReason}
        </div>
        <button className="ai-toggle" onClick={() => setAiExpanded(!aiExpanded)}>
          {aiExpanded ? t.detail.showLess : t.detail.readMore}
        </button>
        <div className="factors">
          {market.factors.map((f, i) => (
            <div key={i} className="factor">
              <span className={`sig ${f.signal}`}></span>
              <span>{((t.marketFactors as any)[market.id] || [])[i] || f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sources */}
      {market.sources && market.sources.length > 0 && (
        <div className="detail-sources">
          <div className="label">{t.detail.sources}</div>
          {market.sources.map((s, i) => (
            <div key={i} className="src-accordion">
              <div className={`src-accordion-header ${openSources.has(i) ? 'open' : ''}`}
                   onClick={() => toggleSource(i)}>
                <div className="left">
                  <span className="src-pub">{s.pub}</span>
                  <span className="src-date">{s.date}</span>
                  <span className={`src-tag ${s.tag}`}>
                    {s.tag === 'support' ? t.detail.supportsAi : s.tag === 'against' ? t.detail.caveat : t.detail.neutral}
                  </span>
                </div>
                <span className="arrow">▶</span>
              </div>
              <div className={`src-accordion-body ${openSources.has(i) ? 'open' : ''}`}>
                <div className="src-headline">{(t.sourceHeadlines as any)[market.id + '_' + i] || s.headline}</div>
                <div className="src-snippet">{(t.sourceSnippets as any)[market.id + '_' + i] || s.snippet}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Order */}
      <div className="detail-order">
        <label>{t.detail.quickOrder}</label>
        <div className="order-row">
          <button className={`order-btn yes ${selectedSide === 'yes' ? 'active' : ''}`}
                  onClick={() => setSelectedSide('yes')}>YES</button>
          <button className={`order-btn no ${selectedSide === 'no' ? 'active' : ''}`}
                  onClick={() => setSelectedSide('no')}>NO</button>
        </div>
        <div className="order-row">
          <input type="number" className="order-input" placeholder={t.detail.contracts} defaultValue={10} min={1} />
          <input type="number" className="order-input" placeholder={t.detail.priceCents} defaultValue={market.price} min={1} max={99} />
        </div>
        <button className="order-submit">
          {t.detail.placeOrder} ({selectedSide.toUpperCase()})
        </button>
      </div>
    </div>
    </div>
  );
}
