import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Layers, 
  Flame, 
  HelpCircle, 
  SlidersHorizontal,
  FileSpreadsheet,
  Calculator,
  ArrowRight,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
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

export default function PriceIndex() {
  const { lang, t } = useLanguage();
  const { openTab } = useWorkspace();
  const { isDemoActive, currentStep, nextStep } = useGuidedDemo();
  const isHi = lang === 'hi';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [weightingMethod, setWeightingMethod] = useState('observed_records');
  const [summaryData, setSummaryData] = useState(null);
  const [headlineData, setHeadlineData] = useState(null);
  const [coreData, setCoreData] = useState(null);
  const [methodologyData, setMethodologyData] = useState(null);

  const loadIndexData = async (method = weightingMethod) => {
    try {
      setLoading(true);
      setError(null);

      const [sumRes, headRes, coreRes, methRes] = await Promise.all([
        api.getIndexSummary(method),
        api.getHeadlineIndex(method),
        api.getCoreIndex(method),
        api.getIndexMethodology(),
      ]);

      setSummaryData(sumRes);
      setHeadlineData(headRes);
      setCoreData(coreRes);
      setMethodologyData(methRes);
    } catch (err) {
      console.error('Failed to load Price Index data:', err);
      setError(err.message || 'Unable to retrieve Price Index from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIndexData(weightingMethod);
  }, [weightingMethod]);

  if (loading) return <LoadingState message={isHi ? "पुष्पक मूल्य सापेक्ष गणना प्रगति पर है..." : "Calculating deterministic PUSHPAK price relatives..."} />;
  if (error) return <ErrorState message={error} onRetry={() => loadIndexData(weightingMethod)} />;

  const headlineVal = summaryData?.headline_index ?? headlineData?.index_value ?? 133.79;
  const coreVal = summaryData?.core_index ?? coreData?.index_value ?? 112.94;
  const spreadPts = summaryData?.surge_spread_points ?? 20.85;
  const spreadPct = summaryData?.surge_spread_pct ?? 18.46;

  return (
    <div className="page-container">
      {/* Header with Weighting Sensitivity Selector */}
      <SectionHeader 
        title={t('priceIndex.title')}
        subtitle={t('priceIndex.subtitle')}
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ffffff', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <SlidersHorizontal size={14} color="var(--gov-navy)" />
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              {isHi ? 'भार विधि:' : 'Weighting:'}
            </span>
            <select
              value={weightingMethod}
              onChange={(e) => setWeightingMethod(e.target.value)}
              style={{
                fontSize: '12px',
                border: 'none',
                background: 'transparent',
                fontWeight: '600',
                color: 'var(--gov-navy)',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="observed_records">{isHi ? 'उड़ान संख्या भारित (Flight Volume)' : 'Flight Volume Weighted'}</option>
              <option value="equal_weights">{isHi ? 'समान गलियारा भार (33.33% प्रत्येक)' : 'Equal Corridor Weights (33.33%)'}</option>
            </select>
          </div>
        }
      />

      {/* Guided Demo Step 4 Banner */}
      {isDemoActive && currentStep === 4 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1rem 1.25rem',
          backgroundColor: '#0f766e',
          color: '#ffffff',
          borderRadius: '10px',
          marginBottom: '1.5rem',
          boxShadow: '0 4px 12px rgba(15, 118, 110, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle2 size={20} color="#5eead4" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: '800', fontSize: '0.92rem' }}>
                {isHi ? 'चरण 4: वायु किराया मूल्य सूचकांक एवं सर्ज स्प्रेड' : 'Step 4: Airfare Price Index & Surge Spread Construction'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#ccfbf1' }}>
                {isHi ? 'हेडलाइन सूचकांक (133.79), कोर सूचकांक (112.94) और सर्ज स्प्रेड (+20.85 अंक) का अवलोकन किया गया। अब नीति आसूचना की ओर बढ़ें।' : 'Laspeyres/Jevons price index relatives and dynamic pricing surge spread inspected. Proceed to Policy Intelligence.'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={nextStep}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.5rem 1.15rem',
              backgroundColor: '#ffffff',
              color: '#0f766e',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '800',
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
            }}
          >
            <span>{isHi ? 'नीति आसूचना पर आगे बढ़ें →' : 'View Policy Intelligence →'}</span>
          </button>
        </div>
      )}

      {/* Top 3 Core Index Cards - Clickable to open Workspaces */}
      <div className="metrics-grid">
        <div 
          onClick={() => openTab({
            id: 'metric-headline',
            title: 'Headline Index',
            titleHi: 'हेडलाइन सूचकांक',
            type: 'headline',
            data: { value: headlineVal, summary: summaryData }
          })}
          style={{ cursor: 'pointer' }}
          title={isHi ? 'हेडलाइन विश्लेषण खोलें' : 'Click to inspect Headline Index'}
        >
          <MetricCard 
            label={t('priceIndex.headlineCard')}
            value={headlineVal.toFixed(2)}
            delta={`+${(headlineVal - 100).toFixed(2)}%`}
            deltaType="up"
            subtext={isHi ? 'सभी 5 बुकिंग क्षितिज (T+1 से T+45)' : 'Encompasses all advance horizons (T+1 to T+45)'}
            icon={TrendingUp}
            accentColor="var(--gov-navy)"
          />
        </div>

        <div 
          onClick={() => openTab({
            id: 'metric-core',
            title: 'Core Index',
            titleHi: 'कोर सूचकांक',
            type: 'core',
            data: { value: coreVal, summary: summaryData }
          })}
          style={{ cursor: 'pointer' }}
          title={isHi ? 'कोर सूचकांक विश्लेषण खोलें' : 'Click to inspect Core Index'}
        >
          <MetricCard 
            label={t('priceIndex.coreCard')}
            value={coreVal.toFixed(2)}
            delta={`+${(coreVal - 100).toFixed(2)}%`}
            deltaType="neutral"
            subtext={isHi ? 'संरचनात्मक मूल्य निर्धारण (T+15+)' : 'Isolates structural pricing (excl. T+1, T+7 surge)'}
            icon={Layers}
            accentColor="var(--gov-green)"
          />
        </div>

        <div 
          onClick={() => openTab({
            id: 'metric-spread',
            title: 'Surge Spread',
            titleHi: 'सर्ज स्प्रेड',
            type: 'spread',
            data: { spreadPts, spreadPct, summary: summaryData }
          })}
          style={{ cursor: 'pointer' }}
          title={isHi ? 'सर्ज स्प्रेड विश्लेषण खोलें' : 'Click to inspect Surge Spread'}
        >
          <MetricCard 
            label={t('priceIndex.spreadCard')}
            value={`+${spreadPts.toFixed(2)}`}
            delta={`+${spreadPct.toFixed(2)}%`}
            deltaType="up"
            subtext={isHi ? 'गतिशील मूल्य निर्धारण सर्ज मार्कअप' : 'Walk-up surge markup extracted by dynamic pricing'}
            icon={Flame}
            accentColor="var(--gov-saffron)"
          />
        </div>
      </div>

      {/* Comparative Visualization */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              {isHi ? 'पुष्पक हेडलाइन बनाम कोर गलियारा सापेक्ष' : 'PUSHPAK Headline vs Core Corridor Relatives'}
            </h3>
            <p className="card-subtitle">
              {isHi ? 'अग्रिम बेसलाइन संदर्भ बेस = 100.00 (T+45 अग्रिम खरीद) के विरुद्ध मापा गया' : 'Measured against advance baseline benchmark Base = 100.00 (T+45 advance purchase)'}
            </p>
          </div>
          <button
            onClick={() => openTab({
              id: 'formula-laspeyres',
              title: 'Index Formula (Σ)',
              titleHi: 'सूचकांक सूत्र (Σ)',
              type: 'formula',
              data: {}
            })}
            style={{
              background: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Calculator size={14} />
            <span>{isHi ? 'गणना पद्धति देखें' : 'View Formula & Weights'}</span>
          </button>
        </div>

        <IndexComparisonChart 
          summaryData={summaryData}
          headlineData={headlineData}
          coreData={coreData}
        />
      </div>

      {/* Route Basket Contributions Table - Corrected Math & Clickable Routes */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">{t('priceIndex.routeContributionsTitle')}</h3>
            <p className="card-subtitle">
              {isHi 
                ? 'लासपेयर्स-प्रकार एकत्रीकरण का गणितीय विघटन: Iₜ = Σ(wᵢ × Rᵢ) × 100'
                : 'Mathematical decomposition of Laspeyres-type aggregation: Iₜ = Σ(wᵢ × Rᵢ) × 100'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <FileSpreadsheet size={14} />
            <span>{isHi ? 'ऑडिटेड SQLite प्रेक्षण' : 'Audited SQLite Observations'}</span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>{isHi ? 'गलियारा' : 'Corridor Code'}</th>
                <th>{isHi ? 'नाम' : 'Corridor Name'}</th>
                <th>{isHi ? 'भार (wᵢ)' : 'Volume Weight (w_i)'}</th>
                <th>{isHi ? 'बेस किराया (T+45)' : 'Base Fare (T+45)'}</th>
                <th>{isHi ? 'वर्तमान औसत किराया' : 'Current Mean Fare'}</th>
                <th>{isHi ? 'मूल्य सापेक्ष (Rᵢ)' : 'Price Relative (R_i)'}</th>
                <th>{isHi ? 'गलियारा सूचकांक' : 'Corridor Index'}</th>
                <th>{isHi ? 'भारित अंश' : 'Weighted Contribution'}</th>
                <th style={{ textAlign: 'center' }}>{isHi ? 'विश्लेषण' : 'Action'}</th>
              </tr>
            </thead>
            <tbody>
              {headlineData?.route_contributions?.map((rc) => (
                <tr key={rc.route_code}>
                  <td style={{ fontWeight: '700', color: 'var(--gov-navy)' }}>{rc.route_code}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{rc.source_city} → {rc.destination_city}</td>
                  <td style={{ fontWeight: '600' }}>{(rc.weight * 100).toFixed(2)}%</td>
                  <td>₹{rc.base_fare?.toLocaleString('en-IN')}</td>
                  <td>₹{rc.current_fare?.toLocaleString('en-IN')}</td>
                  <td style={{ fontWeight: '600', color: rc.price_relative >= 1.0 ? 'var(--gov-saffron)' : 'var(--gov-green)' }}>
                    {rc.price_relative?.toFixed(4)}
                  </td>
                  <td style={{ fontWeight: '600' }}>{rc.route_index?.toFixed(2)}</td>
                  <td style={{ fontWeight: '700', color: 'var(--gov-navy)' }}>{rc.weighted_contribution?.toFixed(2)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => openTab({
                        id: `route-${rc.route_code}`,
                        title: rc.route_code,
                        titleHi: rc.route_code,
                        type: 'route',
                        data: { route_id: rc.route_code }
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
                      {isHi ? 'मार्ग देखें' : 'View'}
                      <ArrowRight size={11} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Methodology Summary Box - Clean readable notation */}
      {methodologyData && (
        <div className="card" style={{ backgroundColor: '#fafbfc' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">{t('priceIndex.methodologySummaryTitle')}</h3>
              <p className="card-subtitle">
                {isHi ? 'अंतरराष्ट्रीय सीपीआई मानकों के अनुरूप आधिकारिक गणितीय विनिर्देश' : 'Official mathematical specifications aligned with international CPI standards'}
              </p>
            </div>
            <button
              onClick={() => openTab({
                id: 'formula-laspeyres',
                title: 'Laspeyres Index Formula (Σ)',
                titleHi: 'लासपेयर्स सूचकांक सूत्र (Σ)',
                type: 'formula',
                data: {}
              })}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: '600',
                color: '#1e3a8a',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Calculator size={13} />
              <span>{isHi ? 'गणना कार्यप्रणाली देखें' : 'View Calculation Methodology'}</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: '#ffffff', border: '1px solid var(--border-light)', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {isHi ? 'आधार अवधि परंपरा' : 'Base Period Convention'}
              </div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '4px' }}>
                Base = 100.00 (T+45 Advance Reference Period)
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#ffffff', border: '1px solid var(--border-light)', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {isHi ? 'गणितीय सूत्र' : 'Mathematical Formula'}
              </div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e3a8a', marginTop: '4px', fontFamily: 'Consolas, Monaco, monospace' }}>
                Iₜ = Σ(wᵢ × Rᵢ) × 100
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#ffffff', border: '1px solid var(--border-light)', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {isHi ? 'भार रणनीति' : 'Weighting Strategy'}
              </div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', marginTop: '4px' }}>
                {methodologyData.weighting_strategy || (isHi ? 'यात्री संख्या आधारित भार (Σwᵢ = 1.0)' : 'Normalized Volume-Proportional Weighting')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer Banner */}
      <DisclaimerBanner />
    </div>
  );
}
