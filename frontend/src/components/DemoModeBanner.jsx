import { AlertTriangle } from 'lucide-react';

export default function DemoModeBanner() {
  return (
    <div className="demo-banner">
      <div className="flex items-center justify-center gap-2">
        <AlertTriangle size={12} />
        <span>
          PROTOTYPE DEMO DATA — Not live government data. For demonstration only.
        </span>
        <AlertTriangle size={12} />
      </div>
    </div>
  );
}
