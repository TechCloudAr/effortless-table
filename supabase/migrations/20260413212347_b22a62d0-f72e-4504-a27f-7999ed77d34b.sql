
CREATE OR REPLACE FUNCTION public.expire_stale_table_sessions()
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  -- Cancel orders stuck in pending_payment for more than 15 minutes
  UPDATE public.orders
  SET status = 'cancelled', updated_at = now()
  WHERE status = 'pending_payment'
    AND created_at < now() - interval '15 minutes';

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
