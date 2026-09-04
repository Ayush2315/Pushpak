import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShieldAlert, 
  Layers, 
  Flame, 
  Plane, 
  Compass, 
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  Calculator,
  Play
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useWorkspace } from '../hooks/useWorkspace';
import { useGuidedDemo } from '../context/GuidedDemoContext';
import api from '../api/client';
import SectionHeader from '../components/SectionHeader';
import MetricCard from '../components/MetricCard';
import IndexComparisonChart from '../components/charts/IndexComparisonChart';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import DisclaimerBanner from '../components/DisclaimerBanner';
import DataPipelineFlow from '../components/DataPipelineFlow';

export default function Dashboard() {
  const { lang, t } = useLanguage();
  const { openContextualWindow } = useWorkspace();
  const { startDemo } = useGuidedDemo();
  const navigate = useNavigate();
  const isHi = lang === 'hi';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [indexSummary, setIndexSummary] = useState(null);
  const [headlineData, setHeadlineData] = useState(null);
  const [coreData, setCoreData] = useState(null);
  const [networkStats, setNetworkStats] = useState(null);
  const [policyFlags, setPolicyFlags] = useState([]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Concurrent fetch of all dashboard requirements
      const [summaryRes, headRes, coreRes, netRes, flagsRes] = await Promise.all([
        api.getIndexSummary(),
        api.getHeadlineIndex(),
        api.getCoreIndex(),
        api.getNetworkAnalytics(),
        api.getPolicyFlags('HIGH'), // Prioritize high-severity flags for dashboard
      ]);

      setIndexSummary(summaryRes);
      setHeadlineData(headRes);
      setCoreData(coreRes);
      setNetworkStats(netRes);
      const flagsList = Array.isArray(flagsRes) ? flagsRes : (flagsRes?.flags || []);
      setPolicyFlags(flagsList);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Unable to connect to PUSHPAK API server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) return <LoadingState message={t('common.loading')} />;
  if (error) return <ErrorState message={error} onRetry={loadDashboardData} />;

  const headlineVal = indexSummary?.headline_index ?? headlineData?.index_value ?? 133.79;
  const coreVal = indexSummary?.core_index ?? coreData?.index_value ?? 112.94;
  const spreadPts = indexSummary?.surge_spread_points ?? 20.85;
  const spreadPct = indexSummary?.surge_spread_pct ?? 18.46;

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Spacious Upper Header with Guided Demo Action */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div>
          <SectionHeader 
            title={t('dashboard.title')}
            subtitle={t('dashboard.subtitle')}
          />
        </div>

        <button
          type="button"
          onClick={startDemo}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.75rem 1.4rem',
            backgroundColor: '#0f766e',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.92rem',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(15, 118, 110, 0.3)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#115e59';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#0f766e';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Play size={16} fill="#ffffff" />
          <span>{isHi ? 'संपूर्ण प्रणाली प्रदर्शन चलाएँ' : 'Run End-to-End Demonstration'}</span>
        </button>
      </div>

      {/* PUSHPAK Data-to-Decision Pipeline Visual Flow */}
      <DataPipelineFlow />

      {/* Top Level Key Indicators - Clickable to Open the Single Contextual Information Window */}
      <div className="metrics-grid">
        <div 
          onClick={() => openContextualWindow({
            id: 'metric-headline',
            title: 'PUSHPAK Headline Index',
            titleHi: 'पुष्पक हेडलाइन सूचकांक',
            type: 'headline',
            data: { value: headlineVal, summary: indexSummary }
          })}
          style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
          title={isHi ? 'विस्तृत विश्लेषण खोलने हेतु क्लिक करें' : 'Click to explain Headline Index'}
        >
          <MetricCard 
            label={t('dashboard.headlineIndex')}
            value={headlineVal.toFixed(2)}
            delta={`+${(headlineVal - 100).toFixed(2)}%`}
            deltaType="up"
            subtext={isHi ? 'क्लिक करें → विश्लेषण देखें' : 'Click to inspect horizons (T+1 to T+45)'}
            icon={TrendingUp}
            accentColor="var(--gov-navy)"
          />
        </div>

        <div 
          onClick={() => openContextualWindow({
            id: 'metric-core',
            title: 'PUSHPAK Core Index',
            titleHi: 'पुष्पक कोर सूचकांक',
            type: 'core',
            data: { value: coreVal, summary: indexSummary }
          })}
          style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
          title={isHi ? 'कोर सूचकांक विश्लेषण खोलने हेतु क्लिक करें' : 'Click to explain Core Index'}
        >
          <MetricCard 
            label={t('dashboard.coreIndex')}
            value={coreVal.toFixed(2)}
            delta={`+${(coreVal - 100).toFixed(2)}%`}
            deltaType="neutral"
            subtext={isHi ? 'क्लिक करें → स्थिर खिड़कियां समझें' : 'Click to inspect structural capacity (T+15+)'}
            icon={Layers}
            accentColor="var(--gov-green)"
          />
        </div>

        <div 
          onClick={() => openContextualWindow({
            id: 'metric-spread',
            title: 'Walk-Up Surge Spread',
            titleHi: 'वॉक-अप वृद्धि अंतर',
            type: 'spread',
            data: { spreadPts, spreadPct, summary: indexSummary }
          })}
          style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
          title={isHi ? 'सर्ज स्प्रेड विश्लेषण खोलने हेतु क्लिक करें' : 'Click to explain Walk-Up Surge Spread'}
        >
          <MetricCard 
            label={t('dashboard.surgeSpread')}
            value={`+${spreadPts.toFixed(2)}`}
            delta={`+${spreadPct.toFixed(2)}%`}
            deltaType="up"
            subtext={isHi ? 'क्लिक करें → नियर-टर्म अंतर समझें' : 'Click to analyze near-term urgency markup'}
            icon={Flame}
            accentColor="var(--gov-saffron)"
          />
        </div>

        <div 
          onClick={() => navigate('/policy')}
          style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
          title={isHi ? 'नीति निगरानी बोर्ड पर जाएं' : 'Go to Policy Intelligence page'}
        >
          <MetricCard 
            label={t('dashboard.policyAttention')}
            value={policyFlags.length}
            delta={policyFlags.length > 0 ? (isHi ? 'उच्च निगरानी' : 'HIGH ATTENTION') : (isHi ? 'स्थिर' : 'STABLE')}
            deltaType={policyFlags.length > 0 ? 'up' : 'down'}
            subtext={isHi ? 'नीति पृष्ठ खोलें →' : 'View policy signals →'}
            icon={ShieldAlert}
            accentColor="var(--gov-red)"
          />
        </div>
      </div>

      {/* Main Visualization: Headline vs Core Index Comparison */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">{t('dashboard.chartTitle')}</h3>
            <p className="card-subtitle">{t('dashboard.chartSubtitle')}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              onClick={() => openContextualWindow({
                id: 'formula-laspeyres',
                title: 'Laspeyres Index Formula (Σ)',
                titleHi: 'लासपेयर्स सूचकांक सूत्र (Σ)',
                type: 'formula',
                data: {}
              })}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#1e3a8a',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <Calculator size={13} />
              <span>{isHi ? 'सूत्र समझें' : 'Understand Formula'}</span>
            </button>
            <Link 
              to="/price-index"
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '4px', 
                fontSize: '13px', 
                fontWeight: '600', 
                color: 'var(--gov-navy)', 
                textDecoration: 'none'
              }}
            >
              <span>{isHi ? 'पूर्ण सूचकांक देखें' : 'Explore Index Suite'}</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <IndexComparisonChart 
          summaryData={indexSummary}
          headlineData={headlineData}
          coreData={coreData}
        />

        {indexSummary?.analytical_interpretation && (
          <div style={{
            marginTop: '18px',
            padding: '12px 16px',
            backgroundColor: '#f8fafc',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            lineHeight: '1.5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>
                {isHi ? 'आर्थिक व्याख्या: ' : 'Economic Interpretation: '}
              </strong>
              {indexSummary.analytical_interpretation}
            </div>
            <button
              onClick={() => openContextualWindow({
                id: 'metric-spread',
                title: 'Walk-Up Surge Spread',
                titleHi: 'वॉक-अप वृद्धि अंतर',
                type: 'spread',
                data: { spreadPts, spreadPct }
              })}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                padding: '0.3rem 0.6rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#1e3a8a',
                cursor: 'pointer'
              }}
            >
              {isHi ? 'स्प्रेड समझें' : 'Understand Spread'}
            </button>
          </div>
        )}
      </div>

      {/* Two Column Section: Network Macro + Policy Signals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        {/* Network Infrastructure Summary */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">{t('dashboard.networkSummaryTitle')}</h3>
              <p className="card-subtitle">
                {isHi ? 'प्रतिनिधि गलियारों में सत्यापित उड़ान रिकॉर्ड' : 'Verified flight registry records across representative corridors'}
              </p>
            </div>
            <Link 
              to="/network"
              style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gov-navy)', textDecoration: 'none' }}
            >
              {isHi ? 'नेटवर्क देखें' : 'View Network'}
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
            <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {networkStats?.total_routes_indexed ?? 6}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {isHi ? 'अनुक्रमित गलियारे' : 'Indexed Corridors'}
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {networkStats?.total_observed_flight_records?.toLocaleString('en-IN') ?? '50,000'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {isHi ? 'प्रेक्षित रिकॉर्ड' : 'Observed Records'}
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {networkStats?.total_operating_airlines ?? 6}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {isHi ? 'सक्रिय एयरलाइंस' : 'Active Airlines'}
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{isHi ? 'गलियारा' : 'Corridor'}</th>
                  <th>{isHi ? 'प्रेक्षित रिकॉर्ड' : 'Observed Records'}</th>
                  <th>{isHi ? 'सक्रिय वाहक' : 'Active Carriers'}</th>
                  <th>{isHi ? 'औसत अवधि' : 'Avg Duration'}</th>
                  <th style={{ textAlign: 'center' }}>{isHi ? 'विश्लेषण' : 'Action'}</th>
                </tr>
              </thead>
              <tbody>
                {networkStats?.top_routes_by_records?.slice(0, 4).map((r) => (
                  <tr key={r.route_code}>
                    <td style={{ fontWeight: '700', color: 'var(--gov-navy)' }}>
                      {r.route_code}
                    </td>
                    <td>{r.observed_flight_records?.toLocaleString('en-IN')}</td>
                    <td>{r.active_airlines_count} {isHi ? 'वाहक' : 'carriers'}</td>
                    <td>{r.avg_duration_hours} {isHi ? 'घंटे' : 'hrs'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => openContextualWindow({
                          id: `route-${r.route_code}`,
                          title: `Corridor ${r.route_code}`,
                          titleHi: `गलियारा ${r.route_code}`,
                          type: 'route',
                          data: { route_id: r.route_code }
                        })}
                        style={{
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          border: '1px solid #bfdbfe',
                          borderRadius: '4px',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.2rem'
                        }}
                      >
                        {isHi ? 'समझें' : 'Explain'}
                        <ArrowRight size={11} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Policy Attention Flags - Clickable into Policy Flag Contextual Window */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">{t('dashboard.activeFlagsTitle')}</h3>
              <p className="card-subtitle">
                {isHi ? 'मूल्य निर्धारण अस्थिरता या सर्ज दर्शाने वाले निश्चित संकेत' : 'Deterministic signals indicating pricing volatility or surge'}
              </p>
            </div>
            <Link 
              to="/policy"
              style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gov-navy)', textDecoration: 'none' }}
            >
              {isHi ? 'सभी संकेत देखें' : 'View All Flags'}
            </Link>
          </div>

          {policyFlags.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              {isHi ? 'वर्तमान में कोई गंभीर नीति ध्वज सक्रिय नहीं है।' : 'No critical policy flags currently active across representative corridors.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {policyFlags.slice(0, 3).map((flag, idx) => (
                <div 
                  key={idx}
                  onClick={() => openContextualWindow({
                    id: `flag-${flag.route_code || 'flag'}-${flag.flag_code || idx}`,
                    title: `${flag.route_code || 'Policy'} Flag`,
                    titleHi: `${flag.route_code || 'नीति'} संकेत`,
                    type: 'policy-flag',
                    data: flag
                  })}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    backgroundColor: '#fafbfc',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title={isHi ? 'नीति प्रमाण एवं व्याख्या खोलने हेतु क्लिक करें' : 'Click to inspect rule, threshold and interpretation'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>{flag.route_code} — {flag.title || (flag.flag_code ? flag.flag_code.replace(/_/g, ' ') : 'Policy Signal')}</span>
                      <ExternalLink size={12} color="#94a3b8" />
                    </span>
                    <span className={`badge ${flag.severity === 'HIGH' ? 'badge-high' : 'badge-monitor'}`}>
                      {flag.severity}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
                    {flag.explanation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Institutional Transparency & Prototype Disclaimer */}
      <DisclaimerBanner />
    </div>
  );
}
