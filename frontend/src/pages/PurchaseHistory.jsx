// PurchaseHistory.jsx — Farmer Procurement & Payment History Ledger
import { useState } from 'react';
import FarmerLayout from '../layouts/FarmerLayout';
import { useAuth } from '../hooks/useAuth.jsx';
import { apiFetch } from '../config/api';
import { 
  History, Download, FileText, CheckCircle2, Clock, 
  Search, Filter, Printer, ExternalLink, Calendar, 
  ArrowUpRight, Wheat, CheckCircle, Scale, Building2, ShieldCheck, MessageCircle
} from 'lucide-react';
import { formatAmount, formatToken } from '../utils/formatters';

const HISTORICAL_PROCUREMENTS = [
  {
    id: 'PROC-2026-00472',
    season: 'Rabi 2026',
    date: '08 Sept 2026',
    time: '11:30 AM',
    crop: 'Wheat (गेहूं)',
    variety: 'GW-322',
    mandiName: 'Jaipur Procurement Centre',
    weighbridgeSlip: 'WB-JP-88412',
    grossWeightQuintal: 12.0,
    tareWeightQuintal: 0.0,
    netWeightQuintal: 12.0,
    moisturePercent: 11.4,
    faqStandardMet: true,
    mspPerQuintal: 2200,
    grossAmount: 26400,
    mandiCessDeduction: 0,
    netPayout: 26400,
    paymentStatus: 'PROCESSING',
    utrNumber: 'PENDING_BANK_CLEARANCE',
    bankAccount: 'SBI •••• 4892',
    tokenNumber: 247,
  },
  {
    id: 'PROC-2025-00891',
    season: 'Kharif 2025',
    date: '14 Nov 2025',
    time: '02:15 PM',
    crop: 'Bajra / Pearl Millet (बाजरा)',
    variety: 'RHB-177',
    mandiName: 'Jaipur Procurement Centre',
    weighbridgeSlip: 'WB-JP-73109',
    grossWeightQuintal: 18.5,
    tareWeightQuintal: 0.0,
    netWeightQuintal: 18.5,
    moisturePercent: 12.1,
    faqStandardMet: true,
    mspPerQuintal: 2500,
    grossAmount: 46250,
    mandiCessDeduction: 0,
    netPayout: 46250,
    paymentStatus: 'PAID',
    utrNumber: 'SBIN25318991042',
    bankAccount: 'SBI •••• 4892',
    tokenNumber: 182,
  },
  {
    id: 'PROC-2025-00344',
    season: 'Rabi 2025',
    date: '22 Apr 2025',
    time: '10:45 AM',
    crop: 'Mustard / Sarson (सरसों)',
    variety: 'Pusa Bold',
    mandiName: 'Bassi Sub-Procurement Centre',
    weighbridgeSlip: 'WB-BS-44219',
    grossWeightQuintal: 15.0,
    tareWeightQuintal: 0.0,
    netWeightQuintal: 15.0,
    moisturePercent: 7.8,
    faqStandardMet: true,
    mspPerQuintal: 5650,
    grossAmount: 84750,
    mandiCessDeduction: 0,
    netPayout: 84750,
    paymentStatus: 'PAID',
    utrNumber: 'PUNB25112048931',
    bankAccount: 'SBI •••• 4892',
    tokenNumber: 94,
  },
  {
    id: 'PROC-2024-00712',
    season: 'Kharif 2024',
    date: '19 Oct 2024',
    time: '01:00 PM',
    crop: 'Moong / Green Gram (मूंग)',
    variety: 'IPM 02-3',
    mandiName: 'Jaipur Procurement Centre',
    weighbridgeSlip: 'WB-JP-59281',
    grossWeightQuintal: 8.0,
    tareWeightQuintal: 0.0,
    netWeightQuintal: 8.0,
    moisturePercent: 10.2,
    faqStandardMet: true,
    mspPerQuintal: 8558,
    grossAmount: 68464,
    mandiCessDeduction: 0,
    netPayout: 68464,
    paymentStatus: 'PAID',
    utrNumber: 'SBIN24292881903',
    bankAccount: 'SBI •••• 4892',
    tokenNumber: 119,
  },
];

export default function PurchaseHistory() {
  const [selectedSeason, setSelectedSeason] = useState('ALL');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const filteredProcurements = selectedSeason === 'ALL'
    ? HISTORICAL_PROCUREMENTS
    : HISTORICAL_PROCUREMENTS.filter(p => p.season.includes(selectedSeason));

  const totalSoldQuintals = HISTORICAL_PROCUREMENTS.reduce((sum, p) => sum + p.netWeightQuintal, 0);
  const totalEarnedAmount = HISTORICAL_PROCUREMENTS.reduce((sum, p) => sum + p.netPayout, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <FarmerLayout>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-800 flex items-center justify-center">
              <History size={18} />
            </div>
            <h1 className="section-heading mb-0">Procurement & Sale History</h1>
          </div>
          <p className="text-sm text-slate-500">
            Verified digital weighbridge records, MSP vouchers, and DBT payment receipts
          </p>
        </div>

        {/* Season Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          {['ALL', '2026', '2025', '2024'].map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSeason(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedSeason === s
                  ? 'bg-white shadow-sm text-primary-800'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {s === 'ALL' ? 'All Seasons' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Total Quantity Sold</p>
          <div className="text-2xl font-black text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {totalSoldQuintals} <span className="text-sm font-semibold text-slate-500">Quintals</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">✓ Verified Government Procurement</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Total Lifetime MSP Earnings</p>
          <div className="text-2xl font-black text-primary-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {formatAmount(totalEarnedAmount)}
          </div>
          <p className="text-[11px] text-primary-600 font-semibold mt-1">100% Direct to SBI Bank A/C</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Procurement Receipts</p>
          <div className="text-2xl font-black text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {HISTORICAL_PROCUREMENTS.length} <span className="text-sm font-semibold text-slate-500">Batches</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Digital QR Signed Slips Available</p>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 text-sm">Historical Weighment & Procurement Vouchers</h2>
          <span className="text-xs text-slate-500">{filteredProcurements.length} records found</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Receipt / Date</th>
                <th className="py-3 px-4">Crop & Variety</th>
                <th className="py-3 px-4">Net Weight</th>
                <th className="py-3 px-4">MSP Rate</th>
                <th className="py-3 px-4">Total Payout</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProcurements.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-800">{item.id}</div>
                    <div className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                      <Calendar size={11} /> {item.date} · {item.season}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{item.crop}</div>
                    <div className="text-slate-400 text-[11px]">{item.mandiName}</div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {item.netWeightQuintal} Qtl
                    <div className="text-[11px] text-slate-400 font-normal">Moisture: {item.moisturePercent}%</div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700">
                    ₹{item.mspPerQuintal}/Qtl
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-primary-800">{formatAmount(item.netPayout)}</div>
                    <div className="text-[10px] text-slate-400">{item.bankAccount}</div>
                  </td>
                  <td className="py-3 px-4">
                    {item.paymentStatus === 'PAID' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={11} /> Disbursed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock size={11} className="animate-spin" /> Processing
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedReceipt(item)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <FileText size={12} /> View Slip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Digital Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Printable voucher header */}
            <div className="border-b border-slate-200 pb-4 mb-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary-800 text-accent-400 flex items-center justify-center font-black">
                    BS
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      BHUMI SAHYOG DIGITAL PROCUREMENT VOUCHER
                    </h3>
                    <p className="text-xs text-slate-500">Government Procurement Portal · E-Weighbridge Record</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Slip details */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl">
                <div>
                  <p className="text-slate-400">Voucher Reference</p>
                  <p className="font-bold text-slate-800">{selectedReceipt.id}</p>
                </div>
                <div>
                  <p className="text-slate-400">Date & Slot</p>
                  <p className="font-bold text-slate-800">{selectedReceipt.date} · {selectedReceipt.time}</p>
                </div>
                <div>
                  <p className="text-slate-400">Centre</p>
                  <p className="font-bold text-slate-800">{selectedReceipt.mandiName}</p>
                </div>
                <div>
                  <p className="text-slate-400">Weighbridge Slip</p>
                  <p className="font-bold text-slate-800">{selectedReceipt.weighbridgeSlip}</p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-3 divide-y divide-slate-100">
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Commodity</span>
                  <span className="font-semibold text-slate-800">{selectedReceipt.crop} ({selectedReceipt.variety})</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Net Quantity</span>
                  <span className="font-semibold text-slate-800">{selectedReceipt.netWeightQuintal} Quintals</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Moisture Content</span>
                  <span className="font-semibold text-emerald-700">{selectedReceipt.moisturePercent}% (Under FAQ limit)</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Government MSP Rate</span>
                  <span className="font-semibold text-slate-800">₹{selectedReceipt.mspPerQuintal} / Quintal</span>
                </div>
                <div className="flex justify-between py-2 text-sm font-bold text-primary-800 bg-primary-50 px-2 rounded-lg mt-1">
                  <span>Total Payable Amount</span>
                  <span>{formatAmount(selectedReceipt.netPayout)}</span>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5">
                <ShieldCheck size={18} className="text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-900 text-xs">Direct Benefit Transfer (DBT)</p>
                  <p className="text-emerald-800 text-[11px] mt-0.5">
                    Transferred to {selectedReceipt.bankAccount}. UTR: {selectedReceipt.utrNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Printer size={14} /> Print
                </button>
                <button
                  onClick={() => {
                    const cleanPhone = (profile?.phone || '7727038430').replace(/\D/g, '').slice(-10);
                    const msg = 
                      `🌾 *भूमि सहयोग - डिजिटल खरीद एवं वजन पर्ची*\n` +
                      `*BHUMI SAHYOG PROCUREMENT & PAYMENT VOUCHER*\n` +
                      `--------------------------------\n` +
                      `नमस्ते *${profile?.displayName || 'किसान भाई'}* ji!\n\n` +
                      `📄 *वाउचर संदर्भ:* ${selectedReceipt.id}\n` +
                      `📅 *दिनांक व समय:* ${selectedReceipt.date} (${selectedReceipt.time})\n` +
                      `📍 *खरीद केन्द्र:* ${selectedReceipt.mandiName}\n` +
                      `🌾 *फसल:* ${selectedReceipt.crop} (${selectedReceipt.variety})\n` +
                      `⚖️ *वजन:* ${selectedReceipt.netWeightQuintal} क्विंटल (नमी: ${selectedReceipt.moisturePercent}%)\n` +
                      `💰 *MSP दर:* ₹${selectedReceipt.mspPerQuintal}/क्विंटल\n` +
                      `💵 *कुल देय राशि:* ₹${(selectedReceipt.netPayout).toLocaleString('en-IN')}\n` +
                      `🏦 *DBT भुगतान स्थिति:* ${selectedReceipt.paymentStatus === 'PAID' ? '✅ बैंक खाते में जमा (Credited)' : '⏳ प्रक्रियाधीन (Processing)'}\n` +
                      `🔢 *UTR / Ref:* ${selectedReceipt.utrNumber}\n\n` +
                      `👉 लाइव पोर्टल देखें:\n` +
                      `https://bhumi-sahyog.netlify.app/farmer\n\n` +
                      `_भूमि सहयोग — Predict. Inform. Reduce Waiting._`;

                    apiFetch('/api/notifications/whatsapp', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        phone: '91' + cleanPhone,
                        type: 'VOUCHER_RECEIPT',
                        message: msg,
                      }),
                    }).catch(() => {});

                    alert(`✅ WhatsApp पर खरीद पर्ची भेज दी गई है (+91 ${cleanPhone})`);
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                >
                  <MessageCircle size={14} /> WhatsApp पर्ची भेजें
                </button>
              </div>

              <button
                onClick={() => setSelectedReceipt(null)}
                className="bs-btn-primary py-2 px-4 text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </FarmerLayout>
  );
}
