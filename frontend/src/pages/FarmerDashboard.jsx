import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useQueue } from '../hooks/useQueue';
import { useProcurement } from '../hooks/useProcurement';
import { useNotifications } from '../hooks/useNotifications';
import { useLanguage } from '../context/LanguageContext';
import FarmerLayout from '../layouts/FarmerLayout';
import QueueCard from '../components/QueueCard';
import ProcurementCard from '../components/ProcurementCard';
import PaymentCard from '../components/PaymentCard';
import RecommendedArrival from '../components/RecommendedArrival';
import NotificationPanel from '../components/NotificationPanel';
import AIAssistant from '../components/AIAssistant';
import CrossCentreOptimizer from '../components/CrossCentreOptimizer';
import AIQueueSimulator from '../components/AIQueueSimulator';
import BookTokenModal from '../components/BookTokenModal';
import { Wheat, MapPin, Sparkles, SlidersHorizontal, ChevronDown, ChevronUp, PlusCircle } from 'lucide-react';
import { calculateFarmersAhead, formatWaitTime, calculateRecommendedArrival, formatTime } from '../services/predictionService';

const DEMO_FALLBACK_PROCUREMENT = {
  id: 'proc-001',
  farmerId: 'farmer-001',
  farmerName: 'Ramesh Kumar',
  mandiId: 'JP001',
  mandiName: 'Jaipur Procurement Centre',
  crop: 'Wheat',
  variety: 'GW-322',
  quantity: 12,
  unit: 'quintal',
  tokenNumber: 247,
  procurementDate: '2026-09-08',
  slot: '10:00 AM - 12:00 PM',
  status: 'IN_QUEUE',
  amount: 26400,
  msp: 2200,
  paymentStatus: 'PROCESSING',
  paymentReference: 'PROC-2026-00472',
  isDemo: true,
};

const DEMO_FALLBACK_QUEUE = {
  mandiId: 'JP001',
  mandiName: 'Jaipur Procurement Centre',
  currentToken: 213,
  status: 'ACTIVE',
  averageProcessingMinutes: 1.5,
  waitingCount: 47,
  completedToday: 324,
  todayTotal: 380,
  isDemo: true,
};

export default function FarmerDashboard() {
  const { profile } = useAuth();
  const { lang, t } = useLanguage();
  const farmerId = profile?.farmerId || 'farmer-001';
  const mandiId = 'JP001';

  // Fast optimistic data — no blocking spinners!
  const { queue: liveQueue, justUpdated } = useQueue(mandiId);
  const { procurement: liveProcurement } = useProcurement(farmerId);
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications(farmerId);

  const queue = liveQueue || DEMO_FALLBACK_QUEUE;
  const [customProc, setCustomProc] = useState(null);
  
  const mergedDefaultProc = {
    ...DEMO_FALLBACK_PROCUREMENT,
    farmerName: profile?.displayName || 'Ramesh Kumar',
    crop: profile?.crop || 'Wheat',
    farmerId: profile?.farmerId || 'farmer-001',
  };
  const procurement = customProc || (liveProcurement && liveProcurement.farmerName ? liveProcurement : mergedDefaultProc);

  const [showSimulator, setShowSimulator] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  // Calculate live numbers for WhatsApp alerts
  const farmersAhead = calculateFarmersAhead(procurement?.tokenNumber || 247, queue?.currentToken || 213);
  const waitMinutes = Math.ceil(farmersAhead * (queue?.averageProcessingMinutes || 1.5));
  const waitTimeStr = formatWaitTime(waitMinutes);
  const { departureTime } = calculateRecommendedArrival(waitMinutes, 25, new Date(), lang);
  const departureStr = formatTime(departureTime);

  return (
    <FarmerLayout>
      {/* Page header with WhatsApp Quick Action & Book Slot CTA */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="section-heading mb-0">
              {lang === 'hi' ? 'नमस्ते' : 'Welcome'}, {profile?.displayName?.split(' ')[0] || 'Ramesh'} {lang === 'hi' ? 'जी' : ''} 👋
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm">
              {lang === 'hi' ? 'लाइव टोकन' : 'Live Token'} T-{procurement.tokenNumber}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <MapPin size={14} />
            <span>{procurement?.mandiName || 'Jaipur Procurement Centre'}</span>
            <span>·</span>
            <Wheat size={14} />
            <span>{procurement?.crop || 'Wheat'} ({procurement?.quantity || 12} Quintal)</span>
            <span>·</span>
            <span className="text-emerald-700 font-semibold">{profile?.phone || '7727038430'}</span>
          </div>
        </div>

        {/* Action Button: Book Slot */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsBookModalOpen(true)}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <PlusCircle size={16} className="text-accent-400" />
            <span>{lang === 'hi' ? '+ नया टोकन बुक करें' : '+ Book New Token Slot'}</span>
          </button>
        </div>
      </div>

      {/* Book Token Modal */}
      <BookTokenModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        currentActiveToken={queue.currentToken}
        onTokenCreated={(newProc) => {
          setCustomProc(newProc);
        }}
      />

      {/* Dashboard grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {/* Row 1: Queue (most important - full width on mobile) */}
        <div className="lg:col-span-2 xl:col-span-2">
          <QueueCard
            procurement={procurement}
            queue={queue}
            justUpdated={justUpdated}
          />
        </div>

        {/* Row 1 col 3: Recommended Arrival */}
        <div className="xl:col-span-1">
          <RecommendedArrival
            procurement={procurement}
            queue={queue}
          />
        </div>

        {/* Row 2: My Procurement */}
        <div className="xl:col-span-1">
          <ProcurementCard procurement={procurement} />
        </div>

        {/* Row 2: Payment Status */}
        <div className="xl:col-span-1">
          <PaymentCard procurement={procurement} />
        </div>

        {/* Row 2: Notifications */}
        <div className="xl:col-span-1">
          <NotificationPanel
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkRead={markAsRead}
            onMarkAllRead={markAllRead}
            compact={true}
          />
        </div>
      </div>

      {/* Cross-Centre AI Optimization (New Key Feature) */}
      <div className="mb-6">
        <CrossCentreOptimizer
          userCrop={procurement?.crop || 'Wheat'}
          userQty={procurement?.quantity || 12}
        />
      </div>

      {/* Toggleable AI Simulator & What-If Analyzer */}
      <div className="mb-6">
        <button
          onClick={() => setShowSimulator(!showSimulator)}
          className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-700 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-primary-700" />
            <span>AI Predictive Wait-Time Simulator & Factor Breakdown</span>
            <span className="px-2 py-0.5 bg-primary-100 text-primary-800 rounded-full text-[10px]">
              Weather · Weighbridges · Crop Moisture
            </span>
          </div>
          {showSimulator ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showSimulator && (
          <div className="mt-3 animate-in fade-in slide-in-from-top-2">
            <AIQueueSimulator
              defaultFarmersAhead={farmersAhead}
              defaultCrop={procurement?.crop || 'Wheat'}
            />
          </div>
        )}
      </div>

      {/* Quick stats footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox
          label="Today's Completed"
          value={queue?.completedToday || 324}
          sub="procurements"
          color="green"
        />
        <StatBox
          label="Waiting Farmers"
          value={queue?.waitingCount || 47}
          sub="in queue"
          color="amber"
        />
        <StatBox
          label="Avg Processing"
          value={`${queue?.averageProcessingMinutes || 1.5} min`}
          sub="per farmer"
          color="blue"
        />
        <StatBox
          label="Mandi Status"
          value={queue?.status === 'ACTIVE' ? 'Open' : 'Paused'}
          sub={queue?.status === 'ACTIVE' ? 'Accepting farmers' : 'Temporarily paused'}
          color={queue?.status === 'ACTIVE' ? 'green' : 'red'}
        />
      </div>

      {/* AI Assistant (floating) */}
      <AIAssistant procurement={procurement} queue={queue} />
    </FarmerLayout>
  );
}

function StatBox({ label, value, sub, color }) {
  const colors = {
    green: 'bg-green-50 text-green-800',
    amber: 'bg-amber-50 text-amber-800',
    blue: 'bg-blue-50 text-blue-800',
    red: 'bg-red-50 text-red-800',
  };
  return (
    <div className={`rounded-xl p-3 ${colors[color]}`}>
      <p className="text-xs font-medium opacity-70 mb-0.5">{label}</p>
      <p className="text-xl font-bold" style={{ fontFamily: 'Outfit,sans-serif' }}>{value}</p>
      <p className="text-xs opacity-60">{sub}</p>
    </div>
  );
}
