// useQueue hook — Real-time Firestore queue listener + Local Broadcast Fallback
// Guaranteed instant updates for Next Token, Pause Queue, Resume Queue
import { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { COLLECTIONS, DEMO_MANDI_ID } from '../firebase/firestore';

const QUEUE_STORAGE_KEY = 'bhumi_queue_state_jp001';

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

function getStoredQueue() {
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (raw) return { ...QUEUE_FALLBACK, ...JSON.parse(raw) };
  } catch (e) {}
  return QUEUE_FALLBACK;
}

function saveStoredQueue(data) {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('bhumi_queue_update', { detail: data }));
  } catch (e) {}
}

export function useQueue(mandiId = DEMO_MANDI_ID) {
  const [queue, setQueue] = useState(getStoredQueue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [justUpdated, setJustUpdated] = useState(false);
  const prevTokenRef = useRef(queue.currentToken);

  // Sync with local events & storage
  useEffect(() => {
    const handleLocalUpdate = (e) => {
      if (e.detail) {
        setQueue((prev) => {
          const next = { ...prev, ...e.detail };
          if (prev.currentToken !== next.currentToken) {
            setJustUpdated(true);
            setTimeout(() => setJustUpdated(false), 1000);
          }
          return next;
        });
      }
    };

    window.addEventListener('bhumi_queue_update', handleLocalUpdate);
    window.addEventListener('storage', (e) => {
      if (e.key === QUEUE_STORAGE_KEY && e.newValue) {
        handleLocalUpdate({ detail: JSON.parse(e.newValue) });
      }
    });

    return () => {
      window.removeEventListener('bhumi_queue_update', handleLocalUpdate);
    };
  }, []);

  // Sync with Firestore onSnapshot
  useEffect(() => {
    const queueRef = doc(db, COLLECTIONS.QUEUES, mandiId);
    
    const unsubscribe = onSnapshot(
      queueRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = { id: snapshot.id, ...snapshot.data() };
          
          if (prevTokenRef.current !== null && prevTokenRef.current !== data.currentToken) {
            setJustUpdated(true);
            setTimeout(() => setJustUpdated(false), 1000);
          }
          prevTokenRef.current = data.currentToken;
          
          setQueue(data);
          saveStoredQueue(data);
          setError(null);
        } else {
          setQueue(getStoredQueue());
        }
        setLoading(false);
      },
      (err) => {
        console.warn('Queue listener notice:', err.message);
        setQueue(getStoredQueue());
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [mandiId]);

  return { queue, loading, error, justUpdated };
}

// Admin queue actions — Updates local store instantly and syncs to Firestore with setDoc merge
export async function nextToken(mandiId = DEMO_MANDI_ID) {
  const current = getStoredQueue();
  const nextTokenNum = (current.currentToken || 213) + 1;
  const nextWaiting = Math.max(0, (current.waitingCount || 47) - 1);
  const nextCompleted = (current.completedToday || 324) + 1;

  const updatedData = {
    ...current,
    mandiId,
    currentToken: nextTokenNum,
    completedToday: nextCompleted,
    waitingCount: nextWaiting,
    updatedAt: new Date().toISOString(),
  };

  saveStoredQueue(updatedData);

  try {
    const queueRef = doc(db, COLLECTIONS.QUEUES, mandiId);
    await setDoc(queueRef, {
      ...updatedData,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (e) {
    console.warn('Firestore sync note:', e.message);
  }

  return updatedData;
}

export async function pauseQueue(mandiId = DEMO_MANDI_ID) {
  const current = getStoredQueue();
  const updatedData = {
    ...current,
    mandiId,
    status: 'PAUSED',
    updatedAt: new Date().toISOString(),
  };

  saveStoredQueue(updatedData);

  try {
    const queueRef = doc(db, COLLECTIONS.QUEUES, mandiId);
    await setDoc(queueRef, {
      status: 'PAUSED',
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (e) {
    console.warn('Firestore sync note:', e.message);
  }

  return updatedData;
}

export async function resumeQueue(mandiId = DEMO_MANDI_ID) {
  const current = getStoredQueue();
  const updatedData = {
    ...current,
    mandiId,
    status: 'ACTIVE',
    updatedAt: new Date().toISOString(),
  };

  saveStoredQueue(updatedData);

  try {
    const queueRef = doc(db, COLLECTIONS.QUEUES, mandiId);
    await setDoc(queueRef, {
      status: 'ACTIVE',
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (e) {
    console.warn('Firestore sync note:', e.message);
  }

  return updatedData;
}

export async function updateProcessingRate(mandiId = DEMO_MANDI_ID, minutes) {
  const current = getStoredQueue();
  const updatedData = {
    ...current,
    mandiId,
    averageProcessingMinutes: Number(minutes) || 1.5,
    updatedAt: new Date().toISOString(),
  };

  saveStoredQueue(updatedData);

  try {
    const queueRef = doc(db, COLLECTIONS.QUEUES, mandiId);
    await setDoc(queueRef, {
      averageProcessingMinutes: Number(minutes) || 1.5,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (e) {
    console.warn('Firestore sync note:', e.message);
  }

  return updatedData;
}
