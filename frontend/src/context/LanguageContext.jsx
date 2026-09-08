// LanguageContext.jsx — Global English & Hindi Language State & Comprehensive Translations
import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const TRANSLATIONS = {
  en: {
    // Nav & Sidebar
    brandSub: 'Smart Procurement Intelligence',
    signIn: 'Sign In',
    register: 'Register',
    livePortal: 'Live Portal',
    home: 'Home',
    dashboard: 'Dashboard',
    payments: 'Payment Status',
    history: 'Purchase History',
    notifications: 'Notifications',
    signOut: 'Sign Out',
    farmerPortal: 'Farmer Portal',
    adminPortal: 'Mandi Admin Portal',
    liveQueueActive: 'Live Queue Active',
    
    // Hero
    heroBadge: '12-Factor ML Prediction · Cross-Centre Optimization',
    heroTitle1: 'Predict. Inform.',
    heroTitle2: 'Reduce Waiting.',
    heroSubtitle: 'AI-powered live queue management for farmers. Know your exact token, estimated wait time, and optimal departure time before leaving home — delivered straight to WhatsApp.',
    startWithPhone: 'Start with Mobile Number',
    mandiOfficerLogin: 'Mandi Officer Access',
    scrollDown: 'Scroll down to enter platform',

    // Quick Checker
    quickCheckTitle: 'Live Token & Queue Status',
    quickCheckDesc: 'Enter mobile number to view live wait status',
    mobileNumberLabel: 'Farmer Mobile Number',
    checkStatusBtn: 'Check Live Status',
    currentTokenLabel: 'Current Token',
    farmersAheadLabel: 'Farmers Ahead',
    estWaitLabel: 'Estimated Wait',
    departAtLabel: 'Depart From Home',
    openDashboard: 'Open Dashboard',

    // Metrics
    impactMetrics: 'Impact Metrics',
    metricsHeading: 'Real Intelligence. Zero Guesswork.',
    waitTimeRed: 'Reduction in Mandi Waiting Times',
    tokensProc: 'Farmer Tokens Processed',
    mspTracked: 'Direct MSP Payments Tracked',
    mlParams: 'ML Parameters Trained',

    // Farmer Dashboard Header
    namaste: 'Namaste',
    liveToken: 'Live Token',
    bookSlotBtn: '+ Book New Token Slot',
    getWhatsAppAlerts: 'Get WhatsApp Alerts',
    completedToday: "Today's Completed",
    waitingFarmers: 'Waiting Farmers',
    avgProcessing: 'Avg Processing',
    perFarmer: 'per farmer',
    mandiStatus: 'Mandi Status',
    openAccepting: 'Open · Accepting farmers',
    inQueue: 'In Queue',
    beingProcessed: 'Being processed',
    yourNumber: 'Your number',
    queueProgress: 'Queue Progress',
    estWait: 'Est. wait',
    reachMandiBy: 'Reach mandi by',
    leaveHomeAt: 'Leave home at',
    travelTime: 'Travel time',
    queueWait: 'Queue wait',
    recommendedArrival: 'Recommended Arrival',
    setTravelTime: 'Set travel time',
    recommendedDesc: 'Recommended based on current queue and average processing speed. Travel time uses your configured estimate.',
    
    // Procurement Details Card
    myProcurement: 'My Procurement',
    yourTokenNo: 'Your Token Number',
    mandi: 'Mandi',
    crop: 'Crop',
    quantity: 'Quantity',
    date: 'Date',
    slot: 'Slot',
    prototypeDemoData: 'Prototype Demo Data',
    
    // Payment Card
    paymentStatus: 'Payment Status',
    procurementAmount: 'Procurement Amount',
    referenceNumber: 'Reference Number',
    paymentProgress: 'Payment Progress',
    procurementCompleted: 'Procurement Completed',
    paymentInitiated: 'Payment Initiated',
    paymentProcessing: 'Payment Processing',
    paymentCompleted: 'Payment Completed',

    // Cross-Centre Routing
    smartRouting: 'Smart Routing',
    crossCentreOptimization: 'Cross-Centre AI Optimization',
    routingDesc: 'Live multi-mandi congestion comparison & wait savings',
    recommendedAlternative: 'Recommended Alternative',
    currentMandi: 'Current Mandi',
    weighbridges: 'Weighbridges',
    away: 'away',
    bookSlotHere: 'Book Slot Here',
    totalRoute: 'Total Route',
    lessCrowd: 'Less crowd, faster weighment',

    // AI Simulator
    aiSimulatorTitle: 'AI Predictive Wait-Time Simulator & Factor Breakdown',
    weatherWeighbridges: 'Weather · Weighbridges · Crop Moisture',

    // Admin Dashboard
    adminTitle: 'Mandi Queue Command Centre',
    nextToken: 'Next Token',
    pauseQueue: 'Pause Queue',
    resumeQueue: 'Resume Queue',
    addFarmer: 'Add Farmer',
    updateRate: 'Update Processing Rate',
    todaysFarmers: "Today's Farmers",
    linkWhatsAppQR: 'Link WhatsApp (Scan QR)',

    // Actions & Badges
    whatsappSuccess: 'WhatsApp Alert Sent',
    sendWhatsApp: 'Send on WhatsApp',
    directWhatsApp: 'Send WhatsApp Alert',
    manageDevice: 'Manage Device',
    linkPhoneQR: 'Link Phone via WhatsApp Web QR',
    scanQRCode: 'Scan QR Code',
    close: 'Close',
    directSend: 'Direct Send',
    sending: 'Sending...',
    sent: 'Sent!',
  },
  hi: {
    // Nav & Sidebar
    brandSub: 'स्मार्ट खरीद प्रबंधन प्रणाली',
    signIn: 'लॉगिन करें',
    register: 'पंजीकरण',
    livePortal: 'लाइव पोर्टल',
    home: 'होम',
    dashboard: 'डैशबोर्ड',
    payments: 'भुगतान स्थिति',
    history: 'खरीद इतिहास',
    notifications: 'सूचनाएं',
    signOut: 'साइन आउट',
    farmerPortal: 'किसान पोर्टल',
    adminPortal: 'मंडी अधिकारी पोर्टल',
    liveQueueActive: 'लाइव कतार प्रणाली सक्रिय',

    // Hero
    heroBadge: '12-कारक AI भविष्यवाणी · मल्टी-मंडी ऑप्टिमाइज़ेशन',
    heroTitle1: 'सटीक अनुमान. सही सूचना.',
    heroTitle2: 'घटेगा मंडी का इंतज़ार.',
    heroSubtitle: 'किसानों के लिए AI-संचालित लाइव कतार प्रबंधन। मंडी पहुंचने से पहले जानिए सही टोकन, सटीक प्रतीक्षा समय, और घर से निकलने का सही समय — सीधे WhatsApp पर।',
    startWithPhone: 'फ़ोन नंबर से शुरू करें',
    mandiOfficerLogin: 'मंडी अधिकारी लॉगिन',
    scrollDown: 'प्लेटफ़ॉर्म देखने के लिए नीचे स्क्रॉल करें',

    // Quick Checker
    quickCheckTitle: 'लाइव टोकन और कतार चेक करें',
    quickCheckDesc: 'लाइव प्रतीक्षा स्थिति देखने के लिए मोबाइल नंबर दर्ज करें',
    mobileNumberLabel: 'किसान का मोबाइल नंबर',
    checkStatusBtn: 'लाइव टोकन स्थिति देखें',
    currentTokenLabel: 'चालू टोकन',
    farmersAheadLabel: 'आगे किसान',
    estWaitLabel: 'अनुमानित प्रतीक्षा',
    departAtLabel: 'घर से प्रस्थान',
    openDashboard: 'डैशबोर्ड खोलें',

    // Metrics
    impactMetrics: 'प्रभाव मेट्रिक्स',
    metricsHeading: 'सटीक इंटेलिजेंस. कोई अनुमान नहीं.',
    waitTimeRed: 'मंडी प्रतीक्षा समय में कमी',
    tokensProc: 'किसान टोकन प्रसंस्कृत',
    mspTracked: 'प्रत्यक्ष MSP भुगतान ट्रैक किया गया',
    mlParams: 'प्रशिक्षित AI/ML पैरामीटर्स',

    // Farmer Dashboard Header
    namaste: 'नमस्ते',
    liveToken: 'लाइव टोकन',
    bookSlotBtn: '+ नया टोकन बुक करें',
    getWhatsAppAlerts: 'WhatsApp पर अलर्ट पाएं',
    completedToday: 'आज पूर्ण खरीद',
    waitingFarmers: 'प्रतीक्षारत किसान',
    avgProcessing: 'औसत समय प्रति किसान',
    perFarmer: 'प्रति किसान',
    mandiStatus: 'मंडी स्थिति',
    openAccepting: 'खुली है · किसानों का स्वागत',
    inQueue: 'कतार में',
    beingProcessed: 'प्रक्रिया जारी है',
    yourNumber: 'आपका नंबर',
    queueProgress: 'कतार प्रगति',
    estWait: 'अनुमानित प्रतीक्षा',
    reachMandiBy: 'मंडी पहुँचें समय',
    leaveHomeAt: 'घर से निकलें',
    travelTime: 'यात्रा समय',
    queueWait: 'कतार प्रतीक्षा',
    recommendedArrival: 'अनुशंसित आगमन समय',
    setTravelTime: 'यात्रा समय सेट करें',
    recommendedDesc: 'वर्तमान कतार और औसत वजन गति के आधार पर अनुशंसित। यात्रा समय आपके द्वारा सेट किए गए अनुमान पर आधारित है।',

    // Procurement Details Card
    myProcurement: 'मेरी खरीद विवरण',
    yourTokenNo: 'आपका टोकन नंबर',
    mandi: 'मंडी',
    crop: 'फसल',
    quantity: 'मात्रा',
    date: 'दिनांक',
    slot: 'समय स्लॉट',
    prototypeDemoData: 'प्रोटोटाइप डेमो डेटा',

    // Payment Card
    paymentStatus: 'भुगतान स्थिति',
    procurementAmount: 'खरीद राशि (MSP)',
    referenceNumber: 'संदर्भ संख्या (Reference No)',
    paymentProgress: 'भुगतान प्रगति',
    procurementCompleted: 'खरीद पूर्ण',
    paymentInitiated: 'भुगतान शुरू किया गया',
    paymentProcessing: 'भुगतान प्रक्रियाधीन (DBT)',
    paymentCompleted: 'बैंक खाते में जमा पूर्ण',

    // Cross-Centre Routing
    smartRouting: 'स्मार्ट रूटिंग',
    crossCentreOptimization: 'क्रॉस-सेंटर AI रूटिंग व समय बचत',
    routingDesc: 'आस-पास के खरीद केन्द्रों पर भीड़ व प्रतीक्षा समय की तुलना',
    recommendedAlternative: '⚡ अनुशंसित वैकल्पिक केन्द्र',
    currentMandi: 'वर्तमान चयनित मंडी',
    weighbridges: 'वेब्रिज (धर्मकांटा)',
    away: 'दूरी',
    bookSlotHere: 'यहाँ स्लॉट बुक करें',
    totalRoute: 'कुल रूट समय',
    lessCrowd: 'कम भीड़, तेज़ तौल व तुरंत फ्री',

    // AI Simulator
    aiSimulatorTitle: 'AI प्रतीक्षा-समय सिम्युलेटर एवं 12-कारक विश्लेषण',
    weatherWeighbridges: 'मौसम · सक्रिय वेब्रिज · फसल नमी स्तर',

    // Admin Dashboard
    adminTitle: 'मंडी लाइव कतार कमांड सेंटर',
    nextToken: 'अगला टोकन',
    pauseQueue: 'कतार रोकें',
    resumeQueue: 'कतार पुनः चालू करें',
    addFarmer: 'नया किसान जोड़ें',
    updateRate: 'तौल गति अपडेट करें',
    todaysFarmers: 'आज के किसान',
    linkWhatsAppQR: 'WhatsApp लिंक करें (QR स्कैन)',

    // Actions & Badges
    whatsappSuccess: 'WhatsApp संदेश भेजा गया',
    sendWhatsApp: 'WhatsApp पर भेजें',
    directWhatsApp: 'WhatsApp पर अलर्ट भेजें',
    manageDevice: 'डिवाइस प्रबंधित करें',
    linkPhoneQR: 'फोन को WhatsApp QR से लिंक करें',
    scanQRCode: 'QR कोड स्कैन करें',
    close: 'बंद करें',
    directSend: 'सीधा भेजें',
    sending: 'भेजा जा रहा है...',
    sent: 'भेज दिया गया!',
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('bhumi_lang') || 'en'; // Default is English!
  });

  useEffect(() => {
    localStorage.setItem('bhumi_lang', lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang(prev => (prev === 'en' ? 'hi' : 'en'));
  };

  const t = (key) => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
