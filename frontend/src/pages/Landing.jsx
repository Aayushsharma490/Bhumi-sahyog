import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Wheat, ArrowRight, ChevronDown, Clock, MessageCircle, 
  Phone, Search, ShieldCheck, CheckCircle, Sparkles, MapPin, TrendingUp
} from 'lucide-react';
import MagneticCTA from '../components/MagneticCTA';
import LanguageToggle from '../components/LanguageToggle';
import { useLanguage } from '../context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

export default function Landing() {
  const { t, lang } = useLanguage();
  const [quickPhone, setQuickPhone] = useState('7727038430');
  const [quickCheckResult, setQuickCheckResult] = useState(null);

  const heroPinnedRef = useRef(null);
  const maskGroupRef = useRef(null);
  const outlineGroupRef = useRef(null);
  const overlayRectRef = useRef(null);
  const statsSectionRef = useRef(null);

  useEffect(() => {
    // 1. Hero SVG Text Cutout Zoom-Through Scrub Animation
    let scrollTriggerInstance = null;
    try {
      if (heroPinnedRef.current && maskGroupRef.current && outlineGroupRef.current) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: heroPinnedRef.current,
            start: 'top top',
            end: 'bottom+=100% top',
            scrub: 1.2,
            pin: true,
          },
        });

        // Zoom through the letters
        tl.to(
          [maskGroupRef.current, outlineGroupRef.current],
          {
            scale: 40,
            transformOrigin: '50% 50%',
            ease: 'power2.inOut',
          },
          0
        );

        // Fade out dark mask overlay
        if (overlayRectRef.current) {
          tl.to(overlayRectRef.current, { opacity: 0, ease: 'power1.out' }, 0);
        }
      }
    } catch (err) {
      console.warn('GSAP Hero animation init skipped:', err);
    }

    // 2. Animated Number Counters
    if (statsSectionRef.current) {
      const counters = statsSectionRef.current.querySelectorAll('.stat-counter');
      counters.forEach((el) => {
        const target = parseInt(el.getAttribute('data-target') || '0', 10);
        gsap.fromTo(
          el,
          { textContent: '0' },
          {
            textContent: target,
            duration: 1.8,
            ease: 'power2.out',
            snap: { textContent: 1 },
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const handleQuickCheck = (e) => {
    e.preventDefault();
    if (!quickPhone) return;
    setQuickCheckResult({
      phone: quickPhone,
      farmerName: quickPhone === '7727038430' ? 'Ramesh Kumar (7727038430)' : 'Farmer Member',
      token: 'T-247',
      currentToken: 'T-213',
      farmersAhead: 33,
      waitTime: lang === 'hi' ? '~50 मिनट' : '~50 mins',
      departureTime: '05:11 PM',
      mandi: 'Jaipur Main Mandi (Surajpole)',
      crop: 'Wheat (गेहूं) - 12 Qtl',
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden selection:bg-accent-400 selection:text-slate-950 font-sans">
      {/* Top Ticker */}
      <div className="bg-primary-950/95 border-b border-white/10 py-1 px-3 text-center text-[11px] text-green-200 flex items-center justify-between sm:justify-center gap-3 overflow-hidden whitespace-nowrap">
        <span className="flex items-center gap-1.5 font-medium truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <span className="truncate">{lang === 'hi' ? 'लाइव मंडी स्थिति: जयपुर, बस्सी, चोमू' : 'Live Mandi Status: Jaipur, Bassi & Chomu'}</span>
        </span>
        <span className="hidden md:inline text-green-400/50">|</span>
        <span className="hidden md:inline">MSP 2026: Wheat ₹2,275/Qtl · Mustard ₹5,650/Qtl</span>
        <span className="flex items-center gap-1 text-accent-300 font-semibold shrink-0 text-[10px] sm:text-xs">
          <MessageCircle size={12} /> WhatsApp +91 7727038430
        </span>
      </div>

      {/* Top Sticky Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 shrink-0">
            <img src="/logo.png" alt="Bhumi Sahyog" className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-lg" />
            <div>
              <span className="font-black text-white text-base sm:text-lg tracking-tight block leading-none" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Bhumi Sahyog
              </span>
              <span className="hidden sm:block text-[9px] text-emerald-400 font-semibold uppercase tracking-wider">
                {t('brandSub')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Global English / Hindi Language Switcher */}
            <LanguageToggle />

            <Link
              to="/login"
              className="hidden xs:flex text-xs sm:text-sm text-slate-300 hover:text-white font-semibold px-2 py-1.5 transition-colors items-center gap-1"
            >
              <Phone size={13} className="text-emerald-400" />
              <span>{t('signIn')}</span>
            </Link>

            <MagneticCTA>
              <Link
                to="/login"
                className="bg-accent-400 hover:bg-accent-500 text-slate-950 font-black text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4 rounded-xl flex items-center gap-1 shadow-lg shadow-accent-400/20 transition-all cursor-pointer"
              >
                <span>{t('livePortal')}</span>
                <ArrowRight size={13} />
              </Link>
            </MagneticCTA>
          </div>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* SECTION 1: PINNED HERO SVG TEXT CUTOUT ZOOM-THROUGH ANIMATION             */}
      {/* ========================================================================= */}
      <section ref={heroPinnedRef} className="relative h-[80vh] sm:h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Layer 1 (Base): Lush Agricultural Farm Visual & Ambient Lighting */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=2000&q=80"
            alt="Lush Indian Agricultural Fields"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary-950/80 via-emerald-950/60 to-slate-950/90" />
        </div>

        {/* Layer 2 (SVG Mask): Text Cutout Zooming on Scroll */}
        <svg
          className="absolute inset-0 w-full h-full z-20 pointer-events-none select-none"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <mask id="heroMask">
              {/* White background: makes the surface opaque */}
              <rect width="1440" height="900" fill="white" />
              {/* Black text: creates transparent cutouts through which the farm reveals */}
              <g ref={maskGroupRef} transform="translate(720, 450) scale(0.75)">
                <text
                  x="0"
                  y="-15"
                  textAnchor="middle"
                  fill="black"
                  fontSize="74"
                  fontWeight="900"
                  letterSpacing="-1"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  BHUMI SAHYOG
                </text>
                <text
                  x="0"
                  y="52"
                  textAnchor="middle"
                  fill="black"
                  fontSize="36"
                  fontWeight="700"
                  letterSpacing="1"
                >
                  भूमि सहयोग
                </text>
              </g>
            </mask>
          </defs>

          {/* Dark Forest Green Surface Layer */}
          <rect
            ref={overlayRectRef}
            width="1440"
            height="900"
            fill="#06180e"
            mask="url(#heroMask)"
          />

          {/* Outline Group for crisp letter borders */}
          <g ref={outlineGroupRef} transform="translate(720, 450) scale(0.75)">
            <text
              x="0"
              y="-15"
              textAnchor="middle"
              fill="none"
              stroke="rgba(245, 158, 11, 0.8)"
              strokeWidth="2"
              fontSize="74"
              fontWeight="900"
              letterSpacing="-1"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              BHUMI SAHYOG
            </text>
            <text
              x="0"
              y="52"
              textAnchor="middle"
              fill="none"
              stroke="rgba(52, 211, 153, 0.75)"
              strokeWidth="1.5"
              fontSize="36"
              fontWeight="700"
              letterSpacing="1"
            >
              भूमि सहयोग
            </text>
          </g>
        </svg>

        {/* Scroll Zoom Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 text-xs text-white/70 animate-bounce pointer-events-none">
          <span className="font-semibold tracking-wide uppercase text-[10px] bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
            {t('scrollDown')} ↓
          </span>
          <ChevronDown size={16} className="text-accent-400" />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: LIVE INTELLIGENCE PLATFORM (REVEALED AFTER SCROLL ZOOM)         */}
      {/* ========================================================================= */}
      <section className="relative py-16 lg:py-24 px-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-t border-white/10">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Vision & Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles size={14} className="text-accent-400" />
              <span>{t('heroBadge')}</span>
            </div>

            <h2
              className="text-4xl sm:text-6xl font-black text-white leading-[1.08] tracking-tight"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {t('heroTitle1')}<br />
              <span className="bg-gradient-to-r from-accent-400 via-emerald-300 to-accent-300 bg-clip-text text-transparent">
                {t('heroTitle2')}
              </span>
            </h2>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {t('heroSubtitle')}
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap gap-3 justify-center lg:justify-start">
              <MagneticCTA>
                <Link
                  to="/login"
                  className="bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-black px-6 py-3.5 rounded-xl text-sm flex items-center gap-2 shadow-xl shadow-emerald-500/25 transition-all cursor-pointer"
                >
                  <Phone size={16} />
                  <span>{t('startWithPhone')}</span>
                  <ArrowRight size={16} />
                </Link>
              </MagneticCTA>

              <Link
                to="/login"
                className="bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-5 py-3.5 rounded-xl text-sm transition-all flex items-center gap-2"
              >
                <span>{t('mandiOfficerLogin')}</span>
              </Link>
            </div>

            {/* Badges */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle size={15} className="text-emerald-400" />
                <span>100% Free for Farmers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-accent-400" />
                <span>e-NAM Compatible</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MessageCircle size={15} className="text-emerald-400" />
                <span>Instant WhatsApp Alerts</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Quick Token Check Widget */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl p-6 bg-gradient-to-b from-white/10 to-white/5 border border-white/15 shadow-2xl backdrop-blur-xl">
              <div className="absolute -top-3 right-6 bg-accent-400 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                ⚡ Instant Live Check
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  🌾
                </div>
                <div>
                  <h3 className="font-bold text-white text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {t('quickCheckTitle')}
                  </h3>
                  <p className="text-xs text-slate-400">{t('quickCheckDesc')}</p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleQuickCheck} className="space-y-3 mb-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {t('mobileNumberLabel')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={quickPhone}
                      onChange={(e) => setQuickPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="7727038430"
                      maxLength={10}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-900/80 border border-white/20 rounded-xl text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <Search size={14} />
                  <span>{t('checkStatusBtn')}</span>
                </button>
              </form>

              {/* Result Preview Box */}
              {quickCheckResult ? (
                <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/30 rounded-2xl text-xs space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                    <div>
                      <span className="font-bold text-emerald-300">{quickCheckResult.farmerName}</span>
                      <p className="text-[10px] text-slate-400">{quickCheckResult.mandi}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-accent-400 text-slate-950">
                      टोकन {quickCheckResult.token}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center py-1">
                    <div className="bg-slate-900/60 p-1.5 rounded-lg">
                      <p className="text-[9px] text-slate-400">{t('currentTokenLabel')}</p>
                      <p className="font-bold text-white">{quickCheckResult.currentToken}</p>
                    </div>
                    <div className="bg-slate-900/60 p-1.5 rounded-lg">
                      <p className="text-[9px] text-slate-400">{t('farmersAheadLabel')}</p>
                      <p className="font-bold text-emerald-400">{quickCheckResult.farmersAhead}</p>
                    </div>
                    <div className="bg-slate-900/60 p-1.5 rounded-lg">
                      <p className="text-[9px] text-slate-400">{t('estWaitLabel')}</p>
                      <p className="font-bold text-accent-400">{quickCheckResult.waitTime}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-emerald-200">
                      🚗 {t('departAtLabel')}: <strong>{quickCheckResult.departureTime}</strong>
                    </span>
                    <Link
                      to="/login"
                      className="text-[11px] text-accent-300 hover:text-accent-200 font-bold underline"
                    >
                      {t('openDashboard')} →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-xs text-slate-400 text-center">
                  👆 {t('quickCheckDesc')}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: IMPACT METRICS                                                 */}
      {/* ========================================================================= */}
      <section ref={statsSectionRef} className="py-16 bg-slate-950 border-t border-white/10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <span className="px-3 py-1 bg-primary-900/60 border border-primary-500/30 rounded-full text-accent-400 text-xs font-semibold uppercase tracking-widest">
              {t('impactMetrics')}
            </span>
            <h3
              className="text-2xl sm:text-4xl font-black text-white mt-2"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {t('metricsHeading')}
            </h3>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
              <div className="text-3xl sm:text-5xl font-black text-emerald-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <span className="stat-counter" data-target="64">0</span>%
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 font-medium">{t('waitTimeRed')}</p>
              <p className="text-[11px] text-slate-500 mt-1">From 4.5 hrs avg to &lt;90 mins</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
              <div className="text-3xl sm:text-5xl font-black text-accent-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <span className="stat-counter" data-target="38000">0</span>+
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 font-medium">{t('tokensProc')}</p>
              <p className="text-[11px] text-slate-500 mt-1">Across Jaipur Region Mandis</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
              <div className="text-3xl sm:text-5xl font-black text-emerald-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
                ₹<span className="stat-counter" data-target="142">0</span> Cr
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 font-medium">{t('mspTracked')}</p>
              <p className="text-[11px] text-slate-500 mt-1">Direct to Farmer Bank Accounts</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
              <div className="text-3xl sm:text-5xl font-black text-accent-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <span className="stat-counter" data-target="12">0</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 font-medium">{t('mlParams')}</p>
              <p className="text-[11px] text-slate-500 mt-1">Weather, weighbridges, moisture</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-slate-950 border-t border-white/5 px-4 text-center text-xs text-slate-500">
        <p>Bhumi Sahyog — Predict. Inform. Reduce Waiting. · Hackathon MVP Demo</p>
      </footer>
    </div>
  );
}
