import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Activity, 
  CalendarClock, 
  Users, 
  Lightbulb, 
  BarChart2, 
  ShieldCheck 
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import api from '../api/client';
import SectionHeader from '../components/SectionHeader';
import RouteSelector from '../components/RouteSelector';
import BookingWindowChart from '../components/charts/BookingWindowChart';
import AirlineComparisonChart from '../components/charts/AirlineComparisonChart';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function Intelligence() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [availableRoutes, setAvailableRoutes] = useState(['DEL-BOM', 'DEL-BLR', 'BOM-BLR']);
  const [selectedRoute, setSelectedRoute] = useState('DEL-BOM');

  const [routeIntelligence, setRouteIntelligence] = useState(null);
  const [bookingWindows, setBookingWindows] = useState([]);
  const [airlineComparison, setAirlineComparison] = useState([]);

  // Load available routes
  useEffect(() => {
    const fetchRouteList = async () => {
      try {
        const routesRes = await api.getRoutes(50, 0);
        if (routesRes?.items && routesRes.items.length > 0) {
          // Prioritize routes that have fare observations
          const codes = routesRes.items.map(r => r.route_code);
          const fareBasket = ['DEL-BOM', 'DEL-BLR', 'BOM-BLR'];
          const combined = Array.from(new Set([...fareBasket, ...codes]));
          setAvailableRoutes(combined.slice(0, 6));
        }
      } catch (err) {
        console.warn('Could not load routes list, using default basket:', err);
      }
    };
    fetchRouteList();
  }, []);

  // Load route-specific intelligence
  const loadRouteData = async (route) => {
    try {
      setLoading(true);
      setError(null);

      const [intelRes, bwRes, compRes] = await Promise.all([
        api.getRouteIntelligence(route),
        api.getBookingWindows(route),
        api.getAirlineComparison(route),
      ]);

      setRouteIntelligence(intelRes);
      setBookingWindows(bwRes?.booking_windows || []);
      setAirlineComparison(compRes?.airlines || []);
    } catch (err) {
      console.error(`Failed to load intelligence for ${route}:`, err);
      setError(err.message || `No fare observations found for route ${route}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRoute) {
      loadRouteData(selectedRoute);
    }
  }, [selectedRoute]);

  const stats = routeIntelligence?.statistics;
  const volatility = routeIntelligence?.volatility;
  const insights = routeIntelligence?.deterministic_insights || [];

  return (
    <div className="page-container">
      {/* Page Header */}
      <SectionHeader 
        title={t('intelligence.title')}
        subtitle={t('intelligence.subtitle')}
      />

      {/* Corridor Selector */}
      <RouteSelector 
        routes={availableRoutes}
        selectedRoute={selectedRoute}
        onSelectRoute={setSelectedRoute}
      />

      {loading ? (
        <LoadingState message={`Fetching statistical intelligence for corridor ${selectedRoute}...`} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadRouteData(selectedRoute)} />
      ) : (
        <>
          {/* Statistical Distribution Overview Cards */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  {selectedRoute} — Statistical Fare Distribution
                </h3>
                <p className="card-subtitle">
                  {routeIntelligence?.route?.source_city} ({routeIntelligence?.route?.origin_code}) to {routeIntelligence?.route?.destination_city} ({routeIntelligence?.route?.destination_code}) • {stats?.observation_count} verified observations
                </p>
              </div>

              {/* Volatility Badge */}
              <div style={{ textAlign: 'right' }}>
                <span className={`badge ${
                  volatility?.volatility_class === 'HIGH_VARIATION' ? 'badge-high' :
                  volatility?.volatility_class === 'MODERATE_VARIATION' ? 'badge-monitor' : 'badge-low'
                }`}>
                  {volatility?.volatility_class?.replace(/_/g, ' ')}
                </span>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
                  CV: {volatility?.coefficient_of_variation_pct}%
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Mean Fare
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
                  ₹{stats?.mean_fare?.toLocaleString('en-IN')}
                </div>
              </div>

              <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Median Fare
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
                  ₹{stats?.median_fare?.toLocaleString('en-IN')}
                </div>
              </div>

              <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Fare Range
                </div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
                  ₹{stats?.min_fare?.toLocaleString('en-IN')} - ₹{stats?.max_fare?.toLocaleString('en-IN')}
                </div>
              </div>

              <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Std Deviation
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
                  ₹{stats?.std_dev?.toLocaleString('en-IN')}
                </div>
              </div>

              <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Spread Span
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--gov-saffron)', marginTop: '2px' }}>
                  ₹{stats?.fare_range?.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Section: Yield Curve + Airline Comparison */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            {/* Advance Booking Window Yield Curve */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">{t('intelligence.bookingWindowTitle')}</h3>
                  <p className="card-subtitle">Fare yield trajectory across planning horizons (T+45 advance down to T+1 walk-up)</p>
                </div>
              </div>

              <BookingWindowChart data={bookingWindows} />
            </div>

            {/* Airline Price Comparison */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">{t('intelligence.airlineCompTitle')}</h3>
                  <p className="card-subtitle">Average fares by carrier operating on corridor {selectedRoute}</p>
                </div>
              </div>

              <AirlineComparisonChart 
                data={airlineComparison} 
                routeAvgFare={stats?.mean_fare}
              />
            </div>
          </div>

          {/* Deterministic Statistical Insights */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lightbulb size={18} color="var(--gov-saffron)" />
                <div>
                  <h3 className="card-title">{t('intelligence.insightsTitle')}</h3>
                  <p className="card-subtitle">Explainable rules-based intelligence derived from audited observations</p>
                </div>
              </div>
              <span className="badge badge-neutral">Deterministic Math</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {insights.map((insight, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#fafbfc',
                    border: '1px solid var(--border-light)',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}
                >
                  <span style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--gov-navy-light)',
                    color: 'var(--gov-navy)',
                    fontSize: '11px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '1px'
                  }}>
                    {idx + 1}
                  </span>
                  <span style={{ lineHeight: '1.5' }}>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Disclaimers */}
      <DisclaimerBanner />
    </div>
  );
}
