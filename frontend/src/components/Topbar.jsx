import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { Languages, Database } from 'lucide-react';

export default function Topbar({ title, subtitle }) {
  const { lang, toggleLang } = useLanguage();
  const isHi = lang === 'hi';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h2 className="topbar-title">{title}</h2>
        {subtitle && <span className="topbar-subtitle">{subtitle}</span>}
      </div>

      <div className="topbar-right">
        {/* Provenance Mode Badge */}
        <div className="header-badge" title="Data provenance guarantee">
          <Database size={13} color="var(--gov-navy)" />
          <span>{isHi ? 'डेमो सिमुलेशन मोड (अपरिवर्तनीय)' : 'Demo Simulation Mode (Deterministic)'}</span>
        </div>

        {/* Quick Language Toggle */}
        <button
          onClick={toggleLang}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '20px',
            border: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            color: 'var(--text-primary)',
          }}
          title={isHi ? 'अंग्रेजी में बदलें' : 'Switch to हिन्दी'}
        >
          <Languages size={14} color="var(--gov-navy)" />
          <span>{isHi ? 'English' : 'हिन्दी'}</span>
        </button>
      </div>
    </header>
  );
}
