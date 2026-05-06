'use client';

import { useState } from 'react';
import { getAllMarkets, getMarketById } from '@/data/markets';
import MarketCard from './MarketCard';
import DetailPanel from './DetailPanel';
import type { Market } from '@/data/types';

export default function MarketsPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedMarketId, setSelectedMarketId] = useState<string>('m1');
  const allMarkets = getAllMarkets();
  const filteredMarkets = activeCategory === 'all'
    ? allMarkets
    : allMarkets.filter(m => m.category === activeCategory);
  const selectedMarket = getMarketById(selectedMarketId) || null;

  const handleSelectMarket = (id: string) => {
    setSelectedMarketId(id);
  };

  return (
    <>
      <div className="market-list">
        <div className="list-header">
          <h2>Expiring Soon</h2>
          <span className="count">{filteredMarkets.length} markets</span>
        </div>
        {filteredMarkets.map(market => (
          <MarketCard
            key={market.id}
            market={market}
            isSelected={market.id === selectedMarketId}
            onSelect={handleSelectMarket}
          />
        ))}
      </div>
      <DetailPanel market={selectedMarket} />
    </>
  );
}
