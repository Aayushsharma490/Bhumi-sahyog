// useProcurement hook — Real-time procurement data for a farmer
import { useState, useEffect } from 'react';
import { 
  collection, doc, query, where, onSnapshot, orderBy,
  updateDoc, serverTimestamp, getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { COLLECTIONS } from '../firebase/firestore';

// Default demo procurement for Ramesh Kumar
const DEMO_PROCUREMENT = {
  id: 'proc-001',
  farmerId: 'farmer-001',
  farmerName: 'Ramesh Kumar',
  mandiId: 'JP001',
  mandiName: 'Jaipur Procurement Centre',
  crop: 'Wheat',
  variety: 'GW-322',
  quantity: 12,
  unit: 'quintal',
  tokenNumber: 247,
  procurementDate: '2026-09-08',
  slot: '10:00 AM - 12:00 PM',
  status: 'IN_QUEUE',
  amount: 26400,
  msp: 2200,
  paymentStatus: 'PROCESSING',
  paymentReference: 'PROC-2026-00472',
  isDemo: true,
};

export function useProcurement(farmerId) {
  const [procurement, setProcurement] = useState(DEMO_PROCUREMENT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!farmerId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, COLLECTIONS.PROCUREMENTS),
      where('farmerId', '==', farmerId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const latest = snapshot.docs[0];
          setProcurement({ id: latest.id, ...latest.data() });
        } else {
          // Demo fallback
          setProcurement(DEMO_PROCUREMENT);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Procurement listener error:', err);
        setProcurement(DEMO_PROCUREMENT);
        setError(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [farmerId]);

  return { procurement, loading, error };
}

// Get all procurements for admin view
export function useAllProcurements(mandiId) {
  const [procurements, setProcurements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, COLLECTIONS.PROCUREMENTS),
      where('mandiId', '==', mandiId || 'JP001'),
      orderBy('tokenNumber', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setProcurements(data.length > 0 ? data : getDemoProcurements());
        setLoading(false);
      },
      () => {
        setProcurements(getDemoProcurements());
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [mandiId]);

  return { procurements, loading };
}

// Update procurement payment status
export async function updatePaymentStatus(procurementId, status) {
  const procRef = doc(db, COLLECTIONS.PROCUREMENTS, procurementId);
  await updateDoc(procRef, {
    paymentStatus: status,
    updatedAt: serverTimestamp(),
  });
}

// Update procurement status
export async function updateProcurementStatus(procurementId, status) {
  const procRef = doc(db, COLLECTIONS.PROCUREMENTS, procurementId);
  await updateDoc(procRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}

function getDemoProcurements() {
  return [
    { id: 'proc-001', farmerName: 'Ramesh Kumar', crop: 'Wheat', quantity: 12, unit: 'quintal', tokenNumber: 247, status: 'IN_QUEUE', amount: 26400, paymentStatus: 'PROCESSING', mandiId: 'JP001', isDemo: true },
    { id: 'proc-002', farmerName: 'Suresh Lal', crop: 'Rice', quantity: 8, unit: 'quintal', tokenNumber: 248, status: 'WAITING', amount: 18400, paymentStatus: 'PENDING', mandiId: 'JP001', isDemo: true },
    { id: 'proc-003', farmerName: 'Mohan Singh', crop: 'Mustard', quantity: 15, unit: 'quintal', tokenNumber: 249, status: 'WAITING', amount: 31500, paymentStatus: 'PENDING', mandiId: 'JP001', isDemo: true },
    { id: 'proc-004', farmerName: 'Kamla Devi', crop: 'Wheat', quantity: 10, unit: 'quintal', tokenNumber: 201, status: 'COMPLETED', amount: 22000, paymentStatus: 'PAID', mandiId: 'JP001', isDemo: true },
    { id: 'proc-005', farmerName: 'Gopal Singh', crop: 'Soybean', quantity: 6, unit: 'quintal', tokenNumber: 202, status: 'COMPLETED', amount: 14400, paymentStatus: 'PAID', mandiId: 'JP001', isDemo: true },
    { id: 'proc-006', farmerName: 'Meena Devi', crop: 'Barley', quantity: 9, unit: 'quintal', tokenNumber: 203, status: 'COMPLETED', amount: 16200, paymentStatus: 'PAID', mandiId: 'JP001', isDemo: true },
  ];
}
