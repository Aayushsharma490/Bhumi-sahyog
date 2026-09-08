// useNotifications hook — In-app notification system
import { useState, useEffect } from 'react';
import { 
  collection, query, where, onSnapshot, orderBy, 
  updateDoc, doc, addDoc, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { COLLECTIONS } from '../firebase/firestore';

const DEMO_NOTIFICATIONS = [
  {
    id: 'notif-001',
    type: 'PROCUREMENT_REMINDER',
    title: 'Procurement Slot Reminder',
    message: 'Your procurement slot is today at 10:00 AM at Jaipur Procurement Centre. Token: T-247.',
    isRead: false,
    isDemo: true,
    createdAt: { toDate: () => new Date(Date.now() - 1800000) },
  },
  {
    id: 'notif-002',
    type: 'QUEUE_UPDATE',
    title: 'Queue Update',
    message: 'Current token is T-213. You have 34 farmers ahead. Estimated wait: ~51 minutes.',
    isRead: false,
    isDemo: true,
    createdAt: { toDate: () => new Date(Date.now() - 900000) },
  },
  {
    id: 'notif-003',
    type: 'PAYMENT_UPDATE',
    title: 'Payment Update',
    message: 'Your payment of ₹26,400 for Wheat is being processed. Ref: PROC-2026-00472.',
    isRead: true,
    isDemo: true,
    createdAt: { toDate: () => new Date(Date.now() - 3600000) },
  },
];

export function useNotifications(farmerId) {
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);
  const [unreadCount, setUnreadCount] = useState(2);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!farmerId) {
      setNotifications(DEMO_NOTIFICATIONS);
      setUnreadCount(DEMO_NOTIFICATIONS.filter(n => !n.isRead).length);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where('farmerId', '==', farmerId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        const allNotifs = data.length > 0 ? data : DEMO_NOTIFICATIONS;
        setNotifications(allNotifs);
        setUnreadCount(allNotifs.filter(n => !n.isRead).length);
        setLoading(false);
      },
      () => {
        setNotifications(DEMO_NOTIFICATIONS);
        setUnreadCount(2);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [farmerId]);

  const markAsRead = async (notifId) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notifId), { isRead: true });
    } catch {
      // Demo mode: update locally
      setNotifications(prev =>
        prev.map(n => n.id === notifId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return { notifications, unreadCount, loading, markAsRead, markAllRead };
}

// Create an in-app notification (called from admin or system)
export async function createNotification(farmerId, type, title, message) {
  try {
    await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
      farmerId,
      type,
      title,
      message,
      isRead: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

// Notification types and their display config
export const NOTIFICATION_CONFIG = {
  PROCUREMENT_REMINDER: { icon: 'Calendar', color: 'blue', label: 'Procurement Reminder' },
  QUEUE_UPDATE: { icon: 'Users', color: 'yellow', label: 'Queue Update' },
  QUEUE_APPROACHING: { icon: 'AlertCircle', color: 'orange', label: 'Queue Approaching' },
  PROCUREMENT_COMPLETED: { icon: 'CheckCircle', color: 'green', label: 'Completed' },
  PAYMENT_UPDATE: { icon: 'CreditCard', color: 'purple', label: 'Payment Update' },
  PAYMENT_COMPLETED: { icon: 'DollarSign', color: 'green', label: 'Payment Received' },
  WHATSAPP: { icon: 'MessageCircle', color: 'green', label: 'WhatsApp' },
};
