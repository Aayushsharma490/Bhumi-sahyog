// LanguageToggle.jsx — English / Hindi Switcher
import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageToggle({ className = '' }) {
  const { lang, toggleLanguage } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs font-bold text-white transition-all cursor-pointer shadow-sm ${className}`}
      title="Toggle Language / भाषा बदलें"
    >
      <Globe size={14} className="text-accent-400" />
      <span className={lang === 'en' ? 'text-accent-300 font-black' : 'text-slate-300'}>EN</span>
      <span className="text-white/40">/</span>
      <span className={lang === 'hi' ? 'text-accent-300 font-black' : 'text-slate-300'}>हिन्दी</span>
    </button>
  );
}
