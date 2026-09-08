// WhatsAppAlertButton.jsx — Direct WhatsApp Alert Dispatch to Any Recipient / Judge
import { useState, useEffect } from 'react';
import { MessageCircle, Check, Send, Sparkles, Smartphone, BellRing, ExternalLink, ShieldCheck, UserCheck, QrCode } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import WhatsAppScannerModal from './WhatsAppScannerModal';

export default function WhatsAppAlertButton({ 
  token = 247, 
  currentToken = 213, 
  farmersAhead = 34, 
  waitTime = '~50 min', 
  departureTime = '05:11 PM',
  crop = 'Wheat (12 Qtl)',
  defaultPhone = '7727038430' 
}) {
  const { lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [waStatus, setWaStatus] = useState({ ready: false, phone: null });
  const [phoneNumber, setPhoneNumber] = useState(() => defaultPhone || localStorage.getItem('bhumi_user_wa') || '7727038430');
  const [recipientRole, setRecipientRole] = useState('judge'); // 'judge' | 'farmer'
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dispatchNote, setDispatchNote] = useState(null);
  const [manualLink, setManualLink] = useState(null);

  useEffect(() => {
    fetch('/api/whatsapp/status')
      .then((r) => r.json())
      .then((data) => setWaStatus(data))
      .catch(() => {});
  }, [isOpen, showScanner]);

  // Formatted Bilingual Hindi + English WhatsApp message template
  const getWhatsAppMessage = (phone) => {
    return (
      `🌾 *भूमिसहयोग - किसान टोकन और मंडी लाइव कतार अपडेट*\n` +
      `*BHUMI SAHYOG — REAL-TIME PROCUREMENT TICKET*\n` +
      `--------------------------------\n` +
      `नमस्ते! Live Mandi Queue status for Token *T-${token}*:\n\n` +
      `🎫 *टोकन नंबर / Token No:* T-${token}\n` +
      `🔴 *वर्तमान चालू टोकन / Current Mandi Token:* T-${currentToken}\n` +
      `👥 *कतार में आगे किसान / Farmers Ahead:* ${farmersAhead}\n` +
      `⏱️ *AI अनुमानित प्रतीक्षा समय / Est. Wait:* ${waitTime}\n` +
      `🚗 *घर से प्रस्थान समय / Depart From Home:* ${departureTime}\n` +
      `🌾 *फसल / Commodity:* ${crop}\n` +
      `📍 *केन्द्र / Mandi:* जयपुर खरीद केन्द्र (Jaipur Mandi)\n` +
      `💰 *MSP स्थिति / Payment:* ₹26,400 (DBT Bank Transfer Mode)\n\n` +
      `⚡ _यह संदेश भूमिसहयोग AI लाइव कतार प्रबंधन प्रणाली द्वारा प्रेषित है।_\n` +
      `👉 लाइव स्थिति देखें: https://bhumi-sahyog.netlify.app/farmer\n` +
      `📞 सपोर्ट / Helpline: +91 7727038430`
    );
  };

  const handleSendWhatsApp = async (e) => {
    e.preventDefault();
    if (!phoneNumber) return;
    
    // Clean phone number (remove non-digits)
    let cleanPhone = phoneNumber.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length < 10) return;
    const fullPhone = '91' + cleanPhone;
    
    setLoading(true);
    localStorage.setItem('bhumi_user_wa', cleanPhone);

    const messageText = getWhatsAppMessage(fullPhone);

    // 1. Direct Background Dispatch via Backend API (NO POPUP WINDOW)
    try {
      await fetch('/api/notifications/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: fullPhone,
          farmerId: 'farmer-001',
          type: 'QUEUE_UPDATE',
          message: messageText,
        }),
      });
    } catch (err) {
      console.warn('Backend WhatsApp dispatch note:', err);
    }

    // 2. Prepare manual web link (NOT auto-opened, zero popup harassment)
    const waUrl = `https://api.whatsapp.com/send?phone=${fullPhone}&text=${encodeURIComponent(messageText)}`;
    setManualLink(waUrl);

    setLoading(false);
    setSent(true);
    setTimeout(() => {
      setSent(false);
    }, 4000);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
      >
        <MessageCircle size={16} />
        <span>{lang === 'hi' ? 'WhatsApp पर अलर्ट भेजें' : 'Send WhatsApp Alert'}</span>
        <span className="bg-emerald-500/50 text-[10px] px-1.5 py-0.5 rounded-full font-bold">DIRECT</span>
      </button>

      {/* Modal for Direct Sending to Judge or Farmer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-900">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <MessageCircle size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {lang === 'hi' ? 'WhatsApp पर लाइव टोकन अलर्ट भेजें' : 'Send WhatsApp Live Alert'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {lang === 'hi' ? 'मोबाइल नंबर दर्ज करें और तुरंत अलर्ट भेजें' : 'Enter 10-digit mobile number to send instant alert'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {/* WhatsApp Live Device Link Status */}
            {waStatus.ready ? (
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl mb-3 text-xs">
                <span className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live WhatsApp Connected (+91 {waStatus.phone || '7727038430'})
                </span>
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="text-[10px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-md transition-all cursor-pointer"
                >
                  Scanner / QR
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2.5 bg-amber-50 border border-amber-200 rounded-xl mb-3 text-xs">
                <span className="flex items-center gap-1.5 font-bold text-amber-900">
                  <QrCode size={14} className="text-amber-600" />
                  Link Phone via WhatsApp Web QR
                </span>
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="text-xs font-black text-slate-900 bg-amber-300 hover:bg-amber-400 px-2.5 py-1 rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  Scan QR Code
                </button>
              </div>
            )}

            <form onSubmit={handleSendWhatsApp} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  {lang === 'hi' ? 'प्राप्तकर्ता का WhatsApp मोबाइल नंबर' : 'Recipient WhatsApp Mobile Number'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="7727038430"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-11 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  💡 Zero popup window: message dispatches straight via backend API
                </p>
              </div>

              {/* Message preview box */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1 text-emerald-950">
                <p className="font-bold text-emerald-800 flex items-center gap-1">
                  <Sparkles size={12} /> Live Message Preview:
                </p>
                <p className="text-[11px] text-emerald-900">• Token: T-{token} | Farmers Ahead: {farmersAhead}</p>
                <p className="text-[11px] text-emerald-900">• Est. Wait: {waitTime} | Depart: {departureTime}</p>
                <p className="text-[11px] text-emerald-900">• Crop: {crop} | Mandi: Jaipur Procurement Centre</p>
              </div>

              {/* Success Notification */}
              {sent && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-bold flex items-center justify-between animate-in fade-in">
                  <span className="flex items-center gap-1.5">
                    <Check size={16} className="text-emerald-700" />
                    WhatsApp message dispatched to +91 {phoneNumber}!
                  </span>
                  {manualLink && (
                    <a
                      href={manualLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-emerald-800 underline flex items-center gap-0.5"
                    >
                      View on Web <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={loading || !phoneNumber}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    'Sending...'
                  ) : sent ? (
                    <>
                      <Check size={14} /> Sent! Send Again
                    </>
                  ) : (
                    <>
                      <Send size={13} /> Direct Send
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live QR Scanner Modal */}
      <WhatsAppScannerModal isOpen={showScanner} onClose={() => setShowScanner(false)} />
    </>
  );
}
