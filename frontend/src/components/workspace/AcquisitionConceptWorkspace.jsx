import React from 'react';
import { 
  CheckCircle2, 
  Copy, 
  FileText, 
  ShieldCheck, 
  Database, 
  Calculator, 
  Scale, 
  TrendingUp, 
  AlertTriangle, 
  Code,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

export default function AcquisitionConceptWorkspace({ conceptId, data }) {
  const { lang } = useLanguage();
  const isHi = lang === 'hi';

  const concepts = {
    validation: {
      title: isHi ? 'सत्यापन इंजन एवं स्कीमा अखंडता' : 'Validation Engine & Schema Integrity',
      badge: isHi ? 'चरण 4: वित्तीय एवं स्कीमा सत्यापन' : 'Stage 4: Schema & Financial Rules',
      icon: CheckCircle2,
      accent: '#0f766e',
      summary: isHi
        ? 'पुष्पक वायु किराया प्रेक्षणों को केवल तभी स्वीकार करता है जब वे सख्त संरचनात्मक, भौगोलिक एवं वित्तीय संगति नियमों को पूरा करते हैं।'
        : 'PUSHPAK validates every acquired fare observation against strict structural, geographic, and financial consistency rules prior to database acceptance.',
      rules: [
        {
          rule: isHi ? 'अनिवार्य फ़ील्ड सत्यापन' : 'Mandatory Field Completeness',
          desc: isHi 
            ? 'origin, destination, route_code, carrier, flight_identifier, departure_date, fare_class सभी अनिवार्य हैं।' 
            : 'origin, destination, route_code, carrier, flight_identifier, departure_date, and fare_class must be non-empty strings.'
        },
        {
          rule: isHi ? 'आईआईटीए मार्ग संगति' : 'IATA Route & Code Consistency',
          desc: isHi 
            ? '3-अक्षरीय वैध विमानपत्तन कोड (उदा. DEL-BOM) की पुष्टि की जाती है।' 
            : 'Enforces standard 3-letter uppercase IATA airport codes; verifies route_code == origin-destination.'
        },
        {
          rule: isHi ? 'सख्त वित्तीय गैर-नकारात्मकता' : 'Strict Financial Non-Negativity',
          desc: isHi 
            ? 'बेस किराया > 0, कर/शुल्क >= 0, कुल किराया > 0 अनिवार्य है।' 
            : 'base_fare > 0, taxes >= 0, and total_fare > 0. Negative fares or negative airport taxes are rejected.'
        },
        {
          rule: isHi ? 'अंकगणितीय संगति सहिष्णुता' : 'Fare Breakdown Arithmetic Audit',
          desc: isHi 
            ? '| (बेस किराया + कर) - कुल किराया | <= ₹1.50 (राउंडिंग सहिष्णुता)।' 
            : '| (base_fare + taxes) - total_fare | <= ₹1.50 rounding tolerance to prevent corrupted price breakdowns.'
        }
      ],
      impact: isHi
        ? 'त्रुटिपूर्ण या अधूरी उड़ानों को सूचकांक गणना में प्रवेश करने से रोकता है, जिससे सीपीआई अनुमानों में कृत्रिम विचलन नहीं होता।'
        : 'Prevents corrupted records from distorting price relative distributions and avoids artificial CPI inflation spikes.'
    },

    deduplication: {
      title: isHi ? 'निर्धारक डुप्लीकेशन निष्कासन तंत्र' : 'Deterministic Deduplication Architecture',
      badge: isHi ? 'चरण 6: दोहराव पहचान' : 'Stage 6: Duplicate Prevention',
      icon: Copy,
      accent: '#c2410c',
      summary: isHi
        ? 'एक ही उड़ान और किराया श्रेणी के एकाधिक प्रेक्षण सूचकांक को विकृत करते हैं। पुष्पक निर्धारक समग्र कुंजी से दोहराव हटाता है।'
        : 'Multiple observations of the same flight, booking horizon, and fare class distort aggregate price weights. PUSHPAK detects duplicates using deterministic composite keys.',
      rules: [
        {
          rule: isHi ? 'समग्र निर्धारक कुंजी' : 'Composite Signature Key',
          desc: 'carrier | origin | destination | departure_date | advance_purchase_window | fare_class | total_fare'
        },
        {
          rule: isHi ? 'दोहराव से सूचकांक विकृति' : 'Why Duplicates Distort Price Relatives',
          desc: isHi
            ? 'यदि एक ही सस्ती या महंगी उड़ान दो बार गिनी जाए, तो उस मार्ग का ज्यामितीय माध्य और मूल्य सापेक्ष (R_i) अस्वाभाविक रूप से विचलित हो जाता है।'
            : 'If identical fare quotes are recorded multiple times, the route-level geometric mean shifts artificially, biasing price relatives (R_i).'
        },
        {
          rule: isHi ? 'पारदर्शी ऑडिट रिपोर्टिंग' : 'Transparent Deduplication Accounting',
          desc: isHi
            ? 'प्रत्येक रन में हटाए गए डुप्लिकेट्स की सटीक संख्या दर्ज होती है और उन्हें ऑडिट ट्रेल में अलग रखा जाता है।'
            : 'Every run explicitly records Duplicates Detected, isolating discarded quotes with full audit rationale.'
        }
      ],
      impact: isHi
        ? 'सुनिश्चित करता है कि प्रत्येक अद्वितीय बाजार उद्धरण केवल एक बार गिना जाए, जिससे राष्ट्रीय सूचकांक में दोहरी गणना समाप्त होती है।'
        : 'Guarantees strictly one observation per unique flight-fare tuple, eliminating double-counting in macroeconomic indices.'
    },

    normalization: {
      title: isHi ? 'डेटा सामान्यीकरण एवं मानकीकरण' : 'Metadata & Currency Normalization',
      badge: isHi ? 'चरण 5: मानकीकरण' : 'Stage 5: Schema Normalization',
      icon: FileText,
      accent: '#0369a1',
      summary: isHi
        ? 'भिन्न-भिन्न एयरलाइनों से प्राप्त प्रारूपों को एक समान राष्ट्रीय मानक में परिवर्तित किया जाता है।'
        : 'Harmonizes heterogeneous source data formats into uniform institutional schema standards.',
      rules: [
        {
          rule: isHi ? 'मुद्रा मानकीकरण' : 'Currency Normalization (INR)',
          desc: isHi ? 'सभी किराए भारतीय रुपये (INR) में दो दशमलव स्थानों तक मानकीकृत होते हैं।' : 'Enforces standard ISO 4217 INR denomination with 2-decimal precision.'
        },
        {
          rule: isHi ? 'केबिन श्रेणी वर्गीकरण' : 'Canonical Cabin Class Mapping',
          desc: isHi ? 'विविध श्रेणियों को Economy, Premium Economy, Business में मैप किया जाता है।' : 'Maps vendor-specific tags to canonical categories: Economy, Premium Economy, Business.'
        },
        {
          rule: isHi ? 'मानक समय मोहर' : 'ISO-8601 UTC Timestamps',
          desc: isHi ? 'सभी प्रेक्षण समय UTC ISO-8601 प्रारूप में सहेजे जाते हैं।' : 'Converts observation timestamps to RFC-3339 / ISO-8601 UTC.'
        }
      ],
      impact: isHi
        ? 'एयरलाइनों के बीच निष्पक्ष तुलना और सांख्यिकीय एकरूपता सुनिश्चित करता है।'
        : 'Ensures cross-carrier comparability and seamless institutional ingestion by statistical models.'
    },

    provenance: {
      title: isHi ? 'क्रिप्टोग्राफ़िक स्रोत अखंडता (SHA-256)' : 'Cryptographic Provenance & Auditability (SHA-256)',
      badge: isHi ? 'चरण 8: अखंडता हैश' : 'Stage 8: Cryptographic Hash',
      icon: ShieldCheck,
      accent: '#475569',
      summary: isHi
        ? 'प्रत्येक रन और उसके स्वीकृत प्रेक्षणों के लिए 256-बिट क्रिप्टोग्राफ़िक हैश तैयार किया जाता है, जो छेड़छाड़ को असंभव बनाता है।'
        : 'Generates an immutable SHA-256 cryptographic digest across accepted records and run parameters for institutional verifiability.',
      rules: [
        {
          rule: isHi ? 'अपरिवर्तनीय ऑडिट ट्रेल' : 'Immutable Audit Trail',
          desc: isHi ? 'रन आईडी, स्रोत पहचानकर्ता और स्वीकृत रिकॉर्ड्स की क्रमित सूची पर हैश निकाला जाता है।' : 'Computed over canonical JSON: run_id, source_id, count, and sorted flight records.'
        },
        {
          rule: isHi ? 'पुनरुत्पादनीयता' : 'Deterministic Reproducibility',
          desc: isHi ? 'वही इनपुट डेटा हमेशा वही हैश उत्पन्न करता है, जिससे स्वतंत्र ऑडिट संभव होता है।' : 'Identical raw inputs and cleaning steps reproduce the exact same hash, enabling independent verification.'
        }
      ],
      impact: isHi
        ? 'नियामकों (DGCA, MoSPI, RBI) को यह गारंटी देता है कि डेटा में पूर्वव्यापी परिवर्तन नहीं किया गया है।'
        : 'Provides institutional consumers verifiable proof that airfare data has not been altered retrospectively.'
    },

    'clean-fare-database': {
      title: isHi ? 'सत्यापित एवं स्वच्छ किराया डेटाबेस' : 'Clean & De-duplicated Fare Database',
      badge: isHi ? 'डेटा परत: airfare_observations' : 'Data Layer: airfare_observations',
      icon: Database,
      accent: '#0f766e',
      summary: isHi
        ? 'पुष्पक का कोर डेटाबेस जिसमें केवल सत्यापित, सामान्यीकृत और डुप्लीकेट-मुक्त प्रेक्षण संग्रहीत होते हैं।'
        : 'PUSHPAK central repository storing structured, cleaned, and verified airfare observations with full metadata.',
      rules: [
        {
          rule: isHi ? 'संरचित मेटाडेटा' : '17 Structured Metadata Fields',
          desc: 'origin, destination, route_code, carrier, flight_identifier, departure_date, advance_purchase_window, fare_class, base_fare, taxes, total_fare, currency, source, source_type, raw_id, validation_status, duplicate_status, provenance_hash.'
        },
        {
          rule: isHi ? 'डेटाबेस इंजन' : 'High-Performance Engine',
          desc: isHi ? 'SQLite 3 विथ PRAGMA WAL मोड, जिससे समवर्ती पठन एवं लेखन में शून्य विलंब होता है।' : 'SQLite 3 with PRAGMA journal_mode=WAL for high-concurrency analytical reads.'
        }
      ],
      impact: isHi
        ? 'मूल्य सूचकांक निर्माण के लिए विश्वसनीय और पारदर्शी आधार प्रदान करता है।'
        : 'Serves as the audited foundation for route-level price relative and index construction.'
    },

    'price-relatives': {
      title: isHi ? 'मूल्य सापेक्ष निर्माण (Price Relatives: Rᵢ)' : 'Price Relatives Formulation (Rᵢ)',
      badge: isHi ? 'गणितीय चरण 1' : 'Mathematical Formulation',
      icon: Calculator,
      accent: '#1e3a8a',
      summary: isHi
        ? 'प्रत्येक गलियारे i के लिए, वर्तमान प्रेक्षित ज्यामितीय माध्य किराए को आधार अवधि किराए से विभाजित किया जाता है।'
        : 'For each corridor i, the price relative Rᵢ measures the price change from the baseline period to current period t.',
      formula: 'Rᵢ = Pᵢ,ₜ / Pᵢ,₀',
      formulaExplanation: [
        { term: 'Rᵢ', desc: isHi ? 'मार्ग i का मूल्य सापेक्ष (Price Relative)' : 'Price relative for route i' },
        { term: 'Pᵢ,ₜ', desc: isHi ? 'वर्तमान अवधि t में मार्ग i का प्रेक्षित औसत/ज्यामितीय किराया' : 'Observed average fare for route i at time t' },
        { term: 'Pᵢ,₀', desc: isHi ? 'आधार अवधि (T+45 क्षितिज) में मार्ग i का आधार किराया' : 'Baseline fare for route i during reference period' }
      ],
      impact: isHi
        ? 'किराया स्तरों को आयामहीन मूल्य अनुपातों में परिवर्तित करता है, जिससे विभिन्न दूरियों के मार्गों की निष्पक्ष तुलना होती है।'
        : 'Converts rupee fare levels into dimensionless price relatives, allowing consistent cross-corridor aggregation.'
    },

    'route-weighting': {
      title: isHi ? 'प्रतिनिधि बास्केट एवं मार्ग भार (wᵢ)' : 'Representative Basket & Route Weighting (wᵢ)',
      badge: isHi ? 'गणितीय चरण 2' : 'Basket Weights',
      icon: Scale,
      accent: '#7c3aed',
      summary: isHi
        ? 'प्रत्येक मार्ग का वजन कुल घरेलू उड़ान यातायात में उसकी हिस्सेदारी के अनुपात में निर्धारित होता है।'
        : 'Route weights wᵢ are derived from domestic flight schedule density, ensuring weights sum strictly to unity (Σwᵢ = 1.0).',
      formula: 'wᵢ = Vᵢ / Σ Vⱼ',
      formulaExplanation: [
        { term: 'wᵢ', desc: isHi ? 'मार्ग i का भार (उदा. DEL-BOM: ~39.92%, DEL-BLR: ~40.74%)' : 'Normalized weight of corridor i' },
        { term: 'Vᵢ', desc: isHi ? 'घरेलू उड़ान रजिस्ट्री में मार्ग i के प्रेक्षित उड़ानों की संख्या' : 'Observed scheduled flight frequency on corridor i' },
        { term: 'Σ Vⱼ', desc: isHi ? 'प्रतिनिधि बास्केट के सभी मार्गों की कुल उड़ान संख्या' : 'Total flight volume across all representative basket corridors' }
      ],
      impact: isHi
        ? 'प्रमुख ट्रंक मार्गों को उनकी वास्तविक आर्थिक महत्ता के अनुसार वजन देता है, ताकि छोटे मार्गों के उतार-चढ़ाव सूचकांक को विकृत न करें।'
        : 'Weights economic hubs proportionally to their commercial traffic, preventing low-volume routes from distorting national inflation.'
    },

    'pushpak-index': {
      title: isHi ? 'पुष्पक वायु किराया मूल्य सूचकांक (Iₜ)' : 'PUSHPAK Airfare Price Index Suite (Iₜ)',
      badge: isHi ? 'अंतिम सूचकांक एकत्रीकरण' : 'Index Aggregation',
      icon: TrendingUp,
      accent: '#0f766e',
      summary: isHi
        ? 'लास्पेयर्स-प्रकार के सूचकांक सूत्र का उपयोग करके राष्ट्रीय हेडलाइन और कोर सूचकांकों की गणना की जाती है।'
        : 'Computes institutional Laspeyres-type domestic airfare price index tracking high-frequency price movements.',
      formula: 'Iₜ = Σ(wᵢ × Rᵢ) × 100',
      formulaExplanation: [
        { term: 'Iₜ', desc: isHi ? 'अवधि t पर पुष्पक वायु किराया मूल्य सूचकांक (आधार = 100.00)' : 'PUSHPAK Airfare Price Index value at time t' },
        { term: 'wᵢ', desc: isHi ? 'मार्ग i का सामान्यीकृत भार (Σwᵢ = 1.0000)' : 'Normalized weight of route i' },
        { term: 'Rᵢ', desc: isHi ? 'मार्ग i का मूल्य सापेक्ष (Pᵢ,ₜ / Pᵢ,₀)' : 'Price relative of route i' },
        { term: '100', desc: isHi ? 'सांख्यिकीय आधार अवधि गुणक' : 'Statistical base period index scaling factor' }
      ],
      impact: isHi
        ? 'हेडलाइन सूचकांक सभी 5 बुकिंग अवधियों को मापता है, जबकि कोर सूचकांक वॉक-अप सर्ज (T+1/T+7) को हटाकर अंतर्निहित क्षमता मूल्य निर्धारण दिखाता है।'
        : 'Headline Index tracks all 5 advance booking horizons; Core Index isolates structural capacity by filtering short-term walk-up volatility.'
    }
  };

  const concept = concepts[conceptId] || concepts.validation;
  const Icon = concept.icon;

  return (
    <div style={{ padding: '1.25rem 1.5rem', backgroundColor: '#ffffff', borderRadius: '8px' }}>
      {/* Concept Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: `${concept.accent}15`,
            color: concept.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon size={22} />
          </div>
          <div>
            <span style={{
              display: 'inline-block',
              fontSize: '0.72rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: concept.accent,
              marginBottom: '0.2rem'
            }}>
              {concept.badge}
            </span>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>
              {concept.title}
            </h3>
          </div>
        </div>
      </div>

      {/* Summary Box */}
      <div style={{
        padding: '1rem 1.25rem',
        backgroundColor: '#f8fafc',
        borderLeft: `4px solid ${concept.accent}`,
        borderRadius: '0 8px 8px 0',
        marginBottom: '1.5rem',
        fontSize: '0.92rem',
        color: '#334155',
        lineHeight: '1.6'
      }}>
        {concept.summary}
      </div>

      {/* Mathematical Formula (if applicable) */}
      {concept.formula && (
        <div style={{
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          padding: '1.25rem 1.5rem',
          borderRadius: '10px',
          marginBottom: '1.5rem',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            {isHi ? 'गणितीय सूत्र' : 'Mathematical Formulation'}
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', fontFamily: 'monospace', color: '#38bdf8', marginBottom: '1rem' }}>
            {concept.formula}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', borderTop: '1px solid #334155', paddingTop: '0.75rem' }}>
            {concept.formulaExplanation.map((item, idx) => (
              <div key={idx} style={{ fontSize: '0.82rem' }}>
                <span style={{ fontWeight: '700', color: '#f59e0b', fontFamily: 'monospace' }}>{item.term}</span>
                <span style={{ color: '#cbd5e1' }}>: {item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rules / Specifics */}
      {concept.rules && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ margin: '0 0 0.85rem 0', fontSize: '0.95rem', fontWeight: '700', color: '#1e293b' }}>
            {isHi ? 'मुख्य तकनीकी नियम एवं विनिर्देश' : 'Core Architecture Specifications & Rules'}
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
            {concept.rules.map((r, idx) => (
              <div key={idx} style={{
                padding: '0.85rem 1rem',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
              }}>
                <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#0f172a', marginBottom: '0.35rem' }}>
                  {r.rule}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: '1.5', fontFamily: r.desc.includes('|') ? 'monospace' : 'inherit' }}>
                  {r.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Macro Impact */}
      <div style={{
        padding: '0.85rem 1.15rem',
        backgroundColor: '#f1f5f9',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        fontSize: '0.85rem',
        color: '#1e293b',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{ fontWeight: '700', color: concept.accent, whiteSpace: 'nowrap' }}>
          {isHi ? 'सांख्यिकीय महत्व:' : 'Statistical Impact:'}
        </div>
        <div style={{ color: '#475569' }}>
          {concept.impact}
        </div>
      </div>
    </div>
  );
}
