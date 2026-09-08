import { useState } from 'react';
import { useQueue, nextToken, pauseQueue, resumeQueue, updateProcessingRate } from '../hooks/useQueue';
import { useAllProcurements, updatePaymentStatus, updateProcurementStatus } from '../hooks/useProcurement';
import AdminLayout from '../layouts/AdminLayout';
import FarmerTable from '../components/FarmerTable';
import { 
  SkipForward, Pause, Play, UserPlus, Settings, 
  Users, CheckCircle, Clock, TrendingUp, AlertCircle,
  ChevronRight, Loader2, X, Plus
} from 'lucide-react';
import { formatToken, formatAmount } from '../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { doc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { COLLECTIONS } from '../firebase/firestore';
import WhatsAppScannerModal from '../components/WhatsAppScannerModal';

const MANDI_ID = 'JP001';

// Analytics demo data
const HOURLY_DATA = [
  { time: '8AM', completed: 42 }, { time: '9AM', completed: 67 },
  { time: '10AM', completed: 71 }, { time: '11AM', completed: 58 },
  { time: '12PM', completed: 44 }, { time: '1PM', completed: 22 },
  { time: '2PM', completed: 38 }, { time: '3PM', completed: 35 },
];

const PAYMENT_PIE = [
  { name: 'Paid', value: 210, color: '#22c55e' },
  { name: 'Processing', value: 67, color: '#f59e0b' },
  { name: 'Pending', value: 47, color: '#94a3b8' },
];

export default function AdminDashboard() {
  const { queue, loading: queueLoading, justUpdated } = useQueue(MANDI_ID);
  const { procurements, loading: procLoading } = useAllProcurements(MANDI_ID);
  
  const [actionLoading, setActionLoading] = useState(null);
  const [showRateModal, setShowRateModal] = useState(false);
  const [showAddFarmer, setShowAddFarmer] = useState(false);
  const [showWhatsAppScanner, setShowWhatsAppScanner] = useState(false);
  const [newRate, setNewRate] = useState(1.5);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleAction = async (action, label) => {
    setActionLoading(action);
    setError('');
    try {
      switch (action) {
        case 'next': await nextToken(MANDI_ID); showSuccess(`Token advanced to T-${(queue?.currentToken || 213) + 1}`); break;
        case 'pause': await pauseQueue(MANDI_ID); showSuccess('Queue paused'); break;
        case 'resume': await resumeQueue(MANDI_ID); showSuccess('Queue resumed'); break;
        case 'rate': 
          await updateProcessingRate(MANDI_ID, newRate); 
          setShowRateModal(false); 
          showSuccess(`Processing rate updated to ${newRate} min/farmer`); 
          break;
      }
    } catch (e) {
      setError(`Failed: ${e.message || 'Please try again'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const currentToken = queue?.currentToken || 213;
  const queueStatus = queue?.status || 'ACTIVE';
  const isActive = queueStatus === 'ACTIVE';

  if (queueLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-primary-700" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="section-heading">Queue Control</h1>
        <p className="section-subheading">Jaipur Procurement Centre · Live Admin Panel</p>
      </div>

      {/* Success/Error messages */}
      {successMsg && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium animate-slide-up">
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}
      {error && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm animate-slide-up">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* MAIN CONTROL PANEL */}
      <div className={`bs-card border-2 mb-6 transition-all duration-500 ${justUpdated ? 'realtime-flash border-accent-300' : 'border-primary-100'}`}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Current Token</p>
            <div className="flex items-baseline gap-3">
              <div className="text-6xl font-black text-primary-800" style={{fontFamily:'Outfit,sans-serif'}}>
                {formatToken(currentToken)}
              </div>
              <div>
                <p className="text-sm text-slate-500">Next: <strong>{formatToken(currentToken + 1)}</strong></p>
                <div className={`mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  isActive ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500 live-dot' : 'bg-amber-500'}`}></div>
                  {isActive ? 'Queue Active' : 'Queue Paused'}
                </div>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MiniStat label="Waiting" value={queue?.waitingCount || 47} icon={<Users size={14}/>} color="amber" />
            <MiniStat label="Completed" value={queue?.completedToday || 324} icon={<CheckCircle size={14}/>} color="green" />
            <MiniStat label="Avg Time" value={`${queue?.averageProcessingMinutes || 1.5}m`} icon={<Clock size={14}/>} color="blue" />
            <MiniStat label="Today Total" value={queue?.todayTotal || 380} icon={<TrendingUp size={14}/>} color="slate" />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleAction('next')}
            disabled={actionLoading === 'next' || !isActive}
            className="bs-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            id="btn-next-token"
          >
            {actionLoading === 'next' 
              ? <Loader2 size={16} className="animate-spin" /> 
              : <SkipForward size={16} />
            }
            Next Token
          </button>

          {isActive ? (
            <button
              onClick={() => handleAction('pause')}
              disabled={actionLoading === 'pause'}
              className="bs-btn-outline"
              id="btn-pause-queue"
            >
              {actionLoading === 'pause' 
                ? <Loader2 size={16} className="animate-spin" /> 
                : <Pause size={16} />
              }
              Pause Queue
            </button>
          ) : (
            <button
              onClick={() => handleAction('resume')}
              disabled={actionLoading === 'resume'}
              className="bs-btn-accent"
              id="btn-resume-queue"
            >
              {actionLoading === 'resume' 
                ? <Loader2 size={16} className="animate-spin" /> 
                : <Play size={16} />
              }
              Resume Queue
            </button>
          )}

          <button
            onClick={() => setShowAddFarmer(true)}
            className="bs-btn-ghost border border-slate-200"
            id="btn-add-farmer"
          >
            <UserPlus size={16} />
            Add Farmer
          </button>

          <button
            onClick={() => { setNewRate(queue?.averageProcessingMinutes || 1.5); setShowRateModal(true); }}
            className="bs-btn-ghost border border-slate-200"
            id="btn-update-rate"
          >
            <Settings size={16} />
            Update Processing Rate
          </button>

          <button
            onClick={() => setShowWhatsAppScanner(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            id="btn-admin-whatsapp-qr"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>📱 Link WhatsApp (Scan QR)</span>
          </button>
        </div>
      </div>

      {/* Analytics row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Hourly chart */}
        <div className="bs-card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm" style={{fontFamily:'Outfit,sans-serif'}}>
              Hourly Procurements (Today)
            </h3>
            <span className="badge-gray text-xs">Prototype Demo Data</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={HOURLY_DATA} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="time" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="completed" fill="#166534" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment status pie */}
        <div className="bs-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm" style={{fontFamily:'Outfit,sans-serif'}}>
              Payment Status
            </h3>
            <span className="badge-gray text-xs">Demo</span>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie data={PAYMENT_PIE} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={55}>
                {PAYMENT_PIE.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1.5 mt-3">
            {PAYMENT_PIE.map(item => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: item.color }}></div>
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Farmer table */}
      <div className="mb-4">
        <h2 className="section-heading text-lg mb-3">Today's Farmers</h2>
        <FarmerTable
          procurements={procurements}
          currentToken={currentToken}
          avgProcessing={queue?.averageProcessingMinutes || 1.5}
          onUpdateStatus={updateProcurementStatus}
          onUpdatePayment={updatePaymentStatus}
        />
      </div>

      {/* Rate Modal */}
      {showRateModal && (
        <Modal title="Update Processing Rate" onClose={() => setShowRateModal(false)}>
          <p className="text-sm text-slate-600 mb-4">
            Set the average time (in minutes) it takes to process one farmer.
          </p>
          <label className="text-sm text-slate-700 font-medium mb-2 block">
            Processing rate (minutes per farmer)
          </label>
          <input
            type="number"
            min="0.5"
            max="10"
            step="0.5"
            value={newRate}
            onChange={e => setNewRate(Number(e.target.value))}
            className="bs-input mb-4"
          />
          <div className="flex gap-3">
            <button
              onClick={() => handleAction('rate')}
              disabled={actionLoading === 'rate'}
              className="bs-btn-primary flex-1"
            >
              {actionLoading === 'rate' ? <Loader2 size={16} className="animate-spin" /> : null}
              Update Rate
            </button>
            <button onClick={() => setShowRateModal(false)} className="bs-btn-ghost border border-slate-200 flex-1">
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {/* Add Farmer Modal */}
      {showAddFarmer && (
        <AddFarmerModal
          onClose={() => setShowAddFarmer(false)}
          onSuccess={(msg) => { setShowAddFarmer(false); showSuccess(msg); }}
          currentToken={currentToken}
        />
      )}

      {/* WhatsApp Device Link & Scanner Modal */}
      <WhatsAppScannerModal 
        isOpen={showWhatsAppScanner} 
        onClose={() => setShowWhatsAppScanner(false)} 
      />
    </AdminLayout>
  );
}

function MiniStat({ label, value, icon, color }) {
  const colors = {
    green: 'text-green-700 bg-green-50',
    amber: 'text-amber-700 bg-amber-50',
    blue: 'text-blue-700 bg-blue-50',
    slate: 'text-slate-700 bg-slate-100',
  };
  return (
    <div className={`rounded-xl p-3 ${colors[color]}`}>
      <div className="flex items-center gap-1.5 mb-0.5 opacity-70">{icon}<span className="text-xs">{label}</span></div>
      <div className="text-xl font-bold" style={{fontFamily:'Outfit,sans-serif'}}>{value}</div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-800" style={{fontFamily:'Outfit,sans-serif'}}>{title}</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function AddFarmerModal({ onClose, onSuccess, currentToken }) {
  const [form, setForm] = useState({
    farmerName: '', crop: 'Wheat', quantity: '', phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const newToken = (currentToken || 213) + 50 + Math.floor(Math.random() * 10);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.farmerName || !form.quantity) { setErr('Please fill all fields'); return; }
    setLoading(true);
    setErr('');
    try {
      const id = `proc-${Date.now()}`;
      await setDoc(doc(db, COLLECTIONS.PROCUREMENTS, id), {
        farmerId: `farmer-${Date.now()}`,
        farmerName: form.farmerName,
        crop: form.crop,
        quantity: Number(form.quantity),
        unit: 'quintal',
        mandiId: 'JP001',
        mandiName: 'Jaipur Procurement Centre',
        tokenNumber: newToken,
        procurementDate: new Date().toISOString().split('T')[0],
        slot: '2:00 PM - 4:00 PM',
        status: 'WAITING',
        amount: Number(form.quantity) * 2200,
        msp: 2200,
        paymentStatus: 'PENDING',
        paymentReference: `PROC-2026-${String(Math.floor(Math.random() * 99999)).padStart(5,'0')}`,
        phone: form.phone,
        isDemo: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Dispatch real WhatsApp confirmation if phone number provided
      if (form.phone) {
        const cleanPhone = form.phone.replace(/\D/g, '').slice(-10);
        if (cleanPhone.length === 10) {
          const fullPhone = '91' + cleanPhone;
          const msg = 
            `🌾 *Bhumi Sahyog — Kisan Registration & Token Ticket*\n` +
            `----------------------------------------\n` +
            `Namaste ${form.farmerName} ji!\n\n` +
            `Aapka naya procurement token confirm ho gaya hai:\n` +
            `🎫 *Token No:* T-${newToken}\n` +
            `🌾 *Crop / Fasal:* ${form.crop} (${form.quantity} Quintal)\n` +
            `📍 *Mandi:* Jaipur Procurement Centre (Surajpole)\n` +
            `⏰ *Slot:* 2:00 PM - 4:00 PM\n` +
            `💰 *MSP Est. Payout:* ₹${(Number(form.quantity) * 2200).toLocaleString('en-IN')}\n\n` +
            `👉 Live Queue Track Karein:\n` +
            `https://bhumi-sahyog.netlify.app/farmer\n\n` +
            `_Bhumi Sahyog — Predict. Inform. Reduce Waiting._`;

          fetch('/api/notifications/whatsapp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: fullPhone,
              message: msg,
            }),
          }).catch(err => console.warn('Add farmer WhatsApp note:', err));
        }
      }

      onSuccess(`Farmer ${form.farmerName} added. Token: T-${newToken}${form.phone ? ' (WhatsApp alert sent!)' : ''}`);
    } catch (e) {
      setErr(e.message || 'Failed to add farmer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Add New Farmer" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">Farmer Name</label>
          <input className="bs-input" value={form.farmerName} onChange={e => setForm({...form, farmerName: e.target.value})} placeholder="e.g. Ravi Shankar" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">Crop</label>
          <select className="bs-input cursor-pointer" value={form.crop} onChange={e => setForm({...form, crop: e.target.value})}>
            {['Wheat', 'Rice', 'Mustard', 'Soybean', 'Barley', 'Maize'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">Quantity (quintal)</label>
          <input className="bs-input" type="number" min="1" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} placeholder="e.g. 10" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">Phone (optional)</label>
          <input className="bs-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 98765 43210" />
        </div>
        <div className="p-3 bg-primary-50 rounded-xl text-sm">
          <span className="text-primary-700 font-medium">Assigned Token: </span>
          <span className="font-bold text-primary-800">T-{newToken}</span>
        </div>
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="bs-btn-primary flex-1">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Add Farmer
          </button>
          <button type="button" onClick={onClose} className="bs-btn-ghost border border-slate-200 flex-1">Cancel</button>
        </div>
      </form>
    </Modal>
  );
}
