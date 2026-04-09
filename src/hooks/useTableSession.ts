import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';

/**
 * Registers a table session when a customer scans a QR code.
 * - If no orders placed: session ends when customer leaves the page.
 * - If orders placed: session stays active (auto-freed 30min after last delivery via cron).
 */
export function useTableSession(restaurantId?: string, tableNumber?: number, branchId?: string) {
  const sessionTokenRef = useRef<string | null>(null);
  const { items } = useCart();
  const hasOrderedRef = useRef(false);

  // Track if user has items (proxy for having ordered)
  useEffect(() => {
    if (items.length > 0) {
      hasOrderedRef.current = true;
    }
  }, [items]);

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
        ...(branchId ? { branch_id: branchId } : {}),
      })
      .then(({ error }) => {
        if (error) console.error('Failed to create table session:', error);
      });

    // End session on page unload ONLY if no orders were placed
    const endSession = () => {
      if (!sessionTokenRef.current || hasOrderedRef.current) return;
      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/table_sessions?session_token=eq.${sessionTokenRef.current}`;
      const body = JSON.stringify({ is_active: false, ended_at: new Date().toISOString() });
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        'Prefer': 'return=minimal',
      };
      try {
        fetch(url, { method: 'PATCH', headers, body, keepalive: true });
      } catch {
        // Best effort
      }
      sessionTokenRef.current = null;
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') endSession();
    };

    window.addEventListener('beforeunload', endSession);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('beforeunload', endSession);
      document.removeEventListener('visibilitychange', handleVisibility);
      endSession();
    };
  }, [restaurantId, tableNumber, branchId]);
}
