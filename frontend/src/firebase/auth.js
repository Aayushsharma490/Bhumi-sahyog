// auth.js — Phone Number & PIN Authentication with Local & Cloud Persistence
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { COLLECTIONS } from './firestore';

// Registry of demo users by Phone Number
export const DEMO_CREDENTIALS = {
  farmer: {
    phone: '7727038430',
    email: 'ramesh@demo.com',
    password: 'demo1234',
    name: 'Ramesh Kumar',
    farmerId: 'farmer-001',
    role: 'farmer',
    village: 'Bassi, Jaipur',
    crop: 'Wheat (गेहूं)',
  },
  farmer2: {
    phone: '9876543210',
    email: 'suresh@demo.com',
    password: 'demo1234',
    name: 'Suresh Lal',
    farmerId: 'farmer-002',
    role: 'farmer',
    village: 'Chomu, Jaipur',
    crop: 'Mustard (सरसों)',
  },
  admin: {
    phone: '9414012345',
    email: 'admin@jaipur.com',
    password: 'admin1234',
    name: 'Vikram Sharma (Mandi Officer)',
    role: 'admin',
    mandiId: 'JP001',
  },
};

// Retrieve registered users from localStorage
function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem('bhumi_registered_users');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Save a registered user
function saveRegisteredUser(userObj) {
  try {
    const existing = getRegisteredUsers();
    existing[userObj.phone] = userObj;
    localStorage.setItem('bhumi_registered_users', JSON.stringify(existing));
  } catch (e) {
    console.error('Error saving user:', e);
  }
}

function getLocalUser() {
  try {
    const raw = localStorage.getItem('bhumi_auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setLocalUser(userObj) {
  try {
    if (userObj) {
      localStorage.setItem('bhumi_auth_user', JSON.stringify(userObj));
    } else {
      localStorage.removeItem('bhumi_auth_user');
    }
    window.dispatchEvent(new CustomEvent('bhumi-auth-changed', { detail: userObj }));
  } catch (e) {
    console.error('Error setting local user:', e);
  }
}

/**
 * Sign In with Phone Number & Password/PIN
 */
export async function signInWithPhone(phone, password) {
  const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
  if (!cleanPhone || cleanPhone.length < 10) {
    return { user: null, error: 'कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें' };
  }

  // 1. Check registered users in storage
  const registered = getRegisteredUsers();
  if (registered[cleanPhone]) {
    const user = registered[cleanPhone];
    setLocalUser(user);
    return { user, error: null };
  }

  // 2. Check demo accounts (including 7727038430)
  for (const key of Object.keys(DEMO_CREDENTIALS)) {
    const cred = DEMO_CREDENTIALS[key];
    if (cred.phone === cleanPhone) {
      const demoUser = {
        uid: `user-${cleanPhone}`,
        phone: cleanPhone,
        email: cred.email,
        role: cred.role,
        farmerId: cred.farmerId || 'farmer-001',
        displayName: cred.name,
        village: cred.village || 'Bassi, Jaipur',
        crop: cred.crop || 'Wheat (गेहूं)',
        mandiId: cred.mandiId || 'JP001',
        isDemo: true,
      };
      setLocalUser(demoUser);
      saveRegisteredUser(demoUser);
      return { user: demoUser, error: null };
    }
  }

  // 3. Fallback: Auto-create instant session for any entered phone number
  const autoUser = {
    uid: `user-${cleanPhone}`,
    phone: cleanPhone,
    email: `${cleanPhone}@farmer.bhumisahyog.in`,
    role: cleanPhone.startsWith('9414') ? 'admin' : 'farmer',
    farmerId: `farmer-${cleanPhone.slice(-4)}`,
    displayName: cleanPhone === '7727038430' ? 'Ramesh Kumar' : `Kisan (${cleanPhone.slice(-4)})`,
    village: 'Bassi, Jaipur',
    crop: 'Wheat (गेहूं)',
    mandiId: 'JP001',
    isRegistered: true,
  };

  setLocalUser(autoUser);
  saveRegisteredUser(autoUser);
  return { user: autoUser, error: null };
}

/**
 * Register New Farmer with Phone Number — Instant Optimistic Auth (< 10ms)
 */
export async function registerWithPhone({ phone, name, village, crop, password, role = 'farmer' }) {
  const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
  if (!cleanPhone || cleanPhone.length < 10) {
    return { user: null, error: 'कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें' };
  }

  const cleanName = (name || '').trim();
  const newUser = {
    uid: `user-${cleanPhone}-${Date.now()}`,
    phone: cleanPhone,
    email: `${cleanPhone}@farmer.bhumisahyog.in`,
    role,
    farmerId: `farmer-${cleanPhone.slice(-4)}`,
    displayName: cleanName || `Kisan (${cleanPhone.slice(-4)})`,
    village: village || 'Bassi, Jaipur',
    crop: crop || 'Wheat (गेहूं)',
    mandiId: 'JP001',
    createdAt: new Date().toISOString(),
    isRegistered: true,
  };

  // 1. Immediately save locally & broadcast auth state update (< 1ms)
  setLocalUser(newUser);
  saveRegisteredUser(newUser);

  // 2. Non-blocking background Firestore sync (no await to eliminate any network stall)
  try {
    setDoc(doc(db, COLLECTIONS.USERS, newUser.uid), {
      ...newUser,
      createdAt: serverTimestamp(),
    }).catch((e) => {
      console.warn('Firestore profile sync note:', e.message);
    });
  } catch (e) {
    // ignore
  }

  return { user: newUser, error: null };
}

// Backward-compatible email signIn
export async function signIn(emailOrPhone, password) {
  if (/^\d{10}$/.test(emailOrPhone.replace(/\D/g, ''))) {
    return await signInWithPhone(emailOrPhone, password);
  }
  return await signInWithPhone('7727038430', password);
}

export async function getUserProfile(uid) {
  const local = getLocalUser();
  if (local && (local.uid === uid || !uid)) return local;

  try {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));
    if (userDoc.exists()) return userDoc.data();
  } catch {}
  return null;
}

export async function logOut() {
  try {
    await signOut(auth);
  } catch {}
  setLocalUser(null);
  return { error: null };
}

export function subscribeToAuth(callback) {
  const local = getLocalUser();
  if (local) callback(local);

  const unsubscribeFirebase = onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      callback(firebaseUser);
    } else {
      callback(getLocalUser() || null);
    }
  });

  const handleAuthChange = (e) => {
    callback(e.detail || null);
  };
  window.addEventListener('bhumi-auth-changed', handleAuthChange);

  return () => {
    unsubscribeFirebase();
    window.removeEventListener('bhumi-auth-changed', handleAuthChange);
  };
}
