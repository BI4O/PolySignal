'use client';

import { useState } from 'react';

export default function TweaksPanel() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="tweaks-toggle" onClick={() => setOpen(!open)} title="Design tweaks">
        ✦
      </button>
      <div className={`tweaks-panel ${open ? 'open' : ''}`}>
        <h4>Design Tweaks</h4>
        <div className="tweak-row">
          <label>Accent hue</label>
          <input type="range" min="0" max="360" defaultValue={28}
                 onChange={(e) => {
                   document.documentElement.style.setProperty('--accent', `oklch(64% 0.13 ${e.target.value})`);
                 }} />
        </div>
        <div className="tweak-row">
          <label>Border radius</label>
          <select defaultValue="12px"
                  onChange={(e) => {
                    const v = e.target.value;
                    document.documentElement.style.setProperty('--radius-sm', '8px');
                    document.documentElement.style.setProperty('--radius-md', v);
                    document.documentElement.style.setProperty('--radius-lg', v === '20px' ? '24px' : '16px');
                  }}>
            <option value="8px">Sharp (8px)</option>
            <option value="12px">Default (12px)</option>
            <option value="20px">Rounded (20px)</option>
          </select>
        </div>
        <div className="tweak-row">
          <label>Font scale</label>
          <select defaultValue="14px"
                  onChange={(e) => { document.body.style.fontSize = e.target.value; }}>
            <option value="13px">Compact</option>
            <option value="14px">Normal</option>
            <option value="15px">Relaxed</option>
          </select>
        </div>
        <div className="tweak-row">
          <label>Card style</label>
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
            <option value="border">Bordered</option>
            <option value="shadow">Shadow</option>
          </select>
        </div>
      </div>
    </>
  );
}
