import React from 'react';
import { 
  Play, 
  ArrowRight, 
  CheckCircle2, 
  X, 
  Compass, 
  ChevronRight,
  Layers,
  Database,
  Calculator,
  ShieldAlert,
  Terminal,
  Activity
} from 'lucide-react';
import { useGuidedDemo, DEMO_STEPS } from '../context/GuidedDemoContext';
import { useLanguage } from '../hooks/useLanguage';

export default function GuidedDemoBanner() {
  const { 
    isDemoActive, 
    currentStep, 
    currentStepDef, 
    nextStep, 
    prevStep, 
    exitDemo, 
    completeDemo 
  } = useGuidedDemo();
  const { lang } = useLanguage();
  const isHi = lang === 'hi';

  if (!isDemoActive) return null;

  const isLastStep = currentStep === DEMO_STEPS.length;

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 999,
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      borderBottom: '2px solid #0f766e',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
      padding: '0.85rem 1.75rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.6rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Left: Step Badge & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.25rem 0.75rem',
            backgroundColor: '#134e4a',
            color: '#5eead4',
            border: '1px solid #14b8a6',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '800',
            letterSpacing: '0.04em'
          }}>
            <Activity size={13} className="pulse" />
            {isHi ? `मार्गदर्शित प्रदर्शन: चरण ${currentStep} / ${DEMO_STEPS.length}` : `GUIDED DEMONSTRATION: STEP ${currentStep} OF ${DEMO_STEPS.length}`}
          </span>

          <span style={{ fontSize: '1.05rem', fontWeight: '800', color: '#ffffff' }}>
            {isHi ? currentStepDef.titleHi : currentStepDef.title}
          </span>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              style={{
                padding: '0.4rem 0.85rem',
                backgroundColor: '#1e293b',
                color: '#cbd5e1',
                border: '1px solid #475569',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {isHi ? '← पिछला चरण' : '← Previous Step'}
            </button>
          )}

          <button
            type="button"
            onClick={nextStep}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.45rem 1.15rem',
              backgroundColor: isLastStep ? '#16a34a' : '#0f766e',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(15, 118, 110, 0.4)',
              transition: 'all 0.15s ease'
            }}
          >
            <span>{isHi ? currentStepDef.actionLabelHi : currentStepDef.actionLabel}</span>
            {!isLastStep && <ArrowRight size={14} />}
            {isLastStep && <CheckCircle2 size={14} />}
          </button>

          <button
            type="button"
            onClick={exitDemo}
            title={isHi ? 'मार्गदर्शित प्रदर्शन बंद करें' : 'Exit Guided Demonstration'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '0.4rem 0.75rem',
              backgroundColor: 'transparent',
              color: '#94a3b8',
              border: '1px solid #334155',
              borderRadius: '6px',
              fontSize: '0.78rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <X size={13} />
            <span>{isHi ? 'प्रदर्शन छोड़ें' : 'Exit Demo'}</span>
          </button>
        </div>
      </div>

      {/* Guidance Text & Multi-step Indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        fontSize: '0.82rem',
        color: '#cbd5e1'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '850px' }}>
          <span style={{ color: '#5eead4', fontWeight: '700' }}>{isHi ? 'उद्देश्य: ' : 'Objective: '}</span>
          <span>{isHi ? currentStepDef.promptHi : currentStepDef.prompt}</span>
        </div>

        {/* Step Progress Dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {DEMO_STEPS.map((s) => (
            <div
              key={s.step}
              style={{
                width: s.step === currentStep ? '20px' : '8px',
                height: '8px',
                borderRadius: '9999px',
                backgroundColor: s.step === currentStep ? '#14b8a6' : (s.step < currentStep ? '#0f766e' : '#334155'),
                transition: 'all 0.2s ease'
              }}
              title={isHi ? s.titleHi : s.title}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
