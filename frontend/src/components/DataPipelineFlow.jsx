import React from 'react';
import { 
  Database, 
  ShieldCheck, 
  Layers, 
  TrendingUp, 
  Calculator, 
  ShieldAlert, 
  Terminal, 
  ArrowRight,
  Info,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useWorkspace } from '../hooks/useWorkspace';

export default function DataPipelineFlow() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const { openContextualWindow } = useWorkspace();
  const isHi = lang === 'hi';

  const pipelineStages = [
    {
      step: 1,
      name: isHi ? 'किराया डेटा अधिग्रहण' : 'Acquire Fare Data',
      desc: isHi ? 'दर-सीमा एवं रोबोट नीतियों सहित बहु-कैरियर उद्धरण प्राप्ति' : 'Multi-carrier quotation extraction respecting rate-limits & ethical policies',
      dataset: 'demo',
      datasetLabel: isHi ? '🔵 प्रदर्शन अधिग्रहण' : '🔵 Demo Acquisition',
      targetPath: '/acquisition-lab',
      conceptId: 'validation',
      conceptTitle: 'Airfare Acquisition Engine'
    },
    {
      step: 2,
      name: isHi ? 'सत्यापन एवं सामान्यीकरण' : 'Validate & Clean',
      desc: isHi ? 'वित्तीय गैर-नकारात्मकता, आईएटीए कोड एवं कम्पोजिट डी-डुप्लीकेशन' : 'Financial sanity checks, IATA format rules & deterministic deduplication',
      dataset: 'demo',
      datasetLabel: isHi ? '🔵 प्रदर्शन अधिग्रहण' : '🔵 Demo Acquisition',
      targetPath: '/acquisition-lab',
      conceptId: 'deduplication',
      conceptTitle: 'Deterministic Deduplication'
    },
    {
      step: 3,
      name: isHi ? 'स्वच्छ डेटाबेस एवं हैश' : 'Store Clean Observations',
      desc: isHi ? 'स्वीकृत रिकॉर्ड्स का पृथक्करण एवं SHA-256 क्रिप्टोग्राफ़िक ऑडिट हैश' : 'Isolated verified observation store & 256-bit SHA-256 provenance digest',
      dataset: 'demo',
      datasetLabel: isHi ? '🔵 प्रदर्शन अधिग्रहण' : '🔵 Demo Acquisition',
      targetPath: '/acquisition-lab',
      conceptId: 'provenance',
      conceptTitle: 'Cryptographic Provenance'
    },
    {
      step: 4,
      name: isHi ? 'किराया आसूचना विश्लेषण' : 'Analyze Fare Intelligence',
      desc: isHi ? 'गलियारा औसत, मध्यिका, मानक विचलन एवं अग्रिम खरीद उपज वक्र' : 'Corridor sample mean, median, standard deviation & advance booking yield curves',
      dataset: 'audit',
      datasetLabel: isHi ? '🟢 ऑडिटेड विश्लेषणात्मक' : '🟢 Audited Analytical',
      targetPath: '/intelligence',
      conceptId: 'price-relatives',
      conceptTitle: 'Price Relatives (R_i)'
    },
    {
      step: 5,
      name: isHi ? 'मूल्य सूचकांक निर्माण' : 'Construct Price Index',
      desc: isHi ? 'लास्पेयर्स हेडलाइन (T+1 से T+45) बनाम कोर सूचकांक (T+15+) एवं सर्ज स्प्रेड' : 'Laspeyres Headline Index vs Core Index & quantified Walk-Up Surge Spread',
      dataset: 'audit',
      datasetLabel: isHi ? '🟢 ऑडिटेड विश्लेषणात्मक' : '🟢 Audited Analytical',
      targetPath: '/price-index',
      conceptId: 'pushpak-index',
      conceptTitle: 'Laspeyres Price Index (I_t)'
    },
    {
      step: 6,
      name: isHi ? 'नीति संकेत उत्पादन' : 'Generate Policy Signals',
      desc: isHi ? 'सर्ज स्प्रेड >15% एवं उच्च अस्थिरता पर स्वचालित विनियामक चेतावनियां' : 'Automated deterministic signals on severe walk-up surges & route concentration',
      dataset: 'audit',
      datasetLabel: isHi ? '🟢 ऑडिटेड विश्लेषणात्मक' : '🟢 Audited Analytical',
      targetPath: '/policy',
      conceptId: 'route-weighting',
      conceptTitle: 'Route Weighting (w_i)'
    },
    {
      step: 7,
      name: isHi ? 'संस्थागत एपीआई प्रसार' : 'Expose Institutional API',
      desc: isHi ? 'डीजीसीए, एमओसीए एवं आरबीआई हेतु ओपनएपीआई 3.1 मशीन-पठनीय एंडपॉइंट्स' : 'OpenAPI 3.1 machine-readable feeds for DGCA, MoCA & RBI macroeconomic consumption',
      dataset: 'audit',
      datasetLabel: isHi ? '🟢 संस्थागत परत' : '🟢 Institutional Layer',
      targetPath: '/institutional-api',
      conceptId: 'clean-fare-database',
      conceptTitle: 'Institutional Data Feeds'
    }
  ];

  const handleStageClick = (stage) => {
    navigate(stage.targetPath);
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #cbd5e1',
      borderRadius: '12px',
      padding: '1.75rem 2rem',
      boxShadow: '0 2px 10px -2px rgba(15, 23, 42, 0.06)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem'
    }}>
      {/* Header & Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '0.2rem 0.65rem',
              backgroundColor: '#f0fdf4',
              color: '#166534',
              border: '1px solid #bbf7d0',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '800',
              letterSpacing: '0.04em'
            }}>
              {isHi ? 'संपूर्ण डेटा-से-निर्णय यात्रा' : 'END-TO-END SYSTEM FLOW'}
            </span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px' }}>
            {isHi ? 'पुष्पक डेटा-से-निर्णय पाइपलाइन' : 'PUSHPAK Data-to-Decision Pipeline'}
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#475569', margin: 0, maxWidth: '850px', lineHeight: '1.5' }}>
            {isHi
              ? 'वायु किराया अधिग्रहण से विनियामक नीति और सरकारी एपीआई प्रसार तक का एकीकृत प्रवाह। किसी भी चरण पर क्लिक करके संबंधित पृष्ठ का अन्वेषण करें।'
              : 'Interactive end-to-end data pipeline from raw fare acquisition through statistical cleaning, Laspeyres index formulation, deterministic policy signaling, and institutional API consumption.'}
          </p>
        </div>
      </div>

      {/* 7-Step Interactive Pipeline Flow Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '0.85rem'
      }}>
        {pipelineStages.map((stage, idx) => {
          const isDemo = stage.dataset === 'demo';
          return (
            <div
              key={stage.step}
              onClick={() => handleStageClick(stage)}
              style={{
                backgroundColor: isDemo ? '#f8fafc' : '#f0fdfa',
                border: isDemo ? '1px solid #cbd5e1' : '1px solid #99f6e4',
                borderRadius: '10px',
                padding: '1rem 0.9rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(15, 23, 42, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              title={isHi ? `क्लिक करें → ${stage.name} पर जाएं` : `Click to inspect: ${stage.name}`}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    color: isDemo ? '#475569' : '#0f766e',
                    backgroundColor: isDemo ? '#e2e8f0' : '#ccfbf1',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px'
                  }}>
                    #{stage.step}
                  </span>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: '700',
                    color: isDemo ? '#0284c7' : '#15803d'
                  }}>
                    {stage.datasetLabel}
                  </span>
                </div>

                <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem', lineHeight: '1.3' }}>
                  {stage.name}
                </div>

                <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.35', marginBottom: '0.75rem' }}>
                  {stage.desc}
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                fontWeight: '700',
                color: isDemo ? '#0f766e' : '#0f766e',
                marginTop: 'auto'
              }}>
                <span>{isHi ? 'खोलें' : 'Open'}</span>
                <ChevronRight size={13} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Data Honesty Disclosure Callout */}
      <div style={{
        padding: '0.75rem 1rem',
        backgroundColor: '#f8fafc',
        borderLeft: '3px solid #0f766e',
        borderRadius: '0 6px 6px 0',
        fontSize: '0.8rem',
        color: '#334155',
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem'
      }}>
        <Info size={16} style={{ color: '#0f766e', flexShrink: 0 }} />
        <span>
          <strong>{isHi ? 'डेटा सत्यनिष्ठा एवं पृथक्करण गारंटी: ' : 'Data Separation & Reproducibility Guarantee: '}</strong>
          {isHi
            ? 'अधिग्रहण प्रदर्शन पुष्पक की इनजेशन वास्तुकला को सत्यापित करता है। प्रतिनिधि मूल्य सूचकांक पुनरुत्पादक और ऑडिट योग्य गणनाओं हेतु ऑडिटेड विश्लेषणात्मक डेटासेट का उपयोग जारी रखता है।'
            : "The acquisition demonstration validates PUSHPAK's ingestion architecture. The representative price index continues to use the audited analytical dataset for reproducible calculations."}
        </span>
      </div>
    </div>
  );
}
