// Firebase Firestore collections and demo data seeder
import { 
  collection, doc, setDoc, getDoc, getDocs, 
  serverTimestamp, Timestamp 
} from 'firebase/firestore';
import { db } from './config';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  MANDIS: 'mandis',
  QUEUES: 'queues',
  TOKENS: 'tokens',
  FARMERS: 'farmers',
  PROCUREMENTS: 'procurements',
  PAYMENTS: 'payments',
  NOTIFICATIONS: 'notifications',
};

// Demo Mandi ID
export const DEMO_MANDI_ID = 'JP001';

// Demo data for the hackathon
export const DEMO_FARMERS = [
  {
    id: 'farmer-001',
    name: 'Ramesh Kumar',
    phone: '+919876543210',
    whatsapp: '+919876543210',
    village: 'Bassi, Jaipur',
    district: 'Jaipur',
    state: 'Rajasthan',
    mandiId: 'JP001',
    tokenId: 'token-247',
    tokenNumber: 247,
    email: 'ramesh@demo.com',
    isDemo: true,
  },
  {
    id: 'farmer-002',
    name: 'Suresh Lal',
    phone: '+919876543211',
    whatsapp: '+919876543211',
    village: 'Chomu, Jaipur',
    district: 'Jaipur',
    state: 'Rajasthan',
    mandiId: 'JP001',
    tokenId: 'token-248',
    tokenNumber: 248,
    email: 'suresh@demo.com',
    isDemo: true,
  },
  {
    id: 'farmer-003',
    name: 'Mohan Singh',
    phone: '+919876543212',
    whatsapp: '+919876543212',
    village: 'Amber, Jaipur',
    district: 'Jaipur',
    state: 'Rajasthan',
    mandiId: 'JP001',
    tokenId: 'token-249',
    tokenNumber: 249,
    email: 'mohan@demo.com',
    isDemo: true,
  },
  {
    id: 'farmer-004',
    name: 'Kamla Devi',
    phone: '+919876543213',
    village: 'Sanganer, Jaipur',
    district: 'Jaipur',
    state: 'Rajasthan',
    mandiId: 'JP001',
    tokenId: 'token-201',
    tokenNumber: 201,
    email: 'kamla@demo.com',
    isDemo: true,
  },
  {
    id: 'farmer-005',
    name: 'Gopal Singh',
    phone: '+919876543214',
    village: 'Dudu, Jaipur',
    district: 'Jaipur',
    state: 'Rajasthan',
    mandiId: 'JP001',
    tokenId: 'token-202',
    tokenNumber: 202,
    email: 'gopal@demo.com',
    isDemo: true,
  },
  {
    id: 'farmer-006',
    name: 'Meena Devi',
    phone: '+919876543215',
    village: 'Phulera, Jaipur',
    district: 'Jaipur',
    state: 'Rajasthan',
    mandiId: 'JP001',
    tokenId: 'token-203',
    tokenNumber: 203,
    email: 'meena@demo.com',
    isDemo: true,
  },
];

export const DEMO_PROCUREMENTS = [
  {
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
    tokenId: 'token-247',
    procurementDate: '2026-09-08',
    slot: '10:00 AM - 12:00 PM',
    status: 'IN_QUEUE',
    amount: 26400,
    msp: 2200,
    paymentStatus: 'PROCESSING',
    paymentReference: 'PROC-2026-00472',
    isDemo: true,
  },
  {
    id: 'proc-002',
    farmerId: 'farmer-002',
    farmerName: 'Suresh Lal',
    mandiId: 'JP001',
    mandiName: 'Jaipur Procurement Centre',
    crop: 'Rice',
    variety: 'Basmati',
    quantity: 8,
    unit: 'quintal',
    tokenNumber: 248,
    tokenId: 'token-248',
    procurementDate: '2026-09-08',
    slot: '10:00 AM - 12:00 PM',
    status: 'WAITING',
    amount: 18400,
    msp: 2300,
    paymentStatus: 'PENDING',
    paymentReference: 'PROC-2026-00473',
    isDemo: true,
  },
  {
    id: 'proc-003',
    farmerId: 'farmer-003',
    farmerName: 'Mohan Singh',
    mandiId: 'JP001',
    mandiName: 'Jaipur Procurement Centre',
    crop: 'Mustard',
    variety: 'RH-749',
    quantity: 15,
    unit: 'quintal',
    tokenNumber: 249,
    tokenId: 'token-249',
    procurementDate: '2026-09-08',
    slot: '10:00 AM - 12:00 PM',
    status: 'WAITING',
    amount: 31500,
    msp: 2100,
    paymentStatus: 'PENDING',
    paymentReference: 'PROC-2026-00474',
    isDemo: true,
  },
  {
    id: 'proc-004',
    farmerId: 'farmer-004',
    farmerName: 'Kamla Devi',
    mandiId: 'JP001',
    mandiName: 'Jaipur Procurement Centre',
    crop: 'Wheat',
    variety: 'GW-322',
    quantity: 10,
    unit: 'quintal',
    tokenNumber: 201,
    tokenId: 'token-201',
    procurementDate: '2026-09-08',
    slot: '8:00 AM - 10:00 AM',
    status: 'COMPLETED',
    amount: 22000,
    msp: 2200,
    paymentStatus: 'PAID',
    paymentReference: 'PROC-2026-00469',
    isDemo: true,
  },
  {
    id: 'proc-005',
    farmerId: 'farmer-005',
    farmerName: 'Gopal Singh',
    mandiId: 'JP001',
    mandiName: 'Jaipur Procurement Centre',
    crop: 'Soybean',
    variety: 'JS-335',
    quantity: 6,
    unit: 'quintal',
    tokenNumber: 202,
    tokenId: 'token-202',
    procurementDate: '2026-09-08',
    slot: '8:00 AM - 10:00 AM',
    status: 'COMPLETED',
    amount: 14400,
    msp: 2400,
    paymentStatus: 'PAID',
    paymentReference: 'PROC-2026-00470',
    isDemo: true,
  },
  {
    id: 'proc-006',
    farmerId: 'farmer-006',
    farmerName: 'Meena Devi',
    mandiId: 'JP001',
    mandiName: 'Jaipur Procurement Centre',
    crop: 'Barley',
    variety: 'RD-2552',
    quantity: 9,
    unit: 'quintal',
    tokenNumber: 203,
    tokenId: 'token-203',
    procurementDate: '2026-09-08',
    slot: '8:00 AM - 10:00 AM',
    status: 'COMPLETED',
    amount: 16200,
    msp: 1800,
    paymentStatus: 'PAID',
    paymentReference: 'PROC-2026-00471',
    isDemo: true,
  },
];

// Seed demo data into Firestore
export async function seedDemoData() {
  try {
    console.log('Seeding demo data into Firestore...');

    // Mandi
    await setDoc(doc(db, COLLECTIONS.MANDIS, 'JP001'), {
      id: 'JP001',
      name: 'Jaipur Procurement Centre',
      district: 'Jaipur',
      state: 'Rajasthan',
      address: 'Sindhi Camp, Jaipur, Rajasthan 302001',
      managerName: 'Vikram Sharma',
      contactNumber: '+911412200000',
      operatingHours: '8:00 AM - 6:00 PM',
      isActive: true,
      isDemo: true,
      createdAt: serverTimestamp(),
    });

    // Queue state
    await setDoc(doc(db, COLLECTIONS.QUEUES, 'JP001'), {
      mandiId: 'JP001',
      mandiName: 'Jaipur Procurement Centre',
      currentToken: 213,
      status: 'ACTIVE', // ACTIVE | PAUSED | CLOSED
      averageProcessingMinutes: 1.5,
      waitingCount: 47,
      completedToday: 324,
      todayTotal: 380,
      isDemo: true,
      updatedAt: serverTimestamp(),
    });

    // Tokens
    const tokens = [
      { id: 'token-247', tokenNumber: 247, farmerId: 'farmer-001', mandiId: 'JP001', status: 'WAITING' },
      { id: 'token-248', tokenNumber: 248, farmerId: 'farmer-002', mandiId: 'JP001', status: 'WAITING' },
      { id: 'token-249', tokenNumber: 249, farmerId: 'farmer-003', mandiId: 'JP001', status: 'WAITING' },
      { id: 'token-201', tokenNumber: 201, farmerId: 'farmer-004', mandiId: 'JP001', status: 'COMPLETED' },
      { id: 'token-202', tokenNumber: 202, farmerId: 'farmer-005', mandiId: 'JP001', status: 'COMPLETED' },
      { id: 'token-203', tokenNumber: 203, farmerId: 'farmer-006', mandiId: 'JP001', status: 'COMPLETED' },
    ];

    for (const token of tokens) {
      await setDoc(doc(db, COLLECTIONS.TOKENS, token.id), {
        ...token,
        isDemo: true,
        createdAt: serverTimestamp(),
      });
    }

    // Farmers
    for (const farmer of DEMO_FARMERS) {
      await setDoc(doc(db, COLLECTIONS.FARMERS, farmer.id), {
        ...farmer,
        createdAt: serverTimestamp(),
      });
    }

    // Procurements
    for (const proc of DEMO_PROCUREMENTS) {
      await setDoc(doc(db, COLLECTIONS.PROCUREMENTS, proc.id), {
        ...proc,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    // Notifications for Ramesh Kumar (farmer-001)
    const notifications = [
      {
        id: 'notif-001',
        farmerId: 'farmer-001',
        type: 'PROCUREMENT_REMINDER',
        title: 'Procurement Slot Reminder',
        message: 'Your procurement slot is today at 10:00 AM at Jaipur Procurement Centre. Crop: Wheat, Token: T-247.',
        isRead: false,
        isDemo: true,
        createdAt: serverTimestamp(),
      },
      {
        id: 'notif-002',
        farmerId: 'farmer-001',
        type: 'QUEUE_UPDATE',
        title: 'Queue Update',
        message: 'Current token is T-213. You have 34 farmers ahead. Estimated wait: ~51 minutes.',
        isRead: false,
        isDemo: true,
        createdAt: serverTimestamp(),
      },
      {
        id: 'notif-003',
        farmerId: 'farmer-001',
        type: 'PAYMENT_UPDATE',
        title: 'Payment Status Update',
        message: 'Your payment of ₹26,400 for Wheat procurement is being processed. Reference: PROC-2026-00472.',
        isRead: true,
        isDemo: true,
        createdAt: serverTimestamp(),
      },
    ];

    for (const notif of notifications) {
      await setDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notif.id), notif);
    }

    console.log('Demo data seeded successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding demo data:', error);
    return false;
  }
}

// Check if demo data exists
export async function isDemoDataSeeded() {
  try {
    const queueDoc = await getDoc(doc(db, COLLECTIONS.QUEUES, 'JP001'));
    return queueDoc.exists();
  } catch {
    return false;
  }
}
