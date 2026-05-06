'use client';

import { useState } from 'react';
import { HOLDINGS, TRADES } from '@/data/markets';
import type { Holding, Trade } from '@/data/types';

type MeTab = 'positions' | 'history' | 'settings';

export default function MePage() {
  const [activeTab, setActiveTab] = useState<MeTab>('positions');

  return (
    <div className="me-page">
      {/* Stat cards */}
      <div className="stat-row">
        <StatCard label="Total P&L" value="+$4,283.50" valueColor="green" sub="Since first trade" />
        <StatCard label="Trades" value="147" sub="99 won · 48 lost" />
        <StatCard label="Win Rate" value="67.3%" sub="Last 30d: 71.4%" />
        <StatCard label="Active Positions" value="3" sub="$2,840 at stake" />
      </div>

      {/* Tab bar */}
      <div className="me-tabbar">
        <TabButton label="Positions" isActive={activeTab === 'positions'} onClick={() => setActiveTab('positions')} />
        <TabButton label="History" isActive={activeTab === 'history'} onClick={() => setActiveTab('history')} />
        <TabButton label="Settings" isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </div>

      {/* Positions */}
      {activeTab === 'positions' && (
        <div className="me-tab-content active">
          <div className="me-tab-scroll">
            <div className="me-section">
              <div className="me-section-header">
                <h3>Current Holdings</h3>
                <span className="count-badge">{HOLDINGS.length} positions</span>
              </div>
              <div className="me-section-body">
                <table className="hold-table">
                  <thead>
                    <tr>
                      <th>Market</th>
                      <th className="th-center">Side</th>
                      <th className="num">Entry</th>
                      <th className="num">Current</th>
                      <th className="num">Contracts</th>
                      <th className="num">Staked</th>
                      <th className="num">P&amp;L</th>
                      <th className="th-center">AI@Entry</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {HOLDINGS.map((h, i) => (
                      <HoldingRow key={i} holding={h} />
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
                <h3>Trade History</h3>
                <span className="count-badge">Last {TRADES.length} trades</span>
              </div>
              <div className="me-section-body">
                <table className="hold-table">
                  <thead>
                    <tr>
                      <th>Market</th>
                      <th className="th-center">Side</th>
                      <th className="num">Entry</th>
                      <th className="num">Exit</th>
                      <th className="num">Contracts</th>
                      <th className="num">P&amp;L</th>
                      <th className="th-center">AI@Entry</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TRADES.map((t, i) => (
                      <TradeRow key={i} trade={t} />
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
              <SettingsAccordion />
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

function HoldingRow({ holding }: { holding: Holding }) {
  const aiColor = holding.aiAtEntry >= 80 ? 'var(--green)' : holding.aiAtEntry >= 60 ? 'var(--yellow)' : 'var(--blue)';
  return (
    <tr>
      <td>
        <div className="market-cell">
          <span className="mkt-name">{holding.marketName}</span>
          <span className="mkt-meta">{holding.marketMeta}</span>
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
      <td><span className="status-pill open">Open</span></td>
    </tr>
  );
}

function TradeRow({ trade }: { trade: Trade }) {
  const aiColor = trade.aiAtEntry >= 80 ? 'var(--green)' : trade.aiAtEntry >= 60 ? 'var(--yellow)' : 'var(--blue)';
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
      <td className="ai-conf-cell" style={{color: aiColor}}>{trade.aiAtEntry}%</td>
      <td><span className={`status-pill ${trade.result === 'Won' ? 'won' : 'lost'}`}>{trade.result}</span></td>
    </tr>
  );
}

function SettingsAccordion() {
  const [open, setOpen] = useState(true);

  return (
    <>
      <div className={`acc-header ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
        <h3>Account Settings</h3>
        <span className="arrow">▶</span>
      </div>
      <div className={`acc-body ${open ? 'open' : ''}`}>
        <div className="acc-row">
          <div>
            <div className="acc-label">Polymarket CLOB API</div>
            <div className="acc-desc">Connect your API key to enable real trading</div>
          </div>
          <div className="acc-action">
            <span className="acc-btn connected">Connected</span>
          </div>
        </div>
        <div className="acc-row">
          <div>
            <div className="acc-label">Notifications</div>
            <div className="acc-desc">Get alerted 1h before market expiry</div>
          </div>
          <div className="acc-action">
            <span className="acc-btn" onClick={() => alert('Notification preferences coming soon')}>Configure</span>
          </div>
        </div>
        <div className="acc-row">
          <div>
            <div className="acc-label">Default order size</div>
            <div className="acc-desc">Default contracts per quick order</div>
          </div>
          <div className="acc-action" style={{display:'flex',alignItems:'center',gap:8}}>
            <input type="number" defaultValue={10} min={1}
                   style={{width:64,padding:'4px 8px',borderRadius:6,border:'1px solid var(--border)',background:'var(--bg)',fontFamily:'var(--font-body)',fontSize:13,textAlign:'center'}} />
            <span style={{fontSize:11,color:'var(--muted)'}}>ct</span>
          </div>
        </div>
        <div className="acc-row">
          <div>
            <div className="acc-label">Display preference</div>
            <div className="acc-desc">Dark mode coming soon</div>
          </div>
          <div className="acc-action">
            <span className="acc-btn" style={{opacity:0.5}}>Light</span>
          </div>
        </div>
      </div>
    </>
  );
}
