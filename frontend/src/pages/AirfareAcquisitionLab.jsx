import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Layers, 
  ShieldCheck, 
  Database, 
  Calculator, 
  Scale, 
  TrendingUp, 
  HelpCircle, 
  ExternalLink,
  ChevronRight,
  Info,
  Clock,
  ArrowRight,
  FileText,
  AlertTriangle,
  GitCompare,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';
import api from '../api/client';
import { useLanguage } from '../hooks/useLanguage';
import { useWorkspace } from '../hooks/useWorkspace';
import { useGuidedDemo } from '../context/GuidedDemoContext';

export default function AirfareAcquisitionLab() {
  const { lang } = useLanguage();
  const isHi = lang === 'hi';
  const { openContextualWindow } = useWorkspace();
  const { isDemoActive, currentStep, nextStep, notifyAcquisitionCompleted } = useGuidedDemo();

  // State
  const [sources, setSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState('demo_airfare_connector');
  const [selectedRoute, setSelectedRoute] = useState('DEL-BOM');
  const [selectedWindow, setSelectedWindow] = useState(15);
  const [isRunning, setIsRunning] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState(-1);
  const [runResult, setRunResult] = useState(null);
  const [comparisonAudit, setComparisonAudit] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('accepted'); // 'accepted' | 'rejected' | 'comparison' | 'history'
  const [copiedHash, setCopiedHash] = useState(false);
  const [error, setError] = useState(null);

  // Available routes for acquisition demonstration
  const availableRoutes = [
    { code: 'DEL-BOM', label: 'Delhi ↔ Mumbai (Trunk Hub)' },
    { code: 'DEL-BLR', label: 'Delhi ↔ Bengaluru (Tech Corridor)' },
    { code: 'BOM-BLR', label: 'Mumbai ↔ Bengaluru (Commercial Corridor)' },
    { code: 'DEL-MAA', label: 'Delhi ↔ Chennai (Southern Trunk)' },
    { code: 'BOM-CCU', label: 'Mumbai ↔ Kolkata (East-West Trunk)' }
  ];

  const advanceWindows = [
    { days: 1, label: 'T+1 (Walk-Up Surge Horizon)' },
    { days: 7, label: 'T+7 (Weekly Horizon)' },
    { days: 15, label: 'T+15 (Mid-Range Horizon)' },
    { days: 30, label: 'T+30 (Planned Horizon)' },
    { days: 45, label: 'T+45 (Base Reference Horizon)' }
  ];

  const pipelineStageDefinitions = [
    { id: 1, name: isHi ? 'स्रोत कनेक्टर प्रारंभीकरण' : 'Initializing Source Connector', desc: isHi ? 'दर सीमा एवं रोबोट नीतियां' : 'Rate limits, headers & robots policy' },
    { id: 2, name: isHi ? 'किराया प्रेक्षण उद्धरण प्राप्ति' : 'Retrieving Fare Observations', desc: isHi ? 'कच्चे किराया पेलोड का संकलन' : 'Fetching flight quote payloads' },
    { id: 3, name: isHi ? 'किराया रिकॉर्ड्स पार्सिंग' : 'Parsing Fare Records', desc: isHi ? 'मध्यवर्ती स्कीमा निष्कर्षण' : 'Parsing vendor JSON/XML records' },
    { id: 4, name: isHi ? 'अनिवार्य फ़ील्ड एवं वित्तीय सत्यापन' : 'Validating Required Fields', desc: isHi ? 'गैर-नकारात्मकता एवं कोड जांच' : 'Financial sanity & IATA code checks', conceptId: 'validation' },
    { id: 5, name: isHi ? 'मुद्रा एवं मेटाडेटा सामान्यीकरण' : 'Normalizing Currency & Metadata', desc: isHi ? 'INR मानकीकरण एवं केबिन वर्ग' : 'Standardizing INR & cabin classes', conceptId: 'normalization' },
    { id: 6, name: isHi ? 'निर्धारक डुप्लीकेशन पहचान' : 'Detecting Duplicate Observations', desc: isHi ? 'समग्र कुंजी से दोहराव निष्कासन' : 'Composite deterministic signature audit', conceptId: 'deduplication' },
    { id: 7, name: isHi ? 'स्वच्छ प्रेक्षण अभिलेखन' : 'Recording Clean Observations', desc: isHi ? 'अस्वीकृत रिकॉर्ड्स का पृथक्करण' : 'Isolating verified fare dataset' },
    { id: 8, name: isHi ? 'क्रिप्टोग्राफ़िक स्रोत हैश (SHA-256)' : 'Generating Provenance Hash', desc: isHi ? 'अपरिवर्तनीय ऑडिट हैश निर्माण' : 'Computing 256-bit tamper-evident digest', conceptId: 'provenance' },
    { id: 9, name: isHi ? 'सूचकांक गणना हेतु अग्रसारण' : 'Ready for Index Processing', desc: isHi ? 'मूल्य सापेक्ष (R_i) पाइपलाइन तैयार' : 'Queueing clean observations for R_i', conceptId: 'clean-fare-database' }
  ];

  // Load initial sources, history & scenarios
  useEffect(() => {
    loadSources();
    loadHistory();
    loadScenarios();
  }, []);

  const loadSources = async () => {
    try {
      const res = await api.getAcquisitionSources();
      if (res && res.sources) {
        setSources(res.sources);
      }
    } catch (err) {
      console.error('Failed to load acquisition sources:', err);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await api.getAcquisitionHistory(10);
      if (res && res.runs) {
        setHistory(res.runs);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const loadScenarios = async () => {
    try {
      const res = await api.getAcquisitionScenarios();
      if (res && res.scenarios) {
        setScenarios(res.scenarios);
      }
    } catch (err) {
      console.error('Failed to load acquisition scenarios:', err);
    }
  };

  // Run Acquisition Pipeline
  const handleRunPipeline = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setError(null);
    setActiveStageIndex(0);

    // Simulate animated step-by-step progress through the 9 stages
    for (let i = 0; i < 9; i++) {
      setActiveStageIndex(i);
      await new Promise((resolve) => setTimeout(resolve, 140));
    }

    try {
      const res = await api.runAcquisitionPipeline(selectedSource, selectedRoute, selectedWindow);
      if (res && res.data) {
        setRunResult(res.data);
        loadHistory();
        notifyAcquisitionCompleted();
        // Load comparison audit against the previous run
        try {
          const compRes = await api.getAcquisitionCompare(res.data.run_id);
          if (compRes && compRes.audit) {
            setComparisonAudit(compRes.audit);
          }
        } catch (cErr) {
          console.warn('Failed to load previous vs current comparison audit:', cErr);
        }
      }
    } catch (err) {
      setError(err.message || 'Pipeline execution encountered an error');
    } finally {
      setIsRunning(false);
      setActiveStageIndex(-1);
    }
  };

  const handleCopyHash = (hash) => {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const openConcept = (conceptId, title, titleHi) => {
    openContextualWindow({
      id: conceptId,
      type: 'acquisition-concept',
      title: title,
      titleHi: titleHi,
      data: { conceptId }
    });
  };

  const formatINR = (val) => {
    if (val === undefined || val === null) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val);
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 1. Header & Honesty Notice */}
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
                {isHi ? 'वायु किराया अधिग्रहण प्रयोगशाला' : 'Airfare Acquisition Lab'}
              </h1>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.3rem 0.75rem',
                backgroundColor: '#ffedd5',
                color: '#c2410c',
                border: '1px solid #fed7aa',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '700',
                letterSpacing: '0.04em'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#c2410c' }}></span>
                {isHi ? '🟠 वायु किराया अधिग्रहण प्रदर्शन' : '🟠 AIRFARE ACQUISITION DEMONSTRATION'}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#475569', maxWidth: '900px', lineHeight: '1.5' }}>
              {isHi
                ? 'पारदर्शी प्रदर्शन कि पुष्पक मूल्य सूचकांक निर्माण से पूर्व वायु किराया प्रेक्षणों का अधिग्रहण, सत्यापन, सामान्यीकरण और डी-डुप्लीकेशन कैसे करता है।'
                : 'Transparent demonstration of how PUSHPAK acquires, validates, normalizes, and deduplicates airfare observations before index construction.'}
            </p>
          </div>
        </div>

        {/* Strict Honesty Callout */}
        <div style={{
          padding: '0.85rem 1.15rem',
          backgroundColor: '#fffbeb',
          border: '1px solid #fef3c7',
          borderLeft: '4px solid #f59e0b',
          borderRadius: '0 8px 8px 0',
          marginTop: '1rem',
          fontSize: '0.85rem',
          color: '#92400e',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <Info size={18} style={{ flexShrink: 0, color: '#d97706' }} />
          <span>
            <strong>{isHi ? 'डेटा सत्यनिष्ठा सूचना: ' : 'Data Honesty Guarantee: '}</strong>
            {isHi
              ? 'यह प्रोटोटाइप अधिग्रहण वास्तुकला और प्रसंस्करण पाइपलाइन का वास्तविक प्रदर्शन करता है। प्रदर्शन प्रेक्षण स्पष्ट रूप से पहचाने गए हैं और कभी भी मनगढ़ंत लाइव बाजार मूल्य के रूप में प्रस्तुत नहीं किए जाते हैं।'
              : 'This prototype demonstrates the acquisition architecture and processing pipeline. Demonstration observations are clearly identified and are never presented as fabricated live market prices.'}
          </span>
        </div>
      </div>

      {/* 2. Pipeline Controls & Configuration */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Source Connector Selection */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.5rem' }}>
            {isHi ? 'अधिग्रहण स्रोत कनेक्टर' : 'Acquisition Source Connector'}
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {sources.map((src) => {
              const isActive = src.status === 'active';
              const isSelected = selectedSource === src.source_id;
              return (
                <div
                  key={src.source_id}
                  onClick={() => isActive && setSelectedSource(src.source_id)}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    border: isSelected ? '2px solid #0f766e' : '1px solid #e2e8f0',
                    backgroundColor: isSelected ? '#f0fdfa' : (isActive ? '#ffffff' : '#f8fafc'),
                    cursor: isActive ? 'pointer' : 'not-allowed',
                    opacity: isActive ? 1 : 0.7,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.9rem', color: isSelected ? '#0f766e' : '#1e293b' }}>
                      {src.source_name}
                    </span>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: isActive ? '#dcfce7' : (src.status === 'architecture_ready' ? '#e0f2fe' : '#f1f5f9'),
                      color: isActive ? '#166534' : (src.status === 'architecture_ready' ? '#0369a1' : '#475569')
                    }}>
                      {isActive ? (isHi ? 'सक्रिय प्रदर्शन' : 'Active Demo') : (src.status === 'architecture_ready' ? 'Architecture Ready' : 'Planned Connector')}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: '1.4' }}>
                    {src.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Route & Booking Horizon Configuration */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.4rem' }}>
                {isHi ? 'घरेलू गलियारा (Domestic Corridor)' : 'Target Domestic Corridor'}
              </label>
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#0f172a'
                }}
              >
                {availableRoutes.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.code} — {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.4rem' }}>
                {isHi ? 'अग्रिम खरीद क्षितिज (Advance Purchase Window)' : 'Advance Booking Horizon'}
              </label>
              <select
                value={selectedWindow}
                onChange={(e) => setSelectedWindow(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#0f172a'
                }}
              >
                {advanceWindows.map((w) => (
                  <option key={w.days} value={w.days}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Prominent Action Button */}
          <div>
            <button
              onClick={handleRunPipeline}
              disabled={isRunning}
              style={{
                width: '100%',
                padding: '0.85rem 1.5rem',
                backgroundColor: isRunning ? '#94a3b8' : '#0f766e',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: isRunning ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(15, 118, 110, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              <Play size={18} fill={isRunning ? 'none' : '#ffffff'} />
              <span>
                {isRunning 
                  ? (isHi ? 'अधिग्रहण पाइपलाइन निष्पादित हो रही है...' : 'Executing Acquisition Pipeline...') 
                  : (isHi ? 'अधिग्रहण पाइपलाइन चलाएँ (Run Pipeline)' : 'Run Acquisition Pipeline')}
              </span>
            </button>
            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
              {isHi ? '9-चरणीय सत्यापन, सामान्यीकरण एवं डुप्लीकेशन निष्कासन निष्पादित करता है' : 'Executes 9-stage parsing, schema validation, normalization & deduplication'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Visual 9-Stage Pipeline Tracker */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '12px',
        padding: '1.75rem 2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: '#0f172a' }}>
              {isHi ? '9-चरणीय वायु किराया अधिग्रहण पाइपलाइन' : '9-Stage Airfare Acquisition Pipeline'}
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              {isHi ? 'प्रत्येक चरण इंटरैक्टिव है। विस्तृत कार्यप्रणाली देखने हेतु किसी भी चरण पर क्लिक करें।' : 'Every stage is interactive. Click any major stage to inspect validation criteria and methodology.'}
            </p>
          </div>
          {runResult && (
            <span style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              padding: '0.25rem 0.75rem',
              backgroundColor: '#dcfce7',
              color: '#166534',
              borderRadius: '6px'
            }}>
              {isHi ? '✓ अंतिम रन सफल' : '✓ Last Run Completed'}
            </span>
          )}
        </div>

        {/* Horizontal Pipeline Stages Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.65rem'
        }}>
          {pipelineStageDefinitions.map((stage, idx) => {
            const isCurrent = isRunning && activeStageIndex === idx;
            const isCompleted = (runResult && !isRunning) || (isRunning && activeStageIndex > idx);
            const isClickable = Boolean(stage.conceptId);

            return (
              <div
                key={stage.id}
                onClick={() => {
                  if (stage.conceptId) {
                    openConcept(stage.conceptId, stage.name, stage.name);
                  }
                }}
                style={{
                  padding: '0.75rem 0.65rem',
                  borderRadius: '8px',
                  backgroundColor: isCurrent ? '#fef3c7' : (isCompleted ? '#f0fdfa' : '#f8fafc'),
                  border: isCurrent ? '2px solid #f59e0b' : (isCompleted ? '1px solid #99f6e4' : '1px solid #e2e8f0'),
                  cursor: isClickable ? 'pointer' : 'default',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
                title={isClickable ? (isHi ? 'क्लिक करके विस्तृत कार्यप्रणाली देखें' : 'Click to inspect methodology') : undefined}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: '800',
                    color: isCurrent ? '#d97706' : (isCompleted ? '#0f766e' : '#94a3b8'),
                    backgroundColor: isCurrent ? '#fffbeb' : (isCompleted ? '#ccfbf1' : '#e2e8f0'),
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px'
                  }}>
                    #{stage.id}
                  </span>
                  {isClickable && (
                    <HelpCircle size={12} color="#0f766e" />
                  )}
                </div>

                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: isCompleted ? '#0f766e' : '#1e293b',
                  lineHeight: '1.3',
                  marginBottom: '0.25rem'
                }}>
                  {stage.name}
                </div>

                <div style={{ fontSize: '0.68rem', color: '#64748b', lineHeight: '1.2' }}>
                  {stage.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Acquisition Results Summary Panel */}
      {runResult && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '12px',
          padding: '1.75rem 2rem',
          boxShadow: '0 2px 10px -2px rgba(15, 23, 42, 0.06)'
        }}>
          {/* Guided Demo Step 2 Banner */}
          {isDemoActive && currentStep >= 2 && (
            <div style={{
              padding: '1rem 1.35rem',
              backgroundColor: '#0f766e',
              color: '#ffffff',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.85rem',
              boxShadow: '0 4px 12px rgba(15, 118, 110, 0.25)',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle2 size={20} color="#5eead4" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: '800', fontSize: '0.92rem' }}>
                    {isHi ? 'स्वच्छ प्रेक्षण अब विश्लेषणात्मक प्रसंस्करण हेतु उपलब्ध हैं।' : 'Clean observations are now available for analytical processing.'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#ccfbf1' }}>
                    {isHi ? '9-चरणीय सत्यापन एवं डी-डुप्लीकेशन पूर्ण। गलियारा किराया आसूचना की ओर बढ़ें।' : 'Validated & deduplicated fare records ready. Proceed to Corridor Fare Intelligence.'}
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
                <span>{isHi ? 'किराया आसूचना पर आगे बढ़ें →' : 'Continue to Fare Intelligence →'}</span>
              </button>
            </div>
          )}

          {/* Header & Identifiers */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', pb: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em' }}>
                {isHi ? 'अधिग्रहण परिणाम सारांश' : 'Acquisition Execution Summary'}
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span>{runResult.route_code}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748b' }}>
                  ({runResult.source_name} • T+{runResult.advance_purchase_window})
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8' }}>RUN ID</div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', fontFamily: 'monospace', color: '#1e293b' }}>{runResult.run_id}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8' }}>TIMESTAMP (UTC)</div>
                <div style={{ fontSize: '0.82rem', color: '#475569' }}>{new Date(runResult.observation_timestamp).toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Active Demonstration Scenario Indicator */}
          {runResult.scenario && (
            <div style={{
              marginBottom: '1.25rem',
              padding: '0.85rem 1.15rem',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.2rem 0.6rem',
                    backgroundColor: '#dcfce7',
                    border: '1px solid #86efac',
                    borderRadius: '9999px',
                    fontSize: '0.78rem',
                    fontWeight: '800',
                    color: '#166534'
                  }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#16a34a' }}></span>
                    {isHi ? `प्रदर्शन परिदृश्य ${(runResult.scenario.index ?? 0) + 1} / 5` : `CYCLE SCENARIO ${(runResult.scenario.index ?? 0) + 1} OF 5`}
                  </span>
                  <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a' }}>
                    {runResult.scenario.label}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '600' }}>
                    {isHi ? 'बाजार किराया गुणक:' : 'Market Multiplier:'}
                  </span>
                  <span style={{
                    fontSize: '0.82rem',
                    fontWeight: '800',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: (runResult.scenario.fare_multiplier ?? 1) > 1 ? '#ffedd5' : ((runResult.scenario.fare_multiplier ?? 1) < 1 ? '#dcfce7' : '#f1f5f9'),
                    color: (runResult.scenario.fare_multiplier ?? 1) > 1 ? '#c2410c' : ((runResult.scenario.fare_multiplier ?? 1) < 1 ? '#15803d' : '#334155')
                  }}>
                    {runResult.scenario.fare_multiplier ? runResult.scenario.fare_multiplier.toFixed(3) : '1.000'}x ({(( (runResult.scenario.fare_multiplier ?? 1) - 1.0) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>

              {/* Scenario Cycle Stepper Pills */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  { idx: 0, label: '1: Baseline (1.00x)' },
                  { idx: 1, label: '2: Uptick (+3.5%)' },
                  { idx: 2, label: '3: Correction (-2.8%)' },
                  { idx: 3, label: '4: Surge (+6.1%)' },
                  { idx: 4, label: '5: High Vol (+2.8%)' },
                ].map((s) => {
                  const isActive = runResult.scenario.index === s.idx;
                  return (
                    <span
                      key={s.idx}
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                        backgroundColor: isActive ? '#0f766e' : '#ffffff',
                        color: isActive ? '#ffffff' : '#64748b',
                        border: isActive ? '1px solid #0f766e' : '1px solid #cbd5e1',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isActive ? `● ${s.label}` : s.label}
                    </span>
                  );
                })}
              </div>

              {runResult.scenario.note && (
                <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: '1.4' }}>
                  <strong>Scenario Insight: </strong>{runResult.scenario.note}
                </div>
              )}
            </div>
          )}

          {/* Metric Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b' }}>
                {isHi ? 'प्राप्त रिकॉर्ड्स' : 'Records Retrieved'}
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>
                {runResult.records_retrieved}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Raw flight quote payloads</div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', color: '#166534' }}>
                {isHi ? 'सत्यापित रिकॉर्ड्स' : 'Records Validated'}
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#166534' }}>
                {runResult.records_validated}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#15803d' }}>Passed schema & financial checks</div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', color: '#9a3412' }}>
                {isHi ? 'हटाए गए डुप्लिकेट्स' : 'Duplicates Removed'}
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#c2410c' }}>
                {runResult.duplicates_detected}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#9a3412' }}>Filtered via composite key</div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', color: '#1e3a8a' }}>
                {isHi ? 'स्वीकृत स्वच्छ रिकॉर्ड्स' : 'Records Accepted'}
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e3a8a' }}>
                {runResult.records_accepted}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#1d4ed8' }}>Stored in clean database</div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', color: '#991b1b' }}>
                {isHi ? 'अस्वीकृत / त्यागे गए' : 'Records Rejected'}
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#b91c1c' }}>
                {runResult.records_rejected}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#991b1b' }}>Schema defects + duplicates</div>
            </div>
          </div>

          {/* Cryptographic SHA-256 Provenance Bar */}
          <div style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: '#0f172a',
            borderRadius: '8px',
            color: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <ShieldCheck size={18} color="#38bdf8" />
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {isHi ? 'क्रिप्टोग्राफ़िक स्रोत अखंडता हैश (SHA-256)' : 'Cryptographic Provenance Hash (SHA-256)'}:
                </span>
                <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: '#38bdf8' }}>
                  {runResult.provenance_hash}
                </div>
              </div>
            </div>
            <button
              onClick={() => handleCopyHash(runResult.provenance_hash)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '0.35rem 0.75rem',
                backgroundColor: '#1e293b',
                color: '#e2e8f0',
                border: '1px solid #475569',
                borderRadius: '6px',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              <Copy size={13} />
              <span>{copiedHash ? (isHi ? 'कॉपी किया गया!' : 'Copied!') : (isHi ? 'हैश कॉपी करें' : 'Copy Hash')}</span>
            </button>
          </div>

          {/* 4B. Previous vs Current Acquisition Audit Panel */}
          {comparisonAudit && (
            <div style={{
              marginBottom: '1.5rem',
              padding: '1.25rem 1.5rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <GitCompare size={18} color="#0f766e" />
                  <span style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {isHi ? 'पिछले बनाम वर्तमान अधिग्रहण चक्र तुलना (Audit Continuity)' : 'Previous vs Current Acquisition Audit'}
                  </span>
                </div>

                {comparisonAudit.has_previous ? (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    backgroundColor: comparisonAudit.fare_audit?.mean_fare?.direction === 'INCREASED' ? '#fee2e2' : (comparisonAudit.fare_audit?.mean_fare?.direction === 'DECREASED' ? '#dcfce7' : '#e0f2fe'),
                    color: comparisonAudit.fare_audit?.mean_fare?.direction === 'INCREASED' ? '#b91c1c' : (comparisonAudit.fare_audit?.mean_fare?.direction === 'DECREASED' ? '#15803d' : '#0369a1'),
                    border: `1px solid ${comparisonAudit.fare_audit?.mean_fare?.direction === 'INCREASED' ? '#fca5a5' : (comparisonAudit.fare_audit?.mean_fare?.direction === 'DECREASED' ? '#86efac' : '#7dd3fc')}`
                  }}>
                    {comparisonAudit.fare_audit?.mean_fare?.direction === 'INCREASED' && <ArrowUpRight size={13} />}
                    {comparisonAudit.fare_audit?.mean_fare?.direction === 'DECREASED' && <ArrowDownRight size={13} />}
                    {comparisonAudit.status_label || 'COMPARISON ACTIVE'}
                    {comparisonAudit.pct_mean_fare_movement !== null && comparisonAudit.pct_mean_fare_movement !== undefined && ` (${comparisonAudit.pct_mean_fare_movement > 0 ? '+' : ''}${comparisonAudit.pct_mean_fare_movement}%)`}
                  </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '0.25rem 0.75rem', borderRadius: '9999px', backgroundColor: '#e2e8f0', color: '#475569' }}>
                    {isHi ? 'प्रारंभिक संदर्भ चक्र (Baseline)' : 'Initial Reference Cycle (Baseline)'}
                  </span>
                )}
              </div>

              {comparisonAudit.has_previous ? (
                <>
                  {/* KPI Comparison Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '0.85rem',
                    marginBottom: '1rem'
                  }}>
                    {/* 1. Records Retrieved Delta */}
                    <div style={{ padding: '0.75rem 1rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
                        {isHi ? 'प्राप्त रिकॉर्ड्स अंतर' : 'Retrieved Delta'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.2rem' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                          {comparisonAudit.pipeline_audit?.records_retrieved?.current}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          prev: {comparisonAudit.pipeline_audit?.records_retrieved?.previous}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          color: (comparisonAudit.delta_records_retrieved ?? 0) >= 0 ? '#0f766e' : '#c2410c'
                        }}>
                          {(comparisonAudit.delta_records_retrieved ?? 0) >= 0 ? `+${comparisonAudit.delta_records_retrieved}` : comparisonAudit.delta_records_retrieved}
                        </span>
                      </div>
                    </div>

                    {/* 2. Accepted Records Delta */}
                    <div style={{ padding: '0.75rem 1rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
                        {isHi ? 'स्वीकृत रिकॉर्ड्स अंतर' : 'Accepted Delta'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.2rem' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#166534' }}>
                          {comparisonAudit.pipeline_audit?.records_accepted?.current}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          prev: {comparisonAudit.pipeline_audit?.records_accepted?.previous}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          color: (comparisonAudit.delta_records_accepted ?? 0) >= 0 ? '#166534' : '#c2410c'
                        }}>
                          {(comparisonAudit.delta_records_accepted ?? 0) >= 0 ? `+${comparisonAudit.delta_records_accepted}` : comparisonAudit.delta_records_accepted}
                        </span>
                      </div>
                    </div>

                    {/* 3. Duplicates Delta */}
                    <div style={{ padding: '0.75rem 1rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
                        {isHi ? 'डुप्लिकेट्स अंतर' : 'Duplicates Delta'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.2rem' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#c2410c' }}>
                          {comparisonAudit.pipeline_audit?.duplicates_detected?.current}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          prev: {comparisonAudit.pipeline_audit?.duplicates_detected?.previous}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          color: '#64748b'
                        }}>
                          {(comparisonAudit.delta_duplicates_detected ?? 0) >= 0 ? `+${comparisonAudit.delta_duplicates_detected}` : comparisonAudit.delta_duplicates_detected}
                        </span>
                      </div>
                    </div>

                    {/* 4. Mean Fare Movement */}
                    <div style={{ padding: '0.75rem 1rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
                        {isHi ? 'औसत किराया गतिशीलता' : 'Average Fare Shift'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f766e' }}>
                          {formatINR(comparisonAudit.current_stats?.mean)}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          vs {formatINR(comparisonAudit.previous_stats?.mean)}
                        </span>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          padding: '0.1rem 0.35rem',
                          borderRadius: '4px',
                          backgroundColor: (comparisonAudit.pct_mean_fare_movement ?? 0) > 0 ? '#fee2e2' : ((comparisonAudit.pct_mean_fare_movement ?? 0) < 0 ? '#dcfce7' : '#f1f5f9'),
                          color: (comparisonAudit.pct_mean_fare_movement ?? 0) > 0 ? '#b91c1c' : ((comparisonAudit.pct_mean_fare_movement ?? 0) < 0 ? '#15803d' : '#475569')
                        }}>
                          {(comparisonAudit.pct_mean_fare_movement ?? 0) > 0 ? `▲ +${comparisonAudit.pct_mean_fare_movement}%` : `${comparisonAudit.pct_mean_fare_movement ?? 0}%`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Cryptographic Continuity Bar */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#ffffff',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    color: '#475569'
                  }}>
                    <div>
                      <span style={{ fontWeight: '700', color: '#64748b' }}>Previous Hash: </span>
                      <span style={{ fontFamily: 'monospace' }}>{comparisonAudit.previous_run?.provenance_hash ? `${comparisonAudit.previous_run.provenance_hash.slice(0, 16)}...` : '—'}</span>
                    </div>
                    <ArrowRight size={14} color="#94a3b8" />
                    <div>
                      <span style={{ fontWeight: '700', color: '#0f766e' }}>Current Hash: </span>
                      <span style={{ fontFamily: 'monospace', color: '#0f766e', fontWeight: '700' }}>{comparisonAudit.current_run?.provenance_hash ? `${comparisonAudit.current_run.provenance_hash.slice(0, 16)}...` : '—'}</span>
                    </div>
                    <span style={{ color: '#16a34a', fontWeight: '700' }}>✓ Traceable Cryptographic Chain</span>
                  </div>
                </>
              ) : (
                <div style={{ fontSize: '0.82rem', color: '#64748b', fontStyle: 'italic' }}>
                  {isHi
                    ? 'यह पहला अधिग्रहण चक्र है जो बेसलाइन स्थापित करता है। दोबारा रन करें ताकि दो चक्रों के बीच अंतर व किराया बदलाव की तुलना देखी जा सके।'
                    : 'Initial acquisition run established as baseline. Run another acquisition cycle to view previous vs current audit comparison and fare movement.'}
                </div>
              )}
            </div>
          )}

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #cbd5e1', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('accepted')}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                fontWeight: '700',
                color: activeTab === 'accepted' ? '#0f766e' : '#64748b',
                borderBottom: activeTab === 'accepted' ? '2px solid #0f766e' : '2px solid transparent',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {isHi ? `स्वीकृत प्रेक्षण (${runResult.accepted_observations.length})` : `Accepted Observations (${runResult.accepted_observations.length})`}
            </button>

            <button
              onClick={() => setActiveTab('rejected')}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                fontWeight: '700',
                color: activeTab === 'rejected' ? '#b91c1c' : '#64748b',
                borderBottom: activeTab === 'rejected' ? '2px solid #b91c1c' : '2px solid transparent',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {isHi ? `अस्वीकृत / डुप्लिकेट्स (${runResult.rejected_observations.length})` : `Rejected / Duplicates (${runResult.rejected_observations.length})`}
            </button>

            {comparisonAudit && comparisonAudit.has_previous && (
              <button
                onClick={() => setActiveTab('comparison')}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: activeTab === 'comparison' ? '#0f766e' : '#64748b',
                  borderBottom: activeTab === 'comparison' ? '2px solid #0f766e' : '2px solid transparent',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {isHi ? 'चक्र तुलना ऑडिट (Deep-Dive)' : 'Cycle Drift Audit (Deep-Dive)'}
              </button>
            )}

            <button
              onClick={() => setActiveTab('history')}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                fontWeight: '700',
                color: activeTab === 'history' ? '#1e3a8a' : '#64748b',
                borderBottom: activeTab === 'history' ? '2px solid #1e3a8a' : '2px solid transparent',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {isHi ? `हालिया रन इतिहास (${history.length})` : `Acquisition Run History (${history.length})`}
            </button>
          </div>

          {/* Tab 1: Accepted Observations Table */}
          {activeTab === 'accepted' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                    <th style={{ padding: '0.65rem 0.85rem', color: '#475569' }}>Route</th>
                    <th style={{ padding: '0.65rem 0.85rem', color: '#475569' }}>Carrier</th>
                    <th style={{ padding: '0.65rem 0.85rem', color: '#475569' }}>Flight ID</th>
                    <th style={{ padding: '0.65rem 0.85rem', color: '#475569' }}>Horizon</th>
                    <th style={{ padding: '0.65rem 0.85rem', color: '#475569' }}>Class</th>
                    <th style={{ padding: '0.65rem 0.85rem', color: '#475569', textAlign: 'right' }}>Base Fare</th>
                    <th style={{ padding: '0.65rem 0.85rem', color: '#475569', textAlign: 'right' }}>Taxes/Fees</th>
                    <th style={{ padding: '0.65rem 0.85rem', color: '#475569', textAlign: 'right' }}>Total Fare</th>
                    <th style={{ padding: '0.65rem 0.85rem', color: '#475569', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {runResult.accepted_observations.map((obs, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.65rem 0.85rem', fontWeight: '700', color: '#0f172a' }}>{obs.route_code}</td>
                      <td style={{ padding: '0.65rem 0.85rem', color: '#334155' }}>{obs.carrier}</td>
                      <td style={{ padding: '0.65rem 0.85rem', fontFamily: 'monospace', color: '#475569' }}>{obs.flight_identifier}</td>
                      <td style={{ padding: '0.65rem 0.85rem', color: '#475569' }}>T+{obs.advance_purchase_window}</td>
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          backgroundColor: obs.fare_class === 'Business' ? '#ede9fe' : (obs.fare_class === 'Premium Economy' ? '#e0f2fe' : '#f1f5f9'),
                          color: obs.fare_class === 'Business' ? '#6d28d9' : (obs.fare_class === 'Premium Economy' ? '#0369a1' : '#334155'),
                          fontWeight: '600'
                        }}>
                          {obs.fare_class}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', color: '#334155' }}>{formatINR(obs.base_fare)}</td>
                      <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', color: '#64748b' }}>{formatINR(obs.taxes)}</td>
                      <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: '700', color: '#0f766e' }}>{formatINR(obs.total_fare)}</td>
                      <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '9999px',
                          backgroundColor: '#dcfce7',
                          color: '#166534',
                          fontWeight: '700'
                        }}>
                          ACCEPTED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 2: Rejected & Duplicate Observations */}
          {activeTab === 'rejected' && (
            <div>
              <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', color: '#991b1b' }}>
                {isHi
                  ? 'यह दृश्य पारदर्शी रूप से दिखाता है कि कौन से प्रेक्षण अस्वीकार किए गए और क्यों। पुष्पक सूचकांक को दूषित होने से बचाने हेतु अपूर्ण फ़ील्ड्स और दोहराव वाले रिकॉर्ड्स को हटाता है।'
                  : 'This audit view transparently exposes which records were discarded and why. PUSHPAK protects index integrity by discarding corrupted schema inputs and duplicate flight quotes.'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {runResult.rejected_observations.map((rej, idx) => (
                  <div key={idx} style={{ padding: '0.85rem 1rem', backgroundColor: '#ffffff', border: '1px solid #fecaca', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: '700', color: '#991b1b', fontSize: '0.88rem' }}>
                        {rej.carrier || 'Unknown Carrier'} • {rej.flight_identifier || 'MISSING FLIGHT ID'} ({rej.route_code})
                      </span>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: rej.duplicate_status === 'DUPLICATE' ? '#ffedd5' : '#fee2e2',
                        color: rej.duplicate_status === 'DUPLICATE' ? '#c2410c' : '#b91c1c'
                      }}>
                        {rej.duplicate_status === 'DUPLICATE' ? 'DUPLICATE OBSERVATION' : 'SCHEMA VALIDATION FAILED'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.25rem' }}>
                      <strong>Reason: </strong> {rej.rejection_reason || 'Validation defect'}
                    </div>
                    {rej.deduplication_key && (
                      <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748b', backgroundColor: '#f8fafc', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                        Signature Key: {rej.deduplication_key}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Comparison Deep-Dive */}
          {activeTab === 'comparison' && comparisonAudit && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '0.75rem 1rem', backgroundColor: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '8px', fontSize: '0.85rem', color: '#0f766e' }}>
                {isHi
                  ? 'गहन ऑडिट दृश्य: यह तालिका पिछले अधिग्रहण चक्र और वर्तमान चक्र के मध्य पाइपलाइन मीट्रिक्स और वित्तीय आंकड़ों की विस्तृत तुलना दर्शाती है।'
                  : 'Deep-Dive Audit View: Detailed side-by-side comparison of pipeline throughput metrics and fare distribution statistics between the previous and current acquisition cycles.'}
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem 1rem', color: '#475569' }}>Metric / Parameter</th>
                      <th style={{ padding: '0.75rem 1rem', color: '#475569' }}>Previous Acquisition Run</th>
                      <th style={{ padding: '0.75rem 1rem', color: '#0f766e' }}>Current Acquisition Run</th>
                      <th style={{ padding: '0.75rem 1rem', color: '#475569', textAlign: 'right' }}>Observed Shift / Delta</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: '700', color: '#0f172a' }}>Acquisition Run ID</td>
                      <td style={{ padding: '0.65rem 1rem', fontFamily: 'monospace', color: '#64748b' }}>{comparisonAudit.previous_run?.run_id || '—'}</td>
                      <td style={{ padding: '0.65rem 1rem', fontFamily: 'monospace', fontWeight: '700', color: '#0f766e' }}>{comparisonAudit.current_run?.run_id}</td>
                      <td style={{ padding: '0.65rem 1rem', textAlign: 'right', color: '#64748b' }}>Sequential Cycle</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: '700', color: '#0f172a' }}>Total Records Retrieved</td>
                      <td style={{ padding: '0.65rem 1rem', color: '#334155' }}>{comparisonAudit.pipeline_audit?.records_retrieved?.previous} records</td>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: '700', color: '#0f172a' }}>{comparisonAudit.pipeline_audit?.records_retrieved?.current} records</td>
                      <td style={{ padding: '0.65rem 1rem', textAlign: 'right', fontWeight: '700', color: (comparisonAudit.delta_records_retrieved ?? 0) >= 0 ? '#0f766e' : '#c2410c' }}>
                        {(comparisonAudit.delta_records_retrieved ?? 0) >= 0 ? `+${comparisonAudit.delta_records_retrieved}` : comparisonAudit.delta_records_retrieved} records
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: '700', color: '#0f172a' }}>Schema Validated</td>
                      <td style={{ padding: '0.65rem 1rem', color: '#334155' }}>{comparisonAudit.pipeline_audit?.records_validated?.previous} records</td>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: '700', color: '#166534' }}>{comparisonAudit.pipeline_audit?.records_validated?.current} records</td>
                      <td style={{ padding: '0.65rem 1rem', textAlign: 'right', fontWeight: '700', color: '#166534' }}>
                        {(comparisonAudit.pipeline_audit?.records_validated?.change ?? 0) >= 0 ? `+${comparisonAudit.pipeline_audit?.records_validated?.change}` : comparisonAudit.pipeline_audit?.records_validated?.change} records
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: '700', color: '#0f172a' }}>Duplicates Detected & Isolated</td>
                      <td style={{ padding: '0.65rem 1rem', color: '#334155' }}>{comparisonAudit.pipeline_audit?.duplicates_detected?.previous} duplicates</td>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: '700', color: '#c2410c' }}>{comparisonAudit.pipeline_audit?.duplicates_detected?.current} duplicates</td>
                      <td style={{ padding: '0.65rem 1rem', textAlign: 'right', fontWeight: '700', color: '#c2410c' }}>
                        {(comparisonAudit.delta_duplicates_detected ?? 0) >= 0 ? `+${comparisonAudit.delta_duplicates_detected}` : comparisonAudit.delta_duplicates_detected} duplicates
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: '700', color: '#0f172a' }}>Accepted Clean Records</td>
                      <td style={{ padding: '0.65rem 1rem', color: '#334155' }}>{comparisonAudit.pipeline_audit?.records_accepted?.previous} observations</td>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: '800', color: '#1e3a8a' }}>{comparisonAudit.pipeline_audit?.records_accepted?.current} observations</td>
                      <td style={{ padding: '0.65rem 1rem', textAlign: 'right', fontWeight: '800', color: (comparisonAudit.delta_records_accepted ?? 0) >= 0 ? '#1e3a8a' : '#c2410c' }}>
                        {(comparisonAudit.delta_records_accepted ?? 0) >= 0 ? `+${comparisonAudit.delta_records_accepted}` : comparisonAudit.delta_records_accepted} observations
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: '700', color: '#0f172a' }}>Mean Total Fare (INR)</td>
                      <td style={{ padding: '0.65rem 1rem', color: '#334155' }}>{formatINR(comparisonAudit.previous_stats?.mean)}</td>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: '800', color: '#0f766e' }}>{formatINR(comparisonAudit.current_stats?.mean)}</td>
                      <td style={{ padding: '0.65rem 1rem', textAlign: 'right', fontWeight: '800' }}>
                        <span style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: (comparisonAudit.pct_mean_fare_movement ?? 0) > 0 ? '#fee2e2' : ((comparisonAudit.pct_mean_fare_movement ?? 0) < 0 ? '#dcfce7' : '#f1f5f9'),
                          color: (comparisonAudit.pct_mean_fare_movement ?? 0) > 0 ? '#b91c1c' : ((comparisonAudit.pct_mean_fare_movement ?? 0) < 0 ? '#15803d' : '#475569')
                        }}>
                          {(comparisonAudit.pct_mean_fare_movement ?? 0) > 0 ? `▲ +${comparisonAudit.pct_mean_fare_movement}%` : `${comparisonAudit.pct_mean_fare_movement ?? 0}%`}
                        </span>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: '700', color: '#0f172a' }}>Median Fare (INR)</td>
                      <td style={{ padding: '0.65rem 1rem', color: '#334155' }}>{formatINR(comparisonAudit.previous_stats?.median)}</td>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: '700', color: '#0f172a' }}>{formatINR(comparisonAudit.current_stats?.median)}</td>
                      <td style={{ padding: '0.65rem 1rem', textAlign: 'right', color: '#64748b' }}>
                        {comparisonAudit.fare_audit?.median_fare?.change !== null ? formatINR(comparisonAudit.fare_audit?.median_fare?.change) : '—'}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: '700', color: '#0f172a' }}>Lowest Observed Fare (Min)</td>
                      <td style={{ padding: '0.65rem 1rem', color: '#334155' }}>{formatINR(comparisonAudit.previous_stats?.min)}</td>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: '700', color: '#15803d' }}>{formatINR(comparisonAudit.current_stats?.min)}</td>
                      <td style={{ padding: '0.65rem 1rem', textAlign: 'right', color: '#64748b' }}>
                        {comparisonAudit.fare_audit?.min_fare?.change !== null ? formatINR(comparisonAudit.fare_audit?.min_fare?.change) : '—'}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: '700', color: '#0f172a' }}>Highest Observed Fare (Max)</td>
                      <td style={{ padding: '0.65rem 1rem', color: '#334155' }}>{formatINR(comparisonAudit.previous_stats?.max)}</td>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: '700', color: '#b91c1c' }}>{formatINR(comparisonAudit.current_stats?.max)}</td>
                      <td style={{ padding: '0.65rem 1rem', textAlign: 'right', color: '#64748b' }}>
                        {comparisonAudit.fare_audit?.max_fare?.change !== null ? formatINR(comparisonAudit.fare_audit?.max_fare?.change) : '—'}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: '700', color: '#0f172a' }}>SHA-256 Provenance Hash</td>
                      <td style={{ padding: '0.65rem 1rem', fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748b' }}>
                        {comparisonAudit.previous_run?.provenance_hash || '—'}
                      </td>
                      <td style={{ padding: '0.65rem 1rem', fontFamily: 'monospace', fontSize: '0.75rem', color: '#0f766e', fontWeight: '700' }}>
                        {comparisonAudit.current_run?.provenance_hash}
                      </td>
                      <td style={{ padding: '0.65rem 1rem', textAlign: 'right', fontSize: '0.75rem', color: '#16a34a', fontWeight: '700' }}>
                        ✓ Cryptographically Distinct
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 4: History */}
          {activeTab === 'history' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                    <th style={{ padding: '0.65rem 0.85rem', color: '#475569' }}>Run ID</th>
                    <th style={{ padding: '0.65rem 0.85rem', color: '#475569' }}>Timestamp</th>
                    <th style={{ padding: '0.65rem 0.85rem', color: '#475569' }}>Route</th>
                    <th style={{ padding: '0.65rem 0.85rem', color: '#475569' }}>Retrieved</th>
                    <th style={{ padding: '0.65rem 0.85rem', color: '#475569' }}>Accepted</th>
                    <th style={{ padding: '0.65rem 0.85rem', color: '#475569' }}>Duplicates</th>
                    <th style={{ padding: '0.65rem 0.85rem', color: '#475569' }}>SHA-256 Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.65rem 0.85rem', fontFamily: 'monospace', fontWeight: '700', color: '#0f172a' }}>{h.run_id}</td>
                      <td style={{ padding: '0.65rem 0.85rem', color: '#64748b' }}>{new Date(h.observation_timestamp).toLocaleTimeString()}</td>
                      <td style={{ padding: '0.65rem 0.85rem', fontWeight: '600' }}>{h.route_code}</td>
                      <td style={{ padding: '0.65rem 0.85rem' }}>{h.records_retrieved}</td>
                      <td style={{ padding: '0.65rem 0.85rem', fontWeight: '700', color: '#0f766e' }}>{h.records_accepted}</td>
                      <td style={{ padding: '0.65rem 0.85rem', color: '#c2410c' }}>{h.duplicates_detected}</td>
                      <td style={{ padding: '0.65rem 0.85rem', fontFamily: 'monospace', fontSize: '0.75rem', color: '#475569' }}>
                        {h.provenance_hash ? `${h.provenance_hash.slice(0, 16)}...` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 5. Connect Acquisition Story to Price Index (Section 8) */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 2px 10px -2px rgba(15, 23, 42, 0.05)'
      }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
            {isHi ? 'अधिग्रहण से सूचकांक निर्माण तक का प्रवाह' : 'End-to-End Flow: From Raw Fare Acquisition to Price Index'}
          </h3>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.88rem', color: '#475569' }}>
            {isHi
              ? 'पुष्पक केवल कीमतें एकत्र नहीं करता। यह कच्चे उद्धरणों को साफ करता है, डुप्लिकेट हटाता है और उन्हें प्रतिनिधि बास्केट में समेकित करता है।'
              : 'Interactive methodological connection: how clean fare observations transition directly into Price Relatives, Route Weights, and the PUSHPAK Price Index.'}
          </p>
        </div>

        {/* Visual Pipeline Horizontal Flow */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          {[
            { step: '1', title: 'AIRFARE ACQUISITION', hi: 'किराया अधिग्रहण', conceptId: 'validation' },
            { step: '2', title: 'VALIDATION', hi: 'सत्यापन', conceptId: 'validation' },
            { step: '3', title: 'DEDUPLICATION', hi: 'डुप्लीकेशन निष्कासन', conceptId: 'deduplication' },
            { step: '4', title: 'CLEAN FARE DATABASE', hi: 'स्वच्छ किराया डेटाबेस', conceptId: 'clean-fare-database' },
            { step: '5', title: 'ROUTE AGGREGATION', hi: 'मार्ग एकत्रीकरण', conceptId: 'price-relatives' },
            { step: '6', title: 'PRICE RELATIVES (Rᵢ)', hi: 'मूल्य सापेक्ष (Rᵢ)', conceptId: 'price-relatives' },
            { step: '7', title: 'ROUTE WEIGHTING (wᵢ)', hi: 'मार्ग भार (wᵢ)', conceptId: 'route-weighting' },
            { step: '8', title: 'PUSHPAK PRICE INDEX', hi: 'पुष्पक मूल्य सूचकांक', conceptId: 'pushpak-index' }
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={() => openConcept(item.conceptId, item.title, item.hi)}
              style={{
                padding: '0.85rem 0.65rem',
                backgroundColor: idx >= 5 ? '#f0fdfa' : '#f8fafc',
                border: idx >= 5 ? '1px solid #99f6e4' : '1px solid #cbd5e1',
                borderRadius: '8px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title={isHi ? 'क्लिक करके गणितीय सूत्र एवं विवरण देखें' : 'Click to inspect mathematical formula & methodology'}
            >
              <div style={{ fontSize: '0.68rem', fontWeight: '800', color: idx >= 5 ? '#0f766e' : '#64748b', marginBottom: '0.25rem' }}>
                STEP {item.step}
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: idx >= 5 ? '#0f766e' : '#1e293b', lineHeight: '1.3' }}>
                {isHi ? item.hi : item.title}
              </div>
            </div>
          ))}
        </div>

        {/* Clean Mathematical Callout Boxes */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem'
        }}>
          {/* Price Relative Card */}
          <div 
            onClick={() => openConcept('price-relatives', 'Price Relatives (Rᵢ)', 'मूल्य सापेक्ष (Rᵢ)')}
            style={{
              padding: '1.25rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#1e3a8a' }}>
                {isHi ? 'मूल्य सापेक्ष सूत्र' : 'Price Relative Formula'}
              </span>
              <HelpCircle size={14} color="#1e3a8a" />
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', fontFamily: 'monospace', color: '#1e3a8a', marginBottom: '0.4rem' }}>
              Rᵢ = Pᵢ,ₜ / Pᵢ,₀
            </div>
            <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: '1.5' }}>
              {isHi
                ? 'Pᵢ,ₜ = वर्तमान प्रेक्षित किराया; Pᵢ,₀ = आधार अवधि किराया (T+45 संदर्भ क्षितिज)।'
                : 'Pᵢ,ₜ = current observed average fare; Pᵢ,₀ = baseline reference fare (T+45 advance purchase horizon).'}
            </div>
          </div>

          {/* Route Weighting Card */}
          <div 
            onClick={() => openConcept('route-weighting', 'Route Weighting (wᵢ)', 'मार्ग भार (wᵢ)')}
            style={{
              padding: '1.25rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#7c3aed' }}>
                {isHi ? 'प्रतिनिधि बास्केट भार' : 'Basket Normalization'}
              </span>
              <HelpCircle size={14} color="#7c3aed" />
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', fontFamily: 'monospace', color: '#7c3aed', marginBottom: '0.4rem' }}>
              Σ wᵢ = 1.0000
            </div>
            <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: '1.5' }}>
              {isHi
                ? 'DEL-BOM (39.92%), DEL-BLR (40.74%), BOM-BLR (19.34%)। भार घरेलू उड़ान मात्रा के अनुपात में हैं।'
                : 'Derived from verified domestic flight schedule volume, ensuring weights sum strictly to unity.'}
            </div>
          </div>

          {/* Laspeyres Aggregation Card */}
          <div 
            onClick={() => openConcept('pushpak-index', 'PUSHPAK Price Index (Iₜ)', 'पुष्पक मूल्य सूचकांक (Iₜ)')}
            style={{
              padding: '1.25rem',
              backgroundColor: '#f0fdfa',
              border: '1px solid #99f6e4',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#0f766e' }}>
                {isHi ? 'लास्पेयर्स सूचकांक सूत्र' : 'Laspeyres Aggregation Formula'}
              </span>
              <HelpCircle size={14} color="#0f766e" />
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', fontFamily: 'monospace', color: '#0f766e', marginBottom: '0.4rem' }}>
              Iₜ = Σ(wᵢ × Rᵢ) × 100
            </div>
            <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: '1.5' }}>
              {isHi
                ? 'प्रत्येक गलियारे के भार (wᵢ) और मूल्य सापेक्ष (Rᵢ) का गुणनफल जोड़कर राष्ट्रीय सूचकांक निर्मित होता है।'
                : 'Aggregates weighted price relatives across all basket corridors into the national Headline and Core index.'}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
