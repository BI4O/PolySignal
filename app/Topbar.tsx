'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageProvider';
import { useAuth } from '@/lib/auth-provider';
import { useUserData } from '@/lib/user-data-provider';
import type { Lang } from '@/data/translations';

export default function Topbar() {
  const { lang, setLang, t } = useLanguage();
  const { address, isConnected, login, logout } = useAuth();
  const { summary, loading } = useUserData();
  const pathname = usePathname();

  const NAV_ITEMS = [
    { href: '/markets', label: t.nav.markets },
    { href: '/aipicks', label: t.nav.aiPicks },
    { href: '/me', label: t.nav.me },
  ];
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => {
    if (href === '/markets') return pathname.startsWith('/markets');
    return pathname === href;
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '';

  const avatarLetter = address ? address[2].toUpperCase() : '?';

  // Not logged in — show Sign In button
  if (!isConnected) {
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
          <button className="topbar-signin" onClick={login}>
            {t.topbar.signIn}
          </button>
        </div>
      </header>
    );
  }

  // Logged in — show balance + avatar
  const balanceStr = summary
    ? `$${summary.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : loading
      ? '...'
      : '$0.00';

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
      <div className="topbar-right" ref={dropdownRef}>
        <span className="topbar-balance">{t.topbar.balance} <strong>{balanceStr}</strong></span>
        <div className="topbar-avatar" onClick={() => setDropdownOpen(!dropdownOpen)} style={{ cursor: 'pointer' }}>
          {avatarLetter}
        </div>

        {dropdownOpen && (
          <div className="avatar-dropdown">
            {/* User info */}
            <div className="ad-header">
              <div className="ad-avatar">{avatarLetter}</div>
              <div>
                <div className="ad-name">{shortAddress}</div>
                <div className="ad-email">{t.topbar.connectedWallet}</div>
              </div>
            </div>
            <div className="ad-stats">
              <div className="ad-stat">
                <span className="ad-stat-label">{t.topbar.balance}</span>
                <span className="ad-stat-value">{balanceStr}</span>
              </div>
              <div className="ad-stat">
                <span className="ad-stat-label">{t.me.totalPnl}</span>
                <span className={`ad-stat-value ${summary && summary.totalPnl >= 0 ? 'green' : ''}`}>
                  {summary ? `${summary.totalPnl >= 0 ? '+' : ''}$${summary.totalPnl.toFixed(2)}` : '—'}
                </span>
              </div>
              <div className="ad-stat">
                <span className="ad-stat-label">{t.me.positions}</span>
                <span className="ad-stat-value">{summary?.openPositions ?? '—'}</span>
              </div>
              <div className="ad-stat">
                <span className="ad-stat-label">{t.me.winRate}</span>
                <span className="ad-stat-value">{summary ? `${summary.winRate}%` : '—'}</span>
              </div>
            </div>

            <div className="ad-divider" />

            {/* Logout */}
            <button className="ad-logout-btn" onClick={logout}>
              {t.topbar.signOut}
            </button>

            <div className="ad-divider" />

            {/* Language selector */}
            <div className="ad-lang-row">
              <span className="ad-lang-label">{t.topbar.language}</span>
              <select
                className="ad-lang-select"
                value={lang}
                onChange={(e) => setLang(e.target.value as Lang)}
              >
                <option value="en">English</option>
                <option value="zh">中文</option>
              </select>
            </div>

            {/* Design tweaks toggle */}
            <button className="ad-tweaks-toggle" onClick={() => setTweaksOpen(!tweaksOpen)}>
              {t.dropdown.designTweaks}
              <span className={`ad-arrow ${tweaksOpen ? 'open' : ''}`}>▶</span>
            </button>

            {tweaksOpen && (
              <div className="ad-tweaks-body">
                <div className="tweak-row">
                  <label>{t.dropdown.accentHue}</label>
                  <input type="range" min="0" max="360" defaultValue={28}
                         onChange={(e) => {
                           document.documentElement.style.setProperty('--accent', `oklch(64% 0.13 ${e.target.value})`);
                         }} />
                </div>
                <div className="tweak-row">
                  <label>{t.dropdown.radius}</label>
                  <select defaultValue="12px"
                          onChange={(e) => {
                            const v = e.target.value;
                            document.documentElement.style.setProperty('--radius-sm', v === '20px' ? '12px' : '8px');
                            document.documentElement.style.setProperty('--radius-md', v);
                            document.documentElement.style.setProperty('--radius-lg', v === '20px' ? '24px' : '16px');
                          }}>
                    <option value="8px">{t.dropdown.sharp}</option>
                    <option value="12px">{t.dropdown.default}</option>
                    <option value="20px">{t.dropdown.rounded}</option>
                  </select>
                </div>
                <div className="tweak-row">
                  <label>{t.dropdown.font}</label>
                  <select defaultValue="14px"
                          onChange={(e) => { document.body.style.fontSize = e.target.value; }}>
                    <option value="13px">{t.dropdown.compact}</option>
                    <option value="14px">{t.dropdown.normal}</option>
                    <option value="15px">{t.dropdown.relaxed}</option>
                  </select>
                </div>
                <div className="tweak-row">
                  <label>{t.dropdown.cards}</label>
                  <select defaultValue="border"
                          onChange={(e) => {
                            const cards = document.querySelectorAll('.mkt-card, .ai-pick-card');
                            cards.forEach(c => {
                              if (e.target.value === 'shadow') {
                                (c as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,.06)';
                                (c as HTMLElement).style.borderColor = 'transparent';
                              } else {
                                (c as HTMLElement).style.boxShadow = 'none';
                                (c as HTMLElement).style.borderColor = 'var(--border)';
                              }
                            });
                          }}>
                    <option value="border">{t.dropdown.bordered}</option>
                    <option value="shadow">{t.dropdown.shadow}</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
