// Utility formatters for Bhumi Sahyog

/**
 * Format amount in Indian rupees
 */
export function formatAmount(amount) {
  if (!amount && amount !== 0) return '—';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

/**
 * Format token number with T- prefix
 */
export function formatToken(tokenNumber) {
  if (!tokenNumber && tokenNumber !== 0) return '—';
  return `T-${tokenNumber}`;
}

/**
 * Format quantity with unit
 */
export function formatQuantity(qty, unit = 'quintal') {
  if (!qty && qty !== 0) return '—';
  return `${qty} ${unit}`;
}

/**
 * Format date string
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
}

/**
 * Format Firestore timestamp to time ago
 */
export function timeAgo(timestamp) {
  if (!timestamp) return '';
  let date;
  if (timestamp?.toDate) {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    date = new Date(timestamp);
  }

  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return date.toLocaleDateString('en-IN');
}

/**
 * Status display config (color + label)
 */
export function getProcurementStatusConfig(status) {
  const configs = {
    WAITING:    { label: 'Waiting',    badgeClass: 'badge-gray',   dot: 'bg-slate-400' },
    IN_QUEUE:   { label: 'In Queue',   badgeClass: 'badge-yellow', dot: 'bg-amber-400' },
    PROCESSING: { label: 'Processing', badgeClass: 'badge-blue',   dot: 'bg-blue-400'  },
    COMPLETED:  { label: 'Completed',  badgeClass: 'badge-green',  dot: 'bg-green-500' },
    CANCELLED:  { label: 'Cancelled',  badgeClass: 'badge-red',    dot: 'bg-red-400'   },
  };
  return configs[status] || configs.WAITING;
}

export function getPaymentStatusConfig(status) {
  const configs = {
    PENDING:    { label: 'Pending',    badgeClass: 'badge-gray',   color: '#94a3b8' },
    PROCESSING: { label: 'Processing', badgeClass: 'badge-yellow', color: '#f59e0b' },
    PAID:       { label: 'Paid',       badgeClass: 'badge-green',  color: '#22c55e' },
    FAILED:     { label: 'Failed',     badgeClass: 'badge-red',    color: '#ef4444' },
  };
  return configs[status] || configs.PENDING;
}

export function getQueueStatusConfig(status) {
  const configs = {
    ACTIVE:  { label: 'Live',   badgeClass: 'badge-green',  color: '#22c55e' },
    PAUSED:  { label: 'Paused', badgeClass: 'badge-yellow', color: '#f59e0b' },
    CLOSED:  { label: 'Closed', badgeClass: 'badge-red',    color: '#ef4444' },
  };
  return configs[status] || configs.ACTIVE;
}

/**
 * Truncate text
 */
export function truncate(str, max = 40) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '...' : str;
}

/**
 * Generate consistent color for crop name
 */
export function getCropColor(crop) {
  const colors = {
    Wheat: '#f59e0b',
    Rice: '#10b981',
    Mustard: '#eab308',
    Soybean: '#84cc16',
    Barley: '#f97316',
    Maize: '#fbbf24',
    Cotton: '#8b5cf6',
    Sugarcane: '#06b6d4',
  };
  return colors[crop] || '#6b7280';
}
