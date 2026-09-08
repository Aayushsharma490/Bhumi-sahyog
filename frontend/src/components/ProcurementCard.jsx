import { Calendar, MapPin, Hash, Wheat, Package, Clock } from 'lucide-react';
import { formatToken, formatQuantity, formatDate, getProcurementStatusConfig } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';
import StatusBadge from './StatusBadge';

export default function ProcurementCard({ procurement }) {
  const { lang, t } = useLanguage();

  if (!procurement) {
    return (
      <div className="bs-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
            <Wheat size={16} className="text-primary-700" />
          </div>
          <h3 className="font-bold text-slate-800" style={{fontFamily:'Outfit,sans-serif'}}>
            {t('myProcurement')}
          </h3>
        </div>
        <div className="text-center py-8 text-slate-400">
          <Package size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">{lang === 'hi' ? 'कोई सक्रिय खरीद नहीं मिली' : 'No active procurement found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bs-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Wheat size={16} className="text-primary-700" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm" style={{fontFamily:'Outfit,sans-serif'}}>
            {t('myProcurement')}
          </h3>
        </div>
        <StatusBadge type="procurement" status={procurement.status} />
      </div>

      {/* Token highlight */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-700 rounded-xl p-4 mb-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-200 text-xs mb-1">{t('yourTokenNo')}</p>
            <div className="text-4xl font-black" style={{fontFamily:'Outfit,sans-serif'}}>
              T-{procurement.tokenNumber}
            </div>
            <p className="text-primary-200 text-xs mt-1">{procurement.slot}</p>
          </div>
          <div className="text-right">
            <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
              <Hash size={24} className="text-accent-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="space-y-3">
        <DetailRow
          icon={<MapPin size={14} className="text-slate-400" />}
          label={t('mandi')}
          value={procurement.mandiName}
        />
        <DetailRow
          icon={<Wheat size={14} className="text-slate-400" />}
          label={t('crop')}
          value={`${procurement.crop} ${procurement.variety ? `(${procurement.variety})` : ''}`}
        />
        <DetailRow
          icon={<Package size={14} className="text-slate-400" />}
          label={t('quantity')}
          value={formatQuantity(procurement.quantity, procurement.unit)}
        />
        <DetailRow
          icon={<Calendar size={14} className="text-slate-400" />}
          label={t('date')}
          value={formatDate(procurement.procurementDate)}
        />
        <DetailRow
          icon={<Clock size={14} className="text-slate-400" />}
          label={t('slot')}
          value={procurement.slot}
        />
      </div>

      {/* Demo watermark */}
      {procurement.isDemo && (
        <p className="text-xs text-slate-400 text-center mt-4 border-t border-slate-100 pt-3">
          {t('prototypeDemoData')}
        </p>
      )}
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0">{icon}</div>
      <span className="text-xs text-slate-500 w-20 flex-shrink-0">{label}</span>
      <span className="text-sm text-slate-800 font-medium truncate">{value}</span>
    </div>
  );
}
