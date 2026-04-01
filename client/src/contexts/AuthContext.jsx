import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if(session?.user) fetchRole(session.user);
      else setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if(session?.user) {
        fetchRole(session.user);
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRole = async (user) => {
    // Automatically grant admin role for demo emails starting with 'admin'
    if (user?.email?.startsWith('admin')) {
      setRole('admin');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (error) {
      setRole('user');
    } else if (data) {
      setRole(data.role);
    }
    setLoading(false);
  };

  const signIn = async (email, password) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email, password) => {
    return supabase.auth.signUp({ email, password });
  };

  const signOut = () => {
    setUser(null);
    setRole(null);
    return supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, role, signIn, signUp, signOut, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
