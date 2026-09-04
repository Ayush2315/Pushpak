import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  CalendarClock, 
  Layers, 
  Flame, 
  ArrowRight, 
  Calculator, 
  ShieldCheck,
  Building2
} from 'lucide-react';
import { useWorkspace } from '../../hooks/useWorkspace';
import { useLanguage } from '../../hooks/useLanguage';
import api from '../../api/client';
import LoadingState from '../LoadingState';
import DisclaimerBanner from '../DisclaimerBanner';

export default function HeadlineIndexWorkspace() {
  const { openTab } = useWorkspace();
  const { lang, t } = useLanguage();
  const [headlineData, setHeadlineData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeadline = async () => {
      try {
        setLoading(true);
        const res = await api.getHeadlineIndex();
        setHeadlineData(res);
      } catch (err) {
        console.error('Failed to load headline index:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHeadline();
  }, []);

  if (loading) return <LoadingState message="Loading Headline Index dossier..." />;

  const indexVal = headlineData?.index_value ?? 133.79;
  const pctMovement = headlineData?.percentage_movement ?? 33.79;

  return (
    <div className="page-container">
      {/* Hero Box */}
      <div className="card" style={{ borderLeft: '4px solid var(--gov-navy)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <TrendingUp size={20} color="var(--gov-navy)" />
              <span className="badge badge-neutral" style={{ fontSize: '12px' }}>
                PUSHPAK-HEADLINE
              </span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {lang === 'hi' ? 'पुष्पक हेडलाइन हवाई किराया मूल्य सूचकांक' : 'PUSHPAK Headline Airfare Price Index'}
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Comprehensive measure of domestic airfare movement encompassing all observed booking horizons (T+1 to T+45).
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '38px', fontWeight: '800', color: 'var(--gov-navy)', letterSpacing: '-0.5px' }}>
              {indexVal.toFixed(2)}
            </div>
            <span className="metric-delta delta-up" style={{ fontSize: '13px' }}>
              +{pctMovement.toFixed(2)}% vs Base (100.00)
            </span>
          </div>
        </div>
      </div>

      {/* Non-Technical Executive Interpretation */}
      <div className="card" style={{ backgroundColor: '#fafbfc' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
          {lang === 'hi' ? 'साधारण आर्थिक व्याख्या' : 'Plain-Language Economic Interpretation'}
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          At <strong>{indexVal.toFixed(2)}</strong>, the measured domestic airfare basket across representative Indian trunk routes is currently 
          <strong> {pctMovement.toFixed(2)}% above the defined baseline reference</strong> (Base = 100.00 anchored to structural capacity fares booked 45 days in advance). 
          This index reflects total dynamic consumer out-of-pocket costs, capturing both advance discounted planning fares and extreme last-minute walk-up surge pricing.
        </p>
      </div>

      {/* Booking Horizons Included */}
      <div className="card">
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '14px' }}>
          Booking Horizons Included in Headline Measurement
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {[
            { tag: 'T+1', title: 'Walk-Up Pricing', desc: '1 day prior to departure (severe dynamic yield pressure)' },
            { tag: 'T+7', title: 'Near-Term Travel', desc: '7 days prior to departure (active commercial surge)' },
            { tag: 'T+15', title: 'Medium-Term Planning', desc: '15 days prior to departure (standard advance curve)' },
            { tag: 'T+30', title: 'Advance Purchase', desc: '30 days prior to departure (baseline seat inventory)' },
            { tag: 'T+45', title: 'Structural Benchmark', desc: '45 days prior to departure (reference base P_i,0 = 100)' },
          ].map((h) => (
            <div key={h.tag} style={{ padding: '14px', backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: '700', color: 'var(--gov-navy)', fontSize: '14px' }}>{h.tag}</span>
                <span className="badge badge-low" style={{ fontSize: '10px' }}>INCLUDED</span>
              </div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>{h.title}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.4' }}>{h.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Route Basket Contributions */}
      <div className="card">
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '14px' }}>
          Corridor Contributions to Headline Index
        </h3>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Corridor</th>
                <th>Volume Weight</th>
                <th>Base Fare (T+45)</th>
                <th>Current Mean Fare</th>
                <th>Price Relative</th>
                <th>Weighted Contribution</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {headlineData?.route_contributions?.map((r) => (
                <tr key={r.route_code}>
                  <td style={{ fontWeight: '700', color: 'var(--gov-navy)' }}>{r.route_code}</td>
                  <td>{(r.weight * 100).toFixed(2)}%</td>
                  <td>₹{r.base_fare?.toLocaleString('en-IN')}</td>
                  <td>₹{r.current_fare?.toLocaleString('en-IN')}</td>
                  <td style={{ fontWeight: '600' }}>{r.price_relative?.toFixed(4)}</td>
                  <td style={{ fontWeight: '700', color: 'var(--gov-navy)' }}>{r.weighted_contribution?.toFixed(2)}</td>
                  <td>
                    <button
                      onClick={() => openTab({
                        id: `route-${r.route_code}`,
                        type: 'route',
                        routeCode: r.route_code,
                        title: `Corridor: ${r.route_code}`,
                        titleHi: `गलियारा: ${r.route_code}`
                      })}
                      style={{
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: '600',
                        color: 'var(--gov-navy)',
                        backgroundColor: 'var(--gov-navy-light)',
                        border: '1px solid var(--gov-navy-border)',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Explore Route →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Related Explorations Action Row */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
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
          <span>Compare with Core Index (112.94)</span>
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
          <span>Examine Walk-Up Surge Spread (+20.85 pts)</span>
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
          <span>Understand Mathematical Formula</span>
        </button>
      </div>

      <DisclaimerBanner />
    </div>
  );
}
