/**
 * Comprehensive Knowledge Center & FAQ Repository for Project PUSHPAK.
 * Covers all 7 analytical categories with in-depth, understandable answers
 * designed for evaluators, statisticians, civil aviation authorities, and citizens.
 */

export const FAQ_CATEGORIES = [
  { id: 'all', name: 'All Categories', nameHi: 'सभी विषय' },
  { id: 'basics', name: 'About PUSHPAK', nameHi: 'पुष्पक के बारे में' },
  { id: 'liveData', name: 'Live Data & Acquisition', nameHi: 'लाइव डेटा एवं अधिग्रहण' },
  { id: 'priceIndex', name: 'Price Index', nameHi: 'मूल्य सूचकांक' },
  { id: 'fareIntelligence', name: 'Airfare Intelligence', nameHi: 'किराया आसूचना' },
  { id: 'policyIntelligence', name: 'Policy Intelligence', nameHi: 'नीति आसूचना' },
  { id: 'routeNetwork', name: 'Route Network', nameHi: 'मार्ग संजाल' },
  { id: 'transparency', name: 'Data Transparency & Provenance', nameHi: 'डेटा पारदर्शिता एवं उद्गम' },
  { id: 'methodology', name: 'Methodology & CPI', nameHi: 'कार्यप्रणाली एवं CPI' },
  { id: 'backtesting', name: 'Historical Validation & Backtesting', nameHi: 'ऐतिहासिक सत्यापन एवं बैकटेस्टिंग' },
];

export const knowledgeBase = [
  // =========================================================================
  // CATEGORY A: ABOUT PUSHPAK
  // =========================================================================
  {
    id: 'what-is-pushpak',
    category: 'basics',
    questionEn: 'What is Project PUSHPAK?',
    questionHi: 'प्रोजेक्ट पुष्पक क्या है?',
    simpleEn: 'PUSHPAK is a Civil Aviation Price Intelligence Platform designed to monitor domestic airfare movements and calculate a transparent, high-frequency Airfare Price Index for India.',
    simpleHi: 'पुष्पक एक नागर विमानन मूल्य आसूचना मंच है जिसे भारत में घरेलू हवाई किराए की गतिविधियों की निगरानी और पारदर्शी, उच्च-आवृत्ति मूल्य सूचकांक की गणना के लिए तैयार किया गया है।',
    whyMattersEn: 'Official consumer price statistics traditionally sample airfares at infrequent monthly intervals, lagging behind the rapid changes caused by dynamic airline revenue management algorithms. PUSHPAK bridges this gap with deterministic, daily algorithmic indexing.',
    whyMattersHi: 'आधिकारिक उपभोक्ता मूल्य आंकड़े पारंपरिक रूप से मासिक अंतरालों पर लिए जाते हैं, जिससे वे एयरलाइन के गतिशील मूल्य निर्धारण के तीव्र परिवर्तनों से पिछड़ जाते हैं। पुष्पक नियतात्मक, दैनिक एल्गोरिदम अनुक्रमण के माध्यम से इस अंतर को समाप्त करता है।',
    howCalculatedEn: 'It continuously monitors airfare observations across 5 advance booking horizons (T+1 to T+45) across verified trunk corridors, computing Laspeyres-type Headline and Core price relatives.',
    howCalculatedHi: 'यह सत्यापित ट्रंक गलियारों में 5 अग्रिम बुकिंग अवधियों (T+1 से T+45) में हवाई किराए के अवलोकनों की निरंतर निगरानी करता है और लास्पेरेस-प्रकार के हेडलाइन और कोर मूल्य सापेक्षों की गणना करता है।',
    exampleEn: 'An index reading of 133.79 reveals that domestic passenger airfares across the representative basket are currently 33.79% above the defined baseline reference.',
    exampleHi: '133.79 का सूचकांक दर्शाता है कि प्रतिनिधि टोकरी में घरेलू हवाई किराया वर्तमान में बेसलाइन संदर्भ से 33.79% अधिक है।',
    actions: [
      {
        id: 'inspect-headline',
        action: 'headline-index',
        label: 'Inspect Headline Index',
        labelHi: 'हेडलाइन विश्लेषण देखें',
        icon: 'TrendingUp'
      },
      {
        id: 'view-methodology',
        action: 'methodology',
        label: 'View Calculation Methodology',
        labelHi: 'गणना कार्यप्रणाली देखें',
        icon: 'Calculator'
      }
    ]
  },
  {
    id: 'problem-solved',
    category: 'basics',
    questionEn: 'What problem does PUSHPAK solve?',
    questionHi: 'पुष्पक कौन सी समस्या का समाधान करता है?',
    simpleEn: 'PUSHPAK solves the measurement lag and opacity in domestic passenger airfares by separating structural capacity airline pricing from temporary last-minute scarcity surges.',
    simpleHi: 'पुष्पक बुनियादी संरचनात्मक एयरलाइन किराए को अंतिम समय की अस्थायी वृद्धि से अलग करके घरेलू हवाई किराए में मापन विलंब और अस्पष्टता की समस्या का समाधान करता है।',
    whyMattersEn: 'When public debate erupts regarding extreme airfare spikes (e.g. during festival seasons or natural disruptions), policymakers often lack transparent data to know whether baseline capacity has inflated or if only last-minute walk-up tickets are surging.',
    whyMattersHi: 'त्योहारों या आपात स्थितियों में जब किराए में भारी उछाल आता है, तो नीति निर्माताओं के पास यह जानने के लिए पारदर्शी डेटा नहीं होता कि क्या बुनियादी क्षमता महंगी हुई है या केवल अंतिम समय के टिकटों में वृद्धि हुई है।',
    howCalculatedEn: 'By isolating advance booking horizons (T+15, T+30, T+45) from near-term walk-up windows (T+1, T+7), PUSHPAK produces two distinct indices: Headline and Core.',
    howCalculatedHi: 'अग्रिम बुकिंग विंडो (T+15, T+30, T+45) को निकट-अवधि वॉक-अप विंडो (T+1, T+7) से अलग करके, पुष्पक दो स्पष्ट सूचकांक तैयार करता है: हेडलाइन और कोर।'
  },
  {
    id: 'cpi-augmentation',
    category: 'basics',
    questionEn: 'Why is airfare pricing important for CPI augmentation?',
    questionHi: 'सीपीआई संवर्धन हेतु हवाई किराया मूल्य निर्धारण क्यों महत्वपूर्ण है?',
    simpleEn: 'CPI augmentation means enhancing the official Consumer Price Index with higher-frequency, transparent proxy data for volatile sub-groups like Transport & Communication.',
    simpleHi: 'सीपीआई संवर्धन का अर्थ परिवहन और संचार जैसे अस्थिर उप-समूहों के लिए उच्च-आवृत्ति, पारदर्शी डेटा के माध्यम से आधिकारिक उपभोक्ता मूल्य सूचकांक को सुदृढ़ बनाना है।',
    whyMattersEn: 'In India, the Ministry of Statistics and Programme Implementation (MoSPI) publishes the monthly Consumer Price Index. High-frequency transport indicators help economic statisticians model inflation velocity earlier and more accurately.',
    whyMattersHi: 'भारत में सांख्यिकी और कार्यक्रम कार्यान्वयन मंत्रालय (MoSPI) मासिक सीपीआई प्रकाशित करता है। उच्च-आवृत्ति परिवहन संकेतक अर्थशास्त्रियों को मुद्रास्फीति की गति का पहले और सटीक अनुमान लगाने में सहायता करते हैं।',
    howCalculatedEn: 'PUSHPAK serves as a research prototype demonstrating how digital fare observation pipelines can support national statistical agencies without requiring proprietary airline databases.',
    howCalculatedHi: 'पुष्पक एक प्रोटोटाइप के रूप में दर्शाता है कि डिजिटल किराया अवलोकन पाइपलाइनें बिना किसी गोपनीय डेटाबेस के राष्ट्रीय सांख्यिकी एजेंसियों को कैसे सशक्त बना सकती हैं।'
  },
  {
    id: 'official-status',
    category: 'basics',
    questionEn: 'Is PUSHPAK an official Government of India CPI system?',
    questionHi: 'क्या पुष्पक भारत सरकार का आधिकारिक सीपीआई सिस्टम है?',
    simpleEn: 'No. PUSHPAK is an independent academic and analytical research prototype designed for technical evaluation and decision-support demonstration.',
    simpleHi: 'नहीं। पुष्पक एक स्वतंत्र शैक्षणिक और विश्लेषणात्मक अनुसंधान प्रोटोटाइप है जिसे तकनीकी मूल्यांकन और निर्णय-समर्थन प्रदर्शन हेतु विकसित किया गया है।',
    whyMattersEn: 'Statutory national inflation indices in India are exclusively published by MoSPI and the Reserve Bank of India (RBI). PUSHPAK is an exploratory framework for CPI augmentation methodology.',
    whyMattersHi: 'भारत में वैधानिक राष्ट्रीय मुद्रास्फीति सूचकांक केवल MoSPI और आरबीआई द्वारा प्रकाशित किए जाते हैं। पुष्पक सीपीआई संवर्धन पद्धति के लिए एक अन्वेषणात्मक ढांचा है।',
    howCalculatedEn: 'All index series generated by PUSHPAK carry explicit disclaimers affirming their status as analytical heuristics rather than official statutory releases.',
    howCalculatedHi: 'पुष्पक द्वारा तैयार किए गए सभी सूचकांकों पर स्पष्ट प्रकटीकरण होता है कि वे आधिकारिक वैधानिक आंकड़ों के बजाय विश्लेषणात्मक अनुसंधान प्रॉक्सी हैं।'
  },
  {
    id: 'live-data-question',
    category: 'basics',
    questionEn: 'Is this live real-time airfare data?',
    questionHi: 'क्या यह लाइव वास्तविक समय हवाई किराया डेटा है?',
    simpleEn: 'No. PUSHPAK explicitly operates in verified demo_simulation mode using audited, deterministic observation datasets.',
    simpleHi: 'नहीं। पुष्पक स्पष्ट रूप से ऑडिट किए गए, नियतात्मक अवलोकन डेटासेट का उपयोग करके सत्यापित डेमो_सिमुलेशन मोड में संचालित होता है।',
    whyMattersEn: 'Academic integrity and statutory compliance require platforms to never masquerade synthetic or simulated benchmark data as live commercial airline quotations.',
    whyMattersHi: 'शैक्षणिक ईमानदारी और कानूनी अनुपालन के लिए आवश्यक है कि कोई भी मंच सिमुलेटेड बेंचमार्क डेटा को लाइव वाणिज्यिक एयरलाइन उद्धरण के रूप में प्रस्तुत न करे।',
    howCalculatedEn: 'Every record is tagged with provenance metadata (demo_simulation, offline) and audited against SHA-256 cryptographic hashes to ensure full reproducibility.',
    howCalculatedHi: 'प्रत्येक रिकॉर्ड को उद्गम मेटाडेटा (demo_simulation, offline) से चिह्नित किया जाता है और पूर्ण पुनरुत्पादन सुनिश्चित करने के लिए SHA-256 क्रिप्टोग्राफ़िक हैश द्वारा सत्यापित किया जाता है।'
  },
  {
    id: 'simulation-mode-meaning',
    category: 'basics',
    questionEn: 'What does "simulation mode" mean?',
    questionHi: '"सिमुलेशन मोड" का क्या अर्थ है?',
    simpleEn: 'Simulation mode means all flight schedules, booking horizons, and airfare distributions are generated from audited, mathematically consistent domestic aviation models.',
    simpleHi: 'सिमुलेशन मोड का अर्थ है कि सभी उड़ान कार्यक्रम, बुकिंग अवधियां और किराया वितरण ऑडिट किए गए, गणितीय रूप से सुसंगत घरेलू विमानन मॉडल से उत्पन्न किए गए हैं।',
    whyMattersEn: 'It provides a reliable, reproducible laboratory environment for testing economic index formulas, supervisory policy thresholds, and lead-time volatility without external API downtime.',
    whyMattersHi: 'यह बाहरी एपीआई रुकावटों के बिना आर्थिक सूचकांक सूत्रों, नीतिगत सीमाओं और अस्थिरता का परीक्षण करने के लिए एक विश्वसनीय, प्रतिलिपि प्रस्तुत करने योग्य वातावरण प्रदान करता है।',
    howCalculatedEn: 'The backend populates SQLite databases with 50,000 verified flight observations anchored to realistic airline schedules on major metro corridors.',
    howCalculatedHi: 'बैकएंड प्रमुख महानगर गलियारों में यथार्थवादी एयरलाइन शेड्यूल से जुड़े 50,000 सत्यापित उड़ान रिकॉर्ड्स के साथ डेटाबेस तैयार करता है।'
  },
  {
    id: 'target-audience',
    category: 'basics',
    questionEn: 'Who could potentially use this type of analytical system?',
    questionHi: 'इस प्रकार के विश्लेषणात्मक मंच का उपयोग कौन कर सकता है?',
    simpleEn: 'The primary audiences are civil aviation regulators (DGCA, Ministry of Civil Aviation), government statistical officers (MoSPI), consumer rights bodies, and economic researchers.',
    simpleHi: 'लक्षित उपयोगकर्ताओं में नागर विमानन नियामक (DGCA, नागर विमानन मंत्रालय), सरकारी सांख्यिकी अधिकारी (MoSPI), उपभोक्ता अधिकार निकाय और आर्थिक शोधकर्ता शामिल हैं।',
    whyMattersEn: 'Regulators need automated supervisory heuristics to detect corridor volatility, while statisticians need transparent index aggregation methodologies that reflect realistic consumer purchasing behavior.',
    whyMattersHi: 'नियामकों को गलियारा अस्थिरता की पहचान के लिए स्वचालित संकेतों की आवश्यकता होती है, जबकि सांख्यिकीविदों को वास्तविक उपभोक्ता व्यवहार को दर्शाने वाले पारदर्शी सूचकांकों की आवश्यकता होती है।',
    howCalculatedEn: 'The interface is built as a government decision-support dashboard providing instant explainability from macro index levels down to corridor-level fare distributions.',
    howCalculatedHi: 'इंटरफ़ेस को सरकारी निर्णय-समर्थन डैशबोर्ड के रूप में बनाया गया है जो मैक्रो सूचकांक से लेकर गलियारा-स्तरीय किराया वितरण तक तत्काल स्पष्टीकरण प्रदान करता है।'
  },

  // =========================================================================
  // CATEGORY B: PRICE INDEX
  // =========================================================================
  {
    id: 'headline-index-explained',
    category: 'priceIndex',
    questionEn: 'What is the PUSHPAK Headline Index?',
    questionHi: 'पुष्पक हेडलाइन सूचकांक क्या है?',
    simpleEn: 'The Headline Index is the comprehensive measure of passenger airfare movements across all 5 advance booking horizons: T+1, T+7, T+15, T+30, and T+45.',
    simpleHi: 'हेडलाइन सूचकांक सभी 5 अग्रिम बुकिंग अवधियों (T+1, T+7, T+15, T+30, T+45) में यात्री हवाई किराए के समग्र संचलन का व्यापक माप है।',
    whyMattersEn: 'It captures the total dynamic expenditure incurred by travelers, reflecting both advance structural discount planning and steep last-minute walk-up urgency premiums.',
    whyMattersHi: 'यह अग्रिम छूट वाली योजना और अंतिम समय की आवश्यक यात्रा दोनों को मिलाकर यात्रियों द्वारा किए जाने वाले कुल व्यय को दर्शाता है।',
    howCalculatedEn: 'Computed via Laspeyres-type aggregation: I_t = Σ(w_i × R_i) × 100, where R_i is the ratio of current mean fare to baseline T+45 fare on each corridor i.',
    howCalculatedHi: 'इसकी गणना लास्पेरेस-प्रकार के एकत्रीकरण द्वारा की जाती है: I_t = Σ(w_i × R_i) × 100, जहां R_i प्रत्येक गलियारे i पर आधार किराए की तुलना में वर्तमान किराए का अनुपात है।',
    exampleEn: 'A value of 133.79 indicates the composite airfare basket across representative corridors is currently 33.79% above baseline.',
    exampleHi: '133.79 का मान दर्शाता है कि प्रतिनिधि गलियारों में हवाई किराया टोकरी वर्तमान में आधार मूल्य से 33.79% ऊपर है।',
    actions: [
      {
        id: 'inspect-headline',
        action: 'headline-index',
        label: 'Inspect Headline Index',
        labelHi: 'हेडलाइन विश्लेषण देखें',
        icon: 'TrendingUp'
      },
      {
        id: 'understand-core',
        action: 'core-index',
        label: 'Understand Core Index',
        labelHi: 'कोर सूचकांक समझें',
        icon: 'Layers'
      },
      {
        id: 'open-formula',
        action: 'formula',
        label: 'Open Formula Workspace',
        labelHi: 'सूत्र वर्कस्पेस खोलें',
        icon: 'Calculator'
      }
    ]
  },
  {
    id: 'core-index-explained',
    category: 'priceIndex',
    questionEn: 'What is the PUSHPAK Core Index and why are T+1 and T+7 excluded?',
    questionHi: 'पुष्पक कोर सूचकांक क्या है और इसमें T+1 तथा T+7 को क्यों बाहर रखा गया है?',
    simpleEn: 'The Core Index focuses exclusively on stable, advance booking horizons: T+15, T+30, and T+45, while completely excluding near-term walk-up windows (T+1 and T+7).',
    simpleHi: 'कोर सूचकांक पूरी तरह से स्थिर अग्रिम बुकिंग अवधियों (T+15, T+30, T+45) पर केंद्रित है और निकट-अवधि वॉक-अप खिड़कियों (T+1 और T+7) को बाहर रखता है।',
    whyMattersEn: 'Near-term tickets (1 to 7 days before departure) suffer from severe scarcity and inelastic consumer demand (medical emergencies, urgent business). Revenue management algorithms aggressively inflate these remaining seats. Excluding them isolates underlying structural airline capacity pricing, directly analogous to Core CPI excluding volatile food and fuel.',
    whyMattersHi: 'प्रस्थान से 1 से 7 दिन पूर्व के टिकटों में अत्यधिक कमी और आपातकालीन यात्रा के कारण कीमतें अत्यधिक बढ़ जाती हैं। इन्हें बाहर रखने से एयरलाइन की बुनियादी संरचनात्मक क्षमता लागत का पता चलता है, जो कि खाद्य और ईंधन को बाहर रखकर कोर सीपीआई मापने के समान है।',
    howCalculatedEn: 'It aggregates price relatives computed strictly from observations recorded 15, 30, and 45 days before departure, weighting them by corridor flight volume shares.',
    howCalculatedHi: 'यह प्रस्थान से 15, 30 और 45 दिन पहले दर्ज अवलोकनों से मूल्य सापेक्षों की गणना करता है और उन्हें गलियारे के उड़ान भार से संयोजित करता है।',
    exampleEn: 'While the Headline Index stands at 133.79, the Core Index is 112.94 (+12.94%), demonstrating that baseline capacity pricing has grown moderately, whereas last-minute pricing accounts for the bulk of volatility.',
    exampleHi: 'जहाँ हेडलाइन सूचकांक 133.79 है, वहीं कोर सूचकांक 112.94 (+12.94%) है, जो दर्शाता है कि बुनियादी क्षमता में केवल मध्यम वृद्धि हुई है और अधिकांश अस्थिरता अंतिम समय के टिकटों में है।',
    actions: [
      {
        id: 'understand-core',
        action: 'core-index',
        label: 'Understand Core Index',
        labelHi: 'कोर सूचकांक समझें',
        icon: 'Layers'
      },
      {
        id: 'inspect-headline',
        action: 'headline-index',
        label: 'Inspect Headline Index',
        labelHi: 'हेडलाइन विश्लेषण देखें',
        icon: 'TrendingUp'
      },
      {
        id: 'surge-spread',
        action: 'surge-spread',
        label: 'Examine Surge Spread',
        labelHi: 'सर्ज स्प्रेड विश्लेषण',
        icon: 'Flame'
      }
    ]
  },
  {
    id: 'surge-spread-deep',
    category: 'priceIndex',
    questionEn: 'What is the Walk-Up Surge Spread?',
    questionHi: 'वॉक-अप वृद्धि अंतर (Walk-Up Surge Spread) क्या है?',
    simpleEn: 'The Walk-Up Surge Spread is the arithmetic difference between the Headline Index and the Core Index: Headline (133.79) − Core (112.94) = +20.85 index points (+18.46% markup).',
    simpleHi: 'वॉक-अप वृद्धि अंतर हेडलाइन सूचकांक और कोर सूचकांक के बीच का अंतर है: हेडलाइन (133.79) − कोर (112.94) = +20.85 अंक (+18.46% मार्कअप)।',
    whyMattersEn: 'It isolates the dynamic scarcity premium that airlines extract from passengers who must travel on short notice, providing policymakers with a clean indicator of algorithmic yield escalation.',
    whyMattersHi: 'यह अल्प सूचना पर यात्रा करने वाले यात्रियों से एयरलाइनों द्वारा वसूले जाने वाले गतिशील प्रीमियम को अलग करता है, जिससे नीति निर्माताओं को एल्गोरिथम मूल्य वृद्धि का सटीक संकेत मिलता है।',
    howCalculatedEn: 'Spread Points = Headline − Core; Spread Markup Percentage = (Spread Points / Core Index) × 100 = (20.85 / 112.94) × 100 = 18.46%.',
    howCalculatedHi: 'स्प्रेड अंक = हेडलाइन − कोर; मार्कअप प्रतिशत = (स्प्रेड अंक / कोर सूचकांक) × 100 = (20.85 / 112.94) × 100 = 18.46%।',
    actions: [
      {
        id: 'surge-spread',
        action: 'surge-spread',
        label: 'Examine Surge Spread',
        labelHi: 'सर्ज स्प्रेड विश्लेषण',
        icon: 'Flame'
      },
      {
        id: 'inspect-headline',
        action: 'headline-index',
        label: 'Inspect Headline Index',
        labelHi: 'हेडलाइन विश्लेषण देखें',
        icon: 'TrendingUp'
      },
      {
        id: 'understand-core',
        action: 'core-index',
        label: 'Understand Core Index',
        labelHi: 'कोर सूचकांक समझें',
        icon: 'Layers'
      }
    ]
  },
  {
    id: 'why-base-100',
    category: 'priceIndex',
    questionEn: 'Why is the base value 100 and what does an index value of 133.79 mean?',
    questionHi: 'आधार मान 100 क्यों होता है और 133.79 के सूचकांक का क्या अर्थ है?',
    simpleEn: 'In statistical index theory, a benchmark period is normalized to 100.00 so all subsequent price changes can be read directly as percentage changes relative to the baseline.',
    simpleHi: 'सांख्यिकीय सूचकांक सिद्धांत में, संदर्भ अवधि को 100.00 पर सामान्यीकृत किया जाता है ताकि बाद के सभी मूल्य परिवर्तनों को आधार के सापेक्ष प्रतिशत के रूप में पढ़ा जा सके।',
    whyMattersEn: 'In PUSHPAK, Base = 100.00 represents structural capacity fares observed at the 45-day advance purchase window (T+45), before dynamic yield scarcity takes effect.',
    whyMattersHi: 'पुष्पक में, आधार = 100.00 45-दिन अग्रिम बुकिंग (T+45) पर देखे गए संरचनात्मक किराए का प्रतिनिधित्व करता है, इससे पहले कि अंतिम समय की कमी का असर पड़े।',
    howCalculatedEn: 'An index value of 133.79 means: (133.79 − 100.00) = +33.79% price increase across the representative basket relative to advance baseline reference fares.',
    howCalculatedHi: '133.79 के सूचकांक का अर्थ है: (133.79 − 100.00) = आधार संदर्भ किराए की तुलना में प्रतिनिधि टोकरी में +33.79% की मूल्य वृद्धि।',
    actions: [
      {
        id: 'inspect-headline',
        action: 'headline-index',
        label: 'Inspect Headline Index',
        labelHi: 'हेडलाइन विश्लेषण देखें',
        icon: 'TrendingUp'
      },
      {
        id: 'understand-core',
        action: 'core-index',
        label: 'Understand Core Index',
        labelHi: 'कोर सूचकांक समझें',
        icon: 'Layers'
      },
      {
        id: 'open-formula',
        action: 'formula',
        label: 'Open Formula Workspace',
        labelHi: 'सूत्र वर्कस्पेस खोलें',
        icon: 'Calculator'
      }
    ]
  },
  {
    id: 'booking-horizons-explained',
    category: 'priceIndex',
    questionEn: 'What are booking horizons (T+1, T+7, T+15, T+30, T+45)?',
    questionHi: 'बुकिंग क्षितिज (T+1, T+7, T+15, T+30, T+45) क्या हैं?',
    simpleEn: 'Booking horizons denote the lead time in days between when a ticket is observed or purchased and the scheduled flight departure date.',
    simpleHi: 'बुकिंग क्षितिज टिकट देखे जाने या खरीदे जाने और उड़ान प्रस्थान की तारीख के बीच के दिनों की संख्या को दर्शाते हैं।',
    whyMattersEn: 'Airlines price identical physical seats differently depending on lead time. Advance windows offer structural baseline rates, while near-term windows trigger algorithmic yield markups.',
    whyMattersHi: 'एयरलाइनें प्रस्थान के समय के आधार पर एक ही सीट के लिए अलग-अलग किराया तय करती हैं। अग्रिम खिड़कियां आधार दरें पेश करती हैं, जबकि निकट-अवधि खिड़कियां स्वचालित वृद्धि को सक्रिय करती हैं।',
    howCalculatedEn: 'T+1 = 1 day before departure (walk-up); T+7 = 1 week out; T+15 = 2 weeks out; T+30 = 1 month out; T+45 = 45 days out (structural capacity benchmark).',
    howCalculatedHi: 'T+1 = प्रस्थान से 1 दिन पहले (वॉक-अप); T+7 = 1 सप्ताह पहले; T+15 = 2 सप्ताह पहले; T+30 = 1 माह पहले; T+45 = 45 दिन पहले (संरचनात्मक बेंचमार्क)।',
    actions: [
      {
        id: 'inspect-headline',
        action: 'headline-index',
        label: 'Inspect Headline Index',
        labelHi: 'हेडलाइन विश्लेषण देखें',
        icon: 'TrendingUp'
      },
      {
        id: 'understand-core',
        action: 'core-index',
        label: 'Understand Core Index',
        labelHi: 'कोर सूचकांक समझें',
        icon: 'Layers'
      }
    ]
  },
  {
    id: 'route-weights-laspeyres',
    category: 'priceIndex',
    questionEn: 'How are representative routes selected and route weights calculated?',
    questionHi: 'प्रतिनिधि मार्गों का चयन और उनके भार की गणना कैसे की जाती है?',
    simpleEn: 'Routes are selected based on passenger traffic density on major domestic metro corridors. Route weights reflect each corridor\'s share of observed flight volumes.',
    simpleHi: 'प्रमुख महानगर गलियारों में यात्री यातायात घनत्व के आधार पर मार्गों का चयन किया जाता है। मार्ग भार देखे गए उड़ान रिकॉर्ड्स में प्रत्येक गलियारे के हिस्से को दर्शाते हैं।',
    whyMattersEn: 'A route connecting major business hubs carries more economic weight in national consumer expenditure than a thin regional route. Weighting ensures the index accurately reflects overall consumer expenditure.',
    whyMattersHi: 'प्रमुख व्यापारिक केंद्रों को जोड़ने वाले मार्ग का क्षेत्रीय मार्ग की तुलना में अधिक आर्थिक महत्व होता है। भार यह सुनिश्चित करता है कि सूचकांक कुल उपभोक्ता व्यय को सटीक रूप से दर्शाए।',
    howCalculatedEn: 'Current sample weights sum to 100%: DEL-BLR (40.74%), DEL-BOM (39.92%), BOM-BLR (19.34%). Each corridor\'s price relative is multiplied by its assigned weight.',
    howCalculatedHi: 'वर्तमान नमूना भार 100% हैं: DEL-BLR (40.74%), DEL-BOM (39.92%), BOM-BLR (19.34%)। प्रत्येक गलियारे के मूल्य सापेक्ष को उसके निर्धारित भार से गुणा किया जाता है।',
    actions: [
      {
        id: 'open-formula',
        action: 'formula',
        label: 'Open Formula Workspace',
        labelHi: 'सूत्र वर्कस्पेस खोलें',
        icon: 'Calculator'
      },
      {
        id: 'view-methodology',
        action: 'methodology',
        label: 'View Calculation Methodology',
        labelHi: 'गणना कार्यप्रणाली देखें',
        icon: 'Calculator'
      }
    ]
  },

  // =========================================================================
  // CATEGORY C: AIRFARE INTELLIGENCE
  // =========================================================================
  {
    id: 'fare-volatility-cv',
    category: 'fareIntelligence',
    questionEn: 'What is fare volatility and what is the Coefficient of Variation (CV)?',
    questionHi: 'किराया अस्थिरता क्या है और भिन्नता गुणांक (CV) क्या दर्शाता है?',
    simpleEn: 'Fare volatility measures how widely airfares fluctuate across advance booking horizons. The Coefficient of Variation (CV) standardizes this dispersion as a percentage of the route\'s average fare.',
    simpleHi: 'किराया अस्थिरता यह मापती है कि बुकिंग अवधियों में हवाई किराया कितना बदलता है। भिन्नता गुणांक (CV) इस फैलाव को औसत किराए के प्रतिशत के रूप में मानकीकृत करता है।',
    whyMattersEn: 'A high CV indicates that travelers face severe price unpredictability depending on when they book, signalling aggressive dynamic yield pricing on that corridor.',
    whyMattersHi: 'एक उच्च CV दर्शाता है कि यात्रियों को बुकिंग के समय के आधार पर गंभीर मूल्य अनिश्चितता का सामना करना पड़ता है, जो उस मार्ग पर आक्रामक गतिशील मूल्य निर्धारण का संकेत है।',
    howCalculatedEn: 'CV = (Sample Standard Deviation / Mean Fare) × 100. PUSHPAK classifies CV < 15% as Low Variation, 15% to 30% as Moderate Variation, and > 30% as High Volatility.',
    howCalculatedHi: 'CV = (मानक विचलन / औसत किराया) × 100। पुष्पक 15% से कम को निम्न, 15% से 30% को मध्यम और 30% से अधिक को उच्च अस्थिरता के रूप में वर्गीकृत करता है।'
  },
  {
    id: 'mean-vs-median-fares',
    category: 'fareIntelligence',
    questionEn: 'Why does PUSHPAK report both Mean and Median fares?',
    questionHi: 'पुष्पक औसत (Mean) और माध्यिका (Median) दोनों किराए क्यों दिखाता है?',
    simpleEn: 'Airfare distributions are strongly right-skewed by a small number of extreme walk-up ticket prices. Mean captures total revenue, while Median reflects the typical fare paid by 50% of travelers.',
    simpleHi: 'अंतिम समय के महंगे टिकटों के कारण हवाई किराए का वितरण विषम होता है। औसत कुल राजस्व को दर्शाता है, जबकि माध्यिका 50% सामान्य यात्रियों द्वारा चुकाए गए विशिष्ट किराए को दर्शाती है।',
    whyMattersEn: 'If an airline sells 9 seats at ₹5,000 and 1 emergency seat at ₹25,000, the Mean is ₹7,000 but the Median is ₹5,000. Reporting both prevents misleading conclusions regarding typical consumer outlays.',
    whyMattersHi: 'यदि 9 सीटें ₹5,000 पर और 1 आपातकालीन सीट ₹25,000 पर बिकती है, तो औसत ₹7,000 होगा लेकिन माध्यिका ₹5,000। दोनों को दिखाना सामान्य उपभोक्ता व्यय का सही परिप्रेक्ष्य देता है।'
  },
  {
    id: 'carrier-price-spread',
    category: 'fareIntelligence',
    questionEn: 'What is Carrier Price Spread and why does it matter?',
    questionHi: 'विमानन कंपनी मूल्य प्रसार (Carrier Price Spread) क्या है?',
    simpleEn: 'Carrier Price Spread is the difference in average airfares charged by different airlines operating on the exact same corridor over identical observation windows.',
    simpleHi: 'विमानन कंपनी मूल्य प्रसार एक ही मार्ग पर समान अवधि के दौरान विभिन्न एयरलाइनों द्वारा लिए जाने वाले औसत किराए का अंतर है।',
    whyMattersEn: 'A tight spread indicates vigorous price competition matching competitor yields, while a wide spread highlights market tiering (e.g. low-cost carriers versus full-service airlines with corporate contracts).',
    whyMattersHi: 'एक संकीर्ण प्रसार सक्रिय मूल्य प्रतिस्पर्धा को दर्शाता है, जबकि एक विस्तृत प्रसार बाजार विभाजन (कम लागत वाली एयरलाइन बनाम पूर्ण सेवा एयरलाइन) को उजागर करता है।',
    howCalculatedEn: 'Spread = (Highest Airline Mean Fare − Lowest Airline Mean Fare); Spread Percentage = (Spread / Route Mean Fare) × 100.',
    howCalculatedHi: 'प्रसार = (अधिकतम औसत किराया − न्यूनतम औसत किराया); प्रसार प्रतिशत = (प्रसार / मार्ग औसत किराया) × 100।'
  },
  {
    id: 'deterministic-insights-ml',
    category: 'fareIntelligence',
    questionEn: 'How are deterministic insights generated and is machine learning used?',
    questionHi: 'नियतात्मक अंतर्दृष्टि कैसे उत्पन्न होती है और क्या मशीन लर्निंग का उपयोग किया गया है?',
    simpleEn: 'PUSHPAK relies strictly on transparent deterministic mathematical and statistical heuristics. It deliberately avoids opaque, black-box machine learning algorithms.',
    simpleHi: 'पुष्पक पूरी तरह से पारदर्शी नियतात्मक गणितीय और सांख्यिकीय नियमों पर निर्भर करता है। यह ब्लैक-बॉक्स मशीन लर्निंग एल्गोरिदम से बचता है।',
    whyMattersEn: 'Government statistical and supervisory decision-support requires 100% auditability and legal explainability. Every insight can be traced back to exact database observations.',
    whyMattersHi: 'सरकारी सांख्यिकी और विनियामक निर्णय-समर्थन के लिए 100% लेखा-परीक्षण और कानूनी स्पष्टीकरण आवश्यक है। प्रत्येक अंतर्दृष्टि को डेटाबेस से सत्यापित किया जा सकता है।',
    howCalculatedEn: 'Rules evaluate numerical criteria (e.g. walk-up markup > 60%, CV > 30%, operating carriers <= 2) to deterministically generate explanatory narrative findings.',
    howCalculatedHi: 'नियम संख्यात्मक मानदंडों (जैसे वॉक-अप मार्कअप > 60%, CV > 30%, ऑपरेटर <= 2) का मूल्यांकन करके व्याख्यात्मक निष्कर्ष उत्पन्न करते हैं।'
  },

  // =========================================================================
  // CATEGORY D: POLICY INTELLIGENCE
  // =========================================================================
  {
    id: 'policy-flags-definition',
    category: 'policyIntelligence',
    questionEn: 'What is a policy flag and what do HIGH, MEDIUM, and LOW severities mean?',
    questionHi: 'नीतिगत संकेत (Policy Flag) क्या है और HIGH, MEDIUM, LOW गंभीरता का क्या अर्थ है?',
    simpleEn: 'Policy flags are automated supervisory signals triggered when an audited corridor metric crosses a pre-established supervisory threshold.',
    simpleHi: 'नीतिगत संकेत स्वचालित पर्यवेक्षी अलर्ट हैं जो तब उत्पन्न होते हैं जब कोई मार्ग मीट्रिक पूर्व-स्थापित सीमा को पार करता है।',
    whyMattersEn: 'They provide aviation supervisors with an automated radar, filtering thousands of flights down to corridors that exhibit genuine pricing anomalies or consumer pressure.',
    whyMattersHi: 'वे विमानन पर्यवेक्षकों को एक स्वचालित रडार प्रदान करते हैं, जिससे वे हजारों उड़ानों में से उन गलियारों की पहचान कर सकते हैं जहां मूल्य निर्धारण में असामान्य वृद्धि हुई है।',
    howCalculatedEn: 'HIGH severity = severe surge (walk-up markup > 60%, CV > 30%); MEDIUM severity = moderate yield escalation (markup 25-60%); LOW severity = normal variance bands with healthy competition.',
    howCalculatedHi: 'HIGH गंभीरता = अत्यधिक उछाल (मार्कअप > 60%, CV > 30%); MEDIUM गंभीरता = मध्यम वृद्धि (मार्कअप 25-60%); LOW गंभीरता = सामान्य मूल्य बैंड और पर्याप्त प्रतिस्पर्धा।',
    actions: [
      {
        id: 'explore-policy',
        action: 'policy-intelligence',
        label: 'Explore Policy Intelligence',
        labelHi: 'नीति आसूचना देखें',
        icon: 'ShieldAlert'
      }
    ]
  },
  {
    id: 'policy-priority-categories',
    category: 'policyIntelligence',
    questionEn: 'What are HIGH_ATTENTION, MONITOR, and LOW_ATTENTION priority classifications?',
    questionHi: 'HIGH_ATTENTION, MONITOR और LOW_ATTENTION प्राथमिकता वर्गीकरण क्या हैं?',
    simpleEn: 'These are route-level composite supervisory classifications aggregating all active flags, volatility metrics, and carrier competition into one clear status.',
    simpleHi: 'ये मार्ग-स्तरीय समग्र वर्गीकरण हैं जो सभी सक्रिय अलर्ट, अस्थिरता और एयरलाइन प्रतिस्पर्धा को एक स्पष्ट स्थिति में जोड़ते हैं।',
    whyMattersEn: 'Civil aviation supervisors cannot inspect every flight manually. These classifications prioritize which corridors require supervisory review.',
    whyMattersHi: 'विमानन पर्यवेक्षक प्रत्येक उड़ान की मैन्युअल समीक्षा नहीं कर सकते। ये वर्गीकरण प्राथमिकता तय करते हैं कि किन गलियारों की तत्काल समीक्षा आवश्यक है।',
    howCalculatedEn: 'HIGH_ATTENTION is assigned when 2 or more high-severity triggers occur; MONITOR reflects corridors with single moderate alerts; LOW_ATTENTION reflects stable corridors.',
    howCalculatedHi: 'HIGH_ATTENTION तब दिया जाता है जब 2 या अधिक उच्च-गंभीरता अलर्ट हों; MONITOR एकल मध्यम अलर्ट दर्शाता है; LOW_ATTENTION स्थिर गलियारों को दर्शाता है।'
  },
  {
    id: 'non-regulatory-disclaimer',
    category: 'policyIntelligence',
    questionEn: 'Are PUSHPAK policy flags official government regulations or punitive orders?',
    questionHi: 'क्या पुष्पक नीतिगत संकेत आधिकारिक सरकारी नियम या दंडात्मक आदेश हैं?',
    simpleEn: 'No. PUSHPAK policy classifications are analytical decision-support heuristics and NOT statutory Government of India regulations or punitive directives.',
    simpleHi: 'नहीं। पुष्पक नीति वर्गीकरण केवल विश्लेषणात्मक निर्णय-समर्थन संकेत हैं और ये आधिकारिक सरकारी नियम या दंडात्मक निर्देश नहीं हैं।',
    whyMattersEn: 'Airfare pricing in India operates under a deregulated market environment supervised by the Directorate General of Civil Aviation (DGCA). PUSHPAK does not impose statutory price caps.',
    whyMattersHi: 'भारत में हवाई किराया नागर विमानन महानिदेशालय (DGCA) की निगरानी में विनियंत्रित बाजार व्यवस्था के तहत संचालित होता है। पुष्पक कोई वैधानिक मूल्य सीमा लागू नहीं करता।',
    howCalculatedEn: 'All policy views display prominent institutional disclaimer banners clarifying their status as analytical advisory indicators.',
    howCalculatedHi: 'सभी नीतिगत पेजों पर प्रमुख प्रकटीकरण बैनर प्रदर्शित होते हैं जो स्पष्ट करते हैं कि ये केवल विश्लेषणात्मक परामर्श संकेतक हैं।'
  },

  // =========================================================================
  // CATEGORY E: ROUTE NETWORK
  // =========================================================================
  {
    id: 'observed-records-vs-flights',
    category: 'routeNetwork',
    questionEn: 'Does "50,000 observed records" mean 50,000 active physical flights?',
    questionHi: 'क्या "50,000 अवलोकित रिकॉर्ड" का अर्थ 50,000 सक्रिय भौतिक उड़ानें हैं?',
    simpleEn: 'No. In airfare index methodology, an observed flight record represents a discrete fare observation captured for a specific flight schedule across a defined booking horizon.',
    simpleHi: 'नहीं। मूल्य सूचकांक पद्धति में, अवलोकित रिकॉर्ड एक विशिष्ट उड़ान और बुकिंग अवधि के लिए दर्ज किए गए किराए के अवलोकन को दर्शाता है।',
    whyMattersEn: 'A single physical flight operating daily is observed across multiple advance purchase horizons (T+1, T+7, T+15, T+30, T+45) and across different seat inventory classes, generating multiple observation records.',
    whyMattersHi: 'प्रतिदिन संचालित होने वाली एक भौतिक उड़ान को कई अग्रिम बुकिंग अवधियों (T+1, T+7, आदि) में देखा जाता है, जिससे कई अवलोकन रिकॉर्ड बनते हैं।',
    howCalculatedEn: 'The flight registry models domestic scheduled routes, where 50,000 records represent the multi-horizon sampling basket across the representative network corridors.',
    howCalculatedHi: 'उड़ान रजिस्ट्री घरेलू मार्गों को मॉडल करती है, जहाँ 50,000 रिकॉर्ड प्रतिनिधि नेटवर्क गलियारों में बहु-अवधि नमूना टोकरी का प्रतिनिधित्व करते हैं।'
  },
  {
    id: 'corridor-definition',
    category: 'routeNetwork',
    questionEn: 'What is a corridor and what do average duration and non-stop records represent?',
    questionHi: 'गलियारा (Corridor) क्या है और औसत अवधि क्या दर्शाती है?',
    simpleEn: 'A corridor represents a directional city-pair link (e.g. DEL-BOM is New Delhi to Mumbai; DEL-BLR is New Delhi to Bengaluru).',
    simpleHi: 'एक गलियारा दो शहरों के बीच के हवाई मार्ग को दर्शाता है (उदा. DEL-BOM दिल्ली से मुम्बई; DEL-BLR दिल्ली से बेंगलुरु)।',
    whyMattersEn: 'Airfare economics and carrier competition vary by corridor based on distance, business density, airport slot constraints, and alternative rail transport.',
    whyMattersHi: 'दूरी, व्यापारिक घनत्व, हवाईअड्डा स्लॉट और वैकल्पिक रेल परिवहन के आधार पर प्रत्येक गलियारे में हवाई किराया और प्रतिस्पर्धा भिन्न होती है।',
    howCalculatedEn: 'Average duration is the scheduled block flight time in hours; non-stop records indicate direct airport-to-airport point flights without intermediate layovers.',
    howCalculatedHi: 'औसत अवधि निर्धारित उड़ान समय है; नॉन-स्टॉप रिकॉर्ड बिना किसी लेओवर के सीधी उड़ानों को दर्शाते हैं।',
    actions: [
      {
        id: 'explore-route',
        action: 'route',
        routeCode: 'DEL-BOM',
        label: 'Inspect Route (DEL-BOM)',
        labelHi: 'मार्ग विश्लेषण (DEL-BOM)',
        icon: 'Plane'
      }
    ]
  },

  // =========================================================================
  // CATEGORY F: DATA TRANSPARENCY & PROVENANCE
  // =========================================================================
  {
    id: 'data-provenance-sha256',
    category: 'transparency',
    questionEn: 'What is data provenance, what is a source hash, and why is SHA-256 used?',
    questionHi: 'डेटा उद्गम (Provenance) क्या है और SHA-256 का उपयोग क्यों किया जाता है?',
    simpleEn: 'Data provenance is the documented, tamper-evident audit trail tracing every airfare observation back to its exact origin, timestamp, and connector.',
    simpleHi: 'डेटा उद्गम एक छेड़छाड़-रोधी ऑडिट ट्रेल है जो प्रत्येक किराए के अवलोकन को उसके मूल स्रोत, समय और कनेक्टर तक प्रमाणित करता है।',
    whyMattersEn: 'Without cryptographic provenance, analytical models can be questioned for subjective data filtering or cherry-picking. SHA-256 guarantees that records cannot be altered post-ingestion.',
    whyMattersHi: 'क्रिप्टोग्राफ़िक उद्गम के बिना किसी भी मॉडल पर डेटा में हेरफेर का आरोप लग सकता है। SHA-256 यह सुनिश्चित करता है कि दर्ज किए जाने के बाद डेटा को बदला नहीं जा सकता।',
    howCalculatedEn: 'Each record hashes its canonical string (route + timestamp + airline + base fare) using SHA-256, generating a unique 64-character hexadecimal fingerprint stored in SQLite.',
    howCalculatedHi: 'प्रत्येक रिकॉर्ड अपने डेटा स्ट्रिंग का SHA-256 का उपयोग करके हैश उत्पन्न करता है, जिससे 64-वर्णों का विशिष्ट डिजिटल फिंगरप्रिंट बनता है।'
  },
  {
    id: 'deterministic-reproducibility',
    category: 'transparency',
    questionEn: 'What does deterministic reproducibility mean in PUSHPAK?',
    questionHi: 'पुष्पक में नियतात्मक पुनरुत्पादन (Deterministic Reproducibility) का क्या अर्थ है?',
    simpleEn: 'Deterministic reproducibility means that re-running the exact same analytical pipeline or price index calculation on the database will always produce 100% identical outputs.',
    simpleHi: 'नियतात्मक पुनरुत्पादन का अर्थ है कि डेटाबेस पर एक ही गणना को दोबारा चलाने पर परिणाम हमेशा 100% समान आएंगे।',
    whyMattersEn: 'Official government statistics require deterministic consistency. Non-deterministic random seeds or unseeded stochastic simulations cannot be defended during public audits.',
    whyMattersHi: 'सरकारी सांख्यिकी में निरंतरता आवश्यक है। सार्वजनिक ऑडिट में यादृच्छिक या अस्पष्ट सिमुलेशन का बचाव नहीं किया जा सकता।',
    howCalculatedEn: 'All seeding routines, statistical variance algorithms, and Laspeyres weights use fixed deterministic seeds and explicit mathematical functions.',
    howCalculatedHi: 'सभी सिमुलेशन एल्गोरिदम और लास्पेरेस सूत्र निश्चित नियतात्मक बीजों और स्पष्ट गणितीय फलनों का उपयोग करते हैं।'
  },

  // =========================================================================
  // CATEGORY G: METHODOLOGY & CPI
  // =========================================================================
  {
    id: 'complete-methodology-pipeline',
    category: 'methodology',
    questionEn: 'How does PUSHPAK move from raw data to government decision support?',
    questionHi: 'पुष्पक कच्चे डेटा से सरकार के निर्णय-समर्थन तक कैसे पहुंचता है?',
    simpleEn: 'PUSHPAK executes a structured 6-stage pipeline: (1) Data Ingestion with SHA-256 hashes, (2) Flight Registry mapping, (3) Lead-time Fare Analytics, (4) Intelligence classification, (5) Policy Flag heuristics, and (6) Laspeyres-type Price Index computation.',
    simpleHi: 'पुष्पक 6-चरणीय पाइपलाइन का पालन करता है: (1) SHA-256 हैश के साथ डेटा अधिग्रहण, (2) उड़ान रजिस्ट्री मैपिंग, (3) अग्रिम किराया विश्लेषण, (4) आसूचना वर्गीकरण, (5) नीतिगत संकेत, और (6) लास्पेरेस मूल्य सूचकांक गणना।',
    whyMattersEn: 'This end-to-end flow demonstrates how statistical bodies like MoSPI and aviation authorities like DGCA can move from raw multi-carrier observations to actionable, transparent policy indicators.',
    whyMattersHi: 'यह प्रवाह दर्शाता है कि कैसे सांख्यिकी निकाय और विमानन प्राधिकरण बहु-विमानन डेटा से पारदर्शी नीतिगत संकेतक तैयार कर सकते हैं।',
    howCalculatedEn: 'Raw observations undergo schema validation, are loaded into SQLite WAL databases, analyzed across horizons, categorized into volatility tiers, and aggregated into composite indices.',
    howCalculatedHi: 'कच्चे अवलोकनों का स्कीमा सत्यापन होता है, उन्हें डेटाबेस में दर्ज किया जाता है, अवधियों में विश्लेषण किया जाता है, और समग्र सूचकांकों में संयोजित किया जाता है।',
    actions: [
      {
        id: 'open-formula',
        action: 'formula',
        label: 'Open Formula Workspace',
        labelHi: 'सूत्र वर्कस्पेस खोलें',
        icon: 'Calculator'
      },
      {
        id: 'view-methodology',
        action: 'methodology',
        label: 'View Calculation Methodology',
        labelHi: 'गणना कार्यप्रणाली देखें',
        icon: 'Calculator'
      }
    ]
  },
  {
    id: 'cpi-augmentation-vision',
    category: 'methodology',
    questionEn: 'How can this methodology augment the official Consumer Price Index (CPI)?',
    questionHi: 'यह कार्यप्रणाली आधिकारिक उपभोक्ता मूल्य सूचकांक (CPI) को कैसे संवर्धित कर सकती है?',
    simpleEn: 'By serving as a high-frequency algorithmic satellite index that monitors domestic airfares daily rather than through discrete, lagged monthly quotations.',
    simpleHi: 'एक उच्च-आवृत्ति एल्गोरिथम उपग्रह सूचकांक के रूप में कार्य करके जो विलंबित मासिक उद्धरणों के बजाय दैनिक आधार पर हवाई किराए की निगरानी करता है।',
    whyMattersEn: 'In high-inflation or high-volatility environments, traditional monthly sampling lags market realities. An algorithmic price index proxy provides early-warning inflation signals for the Transport & Communication subgroup.',
    whyMattersHi: 'मुद्रास्फीति के दौर में पारंपरिक मासिक नमूने बाजार की वास्तविकताओं से पिछड़ जाते हैं। एक एल्गोरिथम सूचकांक परिवहन उपसमूह के लिए प्रारंभिक चेतावनी संकेत प्रदान करता है।',
    howCalculatedEn: 'By maintaining fixed-basket Laspeyres aggregation weighted by annual passenger traffic, PUSHPAK mirrors international CPI standards established by the IMF and ILO.',
    howCalculatedHi: 'वार्षिक यात्री यातायात द्वारा भारित निश्चित-टोकरी लास्पेरेस एकत्रीकरण का उपयोग करके, पुष्पक आईएमएफ और आईएलओ द्वारा स्थापित अंतरराष्ट्रीय सीपीआई मानकों का पालन करता है।'
  },

  // =========================================================================
  // CATEGORY H: LIVE DATA & ACQUISITION PIPELINE (MILESTONE 7)
  // =========================================================================
  {
    id: 'what-does-acquisition-pipeline-do',
    category: 'liveData',
    questionEn: "What does PUSHPAK's acquisition pipeline do?",
    questionHi: 'पुष्पक की डेटा अधिग्रहण पाइपलाइन क्या करती है?',
    simpleEn: "PUSHPAK's 7-stage acquisition pipeline programmatically connects to approved civil aviation telemetry sources, extracts raw fare and flight observations, validates fields, normalizes data, deterministically deduplicates observations, commits verified records to SQLite, and seals the entire run with a SHA-256 cryptographic provenance hash.",
    simpleHi: 'पुष्पक की 7-चरणीय अधिग्रहण पाइपलाइन स्वीकृत नागर विमानन स्रोतों से जुड़ती है, कच्चे किराया एवं उड़ान रिकॉर्ड निष्कर्षित करती है, स्कीमा सत्यापन करती है, डेटा सामान्यीकरण करती है, डुप्लिकेट हटाती है, SQLite में सुरक्षित रूप से दर्ज करती है और SHA-256 हैश द्वारा पूरे रन का उद्गम सील करती है।',
    whyMattersEn: 'Official statistical bodies require verifiable, auditable pipelines rather than black-box scraped data. Every stage produces a verifiable count and rejects anomalies transparently before influencing the analytical price index.',
    whyMattersHi: 'आधिकारिक सांख्यिकी निकायों को बिना प्रमाण वाले डेटा के बजाय सत्यापन योग्य, ऑडिट योग्य पाइपलाइन की आवश्यकता होती है। प्रत्येक चरण पारदर्शी गणना करता है और मूल्य सूचकांक को प्रभावित करने से पहले विसंगतियों को अस्वीकार करता है।',
    howCalculatedEn: 'Stage 1 (Source Connect) → Stage 2 (Extract) → Stage 3 (Schema & Range Validation) → Stage 4 (Code Normalization) → Stage 5 (Composite-Key Deduplication) → Stage 6 (Database Storage) → Stage 7 (Deterministic SHA-256 Provenance).',
    howCalculatedHi: 'चरण 1 (कनेक्शन) → चरण 2 (निष्कर्षण) → चरण 3 (सत्यापन) → चरण 4 (सफाई) → चरण 5 (डुप्लिकेट निष्कासन) → चरण 6 (डेटाबेस भंडारण) → चरण 7 (क्रिप्टोग्राफिक उद्गम हैश)।',
    actions: [
      {
        id: 'view-methodology',
        action: 'methodology',
        label: 'View Pipeline Methodology',
        labelHi: 'पाइपलाइन कार्यप्रणाली देखें',
        icon: 'Calculator'
      }
    ]
  },
  {
    id: 'live-vs-demo-data',
    category: 'liveData',
    questionEn: 'What is the difference between live fetched data and demonstration data?',
    questionHi: 'लाइव प्राप्त डेटा और डिमॉन्स्ट्रेशन डेटा में क्या अंतर है?',
    simpleEn: 'Demonstration data consists of carefully calibrated baseline distributions used to simulate full-year corridor behaviors, whereas live fetched data represents actual, real-time records acquired from genuine open civil aviation APIs during the active user session.',
    simpleHi: 'डिमॉन्स्ट्रेशन डेटा में पूर्ण-वर्षीय गलियारा व्यवहार का अनुकरण करने हेतु कैलिब्रेटेड बेसलाइन वितरण शामिल हैं, जबकि लाइव प्राप्त डेटा सक्रिय उपयोगकर्ता सत्र के दौरान वास्तविक खुले विमानन एपीआई से प्राप्त वास्तविक समय के रिकॉर्ड का प्रतिनिधित्व करता है।',
    whyMattersEn: 'Technical honesty is a fundamental governance principle of PUSHPAK. The platform visually distinguishes genuine live fetches with green badges (🟢 LIVE FETCHED DATA) and historical baseline simulations with blue badges (🔵 DEMONSTRATION DATA) to prevent misleading stakeholders.',
    whyMattersHi: 'तकनीकी ईमानदारी पुष्पक का एक मौलिक सुशासन सिद्धांत है। मंच स्टेकहोल्डरों को गुमराह करने से रोकने के लिए हरे बैज (🟢 लाइव प्राप्त डेटा) और नीले बैज (🔵 डिमॉन्स्ट्रेशन डेटा) के साथ स्पष्ट दृश्य अंतर बनाए रखता है।',
    howCalculatedEn: 'Live fetches populate the `live_acquisition_runs` and `live_fare_observations` tables with immediate system timestamps and API source identifiers.',
    howCalculatedHi: 'लाइव फेच तत्काल सिस्टम टाइमस्टैम्प और एपीआई स्रोत पहचानकर्ताओं के साथ डेटाबेस तालिकाओं में दर्ज होते हैं।'
  },
  {
    id: 'how-validation-works',
    category: 'liveData',
    questionEn: 'How does validation work?',
    questionHi: 'डेटा सत्यापन कैसे काम करता है?',
    simpleEn: 'Stage 3 of the pipeline applies strict rule-based schema and domain checks to every incoming record before acceptance.',
    simpleHi: 'पाइपलाइन का चरण 3 स्वीकृति से पहले प्रत्येक आने वाले रिकॉर्ड पर सख्त नियम-आधारित स्कीमा और डोमेन जांच लागू करता है।',
    whyMattersEn: 'Unchecked null values, negative fares, inverted origin-destination pairs, or unrealistic advance booking windows would corrupt national inflation proxies.',
    whyMattersHi: 'अनियंत्रित रिक्त मान, नकारात्मक किराए, या अमान्य अग्रिम बुकिंग विंडो राष्ट्रीय मुद्रास्फीति संकेतकों को दूषित कर सकते हैं।',
    howCalculatedEn: 'Validation checks: (1) valid IATA airport codes, (2) origin != destination, (3) total_fare > 0 and numeric, (4) advance_purchase_window in [1, 7, 15, 30, 45], (5) ISO 8601 observation timestamp.',
    howCalculatedHi: 'सत्यापन जांच: (1) वैध IATA हवाई अड्डा कोड, (2) प्रस्थान != आगमन, (3) कुल किराया > 0, (4) अग्रिम बुकिंग विंडो [1, 7, 15, 30, 45] में, (5) मान्य ISO 8601 टाइमस्टैम्प।'
  },
  {
    id: 'what-is-data-deduplication',
    category: 'liveData',
    questionEn: 'What is data deduplication?',
    questionHi: 'डेटा डिडुप्लिकेशन (डुप्लिकेट निष्कासन) क्या है?',
    simpleEn: 'Data deduplication identifies and eliminates repeated observations of the same flight or fare quote captured during rapid successive acquisition queries.',
    simpleHi: 'डेटा डिडुप्लिकेशन तेजी से बार-बार किए गए अधिग्रहण प्रश्नों के दौरान प्राप्त समान उड़ान या किराए के उद्धरणों की पहचान करता है और उन्हें हटाता है।',
    whyMattersEn: 'Without deduplication, querying an API multiple times within an hour would overweight identical fare quotes, skewing mean prices and artificial volume metrics.',
    whyMattersHi: 'डिडुप्लिकेशन के बिना, एक ही घंटे में कई बार एपीआई क्वेरी करने से समान किराए का भार बढ़ जाएगा, जिससे औसत मूल्य और वॉल्यूम मीट्रिक विकृत हो जाएंगे।',
    howCalculatedEn: 'Deterministic composite key: `hash(route_code + carrier + advance_purchase_window + observation_date + fare_class)`. Only the first unique observation within a window is preserved.',
    howCalculatedHi: 'निर्धारक समग्र कुंजी: `मार्ग + वाहक + अग्रिम विंडो + अवलोकन तिथि + श्रेणी`। एक विंडो के भीतर केवल पहला विशिष्ट अवलोकन सुरक्षित रखा जाता है।'
  },
  {
    id: 'why-is-provenance-important',
    category: 'liveData',
    questionEn: 'Why is provenance important?',
    questionHi: 'डेटा उद्गम (Provenance) क्यों महत्वपूर्ण है?',
    simpleEn: 'Data provenance provides an unbroken, cryptographic chain of custody documenting exactly where data came from, when it was acquired, how many records were accepted or rejected, and its cryptographic integrity signature.',
    simpleHi: 'डेटा उद्गम एक अटूट, क्रिप्टोग्राफिक श्रृंखला प्रदान करता है जो ठीक यह प्रमाणित करता है कि डेटा कहाँ से आया, कब प्राप्त किया गया, कितने रिकॉर्ड स्वीकृत या अस्वीकृत हुए, और उसका सुरक्षा हस्ताक्षर क्या है।',
    whyMattersEn: 'For central banks (RBI) and national statistical agencies (MoSPI), economic indices cannot rely on unverified assertions. Provenance allows independent auditors to reproduce and verify the calculation.',
    whyMattersHi: 'केंद्रीय बैंक (RBI) और राष्ट्रीय सांख्यिकी एजेंसियों (MoSPI) के लिए आर्थिक सूचकांक असत्यापित दावों पर निर्भर नहीं हो सकते। उद्गम स्वतंत्र लेखा परीक्षकों को गणना की पुष्टि करने की अनुमति देता है।',
    howCalculatedEn: 'Every acquisition run records: `run_id`, `source_name`, `fetch_timestamp`, `records_retrieved`, `records_rejected`, `duplicates_removed`, `records_accepted`, and `provenance_hash`.',
    howCalculatedHi: 'प्रत्येक अधिग्रहण रन में रन आईडी, स्रोत का नाम, टाइमस्टैम्प, प्राप्त/अस्वीकृत/डुप्लिकेट/स्वीकृत रिकॉर्ड और उद्गम हैश दर्ज होता है।'
  },
  {
    id: 'what-is-sha256-integrity-hash',
    category: 'liveData',
    questionEn: 'What is a SHA-256 integrity hash?',
    questionHi: 'SHA-256 अखंडता हैश क्या है?',
    simpleEn: 'A SHA-256 integrity hash is a deterministic 64-character hexadecimal fingerprint generated from the exact bytes of the accepted flight fare records and run metadata.',
    simpleHi: 'SHA-256 अखंडता हैश एक निर्धारक 64-वर्ण हेक्साडेसिमल फिंगरप्रिंट है जो स्वीकृत उड़ान किराए के रिकॉर्ड और रन मेटाडेटा के सटीक बाइट्स से उत्पन्न होता है।',
    whyMattersEn: 'Even a one-cent or one-character alteration in the stored data produces a completely different hash, making tampering immediately detectable.',
    whyMattersHi: 'संग्रहीत डेटा में एक पैसे या एक अक्षर का भी परिवर्तन पूरी तरह से भिन्न हैश उत्पन्न करता है, जिससे किसी भी छेड़छाड़ का तुरंत पता चल जाता है।',
    howCalculatedEn: 'SHA-256(run_id + source + timestamp + accepted_count + concatenated_observation_tokens). The resulting 256-bit digest is stored alongside the run record.',
    howCalculatedHi: 'SHA-256(रन आईडी + स्रोत + टाइमस्टैम्प + स्वीकृत संख्या + अवलोकनों का सार)। परिणामी 256-बिट डाइजेस्ट रन रिकॉर्ड के साथ संग्रहीत होता है।'
  },
  {
    id: 'multiple-sources-scraping',
    category: 'liveData',
    questionEn: 'Does PUSHPAK currently scrape multiple sources?',
    questionHi: 'क्या पुष्पक वर्तमान में कई स्रोतों से डेटा स्क्रैप करता है?',
    simpleEn: 'No. The prototype demonstrates the standardized acquisition pipeline with the implemented connector architecture. Additional approved sources can be added through future connectors.',
    simpleHi: 'नहीं। यह प्रोटोटाइप कार्यान्वित कनेक्टर आर्किटेक्चर के साथ मानकीकृत अधिग्रहण पाइपलाइन का प्रदर्शन करता है। भविष्य के कनेक्टर्स के माध्यम से अतिरिक्त स्वीकृत स्रोत जोड़े जा सकते हैं।',
    whyMattersEn: 'Honest engineering and regulatory compliance: PUSHPAK does not bypass CAPTCHAs, violate airline terms of service, or simulate fake airline connections. It uses ethical, rate-limited open telemetry APIs.',
    whyMattersHi: 'ईमानदार इंजीनियरिंग और विनियामक अनुपालन: पुष्पक कैप्चा को बायपास नहीं करता, एयरलाइन सेवा शर्तों का उल्लंघन नहीं करता, या नकली एयरलाइन कनेक्शन का नाटक नहीं करता। यह नैतिक, दर-सीमित खुले एपीआई का उपयोग करता है।',
    howCalculatedEn: 'The system defines an abstract `BaseConnector` class that enforces uniform interfaces (`connect()`, `extract()`, `validate()`, `clean()`, `deduplicate()`). Any future source adheres to this contract.',
    howCalculatedHi: 'प्रणाली एक अमूर्त BaseConnector वर्ग को परिभाषित करती है जो समान इंटरफेस लागू करता है। कोई भी भावी स्रोत इसी अनुबंध का पालन करेगा।'
  },
  {
    id: 'how-government-consumes-pushpak',
    category: 'liveData',
    questionEn: 'How can government systems consume PUSHPAK?',
    questionHi: 'सरकारी प्रणालियाँ पुष्पक का उपभोग कैसे कर सकती हैं?',
    simpleEn: 'Government and institutional research systems consume PUSHPAK programmatically via the dedicated `/api/v1/government/` REST API namespace.',
    simpleHi: 'सरकारी और संस्थागत अनुसंधान प्रणालियाँ समर्पित `/api/v1/government/` REST API नेमस्पेस के माध्यम से प्रोग्रामेटिक रूप से पुष्पक का उपभोग करती हैं।',
    whyMattersEn: 'The interactive frontend dashboard is only one presentation client. Central statistical bodies (MoSPI), aviation regulators (DGCA), and central banks (RBI) require programmatic machine-to-machine JSON feeds for macro models.',
    whyMattersHi: 'इंटरैक्टिव डैशबोर्ड केवल एक प्रस्तुति क्लाइंट है। केंद्रीय सांख्यिकी निकायों (MoSPI), विमानन नियामकों (DGCA), और रिज़र्व बैंक (RBI) को मैक्रो मॉडल के लिए मशीन-टू-मशीन JSON फीड की आवश्यकता होती है।',
    howCalculatedEn: 'Standard endpoints: `/api/v1/government/index/latest` (Headline/Core/Surge), `/summary` (Analytical breakdown), `/routes` (Basket details), `/provenance` (Audit trail), and `/data-status` (Dataset transparency).',
    howCalculatedHi: 'मानक एंडपॉइंट्स: `/index/latest` (हेडलाइन/कोर/वृद्धि), `/summary` (विश्लेषणात्मक विवरण), `/routes` (बास्केट विवरण), `/provenance` (ऑडिट ट्रेल), और `/data-status` (डेटासेट पारदर्शिता)।',
    actions: [
      {
        id: 'inspect-headline',
        action: 'headline-index',
        label: 'Inspect Headline Index API',
        labelHi: 'हेडलाइन सूचकांक एपीआई देखें',
        icon: 'TrendingUp'
      }
    ]
  },
  {
    id: 'basket-vs-corridor-explorer',
    category: 'liveData',
    questionEn: 'What is the difference between the Representative Basket and National Corridor Explorer?',
    questionHi: 'प्रतिनिधि बास्केट और राष्ट्रीय गलियारा एक्सप्लोरर में क्या अंतर है?',
    simpleEn: 'The Representative Basket consists of 3 high-volume trunk routes (DEL-BOM, DEL-BLR, BOM-BLR) that strictly determine the PUSHPAK Price Index, whereas the National Corridor Explorer monitors the Top 10 domestic routes for broader network visibility without altering the index.',
    simpleHi: 'प्रतिनिधि बास्केट में 3 उच्च-मात्रा वाले ट्रंक मार्ग (DEL-BOM, DEL-BLR, BOM-BLR) शामिल हैं जो पुष्पक मूल्य सूचकांक निर्धारित करते हैं, जबकि राष्ट्रीय गलियारा एक्सप्लोरर सूचकांक को बदले बिना व्यापक नेटवर्क दृश्यता हेतु शीर्ष 10 घरेलू मार्गों की निगरानी करता है।',
    whyMattersEn: 'Index methodology requires a stable, fixed basket to maintain temporal continuity and prevent index drift. The corridor explorer enables exploratory supervisory analytics without violating Laspeyres price-index integrity.',
    whyMattersHi: 'सूचकांक कार्यप्रणाली को समय की निरंतरता बनाए रखने और सूचकांक विचलन को रोकने के लिए एक स्थिर, निश्चित बास्केट की आवश्यकता होती है। गलियारा एक्सप्लोरर लास्पेरेस अखंडता का उल्लंघन किए बिना व्यापक पर्यवेक्षी विश्लेषण को सक्षम बनाता है।',
    howCalculatedEn: 'Representative basket carries 100% of index weights (DEL-BOM: 42.5%, DEL-BLR: 32.5%, BOM-BLR: 25.0%). The remaining 7 corridors in the National Explorer carry 0% weight in the index.',
    howCalculatedHi: 'प्रतिनिधि बास्केट सूचकांक का 100% भार वहन करती है। राष्ट्रीय एक्सप्लोरर में शेष 7 गलियारे सूचकांक में 0% भार वहन करते हैं।',
    actions: [
      {
        id: 'inspect-corridor',
        action: 'corridor',
        routeCode: 'DEL-BOM',
        label: 'Explore Trunk Corridor DEL-BOM',
        labelHi: 'ट्रंक गलियारा DEL-BOM देखें',
        icon: 'Plane'
      }
    ]
  },
  // =========================================================================
  // CATEGORY I: HISTORICAL VALIDATION & BACKTESTING
  // =========================================================================
  {
    id: 'backtest-what',
    category: 'backtesting',
    questionEn: 'What is historical backtesting in the context of a price index?',
    questionHi: 'मूल्य सूचकांक में ऐतिहासिक बैकटेस्टिंग क्या है?',
    simpleEn: 'Historical backtesting validates the price index methodology by applying it to accumulated past observations. For each historical day t, it computes I(t) = Σ(wᵢ × Rᵢ(t)) × 100 and verifies that the index behaves consistently with known market dynamics.',
    simpleHi: 'ऐतिहासिक बैकटेस्टिंग मूल्य सूचकांक कार्यप्रणाली को संचित पिछले प्रेक्षणों पर लागू करके उसे सत्यापित करता है। प्रत्येक ऐतिहासिक दिवस t के लिए I(t) = Σ(wᵢ × Rᵢ(t)) × 100 की गणना करता है।',
    whyMattersEn: 'Backtesting ensures the Laspeyres aggregation formula produces economically intuitive results: walk-up fares remain higher than advance-purchase fares, basket weights are stable, and the index responds proportionally to genuine fare movements.',
    whyMattersHi: 'बैकटेस्टिंग सुनिश्चित करता है कि लास्पेरेस एकत्रीकरण सूत्र आर्थिक रूप से सहज परिणाम देता है: वॉक-अप किराए अग्रिम-खरीद किराए से अधिक बने रहते हैं, बास्केट भार स्थिर होते हैं।',
    howCalculatedEn: 'Step 1: Daily fare collection via 9-stage pipeline → Step 2: Route-level price relatives Rᵢ(t) → Step 3: Weighted aggregation I(t) → Step 4: Statistical analysis of trajectory I(t₁), I(t₂), ..., I(tₙ).',
    howCalculatedHi: 'चरण 1: 9-चरणीय पाइपलाइन से दैनिक किराया संग्रह → चरण 2: मार्ग-स्तरीय मूल्य सापेक्ष Rᵢ(t) → चरण 3: भारित एकत्रीकरण I(t) → चरण 4: प्रक्षेप पथ का सांख्यिकीय विश्लेषण।',
    actions: []
  },
  {
    id: 'backtest-honest',
    category: 'backtesting',
    questionEn: 'Does PUSHPAK have a 30-day backtest? (Honest Answer)',
    questionHi: 'क्या पुष्पक में 30-दिवसीय बैकटेस्ट है? (ईमानदार उत्तर)',
    simpleEn: 'No, not yet. PUSHPAK is architecturally ready to run daily backtests but has not yet accumulated 30 consecutive days of real fare observations. The system does NOT fabricate fake historical backtest data.',
    simpleHi: 'अभी नहीं। पुष्पक वास्तुशिल्प रूप से दैनिक बैकटेस्ट चलाने के लिए तैयार है लेकिन अभी तक 30 लगातार दिनों का वास्तविक किराया डेटा संचित नहीं हुआ है। सिस्टम नकली ऐतिहासिक बैकटेस्ट डेटा नहीं बनाता।',
    whyMattersEn: 'Data honesty is a core principle. Fabricating a fake backtest trajectory would undermine institutional credibility. The acquisition pipeline can be scheduled for daily cron execution, and genuine backtesting will emerge organically as observations accumulate.',
    whyMattersHi: 'डेटा ईमानदारी एक मूल सिद्धांत है। नकली बैकटेस्ट बनाना संस्थागत विश्वसनीयता को कमजोर करेगा। अधिग्रहण पाइपलाइन को दैनिक क्रॉन निष्पादन हेतु शेड्यूल किया जा सकता है।',
    actions: []
  },
  {
    id: 'backtest-validation-criteria',
    category: 'backtesting',
    questionEn: 'What validation criteria would a genuine backtest verify?',
    questionHi: 'एक वास्तविक बैकटेस्ट कौन से सत्यापन मापदंडों की पुष्टि करेगा?',
    simpleEn: 'Five key criteria: (1) Base period index I(0) = 100.00 exactly; (2) Walk-up surge spread: Headline > Core consistently; (3) Advance window monotonicity: T+1 > T+7 > T+15 > T+30 > T+45 fares; (4) Basket weight stability: Σwᵢ = 1.0000; (5) SHA-256 hash chain integrity across all daily runs.',
    simpleHi: 'पांच मुख्य मापदंड: (1) आधार अवधि सूचकांक I(0) = 100.00; (2) वॉक-अप सर्ज: हेडलाइन > कोर; (3) अग्रिम अवधि एकरूपता: T+1 > T+7 > T+15 किराया; (4) बास्केट भार: Σwᵢ = 1.0000; (5) SHA-256 हैश चेन अखंडता।',
    whyMattersEn: 'These criteria mirror the validation checks that MoSPI, RBI, and ILO apply when evaluating consumer price indices. Meeting them demonstrates that PUSHPAK produces economically meaningful, internally consistent output.',
    whyMattersHi: 'ये मापदंड उन सत्यापन जांचों को प्रतिबिंबित करते हैं जो MoSPI, RBI और ILO उपभोक्ता मूल्य सूचकांकों का मूल्यांकन करते समय लागू करते हैं।',
    actions: []
  },
  {
    id: 'backtest-architecture',
    category: 'backtesting',
    questionEn: 'How is PUSHPAK architecturally ready for continuous backtesting?',
    questionHi: 'पुष्पक निरंतर बैकटेस्टिंग के लिए वास्तुशिल्प रूप से कैसे तैयार है?',
    simpleEn: 'The 9-stage acquisition pipeline can be invoked programmatically via the /api/v1/acquisition/run endpoint. Each execution produces timestamped, deduplicated, SHA-256 hashed observations stored in SQLite. The price index engine can then compute I(t) against any date-filtered subset.',
    simpleHi: 'अधिग्रहण पाइपलाइन को /api/v1/acquisition/run एंडपॉइंट के माध्यम से प्रोग्रामेटिक रूप से चलाया जा सकता है। प्रत्येक निष्पादन समय-मोहर वाले, डी-डुप्लीकेटेड, SHA-256 हैश प्रेक्षण उत्पन्न करता है।',
    howCalculatedEn: 'Schedule → Acquisition Pipeline → Clean Observations (airfare_observations table) → Date-filtered Price Relatives → Daily Index Value → Append to Time Series',
    howCalculatedHi: 'शेड्यूल → अधिग्रहण पाइपलाइन → स्वच्छ प्रेक्षण (airfare_observations तालिका) → तिथि-फ़िल्टर मूल्य सापेक्ष → दैनिक सूचकांक → समय श्रृंखला में जोड़ें',
    actions: []
  },
  {
    id: 'backtest-dedup-importance',
    category: 'backtesting',
    questionEn: 'Why is deduplication critical for historical backtesting integrity?',
    questionHi: 'ऐतिहासिक बैकटेस्टिंग अखंडता के लिए डुप्लीकेशन निष्कासन क्यों महत्वपूर्ण है?',
    simpleEn: 'Without deduplication, if identical fare quotes appear multiple times in a daily snapshot, the route-level geometric mean shifts artificially. Over 30 days, even small daily biases compound into significant index drift, producing unreliable backtest trajectories.',
    simpleHi: 'डुप्लीकेशन निष्कासन के बिना, यदि समान किराया उद्धरण एक दैनिक स्नैपशॉट में कई बार दिखाई देते हैं, तो मार्ग-स्तरीय ज्यामितीय माध्य कृत्रिम रूप से विचलित होता है। 30 दिनों में, छोटे दैनिक विचलन भी सूचकांक विचलन में संयुक्त हो जाते हैं।',
    howCalculatedEn: 'Deduplication uses a deterministic composite key: carrier|origin|destination|departure_date|advance_purchase_window|fare_class|total_fare. Identical signatures within a single acquisition run are flagged as duplicates and excluded from index calculations.',
    howCalculatedHi: 'डुप्लीकेशन निर्धारक समग्र कुंजी का उपयोग करता है: carrier|origin|destination|departure_date|advance_purchase_window|fare_class|total_fare। एक ही अधिग्रहण रन में समान हस्ताक्षर डुप्लिकेट के रूप में चिह्नित किए जाते हैं।',
    actions: []
  },
  {
    id: 'backtest-provenance',
    category: 'backtesting',
    questionEn: 'How does SHA-256 provenance support backtest auditability?',
    questionHi: 'SHA-256 स्रोत अखंडता बैकटेस्ट ऑडिटेबिलिटी का कैसे समर्थन करती है?',
    simpleEn: 'Each daily acquisition run produces a unique SHA-256 hash computed over the canonical sorted observations and run metadata. This creates an immutable audit chain: if any observation were modified retroactively, the hash would change, and the tampering would be immediately detectable.',
    simpleHi: 'प्रत्येक दैनिक अधिग्रहण रन सैद्धांतिक क्रमबद्ध प्रेक्षणों और रन मेटाडेटा पर गणना किया गया एक अद्वितीय SHA-256 हैश उत्पन्न करता है। यदि किसी प्रेक्षण को पूर्वव्यापी रूप से संशोधित किया जाता है, तो हैश बदल जाएगा।',
    whyMattersEn: 'For institutional consumers (MoSPI, RBI), cryptographic provenance is essential. It provides verifiable proof that backtest trajectories have not been fabricated or altered after the fact.',
    whyMattersHi: 'संस्थागत उपभोक्ताओं (MoSPI, RBI) के लिए, क्रिप्टोग्राफ़िक स्रोत अखंडता आवश्यक है। यह सत्यापन योग्य प्रमाण प्रदान करती है कि बैकटेस्ट प्रक्षेप पथ तथ्य के बाद मनगढ़ंत या परिवर्तित नहीं किए गए हैं।',
    actions: []
  },
  {
    id: 'backtest-capability-map',
    category: 'backtesting',
    questionEn: 'What is the PUSHPAK Prototype Capability Map?',
    questionHi: 'पुष्पक प्रोटोटाइप क्षमता मानचित्र क्या है?',
    simpleEn: 'The Capability Map honestly compares Problem Statement requirements against actual PUSHPAK implementations. It shows which capabilities are fully demonstrated (price index, 9-stage pipeline, deduplication), which are architecture-ready (daily cron scheduling, NDC airline connectors), and which require production deployment (true 30-day backtest, live GDS integration).',
    simpleHi: 'क्षमता मानचित्र ईमानदारी से समस्या कथन की आवश्यकताओं की तुलना वास्तविक पुष्पक कार्यान्वयन से करता है। यह दर्शाता है कि कौन सी क्षमताएं पूर्णतः प्रदर्शित हैं (मूल्य सूचकांक, 9-चरणीय पाइपलाइन), कौन सी वास्तुशिल्प रूप से तैयार हैं, और कौन सी उत्पादन परिनियोजन की आवश्यकता रखती हैं।',
    whyMattersEn: 'Presenting an honest capability map — rather than overclaiming — demonstrates engineering maturity and institutional readiness. Government evaluators value transparency about prototype boundaries.',
    whyMattersHi: 'ईमानदार क्षमता मानचित्र — अति-दावों के बजाय — इंजीनियरिंग परिपक्वता और संस्थागत तत्परता प्रदर्शित करता है। सरकारी मूल्यांकनकर्ता प्रोटोटाइप सीमाओं के बारे में पारदर्शिता को महत्व देते हैं।',
    actions: []
  }
];
