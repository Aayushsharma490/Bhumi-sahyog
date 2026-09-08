import { useAuth } from '../hooks/useAuth.jsx';
import { useNotifications } from '../hooks/useNotifications';
import FarmerLayout from '../layouts/FarmerLayout';
import NotificationPanel from '../components/NotificationPanel';
import { Bell, Loader2 } from 'lucide-react';

export default function Notifications() {
  const { profile } = useAuth();
  const farmerId = profile?.farmerId || 'farmer-001';
  const { notifications, unreadCount, loading, markAsRead, markAllRead } = useNotifications(farmerId);

  if (loading) {
    return (
      <FarmerLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-primary-700" />
        </div>
      </FarmerLayout>
    );
  }

  return (
    <FarmerLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="section-heading">Notifications</h1>
          <p className="section-subheading">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <NotificationPanel
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkRead={markAsRead}
          onMarkAllRead={markAllRead}
          compact={false}
        />
      </div>
    </FarmerLayout>
  );
}
