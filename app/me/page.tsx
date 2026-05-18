'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/LanguageProvider';
import { useAuth } from '@/lib/auth-provider';
import { useUserData } from '@/lib/user-data-provider';
import type { PositionData, TradeData } from '@/lib/user-data-provider';

type MeTab = 'positions' | 'history' | 'settings';

export default function MePage() {
  const { t } = useLanguage();
  const { isConnected, login } = useAuth();
  const { summary, positions, trades, loading, error } = useUserData();
  const [activeTab, setActiveTab] = useState<MeTab>('positions');

  // Not logged in
  if (!isConnected) {
    return (
      <div className="me-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 16, color: 'var(--muted)', marginBottom: 16 }}>
            {t.me.connectToView}
          </p>
          <button className="topbar-signin" onClick={login}>
            {t.topbar.signIn}
          </button>
        </div>
      </div>
    );
  }

  // Loading
  if (loading && !summary) {
    return (
      <div className="me-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--muted)' }}>{t.me.loading}</p>
      </div>
    );
  }

  // Error
  if (error && !summary) {
    return (
      <div className="me-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--red)', marginBottom: 12 }}>{error}</p>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>{t.me.dataUnavailable}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="me-page">
      {/* Stat cards */}
      <div className="stat-row">
        <StatCard
          label={t.me.totalPnl}
          value={summary ? `${summary.totalPnl >= 0 ? '+' : ''}$${summary.totalPnl.toFixed(2)}` : '—'}
          valueColor={summary && summary.totalPnl >= 0 ? 'green' : summary && summary.totalPnl < 0 ? 'red' : undefined}
          sub={t.me.sinceFirstTrade}
        />
        <StatCard
          label={t.me.trades}
          value={summary?.tradeCount.toString() ?? '—'}
          sub={`${summary ? Math.round(summary.tradeCount * (summary.winRate / 100)) : '—'} won · ${summary ? summary.tradeCount - Math.round(summary.tradeCount * (summary.winRate / 100)) : '—'} lost`}
        />
        <StatCard
          label={t.me.winRate}
          value={summary ? `${summary.winRate}%` : '—'}
          sub={summary ? `Last 30d: ${summary.winRate}%` : ''}
        />
        <StatCard
          label={t.me.activePositions}
          value={summary?.openPositions.toString() ?? '—'}
          sub={`${t.me.atStake}`}
        />
      </div>

      {/* Tab bar */}
      <div className="me-tabbar">
        <TabButton label={t.me.positions} isActive={activeTab === 'positions'} onClick={() => setActiveTab('positions')} />
        <TabButton label={t.me.history} isActive={activeTab === 'history'} onClick={() => setActiveTab('history')} />
        <TabButton label={t.me.settings} isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </div>

      {/* Positions */}
      {activeTab === 'positions' && (
        <div className="me-tab-content active">
          <div className="me-tab-scroll">
            <div className="me-section">
              <div className="me-section-header">
                <h3>{t.me.currentHoldings}</h3>
                <span className="count-badge">{positions.length} {t.me.positions}</span>
              </div>
              <div className="me-section-body">
                {positions.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                    {t.me.noPositions}
                  </div>
                ) : (
                  <table className="hold-table">
                    <thead>
                      <tr>
                        <th>{t.me.market}</th>
                        <th className="th-center">{t.me.side}</th>
                        <th className="num">{t.me.entry}</th>
                        <th className="num">{t.me.current}</th>
                        <th className="num">{t.me.contracts}</th>
                        <th className="num">{t.me.staked}</th>
                        <th className="num">{t.me.pnl}</th>
                        <th className="th-center">{t.me.aiAtEntry}</th>
                        <th>{t.me.status}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {positions.map((p, i) => (
                        <HoldingRow key={i} position={p} t={t} />
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {activeTab === 'history' && (
        <div className="me-tab-content active">
          <div className="me-tab-scroll">
            <div className="me-section">
              <div className="me-section-header">
                <h3>{t.me.tradeHistory}</h3>
                <span className="count-badge">{t.me.last} {trades.length} {t.me.trades}</span>
              </div>
              <div className="me-section-body">
                {trades.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                    {t.me.noTrades}
                  </div>
                ) : (
                  <table className="hold-table">
                    <thead>
                      <tr>
                        <th>{t.me.market}</th>
                        <th className="th-center">{t.me.side}</th>
                        <th className="num">{t.me.entry}</th>
                        <th className="num">{t.me.exit}</th>
                        <th className="num">{t.me.contracts}</th>
                        <th className="num">{t.me.pnl}</th>
                        <th className="th-center">{t.me.aiAtEntry}</th>
                        <th>{t.me.result}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trades.map((tr, i) => (
                        <TradeRow key={i} trade={tr} t={t} />
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings */}
      {activeTab === 'settings' && (
        <div className="me-tab-content active">
          <div className="me-tab-scroll">
            <div className="me-section acc-settings">
              <SettingsAccordion t={t} login={login} isConnected={isConnected} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ── */

function StatCard({ label, value, valueColor, sub }: { label: string; value: string; valueColor?: string; sub: string }) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span className={`stat-value ${valueColor || ''}`}>{value}</span>
      <span className="stat-sub">{sub}</span>
    </div>
  );
}

function TabButton({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button className={`me-tabbar-btn ${isActive ? 'active' : ''}`} onClick={onClick}>
      {label}
    </button>
  );
}

function HoldingRow({ position, t: trans }: { position: PositionData; t: any }) {
  return (
    <tr>
      <td>
        <div className="market-cell">
          <span className="mkt-name">{position.marketName}</span>
          <span className="mkt-meta">{position.marketMeta}</span>
        </div>
      </td>
      <td className="td-center" style={{color: position.side === 'YES' ? 'var(--green)' : 'var(--red)', fontWeight: 600, fontSize: 11}}>{position.side}</td>
      <td className="num">{position.entry}¢</td>
      <td className="num" style={{color: position.current >= position.entry ? 'var(--green)' : 'var(--red)', fontWeight: 600}}>{position.current}¢</td>
      <td className="num">{position.contracts}</td>
      <td className="num">${position.staked.toFixed(2)}</td>
      <td className={`pnl ${position.pnl === null ? '' : position.pnl >= 0 ? 'pos' : 'neg'}`}>
        {position.pnl === null ? '—' : `${position.pnl >= 0 ? '+' : ''}$${position.pnl.toFixed(2)}`}
      </td>
      <td className="ai-conf-cell" style={{color: 'var(--muted)'}}>{position.aiAtEntry || '—'}</td>
      <td><span className="status-pill open">{trans.me.open}</span></td>
    </tr>
  );
}

function TradeRow({ trade, t: trans }: { trade: TradeData; t: any }) {
  return (
    <tr>
      <td>
        <div className="market-cell">
          <span className="mkt-name">{trade.marketName}</span>
          <span className="mkt-meta">{trade.marketMeta}</span>
        </div>
      </td>
      <td className="td-center" style={{color: trade.side === 'YES' ? 'var(--green)' : 'var(--red)', fontWeight: 600, fontSize: 11}}>{trade.side}</td>
      <td className="num">{trade.entry}¢</td>
      <td className="num">{trade.exit}¢</td>
      <td className="num">{trade.contracts}</td>
      <td className={`pnl ${trade.pnl >= 0 ? 'pos' : 'neg'}`}>{trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}</td>
      <td className="ai-conf-cell" style={{color: 'var(--muted)'}}>{trade.aiAtEntry || '—'}</td>
      <td><span className={`status-pill ${trade.result === 'Won' ? 'won' : 'lost'}`}>{trade.result === 'Won' ? trans.me.won : trans.me.lost}</span></td>
    </tr>
  );
}

function SettingsAccordion({ t: trans, login, isConnected }: { t: any; login: () => void; isConnected: boolean }) {
  const [open, setOpen] = useState(true);

  return (
    <>
      <div className={`acc-header ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
        <h3>{trans.me.accountSettings}</h3>
        <span className="arrow">▶</span>
      </div>
      <div className={`acc-body ${open ? 'open' : ''}`}>
        <div className="acc-row">
          <div>
            <div className="acc-label">{trans.me.polymarketApi}</div>
            <div className="acc-desc">{trans.me.polymarketApiDesc}</div>
          </div>
          <div className="acc-action">
            {isConnected
              ? <span className="acc-btn connected">{trans.topbar.connected}</span>
              : <span className="acc-btn primary" onClick={login}>{trans.topbar.signIn}</span>
            }
          </div>
        </div>
        <div className="acc-row">
          <div>
            <div className="acc-label">{trans.me.notifications}</div>
            <div className="acc-desc">{trans.me.notificationsDesc}</div>
          </div>
          <div className="acc-action">
            <span className="acc-btn" onClick={() => alert(trans.me.comingSoon)}>{trans.me.configure}</span>
          </div>
        </div>
      </div>
    </>
  );
}
