// useQueue hook — Real-time Firestore queue listener
// Uses onSnapshot for instant updates when admin presses NEXT TOKEN
import { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { COLLECTIONS, DEMO_MANDI_ID } from '../firebase/firestore';

const QUEUE_FALLBACK = {
  mandiId: 'JP001',
  mandiName: 'Jaipur Procurement Centre',
  currentToken: 213,
  status: 'ACTIVE',
  averageProcessingMinutes: 1.5,
  waitingCount: 47,
  completedToday: 324,
  todayTotal: 380,
  isDemo: true,
};

export function useQueue(mandiId = DEMO_MANDI_ID) {
  const [queue, setQueue] = useState(QUEUE_FALLBACK);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [justUpdated, setJustUpdated] = useState(false);
  const prevTokenRef = useRef(null);

  useEffect(() => {
    const queueRef = doc(db, COLLECTIONS.QUEUES, mandiId);
    
    const unsubscribe = onSnapshot(
      queueRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = { id: snapshot.id, ...snapshot.data() };
          
          // Flash animation when token changes
          if (prevTokenRef.current !== null && prevTokenRef.current !== data.currentToken) {
            setJustUpdated(true);
            setTimeout(() => setJustUpdated(false), 1000);
          }
          prevTokenRef.current = data.currentToken;
          
          setQueue(data);
          setError(null);
        } else {
          // Use fallback data for demo
          setQueue(QUEUE_FALLBACK);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Queue listener error:', err);
        setError('Unable to connect to live queue. Showing demo data.');
        setQueue(QUEUE_FALLBACK);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [mandiId]);

  return { queue, loading, error, justUpdated };
}

// Admin queue actions — These update Firestore, causing all farmer dashboards to update instantly
export async function nextToken(mandiId = DEMO_MANDI_ID) {
  const queueRef = doc(db, COLLECTIONS.QUEUES, mandiId);
  await updateDoc(queueRef, {
    currentToken: increment(1),
    completedToday: increment(1),
    waitingCount: increment(-1),
    updatedAt: serverTimestamp(),
  });
}

export async function pauseQueue(mandiId = DEMO_MANDI_ID) {
  const queueRef = doc(db, COLLECTIONS.QUEUES, mandiId);
  await updateDoc(queueRef, {
    status: 'PAUSED',
    updatedAt: serverTimestamp(),
  });
}

export async function resumeQueue(mandiId = DEMO_MANDI_ID) {
  const queueRef = doc(db, COLLECTIONS.QUEUES, mandiId);
  await updateDoc(queueRef, {
    status: 'ACTIVE',
    updatedAt: serverTimestamp(),
  });
}

export async function updateProcessingRate(mandiId = DEMO_MANDI_ID, minutes) {
  const queueRef = doc(db, COLLECTIONS.QUEUES, mandiId);
  await updateDoc(queueRef, {
    averageProcessingMinutes: minutes,
    updatedAt: serverTimestamp(),
  });
}
