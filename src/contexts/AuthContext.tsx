import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  restaurantId: string | null;
  signUp: (email: string, password: string, fullName: string, restaurantName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Fetch restaurant owned by this user (deferred to avoid blocking)
        setTimeout(() => fetchRestaurant(session.user.id), 0);
      } else {
        setRestaurantId(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRestaurant(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchRestaurant(userId: string) {
    const { data } = await supabase
      .from('restaurants')
      .select('id')
      .eq('owner_id', userId)
      .limit(1)
      .maybeSingle();
    
    if (data?.id) {
      setRestaurantId(data.id);
      return;
    }

    // Auto-create restaurant from signup metadata
    const { data: { user } } = await supabase.auth.getUser();
    const restaurantName = user?.user_metadata?.restaurant_name;
    if (restaurantName) {
      const { data: newRest } = await supabase.from('restaurants').insert({
        name: restaurantName,
        owner_id: userId,
      }).select('id').single();
      if (newRest) {
        // Create default categories
        const defaults = [
          { name: 'Entradas', icon: '🥗', sort_order: 0 },
          { name: 'Principales', icon: '🍖', sort_order: 1 },
          { name: 'Bebidas', icon: '🥤', sort_order: 2 },
          { name: 'Postres', icon: '🍰', sort_order: 3 },
        ];
        await supabase.from('menu_categories').insert(
          defaults.map(d => ({ ...d, restaurant_id: newRest.id }))
        );
        setRestaurantId(newRest.id);
      }
    } else {
      setRestaurantId(null);
    }
  }

  const signUp = async (email: string, password: string, fullName: string, restaurantName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, restaurant_name: restaurantName },
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRestaurantId(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, restaurantId, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
