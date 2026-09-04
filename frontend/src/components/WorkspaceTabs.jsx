import React, { useRef } from 'react';
import { 
  X, 
  LayoutDashboard, 
  TrendingUp, 
  Layers, 
  Flame, 
  Plane, 
  ShieldAlert, 
  Cpu, 
  HelpCircle,
  FileCheck2,
  GitFork,
  Calculator,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useWorkspace } from '../hooks/useWorkspace';
import { useLanguage } from '../hooks/useLanguage';

export default function WorkspaceTabs() {
  const { tabs, activeTabId, activateTab, closeTab } = useWorkspace();
  const { lang, t } = useLanguage();
  const scrollContainerRef = useRef(null);

  const getTabIcon = (tab) => {
    switch (tab.type) {
      case 'headline': return TrendingUp;
      case 'core': return Layers;
      case 'surge-spread': return Flame;
      case 'route': return Plane;
      case 'policy-flag': return ShieldAlert;
      case 'formula': return Calculator;
      case 'faq': return HelpCircle;
      case 'page':
        if (tab.pageKey === 'dashboard') return LayoutDashboard;
        if (tab.pageKey === 'price-index') return TrendingUp;
        if (tab.pageKey === 'intelligence') return Plane;
        if (tab.pageKey === 'policy') return ShieldAlert;
        if (tab.pageKey === 'network') return GitFork;
        if (tab.pageKey === 'transparency') return FileCheck2;
        if (tab.pageKey === 'methodology') return Cpu;
        if (tab.pageKey === 'faq') return HelpCircle;
        return LayoutDashboard;
      default:
        return LayoutDashboard;
    }
  };

  const scrollTabs = (offset) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // If only dashboard is open, render minimal bar or clean indicator
  return (
    <div className="workspace-tabs-bar">
      <div 
        ref={scrollContainerRef} 
        className="workspace-tabs-scroll-container"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const Icon = getTabIcon(tab);
          const displayTitle = lang === 'hi' && tab.titleHi ? tab.titleHi : tab.title;

          return (
            <div
              key={tab.id}
              onClick={() => activateTab(tab.id)}
              className={`workspace-tab-item ${isActive ? 'active' : ''}`}
              title={displayTitle}
            >
              <Icon size={14} className="workspace-tab-icon" />
              <span className="workspace-tab-title">{displayTitle}</span>
              {tab.canClose !== false && (
                <button
                  onClick={(e) => closeTab(tab.id, e)}
                  className="workspace-tab-close-btn"
                  title={t('workspace.closeTab')}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {tabs.length > 3 && (
        <div className="workspace-tabs-controls">
          <button 
            onClick={() => scrollTabs(-120)} 
            className="tab-scroll-arrow" 
            title="Scroll Left"
          >
            <ChevronLeft size={14} />
          </button>
          <button 
            onClick={() => scrollTabs(120)} 
            className="tab-scroll-arrow" 
            title="Scroll Right"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
