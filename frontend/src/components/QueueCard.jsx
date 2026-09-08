import { useMemo } from 'react';
import { Clock, Users, Zap, Navigation, TrendingUp, AlertCircle } from 'lucide-react';
import { 
  estimateWaitTime, calculateFarmersAhead, 
  calculateRecommendedArrival, formatWaitTime, formatTime, getUrgencyLevel 
} from '../services/predictionService';
import { formatToken } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

export default function QueueCard({ procurement, queue, justUpdated }) {
  const { lang, t } = useLanguage();
  const farmerToken = procurement?.tokenNumber || 247;
  const currentToken = queue?.currentToken || 213;
  const avgProcessing = queue?.averageProcessingMinutes || 1.5;
  const queueStatus = queue?.status || 'ACTIVE';

  const farmersAhead = useMemo(
    () => calculateFarmersAhead(farmerToken, currentToken),
    [farmerToken, currentToken]
  );

  const estimatedWait = useMemo(
    () => estimateWaitTime(farmersAhead, avgProcessing),
    [farmersAhead, avgProcessing]
  );

  const { arrivalTime, explanation } = useMemo(
    () => calculateRecommendedArrival(estimatedWait, 25, new Date(), lang),
    [estimatedWait, lang]
  );

  const urgency = getUrgencyLevel(farmersAhead);
  
  const URGENCY_LABELS = {
    critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'badge-red', icon: '🚨', label: lang === 'hi' ? 'तुरंत निकलें!' : 'Go now!' },
    urgent:   { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'badge-yellow', icon: '⚡', label: lang === 'hi' ? 'जल्द निकलें' : 'Leave soon' },
    moderate: { bg: 'bg-blue-50', border: 'blue-200', text: 'text-blue-700', badge: 'badge-blue', icon: '🕐', label: lang === 'hi' ? 'तैयारी करें' : 'Plan ahead' },
    comfortable: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'badge-green', icon: '✓', label: lang === 'hi' ? 'पर्याप्त समय है' : 'Comfortable' },
  };
  const style = URGENCY_LABELS[urgency];

  // Progress: how far along the farmer is (0-100%)
  const progress = Math.min(100, Math.round((currentToken / farmerToken) * 100));

  return (
    <div className={`bs-card border-2 transition-all duration-500 ${
      justUpdated ? 'realtime-flash border-accent-300' : `${style.border}`
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="live-dot"></div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {t('liveQueueActive')}
            </span>
          </div>
          {justUpdated && (
            <span className="badge-yellow text-xs animate-fade-in">{lang === 'hi' ? 'अपडेट हुआ!' : 'Updated!'}</span>
          )}
        </div>
        <span className={`${style.badge} text-xs font-bold`}>
          {style.icon} {style.label}
        </span>
      </div>

      {/* Token display */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="text-center p-3 bg-slate-50 rounded-xl">
          <p className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">
            {t('currentTokenLabel')}
          </p>
          <div className="token-current">{formatToken(currentToken)}</div>
          <p className="text-xs text-slate-400 mt-1">{t('beingProcessed')}</p>
        </div>
        <div className="text-center p-3 bg-primary-50 rounded-xl border-2 border-primary-200">
          <p className="text-xs text-primary-600 mb-1 font-medium uppercase tracking-wide">
            {t('yourTokenNo')}
          </p>
          <div className="token-display text-3xl">{formatToken(farmerToken)}</div>
          <p className="text-xs text-primary-500 mt-1">{t('yourNumber')}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>{t('queueProgress')}</span>
          <span>{farmersAhead} {lang === 'hi' ? 'किसान आगे' : 'farmers ahead'}</span>
        </div>
        <div className="queue-progress-bar">
          <div 
            className="queue-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-800" style={{fontFamily:'Outfit,sans-serif'}}>
            {farmersAhead}
          </div>
          <p className="text-xs text-slate-500">{t('farmersAheadLabel')}</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-700" style={{fontFamily:'Outfit,sans-serif'}}>
            {formatWaitTime(estimatedWait)}
          </div>
          <p className="text-xs text-slate-500">{t('estWait')}</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-700" style={{fontFamily:'Outfit,sans-serif'}}>
            {avgProcessing}
          </div>
          <p className="text-xs text-slate-500">{lang === 'hi' ? 'मिनट/किसान' : 'min/farmer'}</p>
        </div>
      </div>

      {/* Queue paused warning */}
      {queueStatus === 'PAUSED' && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-3">
          <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-700 font-medium">
            Queue is temporarily paused. Please wait for updates.
          </p>
        </div>
      )}

      {/* Recommended arrival */}
      <div className={`flex items-start gap-3 p-3 ${style.bg} rounded-xl`}>
        <Navigation size={16} className={`${style.text} flex-shrink-0 mt-0.5`} />
        <div>
          <p className={`text-xs font-semibold ${style.text} mb-0.5`}>
            Reach mandi by: <strong>{formatTime(arrivalTime)}</strong>
          </p>
          <p className="text-xs text-slate-500">{explanation}</p>
        </div>
      </div>

      {/* Last updated */}
      {queue?.updatedAt && (
        <p className="text-xs text-slate-400 mt-3 text-right">
          Updated: just now
        </p>
      )}
    </div>
  );
}
