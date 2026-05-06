'use client';

import Link from 'next/link';
import type { Market } from '@/data/types';
import { useLanguage } from '@/lib/LanguageProvider';

export default function MarketCard({ market, isSelected, onSelect }: {
  market: Market;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const { t } = useLanguage();
  const edgePts = Math.abs(market.price - market.aiConf);
  const isYesEdge = market.edgeDir === 'yes';

  const handleClick = () => {
    onSelect(market.id);
  };

  return (
    <div className={`mkt-card ${isSelected ? 'selected' : ''}`} onClick={handleClick}>
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
        <div className={`ai-badge-large ${isYesEdge ? 'yes-edge' : 'no-edge'}`}>
          <div className="ai-market-strike">{market.price}¢</div>
          <div className="ai-main-row">
            <span className={`ai-pct ${market.aiConfLevel === 'high' ? 'pos' : market.aiConfLevel === 'low' ? 'neg' : 'neu'}`}>
              {market.aiConf}%
            </span>
            <span className="ai-badge-label">AI</span>
          </div>
          <span className={`ai-edge-label ${isYesEdge ? 'pos' : 'neg'}`}>
            {isYesEdge ? '+' : ''}{edgePts}pt
          </span>
        </div>
      </div>

      <Link href={`/markets/${market.id}`} className="mkt-title"
            onClick={(e) => e.stopPropagation()}>
        {t.marketNames[market.id as keyof typeof t.marketNames] || market.name}
        <span className="mkt-title-arrow">→</span>
      </Link>

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
            {isYesEdge ? '+' : ''}{edgePts}pt <small>{t.markets.edge}{!isYesEdge ? ` · ${t.markets.onNo}` : ''}</small>
          </span>
          <span className={`dv ai-dv ${!isYesEdge ? 'neg' : ''}`}>{market.aiConf}%</span>
        </div>
      </div>

      <div className="mkt-footer">
        <span className="ev">
          {t.markets.ev} <strong>${(edgePts * 0.1).toFixed(2)}</strong>
          {!isYesEdge ? `${t.markets.per10ct} ${t.markets.onNo}` : t.markets.per10ct}
        </span>
        <button className={`mkt-buy ${isYesEdge ? 'yes' : 'no'}`}
                onClick={(e) => { e.stopPropagation(); onSelect(market.id); }}>
          {t.markets.buy} {isYesEdge ? 'YES ↑' : 'NO ↓'}
        </button>
      </div>
    </div>
  );
}
