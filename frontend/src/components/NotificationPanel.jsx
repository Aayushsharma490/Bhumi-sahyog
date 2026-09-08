import { useState } from 'react';
import { Bell, CheckCheck, Calendar, Users, CheckCircle, CreditCard, AlertCircle, MessageCircle } from 'lucide-react';
import { timeAgo } from '../utils/formatters';
import { NOTIFICATION_CONFIG } from '../hooks/useNotifications';

const ICON_MAP = {
  Calendar, Users, CheckCircle, CreditCard, AlertCircle, MessageCircle, Bell
};

function NotificationIcon({ type }) {
  const config = NOTIFICATION_CONFIG[type] || NOTIFICATION_CONFIG.QUEUE_UPDATE;
  const IconComponent = ICON_MAP[config.icon] || Bell;
  
  const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-amber-100 text-amber-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };
  
  return (
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[config.color] || 'bg-slate-100 text-slate-600'}`}>
      <IconComponent size={16} />
    </div>
  );
}

export default function NotificationPanel({ notifications, unreadCount, onMarkRead, onMarkAllRead, compact = true }) {
  const [expanded, setExpanded] = useState(false);
  
  const displayed = compact && !expanded 
    ? notifications.slice(0, 3) 
    : notifications;

  if (!notifications || notifications.length === 0) {
    return (
      <div className="bs-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
            <Bell size={16} className="text-slate-500" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm" style={{fontFamily:'Outfit,sans-serif'}}>
            Notifications
          </h3>
        </div>
        <div className="text-center py-6 text-slate-400">
          <Bell size={28} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">All caught up!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bs-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Bell size={16} className="text-slate-600" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm" style={{fontFamily:'Outfit,sans-serif'}}>
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="badge-red">{unreadCount} new</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800 cursor-pointer font-medium"
          >
            <CheckCheck size={13} />
            Mark all read
          </button>
        )}
      </div>

      {/* Notification list */}
      <div className="space-y-2">
        {displayed.map((notif) => (
          <div
            key={notif.id}
            onClick={() => !notif.isRead && onMarkRead?.(notif.id)}
            className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-150 cursor-pointer ${
              notif.isRead 
                ? 'bg-slate-50 hover:bg-slate-100' 
                : 'bg-primary-50 hover:bg-primary-100 border border-primary-100'
            }`}
          >
            <NotificationIcon type={notif.type} />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className={`text-xs font-semibold ${notif.isRead ? 'text-slate-600' : 'text-slate-800'}`}>
                  {notif.title}
                </p>
                {!notif.isRead && (
                  <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-1" />
                )}
              </div>
              <p className={`text-xs mt-0.5 line-clamp-2 ${notif.isRead ? 'text-slate-400' : 'text-slate-600'}`}>
                {notif.message}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {timeAgo(notif.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Show more */}
      {compact && notifications.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-3 text-xs text-primary-600 hover:text-primary-800 cursor-pointer font-medium text-center py-2"
        >
          {expanded ? 'Show less' : `View all ${notifications.length} notifications`}
        </button>
      )}
    </div>
  );
}
