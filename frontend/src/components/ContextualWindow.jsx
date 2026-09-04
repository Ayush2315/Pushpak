import React from 'react';
import { 
  X, 
  TrendingUp, 
  Layers, 
  Flame, 
  Plane, 
  ShieldAlert, 
  Calculator, 
  HelpCircle,
  ArrowRight,
  Info,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { useWorkspace } from '../hooks/useWorkspace';
import { useLanguage } from '../hooks/useLanguage';
import { Link } from 'react-router-dom';

// Full analytical content renderers for deep views
import HeadlineIndexWorkspace from './workspace/HeadlineIndexWorkspace';
import CoreIndexWorkspace from './workspace/CoreIndexWorkspace';
import SurgeSpreadWorkspace from './workspace/SurgeSpreadWorkspace';
import RouteWorkspace from './workspace/RouteWorkspace';
import PolicyFlagWorkspace from './workspace/PolicyFlagWorkspace';
import FormulaWorkspace from './workspace/FormulaWorkspace';

export default function ContextualWindow() {
  const { activeWindow, closeContextualWindow } = useWorkspace();
  const { lang } = useLanguage();
  const isHi = lang === 'hi';
  const panelRef = React.useRef(null);

  React.useEffect(() => {
    if (activeWindow && panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeWindow?.id, activeWindow?.type]);

  if (!activeWindow) {
    return null; // When nothing is clicked, nothing renders! No placeholder, no tab bar.
  }

  const getIcon = (type) => {
    switch (type) {
      case 'headline': return TrendingUp;
      case 'core': return Layers;
      case 'spread':
      case 'surge-spread': return Flame;
      case 'route': return Plane;
      case 'policy-flag': return ShieldAlert;
      case 'formula': return Calculator;
      default: return HelpCircle;
    }
  };

  const Icon = getIcon(activeWindow.type);
  const displayTitle = isHi && activeWindow.titleHi ? activeWindow.titleHi : activeWindow.title;

  const renderContent = () => {
    switch (activeWindow.type) {
      case 'headline':
        return <HeadlineIndexWorkspace />;
      case 'core':
        return <CoreIndexWorkspace />;
      case 'spread':
      case 'surge-spread':
        return <SurgeSpreadWorkspace />;
      case 'route':
        return <RouteWorkspace routeCode={activeWindow.data?.route_id || activeWindow.routeCode || 'DEL-BOM'} />;
      case 'policy-flag':
        return <PolicyFlagWorkspace flagData={activeWindow.data || activeWindow.flagData} />;
      case 'formula':
        return <FormulaWorkspace data={activeWindow.data} />;
      default:
        // Generic explanatory fallback panel
        return (
          <div style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>{displayTitle}</h4>
            <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem', lineHeight: '1.6' }}>
              {activeWindow.data?.explanation || activeWindow.data?.desc || (isHi ? 'पुष्पक विश्लेषणात्मक संदर्भ' : 'PUSHPAK Analytical Reference')}
            </p>
          </div>
        );
    }
  };

  return (
    <div 
      ref={panelRef}
      id="contextual-information-panel"
      className="contextual-panel-wrapper"
      style={{
        margin: '0 0 2rem 0',
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '12px',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        overflow: 'hidden',
        animation: 'fadeInSlideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Header Banner with Clean Close Button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.5rem',
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: '#eff6ff',
            color: '#1e3a8a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #bfdbfe'
          }}>
            <Icon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
              {isHi ? 'विश्लेषणात्मक अवधारणा संदर्भ' : 'Analytical Concept Explanation'}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>
              {displayTitle}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            to="/faq"
            onClick={closeContextualWindow}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.8rem',
              fontWeight: '600',
              color: '#1e3a8a',
              textDecoration: 'none',
              padding: '0.35rem 0.75rem',
              backgroundColor: '#ffffff',
              borderRadius: '6px',
              border: '1px solid #cbd5e1'
            }}
          >
            <BookOpen size={13} />
            <span>{isHi ? 'ज्ञान केंद्र में देखें' : 'Knowledge Center'}</span>
          </Link>

          <button
            onClick={closeContextualWindow}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '0.35rem 0.75rem',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: '600',
              color: '#475569',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title={isHi ? 'संदर्भ खिड़की बंद करें' : 'Close contextual window'}
          >
            <span>{isHi ? 'बंद करें' : 'Close'}</span>
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Embedded Contextual Body */}
      <div style={{ maxHeight: '750px', overflowY: 'auto', padding: '0.5rem' }}>
        {renderContent()}
      </div>
    </div>
  );
}
