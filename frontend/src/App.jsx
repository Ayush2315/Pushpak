import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './hooks/useLanguage';
import { WorkspaceProvider, useWorkspace } from './hooks/useWorkspace';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import ContextualWindow from './components/ContextualWindow';

import Dashboard from './pages/Dashboard';
import LiveDataLab from './pages/LiveDataLab';
import PriceIndex from './pages/PriceIndex';
import NationalCorridors from './pages/NationalCorridors';
import Intelligence from './pages/Intelligence';
import Policy from './pages/Policy';
import Network from './pages/Network';
import Transparency from './pages/Transparency';
import Methodology from './pages/Methodology';
import FAQKnowledgeCenter from './pages/FAQKnowledgeCenter';
import AirfareAcquisitionLab from './pages/AirfareAcquisitionLab';
import InstitutionalApi from './pages/InstitutionalApi';

import { GuidedDemoProvider } from './context/GuidedDemoContext';
import GuidedDemoBanner from './components/GuidedDemoBanner';

function LayoutWithTopbar({ children }) {
  const location = useLocation();
  const { lang, t } = useLanguage();
  const isHi = lang === 'hi';

  const getPageInfo = () => {
    switch (location.pathname) {
      case '/':
        return {
          title: t('nav.dashboard'),
          subtitle: isHi ? 'राष्ट्रीय वायु किराया आसूचना अवलोकन' : 'National Airfare Intelligence Overview'
        };
      case '/acquisition-lab':
        return {
          title: isHi ? 'वायु किराया अधिग्रहण प्रयोगशाला' : 'Airfare Acquisition Lab',
          subtitle: isHi ? '9-चरणीय सत्यापन, सामान्यीकरण, डुप्लीकेशन निष्कासन एवं SHA-256 स्रोत अखंडता' : '9-Stage Validation, Normalization, Deduplication & SHA-256 Provenance Pipeline'
        };
      case '/live-lab':
        return {
          title: isHi ? 'लाइव डेटा लैब' : 'Live Data Lab',
          subtitle: isHi ? 'वायु किराया डेटा अधिग्रहण, 7-चरणीय सत्यापन, एवं स्रोत निष्ठा प्रदर्शन' : 'Airfare Acquisition, 7-Stage Pipeline, Validation & Provenance Lab'
        };
      case '/price-index':
        return {
          title: t('nav.priceIndex'),
          subtitle: isHi ? 'हेडलाइन एवं कोर मूल्य सापेक्ष विश्लेषण' : 'Headline & Core Price Relative Analytics'
        };
      case '/corridors':
        return {
          title: isHi ? 'राष्ट्रीय गलियारा एक्सप्लोरर' : 'National Corridor Explorer',
          subtitle: isHi ? 'शीर्ष 10 घरेलू ट्रंक मार्ग, क्षमता एवं प्रतिनिधि बास्केट पृथक्करण' : 'Top 10 Domestic Trunk Corridors, Capacity & Basket Separation'
        };
      case '/intelligence':
        return {
          title: t('nav.intelligence'),
          subtitle: isHi ? 'गलियारा उपज वक्र एवं सक्रिय एयरलाइंस' : 'Corridor Yield Curves & Operating Airlines'
        };
      case '/policy':
        return {
          title: t('nav.policy'),
          subtitle: isHi ? 'पर्यवेक्षी प्राथमिकता संकेत एवं अस्थिरता नियम' : 'Supervisory Priority Signals & Volatility Heuristics'
        };
      case '/network':
        return {
          title: t('nav.network'),
          subtitle: isHi ? '50,000 सत्यापित उड़ान रजिस्ट्री प्रेक्षण' : '50,000 Verified Flight Registry Observations'
        };
      case '/transparency':
        return {
          title: t('nav.transparency'),
          subtitle: isHi ? 'ऑडिट ब्रेकडाउन एवं क्रिप्टोग्राफ़िक स्रोत' : 'Audit Breakdown & Cryptographic Provenance'
        };
      case '/institutional-api':
        return {
          title: isHi ? 'संस्थागत एपीआई तत्परता' : 'Institutional API Readiness',
          subtitle: isHi ? 'प्रोग्रामेटिक REST एपीआई एक्सप्लोरर (MoSPI / RBI / DGCA)' : 'Programmatic REST API Explorer for Institutional Consumption'
        };
      case '/methodology':
        return {
          title: t('nav.methodology'),
          subtitle: isHi ? 'आर्किटेक्चरल पाइपलाइन एवं सीपीआई संवर्धन रोडमैप' : 'Architectural Pipeline & CPI Augmentation Roadmap'
        };
      case '/faq':
        return {
          title: isHi ? 'ज्ञान केंद्र एवं संदर्भ' : 'FAQ & Knowledge Center',
          subtitle: isHi ? 'नागरिक उड्डयन मूल्य आसूचना संदर्भ गाइड' : 'Civil Aviation Analytical Reference'
        };
      default:
        return {
          title: 'PUSHPAK Intelligence',
          subtitle: ''
        };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <GuidedDemoBanner />
        <Topbar title={pageInfo.title} subtitle={pageInfo.subtitle} />
        <main style={{ padding: '2rem 2.25rem 4rem', minHeight: 'calc(100vh - 64px)' }}>
          {/* Single active contextual information window appears right here when an analytical item is clicked */}
          <ContextualWindow />
          
          {/* Main page view */}
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <WorkspaceProvider>
        <BrowserRouter>
          <GuidedDemoProvider>
            <LayoutWithTopbar>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/acquisition-lab" element={<AirfareAcquisitionLab />} />
                <Route path="/live-lab" element={<LiveDataLab />} />
                <Route path="/price-index" element={<PriceIndex />} />
                <Route path="/corridors" element={<NationalCorridors />} />
                <Route path="/intelligence" element={<Intelligence />} />
                <Route path="/policy" element={<Policy />} />
                <Route path="/network" element={<Network />} />
                <Route path="/transparency" element={<Transparency />} />
                <Route path="/institutional-api" element={<InstitutionalApi />} />
                <Route path="/methodology" element={<Methodology />} />
                <Route path="/faq" element={<FAQKnowledgeCenter />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </LayoutWithTopbar>
          </GuidedDemoProvider>
        </BrowserRouter>
      </WorkspaceProvider>
    </LanguageProvider>
  );
}

