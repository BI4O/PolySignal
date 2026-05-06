import { Suspense } from 'react';
import MarketsPageInner from './MarketsPageInner';

export default function MarketsPage() {
  return (
    <Suspense fallback={<div className="market-list"><div className="list-header"><h2>Loading...</h2></div></div>}>
      <MarketsPageInner />
    </Suspense>
  );
}
