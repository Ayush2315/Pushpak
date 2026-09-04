import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  TrendingUp, 
  Flame, 
  ArrowDown, 
  ArrowRight, 
  Calculator, 
  CheckCircle2, 
  XCircle,
  Info
} from 'lucide-react';
import { useWorkspace } from '../../hooks/useWorkspace';
import { useLanguage } from '../../hooks/useLanguage';
import api from '../../api/client';
import LoadingState from '../LoadingState';
import DisclaimerBanner from '../DisclaimerBanner';

export default function CoreIndexWorkspace() {
  const { openTab } = useWorkspace();
  const { lang } = useLanguage();
  const [coreData, setCoreData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCore = async () => {
      try {
        setLoading(true);
        const res = await api.getCoreIndex();
        setCoreData(res);
      } catch (err) {
        console.error('Failed to load core index:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCore();
  }, []);

  if (loading) return <LoadingState message="Loading Core Index analytical breakdown..." />;

  const indexVal = coreData?.index_value ?? 112.94;
  const pctMovement = coreData?.percentage_movement ?? 12.94;

  return (
    <div className="page-container">
      {/* Hero Header */}
      <div className="card" style={{ borderLeft: '4px solid var(--gov-green)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Layers size={20} color="var(--gov-green)" />
              <span className="badge badge-low" style={{ fontSize: '12px' }}>
                PUSHPAK-CORE
              </span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {lang === 'hi' ? 'पुष्पक कोर हवाई किराया मूल्य सूचकांक' : 'PUSHPAK Core Airfare Price Index'}
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Structural capacity pricing index excluding transient, high-volatility near-term walk-up surge pricing (T+1 and T+7).
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '38px', fontWeight: '800', color: 'var(--gov-green)', letterSpacing: '-0.5px' }}>
              {indexVal.toFixed(2)}
            </div>
            <span className="metric-delta delta-neutral" style={{ fontSize: '13px' }}>
              +{pctMovement.toFixed(2)}% vs Base (100.00)
            </span>
          </div>
        </div>
      </div>

      {/* Visual Relationship Diagram connecting Headline, Core, and Spread */}
      <div className="card" style={{ backgroundColor: '#fafbfc' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '14px', textAlign: 'center' }}>
          Visual Relationship: Headline → Core → Walk-Up Surge Spread
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', maxWidth: '640px', margin: '0 auto' }}>
          {/* Step 1: Headline */}
          <div style={{
            width: '100%',
            padding: '14px 20px',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--gov-navy)', textTransform: 'uppercase' }}>
                All Booking Horizons (T+1, T+7, T+15, T+30, T+45)
              </div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
                PUSHPAK Headline Index
              </div>
            </div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--gov-navy)' }}>
              133.79
            </div>
          </div>

          <ArrowDown size={20} color="#94a3b8" />

          {/* Step 2: Filter Surge Windows */}
          <div style={{
            width: '90%',
            padding: '10px 16px',
            backgroundColor: 'var(--gov-red-light)',
            border: '1px dashed var(--gov-red-border)',
            borderRadius: '6px',
            textAlign: 'center',
            fontSize: '12px',
            fontWeight: '600',
            color: 'var(--gov-red)'
          }}>
            EXCLUDE VOLATILE NEAR-TERM SURGE WINDOWS: T+1 (Walk-Up) and T+7 (Near-Term)
          </div>

          <ArrowDown size={20} color="#94a3b8" />

          {/* Step 3: Core Index */}
          <div style={{
            width: '100%',
            padding: '14px 20px',
            backgroundColor: '#ffffff',
            border: '2px solid var(--gov-green-border)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--gov-green)', textTransform: 'uppercase' }}>
                Medium-to-Long Advance Horizons (T+15, T+30, T+45)
              </div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
                PUSHPAK Core Index (Structural Capacity)
              </div>
            </div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--gov-green)' }}>
              112.94
            </div>
          </div>

          <ArrowDown size={20} color="#94a3b8" />

          {/* Step 4: Spread */}
          <div style={{
            width: '100%',
            padding: '14px 20px',
            backgroundColor: 'var(--gov-saffron-light)',
            border: '1px solid var(--gov-saffron-border)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--gov-saffron)', textTransform: 'uppercase' }}>
                Headline (133.79) − Core (112.94)
              </div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
                Walk-Up Surge Spread (Dynamic Markup)
              </div>
            </div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--gov-saffron)' }}>
              +20.85 pts (+18.46%)
            </div>
          </div>
        </div>
      </div>

      {/* Why T+1 and T+7 are Excluded */}
      <div className="card">
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '10px' }}>
          Why Does PUSHPAK Core Exclude T+1 and T+7?
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '14px' }}>
          The Core Index focuses on relatively more stable booking horizons: <strong>T+15, T+30, and T+45</strong>. It excludes <strong>T+1 and T+7</strong> because near-term bookings experience severe dynamic yield management caused by:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '12px', backgroundColor: '#fafbfc', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
            <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-primary)', marginBottom: '4px' }}>1. Traveler Urgency</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Emergency medical, legal, and last-minute corporate travelers exhibit highly inelastic demand.</div>
          </div>
          <div style={{ padding: '12px', backgroundColor: '#fafbfc', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
            <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-primary)', marginBottom: '4px' }}>2. Seat Inventory Scarcity</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>As flight departure approaches, remaining seat capacity diminishes, causing algorithmic price ramps.</div>
          </div>
          <div style={{ padding: '12px', backgroundColor: '#fafbfc', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
            <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-primary)', marginBottom: '4px' }}>3. Dynamic Yield Algorithms</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Automated revenue management systems escalate fares independent of underlying aircraft operating costs.</div>
          </div>
        </div>

        {/* Clear Institutional Notice */}
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          backgroundColor: '#ffffff',
          borderRadius: '6px',
          border: '1px solid var(--gov-navy-border)',
          fontSize: '12px',
          color: 'var(--gov-navy)',
          lineHeight: '1.5'
        }}>
          <strong>Statistical Boundary Notice: </strong>
          The Core Index does NOT mean these prices are "official inflation." It is a PUSHPAK prototype analytical measure designed to separate near-term surge behaviour from broader underlying capacity fare movements.
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
          <span>View Headline Index (133.79)</span>
        </button>

        <button
          onClick={() => openTab({
            id: 'metric-spread',
            type: 'surge-spread',
            title: 'Surge Spread (+20.85)',
            titleHi: 'वॉक-अप वृद्धि अंतर'
          })}
          className="route-btn"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: 'var(--gov-saffron)', color: '#ffffff', border: 'none' }}
        >
          <Flame size={15} />
          <span>Analyze Walk-Up Surge Spread (+20.85 pts)</span>
        </button>

        <button
          onClick={() => openTab({
            id: 'formula-laspeyres',
            type: 'formula',
            title: 'Laspeyres Calculation',
            titleHi: 'लास्पेरेस गणना'
          })}
          className="route-btn"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px' }}
        >
          <Calculator size={15} color="var(--gov-navy)" />
          <span>Explore Formula Specifications</span>
        </button>
      </div>

      <DisclaimerBanner />
    </div>
  );
}
