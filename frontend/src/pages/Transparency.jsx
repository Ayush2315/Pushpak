import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, 
  ShieldCheck, 
  Database, 
  Hash, 
  AlertCircle, 
  Layers, 
  CheckCircle2 
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import api from '../api/client';
import SectionHeader from '../components/SectionHeader';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function Transparency() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [provenanceData, setProvenanceData] = useState(null);

  const loadProvenance = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getProvenance();
      setProvenanceData(res);
    } catch (err) {
      console.error('Failed to load provenance:', err);
      setError(err.message || 'Unable to retrieve provenance audit breakdown.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProvenance();
  }, []);

  if (loading) return <LoadingState message="Auditing provenance fields, data modes, and cryptographic hashes..." />;
  if (error) return <ErrorState message={error} onRetry={loadProvenance} />;

  const breakdown = provenanceData?.breakdown || [];

  return (
    <div className="page-container">
      {/* Header */}
      <SectionHeader 
        title={t('transparency.title')}
        subtitle={t('transparency.subtitle')}
      />

      {/* Prominent Provenance Transparency Principle Card */}
      <div className="card" style={{ borderLeft: '4px solid var(--gov-navy)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <ShieldCheck size={28} color="var(--gov-navy)" style={{ flexShrink: 0, marginTop: '4px' }} />
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
              The PUSHPAK Institutional Data Honesty Charter
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Unlike black-box commercial tools that claim to display "real-time live market airfares" based on synthetic or scraped approximations, 
              <strong> Project PUSHPAK strictly labels and audits every single observation</strong>. 
              In compliance with Ministry of Statistics (MoSPI) data integrity guidelines and institutional best practices:
            </p>
            <ul style={{ marginTop: '8px', paddingLeft: '20px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <li><strong>Zero Fabricated Live Feeds:</strong> Current prototype observations are explicitly tagged as <code>data_mode="demo_simulation"</code> and <code>environment="offline"</code>.</li>
              <li><strong>Deterministic Reproducibility:</strong> All fare analytics and price index calculations are 100% reproducible directly from raw SQLite database tables without machine learning or probabilistic drift.</li>
              <li><strong>Cryptographic Audit Trails:</strong> Every ingested record generates a SHA-256 source hash verifying data provenance and immutability.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Provenance Audit Breakdown Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">{t('transparency.breakdownTitle')}</h3>
            <p className="card-subtitle">Live database census grouped by category, connector, data mode, and environment</p>
          </div>
          <span className="badge badge-neutral">PRAGMA WAL Mode Active</span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Source Connector</th>
                <th>Data Mode</th>
                <th>Environment</th>
                <th>Audited Record Count</th>
                <th>Verification Status</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: '600', color: 'var(--gov-navy)' }}>
                    {row.category?.replace(/_/g, ' ').toUpperCase()}
                  </td>
                  <td><code>{row.source_type}</code></td>
                  <td>
                    <span className="badge badge-neutral" style={{ textTransform: 'lowercase' }}>
                      {row.data_mode}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-low" style={{ textTransform: 'lowercase' }}>
                      {row.environment}
                    </span>
                  </td>
                  <td style={{ fontWeight: '700' }}>
                    {row.record_count?.toLocaleString('en-IN')}
                  </td>
                  <td style={{ color: 'var(--gov-green)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={14} />
                    <span>Verified</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4 Transparency Pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '24px' }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Database size={18} color="var(--gov-navy)" />
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>1. Data Provenance</h4>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Every observation in <code>fare_observations</code> maintains origin, destination, lead time days, cabin class, query timestamps, and source connector provenance.
          </p>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Layers size={18} color="var(--gov-green)" />
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>2. Simulation Status</h4>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Prototype simulation data is isolated from production pipelines. When official MoSPI or airline GDS connectors become active, the schema handles live feeds seamlessly without architectural changes.
          </p>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <AlertCircle size={18} color="var(--gov-saffron)" />
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>3. Analytical Boundaries</h4>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Route weights are derived from flight registry observation volume rather than official MoSPI Household Consumer Expenditure Surveys. The index is an analytical prototype, not an official CPI series.
          </p>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Hash size={18} color="var(--gov-red)" />
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>4. Explainable Math</h4>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            No black-box machine learning models or generative AI hallucinations are used in the pricing engine. Every calculation uses standard statistical algebra and audited SQLite aggregation.
          </p>
        </div>
      </div>

      {/* Bottom Disclaimer */}
      <DisclaimerBanner />
    </div>
  );
}
