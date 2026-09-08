import { useState } from 'react';
import { getCrossCentreRecommendations } from '../services/mlWaitingModel';
import { MapPin, ArrowRight, Clock, ShieldCheck, Zap, Sparkles, Navigation, TrendingDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function CrossCentreOptimizer({ userCrop = 'Wheat', userQty = 12 }) {
  const { lang, t } = useLanguage();
  const [data, setData] = useState(() => getCrossCentreRecommendations('Bassi', userCrop, userQty));
  const { currentMandi, allCentres, bestAlternative, recommendationSummary } = data;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-accent-100 flex items-center justify-center text-accent-700">
            <Zap size={18} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {t('crossCentreOptimization')}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <Sparkles size={10} /> {t('smartRouting')}
              </span>
            </div>
            <p className="text-xs text-slate-500">{t('routingDesc')}</p>
          </div>
        </div>

        {bestAlternative && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 flex items-center gap-2">
            <TrendingDown size={16} className="text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700">
              {lang === 'hi'
                ? `${bestAlternative.name.split(' ')[0]} पर ~${bestAlternative.timeSavedMinutes} मिनट बचाएं`
                : `Save ~${bestAlternative.timeSavedMinutes} mins at ${bestAlternative.name.split(' ')[0]}`}
            </span>
          </div>
        )}
      </div>

      {/* Proactive Guidance Banner */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 mb-4 flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
          <Navigation size={14} />
        </div>
        <div>
          <p className="text-xs font-bold text-emerald-900 mb-0.5">{lang === 'hi' ? 'आपके लिए AI मार्गदर्शन:' : 'AI Recommendation for You:'}</p>
          <p className="text-xs text-emerald-800 leading-relaxed">{recommendationSummary}</p>
        </div>
      </div>

      {/* Centre Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {allCentres.map((centre) => {
          const isBest = bestAlternative && bestAlternative.id === centre.id;
          return (
            <div
              key={centre.id}
              className={`relative rounded-xl p-3.5 border transition-all ${
                centre.isCurrent
                  ? 'bg-slate-50 border-slate-300'
                  : isBest
                  ? 'bg-emerald-50/70 border-emerald-400 shadow-sm ring-1 ring-emerald-300'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              {isBest && (
                <div className="absolute -top-2.5 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  {t('recommendedAlternative')}
                </div>
              )}
              {centre.isCurrent && (
                <div className="absolute -top-2.5 right-3 bg-slate-600 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                  {t('currentMandi')}
                </div>
              )}

              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{centre.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin size={11} /> {centre.distanceKm} km {t('away')}
                    </span>
                    <span>·</span>
                    <span>{centre.weighbridges} {t('weighbridges')}</span>
                  </div>
                </div>
              </div>

              {/* Stats badges */}
              <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-100">
                <div className="text-center">
                  <p className="text-[10px] text-slate-400">{t('inQueue')}</p>
                  <p className="text-xs font-bold text-slate-700">{centre.waitingFarmers} {lang === 'hi' ? 'किसान' : 'farmers'}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-slate-400">{t('estWait')}</p>
                  <p className={`text-xs font-bold ${centre.predictedWaitMinutes <= 20 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    ~{centre.predictedWaitMinutes} min
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-slate-400">{t('totalRoute')}</p>
                  <p className="text-xs font-bold text-slate-700">~{centre.totalRouteMinutes} min</p>
                </div>
              </div>

              {isBest && (
                <div className="mt-2.5 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs text-emerald-800">
                  <span className="font-semibold text-[11px]">{t('lessCrowd')}</span>
                  <button className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5 cursor-pointer underline">
                    {t('bookSlotHere')} <ArrowRight size={11} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
