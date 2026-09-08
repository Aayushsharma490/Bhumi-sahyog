import { CreditCard, CheckCircle, Clock, AlertCircle, ArrowRight, Hash } from 'lucide-react';
import { formatAmount, getPaymentStatusConfig } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';
import StatusBadge from './StatusBadge';

export default function PaymentCard({ procurement }) {
  const { lang, t } = useLanguage();

  if (!procurement) {
    return (
      <div className="bs-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <CreditCard size={16} className="text-blue-700" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm" style={{fontFamily:'Outfit,sans-serif'}}>
            {t('paymentStatus')}
          </h3>
        </div>
        <div className="text-center py-6 text-slate-400">
          <CreditCard size={28} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">{lang === 'hi' ? 'कोई भुगतान डेटा उपलब्ध नहीं है' : 'No payment data available'}</p>
        </div>
      </div>
    );
  }

  const payConfig = getPaymentStatusConfig(procurement.paymentStatus);

  const timelineSteps = [
    { id: 'PROCUREMENT_DONE', label: t('procurementCompleted'), done: true },
    { 
      id: 'PAYMENT_INITIATED', 
      label: t('paymentInitiated'), 
      done: ['PROCESSING', 'PAID'].includes(procurement.paymentStatus) 
    },
    { 
      id: 'PAYMENT_PROCESSING', 
      label: t('paymentProcessing'), 
      done: ['PROCESSING', 'PAID'].includes(procurement.paymentStatus) 
    },
    { 
      id: 'PAYMENT_COMPLETED', 
      label: t('paymentCompleted'), 
      done: procurement.paymentStatus === 'PAID' 
    },
  ];

  return (
    <div className="bs-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <CreditCard size={16} className="text-blue-700" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm" style={{fontFamily:'Outfit,sans-serif'}}>
            {t('paymentStatus')}
          </h3>
        </div>
        <StatusBadge type="payment" status={procurement.paymentStatus} />
      </div>

      {/* Amount */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 mb-4 text-white">
        <p className="text-blue-200 text-xs mb-1">{t('procurementAmount')}</p>
        <div className="text-3xl font-black" style={{fontFamily:'Outfit,sans-serif'}}>
          {formatAmount(procurement.amount)}
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-blue-200 text-xs">
            {procurement.crop} · {procurement.quantity} {procurement.unit}
          </p>
          <div className="flex items-center gap-1">
            <span style={{color: payConfig.color}} className="font-bold text-xs bg-white/10 px-2 py-0.5 rounded-full">
              {payConfig.label}
            </span>
          </div>
        </div>
      </div>

      {/* Reference */}
      <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl mb-4">
        <Hash size={14} className="text-slate-400 flex-shrink-0" />
        <div>
          <p className="text-xs text-slate-500">{t('referenceNumber')}</p>
          <p className="text-sm font-mono font-semibold text-slate-800">
            {procurement.paymentReference || 'PROC-2026-00472'}
          </p>
        </div>
      </div>

      {/* Mini timeline */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          {t('paymentProgress')}
        </p>
        {timelineSteps.map((step) => (
          <div key={step.id} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
              step.done ? 'bg-green-100' : 'bg-slate-100'
            }`}>
              {step.done ? (
                <CheckCircle size={12} className="text-green-600" />
              ) : (
                <Clock size={10} className="text-slate-400" />
              )}
            </div>
            <span className={`text-xs ${step.done ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Demo note */}
      {procurement.isDemo && (
        <p className="text-xs text-slate-400 text-center mt-4 border-t border-slate-100 pt-3">
          {t('prototypeDemoData')}
        </p>
      )}
    </div>
  );
}
