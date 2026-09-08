import { getProcurementStatusConfig, getPaymentStatusConfig, getQueueStatusConfig } from '../utils/formatters';

// Universal status badge component
export default function StatusBadge({ type = 'procurement', status }) {
  let config;
  if (type === 'payment') {
    config = getPaymentStatusConfig(status);
  } else if (type === 'queue') {
    config = getQueueStatusConfig(status);
  } else {
    config = getProcurementStatusConfig(status);
  }
  
  return (
    <span className={config.badgeClass}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot || 'bg-current'} flex-shrink-0`}></span>
      {config.label}
    </span>
  );
}
