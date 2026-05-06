import { Suspense } from 'react';
import Sidebar from './Sidebar';

export default function MarketsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<aside className="sidebar" />}>
        <Sidebar />
      </Suspense>
      <div className="main">
        {children}
      </div>
    </>
  );
}
