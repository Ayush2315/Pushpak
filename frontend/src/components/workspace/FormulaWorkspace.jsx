import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useWorkspace } from '../../hooks/useWorkspace';
import { Sigma, Calculator, Layers, ArrowRight, BookOpen, HelpCircle, CheckCircle, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FormulaWorkspace({ data }) {
  const { lang, language } = useLanguage();
  const { openContextualWindow } = useWorkspace();
  const isHi = (lang || language) === 'hi';

  const routeWeights = [
    { route: 'DEL-BLR', name: isHi ? 'दिल्ली - बेंगलुरु' : 'Delhi - Bengaluru', weight: '40.74%', weightVal: 0.4074, baseline: '₹ 5,820', current: '₹ 7,850', relative: '1.3488', product: '0.5495' },
    { route: 'DEL-BOM', name: isHi ? 'दिल्ली - मुम्बई' : 'Delhi - Mumbai', weight: '39.92%', weightVal: 0.3992, baseline: '₹ 5,140', current: '₹ 6,910', relative: '1.3444', product: '0.5367' },
    { route: 'BOM-BLR', name: isHi ? 'मुम्बई - बेंगलुरु' : 'Mumbai - Bengaluru', weight: '19.34%', weightVal: 0.1934, baseline: '₹ 4,380', current: '₹ 5,480', relative: '1.2511', product: '0.2420' }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem 0' }}>
      {/* Top Banner */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid #cbd5e1',
        borderRadius: '10px',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{
              background: '#eff6ff',
              color: '#1d4ed8',
              fontSize: '0.72rem',
              fontWeight: '700',
              padding: '0.15rem 0.5rem',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              {isHi ? 'सूचकांक गणना कार्यप्रणाली' : 'Index Calculation Methodology'}
            </span>
            <span style={{
              background: '#f1f5f9',
              color: '#475569',
              fontSize: '0.72rem',
              fontWeight: '600',
              padding: '0.15rem 0.5rem',
              borderRadius: '4px'
            }}>
              Laspeyres Aggregate Model
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '800' }}>
            {isHi ? 'पुष्पक लास्पेरेस-प्रकार मूल्य सूचकांक सूत्रीकरण' : 'PUSHPAK Laspeyres-Type Price Index Formulation'}
          </h2>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
            {isHi ? 'समग्र हेडलाइन सूचकांक' : 'Composite Headline Output'}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e3a8a', lineHeight: '1.1', margin: '0.2rem 0' }}>
            133.79
          </div>
          <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '700' }}>
            {isHi ? 'आधार (100.00) से +33.79%' : '+33.79% vs Baseline (100.00)'}
          </div>
        </div>
      </div>

      {/* Main Formula Card with Clean Readable Notation */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Calculator size={18} color="#1e3a8a" />
          <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: '700' }}>
            {isHi ? 'सूचकांक समीकरण एवं पद-वार व्याख्या' : 'Core Index Equation & Term-by-Term Explanation'}
          </h3>
        </div>

        {/* Big Clean Mathematical Display */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          padding: '1.25rem',
          textAlign: 'center',
          marginBottom: '1.25rem'
        }}>
          <div style={{
            fontSize: '1.6rem',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            fontWeight: '700',
            color: '#0f172a',
            letterSpacing: '0.04em'
          }}>
            Iₜ = Σ(wᵢ × Rᵢ) × 100
          </div>
          <div style={{ marginTop: '0.4rem', fontSize: '0.85rem', color: '#475569', fontWeight: '500' }}>
            {isHi 
              ? 'जहाँ Rᵢ = Pᵢ,ₜ / Pᵢ,₀ (प्रत्येक मार्ग का मूल्य सापेक्ष)' 
              : 'where R_i = P_(i,t) / P_(i,0) (Route Price Relative)'}
          </div>
        </div>

        {/* 8 Plain English Term Definitions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
          <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e3a8a', fontFamily: 'monospace' }}>Iₜ (Index at Time t)</div>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: '#475569', lineHeight: '1.5' }}>
              {isHi
                ? 'समय t पर संपूर्ण प्रतिनिधि हवाई गलियारा टोकरी का समग्र मूल्य सूचकांक।'
                : 'The composite airfare price index across the full representative basket at observation time t.'}
            </p>
          </div>

          <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e3a8a', fontFamily: 'monospace' }}>Route Corridor (i)</div>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: '#475569', lineHeight: '1.5' }}>
              {isHi
                ? 'प्रतिनिधि टोकरी में शामिल विशिष्ट शहर-जोड़ा (उदा. DEL-BOM, DEL-BLR, BOM-BLR)।'
                : 'A specific high-density domestic city-pair in the representative basket (e.g. DEL-BOM, DEL-BLR).'}
            </p>
          </div>

          <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e3a8a', fontFamily: 'monospace' }}>Reference Price (Pᵢ,₀)</div>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: '#475569', lineHeight: '1.5' }}>
              {isHi
                ? 'मार्ग i पर T+45 अग्रिम खरीद खिड़की पर देखा गया संरचनात्मक आधार किराया (Base = 100)।'
                : 'The baseline structural reference fare observed at T+45 advance purchase before dynamic yield scarcity takes effect.'}
            </p>
          </div>

          <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e3a8a', fontFamily: 'monospace' }}>Current Price (Pᵢ,ₜ)</div>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: '#475569', lineHeight: '1.5' }}>
              {isHi
                ? 'वर्तमान अवलोकन अवधि में सभी मापे गए बुकिंग क्षितिजों में मार्ग i का औसत किराया।'
                : 'The observed mean airfare across measured horizons on corridor i during the evaluation period.'}
            </p>
          </div>

          <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e3a8a', fontFamily: 'monospace' }}>Price Relative (Rᵢ)</div>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: '#475569', lineHeight: '1.5' }}>
              {isHi
                ? 'अनुपात Rᵢ = Pᵢ,ₜ / Pᵢ,₀। यदि किराया 34.4% बढ़ा है, तो Rᵢ = 1.3444।'
                : 'The price ratio R_i = P_(i,t) / P_(i,0). If current fares are 34.44% above base, R_i = 1.3444.'}
            </p>
          </div>

          <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e3a8a', fontFamily: 'monospace' }}>Route Weight (wᵢ)</div>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: '#475569', lineHeight: '1.5' }}>
              {isHi
                ? 'उड़ान रजिस्ट्री में मार्ग i का सापेक्ष यात्री उड़ान मात्रा अनुपात। Σwᵢ = 1.0000 (100%)।'
                : 'Corridor i share of passenger flight traffic in the domestic registry, normalized so Σw_i = 1.0000.'}
            </p>
          </div>

          <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e3a8a', fontFamily: 'monospace' }}>Why Weights Add to 100%?</div>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: '#475569', lineHeight: '1.5' }}>
              {isHi
                ? 'सामान्यीकरण सुनिश्चित करता है कि समग्र सूचकांक एक भारित औसत बना रहे, न कि अतिरंजित योग।'
                : 'Normalization guarantees the composite aggregate behaves as a convex weighted average without double-counting.'}
            </p>
          </div>

          <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e3a8a', fontFamily: 'monospace' }}>Why Multiply by 100?</div>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: '#475569', lineHeight: '1.5' }}>
              {isHi
                ? 'अनुपात 1.3379 को 100 से गुणा करने पर 133.79 प्राप्त होता है, जिससे बेस 100 के विरुद्ध प्रतिशत स्पष्ट दिखता है।'
                : 'Scales the 1.3379 ratio into the standard index convention where 100 is the anchor and values above 100 reflect percentage increase.'}
            </p>
          </div>

          <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e3a8a', fontFamily: 'monospace' }}>Σ (Combines All Routes)</div>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: '#475569', lineHeight: '1.5' }}>
              {isHi
                ? 'सिग्मा (Σ) ऑपरेटर टोकरी के सभी प्रतिनिधि गलियारों के भारित मूल्य सापेक्षों को एक समेकित सूचकांक में जोड़ता है।'
                : 'The summation operator combines the volume-weighted price relatives of all monitored corridors into one single composite index.'}
            </p>
          </div>

          <div style={{ background: '#eff6ff', padding: '0.85rem 1rem', borderRadius: '6px', border: '1px solid #bfdbfe', gridColumn: 'span 2' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1d4ed8' }}>
              {isHi ? 'हेडलाइन बनाम कोर सूचकांक अंतर' : 'How Headline and Core Differ'}
            </div>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: '#1e3a8a', lineHeight: '1.5' }}>
              {isHi
                ? 'हेडलाइन सूचकांक में सभी 5 बुकिंग क्षितिज (T+1, T+7, T+15, T+30, T+45) शामिल हैं और यह अंतिम समय की सर्ज कीमतों को दर्शाता है। कोर सूचकांक अत्यधिक अस्थिर T+1 और T+7 को हटाकर केवल T+15, T+30, T+45 पर केंद्रित है ताकि अंतर्निहित संरचनात्मक क्षमता मूल्य निर्धारण को अलग किया जा सके।'
                : 'Headline Index encompasses all 5 booking horizons (T+1, T+7, T+15, T+30, T+45), capturing last-minute scarcity surges. Core Index removes volatile near-term T+1 and T+7 windows, focusing strictly on T+15, T+30, and T+45 to measure underlying structural capacity pricing.'}
            </p>
          </div>

          <div style={{ background: '#fffbeb', padding: '0.85rem 1rem', borderRadius: '6px', border: '1px solid #fde68a' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#b45309' }}>
              {isHi ? 'T+1 एवं T+7 वॉक-अप अस्थिरता का कारण' : 'Why T+1 and T+7 Create Walk-Up Volatility'}
            </div>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: '#78350f', lineHeight: '1.5' }}>
              {isHi
                ? 'प्रस्थान के 24-48 घंटों के भीतर, एयरलाइन रेवेन्यू एल्गोरिदम बची हुई सीटों पर आक्रामक गतिशील मूल्य निर्धारण लागू करते हैं। जब मांग अधिक होती है तो अंतिम समय की कीमतें बेसलाइन से 100-200% ऊपर जा सकती हैं, जिससे क्षणिक मुद्रास्फीति जैसा भ्रम पैदा होता है।'
                : 'Within 24 to 48 hours of flight departure, carrier revenue management algorithms restrict discounted booking classes and apply scarcity surcharges. These walk-up spikes reflect emergency price inelasticity rather than structural transport cost inflation.'}
            </p>
          </div>

          <div style={{ background: '#f0fdf4', padding: '0.85rem 1rem', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#15803d' }}>
              {isHi ? 'नियत गणित बनाम ब्लैक-बॉक्स AI/ML' : 'Deterministic Engine vs Black-Box AI/ML'}
            </div>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: '#14532d', lineHeight: '1.5' }}>
              {isHi
                ? 'पुष्पक में कोई अप्रमाणित मशीन लर्निंग या न्यूरल नेटवर्क नहीं है। प्रत्येक गणना अपरिवर्तनीय गणितीय नियमों (लास्पेरेस योग, मानक विचलन) पर आधारित है और डेटाबेस से 100% पुनरुत्पादित की जा सकती है, जो केंद्रीय बैंकों और सांख्यिकी लेखा परीक्षा हेतु आवश्यक है।'
                : 'Unlike opaque neural networks or generative LLMs, PUSHPAK relies purely on transparent, deterministic Laspeyres summation and fixed weights. Every output is 100% reproducible by any independent auditor directly from stored observations.'}
            </p>
          </div>
        </div>
      </div>

      {/* Arithmetic Decomposition Table */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: '700' }}>
              {isHi ? 'प्रतिनिधि टोकरी भार एवं अंकगणितीय एकत्रीकरण' : 'Representative Basket Weights & Arithmetic Aggregation'}
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              {isHi ? 'सत्यापित घरेलू ट्रंक गलियारों पर लास्पेरेस गणना विवरण' : 'Step-by-step arithmetic breakdown across verified domestic trunk corridors'}
            </p>
          </div>
          <span style={{ fontSize: '0.78rem', background: '#f1f5f9', color: '#334155', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}>
            Σ wᵢ = 100.00%
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '0.65rem 0.85rem' }}>{isHi ? 'गलियारा' : 'Route Code'}</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>{isHi ? 'विवरण' : 'Description'}</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>{isHi ? 'भार (wᵢ)' : 'Weight (w_i)'}</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>{isHi ? 'आधार किराया (Pᵢ,₀)' : 'Base Fare'}</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>{isHi ? 'वर्तमान किराया (Pᵢ,ₜ)' : 'Current Mean'}</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>{isHi ? 'मूल्य सापेक्ष (Rᵢ)' : 'Relative (R_i)'}</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>{isHi ? 'भारित अंश' : 'Weighted Contribution'}</th>
              </tr>
            </thead>
            <tbody>
              {routeWeights.map((row) => (
                <tr key={row.route} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.65rem 0.85rem', fontWeight: '700', color: '#1e3a8a' }}>{row.route}</td>
                  <td style={{ padding: '0.65rem 0.85rem', color: '#334155' }}>{row.name}</td>
                  <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: '600' }}>{row.weight}</td>
                  <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', color: '#64748b' }}>{row.baseline}</td>
                  <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: '600', color: '#0f172a' }}>{row.current}</td>
                  <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontFamily: 'monospace' }}>{row.relative}</td>
                  <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: '700', color: '#1e3a8a' }}>{row.product}</td>
                </tr>
              ))}
              <tr style={{ background: '#f8fafc', fontWeight: '700', borderTop: '2px solid #cbd5e1' }}>
                <td colSpan="2" style={{ padding: '0.65rem 0.85rem', color: '#0f172a' }}>
                  {isHi ? 'समग्र योग (Σ wᵢ × Rᵢ)' : 'Composite Aggregation Sum (Σ w_i × R_i)'}
                </td>
                <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', color: '#0f172a' }}>100.00%</td>
                <td colSpan="3"></td>
                <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', color: '#1e3a8a', fontSize: '0.95rem' }}>
                  1.3379
                </td>
              </tr>
              <tr style={{ background: '#eff6ff', fontWeight: '800' }}>
                <td colSpan="6" style={{ padding: '0.65rem 0.85rem', color: '#1e3a8a' }}>
                  {isHi ? 'अंतिम हेडलाइन सूचकांक = 1.3379 × 100' : 'Final Headline Index = 1.3379 × 100'}
                </td>
                <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', color: '#1e3a8a', fontSize: '1.1rem' }}>
                  133.79
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Disclaimers & Methodology Link */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        padding: '0.85rem 1.25rem',
        fontSize: '0.8rem',
        color: '#64748b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Info size={16} color="#64748b" style={{ flexShrink: 0 }} />
          <span>
            {isHi 
              ? 'पुष्पक वायु किराया मूल्य सूचकांक MoSPI या DGCA का आधिकारिक सांख्यिकी सूचकांक नहीं है।'
              : 'The PUSHPAK Airfare Price Index is an analytical research prototype for CPI augmentation.'}
          </span>
        </div>
        <Link
          to="/methodology"
          style={{ color: '#1e3a8a', fontWeight: '600', textDecoration: 'none', fontSize: '0.8rem' }}
        >
          {isHi ? 'संपूर्ण कार्यप्रणाली पृष्ठ देखें →' : 'View Full Methodology Page →'}
        </Link>
      </div>
    </div>
  );
}
