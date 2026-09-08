import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithPhone, registerWithPhone, DEMO_CREDENTIALS } from '../firebase/auth';
import { apiFetch } from '../config/api';
import LanguageToggle from '../components/LanguageToggle';
import { useLanguage } from '../context/LanguageContext';
import { 
  Wheat, Eye, EyeOff, Loader2, Shield, User, ArrowRight, 
  ChevronRight, Phone, CheckCircle2, Sparkles, MapPin, Sprout, MessageCircle
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('farmer'); // farmer | admin
  const [phone, setPhone] = useState('7727038430');
  const [password, setPassword] = useState('demo1234');
  const [name, setName] = useState('');
  const [village, setVillage] = useState('Bassi, Jaipur');
  const [crop, setCrop] = useState('Wheat');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendLoginWhatsAppAlert = (targetPhone, userName, isNew) => {
    const clean = (targetPhone || '7727038430').replace(/\D/g, '').slice(-10);
    const fullMsg = isNew
      ? `🌾 *भूमि सहयोग - किसान पंजीकरण स्वागत संदेश*\n` +
        `*BHUMI SAHYOG — WELCOME TO SMART PROCUREMENT*\n` +
        `--------------------------------\n` +
        `नमस्ते *${userName || 'किसान भाई'}* ji!\n` +
        `भूमि सहयोग (Bhumi Sahyog) पोर्टल पर आपका हार्दिक स्वागत है।\n` +
        `आपका मोबाइल नंबर *+91 ${clean}* सफलतापूर्वक पंजीकृत हो गया है।\n\n` +
        `📍 आपकी खरीद मंडी / Mandi: Jaipur Procurement Centre (Surajpole)\n` +
        `🌾 मुख्य फसल / Crop: ${crop || 'Wheat (गेहूं)'}\n\n` +
        `अब आप पोर्टल से सीधे अपनी मंडी का लाइव खरीद टोकन बुक कर सकते हैं, कतार स्थिति ट्रैक कर सकते हैं और MSP भुगतान की लाइव रसीद प्राप्त कर सकते हैं।\n\n` +
        `👉 अपना किसान पोर्टल खोलें / Open Portal:\n` +
        `https://bhumi-sahyog.netlify.app/farmer\n\n` +
        `_भूमि सहयोग — Predict. Inform. Reduce Waiting._`
      : `🌾 *भूमि सहयोग - किसान लॉगिन पुष्टि*\n` +
        `*BHUMI SAHYOG — LOGIN CONFIRMED*\n` +
        `--------------------------------\n` +
        `नमस्ते *${userName || 'किसान भाई'}* ji!\n` +
        `आपके नंबर *+91 ${clean}* से भूमिसहयोग पोर्टल पर सफलतापूर्वक लॉगिन कर लिया गया है।\n\n` +
        `👉 लाइव किसान पोर्टल खोलें / Open Portal:\n` +
        `https://bhumi-sahyog.netlify.app/farmer\n\n` +
        `_भूमि सहयोग — Predict. Inform. Reduce Waiting._`;

    // Post to backend in background
    apiFetch('/api/notifications/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '91' + clean,
        type: isNew ? 'WELCOME_NEW_FARMER' : 'LOGIN_CONFIRMATION',
        message: fullMsg,
      }),
    }).catch(() => {});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length < 10) {
      setError(lang === 'hi' ? 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें' : 'Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);

    if (isRegister) {
      const { user, error: regError } = await registerWithPhone({
        phone: cleanPhone,
        name: name || `Kisan (${cleanPhone.slice(-4)})`,
        village,
        crop,
        password,
        role,
      });

      if (regError) {
        setError(regError);
        setLoading(false);
        return;
      }

      sendLoginWhatsAppAlert(cleanPhone, name || 'Kisan Bhai', true);
      setLoading(false);
      navigate('/farmer');
    } else {
      const { user, error: authError } = await signInWithPhone(cleanPhone, password);

      if (authError) {
        setError(authError);
        setLoading(false);
        return;
      }

      sendLoginWhatsAppAlert(cleanPhone, user?.displayName || 'Ramesh Kumar', false);
      setLoading(false);
      if (user?.role === 'admin' || cleanPhone.startsWith('9414')) {
        navigate('/admin');
      } else {
        navigate('/farmer');
      }
    }
  };

  const fillQuickPhone = (type) => {
    setError('');
    if (type === 'farmer') {
      setPhone('7727038430');
      setPassword('demo1234');
      setRole('farmer');
    } else if (type === 'admin') {
      setPhone('9414012345');
      setPassword('admin1234');
      setRole('admin');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row text-white">
      {/* Left panel — Agricultural Visual & Brand */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-gradient-to-br from-primary-950 via-primary-900 to-slate-950 border-r border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none" />

        <Link to="/" className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-400/40 rounded-xl flex items-center justify-center">
            <Wheat size={20} className="text-accent-400" />
          </div>
          <div>
            <span className="font-bold text-xl text-white block leading-none" style={{ fontFamily: 'Outfit,sans-serif' }}>
              Bhumi Sahyog
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
              भूमि सहयोग · किसान पोर्टल
            </span>
          </div>
        </Link>

        <div className="relative z-10 my-auto py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-4">
            <Sparkles size={12} className="text-accent-400" />
            <span>मोबाइल नंबर आधारित सुरक्षित लॉगिन</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight" style={{ fontFamily: 'Outfit,sans-serif' }}>
            Predict. Inform.<br />
            <span className="text-accent-400">Reduce Waiting.</span>
          </h1>
          <p className="text-slate-300 text-base max-w-md mb-8">
            अपने मोबाइल नंबर से लॉगिन करें और लाइव टोकन, कतार स्थिति तथा व्हाट्सएप अपडेट प्राप्त करें।
          </p>

          <div className="space-y-3.5 max-w-sm">
            {[
              { icon: '📱', title: 'मोबाइल नंबर से तुरंत प्रवेश', desc: 'ईमेल की कोई आवश्यकता नहीं' },
              { icon: '🎫', title: 'लाइव टोकन और कतार ट्रैकिंग', desc: 'घर से निकलने का सबसे सटीक समय' },
              { icon: '💬', title: 'सीधे WhatsApp पर अलर्ट', desc: 'हिंदी और अंग्रेजी दोनों भाषाओं में' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                <span className="text-xl">{icon}</span>
                <div>
                  <p className="text-sm font-bold text-white">{title}</p>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-500 text-xs relative z-10">
          Bhumi Sahyog Platform · Rajasthan Mandi Integrated Network
        </p>
      </div>

      {/* Right panel — Phone Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-white text-slate-900">
        <div className="w-full max-w-md">
          {/* Mobile brand header */}
          <Link to="/" className="lg:hidden flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 bg-primary-800 rounded-lg flex items-center justify-center">
              <Wheat size={16} className="text-accent-400" />
            </div>
            <span className="font-bold text-primary-900 text-lg" style={{ fontFamily: 'Outfit,sans-serif' }}>
              Bhumi Sahyog
            </span>
          </Link>

          {/* Toggle Login vs Register */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                !isRegister ? 'bg-white shadow-sm text-primary-800' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              लॉगिन करें (Sign In)
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                isRegister ? 'bg-white shadow-sm text-primary-800' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              नया किसान पंजीकरण (Register)
            </button>
          </div>

          <h2 className="text-2xl font-black text-slate-900 mb-1" style={{ fontFamily: 'Outfit,sans-serif' }}>
            {isRegister ? 'किसान पंजीकरण (New Registration)' : 'किसान लॉगिन (Farmer Sign In)'}
          </h2>
          <p className="text-slate-500 text-xs mb-5">
            {isRegister
              ? 'अपना मोबाइल नंबर और विवरण दर्ज करके तुरंत पंजीकरण करें'
              : 'अपना 10 अंकों का मोबाइल नंबर और पासवर्ड दर्ज करें'}
          </p>

          {/* Quick Demo Credentials */}
          <div className="mb-5 p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl">
            <p className="text-xs font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
              <Sparkles size={13} className="text-emerald-600" /> डेमो क्रेडेंशियल्स (Demo Login):
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillQuickPhone('farmer')}
                className={`text-center py-2 px-3 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  phone === '7727038430'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white border border-emerald-200 text-emerald-900 hover:bg-emerald-100'
                }`}
              >
                🌾 किसान (Farmer)
              </button>

              <button
                type="button"
                onClick={() => fillQuickPhone('admin')}
                className={`text-center py-2 px-3 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  phone === '9414012345'
                    ? 'bg-primary-800 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                🏢 मंडी अधिकारी (Admin)
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Name & Village if Registering */}
            {isRegister && (
              <>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">किसान का पूरा नाम (Full Name)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="उदा. रमेश कुमार"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">गाँव / क्षेत्र (Village)</label>
                    <input
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      placeholder="बस्सी, जयपुर"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">मुख्य फसल (Crop)</label>
                    <select
                      value={crop}
                      onChange={(e) => setCrop(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Wheat">Wheat (गेहूं)</option>
                      <option value="Mustard">Mustard (सरसों)</option>
                      <option value="Paddy">Paddy (धान)</option>
                      <option value="Bajra">Bajra (बाजरा)</option>
                      <option value="Soybean">Soybean (सोयाबीन)</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Mobile Number */}
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                मोबाइल नंबर (10-Digit Mobile Number)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, ''));
                    setError('');
                  }}
                  placeholder="7727038430"
                  className="w-full pl-11 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Password / PIN */}
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                पासवर्ड या 4-अंकों का पिन (PIN / Password)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="••••••••"
                  className="w-full px-3 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>कृपया प्रतीक्षा करें...</span>
                </>
              ) : isRegister ? (
                <>
                  <span>किसान पंजीकरण पूरा करें</span>
                  <ArrowRight size={16} />
                </>
              ) : (
                <>
                  <span>लॉगिन करें (Sign In)</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <Link to="/" className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold">
              ← होमपेज पर वापस जाएं
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
