
CREATE OR REPLACE FUNCTION public.sync_table_session_on_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.table_sessions
  SET has_orders = true
  WHERE restaurant_id = NEW.restaurant_id
    AND table_number = NEW.table_number
    AND is_active = true;

  IF NEW.status IN ('entregado', 'delivered', 'cancelled') THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.orders
      WHERE restaurant_id = NEW.restaurant_id
        AND table_number = NEW.table_number
        AND status NOT IN ('entregado', 'delivered', 'cancelled')
        AND id != NEW.id
    ) THEN
      UPDATE public.table_sessions
      SET last_order_delivered_at = now()
      WHERE restaurant_id = NEW.restaurant_id
        AND table_number = NEW.table_number
        AND is_active = true;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
