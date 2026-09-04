import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GuidedDemoContext = createContext();

export const DEMO_STEPS = [
  {
    step: 1,
    id: 'acquisition',
    path: '/acquisition-lab',
    title: 'Acquire Airfare Data',
    titleHi: 'वायु किराया डेटा अधिग्रहण',
    prompt: 'Execute the 9-stage acquisition pipeline to retrieve, parse, validate, deduplicate, and cryptographically hash fare observations.',
    promptHi: '9-चरणीय अधिग्रहण पाइपलाइन निष्पादित करें: उद्धरण प्राप्त करें, सत्यापन करें, डुप्लिकेट्स हटाएं और SHA-256 हैश उत्पन्न करें।',
    actionLabel: 'Run Fare Acquisition',
    actionLabelHi: 'किराया अधिग्रहण चलाएँ',
    targetComponentId: 'run-pipeline-btn'
  },
  {
    step: 2,
    id: 'clean-observations',
    path: '/acquisition-lab',
    title: 'Clean Observations Verified',
    titleHi: 'स्वच्छ प्रेक्षण सत्यापित',
    prompt: 'Clean observations are now verified and stored in the database, ready for corridor analytics.',
    promptHi: 'स्वच्छ प्रेक्षण अब डेटाबेस में सुरक्षित और सत्यापित हैं, विश्लेषणात्मक प्रसंस्करण हेतु तैयार।',
    actionLabel: 'Continue to Fare Intelligence →',
    actionLabelHi: 'किराया आसूचना पर आगे बढ़ें →'
  },
  {
    step: 3,
    id: 'intelligence',
    path: '/intelligence',
    title: 'Corridor Fare Intelligence',
    titleHi: 'गलियारा किराया आसूचना',
    prompt: 'Inspect sample mean, median, standard deviation (σ), and advance booking yield curves across airlines.',
    promptHi: 'नमूना औसत, मध्यिका, मानक विचलन (σ), और एयरलाइंस के बीच अग्रिम खरीद उपज वक्रों का विश्लेषण करें।',
    actionLabel: 'Continue to Price Index →',
    actionLabelHi: 'मूल्य सूचकांक पर आगे बढ़ें →'
  },
  {
    step: 4,
    id: 'price-index',
    path: '/price-index',
    title: 'Construct Price Index',
    titleHi: 'मूल्य सूचकांक निर्माण',
    prompt: 'Observe Laspeyres Headline Index (T+1 to T+45) vs Core Capacity Index (T+15+) and the Walk-Up Surge Spread.',
    promptHi: 'लास्पेयर्स हेडलाइन सूचकांक (T+1 से T+45) बनाम कोर क्षमता सूचकांक (T+15+) और वॉक-अप सर्ज स्प्रेड का निरीक्षण करें।',
    actionLabel: 'View Policy Intelligence →',
    actionLabelHi: 'नीति आसूचना देखें →'
  },
  {
    step: 5,
    id: 'policy',
    path: '/policy',
    title: 'Automated Policy Signals',
    titleHi: 'स्वचालित नीति संकेत',
    prompt: 'Review deterministic policy signals flagging severe booking surges, volatility, and single-carrier dominance.',
    promptHi: 'गंभीर वॉक-अप मूल्य वृद्धि, अस्थिरता, और एकल-कैरियर प्रभुत्व को चिह्नित करने वाले नियत नीति संकेत देखें।',
    actionLabel: 'View Institutional API →',
    actionLabelHi: 'संस्थागत एपीआई देखें →'
  },
  {
    step: 6,
    id: 'institutional-api',
    path: '/institutional-api',
    title: 'Expose Institutional API Layer',
    titleHi: 'संस्थागत एपीआई परत',
    prompt: 'Inspect OpenAPI endpoints designed for high-frequency consumption by DGCA, MoCA, and RBI macroeconomic workflows.',
    promptHi: 'डीजीसीए, एमओसीए, और आरबीआई के आर्थिक विश्लेषण प्रवाह हेतु तैयार ओपनएपीआई एंडपॉइंट्स का निरीक्षण करें।',
    actionLabel: 'Finish Demonstration ✓',
    actionLabelHi: 'प्रदर्शन संपन्न करें ✓'
  }
];

export function GuidedDemoProvider({ children }) {
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [lastAcquisitionDone, setLastAcquisitionDone] = useState(false);
  const navigate = useNavigate();

  const startDemo = () => {
    setIsDemoActive(true);
    setCurrentStep(1);
    setLastAcquisitionDone(false);
    navigate('/acquisition-lab');
  };

  const nextStep = () => {
    if (currentStep < DEMO_STEPS.length) {
      const next = currentStep + 1;
      setCurrentStep(next);
      const nextStepDef = DEMO_STEPS.find(s => s.step === next);
      if (nextStepDef && nextStepDef.path) {
        navigate(nextStepDef.path);
      }
    } else {
      completeDemo();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      const prevStepDef = DEMO_STEPS.find(s => s.step === prev);
      if (prevStepDef && prevStepDef.path) {
        navigate(prevStepDef.path);
      }
    }
  };

  const exitDemo = () => {
    setIsDemoActive(false);
    setCurrentStep(1);
    setLastAcquisitionDone(false);
  };

  const completeDemo = () => {
    setIsDemoActive(false);
    setCurrentStep(1);
    setLastAcquisitionDone(false);
    navigate('/');
  };

  const notifyAcquisitionCompleted = () => {
    setLastAcquisitionDone(true);
    if (isDemoActive && currentStep === 1) {
      setCurrentStep(2);
    }
  };

  const value = {
    isDemoActive,
    currentStep,
    currentStepDef: DEMO_STEPS.find(s => s.step === currentStep) || DEMO_STEPS[0],
    lastAcquisitionDone,
    startDemo,
    nextStep,
    prevStep,
    exitDemo,
    completeDemo,
    notifyAcquisitionCompleted
  };

  return (
    <GuidedDemoContext.Provider value={value}>
      {children}
    </GuidedDemoContext.Provider>
  );
}

export function useGuidedDemo() {
  const context = useContext(GuidedDemoContext);
  if (!context) {
    throw new Error('useGuidedDemo must be used within a GuidedDemoProvider');
  }
  return context;
}
