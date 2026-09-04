import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Filter, 
  CheckCircle2, 
  Info,
  Layers,
  ArrowUpRight,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useWorkspace } from '../hooks/useWorkspace';
import api from '../api/client';
import SectionHeader from '../components/SectionHeader';
import RouteSelector from '../components/RouteSelector';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function Policy() {
  const { lang, t } = useLanguage();
  const { openTab } = useWorkspace();
  const isHi = lang === 'hi';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [networkPolicy, setNetworkPolicy] = useState(null);
  const [flags, setFlags] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState('DEL-BOM');
  const [routePolicy, setRoutePolicy] = useState(null);
  const [severityFilter, setSeverityFilter] = useState(''); // '' means All, can be HIGH, MEDIUM, LOW

  const loadPolicyData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [netRes, flagsRes, routeRes] = await Promise.all([
        api.getNetworkPolicy(),
        api.getPolicyFlags(severityFilter || null),
        api.getRoutePolicy(selectedRoute),
      ]);

      setNetworkPolicy(netRes);
      const flagsList = Array.isArray(flagsRes) ? flagsRes : (flagsRes?.flags || []);
      setFlags(flagsList);
      setRoutePolicy(routeRes);
    } catch (err) {
      console.error('Failed to load policy intelligence:', err);
      setError(err.message || 'Unable to retrieve policy intelligence.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicyData();
  }, [selectedRoute, severityFilter]);

  if (loading && !networkPolicy) return <LoadingState message={isHi ? "नीति निर्णय संकेतक लोड हो रहे हैं..." : "Loading policy decision-support metrics..."} />;
  if (error && !networkPolicy) return <ErrorState message={error} onRetry={loadPolicyData} />;

  const priorityDist = networkPolicy?.priority_distribution || { HIGH_ATTENTION: 2, MONITOR: 1, LOW_ATTENTION: 0 };

  return (
    <div className="page-container">
      {/* Page Header */}
      <SectionHeader 
        title={t('policy.title')}
        subtitle={t('policy.subtitle')}
      />

      {/* Advisory Heuristic Notice */}
      <div style={{
        backgroundColor: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: 'var(--radius-md)',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <Info size={18} color="#1d4ed8" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '13px', color: '#1e3a8a', lineHeight: '1.5' }}>
          <strong>{isHi ? 'निर्णय समर्थन परामर्श सूचना:' : 'Decision-Support Advisory Notice:'} </strong>
          {t('policy.disclaimer')}
        </div>
      </div>

      {/* Macro Network Priority Cards */}
      <div className="metrics-grid">
        <div 
          onClick={() => setSeverityFilter('HIGH')}
          className="metric-card" 
          style={{ borderLeft: '4px solid var(--gov-red)', cursor: 'pointer', background: severityFilter === 'HIGH' ? '#fef2f2' : '#ffffff' }}
          title={isHi ? 'उच्च गंभीरता संकेत फ़िल्टर करें' : 'Filter High Attention signals'}
        >
          <div className="metric-header">
            <span className="metric-label">{isHi ? 'उच्च निगरानी गलियारे' : 'High Attention Corridors'}</span>
            <div className="metric-icon-badge" style={{ color: 'var(--gov-red)' }}>
              <ShieldAlert size={16} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value" style={{ color: 'var(--gov-red)' }}>
              {priorityDist.HIGH_ATTENTION || 0}
            </span>
          </div>
          <span className="metric-subtext">
            {isHi ? 'अत्यधिक वॉक-अप सर्ज या अस्थिरता दर्शाने वाले गलियारे' : 'Corridors exhibiting excessive walk-up surge or volatility'}
          </span>
        </div>

        <div 
          onClick={() => setSeverityFilter('MEDIUM')}
          className="metric-card" 
          style={{ borderLeft: '4px solid var(--gov-saffron)', cursor: 'pointer', background: severityFilter === 'MEDIUM' ? '#fffbeb' : '#ffffff' }}
          title={isHi ? 'मध्यम निगरानी संकेत फ़िल्टर करें' : 'Filter Monitor status signals'}
        >
          <div className="metric-header">
            <span className="metric-label">{isHi ? 'निगरानी स्थिति गलियारे' : 'Monitor Status Corridors'}</span>
            <div className="metric-icon-badge" style={{ color: 'var(--gov-saffron)' }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value" style={{ color: 'var(--gov-saffron)' }}>
              {priorityDist.MONITOR || 0}
            </span>
          </div>
          <span className="metric-subtext">
            {isHi ? 'मध्यम अस्थिरता या मूल्य दबाव प्रेक्षित' : 'Moderate volatility or pricing pressure observed'}
          </span>
        </div>

        <div 
          onClick={() => setSeverityFilter('LOW')}
          className="metric-card" 
          style={{ borderLeft: '4px solid var(--gov-green)', cursor: 'pointer', background: severityFilter === 'LOW' ? '#f0fdf4' : '#ffffff' }}
          title={isHi ? 'निम्न गंभीरता संकेत फ़िल्टर करें' : 'Filter Low severity signals'}
        >
          <div className="metric-header">
            <span className="metric-label">{isHi ? 'स्थिर / निम्न निगरानी' : 'Low Attention Corridors'}</span>
            <div className="metric-icon-badge" style={{ color: 'var(--gov-green)' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value" style={{ color: 'var(--gov-green)' }}>
              {priorityDist.LOW_ATTENTION || 0}
            </span>
          </div>
          <span className="metric-subtext">
            {isHi ? 'ऐतिहासिक भिन्नता बैंड के भीतर स्थिर मूल्य निर्धारण' : 'Stable pricing within historical variance bands'}
          </span>
        </div>

        <div 
          onClick={() => setSeverityFilter('')}
          className="metric-card" 
          style={{ borderLeft: '4px solid var(--gov-navy)', cursor: 'pointer', background: severityFilter === '' ? '#f8fafc' : '#ffffff' }}
          title={isHi ? 'सभी संकेत देखें' : 'View all policy signals'}
        >
          <div className="metric-header">
            <span className="metric-label">{isHi ? 'कुल सक्रिय नीति संकेत' : 'Total Active Policy Flags'}</span>
            <div className="metric-icon-badge" style={{ color: 'var(--gov-navy)' }}>
              <Layers size={16} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value" style={{ color: 'var(--gov-navy)' }}>
              {networkPolicy?.total_active_flags || flags.length}
            </span>
          </div>
          <span className="metric-subtext">
            {isHi ? 'पूरे नेटवर्क में स्वचालित निगरानी संकेत' : 'Total automated supervisory signals across network'}
          </span>
        </div>
      </div>

      {/* Corridor Priority Deep-Dive */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">{t('policy.routePolicyTitle')}</h3>
            <p className="card-subtitle">
              {isHi ? 'विशिष्ट घरेलू गलियारों के लिए निश्चित प्राथमिकता मूल्यांकन की जांच करें' : 'Examine deterministic priority assessment for specific domestic corridors'}
            </p>
          </div>
        </div>

        <RouteSelector 
          routes={['DEL-BOM', 'DEL-BLR', 'BOM-BLR']}
          selectedRoute={selectedRoute}
          onSelectRoute={setSelectedRoute}
        />

        {routePolicy && (
          <div style={{
            marginTop: '16px',
            padding: '18px 20px',
            backgroundColor: '#fafbfc',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {isHi ? `गलियारा ${routePolicy.route_code}: ${routePolicy.source_city || 'स्रोत'} → ${routePolicy.destination_city || 'गंतव्य'}` : `Corridor ${routePolicy.route_code}: ${routePolicy.source_city || 'Origin'} → ${routePolicy.destination_city || 'Destination'}`}
                </span>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {isHi 
                    ? `मूल्यांकन: ${routePolicy.observed_flight_records?.toLocaleString('en-IN')} उड़ान रिकॉर्ड • अस्थिरता CV: ${routePolicy.volatility_cv}%`
                    : `Evaluated ${routePolicy.observed_flight_records?.toLocaleString('en-IN')} flight records • Volatility CV: ${routePolicy.volatility_cv}%`}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {(() => {
                  const prio = routePolicy.priority_classification?.priority_category || 'MONITOR';
                  return (
                    <span className={`badge ${
                      prio === 'HIGH_ATTENTION' ? 'badge-high' :
                      prio === 'MONITOR' ? 'badge-monitor' : 'badge-low'
                    }`} style={{ fontSize: '12px', padding: '6px 12px' }}>
                      {prio}
                    </span>
                  );
                })()}

                <button
                  onClick={() => openTab({
                    id: `route-${routePolicy.route_code}`,
                    title: routePolicy.route_code,
                    titleHi: routePolicy.route_code,
                    type: 'route',
                    data: { route_id: routePolicy.route_code }
                  })}
                  style={{
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                    borderRadius: '6px',
                    padding: '0.4rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  {isHi ? 'पूर्ण मार्ग डॉसियर खोलें' : 'Open Corridor Workspace'}
                  <ExternalLink size={13} />
                </button>
              </div>
            </div>

            {/* Assessment summary text */}
            <div style={{
              padding: '12px 14px',
              backgroundColor: '#ffffff',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: '1.6'
            }}>
              <strong style={{ color: 'var(--text-primary)' }}>
                {isHi ? 'प्राथमिक मात्रात्मक ट्रिगर: ' : 'Primary Quantitative Trigger: '}
              </strong>
              {routePolicy.priority_classification?.primary_trigger || 'Multi-factor corridor threshold evaluation'}
              <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                {routePolicy.priority_classification?.classification_notice}
              </div>
            </div>

            {/* Flags list on this route - Clickable to open PolicyFlagWorkspace */}
            {routePolicy.flags && routePolicy.flags.length > 0 && (
              <div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  {isHi ? `ट्रिगर किए गए मात्रात्मक संकेत (${routePolicy.flags.length}):` : `Triggered Quantitative Flags (${routePolicy.flags.length}):`}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {routePolicy.flags.map((flg, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => openTab({
                        id: `flag-${routePolicy.route_code}-${flg.flag_code || idx}`,
                        title: `${routePolicy.route_code} Flag`,
                        titleHi: `${routePolicy.route_code} संकेत`,
                        type: 'policy-flag',
                        data: { ...flg, route_code: routePolicy.route_code }
                      })}
                      style={{
                        padding: '10px 14px',
                        backgroundColor: '#ffffff',
                        borderRadius: '6px',
                        border: '1px solid var(--border-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'border 0.15s ease'
                      }}
                      title={isHi ? 'विस्तृत प्रमाण विश्लेषण खोलने हेतु क्लिक करें' : 'Click to inspect 5-step transparent heuristic audit'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                        <div>
                          <strong style={{ color: 'var(--text-primary)' }}>{flg.title || (flg.flag_code ? flg.flag_code.replace(/_/g, ' ') : 'Policy Flag')}: </strong>
                          <span style={{ color: 'var(--text-secondary)' }}>{flg.explanation}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className={`badge ${flg.severity === 'HIGH' ? 'badge-high' : flg.severity === 'LOW' ? 'badge-low' : 'badge-monitor'}`}>
                          {flg.severity}
                        </span>
                        <ExternalLink size={13} color="#94a3b8" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Network Policy Flags Table with Filter: Includes HIGH, MEDIUM, LOW, and All */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">{t('policy.flagsTitle')}</h3>
            <p className="card-subtitle">
              {isHi ? 'नेटवर्क गलियारों में स्वचालित पर्यवेक्षी संकेतों की व्यापक रजिस्ट्री' : 'Comprehensive registry of automated supervisory signals across network corridors'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={14} color="var(--text-muted)" />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {isHi ? 'गंभीरता फ़िल्टर:' : 'Severity:'}
            </span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              style={{
                fontSize: '12px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: 'var(--text-primary)',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <option value="">{isHi ? 'सभी गंभीरताएं (All)' : 'All Severities'}</option>
              <option value="HIGH">{isHi ? 'केवल उच्च (HIGH)' : 'High Severity Only (HIGH)'}</option>
              <option value="MEDIUM">{isHi ? 'केवल मध्यम (MEDIUM)' : 'Medium Severity Only (MEDIUM)'}</option>
              <option value="LOW">{isHi ? 'केवल निम्न (LOW)' : 'Low Severity Only (LOW)'}</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>{isHi ? 'गंभीरता' : 'Severity'}</th>
                <th>{isHi ? 'गलियारा' : 'Corridor'}</th>
                <th>{isHi ? 'नीति संकेत' : 'Policy Signal'}</th>
                <th>{isHi ? 'मात्रात्मक विवरण' : 'Quantitative Explanation'}</th>
                <th>{isHi ? 'अंतर्निहित प्रमाण' : 'Underlying Evidence'}</th>
                <th style={{ textAlign: 'center' }}>{isHi ? 'विश्लेषण' : 'Action'}</th>
              </tr>
            </thead>
            <tbody>
              {flags.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    {isHi ? 'इस फ़िल्टर के लिए कोई नीति ध्वज नहीं मिला।' : 'No policy signals matching the selected severity filter.'}
                  </td>
                </tr>
              ) : (
                flags.map((f, idx) => (
                  <tr key={idx}>
                    <td>
                      <span className={`badge ${f.severity === 'HIGH' ? 'badge-high' : f.severity === 'LOW' ? 'badge-low' : 'badge-monitor'}`}>
                        {f.severity}
                      </span>
                    </td>
                    <td style={{ fontWeight: '700', color: 'var(--gov-navy)' }}>{f.route_code}</td>
                    <td>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{f.title}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-muted)' }}>{f.flag_code}</div>
                    </td>
                    <td style={{ maxWidth: '400px', lineHeight: '1.4' }}>{f.explanation}</td>
                    <td style={{ fontSize: '12px' }}>
                      {f.underlying_metrics ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {Object.entries(f.underlying_metrics).map(([k, v]) => (
                            <span key={k} style={{ color: 'var(--text-secondary)' }}>
                              <strong style={{ color: 'var(--text-primary)' }}>{k.replace(/_/g, ' ')}:</strong> {typeof v === 'number' ? v.toFixed(2) : String(v)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>N/A</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => openTab({
                          id: `flag-${f.route_code || 'flag'}-${f.flag_code || idx}`,
                          title: `${f.route_code || 'Policy'} Flag`,
                          titleHi: `${f.route_code || 'नीति'} संकेत`,
                          type: 'policy-flag',
                          data: f
                        })}
                        style={{
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          border: '1px solid #bfdbfe',
                          borderRadius: '4px',
                          padding: '0.3rem 0.6rem',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.2rem'
                        }}
                      >
                        {isHi ? 'प्रमाण जांचें' : 'Inspect'}
                        <ArrowRight size={11} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Disclaimer */}
      <DisclaimerBanner />
    </div>
  );
}
