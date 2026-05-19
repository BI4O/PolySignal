'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getAllMarkets } from '@/data/markets';
import { fetchPowerLeaderboardMarkets } from '@/lib/powerLeaderboard';
import MarketCard from './MarketCard';
import DetailPanel from './DetailPanel';
import { useLanguage } from '@/lib/LanguageProvider';

export default function MarketsPageInner() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('cat') || 'all';
  const [markets, setMarkets] = useState(() => getAllMarkets());
  const [selectedMarketId, setSelectedMarketId] = useState<string>(() => getAllMarkets()[0]?.id ?? '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadMarkets() {
      setLoading(true);
      const loadedMarkets = await fetchPowerLeaderboardMarkets();
      if (!cancelled) {
        setMarkets(loadedMarkets);
        setLoading(false);
      }
    }

    loadMarkets();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (markets.length > 0 && !markets.some(market => market.id === selectedMarketId)) {
      setSelectedMarketId(markets[0].id);
    }
  }, [markets, selectedMarketId]);

  const filteredMarkets = useMemo(() => activeCategory === 'all'
    ? markets
    : markets.filter(m => m.category === activeCategory), [activeCategory, markets]);
  const selectedMarket = useMemo(
    () => markets.find(market => market.id === selectedMarketId) || null,
    [markets, selectedMarketId],
  );

  const handleSelectMarket = (id: string) => {
    setSelectedMarketId(id);
  };

  return (
    <>
      <div className="market-list">
        <div className="list-header">
          <h2>{t.markets.expiringSoon}</h2>
          <span className="count">
            {filteredMarkets.length} {t.markets.markets_count}
            {loading ? ' · Loading...' : ''}
          </span>
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
