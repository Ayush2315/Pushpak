import React from 'react';
import { 
  Flame, 
  TrendingUp, 
  Layers, 
  Calculator, 
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react';
import { useWorkspace } from '../../hooks/useWorkspace';
import { useLanguage } from '../../hooks/useLanguage';
import DisclaimerBanner from '../DisclaimerBanner';

export default function SurgeSpreadWorkspace() {
  const { openTab } = useWorkspace();
  const { lang } = useLanguage();

  const headlineVal = 133.79;
  const coreVal = 112.94;
  const spreadPts = 20.85;
  const spreadPct = 18.46;

  return (
    <div className="page-container">
      {/* Hero */}
      <div className="card" style={{ borderLeft: '4px solid var(--gov-saffron)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Flame size={20} color="var(--gov-saffron)" />
              <span className="badge badge-monitor" style={{ fontSize: '12px' }}>
                SURGE SPREAD INDICATOR
              </span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {lang === 'hi' ? 'वॉक-अप वृद्धि अंतर विश्लेषण' : 'Walk-Up Surge Spread Analysis'}
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Isolated quantitative measurement of the short-term walk-up premium extracted by dynamic yield management algorithms.
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '38px', fontWeight: '800', color: 'var(--gov-saffron)', letterSpacing: '-0.5px' }}>
              +{spreadPts.toFixed(2)}
            </div>
            <span className="metric-delta delta-up" style={{ fontSize: '13px' }}>
              +{spreadPct.toFixed(2)}% Markup Above Core
            </span>
          </div>
        </div>
      </div>

      {/* Arithmetic Decomposition Box */}
      <div className="card">
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>
          Exact Mathematical Calculation
        </h3>

        <div style={{
          padding: '20px',
          backgroundColor: '#fafbfc',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
          fontFamily: 'monospace',
          fontSize: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>PUSHPAK Headline Index (All Horizons T+1 to T+45):</span>
            <strong style={{ color: 'var(--gov-navy)' }}>133.79 points</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>LESS: PUSHPAK Core Index (Structural Horizons T+15, T+30, T+45):</span>
            <strong style={{ color: 'var(--gov-green)' }}>- 112.94 points</strong>
          </div>
          <div style={{ borderTop: '2px solid #cbd5e1', paddingTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: '700' }}>EQUALS: Walk-Up Surge Spread (Dynamic Premium Points):</span>
            <strong style={{ color: 'var(--gov-saffron)', fontSize: '16px' }}>+ 20.85 points</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>Percentage Surge Markup Formula: (20.85 / 112.94) × 100 =</span>
            <strong style={{ color: 'var(--gov-saffron)' }}>+ 18.46%</strong>
          </div>
        </div>
      </div>

      {/* Policy Significance */}
      <div className="card">
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '10px' }}>
          What Does This Mean for Civil Aviation Policymakers?
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '12px' }}>
          The <strong>+20.85 index point spread (+18.46% markup)</strong> reveals that airline base ticket capacity is NOT experiencing uncontrollable hyper-inflation across domestic routes. Rather, underlying baseline capacity fares have grown at a manageable <strong>+12.94%</strong> above advance reference rates, while <strong>over 60% of apparent price volatility is concentrated entirely in the final 7 days before departure</strong>.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          <div style={{ padding: '14px', backgroundColor: '#fafbfc', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
              Consumer Impact
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Travelers with mandatory urgent trips (medical emergencies, unexpected business) pay an 18.46% surge tax above planned leisure travelers.
            </p>
          </div>

          <div style={{ padding: '14px', backgroundColor: '#fafbfc', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
              Regulatory Insight
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Supervisory monitoring should target last-minute seat reservation algorithms rather than blanket statutory price caps on overall ticket fares.
            </p>
          </div>
        </div>
      </div>

      {/* Action Row */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
        <button
          onClick={() => openTab({
            id: 'metric-headline',
            type: 'headline',
            title: 'Headline Index (133.79)',
            titleHi: 'हेडलाइन सूचकांक'
          })}
          className="route-btn"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: 'var(--gov-navy)', color: '#ffffff', border: 'none' }}
        >
          <TrendingUp size={15} />
          <span>Examine Headline Index (133.79)</span>
        </button>

        <button
          onClick={() => openTab({
            id: 'metric-core',
            type: 'core',
            title: 'Core Index (112.94)',
            titleHi: 'कोर सूचकांक'
          })}
          className="route-btn"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: 'var(--gov-green)', color: '#ffffff', border: 'none' }}
        >
          <Layers size={15} />
          <span>Examine Core Index (112.94)</span>
        </button>
      </div>

      <DisclaimerBanner />
    </div>
  );
}
