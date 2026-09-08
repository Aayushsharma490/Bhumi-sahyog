import { Navigation, Clock, Home, MapPin, Info } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  estimateWaitTime, calculateFarmersAhead,
  calculateRecommendedArrival, formatWaitTime, formatTime
} from '../services/predictionService';
import { useLanguage } from '../context/LanguageContext';

export default function RecommendedArrival({ procurement, queue }) {
  const { lang, t } = useLanguage();
  const [travelTime, setTravelTime] = useState(25);
  const [editing, setEditing] = useState(false);

  const farmerToken = procurement?.tokenNumber || 247;
  const currentToken = queue?.currentToken || 213;
  const avgProcessing = queue?.averageProcessingMinutes || 1.5;

  const farmersAhead = useMemo(
    () => calculateFarmersAhead(farmerToken, currentToken),
    [farmerToken, currentToken]
  );

  const estimatedWait = useMemo(
    () => estimateWaitTime(farmersAhead, avgProcessing),
    [farmersAhead, avgProcessing]
  );

  const { arrivalTime, departureTime, explanation } = useMemo(
    () => calculateRecommendedArrival(estimatedWait, travelTime, new Date(), lang),
    [estimatedWait, travelTime, lang]
  );

  const minutesToDepart = Math.max(0, estimatedWait - travelTime);

  return (
    <div className="bs-card border-2 border-primary-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Navigation size={16} className="text-primary-700" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm" style={{fontFamily:'Outfit,sans-serif'}}>
            {t('recommendedArrival')}
          </h3>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="text-xs text-primary-600 hover:text-primary-800 cursor-pointer font-medium"
        >
          {t('setTravelTime')}
        </button>
      </div>

      {/* Travel time editor */}
      {editing && (
        <div className="mb-4 p-3 bg-primary-50 rounded-xl">
          <label className="text-xs text-slate-600 mb-2 block font-medium">
            {lang === 'hi' ? 'मंडी तक यात्रा समय (मिनट)' : 'Your travel time to mandi (minutes)'}
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={travelTime}
              onChange={e => setTravelTime(Number(e.target.value))}
              className="flex-1 accent-primary-700"
            />
            <span className="text-sm font-bold text-primary-800 w-16 text-right">
              {travelTime} min
            </span>
          </div>
          <button
            onClick={() => setEditing(false)}
            className="mt-2 text-xs text-primary-600 hover:text-primary-800 cursor-pointer"
          >
            {lang === 'hi' ? 'सहेजें ✓' : 'Save ✓'}
          </button>
        </div>
      )}

      {/* Main recommendation */}
      <div className="bg-hero-gradient rounded-2xl p-5 text-white mb-4">
        <p className="text-green-300 text-xs font-medium mb-1">
          🕐 {t('reachMandiBy')}
        </p>
        <div className="text-4xl font-black mb-2" style={{fontFamily:'Outfit,sans-serif'}}>
          {formatTime(arrivalTime)}
        </div>
        <p className="text-green-200 text-xs">{explanation}</p>
      </div>

      {/* Breakdown */}
      <div className="space-y-3">
        <TimeRow
          icon={<Clock size={14} className="text-amber-500" />}
          label={t('leaveHomeAt')}
          value={formatTime(departureTime)}
          sub={`${minutesToDepart > 0 ? (lang === 'hi' ? `${minutesToDepart} मिनट में` : `in ${minutesToDepart} min`) : (lang === 'hi' ? 'अभी!' : 'Now!')}`}
        />
        <TimeRow
          icon={<MapPin size={14} className="text-blue-500" />}
          label={t('travelTime')}
          value={`~${travelTime} min`}
          sub={lang === 'hi' ? 'बदलाव योग्य' : 'Configurable'}
        />
        <TimeRow
          icon={<Clock size={14} className="text-slate-400" />}
          label={t('queueWait')}
          value={formatWaitTime(estimatedWait)}
          sub={`${farmersAhead} ${lang === 'hi' ? 'किसान आगे' : 'farmers ahead'}`}
        />
      </div>

      {/* Info note */}
      <div className="flex items-start gap-2 mt-4 p-3 bg-slate-50 rounded-xl">
        <Info size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-slate-500">
          {t('recommendedDesc')}
        </p>
      </div>
    </div>
  );
}

function TimeRow({ icon, label, value, sub }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0">{icon}</div>
      <span className="text-xs text-slate-500 flex-1">{label}</span>
      <div className="text-right">
        <span className="text-sm font-bold text-slate-800">{value}</span>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  );
}
