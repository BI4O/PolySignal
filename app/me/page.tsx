'use client';

import { useState } from 'react';
import { HOLDINGS, TRADES } from '@/data/markets';
import { useLanguage } from '@/lib/LanguageProvider';
import type { Holding, Trade } from '@/data/types';

type MeTab = 'positions' | 'history' | 'settings';

export default function MePage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<MeTab>('positions');

  return (
    <div className="me-page">
      {/* Stat cards */}
      <div className="stat-row">
        <StatCard label={t.me.totalPnl} value="+$4,283.50" valueColor="green" sub={t.me.sinceFirstTrade} />
        <StatCard label={t.me.trades} value="147" sub="99 won · 48 lost" />
        <StatCard label={t.me.winRate} value="67.3%" sub="Last 30d: 71.4%" />
        <StatCard label={t.me.activePositions} value="3" sub={`$2,840 ${t.me.atStake}`} />
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
                <span className="count-badge">{HOLDINGS.length} {t.me.positions}</span>
              </div>
              <div className="me-section-body">
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
                    {HOLDINGS.map((h, i) => (
                      <HoldingRow key={i} holding={h} t={t} idx={i} />
                    ))}
                  </tbody>
                </table>
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
                <span className="count-badge">{t.me.last} {TRADES.length} {t.me.trades}</span>
              </div>
              <div className="me-section-body">
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
                    {TRADES.map((tr, i) => (
                      <TradeRow key={i} trade={tr} t={t} idx={i} />
                    ))}
                  </tbody>
                </table>
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
              <SettingsAccordion t={t} />
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

const HOLDING_TRANS_KEYS = ['h1', 'h2', 'h3'] as const;
const TRADE_TRANS_KEYS = ['t1', 't2', 't3', 't4', 't5', 't6'] as const;

function HoldingRow({ holding, t: trans, idx }: { holding: Holding; t: any; idx: number }) {
  const aiColor = holding.aiAtEntry >= 80 ? 'var(--green)' : holding.aiAtEntry >= 60 ? 'var(--yellow)' : 'var(--blue)';
  const hk = HOLDING_TRANS_KEYS[idx] || 'h1';
  return (
    <tr>
      <td>
        <div className="market-cell">
          <span className="mkt-name">{trans.holdings[`${hk}_name`] || holding.marketName}</span>
          <span className="mkt-meta">{trans.holdings[`${hk}_meta`] || holding.marketMeta}</span>
        </div>
      </td>
      <td className="td-center" style={{color: holding.side === 'YES' ? 'var(--green)' : 'var(--red)', fontWeight: 600, fontSize: 11}}>{holding.side}</td>
      <td className="num">{holding.entry}¢</td>
      <td className="num" style={{color: holding.current >= holding.entry ? 'var(--green)' : 'var(--red)', fontWeight: 600}}>{holding.current}¢</td>
      <td className="num">{holding.contracts}</td>
      <td className="num">${holding.staked.toFixed(2)}</td>
      <td className={`pnl ${holding.pnl === null ? '' : holding.pnl >= 0 ? 'pos' : 'neg'}`}>
        {holding.pnl === null ? '—' : `${holding.pnl >= 0 ? '+' : ''}$${holding.pnl.toFixed(2)}`}
      </td>
      <td className="ai-conf-cell" style={{color: aiColor}}>{holding.aiAtEntry}%</td>
      <td><span className="status-pill open">{trans.me.open}</span></td>
    </tr>
  );
}

function TradeRow({ trade, t: trans, idx }: { trade: Trade; t: any; idx: number }) {
  const aiColor = trade.aiAtEntry >= 80 ? 'var(--green)' : trade.aiAtEntry >= 60 ? 'var(--yellow)' : 'var(--blue)';
  const tk = TRADE_TRANS_KEYS[idx] || 't1';
  return (
    <tr>
      <td>
        <div className="market-cell">
          <span className="mkt-name">{trans.trades[`${tk}_name`] || trade.marketName}</span>
          <span className="mkt-meta">{trans.trades[`${tk}_meta`] || trade.marketMeta}</span>
        </div>
      </td>
      <td className="td-center" style={{color: trade.side === 'YES' ? 'var(--green)' : 'var(--red)', fontWeight: 600, fontSize: 11}}>{trade.side}</td>
      <td className="num">{trade.entry}¢</td>
      <td className="num">{trade.exit}¢</td>
      <td className="num">{trade.contracts}</td>
      <td className={`pnl ${trade.pnl >= 0 ? 'pos' : 'neg'}`}>{trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}</td>
      <td className="ai-conf-cell" style={{color: aiColor}}>{trade.aiAtEntry}%</td>
      <td><span className={`status-pill ${trade.result === 'Won' ? 'won' : 'lost'}`}>{trade.result === 'Won' ? trans.me.won : trans.me.lost}</span></td>
    </tr>
  );
}

function SettingsAccordion({ t: trans }: { t: any }) {
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
            <span className="acc-btn connected">{trans.me.connected}</span>
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
        <div className="acc-row">
          <div>
            <div className="acc-label">{trans.me.defaultOrderSize}</div>
            <div className="acc-desc">{trans.me.defaultOrderSizeDesc}</div>
          </div>
          <div className="acc-action" style={{display:'flex',alignItems:'center',gap:8}}>
            <input type="number" defaultValue={10} min={1}
                   style={{width:64,padding:'4px 8px',borderRadius:6,border:'1px solid var(--border)',background:'var(--bg)',fontFamily:'var(--font-body)',fontSize:13,textAlign:'center'}} />
            <span style={{fontSize:11,color:'var(--muted)'}}>{trans.me.ct}</span>
          </div>
        </div>
        <div className="acc-row">
          <div>
            <div className="acc-label">{trans.me.displayPref}</div>
            <div className="acc-desc">{trans.me.displayPrefDesc}</div>
          </div>
          <div className="acc-action">
            <span className="acc-btn" style={{opacity:0.5}}>{trans.me.light}</span>
          </div>
        </div>
      </div>
    </>
  );
}
