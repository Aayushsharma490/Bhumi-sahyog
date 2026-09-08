import { useState } from 'react';
import { predictWaitingTimeML, CROP_PROFILES, WEATHER_CONDITIONS, DAY_FACTORS } from '../services/mlWaitingModel';
import { Brain, Sliders, CloudRain, Cpu, BarChart3, Clock, Sparkles } from 'lucide-react';

export default function AIQueueSimulator({ defaultFarmersAhead = 34, defaultCrop = 'Wheat' }) {
  const [farmersAhead, setFarmersAhead] = useState(defaultFarmersAhead);
  const [crop, setCrop] = useState(defaultCrop);
  const [quantity, setQuantity] = useState(12);
  const [weighbridges, setWeighbridges] = useState(4);
  const [weather, setWeather] = useState('Sunny');
  const [dayOfWeek, setDayOfWeek] = useState(new Date().getDay() || 1);
  const [activeStaff, setActiveStaff] = useState(18);

  const prediction = predictWaitingTimeML({
    farmersAhead,
    crop,
    quantityQuintal: quantity,
    weighbridges,
    activeStaff,
    weather,
    dayOfWeek,
    hourOfDay: 11,
  });

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary-800 text-white flex items-center justify-center">
            <Brain size={20} className="text-accent-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>
                AI Wait-Time Engine & Queue Simulator
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-100 text-primary-800">
                12-Factor ML
              </span>
            </div>
            <p className="text-xs text-slate-500">Live predictive inference based on historical & sensor variables</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black text-primary-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
            ~{prediction.estimatedMinutes} <span className="text-sm font-semibold text-slate-600">min</span>
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold">
            {Math.round(prediction.confidenceScore * 100)}% Confidence
          </p>
        </div>
      </div>

      {/* Simulator Inputs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        {/* Farmers Ahead */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <label className="text-[11px] font-medium text-slate-500 block mb-1">Farmers Ahead</label>
          <input
            type="number"
            min="1"
            max="120"
            value={farmersAhead}
            onChange={(e) => setFarmersAhead(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full text-sm font-bold text-slate-800 bg-white border border-slate-200 rounded px-2 py-1"
          />
        </div>

        {/* Crop Selection */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <label className="text-[11px] font-medium text-slate-500 block mb-1">Crop Type</label>
          <select
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded px-2 py-1"
          >
            {Object.keys(CROP_PROFILES).map((c) => (
              <option key={c} value={c}>
                {CROP_PROFILES[c].icon} {c}
              </option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <label className="text-[11px] font-medium text-slate-500 block mb-1">Quantity (Quintal)</label>
          <input
            type="number"
            min="2"
            max="100"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full text-sm font-bold text-slate-800 bg-white border border-slate-200 rounded px-2 py-1"
          />
        </div>

        {/* Active Weighbridges */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <label className="text-[11px] font-medium text-slate-500 block mb-1">Weighbridges</label>
          <select
            value={weighbridges}
            onChange={(e) => setWeighbridges(parseInt(e.target.value))}
            className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded px-2 py-1"
          >
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <option key={num} value={num}>
                {num} Scales
              </option>
            ))}
          </select>
        </div>

        {/* Weather Conditions */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <label className="text-[11px] font-medium text-slate-500 block mb-1">Weather Factor</label>
          <select
            value={weather}
            onChange={(e) => setWeather(e.target.value)}
            className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded px-2 py-1"
          >
            {Object.keys(WEATHER_CONDITIONS).map((w) => (
              <option key={w} value={w}>
                {WEATHER_CONDITIONS[w].icon} {w}
              </option>
            ))}
          </select>
        </div>

        {/* Day of Week */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <label className="text-[11px] font-medium text-slate-500 block mb-1">Day of Week</label>
          <select
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
            className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded px-2 py-1"
          >
            {Object.keys(DAY_FACTORS).map((d) => (
              <option key={d} value={d}>
                {DAY_FACTORS[d].name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Model Parameter Output Badges */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
          Throughput: <strong>{prediction.serviceRatePerHour} vehicles/hr</strong>
        </span>
        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
          Weather Lag: <strong>+{prediction.breakdown.weatherImpactPercent}%</strong>
        </span>
        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
          Day Rush Surge: <strong>+{prediction.breakdown.daySurgePercent}%</strong>
        </span>
        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
          Moisture Delay: <strong>{prediction.breakdown.cropMoistureFactor}x</strong>
        </span>
      </div>
    </div>
  );
}
