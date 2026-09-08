import { useProcurement } from '../hooks/useProcurement';
import { useAuth } from '../hooks/useAuth.jsx';
import { apiFetch } from '../config/api';
import FarmerLayout from '../layouts/FarmerLayout';
import { 
  CheckCircle, Clock, CreditCard, Hash, Wheat, 
  Calendar, MapPin, Package, ArrowRight, Loader2 
} from 'lucide-react';
import { formatAmount, formatToken, formatDate, getPaymentStatusConfig } from '../utils/formatters';
import StatusBadge from '../components/StatusBadge';

// Full payment timeline
const TIMELINE_STEPS = [
  { id: 'registered', label: 'Farmer Registered', icon: Package, alwaysDone: true },
  { id: 'slot_assigned', label: 'Slot Assigned', icon: Calendar, alwaysDone: true },
  { id: 'in_queue', label: 'Entered Queue', icon: Clock, doneStatuses: ['IN_QUEUE', 'PROCESSING', 'COMPLETED'] },
  { id: 'processing', label: 'Crop Processing', icon: Wheat, doneStatuses: ['PROCESSING', 'COMPLETED'] },
  { id: 'procurement_done', label: 'Procurement Completed', icon: CheckCircle, doneStatuses: ['COMPLETED'] },
  { id: 'payment_initiated', label: 'Payment Initiated', paymentDone: ['PROCESSING', 'PAID'] },
  { id: 'payment_processing', label: 'Payment Processing', paymentDone: ['PROCESSING', 'PAID'] },
  { id: 'payment_done', label: 'Payment Credited', paymentDone: ['PAID'] },
];

export default function PaymentTracker() {
  const { profile } = useAuth();
  const farmerId = profile?.farmerId || 'farmer-001';
  const { procurement, loading } = useProcurement(farmerId);

  if (loading) {
    return (
      <FarmerLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-primary-700" />
        </div>
      </FarmerLayout>
    );
  }

  const payConfig = getPaymentStatusConfig(procurement?.paymentStatus);

  return (
    <FarmerLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="section-heading">Payment Tracker</h1>
          <p className="section-subheading">Track your procurement payment from start to finish</p>
        </div>

        {/* Amount hero card */}
        <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-blue-300 text-sm mb-1">Procurement Amount</p>
              <div className="text-5xl font-black" style={{fontFamily:'Outfit,sans-serif'}}>
                {formatAmount(procurement?.amount || 26400)}
              </div>
              <p className="text-blue-300 text-sm mt-2">
                {procurement?.crop || 'Wheat'} · {procurement?.quantity || 12} {procurement?.unit || 'quintal'} · 
                MSP ₹{(procurement?.msp || 2200).toLocaleString('en-IN')}/q
              </p>
            </div>
            <div className={`px-3 py-1.5 rounded-full text-sm font-bold`} style={{ background: payConfig.color + '33', color: payConfig.color }}>
              {payConfig.label}
            </div>
          </div>

          {/* Reference */}
          <div className="border-t border-white/10 pt-4 flex items-center gap-2">
            <Hash size={14} className="text-blue-300 flex-shrink-0" />
            <div>
              <p className="text-blue-300 text-xs">Reference Number</p>
              <p className="font-mono font-bold text-white text-sm">
                {procurement?.paymentReference || 'PROC-2026-00472'}
              </p>
            </div>
          </div>
        </div>

        {/* Farmer & procurement details */}
        <div className="bs-card mb-6">
          <h3 className="font-bold text-slate-800 mb-4 text-sm" style={{fontFamily:'Outfit,sans-serif'}}>
            Procurement Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: <Wheat size={14}/>, label: 'Crop', value: procurement?.crop || 'Wheat' },
              { icon: <Package size={14}/>, label: 'Quantity', value: `${procurement?.quantity || 12} ${procurement?.unit || 'quintal'}` },
              { icon: <MapPin size={14}/>, label: 'Mandi', value: procurement?.mandiName || 'Jaipur Procurement Centre' },
              { icon: <Hash size={14}/>, label: 'Token', value: formatToken(procurement?.tokenNumber || 247) },
              { icon: <Calendar size={14}/>, label: 'Date', value: formatDate(procurement?.procurementDate || '2026-09-08') },
              { icon: <Clock size={14}/>, label: 'Slot', value: procurement?.slot || '10:00 AM - 12:00 PM' },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-start gap-2">
                <div className="text-slate-400 mt-0.5 flex-shrink-0">{icon}</div>
                <div>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="text-sm font-semibold text-slate-800">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Full payment timeline */}
        <div className="bs-card mb-6">
          <h3 className="font-bold text-slate-800 mb-5 text-sm" style={{fontFamily:'Outfit,sans-serif'}}>
            Payment Progress
          </h3>
          <div className="payment-timeline space-y-5">
            {TIMELINE_STEPS.map((step, i) => {
              let isDone = false;
              if (step.alwaysDone) isDone = true;
              else if (step.doneStatuses) isDone = step.doneStatuses.includes(procurement?.status);
              else if (step.paymentDone) isDone = step.paymentDone.includes(procurement?.paymentStatus);
              
              const StepIcon = step.icon || CheckCircle;
              const isActive = !isDone && (
                (step.doneStatuses && step.doneStatuses[0] === procurement?.status) ||
                (step.paymentDone && step.paymentDone[0] === procurement?.paymentStatus)
              );
              
              return (
                <div key={step.id} className="timeline-step">
                  <div className={`timeline-dot ${isDone ? 'bg-green-100' : isActive ? 'bg-amber-100 animate-pulse' : 'bg-slate-100'}`}>
                    {isDone 
                      ? <CheckCircle size={16} className="text-green-600" />
                      : isActive 
                        ? <Clock size={14} className="text-amber-600" />
                        : <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                    }
                  </div>
                  <div className="pt-0.5">
                    <p className={`text-sm font-medium ${isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                      {step.label}
                    </p>
                    {isDone && (
                      <p className="text-xs text-green-600 font-medium mt-0.5">✓ Completed</p>
                    )}
                    {isActive && (
                      <p className="text-xs text-amber-600 font-medium mt-0.5">⏳ In progress...</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* WhatsApp Receipt Action */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-emerald-950 text-sm mb-0.5" style={{fontFamily:'Outfit,sans-serif'}}>
              WhatsApp भुगतान रसीद (Payment Receipt)
            </h4>
            <p className="text-xs text-emerald-700">
              इस भुगतान का पूर्ण विवरण सीधे अपने WhatsApp नंबर <strong>+91 {profile?.phone || '7727038430'}</strong> पर पाएं।
            </p>
          </div>
          <button
            onClick={() => {
              const cleanPhone = (profile?.phone || '7727038430').replace(/\D/g, '').slice(-10);
              const msg = 
                `💳 *भूमिसहयोग - DBT भुगतान रसीद एवं स्थिति*\n` +
                `*BHUMI SAHYOG — DBT PAYMENT STATUS RECEIPT*\n` +
                `--------------------------------\n` +
                `नमस्ते *${profile?.displayName || 'किसान भाई'}* ji!\n\n` +
                `💰 *कुल खरीद राशि:* ₹${(procurement?.amount || 26400).toLocaleString('en-IN')}\n` +
                `🌾 *फसल एवं मात्रा:* ${procurement?.crop || 'Wheat'} (${procurement?.quantity || 12} क्विंटल)\n` +
                `🎫 *टोकन संख्या:* T-${procurement?.tokenNumber || 247}\n` +
                `📍 *खरीद केन्द्र:* ${procurement?.mandiName || 'Jaipur Procurement Centre'}\n` +
                `🏦 *भुगतान स्थिति:* ${procurement?.paymentStatus === 'PAID' ? '✅ बैंक खाते में जमा (Credited)' : '⏳ प्रक्रियाधीन (DBT Processing)'}\n` +
                `🔢 *संदर्भ संख्या / Ref No:* ${procurement?.paymentReference || 'PROC-2026-00472'}\n\n` +
                `👉 लाइव पोर्टल देखें:\n` +
                `https://bhumi-sahyog.netlify.app/farmer\n\n` +
                `_Bhumi Sahyog — Smart Procurement Platform_`;
              
              apiFetch('/api/notifications/whatsapp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  phone: '91' + cleanPhone,
                  type: 'PAYMENT_RECEIPT',
                  message: msg,
                }),
              }).catch(() => {});

              alert(`✅ WhatsApp पर भुगतान रसीद भेज दी गई है (+91 ${cleanPhone})`);
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm shrink-0"
          >
            <span>💬 WhatsApp रसीद भेजें</span>
          </button>
        </div>

        {/* Demo note */}
        <div className="text-center py-4">
          <p className="text-xs text-slate-400">
            Government e-NAM & DBT Integrated Mandi System
          </p>
        </div>
      </div>
    </FarmerLayout>
  );
}
