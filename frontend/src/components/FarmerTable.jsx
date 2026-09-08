import { useState, useMemo } from 'react';
import { Search, Filter, ChevronUp, ChevronDown, Eye, Edit2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatToken, formatAmount } from '../utils/formatters';
import { estimateWaitTime as calcWait, calculateFarmersAhead as calcAhead, formatWaitTime as fmtWait } from '../services/predictionService';

const CROPS = ['All', 'Wheat', 'Rice', 'Mustard', 'Soybean', 'Barley', 'Maize'];
const STATUSES = ['All', 'WAITING', 'IN_QUEUE', 'PROCESSING', 'COMPLETED', 'CANCELLED'];

export default function FarmerTable({ procurements, currentToken, avgProcessing, onUpdateStatus, onUpdatePayment }) {
  const [search, setSearch] = useState('');
  const [cropFilter, setCropFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortKey, setSortKey] = useState('tokenNumber');
  const [sortDir, setSortDir] = useState('asc');
  const [selectedId, setSelectedId] = useState(null);

  const filtered = useMemo(() => {
    let data = [...(procurements || [])];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(p => 
        p.farmerName?.toLowerCase().includes(q) || 
        String(p.tokenNumber).includes(q) ||
        p.crop?.toLowerCase().includes(q)
      );
    }
    if (cropFilter !== 'All') data = data.filter(p => p.crop === cropFilter);
    if (statusFilter !== 'All') data = data.filter(p => p.status === statusFilter);
    data.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      const dir = sortDir === 'asc' ? 1 : -1;
      if (typeof av === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
    return data;
  }, [procurements, search, cropFilter, statusFilter, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ k }) => {
    if (sortKey !== k) return <ChevronUp size={12} className="text-slate-300" />;
    return sortDir === 'asc' 
      ? <ChevronUp size={12} className="text-primary-600" /> 
      : <ChevronDown size={12} className="text-primary-600" />;
  };

  return (
    <div className="bs-card p-0 overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search farmer, token, crop..."
            className="bs-input py-2 pl-9 text-sm"
          />
        </div>
        {/* Crop filter */}
        <select
          value={cropFilter}
          onChange={e => setCropFilter(e.target.value)}
          className="bs-input w-auto py-2 text-sm cursor-pointer"
        >
          {CROPS.map(c => <option key={c}>{c}</option>)}
        </select>
        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bs-input w-auto py-2 text-sm cursor-pointer"
        >
          {STATUSES.map(s => <option key={s}>{s === 'All' ? 'All Status' : s}</option>)}
        </select>
        <span className="text-xs text-slate-500 ml-auto">{filtered.length} farmers</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="bs-table min-w-full">
          <thead>
            <tr>
              {[
                { key: 'tokenNumber', label: 'Token' },
                { key: 'farmerName', label: 'Farmer Name' },
                { key: 'crop', label: 'Crop' },
                { key: 'quantity', label: 'Quantity' },
                { key: 'status', label: 'Queue Status' },
                { key: null, label: 'Est. Wait' },
                { key: 'paymentStatus', label: 'Payment' },
                { key: null, label: 'Actions' },
              ].map(({ key, label }) => (
                <th key={label} 
                  onClick={() => key && handleSort(key)}
                  className={key ? 'cursor-pointer select-none hover:bg-slate-100' : ''}
                >
                  <div className="flex items-center gap-1">
                    {label}
                    {key && <SortIcon k={key} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-slate-400 text-sm">
                  No farmers found
                </td>
              </tr>
            ) : (
              filtered.map((proc) => {
                const ahead = calcAhead(proc.tokenNumber, currentToken || 213);
                const wait = calcWait(ahead, avgProcessing || 1.5);
                return (
                  <tr key={proc.id} className={selectedId === proc.id ? 'bg-primary-50' : ''}>
                    <td>
                      <span className="font-mono font-bold text-primary-800">
                        {formatToken(proc.tokenNumber)}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-xs flex-shrink-0">
                          {proc.farmerName?.[0] || '?'}
                        </div>
                        <span className="font-medium text-slate-800">{proc.farmerName}</span>
                      </div>
                    </td>
                    <td>
                      <span className="font-medium">{proc.crop}</span>
                    </td>
                    <td>{proc.quantity} {proc.unit || 'q'}</td>
                    <td><StatusBadge type="procurement" status={proc.status} /></td>
                    <td className="text-slate-500 text-xs">
                      {proc.status === 'COMPLETED' ? '—' : fmtWait(wait)}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <StatusBadge type="payment" status={proc.paymentStatus} />
                        {proc.paymentStatus !== 'PAID' && (
                          <button
                            onClick={() => onUpdatePayment?.(proc.id, 'PAID')}
                            className="text-xs text-primary-600 hover:text-primary-800 cursor-pointer font-medium"
                            title="Mark as Paid"
                          >
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedId(selectedId === proc.id ? null : proc.id)}
                          className="p-1.5 text-slate-400 hover:text-primary-700 hover:bg-primary-50 rounded-lg cursor-pointer transition-colors"
                          title="View details"
                        >
                          <Eye size={14} />
                        </button>
                        {proc.status !== 'COMPLETED' && (
                          <button
                            onClick={() => onUpdateStatus?.(proc.id, 'COMPLETED')}
                            className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-lg cursor-pointer hover:bg-green-200 transition-colors"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
