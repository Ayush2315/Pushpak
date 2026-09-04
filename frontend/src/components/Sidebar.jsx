import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Compass, 
  ShieldAlert, 
  GitFork, 
  FileCheck2, 
  Cpu, 
  HelpCircle
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useWorkspace } from '../hooks/useWorkspace';
import api from '../api/client';

export default function Sidebar() {
  const { lang, t } = useLanguage();
  const { closeContextualWindow } = useWorkspace();
  const navigate = useNavigate();
  const location = useLocation();
  const [apiConnected, setApiConnected] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const checkConnection = async () => {
      try {
        const res = await api.getHealth();
        if (isMounted) setApiConnected(res?.status === 'healthy');
      } catch {
        if (isMounted) setApiConnected(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { to: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/price-index', label: t('nav.priceIndex'), icon: TrendingUp },
    { to: '/intelligence', label: t('nav.intelligence'), icon: Compass },
    { to: '/policy', label: t('nav.policy'), icon: ShieldAlert },
    { to: '/network', label: t('nav.network'), icon: GitFork },
    { to: '/transparency', label: t('nav.transparency'), icon: FileCheck2 },
    { to: '/methodology', label: t('nav.methodology'), icon: Cpu },
  ];

  const handleNavClick = (to) => {
    closeContextualWindow(); // Cleanly dismiss any open contextual window upon sidebar page navigation
    navigate(to);
  };

  return (
    <aside className="sidebar">
      {/* Top Brand Area */}
      <div className="sidebar-header">
        <NavLink 
          to="/" 
          className="sidebar-brand"
          onClick={() => closeContextualWindow()}
        >
          <div className="brand-emblem">P</div>
          <div className="brand-text-container">
            <span className="brand-title" style={{ fontFamily: lang === 'hi' ? "'Noto Sans Devanagari', 'Inter', sans-serif" : 'inherit' }}>
              {lang === 'hi' ? 'पुष्पक' : 'PUSHPAK'}
            </span>
            <span className="brand-tagline">
              {t('tagline')}
            </span>
          </div>
        </NavLink>
      </div>

      {/* Navigation Links: standard router navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <button
              key={item.to}
              onClick={() => handleNavClick(item.to)}
              className={`nav-item ${isActive ? 'active' : ''}`}
              style={{
                width: '100%',
                background: isActive ? 'var(--gov-navy-light)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <Icon className="nav-item-icon" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Area: FAQ & Knowledge Center (Normal Page Navigation) + API Status */}
      <div className="sidebar-footer">
        <button 
          onClick={() => handleNavClick('/faq')}
          className={`lang-toggle-btn ${location.pathname === '/faq' ? 'active-faq' : ''}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '10px',
            padding: '10px 12px',
            borderRadius: '8px',
            border: location.pathname === '/faq' ? '1px solid #93c5fd' : '1px solid #e2e8f0',
            backgroundColor: location.pathname === '/faq' ? '#eff6ff' : '#ffffff',
            cursor: 'pointer',
            textAlign: 'left',
            width: '100%',
            transition: 'all 0.15s ease'
          }}
          title={lang === 'hi' ? 'अक्सर पूछे जाने वाले प्रश्न एवं ज्ञान केंद्र' : 'FAQ & Knowledge Center'}
        >
          <HelpCircle size={17} color={location.pathname === '/faq' ? '#1d4ed8' : '#1e3a8a'} style={{ flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: location.pathname === '/faq' ? '#1d4ed8' : '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {lang === 'hi' ? 'ज्ञान केंद्र एवं संदर्भ' : 'FAQ & Knowledge'}
            </span>
            <span style={{ fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap' }}>
              {lang === 'hi' ? 'अवधारणा एवं सूत्र संदर्भ' : 'Methodology & Guides'}
            </span>
          </div>
        </button>

        <div className="status-badge" style={{ marginTop: '0.5rem' }}>
          <span className={`status-dot ${apiConnected ? 'connected' : 'disconnected'}`} />
          <span>{apiConnected ? t('status.connected') : t('status.disconnected')}</span>
        </div>
      </div>
    </aside>
  );
}
