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
    <div className="detail-page-wrap">
    <div className="detail-page">
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
    </div>
  );
}
