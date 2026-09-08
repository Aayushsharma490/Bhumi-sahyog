import { useState, useEffect } from 'react';
import { 
  MessageCircle, QrCode, CheckCircle2, RefreshCw, Smartphone, 
  Send, ExternalLink, ShieldCheck, AlertCircle, Loader2, X, Settings, Check
} from 'lucide-react';
import { apiFetch, getApiBaseUrl, setApiBaseUrl } from '../config/api';

export default function WhatsAppScannerModal({ isOpen, onClose }) {
  const [status, setStatus] = useState({
    enabled: true,
    ready: false,
    status: 'initializing',
    qr: null,
    phone: null,
  });
  const [loading, setLoading] = useState(false);
  const [testPhone, setTestPhone] = useState('7727038430');
  const [testMessage, setTestMessage] = useState('🌾 Bhumi Sahyog Live Queue Alert: Token T-247 (Jaipur Mandi) is active! 33 farmers ahead, wait time ~18 mins.');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);
  
  // Backend Connection URL setting
  const [customBackendUrl, setCustomBackendUrl] = useState(() => getApiBaseUrl() || 'http://localhost:3001');
  const [showSettings, setShowSettings] = useState(false);
  const [serverReachable, setServerReachable] = useState(true);

  const fetchStatus = async () => {
    try {
      const res = await apiFetch('/api/whatsapp/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        setServerReachable(true);
      } else {
        setServerReachable(false);
      }
    } catch (err) {
      setServerReachable(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchStatus();
    const interval = setInterval(fetchStatus, 2500);
    return () => clearInterval(interval);
  }, [isOpen, customBackendUrl]);

  const handleSaveBackendUrl = (e) => {
    e.preventDefault();
    setApiBaseUrl(customBackendUrl);
    setShowSettings(false);
    fetchStatus();
  };

  const handleRestart = async () => {
    setLoading(true);
    try {
      await apiFetch('/api/whatsapp/restart', { method: 'POST' });
      await fetchStatus();
    } catch (err) {
      console.error('Restart error:', err);
    } finally {
      setTimeout(() => setLoading(false), 2000);
    }
  };

  const handleSendTest = async (e) => {
    e.preventDefault();
    if (!testPhone) return;
    setSendingTest(true);
    setTestResult(null);

    const cleanPhone = testPhone.replace(/\D/g, '').slice(-10);

    try {
      const res = await apiFetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          message: testMessage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({ success: true, message: `✅ Live WhatsApp message delivered to +91 ${cleanPhone}!` });
      } else {
        setTestResult({ 
          success: false, 
          message: data.result?.reason || data.error || 'Please scan the real WhatsApp QR code first to connect WhatsApp.' 
        });
      }
    } catch (err) {
      setTestResult({ success: false, message: 'Could not reach backend server: ' + err.message });
    } finally {
      setSendingTest(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border border-slate-200 text-slate-900 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <MessageCircle size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                WhatsApp Device Link & Live QR
              </h2>
              <p className="text-xs text-slate-500">
                अपने फ़ोन के WhatsApp से रियल QR कोड स्कैन करें (Multi-Device Link)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer ${
                showSettings ? 'bg-slate-100 text-slate-800' : ''
              }`}
              title="Backend Server Settings"
            >
              <Settings size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Backend Connection Settings Dropdown */}
        {showSettings && (
          <form onSubmit={handleSaveBackendUrl} className="my-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                Backend Server URL (Node API):
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                {serverReachable ? '🟢 Connected' : '🔴 Unreachable'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Netlify पर रियल QR कोड पाने के लिए अपना बैकएंड सर्वर URL (जैसे <code>http://localhost:3001</code> या tunnel URL) दर्ज करें:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={customBackendUrl}
                onChange={(e) => setCustomBackendUrl(e.target.value)}
                placeholder="http://localhost:3001"
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-mono"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
              >
                <Check size={14} /> Connect
              </button>
            </div>
          </form>
        )}

        {/* Connection Status Banner */}
        <div className="my-4">
          {status.ready ? (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                      WhatsApp Connected
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-xs text-emerald-800 font-semibold truncate">
                    Active as +91 {status.phone || '7727038430'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRestart}
                disabled={loading}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                <span>{loading ? 'Resetting...' : 'Scan New QR'}</span>
              </button>
            </div>
          ) : status.qr ? (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-2.5 text-xs text-amber-900 font-medium">
              <div className="flex items-center gap-2">
                <QrCode size={18} className="text-amber-600 shrink-0" />
                <span>रियल WhatsApp QR कोड तैयार है! अपने फ़ोन से स्कैन करें।</span>
              </div>
              <button
                type="button"
                onClick={handleRestart}
                disabled={loading}
                className="text-xs font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>
          ) : !serverReachable ? (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-red-950">
                <AlertCircle size={16} className="text-red-600 shrink-0" />
                <span>बैकएंड सर्वर से कनेक्शन नहीं हो पा रहा है</span>
              </div>
              <p className="text-red-700 leading-relaxed">
                रियल WhatsApp QR कोड लोड करने के लिए कृपया सुनिश्चित करें कि आपका Node.js सर्वर (<code>node src/index.js</code>) चल रहा है।
              </p>
              <button
                type="button"
                onClick={() => setShowSettings(true)}
                className="text-[11px] font-bold text-red-900 underline cursor-pointer"
              >
                ⚙️ सर्वर URL कॉन्फ़िगर करें (Configure Server URL)
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 flex items-center gap-2.5 text-xs text-slate-700">
              <Loader2 size={16} className="animate-spin text-emerald-600 shrink-0" />
              <span>रियल WhatsApp QR कोड जनरेट हो रहा है... कृपया 2 सेकंड प्रतीक्षा करें।</span>
            </div>
          )}
        </div>

        {/* QR Code Section or Connected Success State */}
        {!status.ready ? (
          <div className="text-center space-y-4 py-2">
            {status.qr ? (
              <div className="inline-block p-3.5 bg-white rounded-3xl border-2 border-emerald-500 shadow-2xl">
                <img
                  src={status.qr}
                  alt="Real WhatsApp Multi-Device QR Code"
                  className="w-60 h-60 sm:w-64 sm:h-64 object-contain rounded-xl mx-auto"
                />
              </div>
            ) : (
              <div className="w-60 h-60 sm:w-64 sm:h-64 mx-auto rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2 text-slate-400 p-4">
                <Loader2 size={32} className="animate-spin text-emerald-500" />
                <span className="text-xs font-semibold text-center">
                  {serverReachable ? 'Generating Real WhatsApp Multi-Device QR...' : 'Connecting to Server...'}
                </span>
              </div>
            )}

            {/* Step-by-Step Instructions */}
            <div className="text-left bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2 text-xs">
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <Smartphone size={14} className="text-emerald-600" />
                रियल WhatsApp से कैसे लिंक करें (How to Link):
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-600 font-medium pl-1">
                <li>अपने फ़ोन में WhatsApp खोलें (जैसे +91 7727038430)</li>
                <li><strong>Settings</strong> (iPhone) या ऊपर दाईं ओर <strong>⋮ मेनू</strong> (Android) पर टैप करें</li>
                <li><strong>Linked Devices</strong> → <strong>Link a Device</strong> चुनें</li>
                <li>अपने फ़ोन के कैमरे को ऊपर दिए गए <strong>QR कोड</strong> के सामने लाएं</li>
              </ol>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={handleRestart}
                disabled={loading}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                {loading ? 'Refreshing...' : 'Regenerate Fresh QR'}
              </button>

              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
              >
                <Settings size={13} />
                <span>Server Endpoint</span>
              </button>
            </div>
          </div>
        ) : (
          /* Connected State: Instant Test Sender */
          <div className="space-y-4 py-2">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-1">
              <h4 className="text-xs font-black text-emerald-900 flex items-center gap-1.5 uppercase tracking-wide">
                <ShieldCheck size={16} className="text-emerald-600" />
                Live WhatsApp Connected (+91 {status.phone || '7727038430'})
              </h4>
              <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                आपका WhatsApp सफलतापूर्वक लिंक हो चुका है। अब टोकन बुकिंग, स्वागत संदेश तथा भुगतान रसीद स्वतः आपके नंबर से जाएगी।
              </p>
            </div>

            <form onSubmit={handleSendTest} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">
                  Send Test WhatsApp Message To:
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10 digit number"
                    className="w-full pl-11 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">
                  Message Content:
                </label>
                <textarea
                  rows={3}
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold ${
                    testResult.success
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {testResult.message}
                </div>
              )}

              <button
                type="submit"
                disabled={sendingTest || !testPhone}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {sendingTest ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Sending Live WhatsApp Message...
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Send Live WhatsApp Message Now
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
