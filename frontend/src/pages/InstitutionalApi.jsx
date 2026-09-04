import React, { useState } from 'react';
import { 
  Code2, 
  Play, 
  Copy, 
  Check, 
  Terminal, 
  Database, 
  Layers, 
  ShieldCheck, 
  Server, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Cpu,
  ArrowRight,
  Info,
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useGuidedDemo } from '../context/GuidedDemoContext';

export default function InstitutionalApi() {
  const { lang } = useLanguage();
  const { isDemoActive, currentStep, completeDemo } = useGuidedDemo();
  const isHi = lang === 'hi';

  const [activeCategory, setActiveCategory] = useState('index');
  const [activeEndpointId, setActiveEndpointId] = useState('headline-index');
  const [requestLoading, setRequestLoading] = useState(false);
  const [responsePayload, setResponsePayload] = useState(null);
  const [responseStatus, setResponseStatus] = useState(null);
  const [responseLatency, setResponseLatency] = useState(null);
  const [copiedResponse, setCopiedResponse] = useState(false);

  // API Categories and real endpoints
  const apiCategories = [
    { id: 'index', name: isHi ? 'मूल्य सूचकांक एपीआई' : 'Price Index APIs', count: 4 },
    { id: 'acquisition', name: isHi ? 'किराया अधिग्रहण एपीआई' : 'Airfare Acquisition APIs', count: 4 },
    { id: 'corridors', name: isHi ? 'राष्ट्रीय गलियारा एपीआई' : 'National Corridor APIs', count: 2 },
    { id: 'governance', name: isHi ? 'डेटा अखंडता एवं शासन एपीआई' : 'Integrity & Governance APIs', count: 3 }
  ];

  const endpoints = [
    // 1. Price Index APIs
    {
      id: 'headline-index',
      category: 'index',
      method: 'GET',
      path: '/api/v1/index/headline',
      title: isHi ? 'पुष्पक हेडलाइन वायु किराया मूल्य सूचकांक' : 'PUSHPAK Headline Price Index',
      desc: isHi 
        ? 'सभी प्रतिनिधि गलियारों और 5 बुकिंग क्षितिजों (T+1 से T+45) को समाहित करने वाला व्यापक सूचकांक।'
        : 'Comprehensive domestic price index (Base = 100.00) capturing all 5 advance booking horizons and dynamic surge pricing.',
      params: [
        { name: 'weighting_method', type: 'query', default: 'observed_records', desc: 'Weighting scheme: observed_records or equal_weights' }
      ],
      fetchUrl: 'http://localhost:8000/api/v1/index/headline?weighting_method=observed_records',
      curlSnippet: 'curl -X GET "http://localhost:8000/api/v1/index/headline?weighting_method=observed_records" -H "Accept: application/json"'
    },
    {
      id: 'core-index',
      category: 'index',
      method: 'GET',
      path: '/api/v1/index/core',
      title: isHi ? 'पुष्पक कोर वायु किराया मूल्य सूचकांक' : 'PUSHPAK Core Price Index',
      desc: isHi 
        ? 'अस्थिर वॉक-अप सर्ज (T+1/T+7) को हटाकर अंतर्निहित क्षमता मूल्य निर्धारण को मापने वाला कोर सूचकांक।'
        : 'Core airfare index isolating structural capacity pricing by filtering out high-volatility walk-up booking windows.',
      params: [
        { name: 'weighting_method', type: 'query', default: 'observed_records', desc: 'Weighting scheme: observed_records or equal_weights' }
      ],
      fetchUrl: 'http://localhost:8000/api/v1/index/core?weighting_method=observed_records',
      curlSnippet: 'curl -X GET "http://localhost:8000/api/v1/index/core?weighting_method=observed_records" -H "Accept: application/json"'
    },
    {
      id: 'index-summary',
      category: 'index',
      method: 'GET',
      path: '/api/v1/index/summary',
      title: isHi ? 'सूचकांक सारांश एवं वॉक-अप सर्ज स्प्रेड' : 'Price Index Suite Summary & Surge Spread',
      desc: isHi 
        ? 'हेडलाइन बनाम कोर सूचकांक का पक्ष-दर-पक्ष विश्लेषण और वॉक-अप सर्ज प्रीमियम।'
        : 'Side-by-side comparison of Headline vs Core with quantified Walk-Up Surge Spread and economic interpretation.',
      params: [],
      fetchUrl: 'http://localhost:8000/api/v1/index/summary',
      curlSnippet: 'curl -X GET "http://localhost:8000/api/v1/index/summary" -H "Accept: application/json"'
    },
    {
      id: 'index-methodology',
      category: 'index',
      method: 'GET',
      path: '/api/v1/index/methodology',
      title: isHi ? 'सूचकांक निर्माण कार्यप्रणाली विनिर्देश' : 'Index Calculation Methodology & ILO/IMF Alignment',
      desc: isHi 
        ? 'लास्पेयर्स-प्रकार का एकत्रीकरण सूत्र, बास्केट भार और सांख्यिकीय सम्मेलन।'
        : 'Auditable mathematical methodology, base period definitions, weighting matrix, and CPI augmentation specifications.',
      params: [],
      fetchUrl: 'http://localhost:8000/api/v1/index/methodology',
      curlSnippet: 'curl -X GET "http://localhost:8000/api/v1/index/methodology" -H "Accept: application/json"'
    },

    // 2. Airfare Acquisition APIs
    {
      id: 'acq-sources',
      category: 'acquisition',
      method: 'GET',
      path: '/api/v1/acquisition/sources',
      title: isHi ? 'पंजीकृत अधिग्रहण स्रोत कनेक्टर' : 'Registered Acquisition Connectors',
      desc: isHi 
        ? 'उपलब्ध प्रदर्शन कनेक्टर और भविष्य के एयरलाइन एनडीसी/जीडीएस एकीकरण स्टब्स।'
        : 'Returns active multi-carrier demonstration connector and architecture-ready institutional NDC provider stubs.',
      params: [],
      fetchUrl: 'http://localhost:8000/api/v1/acquisition/sources',
      curlSnippet: 'curl -X GET "http://localhost:8000/api/v1/acquisition/sources" -H "Accept: application/json"'
    },
    {
      id: 'acq-run',
      category: 'acquisition',
      method: 'POST',
      path: '/api/v1/acquisition/run',
      title: isHi ? '9-चरणीय अधिग्रहण पाइपलाइन निष्पादन' : 'Execute 9-Stage Acquisition Pipeline',
      desc: isHi 
        ? 'सत्यापन, सामान्यीकरण, डुप्लीकेशन निष्कासन और SHA-256 हैश के साथ अधिग्रहण निष्पादित करता है।'
        : 'Triggers end-to-end parsing, schema audit, deterministic duplicate removal, and cryptographic hashing.',
      params: [
        { name: 'source_id', type: 'body', default: 'demo_airfare_connector', desc: 'Connector identifier' },
        { name: 'route_code', type: 'body', default: 'DEL-BOM', desc: 'Domestic corridor code' },
        { name: 'advance_purchase_window', type: 'body', default: 15, desc: 'Booking horizon in days (1, 7, 15, 30, 45)' }
      ],
      fetchUrl: 'http://localhost:8000/api/v1/acquisition/run',
      postBody: {
        source_id: 'demo_airfare_connector',
        route_code: 'DEL-BOM',
        advance_purchase_window: 15
      },
      curlSnippet: 'curl -X POST "http://localhost:8000/api/v1/acquisition/run" -H "Content-Type: application/json" -d \'{"source_id":"demo_airfare_connector","route_code":"DEL-BOM","advance_purchase_window":15}\''
    },
    {
      id: 'acq-history',
      category: 'acquisition',
      method: 'GET',
      path: '/api/v1/acquisition/history',
      title: isHi ? 'अधिग्रहण ऑडिट रन इतिहास' : 'Acquisition Audit Run History',
      desc: isHi 
        ? 'प्राप्त, सत्यापित, हटाए गए डुप्लिकेट्स और क्रिप्टोग्राफ़िक हैश का संपूर्ण ऑडिट इतिहास।'
        : 'Immutable run audit trail recording records retrieved, validated, duplicates removed, and SHA-256 hashes.',
      params: [
        { name: 'limit', type: 'query', default: '10', desc: 'Maximum number of runs to return' }
      ],
      fetchUrl: 'http://localhost:8000/api/v1/acquisition/history?limit=10',
      curlSnippet: 'curl -X GET "http://localhost:8000/api/v1/acquisition/history?limit=10" -H "Accept: application/json"'
    },
    {
      id: 'acq-observations',
      category: 'acquisition',
      method: 'GET',
      path: '/api/v1/acquisition/observations',
      title: isHi ? 'स्वच्छ एवं डी-डुप्लीकेटेड किराया प्रेक्षण' : 'Clean De-duplicated Fare Observations',
      desc: isHi 
        ? 'सत्यापित और स्वच्छ वायु किराया डेटाबेस जो सूचकांक निर्माण हेतु तैयार है।'
        : 'Structured airfare observations with 17 metadata fields, clean validation status, and unique duplicate status.',
      params: [
        { name: 'route_code', type: 'query', default: 'DEL-BOM', desc: 'Corridor code filter' },
        { name: 'limit', type: 'query', default: '5', desc: 'Maximum observations' }
      ],
      fetchUrl: 'http://localhost:8000/api/v1/acquisition/observations?route_code=DEL-BOM&limit=5',
      curlSnippet: 'curl -X GET "http://localhost:8000/api/v1/acquisition/observations?route_code=DEL-BOM&limit=5" -H "Accept: application/json"'
    },

    // 3. National Corridor APIs
    {
      id: 'corridors-top10',
      category: 'corridors',
      method: 'GET',
      path: '/api/v1/corridors/top10',
      title: isHi ? 'शीर्ष 10 राष्ट्रीय घरेलू गलियारे' : 'Top 10 National Domestic Corridors',
      desc: isHi 
        ? 'उच्च-घनत्व ट्रंक मार्गों का विश्लेषण, प्रतिनिधि बास्केट स्थिति और क्षमता आंकड़े।'
        : 'Ranked high-density corridors, observed flight volume, active carrier shares, and basket inclusion status.',
      params: [],
      fetchUrl: 'http://localhost:8000/api/v1/corridors/top10',
      curlSnippet: 'curl -X GET "http://localhost:8000/api/v1/corridors/top10" -H "Accept: application/json"'
    },
    {
      id: 'corridor-detail',
      category: 'corridors',
      method: 'GET',
      path: '/api/v1/corridors/DEL-BOM',
      title: isHi ? 'गलियारा-स्तरीय विस्तृत आसूचना' : 'Corridor Route Analytics & Carrier Shares',
      desc: isHi 
        ? 'DEL-BOM ट्रंक गलियारे का विस्तृत किराया फैलाव, औसत अवधि और एयरलाइन हिस्सेदारी।'
        : 'Detailed single-corridor analytics including airline market concentration, duration, and fare statistics.',
      params: [],
      fetchUrl: 'http://localhost:8000/api/v1/corridors/DEL-BOM',
      curlSnippet: 'curl -X GET "http://localhost:8000/api/v1/corridors/DEL-BOM" -H "Accept: application/json"'
    },

    // 4. Governance & Integrity APIs
    {
      id: 'gov-latest',
      category: 'governance',
      method: 'GET',
      path: '/api/v1/government/index/latest',
      title: isHi ? 'संस्थागत सूचकांक पेलोड (MoSPI / RBI प्रारूप)' : 'Institutional Index Payload (MoSPI / RBI Format)',
      desc: isHi 
        ? 'राष्ट्रीय सांख्यिकी एजेंसियों हेतु मानकीकृत प्रारूप में नवीनतम सूचकांक आउटपुट।'
        : 'Structured programmatic price index output formatted specifically for statistical and macroeconomic workflow ingestion.',
      params: [],
      fetchUrl: 'http://localhost:8000/api/v1/government/index/latest',
      curlSnippet: 'curl -X GET "http://localhost:8000/api/v1/government/index/latest" -H "Accept: application/json"'
    },
    {
      id: 'gov-provenance',
      category: 'governance',
      method: 'GET',
      path: '/api/v1/government/provenance',
      title: isHi ? 'क्रिप्टोग्राफ़िक स्रोत जनगणना एवं ऑडिट ट्रेल' : 'Cryptographic Provenance Census & Audit Trail',
      desc: isHi 
        ? 'डेटा मोड जनगणना (ऐतिहासिक, सिमुलेशन, लाइव) और अपरिवर्तनीय रन इतिहास।'
        : 'Comprehensive dataset census, environment boundaries, and SHA-256 verification records.',
      params: [],
      fetchUrl: 'http://localhost:8000/api/v1/government/provenance',
      curlSnippet: 'curl -X GET "http://localhost:8000/api/v1/government/provenance" -H "Accept: application/json"'
    },
    {
      id: 'gov-data-status',
      category: 'governance',
      method: 'GET',
      path: '/api/v1/government/data-status',
      title: isHi ? 'पारदर्शी डेटासेट परिचालन स्थिति' : 'Transparent Dataset Operational Status',
      desc: isHi 
        ? 'सिमुलेशन बनाम लाइव परिचालन डेटा का स्पष्ट एवं पारदर्शी वर्गीकरण।'
        : 'Explicit institutional disclosure categorizing flight registry observations, deterministic baselines, and live telemetry.',
      params: [],
      fetchUrl: 'http://localhost:8000/api/v1/government/data-status',
      curlSnippet: 'curl -X GET "http://localhost:8000/api/v1/government/data-status" -H "Accept: application/json"'
    }
  ];

  const currentEndpoint = endpoints.find(e => e.id === activeEndpointId) || endpoints[0];

  // Execute real request against local FastAPI server
  const handleTryRequest = async () => {
    setRequestLoading(true);
    setResponsePayload(null);
    setResponseStatus(null);
    setResponseLatency(null);

    const startTime = performance.now();
    try {
      // Use relative endpoint so requests route transparently via Vite dev proxy or backend server
      const paramStr = currentEndpoint.params?.length && currentEndpoint.params[0].default 
        ? `?${currentEndpoint.params[0].name}=${currentEndpoint.params[0].default}` 
        : '';
      const targetUrl = `${currentEndpoint.path}${paramStr}`;

      let res;
      if (currentEndpoint.method === 'POST') {
        res = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(currentEndpoint.postBody)
        });
      } else {
        res = await fetch(targetUrl, {
          headers: { 'Accept': 'application/json' }
        });
      }

      const elapsed = Math.round(performance.now() - startTime);
      setResponseLatency(elapsed);
      setResponseStatus(res.status);

      const json = await res.json();
      setResponsePayload(json);
    } catch (err) {
      const elapsed = Math.round(performance.now() - startTime);
      setResponseLatency(elapsed);
      setResponseStatus(500);
      setResponsePayload({ error: 'Connection Error', message: err.message });
    } finally {
      setRequestLoading(false);
    }
  };

  const handleCopyResponse = () => {
    if (!responsePayload) return;
    navigator.clipboard.writeText(JSON.stringify(responsePayload, null, 2));
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Guided Demo Step 6 Banner */}
      {isDemoActive && currentStep === 6 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1.25rem 1.5rem',
          backgroundColor: '#0f766e',
          color: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 4px 14px rgba(15, 118, 110, 0.25)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <CheckCircle2 size={24} color="#5eead4" />
            </div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '1rem', letterSpacing: '0.02em' }}>
                {isHi ? 'चरण 6: संस्थागत एपीआई तत्परता — संपूर्ण प्रदर्शन पूर्ण' : 'Step 6: Institutional API Readiness — End-to-End Pipeline Complete'}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#ccfbf1', marginTop: '2px' }}>
                {isHi ? 'अधिग्रहण से सत्यापन, डेटाबेस, सांख्यिकी, सूचकांक, नीति और संस्थागत एपीआई तक संपूर्ण डेटा-टू-डिसीजन यात्रा सफलतापूर्वक पूरी हुई।' : 'You have navigated the complete PUSHPAK journey from multi-cycle acquisition & deduplication to statistical indices, policy heuristics, and institutional REST endpoints.'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={completeDemo}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.65rem 1.35rem',
              backgroundColor: '#ffffff',
              color: '#0f766e',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '800',
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          >
            <span>{isHi ? 'निर्देशित प्रदर्शन संपन्न करें ✓' : 'Finish Guided Demonstration ✓'}</span>
          </button>
        </div>
      )}

      {/* 1. Header & Institutional Alignment */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '12px',
        padding: '1.75rem 2rem',
        boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>
                {isHi ? 'संस्थागत एपीआई तत्परता' : 'Institutional API Readiness'}
              </h1>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.3rem 0.75rem',
                backgroundColor: '#eff6ff',
                color: '#1e3a8a',
                border: '1px solid #bfdbfe',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '700',
                letterSpacing: '0.04em'
              }}>
                <Server size={14} />
                FASTAPI REST LAYER
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#475569', maxWidth: '900px', lineHeight: '1.5' }}>
              {isHi
                ? 'पारदर्शी REST एपीआई के माध्यम से संस्थागत विश्लेषणात्मक प्रणालियों (MoSPI, RBI, DGCA) के साथ एकीकरण हेतु डिज़ाइन किया गया।'
                : 'Designed for integration with institutional analytical systems through transparent REST APIs. PUSHPAK exposes programmatic endpoints for statistical agencies, central banks, and aviation regulators.'}
            </p>
          </div>
        </div>

        {/* Institutional Disclosure */}
        <div style={{
          padding: '0.85rem 1.15rem',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderLeft: '4px solid #0f766e',
          borderRadius: '0 8px 8px 0',
          marginTop: '1rem',
          fontSize: '0.85rem',
          color: '#334155',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <Info size={18} style={{ flexShrink: 0, color: '#0f766e' }} />
          <span>
            <strong>{isHi ? 'एकीकरण सिद्धांत: ' : 'Integration Standard: '}</strong>
            {isHi
              ? 'यह एपीआई इंटरफ़ेस दर्शाता है कि डैशबोर्ड केवल विज़ुअल नहीं है—वही गणितीय और विश्लेषणात्मक आउटपुट प्रोग्रामेटिक रूप से संस्थागत उपभोग हेतु सुलभ हैं।'
              : 'The dashboard is not merely visual. The exact same analytical models, Laspeyres price indices, and clean airfare records are exposed via standardized, auditable JSON APIs.'}
          </span>
        </div>
      </div>

      {/* 2. System Architecture View (Section 11) */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '12px',
        padding: '1.75rem 2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: '#0f172a' }}>
            {isHi ? 'पुष्पक संपूर्ण सिस्टम वास्तुकला (System Architecture)' : 'PUSHPAK End-to-End System Architecture'}
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
            {isHi ? 'कच्चे स्रोतों से संस्थागत उपभोग तक का संपूर्ण वास्तुशिल्प प्रवाह' : 'High-level flow from heterogeneous aviation data sources to institutional consumer systems.'}
          </p>
        </div>

        {/* Flow Diagram */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem',
          backgroundColor: '#f8fafc',
          borderRadius: '10px',
          border: '1px solid #e2e8f0'
        }}>
          {/* Top Sources */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ padding: '0.6rem 1.2rem', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '700', fontSize: '0.82rem', color: '#1e293b' }}>
              AIRLINE / DATA SOURCE
            </div>
          </div>
          <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '800' }}>↓</div>

          {/* Ingestion & Cleaning */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ padding: '0.5rem 0.9rem', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', color: '#c2410c' }}>
              PYTHON ACQUISITION CONNECTOR
            </div>
            <div style={{ padding: '0.5rem 0.9rem', backgroundColor: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', color: '#0f766e' }}>
              VALIDATION ENGINE
            </div>
            <div style={{ padding: '0.5rem 0.9rem', backgroundColor: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', color: '#0f766e' }}>
              DEDUPLICATION ENGINE
            </div>
          </div>
          <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '800' }}>↓</div>

          {/* Storage & Engine */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ padding: '0.5rem 1rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', color: '#1e3a8a' }}>
              CLEAN AIRFARE DATABASE (SQLite WAL)
            </div>
            <div style={{ padding: '0.5rem 1rem', backgroundColor: '#fdf4ff', border: '1px solid #f0abfc', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', color: '#a21caf' }}>
              PRICE INDEX ENGINE (Laspeyres)
            </div>
          </div>
          <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '800' }}>↓</div>

          {/* API Gateway */}
          <div style={{ padding: '0.65rem 2rem', backgroundColor: '#0f172a', color: '#38bdf8', borderRadius: '8px', fontWeight: '800', fontSize: '0.9rem', fontFamily: 'monospace' }}>
            FASTAPI PROGRAMMATIC REST LAYER (/api/v1)
          </div>

          <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '800' }}>↙ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ↓ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ↘</div>

          {/* Consumers */}
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ padding: '0.6rem 1.25rem', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '700', color: '#0f766e' }}>
              PUSHPAK DASHBOARD (Vite+React)
            </div>
            <div style={{ padding: '0.6rem 1.25rem', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '700', color: '#1e3a8a' }}>
              INTERACTIVE API EXPLORER
            </div>
            <div style={{ padding: '0.6rem 1.25rem', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '700', color: '#c2410c' }}>
              INSTITUTIONAL CONSUMERS (MoSPI / RBI / DGCA)
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive API Explorer */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(300px, 360px) 1fr',
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        {/* Left Column: Category & Endpoint Navigation */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '12px',
          padding: '1.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          {/* Category Tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>
              API DOMAINS
            </div>
            {apiCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  const firstInCat = endpoints.find(e => e.category === cat.id);
                  if (firstInCat) setActiveEndpointId(firstInCat.id);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '6px',
                  backgroundColor: activeCategory === cat.id ? '#f1f5f9' : 'transparent',
                  border: activeCategory === cat.id ? '1px solid #cbd5e1' : '1px solid transparent',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: activeCategory === cat.id ? '700' : '600', color: activeCategory === cat.id ? '#0f172a' : '#475569' }}>
                  {cat.name}
                </span>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#e2e8f0', color: '#475569', padding: '0.1rem 0.45rem', borderRadius: '9999px', fontWeight: '700' }}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Endpoints List in Selected Category */}
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
              ENDPOINTS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {endpoints.filter(e => e.category === activeCategory).map((ep) => {
                const isSelected = activeEndpointId === ep.id;
                return (
                  <div
                    key={ep.id}
                    onClick={() => {
                      setActiveEndpointId(ep.id);
                      setResponsePayload(null);
                      setResponseStatus(null);
                    }}
                    style={{
                      padding: '0.75rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? '#f0fdfa' : '#ffffff',
                      border: isSelected ? '2px solid #0f766e' : '1px solid #e2e8f0',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: '800',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        backgroundColor: ep.method === 'POST' ? '#ffedd5' : '#e0f2fe',
                        color: ep.method === 'POST' ? '#c2410c' : '#0369a1'
                      }}>
                        {ep.method}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: '700', color: '#334155' }}>
                        {ep.path}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: isSelected ? '#0f766e' : '#64748b', fontWeight: isSelected ? '600' : 'normal' }}>
                      {ep.title}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Endpoint Detail & Live Runner */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '12px',
          padding: '1.75rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {/* Endpoint Header */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: '800',
                padding: '0.25rem 0.6rem',
                borderRadius: '4px',
                backgroundColor: currentEndpoint.method === 'POST' ? '#ffedd5' : '#e0f2fe',
                color: currentEndpoint.method === 'POST' ? '#c2410c' : '#0369a1'
              }}>
                {currentEndpoint.method}
              </span>
              <span style={{ fontSize: '1.05rem', fontFamily: 'monospace', fontWeight: '800', color: '#0f172a' }}>
                {currentEndpoint.path}
              </span>
            </div>
            <h2 style={{ margin: '0 0 0.4rem 0', fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>
              {currentEndpoint.title}
            </h2>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: '1.5' }}>
              {currentEndpoint.desc}
            </p>
          </div>

          {/* cURL Example Box */}
          <div style={{
            backgroundColor: '#0f172a',
            borderRadius: '8px',
            padding: '0.85rem 1.15rem',
            color: '#f8fafc',
            fontFamily: 'monospace',
            fontSize: '0.78rem',
            overflowX: 'auto'
          }}>
            <div style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: '700', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
              SAMPLE CURL REQUEST
            </div>
            <div style={{ color: '#38bdf8' }}>{currentEndpoint.curlSnippet}</div>
          </div>

          {/* Execute Action */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleTryRequest}
              disabled={requestLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: requestLoading ? '#94a3b8' : '#0f766e',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.92rem',
                fontWeight: '700',
                cursor: requestLoading ? 'wait' : 'pointer',
                boxShadow: '0 2px 6px rgba(15, 118, 110, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              <Play size={15} fill="#ffffff" />
              <span>{requestLoading ? (isHi ? 'अनुरोध भेजा जा रहा है...' : 'Sending Request...') : (isHi ? 'अनुरोध भेजें (Try Request)' : 'Try Request')}</span>
            </button>

            {responseStatus && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '6px',
                  backgroundColor: responseStatus === 200 ? '#dcfce7' : '#fee2e2',
                  color: responseStatus === 200 ? '#166534' : '#991b1b'
                }}>
                  {responseStatus} {responseStatus === 200 ? 'OK' : 'ERROR'}
                </span>
                {responseLatency && (
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Latency: <strong>{responseLatency} ms</strong>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Real JSON Response Viewer */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em' }}>
                {isHi ? 'वास्तविक प्रतिक्रिया (Real JSON Response)' : 'Live API Response Payload'}
              </span>
              {responsePayload && (
                <button
                  onClick={handleCopyResponse}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '0.25rem 0.65rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  <Copy size={12} />
                  <span>{copiedResponse ? 'Copied!' : 'Copy JSON'}</span>
                </button>
              )}
            </div>

            <div style={{
              backgroundColor: '#1e293b',
              borderRadius: '8px',
              border: '1px solid #334155',
              maxHeight: '400px',
              overflowY: 'auto',
              padding: '1rem',
              color: '#f8fafc',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              lineHeight: '1.5'
            }}>
              {responsePayload ? (
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {JSON.stringify(responsePayload, null, 2)}
                </pre>
              ) : (
                <div style={{ color: '#94a3b8', fontStyle: 'italic', padding: '1rem 0', textAlign: 'center' }}>
                  {isHi 
                    ? 'स्थानीय फास्टएपीआई बैकएंड से वास्तविक प्रतिक्रिया देखने हेतु "अनुरोध भेजें (Try Request)" पर क्लिक करें।' 
                    : 'Click "Try Request" to invoke this endpoint directly against the running local FastAPI server.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
