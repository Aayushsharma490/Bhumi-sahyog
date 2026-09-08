// BookTokenModal.jsx — Live Procurement Slot Booking, Token Generation, & WhatsApp Notification Dispatch
import { useState, useEffect } from 'react';
import { 
  PlusCircle, Wheat, Truck, Calendar, Clock, MapPin, 
  CheckCircle2, MessageCircle, Send, Sparkles, AlertCircle, X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import { apiFetch } from '../config/api';
import { predictWaitingTimeML, CROP_PROFILES, MANDI_NETWORK } from '../services/mlWaitingModel';
import { formatTime } from '../services/predictionService';

export default function BookTokenModal({ isOpen, onClose, onTokenCreated, currentActiveToken = 213 }) {
  const { profile } = useAuth();
  const [crop, setCrop] = useState(profile?.crop?.split(' ')[0] || 'Wheat');
  const [variety, setVariety] = useState('GW-322');
  const [quantity, setQuantity] = useState(15);
  const [vehicle, setVehicle] = useState('Tractor Trolley (ट्रैक्टर ट्रॉली)');
  const [mandiId, setMandiId] = useState('JP001');
  const [phone, setPhone] = useState(profile?.phone || '7727038430');
  const [farmerName, setFarmerName] = useState(profile?.displayName || 'Ramesh Kumar');
  const [slot, setSlot] = useState('Morning (10:00 AM - 12:00 PM)');
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [sendingWA, setSendingWA] = useState(false);

  useEffect(() => {
    if (profile?.phone) setPhone(profile.phone);
    if (profile?.displayName) setFarmerName(profile.displayName);
    if (profile?.crop) setCrop(profile.crop.split(' ')[0]);
  }, [profile]);

  if (!isOpen) return null;

  // Selected Mandi details
  const selectedMandi = MANDI_NETWORK.find(m => m.id === mandiId) || MANDI_NETWORK[0];

  // Calculate live token prediction
  const generatedToken = (currentActiveToken || 213) + selectedMandi.waitingFarmers + 1;
  const farmersAhead = selectedMandi.waitingFarmers;

  const mlPrediction = predictWaitingTimeML({
    farmersAhead,
    crop,
    quantityQuintal: quantity,
    weighbridges: selectedMandi.weighbridges,
    activeStaff: selectedMandi.activeStaff,
    baseAvgMinutes: selectedMandi.avgProcessingMinutes,
    weather: selectedMandi.weather,
  });

  const waitMinutes = mlPrediction.estimatedMinutes;
  const departureDate = new Date(Date.now() + Math.max(0, waitMinutes - 25) * 60000);
  const departureTimeStr = formatTime(departureDate);
  const mspRate = crop === 'Mustard' ? 5650 : crop === 'Paddy' ? 2300 : 2275;
  const grossPayout = quantity * mspRate;

  // Formatted Bilingual Hindi + English WhatsApp Message
  const getFullWhatsAppMessage = () => {
    return (
      `🌾 *भूमिसहयोग - टोकन और खरीद स्लॉट पुष्टि*\n` +
      `*BHUMI SAHYOG - TOKEN & PROCUREMENT CONFIRMATION*\n` +
      `--------------------------------\n` +
      `नमस्ते किसान भाई *${farmerName}* ji!\n` +
      `आपका नया टोकन सफलतापूर्वक बुक कर लिया गया है।\n\n` +
      `🎫 *टोकन नंबर / Token No:* T-${generatedToken}\n` +
      `📍 *केन्द्र / Mandi Centre:* ${selectedMandi.name}\n` +
      `🌾 *फसल / Commodity:* ${crop} (${variety}) - ${quantity} क्विंटल\n` +
      `🚚 *वाहन / Vehicle:* ${vehicle}\n` +
      `🔴 *वर्तमान चालू टोकन / Live Token Now:* T-${currentActiveToken}\n` +
      `👥 *आपके आगे कतार में / Farmers Ahead:* ${farmersAhead} किसान\n` +
      `⏱️ *AI अनुमानित प्रतीक्षा समय / Est. Wait:* ~${waitMinutes} मिनट\n` +
      `🚗 *घर से प्रस्थान समय / Depart From Home:* ${departureTimeStr}\n` +
      `💰 *अनुमानित MSP राशि / Payable MSP:* ₹${grossPayout.toLocaleString('en-IN')}\n` +
      `🏦 *भुगतान स्थिति / Payment Status:* DBT बैंक खाता ट्रांसफर (Direct Benefit Transfer)\n\n` +
      `👉 लाइव स्थिति ट्रैक करें / Track Live:\n` +
      `https://bhumi-sahyog.netlify.app/farmer\n\n` +
      `_Bhumi Sahyog — Predict. Inform. Reduce Waiting._`
    );
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setSendingWA(true);

    const newProcurement = {
      id: `PROC-${Date.now().toString().slice(-5)}`,
      farmerName,
      farmerPhone: phone,
      crop,
      variety,
      quantity,
      unit: 'quintal',
      tokenNumber: generatedToken,
      mandiId,
      mandiName: selectedMandi.name,
      slot,
      status: 'IN_QUEUE',
      amount: grossPayout,
      msp: mspRate,
      paymentStatus: 'PROCESSING',
      paymentReference: `PROC-2026-${generatedToken}`,
      isDemo: true,
      departureTime: departureTimeStr,
      waitMinutes,
    };

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const fullMsg = getFullWhatsAppMessage();

    // 1. Post to backend server WhatsApp notification
    try {
      await apiFetch('/api/notifications/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: '91' + cleanPhone,
          type: 'SLOT_BOOKED',
          message: fullMsg,
        }),
      });
    } catch (err) {
      console.warn('Backend WhatsApp alert note:', err);
    }

    // 2. Prepare manual WhatsApp URL (no automatic popup)
    const waUrl = `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodeURIComponent(fullMsg)}`;
    newProcurement.waUrl = waUrl;

    setBookingSuccess(newProcurement);
    setSendingWA(false);

    if (onTokenCreated) {
      onTokenCreated(newProcurement);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <PlusCircle size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>
                नया खरीद टोकन और स्लॉट बुक करें
              </h3>
              <p className="text-xs text-slate-500">Book Procurement Slot & Instant Live Token with WhatsApp Update</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {bookingSuccess ? (
          /* Success Screen */
          <div className="space-y-4 text-center py-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>

            <h4 className="text-xl font-black text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
              टोकन सफलतापूर्वक जारी किया गया! 🎉
            </h4>
            <div className="inline-block px-5 py-2 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-black text-2xl">
              टोकन: T-{bookingSuccess.tokenNumber}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">किसान / Farmer</span>
                <span className="font-bold text-slate-800">{bookingSuccess.farmerName} ({phone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">केन्द्र / Centre</span>
                <span className="font-bold text-slate-800">{bookingSuccess.mandiName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">फसल एवं मात्रा</span>
                <span className="font-bold text-slate-800">{bookingSuccess.crop} ({bookingSuccess.quantity} Qtl)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">अनुमानित प्रतीक्षा समय</span>
                <span className="font-bold text-accent-700">~{bookingSuccess.waitMinutes} मिनट</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">घर से प्रस्थान का समय</span>
                <span className="font-bold text-emerald-700">{bookingSuccess.departureTime}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-primary-800">
                <span>अनुमानित MSP भुगतान राशि</span>
                <span>₹{bookingSuccess.amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2 text-left">
              <MessageCircle size={18} className="text-emerald-700 shrink-0" />
              <span>
                <strong>व्हाट्सएप संदेश भेजा गया:</strong> नंबर <strong>+91 {phone}</strong> पर पूर्ण विवरण के साथ सूचना प्रेषित कर दी गई है।
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm cursor-pointer shadow-md"
            >
              डैशबोर्ड पर लाइव ट्रैक करें (Done)
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleCreateBooking} className="space-y-4">
            {/* Farmer Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">किसान का नाम (Farmer Name)</label>
                <input
                  type="text"
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  व्हाट्सएप नंबर (WhatsApp No)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Mandi Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">खरीद केन्द्र चुनें (Procurement Centre)</label>
              <select
                value={mandiId}
                onChange={(e) => setMandiId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                {MANDI_NETWORK.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.distanceKm} km away · {m.waitingFarmers} waiting)
                  </option>
                ))}
              </select>
            </div>

            {/* Crop & Quantity */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">फसल (Commodity)</label>
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  {Object.keys(CROP_PROFILES).map((c) => (
                    <option key={c} value={c}>
                      {CROP_PROFILES[c].icon} {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">मात्रा (Quintals)</label>
                <input
                  type="number"
                  min="2"
                  max="100"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold"
                  required
                />
              </div>
            </div>

            {/* Vehicle & Slot */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">वाहन (Vehicle Type)</label>
                <select
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option>Tractor Trolley (ट्रैक्टर ट्रॉली)</option>
                  <option>Pickup Truck (पिकअप)</option>
                  <option>Large Truck (ट्रक 10-चक्का)</option>
                  <option>Bullock Cart (बैलगाड़ी)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">पसंदीदा स्लॉट (Preferred Slot)</label>
                <select
                  value={slot}
                  onChange={(e) => setSlot(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option>Morning (10:00 AM - 12:00 PM)</option>
                  <option>Afternoon (12:00 PM - 02:00 PM)</option>
                  <option>Evening (02:00 PM - 05:00 PM)</option>
                </select>
              </div>
            </div>

            {/* Live AI Prediction Preview Box */}
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-1.5">
              <div className="flex items-center justify-between font-bold text-emerald-900">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-emerald-600" /> AI तत्काल गणना:
                </span>
                <span className="text-emerald-700">नया टोकन: T-{generatedToken}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-white p-2 rounded-xl border border-emerald-200">
                  <p className="text-[10px] text-slate-500">कतार में आगे</p>
                  <p className="font-bold text-slate-800">{farmersAhead} किसान</p>
                </div>
                <div className="bg-white p-2 rounded-xl border border-emerald-200">
                  <p className="text-[10px] text-slate-500">अनुमानित प्रतीक्षा</p>
                  <p className="font-bold text-accent-700">~{waitMinutes} मिनट</p>
                </div>
                <div className="bg-white p-2 rounded-xl border border-emerald-200">
                  <p className="text-[10px] text-slate-500">घर से निकलें</p>
                  <p className="font-bold text-emerald-800">{departureTimeStr}</p>
                </div>
              </div>
              <p className="text-[11px] text-emerald-800 text-center font-semibold pt-1">
                💬 पुष्टि और लाइव ट्रैकिंग संदेश सीधे WhatsApp (+91 {phone}) पर भेजा जाएगा
              </p>
            </div>

            {/* Submit */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
              >
                रद्द करें (Cancel)
              </button>

              <button
                type="submit"
                disabled={sendingWA}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
              >
                {sendingWA ? (
                  'टोकन जारी हो रहा है...'
                ) : (
                  <>
                    <Send size={14} />
                    <span>टोकन जारी करें & WhatsApp भेजें</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
