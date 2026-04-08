
-- Add tracking columns
ALTER TABLE public.table_sessions 
  ADD COLUMN has_orders BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN last_order_delivered_at TIMESTAMP WITH TIME ZONE;

-- Updated expiry function: 
-- 1) Sessions without orders expire after 3h of inactivity (browsing only)
-- 2) Sessions WITH orders expire 30min after last order delivered
CREATE OR REPLACE FUNCTION public.expire_stale_table_sessions()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  -- Expire browse-only sessions (no orders) older than 3 hours
  UPDATE public.table_sessions
  SET is_active = false, ended_at = now()
  WHERE is_active = true 
    AND has_orders = false 
    AND created_at < now() - interval '3 hours';

  -- Expire sessions where last order was delivered 30+ min ago
  UPDATE public.table_sessions
  SET is_active = false, ended_at = now()
  WHERE is_active = true 
    AND has_orders = true 
    AND last_order_delivered_at IS NOT NULL
    AND last_order_delivered_at < now() - interval '30 minutes';
$$;
