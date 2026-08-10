import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';

/**
 * Hook pengurusan autentikasi admin.
 * Mendengar perubahan state auth & sahkan admin dalam koleksi admins.
 */
export function useAuth() {
  const [adminUser, setAdminUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthLoading(true);
      if (user) {
        try {
          const adminDocRef = doc(db, 'admins', user.uid);
          const adminDocSnap = await getDoc(adminDocRef);
          if (adminDocSnap.exists()) {
            setAdminUser({ uid: user.uid, email: user.email, ...adminDocSnap.data() });
            setAuthError(null);
          } else {
            setAuthError('Akses ditolak. Pengguna ini bukan admin berdaftar.');
            await signOut(auth);
            setAdminUser(null);
          }
        } catch (err) {
          console.error('Error verifying admin status:', err);
          setAuthError('Ralat memverifikasi status admin.');
          setAdminUser(null);
        }
      } else {
        setAdminUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const logout = async () => {
    setAuthError(null);
    await signOut(auth);
    setAdminUser(null);
  };

  return { adminUser, authLoading, authError, setAuthError, login, logout };
}
