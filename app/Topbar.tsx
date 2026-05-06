'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/markets', label: 'Markets' },
  { href: '/aipicks', label: 'AI Picks' },
  { href: '/me', label: 'Me' },
];

export default function Topbar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/markets') return pathname.startsWith('/markets');
    return pathname === href;
  };

  return (
    <header className="topbar">
      <div className="topbar-logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
        </svg>
        Polymarket Signals
      </div>
      <nav className="topbar-nav">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={isActive(item.href) ? 'active' : ''}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="topbar-right">
        <span className="topbar-balance">Balance <strong>$12,430</strong></span>
        <div className="topbar-avatar">B</div>
      </div>
    </header>
  );
}
