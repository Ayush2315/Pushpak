import React from 'react';
import { 
  ShieldAlert, 
  ArrowDown, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Plane,
  ArrowRight
} from 'lucide-react';
import { useWorkspace } from '../../hooks/useWorkspace';
import { useLanguage } from '../../hooks/useLanguage';
import DisclaimerBanner from '../DisclaimerBanner';

export default function PolicyFlagWorkspace({ flagData }) {
  const { openTab } = useWorkspace();
  const { lang } = useLanguage();

  if (!flagData) {
    return (
      <div className="page-container">
        <div className="card">No policy flag data provided.</div>
      </div>
    );
  }

  const { flag_code, severity, route_code, title, explanation, underlying_metrics } = flagData;

  // Determine threshold logic based on flag_code
  let metricName = "Corridor Indicator";
  let observedVal = "Audit Evidence";
  let thresholdRule = "Pre-established Policy Benchmark";
  let interpretation = explanation;

  if (flag_code === "HIGH_VOLATILITY") {
    metricName = "Coefficient of Variation (CV)";
    observedVal = `${underlying_metrics?.cv_percent?.toFixed(2)}%`;
    thresholdRule = severity === "HIGH" ? "CV > 30.00% (High Volatility Benchmark)" : "15.00% <= CV <= 30.00% (Moderate Band)";
    interpretation = `The standard deviation of ₹${underlying_metrics?.sample_std_dev?.toFixed(2)} represents ${observedVal} of the ₹${underlying_metrics?.mean_fare?.toFixed(2)} mean fare. This indicates wide dispersion across booking horizons.`;
  } else if (flag_code === "HIGH_WALKUP_PREMIUM") {
    metricName = "Walk-Up Fare Premium ((T+1 - T+45) / T+45)";
    observedVal = `+${underlying_metrics?.walkup_premium_pct?.toFixed(1)}%`;
    thresholdRule = severity === "HIGH" ? "Markup > 60.0% over 45-day advance rate" : "Markup >= 25.0% over advance rate";
    interpretation = `Travelers booking 1 day before departure face a severe ${observedVal} premium over advance planners. This triggers automated supervisory monitoring.`;
  } else if (flag_code === "LIMITED_OBSERVED_COMPETITION") {
    metricName = "Operating Carrier Count";
    observedVal = `${underlying_metrics?.observed_carriers_count} Carriers`;
    thresholdRule = "Benchmark is >= 3 operating airlines";
    interpretation = `Fewer than 3 active carriers observed in the dataset. Concentrated route corridors exhibit lower pricing elasticity.`;
  } else if (flag_code === "SIGNIFICANT_PRICE_SPREAD") {
    metricName = "Inter-Carrier Price Spread";
    observedVal = `${underlying_metrics?.spread_pct?.toFixed(1)}% (₹${underlying_metrics?.spread_rupees?.toFixed(2)})`;
    thresholdRule = severity === "HIGH" ? "Spread > 35.0% of corridor average" : "Spread >= 15.0% of corridor average";
    interpretation = `Large pricing dispersion observed between competing carriers operating parallel flights on the same corridor.`;
  }

  return (
    <div className="page-container">
      {/* Flag Header */}
      <div className="card" style={{ borderLeft: `4px solid ${severity === 'HIGH' ? 'var(--gov-red)' : 'var(--gov-saffron)'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <ShieldAlert size={20} color={severity === 'HIGH' ? 'var(--gov-red)' : 'var(--gov-saffron)'} />
              <span className={`badge ${severity === 'HIGH' ? 'badge-high' : 'badge-monitor'}`}>
                {severity} SEVERITY POLICY SIGNAL
              </span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {route_code} — {title}
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              System Code: <code>{flag_code}</code> • Monitored Corridor: <strong>{route_code}</strong>
            </p>
          </div>

          <button
            onClick={() => openTab({
              id: `route-${route_code}`,
              type: 'route',
              routeCode: route_code,
              title: `Corridor: ${route_code}`,
              titleHi: `गलियारा: ${route_code}`
            })}
            className="route-btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: 'var(--gov-navy)', color: '#ffffff', border: 'none' }}
          >
            <Plane size={14} />
            <span>Open {route_code} Full Dossier</span>
          </button>
        </div>
      </div>

      {/* 5-Step Transparent Flow */}
      <div className="card" style={{ backgroundColor: '#fafbfc' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px', textAlign: 'center' }}>
          Transparent 5-Stage Policy Decision-Support Flow
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', maxWidth: '680px', margin: '0 auto' }}>
          {/* Step 1: Observed Metric */}
          <div style={{ width: '100%', padding: '14px 18px', backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--gov-navy)', textTransform: 'uppercase' }}>1. Evaluated Numerical Metric</div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '2px' }}>{metricName}</div>
          </div>

          <ArrowDown size={18} color="#94a3b8" />

          {/* Step 2: Observed Value */}
          <div style={{ width: '100%', padding: '14px 18px', backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--gov-saffron)', textTransform: 'uppercase' }}>2. Observed Empirical Value in Database</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>{observedVal}</div>
          </div>

          <ArrowDown size={18} color="#94a3b8" />

          {/* Step 3: Threshold Rule */}
          <div style={{ width: '100%', padding: '14px 18px', backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>3. Established Supervisory Benchmark</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginTop: '2px' }}>{thresholdRule}</div>
          </div>

          <ArrowDown size={18} color="#94a3b8" />

          {/* Step 4: Classification */}
          <div style={{ width: '100%', padding: '14px 18px', backgroundColor: severity === 'HIGH' ? 'var(--gov-red-light)' : 'var(--gov-saffron-light)', border: `1px solid ${severity === 'HIGH' ? 'var(--gov-red-border)' : 'var(--gov-saffron-border)'}`, borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: severity === 'HIGH' ? 'var(--gov-red)' : 'var(--gov-saffron)', textTransform: 'uppercase' }}>4. Automated Classification</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>{severity} SEVERITY ALERT TRIGGERED</div>
          </div>

          <ArrowDown size={18} color="#94a3b8" />

          {/* Step 5: Interpretation */}
          <div style={{ width: '100%', padding: '14px 18px', backgroundColor: '#ffffff', border: '2px solid var(--gov-navy-border)', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--gov-navy)', textTransform: 'uppercase' }}>5. Analytical Interpretation</div>
            <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '2px', lineHeight: '1.5' }}>{interpretation}</div>
          </div>
        </div>
      </div>

      {/* Underlying Evidence Metrics Table */}
      {underlying_metrics && Object.keys(underlying_metrics).length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>
            Underlying Arithmetic Metrics Supporting This Flag
          </h3>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Metric Attribute</th>
                  <th>Observed Value</th>
                  <th>Verification Source</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(underlying_metrics).map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ fontWeight: '600', color: 'var(--gov-navy)' }}>{k.replace(/_/g, ' ').toUpperCase()}</td>
                    <td style={{ fontWeight: '700' }}>{typeof v === 'number' ? v.toFixed(2) : String(v)}</td>
                    <td style={{ color: 'var(--text-muted)' }}>audited SQLite fare_observations</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Institutional Advisory Heuristic Notice */}
      <div style={{
        padding: '14px 18px',
        backgroundColor: 'var(--gov-navy-light)',
        border: '1px solid var(--gov-navy-border)',
        borderRadius: 'var(--radius-md)',
        fontSize: '12px',
        color: 'var(--gov-navy)',
        lineHeight: '1.5',
        marginTop: '16px'
      }}>
        <strong>Advisory Heuristic Notice: </strong>
        These classifications and quantitative flags are PUSHPAK analytical decision-support heuristics. They do NOT constitute official DGCA, MoCA, or Government of India statutory regulations or punitive directives.
      </div>

      <DisclaimerBanner />
    </div>
  );
}
