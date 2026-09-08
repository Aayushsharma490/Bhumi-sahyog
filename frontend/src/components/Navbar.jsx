import { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../hooks/useAuth.jsx';
import { useLanguage } from '../context/LanguageContext';
import LanguageToggle from './LanguageToggle';
import WhatsAppScannerModal from './WhatsAppScannerModal';
import { Link } from 'react-router-dom';
import { Bell, Menu } from 'lucide-react';

export default function Navbar({ onMenuToggle, role }) {
  const [showScanner, setShowScanner] = useState(false);
  const { profile } = useAuth();
  const { lang, t } = useLanguage();
  const farmerId = profile?.farmerId;
  const { unreadCount } = useNotifications(farmerId);

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center px-4 md:px-6 gap-3 sticky top-0 z-30 shadow-sm">
      {/* Mobile hamburger */}
      <button 
        onClick={onMenuToggle}
        className="md:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Logo (mobile only) */}
      <Link to="/" className="md:hidden flex items-center gap-2">
        <img src="/logo.png" alt="Bhumi Sahyog" className="w-8 h-8 object-contain rounded-lg" />
        <span className="font-black text-primary-900 text-sm" style={{ fontFamily: 'Outfit,sans-serif' }}>
          Bhumi Sahyog
        </span>
      </Link>

      {/* Page status (desktop) */}
      <div className="hidden md:flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="live-dot"></div>
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
            {lang === 'hi' ? 'लाइव कतार प्रणाली सक्रिय' : 'Live Mandi Queue Active'}
          </span>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* WhatsApp Device Link Button */}
      <button
        onClick={() => setShowScanner(true)}
        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>📱 WhatsApp QR</span>
      </button>

      {/* Language Selector Toggle */}
      <LanguageToggle className="!bg-slate-100 !text-slate-700 !border-slate-200 hover:!bg-slate-200" />

      {/* Notifications bell */}
      <Link
        to={role === 'admin' ? '/admin/notifications' : '/notifications'}
        className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </Link>

      {/* User avatar */}
      <div className="w-9 h-9 bg-primary-800 rounded-full flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:bg-primary-900 transition-colors flex-shrink-0 shadow-sm">
        {(profile?.displayName || 'U')[0].toUpperCase()}
      </div>

      {/* WhatsApp Device Link & Scanner Modal */}
      <WhatsAppScannerModal isOpen={showScanner} onClose={() => setShowScanner(false)} />
    </header>
  );
}
