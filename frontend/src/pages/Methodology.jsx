import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Database, 
  Binary, 
  Activity, 
  Compass, 
  ShieldAlert, 
  TrendingUp, 
  ArrowRight,
  BookOpen,
  Info,
  Calculator,
  ExternalLink
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useWorkspace } from '../hooks/useWorkspace';
import api from '../api/client';
import SectionHeader from '../components/SectionHeader';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function Methodology() {
  const { lang, t } = useLanguage();
  const { openContextualWindow } = useWorkspace();
  const isHi = lang === 'hi';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [methodology, setMethodology] = useState(null);

  useEffect(() => {
    const fetchMethodology = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getIndexMethodology();
        setMethodology(data);
      } catch (err) {
        console.error('Failed to load methodology metadata:', err);
        setError(err.message || 'Unable to retrieve methodology specifications.');
      } finally {
        setLoading(false);
      }
    };
    fetchMethodology();
  }, []);

  if (loading) return <LoadingState message={isHi ? "औपचारिक गणितीय एवं सांख्यिकीय विनिर्देश लोड हो रहे हैं..." : "Loading formal mathematical and statistical methodology specifications..."} />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const pipelineSteps = [
    { number: '1', title: isHi ? 'डेटा अधिग्रहण' : 'Data Ingestion', desc: isHi ? 'M0A: क्रिप्टोग्राफ़िक हैशिंग' : 'M0A: Ethical provenance & hashing', icon: Database },
    { number: '2', title: isHi ? 'उड़ान रजिस्ट्री' : 'Flight Registry', desc: isHi ? 'M0B: 50,000 सत्यापित रिकॉर्ड' : 'M0B: 50,000 verified flight records', icon: Binary },
    { number: '3', title: isHi ? 'किराया विश्लेषण' : 'Fare Analytics', desc: isHi ? 'M2: बुकिंग क्षितिज वितरण' : 'M2: Horizon pricing distributions', icon: Activity },
    { number: '4', title: isHi ? 'आसूचना' : 'Intelligence', desc: isHi ? 'M2: उपज वक्र एवं एयरलाइन रैंक' : 'M2: Booking windows & airline ranks', icon: Compass },
    { number: '5', title: isHi ? 'नीति संकेत' : 'Policy Signals', desc: isHi ? 'M3: निश्चित गलियारा ध्वज' : 'M3: Deterministic corridor flags', icon: ShieldAlert },
    { number: '6', title: isHi ? 'पुष्पक सूचकांक' : 'PUSHPAK Index', desc: isHi ? 'M4: लासपेयर्स हेडलाइन व कोर' : 'M4: Laspeyres-type Headline & Core', icon: TrendingUp },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <SectionHeader 
        title={t('methodology.title')}
        subtitle={t('methodology.subtitle')}
      />

      {/* Visual Architectural Pipeline Connecting All Milestones */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">{t('methodology.pipelineTitle')}</h3>
            <p className="card-subtitle">
              {isHi 
                ? 'मूल्यांकन हेतु मील के पत्थर M0A से M4 को जोड़ने वाला पूर्ण आर्किटेक्चरल प्रवाह'
                : 'End-to-end architectural flow connecting Milestones M0A through M4 for jury and government evaluation'}
            </p>
          </div>
        </div>

        <div className="methodology-pipeline">
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={idx}>
                <div className="pipeline-step">
                  <div className="pipeline-step-number">{step.number}</div>
                  <Icon size={18} color="var(--gov-navy)" style={{ marginBottom: '6px' }} />
                  <div className="pipeline-step-title">{step.title}</div>
                  <div className="pipeline-step-desc">{step.desc}</div>
                </div>
                {idx < pipelineSteps.length - 1 && (
                  <div className="pipeline-arrow">
                    <ArrowRight size={18} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Mathematical Methodology Specifications - Clean Unicode Notation */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">{t('methodology.mathTitle')}</h3>
            <p className="card-subtitle">
              {isHi 
                ? 'आईएलओ/आईएमएफ उपभोक्ता मूल्य सूचकांक मानकों के अनुरूप औपचारिक मूल्य सापेक्ष सूत्रीकरण'
                : 'Formal price relative formulation aligned with ILO/IMF Consumer Price Index standards'}
            </p>
          </div>
          <button
            id="open-formula-workspace-btn"
            onClick={() => openContextualWindow({
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
            <span>{isHi ? 'विस्तृत गणितीय वर्कस्पेस' : 'Open Formula Workspace'}</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          {/* Formula 1: Base Convention */}
          <div style={{ padding: '18px', backgroundColor: '#fafbfc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
              1. Base Period Convention (I₀ = 100.00)
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '10px' }}>
              {isHi
                ? 'प्रत्येक गलियारे के लिए संदर्भ मूल्य P(i,0) T+45 अग्रिम खरीद खिड़की पर स्थापित किया गया है, जो गतिशील उपज कमी लागू होने से पूर्व बुनियादी संरचनात्मक मूल्य निर्धारण को दर्शाता है:'
                : 'Reference price P(i,0) for each corridor is established at the T+45 advance purchase horizon, representing baseline structural pricing before dynamic yield scarcity surge takes effect:'}
            </p>
            <div style={{ padding: '10px', backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '4px', fontFamily: 'Consolas, Monaco, monospace', fontSize: '13px', color: 'var(--gov-navy)', fontWeight: '600' }}>
              P_(i,0) = Mean(Base Fare at T+45)
            </div>
          </div>

          {/* Formula 2: Corridor Price Relative */}
          <div style={{ padding: '18px', backgroundColor: '#fafbfc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
              2. Corridor Price Relatives R(i,t)
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '10px' }}>
              {isHi
                ? 'प्रतिनिधि रूट बास्केट में प्रत्येक गलियारे i के लिए, मूल्य सापेक्ष बेसलाइन संदर्भ के विरुद्ध मापे गए क्षितिजों में वर्तमान औसत किराए की तुलना करता है:'
                : 'For each corridor i in the representative route basket, the price relative compares current mean fare across measured horizons against the baseline reference:'}
            </p>
            <div style={{ padding: '10px', backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '4px', fontFamily: 'Consolas, Monaco, monospace', fontSize: '13px', color: 'var(--gov-navy)', fontWeight: '600' }}>
              R_(i,t) = P_(i,t) / P_(i,0)
            </div>
          </div>

          {/* Formula 3: Composite Index Aggregation */}
          <div style={{ padding: '18px', backgroundColor: '#fafbfc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
              3. Laspeyres-Type Weighted Aggregation
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '10px' }}>
              {isHi
                ? 'समग्र सूचकांक व्यक्तिगत गलियारा मूल्य सापेक्षों का सामान्यीकृत मात्रा-भारित अंकगणितीय योग है:'
                : 'The composite index is the normalized volume-weighted arithmetic sum of individual corridor price relatives:'}
            </p>
            <div style={{ padding: '10px', backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '4px', fontFamily: 'Consolas, Monaco, monospace', fontSize: '13px', color: 'var(--gov-navy)', fontWeight: '700' }}>
              Iₜ = Σ(wᵢ × Rᵢ) × 100
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
              {isHi
                ? 'जहाँ भारों का योग इकाई है: Σwᵢ = 1.0000 (DEL-BLR: 40.74%, DEL-BOM: 39.92%, BOM-BLR: 19.34%)।'
                : 'Where weights sum to unity: Σw_i = 1.0000 (DEL-BLR: 40.74%, DEL-BOM: 39.92%, BOM-BLR: 19.34%).'}
            </div>
          </div>

          {/* Formula 4: Headline vs Core Divergence */}
          <div style={{ padding: '18px', backgroundColor: '#fafbfc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
              4. The Walk-Up Surge Spread (Sₜ)
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '10px' }}>
              {isHi
                ? 'निकट-अवधि की बुकिंग (T+1, T+7) पर गतिशील मूल्य निर्धारण एल्गोरिदम द्वारा निकाले गए अलग मूल्य प्रीमियम की मात्रा निर्धारित करता है:'
                : 'Quantifies the isolated price premium extracted by dynamic pricing algorithms on near-term bookings (T+1, T+7):'}
            </p>
            <div style={{ padding: '10px', backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '4px', fontFamily: 'Consolas, Monaco, monospace', fontSize: '13px', color: 'var(--gov-saffron)', fontWeight: '700' }}>
              Surge Spread = Headline (133.79) − Core (112.94) = +20.85 pts (+18.46%)
            </div>
          </div>
        </div>
      </div>

      {/* CPI Augmentation & Current Prototype Limitations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* CPI Augmentation Vision */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              {isHi ? 'सांख्यिकी मंत्रालय (MoSPI) हेतु CPI संवर्धन भूमिका' : 'CPI Augmentation Role for MoSPI'}
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {isHi 
              ? 'आधिकारिक MoSPI उपभोक्ता मूल्य सूचकांक (CPI) गणनाओं में, हवाई किराए पारंपरिक रूप से असतत अंतरालों पर लिए जाते हैं, जिससे परिवहन उप-सूचकांकों में विलंब होता है। पुष्पक दर्शाता है कि कैसे उच्च-आवृत्ति एल्गोरिथम अनुक्रमण घरेलू हवाई किराए में पारदर्शी, निकट वास्तविक समय की आसूचना प्रदान करके परिवहन और संचार उपसमूह को संवर्धित कर सकता है।'
              : 'In official MoSPI Consumer Price Index (CPI) calculations, airfares are traditionally sampled at discrete, infrequent intervals, creating lag in high-volatility transport sub-indices. PUSHPAK demonstrates how high-frequency algorithmic indexing can augment the Transport & Communication subgroup by delivering transparent, near real-time intelligence on domestic passenger airfare movements.'}
          </p>
        </div>

        {/* Prototype Scope & Roadmap */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{t('methodology.limitationsTitle')}</h3>
          </div>
          <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {methodology?.limitations?.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '6px' }}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Disclaimers */}
      <DisclaimerBanner />
    </div>
  );
}
