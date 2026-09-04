import React, { useState, useEffect } from 'react';
import { 
  Plane, 
  Activity, 
  ShieldAlert, 
  Compass, 
  Lightbulb, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { useWorkspace } from '../../hooks/useWorkspace';
import { useLanguage } from '../../hooks/useLanguage';
import api from '../../api/client';
import BookingWindowChart from '../charts/BookingWindowChart';
import AirlineComparisonChart from '../charts/AirlineComparisonChart';
import LoadingState from '../LoadingState';
import DisclaimerBanner from '../DisclaimerBanner';

export default function RouteWorkspace({ routeCode = 'DEL-BOM' }) {
  const { openTab } = useWorkspace();
  const { lang } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [intelData, setIntelData] = useState(null);
  const [bookingWindows, setBookingWindows] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [routePolicy, setRoutePolicy] = useState(null);

  useEffect(() => {
    const fetchRouteDossier = async () => {
      try {
        setLoading(true);
        const [intelRes, bwRes, compRes, policyRes] = await Promise.all([
          api.getRouteIntelligence(routeCode),
          api.getBookingWindows(routeCode),
          api.getAirlineComparison(routeCode),
          api.getRoutePolicy(routeCode),
        ]);

        setIntelData(intelRes);
        setBookingWindows(bwRes?.booking_windows || []);
        setAirlines(compRes?.airlines || []);
        setRoutePolicy(policyRes);
      } catch (err) {
        console.error(`Failed to load dossier for ${routeCode}:`, err);
      } finally {
        setLoading(false);
      }
    };
    fetchRouteDossier();
  }, [routeCode]);

  if (loading) return <LoadingState message={`Assembling deep analytical dossier for corridor ${routeCode}...`} />;

  const stats = intelData?.statistics;
  const vol = intelData?.volatility;
  const insights = intelData?.deterministic_insights || [];
  const flags = routePolicy?.flags || [];

  return (
    <div className="page-container">
      {/* Route Dossier Header */}
      <div className="card" style={{ borderLeft: '4px solid var(--gov-navy)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Plane size={20} color="var(--gov-navy)" />
              <span className="badge badge-neutral" style={{ fontSize: '12px' }}>
                CORRIDOR DOSSIER: {routeCode}
              </span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {intelData?.route?.source_city} ({intelData?.route?.origin_code}) → {intelData?.route?.destination_city} ({intelData?.route?.destination_code})
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              High-density domestic trunk corridor • {stats?.observation_count} audited fare records • {routePolicy?.observed_airlines_count || airlines.length} active carriers
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className={`badge ${
              routePolicy?.priority_classification?.priority_category === 'HIGH_ATTENTION' ? 'badge-high' :
              routePolicy?.priority_classification?.priority_category === 'MONITOR' ? 'badge-monitor' : 'badge-low'
            }`} style={{ fontSize: '12px', padding: '6px 12px' }}>
              Priority: {routePolicy?.priority_classification?.priority_category || 'MONITOR'}
            </span>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Volatility CV: {vol?.coefficient_of_variation_pct}%
            </div>
          </div>
        </div>
      </div>

      {/* 6 Key Statistical Distribution Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div style={{ padding: '14px', backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mean Fare</div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
            ₹{stats?.mean_fare?.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Total seat avg</div>
        </div>

        <div style={{ padding: '14px', backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Median Fare</div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
            ₹{stats?.median_fare?.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Typical 50th percentile</div>
        </div>

        <div style={{ padding: '14px', backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Min - Max Range</div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '6px' }}>
            ₹{stats?.min_fare?.toLocaleString('en-IN')} - ₹{stats?.max_fare?.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Spread: ₹{stats?.fare_range?.toLocaleString('en-IN')}</div>
        </div>

        <div style={{ padding: '14px', backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sample Std Dev</div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
            ₹{stats?.std_dev?.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Dispersion around mean</div>
        </div>

        <div style={{ padding: '14px', backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Coefficient of Var.</div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: vol?.volatility_class === 'HIGH_VARIATION' ? 'var(--gov-red)' : 'var(--gov-saffron)', marginTop: '2px' }}>
            {vol?.coefficient_of_variation_pct}%
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{vol?.volatility_class}</div>
        </div>
      </div>

      {/* Yield Curve + Airline Comparisons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Booking Window Yield Trajectory</h3>
              <p className="card-subtitle">Mean fare progression from 45-day planning to next-day walk-up</p>
            </div>
          </div>
          <BookingWindowChart data={bookingWindows} />
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Operating Airlines Comparison</h3>
              <p className="card-subtitle">Average fares by carrier operating on {routeCode}</p>
            </div>
          </div>
          <AirlineComparisonChart data={airlines} routeAvgFare={stats?.mean_fare} />
        </div>
      </div>

      {/* Policy Implications & Triggered Flags */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Supervisory Policy Assessment & Triggered Flags</h3>
            <p className="card-subtitle">Quantitative indicators triggering supervisory attention on this corridor</p>
          </div>
        </div>

        {flags.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            No active policy flags triggered on corridor {routeCode}. Corridor operating within normal historical bands.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {flags.map((flg, idx) => (
              <div 
                key={idx}
                style={{
                  padding: '14px 16px',
                  backgroundColor: '#fafbfc',
                  borderRadius: '6px',
                  border: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge ${flg.severity === 'HIGH' ? 'badge-high' : 'badge-monitor'}`}>
                      {flg.severity}
                    </span>
                    <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                      {flg.title}
                    </strong>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                    {flg.explanation}
                  </p>
                </div>

                <button
                  onClick={() => openTab({
                    id: `flag-${flg.flag_code}-${routeCode}`,
                    type: 'policy-flag',
                    flagData: flg,
                    title: `${routeCode}: ${flg.title}`,
                    titleHi: `${routeCode}: ${flg.title}`
                  })}
                  style={{
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: 'var(--gov-navy)',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Inspect Flag Evidence →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Deterministic Insights */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lightbulb size={18} color="var(--gov-saffron)" />
            <h3 className="card-title">Deterministic Insights</h3>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {insights.map((ins, idx) => (
            <div key={idx} style={{ padding: '10px 14px', backgroundColor: '#fafbfc', border: '1px solid var(--border-light)', borderRadius: '6px', fontSize: '13px', color: 'var(--text-primary)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ fontWeight: '700', color: 'var(--gov-navy)' }}>•</span>
              <span>{ins}</span>
            </div>
          ))}
        </div>
      </div>

      <DisclaimerBanner />
    </div>
  );
}
