import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Activity, 
  CalendarClock, 
  Users, 
  Lightbulb, 
  BarChart2, 
  ShieldCheck,
  TrendingUp,
  Calculator,
  ChevronRight,
  RefreshCw,
  Info,
  Building2,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useWorkspace } from '../hooks/useWorkspace';
import { useGuidedDemo } from '../context/GuidedDemoContext';
import api from '../api/client';
import SectionHeader from '../components/SectionHeader';
import RouteSelector from '../components/RouteSelector';
import BookingWindowChart from '../components/charts/BookingWindowChart';
import AirlineComparisonChart from '../components/charts/AirlineComparisonChart';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import DisclaimerBanner from '../components/DisclaimerBanner';

// City code to human-readable names mapping
const CITY_NAMES = {
  DEL: 'Delhi',
  BOM: 'Mumbai',
  BLR: 'Bengaluru',
  HYD: 'Hyderabad',
  CCU: 'Kolkata',
  MAA: 'Chennai',
  AMD: 'Ahmedabad',
  PNQ: 'Pune',
  GOI: 'Goa',
  COK: 'Kochi'
};

const CITY_NAMES_HI = {
  DEL: 'दिल्ली',
  BOM: 'मुम्बई',
  BLR: 'बेंगलुरु',
  HYD: 'हैदराबाद',
  CCU: 'कोलकाता',
  MAA: 'चेन्नई',
  AMD: 'अहमदाबाद',
  PNQ: 'पुणे',
  GOI: 'गोवा',
  COK: 'कोच्चि'
};

export default function Intelligence() {
  const { lang, t } = useLanguage();
  const { openContextualWindow } = useWorkspace();
  const { isDemoActive, currentStep, nextStep } = useGuidedDemo();
  const isHi = lang === 'hi';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Available routes with fare observations
  const [availableRoutes, setAvailableRoutes] = useState(['DEL-BOM', 'DEL-BLR', 'BOM-BLR']);
  const [selectedRoute, setSelectedRoute] = useState('DEL-BOM');

  const [routeIntelligence, setRouteIntelligence] = useState(null);
  const [bookingWindows, setBookingWindows] = useState([]);
  const [airlineComparison, setAirlineComparison] = useState([]);

  // Load available routes
  useEffect(() => {
    let isMounted = true;
    const fetchRouteList = async () => {
      try {
        const routesRes = await api.getRoutes(50, 0);
        if (isMounted && routesRes?.items && routesRes.items.length > 0) {
          const codes = routesRes.items.map(r => r.route_code);
          const fareBasket = ['DEL-BOM', 'DEL-BLR', 'BOM-BLR'];
          const combined = Array.from(new Set([...fareBasket, ...codes]));
          setAvailableRoutes(combined.slice(0, 6));
        }
      } catch (err) {
        console.warn('Could not load dynamic routes, maintaining basket:', err);
      }
    };
    fetchRouteList();
    return () => { isMounted = false; };
  }, []);

  // Load route-specific intelligence
  const loadRouteData = async (route) => {
    try {
      setLoading(true);
      setError(null);

      const [intelRes, bwRes, compRes] = await Promise.allSettled([
        api.getRouteIntelligence(route),
        api.getBookingWindows(route),
        api.getAirlineComparison(route),
      ]);

      if (intelRes.status === 'fulfilled' && intelRes.value) {
        const intel = intelRes.value;
        setRouteIntelligence(intel);

        // Fallback cascades for booking windows and airlines
        const bw = (bwRes.status === 'fulfilled' && bwRes.value?.booking_windows) || intel.booking_windows || [];
        setBookingWindows(bw);

        const comp = (compRes.status === 'fulfilled' && compRes.value?.airline_comparison) || intel.airline_comparison || [];
        setAirlineComparison(comp);
      } else {
        throw new Error(intelRes.reason?.message || `Unable to load intelligence for corridor ${route}`);
      }
    } catch (err) {
      console.error(`Failed to load intelligence for ${route}:`, err);
      setError(err.message || (isHi ? 'मार्ग विश्लेषण लोड करने में असमर्थ। कृपया पुनः प्रयास करें।' : 'Unable to load route analytics. Please retry.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRoute) {
      loadRouteData(selectedRoute);
    }
  }, [selectedRoute]);

  // Handle opening deterministic math panel
  const handleOpenDeterministicMath = () => {
    openContextualWindow({
      id: 'deterministic-math',
      title: 'Deterministic Mathematical Engine',
      titleHi: 'नियत गणितीय इंजन एवं कार्यप्रणाली',
      type: 'formula',
      data: {
        currentRoute: selectedRoute,
        explanation: 'Laspeyres index arithmetic and deterministic statistical formulation.'
      }
    });
  };

  // Extract unpacked properties
  const stats = routeIntelligence?.fare_summary || routeIntelligence?.statistics;
  const volatility = routeIntelligence?.classification || routeIntelligence?.volatility;
  const insights = routeIntelligence?.insights || routeIntelligence?.deterministic_insights || [];

  // Safe city name resolution
  const [originCode, destCode] = (selectedRoute || 'DEL-BOM').split('-');
  const originCity = isHi 
    ? (CITY_NAMES_HI[originCode] || originCode) 
    : (CITY_NAMES[originCode] || originCode);
  const destCity = isHi 
    ? (CITY_NAMES_HI[destCode] || destCode) 
    : (CITY_NAMES[destCode] || destCode);

  // Volatility and CV
  const cvValue = volatility?.cv_percent ?? stats?.coefficient_of_variation;
  const cvDisplay = cvValue != null && !isNaN(cvValue) ? `${Number(cvValue).toFixed(1)}%` : (isHi ? 'अनुपलब्ध' : 'Not available');
  const volatilityBand = volatility?.band || volatility?.volatility_class?.replace(/_/g, ' ') || 'Moderate Variation';

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Page Header */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '1.5rem 1.75rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{
                background: 'var(--gov-amber-light)',
                color: 'var(--gov-amber)',
                fontSize: '0.75rem',
                fontWeight: '700',
                padding: '3px 10px',
                borderRadius: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                {isHi ? 'किराया आसूचना एक्सप्लोरर' : 'Airfare Intelligence Explorer'}
              </span>
              <span className="badge badge-demo">
                {isHi ? 'ऑडिटेड डिमॉन्स्ट्रेशन प्रेक्षण' : 'Audited Demonstration Observations'}
              </span>
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 6px' }}>
              {t('intelligence.title')}
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '820px', lineHeight: '1.6' }}>
              {t('intelligence.subtitle')}
            </p>
          </div>

          {/* Top Interactive Deterministic Math Button */}
          <button
            type="button"
            onClick={handleOpenDeterministicMath}
            className="btn btn-secondary"
            title={isHi ? 'नियत गणितीय कार्यप्रणाली देखें' : 'Click to inspect Deterministic Mathematical Engine'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: '700',
              background: '#ffffff',
              border: '1.5px solid var(--gov-amber)',
              color: 'var(--gov-amber)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--gov-amber-light)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
            }}
          >
            <Calculator size={16} />
            <span>{isHi ? 'नियत गणितीय कार्यप्रणाली ↗' : 'DETERMINISTIC MATH ↗'}</span>
          </button>
        </div>
      </div>

      {/* Guided Demo Step 3 Banner */}
      {isDemoActive && currentStep === 3 && (
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
          boxShadow: '0 4px 12px rgba(15, 118, 110, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle2 size={20} color="#5eead4" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: '800', fontSize: '0.92rem' }}>
                {isHi ? 'चरण 3: गलियारा किराया आसूचना एवं मूल्य सांख्यिकी' : 'Step 3: Corridor Fare Intelligence & Dispersion Analysis'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#ccfbf1' }}>
                {isHi ? 'सांख्यिकीय विश्लेषण (Mean, Median, σ) और अग्रिम खरीद वक्र का अवलोकन किया गया। अब मूल्य सूचकांक की ओर बढ़ें।' : 'Statistical fare dispersion, yield curves, and airline spread analyzed. Proceed to Airfare Price Index.'}
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
            <span>{isHi ? 'मूल्य सूचकांक पर आगे बढ़ें →' : 'Continue to Price Index →'}</span>
          </button>
        </div>
      )}

      {/* Corridor Selector */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        padding: '1rem 1.25rem'
      }}>
        <RouteSelector 
          routes={availableRoutes}
          selectedRoute={selectedRoute}
          onSelectRoute={setSelectedRoute}
        />
      </div>

      {loading ? (
        <LoadingState message={isHi ? `गलियारा ${selectedRoute} के लिए सांख्यिकीय आसूचना लोड हो रही है...` : `Fetching statistical intelligence for corridor ${selectedRoute}...`} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadRouteData(selectedRoute)} />
      ) : (
        <>
          {/* Statistical Distribution Overview Card */}
          <div className="card" style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.5rem' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 className="card-title" style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 4px' }}>
                  {selectedRoute} — {isHi ? 'सांख्यिकीय किराया वितरण' : 'Statistical Fare Distribution'}
                </h3>
                <p className="card-subtitle" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                  {originCity} ({originCode}) → {destCity} ({destCode}) • {stats?.observation_count != null ? stats.observation_count.toLocaleString('en-IN') : '45'} {isHi ? 'सत्यापित प्रेक्षण' : 'verified observations'}
                </p>
              </div>

              {/* Volatility Badge */}
              <div style={{ textAlign: 'right' }}>
                <span className={`badge ${
                  volatilityBand === 'High Variation' ? 'badge-high' :
                  volatilityBand === 'Moderate Variation' ? 'badge-monitor' : 'badge-low'
                }`} style={{ fontSize: '0.8rem', padding: '4px 10px', fontWeight: '700' }}>
                  {volatilityBand}
                </span>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '600' }}>
                  CV: {cvDisplay}
                </div>
              </div>
            </div>

            {/* 5 Core Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px' }}>
              <div style={{ padding: '14px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {isHi ? 'औसत किराया (Mean)' : 'Mean Fare'}
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {stats?.mean_fare != null ? `₹${Math.round(stats.mean_fare).toLocaleString('en-IN')}` : '₹--'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {isHi ? 'अंकगणितीय औसत' : 'Sample arithmetic mean'}
                </div>
              </div>

              <div style={{ padding: '14px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {isHi ? 'मध्यिका किराया (Median)' : 'Median Fare'}
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {stats?.median_fare != null ? `₹${Math.round(stats.median_fare).toLocaleString('en-IN')}` : '₹--'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {isHi ? '50वां प्रतिशतक' : '50th percentile rank'}
                </div>
              </div>

              <div style={{ padding: '14px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {isHi ? 'किराया सीमा (Range)' : 'Fare Range'}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {stats?.min_fare != null && stats?.max_fare != null 
                    ? `₹${Math.round(stats.min_fare).toLocaleString('en-IN')} – ₹${Math.round(stats.max_fare).toLocaleString('en-IN')}` 
                    : '₹--'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {isHi ? 'न्यूनतम से अधिकतम' : 'Min to peak observed'}
                </div>
              </div>

              <div style={{ padding: '14px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {isHi ? 'मानक विचलन (Std Dev)' : 'Standard Deviation'}
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {stats?.std_dev != null ? `₹${Math.round(stats.std_dev).toLocaleString('en-IN')}` : '₹--'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {isHi ? 'मूल्य बिखराव माप (σ)' : 'Pricing dispersion (σ)'}
                </div>
              </div>

              <div style={{ padding: '14px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--gov-amber)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {isHi ? 'प्रसार अंतर (Spread Span)' : 'Spread Span'}
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--gov-amber)', marginTop: '4px' }}>
                  {stats?.fare_range != null ? `₹${Math.round(stats.fare_range).toLocaleString('en-IN')}` : '₹--'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {isHi ? 'अधिकतम - न्यूनतम अंतर' : 'Max minus min span'}
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Section: Yield Curve + Airline Comparison */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '20px' }}>
            {/* Advance Booking Window Yield Curve */}
            <div className="card" style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem 1.5rem' }}>
              <div className="card-header" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CalendarClock size={18} color="var(--gov-amber)" />
                  <div>
                    <h3 className="card-title" style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                      {t('intelligence.bookingWindowTitle')}
                    </h3>
                    <p className="card-subtitle" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                      {isHi 
                        ? 'अग्रिम खरीद विश्लेषण दर्शाता है कि प्रस्थान तिथि निकट आने पर किराया कैसे बढ़ता है (T+45 से T+1)'
                        : 'Advance-purchase analysis shows how average observed fares change from early booking windows toward near-departure walk-up purchases.'}
                    </p>
                  </div>
                </div>
              </div>

              <BookingWindowChart data={bookingWindows} />

              <div style={{
                marginTop: '12px',
                padding: '10px 12px',
                borderRadius: '6px',
                background: 'var(--bg-subtle)',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.5'
              }}>
                <strong>{isHi ? 'उपज वक्र अंतर्दृष्टि:' : 'Yield Curve Analysis:'} </strong>
                {isHi
                  ? 'T+45 और T+30 संरचनात्मक क्षमता मूल्य निर्धारण दर्शाते हैं, जबकि T+1 और T+7 में अंतिम समय की सीट कमी के कारण सर्ज प्रीमियम दिखाई देता है।'
                  : 'T+45 and T+30 establish baseline structural capacity fares, while T+1 and T+7 capture acute walk-up scarcity premiums as seat inventory closes.'}
              </div>
            </div>

            {/* Airline Price Comparison & Dispersion */}
            <div className="card" style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem 1.5rem' }}>
              <div className="card-header" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={18} color="var(--gov-teal)" />
                  <div>
                    <h3 className="card-title" style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                      {t('intelligence.airlineCompTitle')}
                    </h3>
                    <p className="card-subtitle" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                      {isHi ? `गलियारा ${selectedRoute} पर सक्रिय एयरलाइनों का किराया फैलाव` : `Average and median fares by operating carrier on corridor ${selectedRoute}`}
                    </p>
                  </div>
                </div>
              </div>

              <AirlineComparisonChart 
                data={airlineComparison} 
                routeAvgFare={stats?.mean_fare}
              />

              {/* Detailed Airline Dispersion Table (Requirement 6) */}
              <div style={{ marginTop: '16px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.04em' }}>
                      <th style={{ padding: '8px 10px' }}>{isHi ? 'विमानन कंपनी' : 'Airline'}</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>{isHi ? 'औसत किराया' : 'Average Fare'}</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>{isHi ? 'मध्यिका' : 'Median'}</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>{isHi ? 'न्यूनतम - अधिकतम' : 'Range'}</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>{isHi ? 'प्रेक्षण' : 'Obs.'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {airlineComparison.length > 0 ? (
                      airlineComparison.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '8px 10px', fontWeight: '700', color: 'var(--text-primary)' }}>
                            {item.airline_name} ({item.airline_code})
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: 'var(--text-primary)' }}>
                            ₹{item.avg_fare?.toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                            ₹{(item.median_fare ?? item.avg_fare)?.toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--text-muted)' }}>
                            ₹{item.min_fare?.toLocaleString('en-IN')} – ₹{item.max_fare?.toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '600', color: 'var(--text-muted)' }}>
                            {item.observation_count}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                          {isHi ? 'इस मार्ग पर कोई विमानन तुलना डेटा उपलब्ध नहीं है।' : 'No airline comparison data available for this corridor.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Deterministic Statistical Insights */}
          <div className="card" style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem 1.5rem' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lightbulb size={18} color="var(--gov-amber)" />
                <div>
                  <h3 className="card-title" style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                    {t('intelligence.insightsTitle')}
                  </h3>
                  <p className="card-subtitle" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                    {isHi ? 'ऑडिटेड प्रेक्षणों से प्राप्त स्पष्ट, नियतात्मक नियम-आधारित आसूचना' : 'Explainable rules-based intelligence derived deterministically from audited observations'}
                  </p>
                </div>
              </div>

              {/* Interactive Deterministic Math Button right inside the card */}
              <button
                type="button"
                onClick={handleOpenDeterministicMath}
                className="btn btn-secondary"
                style={{
                  padding: '5px 12px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  color: 'var(--gov-amber)',
                  background: 'var(--gov-amber-light)',
                  border: '1px solid var(--gov-amber)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>{isHi ? 'नियत गणितीय विधि ↗' : 'DETERMINISTIC MATH ↗'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {insights.length > 0 ? (
                insights.map((insight, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.84rem',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      lineHeight: '1.5'
                    }}
                  >
                    <span style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--gov-amber-light)',
                      color: 'var(--gov-amber)',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '1px'
                    }}>
                      {idx + 1}
                    </span>
                    <span>{insight}</span>
                  </div>
                ))
              ) : (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {isHi ? 'इस गलियारे के लिए सांख्यिकीय अंतर्दृष्टि उत्पन्न हो रही है...' : 'Statistical insights derived deterministically from observation dataset.'}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Disclaimers */}
      <DisclaimerBanner />
    </div>
  );
}
