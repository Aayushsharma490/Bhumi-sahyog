import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, CreditCard, Bell, Settings, 
  BarChart2, ChevronRight, Wheat, LogOut, X, History
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import { logOut } from '../firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Sidebar({ isOpen, onClose, role }) {
  const { pathname } = useLocation();
  const { profile } = useAuth();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  // Farmer sidebar links
  const farmerLinks = [
    { to: '/farmer', label: t('dashboard'), icon: LayoutDashboard },
    { to: '/payment', label: t('payments'), icon: CreditCard },
    { to: '/history', label: t('history'), icon: History },
    { to: '/notifications', label: t('notifications'), icon: Bell },
  ];

  // Admin sidebar links
  const adminLinks = [
    { to: '/admin', label: lang === 'hi' ? 'कतार नियंत्रण' : 'Queue Control', icon: LayoutDashboard },
    { to: '/admin/farmers', label: lang === 'hi' ? 'किसान सूची' : 'Farmers', icon: Users },
    { to: '/admin/analytics', label: lang === 'hi' ? 'एनालिटिक्स' : 'Analytics', icon: BarChart2 },
    { to: '/admin/notifications', label: t('notifications'), icon: Bell },
  ];

  const links = role === 'admin' ? adminLinks : farmerLinks;

  const handleLogout = async () => {
    await logOut();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-100 z-50 
        flex flex-col shadow-lg transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:shadow-none
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="Bhumi Sahyog" className="w-9 h-9 object-contain rounded-xl" />
              <div>
                <div className="font-bold text-primary-900 text-sm leading-tight" style={{fontFamily:'Outfit,sans-serif'}}>
                  Bhumi Sahyog
                </div>
                <div className="text-xs text-slate-400">{t('brandSub')}</div>
              </div>
            </Link>
            <button onClick={onClose} className="md:hidden p-1 text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-3 p-2 bg-primary-50 rounded-xl">
            <div className="w-9 h-9 bg-primary-800 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {(profile?.displayName || 'U')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-slate-800 truncate">
                {profile?.displayName || (lang === 'hi' ? 'रमेश कुमार' : 'Ramesh Kumar')}
              </p>
              <p className="text-xs text-slate-500 capitalize">{profile?.role || role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className={`sidebar-link ${pathname === to ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span className="flex-1 text-sm">{label}</span>
              {pathname === to && <ChevronRight size={14} className="text-primary-600" />}
            </Link>
          ))}
        </nav>

        {/* Role badge */}
        <div className="px-4 py-2">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
            role === 'admin' ? 'bg-accent-100 text-accent-800' : 'bg-primary-100 text-primary-800'
          }`}>
            <div className="live-dot w-2 h-2 flex-shrink-0"></div>
            {role === 'admin' ? (lang === 'hi' ? 'अधिकारी — जयपुर मंडी' : 'Admin — Jaipur Mandi') : t('farmerPortal')}
          </div>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors duration-150 text-sm font-medium cursor-pointer"
          >
            <LogOut size={16} />
            {t('signOut')}
          </button>
        </div>
      </aside>
    </>
  );
}
