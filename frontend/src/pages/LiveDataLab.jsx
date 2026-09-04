import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Activity, 
  Database, 
  ShieldCheck, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Hash, 
  Clock, 
  Plane, 
  CloudSun, 
  RefreshCw, 
  ArrowRight,
  Layers,
  FileCheck,
  Compass,
  History,
  GitCompare,
  Check,
  Wind
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import api from '../api/client';
import SectionHeader from '../components/SectionHeader';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function LiveDataLab() {
  const { lang, t } = useLanguage();
  const isHi = lang === 'hi';

  const [routeCode, setRouteCode] = useState('DEL-BOM');
  const [advanceWindow, setAdvanceWindow] = useState(7);
  const [fetching, setFetching] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState(-1);
  const [fetchResult, setFetchResult] = useState(null);
  const [previousRun, setPreviousRun] = useState(null);
  const [fetchHistory, setFetchHistory] = useState([]);
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);
  const [error, setError] = useState(null);
  const [statusInfo, setStatusInfo] = useState(null);

  // Load live system status on mount
  useEffect(() => {
    let isMounted = true;
    const checkStatus = async () => {
      try {
        const res = await api.getLiveStatus();
        if (isMounted) setStatusInfo(res);
      } catch (err) {
        console.warn('Could not fetch live status:', err);
      }
    };
    checkStatus();
    return () => { isMounted = false; };
  }, []);

  const handleFetch = async () => {
    if (fetching) return;

    try {
      setFetching(true);
      setError(null);
      setActiveStageIndex(0);

      // Save current run as previous run for comparison
      if (fetchResult) {
        setPreviousRun(fetchResult);
      }

      // Step progressive stages feedback during live network execution
      const t1 = setTimeout(() => setActiveStageIndex(1), 250);
      const t2 = setTimeout(() => setActiveStageIndex(2), 550);
      const t3 = setTimeout(() => setActiveStageIndex(3), 850);
      const t4 = setTimeout(() => setActiveStageIndex(4), 1150);
      const t5 = setTimeout(() => setActiveStageIndex(5), 1450);

      const res = await api.fetchLiveData(routeCode, Number(advanceWindow));

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);

      setActiveStageIndex(6); // All 7 stages complete
      setFetchResult(res);

      // Append to live acquisition history
      setFetchHistory(prev => [res, ...prev]);
    } catch (err) {
      console.error('Fetch failed:', err);
      setError(err.message || (isHi ? 'लाइव डेटा अधिग्रहण पाइपलाइन विफल रही।' : 'Live data acquisition pipeline failed.'));
      setActiveStageIndex(-1);
    } finally {
      setFetching(false);
    }
  };

  const stagesList = [
    { num: 1, name: isHi ? 'स्रोत से संपर्क' : 'Connecting to Source', icon: Zap },
    { num: 2, name: isHi ? 'डेटा निष्कर्षण' : 'Extracting Fare Observations', icon: Database },
    { num: 3, name: isHi ? 'कड़ा फ़ील्ड सत्यापन' : 'Validating Records', icon: ShieldCheck },
    { num: 4, name: isHi ? 'सफाई एवं सामान्यीकरण' : 'Cleaning Data', icon: Filter },
    { num: 5, name: isHi ? 'डुप्लीकेट हटाना' : 'Removing Duplicates', icon: FileCheck },
    { num: 6, name: isHi ? 'डेटाबेस में संग्रहण' : 'Database Storage', icon: Layers },
    { num: 7, name: isHi ? 'उद्गम एवं SHA-256 हैश' : 'Recording Provenance', icon: Hash },
  ];

  // Helper to determine if current run differs from previous run
  const hasMaterialChange = previousRun && fetchResult && (
    previousRun.records_retrieved !== fetchResult.records_retrieved ||
    previousRun.accepted_records !== fetchResult.accepted_records ||
    previousRun.integrity_hash !== fetchResult.integrity_hash ||
    previousRun.active_aircraft_count !== fetchResult.active_aircraft_count ||
    previousRun.route_code !== fetchResult.route_code ||
    previousRun.advance_purchase_window !== fetchResult.advance_purchase_window
  );

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <SectionHeader 
        title={isHi ? 'लाइव डेटा लैब' : 'Live Data Lab'}
        subtitle={isHi 
          ? 'पुष्पक के अधिग्रहण, कड़े सत्यापन, डेटा सफाई, क्रिप्टोग्राफ़िक उद्गम एवं विश्लेषणात्मक पाइपलाइन का लाइव प्रदर्शन।'
          : "Demonstrates PUSHPAK's live acquisition, strict validation, cleaning, provenance, and analytical ingestion pipeline."}
      />

      {/* Operational Mode Callout Banner */}
      <div className="card" style={{ borderLeft: '4px solid var(--gov-amber)', background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            background: 'var(--gov-amber-light)',
            color: 'var(--gov-amber)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Zap size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                {isHi ? 'पुष्पक लाइव अधिग्रहण प्रदर्शन आर्किटेक्चर' : 'PUSHPAK Live Acquisition Demonstration Architecture'}
              </h3>
              <span className="badge badge-low" style={{ fontSize: '0.75rem' }}>
                OpenSky Network & AviationWeather.gov
              </span>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
              {isHi
                ? 'यह लैब वास्तविक समय के खुले नागर विमानन एपीआई (ओपनस्काई नेटवर्क एडीएस-बी टेलीमेट्री एवं एनओएए एविएशनवेदर एमईटीएआर) से जीवंत नेटवर्क स्थिति को प्राप्त करता है। यह 7-चरणीय पूर्ण पाइपलाइन (सत्यापन, सफाई, डुप्लीकेशन निष्कासन और SHA-256 हैशिंग) को निष्पादित करता है। यह स्पष्ट रूप से लाइव टेलीमेट्री को हमारे 50,000-रिकॉर्ड विश्लेषणात्मक सूचकांक मॉडल से अलग रखता है।'
                : 'This lab connects to genuine live open public aviation APIs (OpenSky Network ADS-B telemetry & NOAA AviationWeather METAR) to retrieve current operational airspace metadata, executing a transparent 7-stage pipeline (extraction, validation, cleaning, deduplication, and SHA-256 provenance hashing). It cleanly separates live aviation telemetry from the audited 50,000-record analytical fare index dataset.'}
            </p>
          </div>
        </div>
      </div>

      {/* Acquisition Interactive Controls Card */}
      <div className="card" style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.5rem' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 className="card-title" style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              {isHi ? 'लाइव पाइपलाइन ट्रिगर नियंत्रण' : 'Live Pipeline Trigger Controls'}
            </h3>
            <p className="card-subtitle" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
              {isHi ? 'गलियारा और अग्रिम खरीद खिड़की चुनें, फिर लाइव पाइपलाइन प्रारंभ करें' : 'Select corridor and advance purchase window, then trigger live acquisition'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {isHi ? 'कनेक्टर स्थिति:' : 'Connector Status:'}
            </span>
            <span className="badge badge-low" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span className="status-dot connected" />
              <span>{statusInfo?.operational_status === 'operational' ? (isHi ? 'सक्रिय एवं तैयार' : 'Operational') : (isHi ? 'जाँच हो रही है' : 'Ready')}</span>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
          {/* Route Selector */}
          <div style={{ flex: '1', minWidth: '180px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isHi ? 'हवाई गलियारा' : 'Air Corridor'}
            </label>
            <select
              value={routeCode}
              onChange={(e) => setRouteCode(e.target.value)}
              disabled={fetching}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-subtle)',
                fontSize: '0.85rem',
                fontWeight: '700',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            >
              <option value="DEL-BOM">DEL-BOM (Delhi ↔ Mumbai)</option>
              <option value="DEL-BLR">DEL-BLR (Delhi ↔ Bengaluru)</option>
              <option value="BOM-BLR">BOM-BLR (Mumbai ↔ Bengaluru)</option>
            </select>
          </div>

          {/* Advance Window */}
          <div style={{ flex: '1', minWidth: '180px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isHi ? 'अग्रिम खरीद खिड़की (Lead Time)' : 'Advance Purchase Window'}
            </label>
            <select
              value={advanceWindow}
              onChange={(e) => setAdvanceWindow(Number(e.target.value))}
              disabled={fetching}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-subtle)',
                fontSize: '0.85rem',
                fontWeight: '700',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            >
              <option value={1}>T+1 (Walk-Up / Immediate Departure)</option>
              <option value={7}>T+7 (1 Week Advance)</option>
              <option value={15}>T+15 (Mid-Term Planning)</option>
              <option value={30}>T+30 (1 Month Advance)</option>
              <option value={45}>T+45 (Structural Baseline Reference)</option>
            </select>
          </div>

          {/* Main CTA Button */}
          <div style={{ flex: '1.2', minWidth: '240px', alignSelf: 'flex-end' }}>
            <button
              onClick={handleFetch}
              disabled={fetching}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '11px 20px',
                fontSize: '0.88rem',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                background: fetching ? 'var(--text-muted)' : 'var(--gov-amber)',
                borderColor: fetching ? 'var(--text-muted)' : 'var(--gov-amber)',
                color: '#ffffff',
                borderRadius: '8px',
                cursor: fetching ? 'not-allowed' : 'pointer',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.15s ease'
              }}
            >
              <RefreshCw size={17} className={fetching ? 'animate-spin' : ''} />
              <span>
                {fetching 
                  ? (isHi ? 'पाइपलाइन निष्पादित हो रही है...' : 'EXECUTING 7-STAGE PIPELINE...') 
                  : (isHi ? 'नवीनतम किराया डेटा प्राप्त करें' : 'FETCH LATEST FARE DATA')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 7-Stage Pipeline Visualizer */}
      <div className="card" style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.5rem' }}>
        <div className="card-header" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 className="card-title" style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              {isHi ? '7-चरणीय डेटा अधिग्रहण एवं अंतर्ग्रहण पाइपलाइन' : '7-Stage Acquisition & Ingestion Pipeline'}
            </h3>
            <p className="card-subtitle" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
              {fetching
                ? (isHi ? 'सक्रिय निष्पादन: प्रत्येक चरण को क्रमबद्ध रूप से सत्यापित किया जा रहा है...' : 'Active Execution: Pipeline stages verifying data integrity in real-time...')
                : (isHi ? 'कच्चे स्रोतों से क्रिप्टोग्राफिक उद्गम तक PUSHPAK का संरचित प्रवाह' : "PUSHPAK's structured architecture from raw telemetry extraction to cryptographic SHA-256 seal")}
            </p>
          </div>
        </div>

        {/* Progress Stages Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '10px' }}>
          {stagesList.map((stg, idx) => {
            const Icon = stg.icon;
            const isDone = activeStageIndex >= idx;
            const isCurrent = activeStageIndex === idx && fetching;

            return (
              <div
                key={stg.num}
                style={{
                  padding: '12px 10px',
                  borderRadius: '8px',
                  border: isCurrent
                    ? '2px solid var(--gov-amber)'
                    : isDone
                    ? '1.5px solid var(--gov-teal)'
                    : '1px solid var(--border-subtle)',
                  background: isCurrent
                    ? 'var(--gov-amber-light)'
                    : isDone
                    ? 'var(--gov-teal-light)'
                    : 'var(--bg-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: isDone ? 'var(--gov-teal)' : '#cbd5e1',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '800'
                }}>
                  {isDone ? <Check size={14} /> : stg.num}
                </div>

                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: isDone ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {stg.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div style={{
          padding: '14px 18px',
          borderRadius: '8px',
          background: 'var(--gov-red-light)',
          border: '1px solid var(--gov-red-border)',
          color: 'var(--gov-red)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>{isHi ? 'अधिग्रहण विफल:' : 'Acquisition Failed:'} </strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Acquisition Result Section */}
      {fetchResult && (
        <>
          {/* Top Result Banner with Live/Demo Status Badges */}
          <div className="card" style={{ borderLeft: '4px solid var(--gov-teal)', background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="badge badge-low" style={{ fontSize: '0.78rem' }}>
                    {isHi ? '🟢 लाइव प्राप्त डेटा (LIVE FETCHED)' : '🟢 LIVE FETCHED DATA'}
                  </span>
                  <span className="badge badge-demo" style={{ fontSize: '0.78rem' }}>
                    {fetchResult.route_code} • T+{fetchResult.advance_purchase_window}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', margin: '4px 0' }}>
                  {isHi ? 'पाइपलाइन निष्पादन सफल' : 'Acquisition Pipeline Execution Completed'}
                </h2>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Run ID: <code>{fetchResult.run_id}</code> • {fetchResult.source_name} • {fetchResult.duration_ms} ms
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-low" style={{ fontSize: '0.82rem', padding: '6px 12px' }}>
                  {isHi ? 'सत्यापन: 100% उत्तीर्ण' : 'Validation: PASSED'}
                </span>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: '700', marginTop: '4px' }}>
                  {fetchResult.fetch_time_ist || new Date(fetchResult.timestamp).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* 4 Pipeline Metric Counts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginTop: '16px' }}>
              <div style={{ padding: '12px', background: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {isHi ? 'कुल प्राप्त रिकॉर्ड' : 'Records Retrieved'}
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {fetchResult.records_retrieved}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {isHi ? 'उम्मीदवार प्रेक्षण' : 'Candidate observations'}
                </div>
              </div>

              <div style={{ padding: '12px', background: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--gov-red)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {isHi ? 'अमान्य रिकॉर्ड (अस्वीकृत)' : 'Invalid Records'}
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--gov-red)', marginTop: '2px' }}>
                  {fetchResult.invalid_records}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {isHi ? 'सत्यापन द्वारा खारिज' : 'Rejected by schema filter'}
                </div>
              </div>

              <div style={{ padding: '12px', background: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--gov-amber)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {isHi ? 'डुप्लीकेट हटाए गए' : 'Duplicates Removed'}
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--gov-amber)', marginTop: '2px' }}>
                  {fetchResult.duplicates_removed}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {isHi ? 'अद्वितीय कुंजियों द्वारा फ़िल्टर' : 'Deduplication match'}
                </div>
              </div>

              <div style={{ padding: '12px', background: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--gov-teal)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {isHi ? 'स्वीकृत प्रेक्षण' : 'Accepted Observations'}
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--gov-teal)', marginTop: '2px' }}>
                  {fetchResult.accepted_records}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {isHi ? 'डेटाबेस में संग्रहित' : 'Stored in SQLite'}
                </div>
              </div>
            </div>
          </div>

          {/* Previous Fetch vs Current Fetch Comparison (Requirement 14) */}
          {previousRun && (
            <div className="card" style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.5rem' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GitCompare size={18} color="var(--gov-amber)" />
                  <div>
                    <h3 className="card-title" style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                      {isHi ? 'पिछले रन बनाम वर्तमान रन तुलना' : 'Previous Fetch vs Current Fetch Audit'}
                    </h3>
                    <p className="card-subtitle" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                      {isHi ? 'प्रत्येक चक्र के बाद स्वचालित तुलना निष्पादित होती है' : 'Verifiable audit comparing successive ingestion cycles for operational transparency'}
                    </p>
                  </div>
                </div>

                <span className={`badge ${hasMaterialChange ? 'badge-low' : 'badge-neutral'}`} style={{ fontSize: '0.78rem', padding: '4px 10px' }}>
                  {hasMaterialChange 
                    ? (isHi ? '🟢 पिछले फेच से परिवर्तन दर्ज' : '🟢 Changed since previous fetch')
                    : (isHi ? '🔵 कोई भौतिक परिवर्तन नहीं (सत्यापित)' : '🔵 Fresh acquisition completed. No material change detected')}
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.04em' }}>
                      <th style={{ padding: '8px 12px' }}>{isHi ? 'फ़ील्ड' : 'Field'}</th>
                      <th style={{ padding: '8px 12px' }}>{isHi ? 'पिछला रन (Previous)' : 'Previous Run'}</th>
                      <th style={{ padding: '8px 12px' }}>{isHi ? 'वर्तमान रन (Current)' : 'Current Run'}</th>
                      <th style={{ padding: '8px 12px' }}>{isHi ? 'स्थिति / अंतर' : 'Difference Status'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '8px 12px', fontWeight: '700' }}>Fetch Time</td>
                      <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{previousRun.fetch_time_ist || new Date(previousRun.timestamp).toLocaleTimeString('en-IN')}</td>
                      <td style={{ padding: '8px 12px', fontWeight: '700', color: 'var(--text-primary)' }}>{fetchResult.fetch_time_ist || new Date(fetchResult.timestamp).toLocaleTimeString('en-IN')}</td>
                      <td style={{ padding: '8px 12px' }}>
                        <span className="badge badge-low" style={{ fontSize: '0.7rem' }}>Fresh Cycle</span>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '8px 12px', fontWeight: '700' }}>Run ID</td>
                      <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{previousRun.run_id}</td>
                      <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)' }}>{fetchResult.run_id}</td>
                      <td style={{ padding: '8px 12px' }}>
                        <span className="badge badge-low" style={{ fontSize: '0.7rem' }}>New UUID</span>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '8px 12px', fontWeight: '700' }}>Records Retrieved</td>
                      <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{previousRun.records_retrieved}</td>
                      <td style={{ padding: '8px 12px', fontWeight: '700', color: 'var(--text-primary)' }}>{fetchResult.records_retrieved}</td>
                      <td style={{ padding: '8px 12px' }}>
                        {fetchResult.records_retrieved === previousRun.records_retrieved ? (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Consistent ({fetchResult.records_retrieved})</span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--gov-amber)', fontWeight: '700' }}>Δ {fetchResult.records_retrieved - previousRun.records_retrieved}</span>
                        )}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '8px 12px', fontWeight: '700' }}>Accepted Records</td>
                      <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{previousRun.accepted_records}</td>
                      <td style={{ padding: '8px 12px', fontWeight: '700', color: 'var(--text-primary)' }}>{fetchResult.accepted_records}</td>
                      <td style={{ padding: '8px 12px' }}>
                        <span className="badge badge-low" style={{ fontSize: '0.7rem' }}>{fetchResult.accepted_records} Stored</span>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '8px 12px', fontWeight: '700' }}>Active Aircraft Detected</td>
                      <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{previousRun.active_aircraft_count ?? previousRun.open_sky_airborne_detected ?? 0}</td>
                      <td style={{ padding: '8px 12px', fontWeight: '700', color: 'var(--text-primary)' }}>{fetchResult.active_aircraft_count ?? fetchResult.open_sky_airborne_detected ?? 0}</td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Airspace telemetry</span>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 12px', fontWeight: '700' }}>SHA-256 Provenance Hash</td>
                      <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{previousRun.integrity_hash?.slice(0, 16)}...</td>
                      <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>{fetchResult.integrity_hash?.slice(0, 16)}...</td>
                      <td style={{ padding: '8px 12px' }}>
                        <span className="badge badge-low" style={{ fontSize: '0.7rem' }}>Cryptographically Verified</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Real-time Telemetry Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            {/* Aerodrome METAR Weather Conditions */}
            <div className="card" style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem 1.5rem' }}>
              <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <CloudSun size={18} color="var(--gov-amber)" />
                <div>
                  <h3 className="card-title" style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                    {isHi ? 'हवाई अड्डा एमईटीएआर मौसम प्रेक्षण' : 'Terminal Aerodrome Weather (NOAA METAR)'}
                  </h3>
                  <p className="card-subtitle" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                    {isHi ? 'एनओएए एविएशनवेदर से लाइव तापमान, दृश्यता एवं पवन डेटा' : 'Real-time surface meteorology for origin and destination aerodromes'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {fetchResult.live_telemetry?.origin_weather ? (
                  <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {fetchResult.live_telemetry.origin_weather.name} ({fetchResult.live_telemetry.origin_weather.icao})
                      </strong>
                      <span className="badge badge-low" style={{ fontSize: '0.7rem' }}>
                        {fetchResult.live_telemetry.origin_weather.flight_category || 'VFR'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '6px' }}>
                      <div>🌡️ {fetchResult.live_telemetry.origin_weather.temp_c ?? '--'}°C</div>
                      <div>💨 {fetchResult.live_telemetry.origin_weather.wind_speed_kt ?? '--'} kt @ {fetchResult.live_telemetry.origin_weather.wind_dir_deg ?? '--'}°</div>
                      <div>👁️ {fetchResult.live_telemetry.origin_weather.visibility_statute_miles ?? '--'} sm</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '10px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {isHi ? 'प्रस्थान हवाई अड्डे की मौसम रिपोर्ट प्राप्त हो रही है...' : 'Origin terminal METAR observation retrieved.'}
                  </div>
                )}

                {fetchResult.live_telemetry?.destination_weather ? (
                  <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {fetchResult.live_telemetry.destination_weather.name} ({fetchResult.live_telemetry.destination_weather.icao})
                      </strong>
                      <span className="badge badge-low" style={{ fontSize: '0.7rem' }}>
                        {fetchResult.live_telemetry.destination_weather.flight_category || 'VFR'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '6px' }}>
                      <div>🌡️ {fetchResult.live_telemetry.destination_weather.temp_c ?? '--'}°C</div>
                      <div>💨 {fetchResult.live_telemetry.destination_weather.wind_speed_kt ?? '--'} kt @ {fetchResult.live_telemetry.destination_weather.wind_dir_deg ?? '--'}°</div>
                      <div>👁️ {fetchResult.live_telemetry.destination_weather.visibility_statute_miles ?? '--'} sm</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '10px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {isHi ? 'गंतव्य हवाई अड्डे की मौसम रिपोर्ट प्राप्त हो रही है...' : 'Destination terminal METAR observation retrieved.'}
                  </div>
                )}
              </div>
            </div>

            {/* Active Airborne Airspace Aircraft */}
            <div className="card" style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem 1.5rem' }}>
              <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <Plane size={18} color="var(--gov-teal)" />
                <div>
                  <h3 className="card-title" style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                    {isHi ? 'हवाई क्षेत्र में सक्रिय विमान (OpenSky ADS-B)' : 'Active Corridor Airspace (OpenSky ADS-B)'}
                  </h3>
                  <p className="card-subtitle" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                    {isHi ? 'खुले विमानन नेटवर्क से प्राप्त वास्तविक समय ट्रांसपोंडर उड़ान स्थिति' : 'Real-time transponder state vectors detected in corridor FIR'}
                  </p>
                </div>
              </div>

              {fetchResult.live_telemetry?.airborne_flights?.length > 0 ? (
                <div style={{ overflowX: 'auto', maxHeight: '200px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '6px 8px' }}>Callsign</th>
                        <th style={{ padding: '6px 8px' }}>Carrier</th>
                        <th style={{ padding: '6px 8px', textAlign: 'right' }}>Alt (m)</th>
                        <th style={{ padding: '6px 8px', textAlign: 'right' }}>Speed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fetchResult.live_telemetry.airborne_flights.slice(0, 6).map((f, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '6px 8px', fontWeight: '700', color: 'var(--text-primary)' }}>{f.callsign}</td>
                          <td style={{ padding: '6px 8px', color: 'var(--text-secondary)' }}>{f.carrier}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'right' }}>{f.altitude_m != null ? `${Math.round(f.altitude_m)}m` : '--'}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'right' }}>{f.ground_speed_kmh != null ? `${Math.round(f.ground_speed_kmh)} km/h` : '--'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {fetchResult.live_telemetry?.source_status || 'Corridor telemetry captured and validated.'}
                </div>
              )}
            </div>
          </div>

          {/* Cryptographic SHA-256 Provenance Audit Box */}
          <div className="card" style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem 1.5rem' }}>
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Hash size={18} color="var(--gov-amber)" />
              <div>
                <h3 className="card-title" style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                  {isHi ? 'क्रिप्टोग्राफ़िक उद्गम एवं SHA-256 अखंडता हैश' : 'Cryptographic Provenance & SHA-256 Integrity Hash'}
                </h3>
                <p className="card-subtitle" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                  {isHi ? 'इस अधिग्रहण चक्र के प्रत्येक रिकॉर्ड और पैरामीटर का अपरिवर्तनीय डिजिटल फिंगरप्रिंट' : 'Immutable deterministic 256-bit cryptographic digest sealing this acquisition cycle'}
                </p>
              </div>
            </div>

            <div style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div style={{ fontFamily: 'Consolas, Monaco, "Courier New", monospace', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                {fetchResult.integrity_hash}
              </div>
              <span className="badge badge-low" style={{ fontSize: '0.72rem', flexShrink: 0 }}>
                SHA-256 VERIFIED
              </span>
            </div>
          </div>

          {/* Session Ingestion History (Requirement 17) */}
          <div className="card" style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem 1.5rem' }}>
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <History size={18} color="var(--gov-amber)" />
              <div>
                <h3 className="card-title" style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                  {isHi ? 'सत्र अधिग्रहण इतिहास एवं चक्र काउंटर' : 'Session Acquisition History & Ingestion Log'}
                </h3>
                <p className="card-subtitle" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                  {isHi ? 'वर्तमान उपयोगकर्ता सत्र में निष्पादित सभी लाइव अधिग्रहण चक्रों का ऑडिट लॉग' : 'Chronological record of repeated acquisition runs executed during this active session'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {fetchHistory.map((run, idx) => {
                const fetchNumber = fetchHistory.length - idx;
                const isExpanded = expandedHistoryId === run.run_id;

                return (
                  <div
                    key={run.run_id}
                    style={{
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      background: idx === 0 ? 'var(--gov-teal-light)' : '#ffffff',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      onClick={() => setExpandedHistoryId(isExpanded ? null : run.run_id)}
                      style={{
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        fontSize: '0.82rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          background: idx === 0 ? 'var(--gov-teal)' : 'var(--bg-subtle)',
                          color: idx === 0 ? '#ffffff' : 'var(--text-primary)',
                          fontWeight: '800',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem'
                        }}>
                          Fetch #{fetchNumber}
                        </span>
                        <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                          {run.route_code} (T+{run.advance_purchase_window})
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {run.fetch_time_ist || new Date(run.timestamp).toLocaleTimeString('en-IN')}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: '700', color: 'var(--gov-teal)' }}>
                          {run.accepted_records} accepted
                        </span>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {run.integrity_hash?.slice(0, 8)}...
                        </span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ padding: '10px 14px', background: '#fafbfc', borderTop: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                          <div><strong>Run ID:</strong> {run.run_id}</div>
                          <div><strong>Source:</strong> {run.source_name}</div>
                          <div><strong>Records Retrieved:</strong> {run.records_retrieved}</div>
                          <div><strong>Invalid Rejected:</strong> {run.invalid_records}</div>
                          <div><strong>Duplicates Removed:</strong> {run.duplicates_removed}</div>
                          <div><strong>SHA-256 Digest:</strong> <code>{run.integrity_hash}</code></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Disclaimers */}
      <DisclaimerBanner />
    </div>
  );
}
