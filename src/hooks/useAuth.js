import { useState, useEffect, useCallback } from 'react';
import { supabase, mapAdminFromRow } from '../lib/supabase';

/**
 * Hook pengurusan autentikasi admin via Supabase Auth & admins table.
 */
export function useAuth() {
  const [adminUser, setAdminUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const verifyAdmin = useCallback(async (user) => {
    if (!user) {
      setAdminUser(null);
      setAuthLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('uid', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setAdminUser({ ...mapAdminFromRow(data), email: data.email || user.email });
        setAuthError(null);
      } else {
        setAuthError('Akses ditolak. Pengguna ini bukan admin berdaftar.');
        await supabase.auth.signOut();
        setAdminUser(null);
      }
    } catch (err) {
      console.error('Error verifying admin status:', err);
      setAuthError('Ralat memverifikasi status admin.');
      setAdminUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        verifyAdmin(data.session?.user ?? null);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      verifyAdmin(session?.user ?? null);
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [verifyAdmin]);

  const login = async (email, password) => {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;
  };

  const logout = async () => {
    setAuthError(null);
    await supabase.auth.signOut();
    setAdminUser(null);
  };

  return { adminUser, authLoading, authError, setAuthError, login, logout };
}

export default useAuth;
