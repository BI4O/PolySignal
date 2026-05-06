'use client';

import type { Market } from '@/data/types';

export default function MarketCard({ market, isSelected, onSelect }: {
  market: Market;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
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
                onClick={(e) => { e.stopPropagation(); onSelect(market.id); }}>
          Buy {isYesEdge ? 'YES' : 'NO'}
        </button>
      </div>
    </div>
  );
}
