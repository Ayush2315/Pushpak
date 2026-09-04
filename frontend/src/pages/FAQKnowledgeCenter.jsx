import React, { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useWorkspace } from '../hooks/useWorkspace';
import { FAQ_CATEGORIES, knowledgeBase } from '../data/knowledgeBase';
import { 
  Search, 
  ChevronDown, 
  ChevronRight, 
  HelpCircle, 
  CheckCircle,
  TrendingUp,
  Layers,
  Flame,
  Calculator,
  Compass,
  FileCheck2,
  Cpu,
  ShieldAlert,
  Plane,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FAQKnowledgeCenter() {
  const { lang, t } = useLanguage();
  const { openContextualWindow } = useWorkspace();
  const isHi = lang === 'hi';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getActionIcon = (iconName) => {
    switch (iconName) {
      case 'TrendingUp': return TrendingUp;
      case 'Layers': return Layers;
      case 'Flame': return Flame;
      case 'Calculator': return Calculator;
      case 'ShieldAlert': return ShieldAlert;
      case 'Plane': return Plane;
      default: return ArrowRight;
    }
  };

  const handleKnowledgeAction = (actionKey, actionObj) => {
    switch (actionKey) {
      case 'headline-index':
        openContextualWindow({
          id: 'metric-headline',
          title: 'PUSHPAK Headline Index',
          titleHi: 'पुष्पक हेडलाइन सूचकांक',
          type: 'headline',
          data: {}
        });
        break;

      case 'core-index':
        openContextualWindow({
          id: 'metric-core',
          title: 'PUSHPAK Core Index',
          titleHi: 'पुष्पक कोर सूचकांक',
          type: 'core',
          data: {}
        });
        break;

      case 'formula':
      case 'formula-workspace':
      case 'methodology':
        openContextualWindow({
          id: 'formula-laspeyres',
          title: 'Laspeyres Index Formula (Σ)',
          titleHi: 'लासपेयर्स सूचकांक सूत्र (Σ)',
          type: 'formula',
          data: {}
        });
        break;

      case 'surge-spread':
        openContextualWindow({
          id: 'metric-spread',
          title: 'Walk-Up Surge Spread',
          titleHi: 'वॉक-अप वृद्धि अंतर',
          type: 'spread',
          data: {}
        });
        break;

      case 'policy-intelligence':
        openContextualWindow({
          id: 'flag-overview',
          title: 'Policy Intelligence Signals',
          titleHi: 'नीति आसूचना संकेत',
          type: 'policy-flag',
          data: {
            flag_code: 'SURGE_MONITOR',
            title: 'Corridor Dynamic Surge Radar',
            explanation: 'Automated supervisory threshold evaluation detecting walk-up price markup escalation.',
            severity: 'HIGH',
            route_code: 'DEL-BOM',
            suggested_action: 'Examine airline seat inventory velocity and lead-time yield curves.'
          }
        });
        break;

      case 'route':
        openContextualWindow({
          id: `route-${actionObj?.routeCode || 'DEL-BOM'}`,
          title: `Corridor ${actionObj?.routeCode || 'DEL-BOM'}`,
          titleHi: `गलियारा ${actionObj?.routeCode || 'DEL-BOM'}`,
          type: 'route',
          data: { route_id: actionObj?.routeCode || 'DEL-BOM' }
        });
        break;

      default:
        console.warn('Unknown knowledge action:', actionKey);
    }
  };

  const filteredItems = knowledgeBase.filter(item => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCat;

    const qEn = item.questionEn.toLowerCase();
    const qHi = item.questionHi.toLowerCase();
    const simpleEn = (item.simpleEn || '').toLowerCase();
    const simpleHi = (item.simpleHi || '').toLowerCase();
    const whyEn = (item.whyMattersEn || '').toLowerCase();

    return matchesCat && (
      qEn.includes(query) ||
      qHi.includes(query) ||
      simpleEn.includes(query) ||
      simpleHi.includes(query) ||
      whyEn.includes(query)
    );
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      {/* Page Header Banner */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{
            background: '#eff6ff',
            color: '#1d4ed8',
            fontSize: '0.75rem',
            fontWeight: '600',
            padding: '0.2rem 0.6rem',
            borderRadius: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {isHi ? 'पुष्पक ज्ञान केंद्र एवं संदर्भ' : 'PUSHPAK Knowledge Center & Technical Guide'}
          </span>
          <span style={{
            background: '#f1f5f9',
            color: '#475569',
            fontSize: '0.75rem',
            fontWeight: '500',
            padding: '0.2rem 0.5rem',
            borderRadius: '4px'
          }}>
            Civil Aviation Intelligence Reference
          </span>
        </div>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem', color: '#0f172a', fontWeight: '800' }}>
          {isHi ? 'ज्ञान केंद्र एवं अक्सर पूछे जाने वाले प्रश्न' : 'Knowledge Center & Technical FAQ'}
        </h1>
        <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', maxWidth: '880px' }}>
          {isHi
            ? 'पुष्पक वायु किराया मूल्य सूचकांक, कोर सूचकांक सिद्धांत, लास्पेरेस एकत्रीकरण, नीतिगत संकेत, डेटा उद्गम और सीपीआई संवर्धन कार्यप्रणाली का संपूर्ण पारदर्शी विवरण।'
            : 'Comprehensive educational guide and reference explaining how PUSHPAK moves from multi-horizon flight observations to deterministic policy intelligence and transparent Laspeyres-type airfare price indices.'}
        </p>

        {/* Real-time Search Input */}
        <div style={{ marginTop: '1.5rem', position: 'relative', maxWidth: '600px' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder={isHi ? 'अवधारणा या प्रश्न खोजें (उदा. कोर सूचकांक, T+1, लास्पेरेस, अस्थिरता, उद्गम, CV)...' : 'Search questions, formulas, or concepts (e.g., Core Index, T+1, Laspeyres, Volatility, Provenance)...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.75rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.9rem',
              outline: 'none',
              background: '#f8fafc',
              color: '#0f172a',
              boxSizing: 'border-box'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Buttons */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '0.25rem'
      }}>
        {FAQ_CATEGORIES.map(cat => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: isActive ? '700' : '500',
                background: isActive ? '#1e3a8a' : '#ffffff',
                color: isActive ? '#ffffff' : '#475569',
                border: `1px solid ${isActive ? '#1e3a8a' : '#e2e8f0'}`,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {isHi ? cat.nameHi : cat.name}
            </button>
          );
        })}
      </div>

      {/* Accordion Questions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filteredItems.length === 0 ? (
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '3rem',
            textAlign: 'center',
            color: '#64748b'
          }}>
            <HelpCircle size={40} color="#cbd5e1" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>
              {isHi ? 'कोई मेल नहीं मिला' : 'No matching concepts found'}
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>
              {isHi ? 'कृपया अन्य खोज शब्द आज़माएँ या श्रेणी फ़िल्टर साफ़ करें।' : 'Try using different keywords or clear the category filter.'}
            </p>
          </div>
        ) : (
          filteredItems.map(item => {
            const isExpanded = expandedItems[item.id] || searchQuery.length > 0;
            return (
              <div
                key={item.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '10px',
                  border: `1px solid ${isExpanded ? '#cbd5e1' : '#e2e8f0'}`,
                  boxShadow: isExpanded ? '0 2px 6px rgba(0,0,0,0.04)' : '0 1px 2px rgba(0,0,0,0.02)',
                  transition: 'border 0.15s ease',
                  overflow: 'hidden'
                }}
              >
                {/* Question Header Accordion Bar */}
                <div
                  onClick={() => toggleExpand(item.id)}
                  style={{
                    padding: '1.1rem 1.4rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    background: isExpanded ? '#f8fafc' : '#ffffff',
                    borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                    {isExpanded ? <ChevronDown size={18} color="#1e3a8a" /> : <ChevronRight size={18} color="#94a3b8" />}
                    <div>
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>
                        {FAQ_CATEGORIES.find(c => c.id === item.category)?.[isHi ? 'nameHi' : 'name'] || item.category}
                      </div>
                      <div style={{ fontSize: '0.98rem', fontWeight: '700', color: '#0f172a' }}>
                        {isHi ? item.questionHi : item.questionEn}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Answer Content Structured into 4 Clear Sections */}
                {isExpanded && (
                  <div style={{ padding: '1.25rem 1.5rem', color: '#334155', fontSize: '0.9rem', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* 1. Simple Explanation */}
                    <div style={{ padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #1e3a8a' }}>
                      <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.82rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        {isHi ? 'सरल व्याख्या' : 'Core Concept'}
                      </div>
                      <p style={{ margin: 0, color: '#1e293b' }}>
                        {isHi ? item.simpleHi : item.simpleEn}
                      </p>
                    </div>

                    {/* 2. Why it matters */}
                    {item.whyMattersEn && (
                      <div>
                        <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.82rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                          {isHi ? 'यह क्यों महत्वपूर्ण है?' : 'Why It Matters'}
                        </div>
                        <p style={{ margin: 0, color: '#475569' }}>
                          {isHi ? item.whyMattersHi : item.whyMattersEn}
                        </p>
                      </div>
                    )}

                    {/* 3. How calculated / Details */}
                    {item.howCalculatedEn && (
                      <div>
                        <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.82rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                          {isHi ? 'पद्धति एवं गणना' : 'Methodology & Calculation'}
                        </div>
                        <p style={{ margin: 0, color: '#475569' }}>
                          {isHi ? item.howCalculatedHi : item.howCalculatedEn}
                        </p>
                      </div>
                    )}

                    {/* 4. Example where available */}
                    {item.exampleEn && (
                      <div style={{ padding: '0.6rem 0.85rem', background: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe', fontSize: '0.85rem' }}>
                        <strong style={{ color: '#1e3a8a' }}>{isHi ? 'व्यावहारिक उदाहरण: ' : 'Illustrative Example: '}</strong>
                        <span style={{ color: '#1e293b' }}>{isHi ? item.exampleHi : item.exampleEn}</span>
                      </div>
                    )}

                    {/* Explicit Structured Action Buttons */}
                    {item.actions && item.actions.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
                        {item.actions.map((act) => {
                          const ActIcon = getActionIcon(act.icon);
                          return (
                            <button
                              key={act.id || act.action}
                              id={`faq-action-${act.action}`}
                              data-action={act.action}
                              onClick={() => handleKnowledgeAction(act.action, act)}
                              style={{
                                background: '#ffffff',
                                border: '1px solid #cbd5e1',
                                borderRadius: '6px',
                                padding: '0.4rem 0.85rem',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                color: '#1e3a8a',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#1e3a8a';
                                e.currentTarget.style.backgroundColor = '#eff6ff';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#cbd5e1';
                                e.currentTarget.style.backgroundColor = '#ffffff';
                              }}
                              title={isHi && act.labelHi ? act.labelHi : act.label}
                            >
                              <ActIcon size={14} color="#1e3a8a" />
                              <span>{isHi && act.labelHi ? act.labelHi : act.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Institutional Integrity Notice */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1.5rem',
        fontSize: '0.85rem',
        color: '#475569',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        <div style={{ fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={16} color="#059669" />
          <span>{isHi ? 'पुष्पक नीति एवं विनियामक प्रकटीकरण' : 'Regulatory & Methodological Disclosure'}</span>
        </div>
        <p style={{ margin: 0, lineHeight: '1.5' }}>
          {isHi
            ? 'पुष्पक प्लेटफ़ॉर्म द्वारा प्रदर्शित सभी सूचकांक, नीति वर्गीकरण एवं किराया आंकड़े नागरिक उड्डयन अनुसंधान एवं सांख्यिकी संवर्धन उद्देश्यों के लिए तैयार किए गए हैं। यह किसी वाणिज्यिक एयरलाइन का टिकट बुकिंग पोर्टल नहीं है।'
            : 'All indices, volatility heuristics, and flight registry metrics hosted on PUSHPAK are generated strictly for academic, research, and CPI augmentation evaluation. PUSHPAK does not sell airline inventory.'}
        </p>
      </div>
    </div>
  );
}
