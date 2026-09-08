// useAuth hook — Authentication state management
import { useState, useEffect, createContext, useContext } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { subscribeToAuth, getUserProfile, DEMO_CREDENTIALS, logOut as authLogOut } from '../firebase/auth';
import { COLLECTIONS } from '../firebase/firestore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (authUser) => {
      if (authUser) {
        setUser(authUser);
        
        // If authUser is already a populated demo profile (e.g. from local fallback)
        if (authUser.role && authUser.displayName) {
          setProfile(authUser);
          setLoading(false);
          return;
        }

        // Otherwise fetch user profile from Firestore
        let userProfile = null;
        try {
          userProfile = await getUserProfile(authUser.uid);
        } catch (e) {
          console.warn('Could not fetch user profile:', e);
        }
        
        // If profile doesn't exist (first login), create basic profile
        if (!userProfile) {
          const isAdmin = authUser.email?.includes('admin');
          const demoFarmerEmail = authUser.email;
          
          const emailToFarmer = {
            'ramesh@demo.com': { farmerId: 'farmer-001', name: 'Ramesh Kumar' },
            'suresh@demo.com': { farmerId: 'farmer-002', name: 'Suresh Lal' },
            'mohan@demo.com': { farmerId: 'farmer-003', name: 'Mohan Singh' },
          };
          
          const farmerInfo = emailToFarmer[demoFarmerEmail] || {};
          
          userProfile = {
            uid: authUser.uid,
            email: authUser.email,
            role: isAdmin ? 'admin' : 'farmer',
            farmerId: farmerInfo.farmerId || (isAdmin ? null : 'farmer-001'),
            displayName: farmerInfo.name || authUser.email?.split('@')[0],
            mandiId: 'JP001',
            isDemo: true,
          };
          
          try {
            await setDoc(doc(db, COLLECTIONS.USERS, authUser.uid), {
              ...userProfile,
              createdAt: serverTimestamp(),
            });
          } catch (e) {
            console.warn('Could not save user profile to Firestore:', e.message);
          }
        }
        
        setProfile(userProfile);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await authLogOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
