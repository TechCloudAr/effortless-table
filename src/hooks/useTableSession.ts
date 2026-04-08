import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Registers a table session when a customer scans a QR code.
 * Marks the table as occupied immediately, and ends the session on page unload.
 */
export function useTableSession(restaurantId?: string, tableNumber?: number) {
  const sessionTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!restaurantId || !tableNumber) return;

    const token = crypto.randomUUID();
    sessionTokenRef.current = token;

    // Create session (marks table as occupied)
    supabase
      .from('table_sessions')
      .insert({
        restaurant_id: restaurantId,
        table_number: tableNumber,
        session_token: token,
      })
      .then(({ error }) => {
        if (error) console.error('Failed to create table session:', error);
      });

    // End session on page unload
    const endSession = () => {
      if (!sessionTokenRef.current) return;
      // Use sendBeacon for reliable delivery on page close
      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/table_sessions?session_token=eq.${sessionTokenRef.current}`;
      const body = JSON.stringify({ is_active: false, ended_at: new Date().toISOString() });
      const headers = {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        'Prefer': 'return=minimal',
      };
      // Try sendBeacon first (works on page close), fallback to fetch
      const blob = new Blob([body], { type: 'application/json' });
      try {
        // sendBeacon doesn't support custom headers, so use fetch with keepalive
        fetch(url, { method: 'PATCH', headers, body, keepalive: true });
      } catch {
        // Best effort
      }
      sessionTokenRef.current = null;
    };

    window.addEventListener('beforeunload', endSession);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        endSession();
      }
    });

    return () => {
      window.removeEventListener('beforeunload', endSession);
      endSession();
    };
  }, [restaurantId, tableNumber]);
}
