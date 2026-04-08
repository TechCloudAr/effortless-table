
-- Trigger function: when an order is inserted/updated, sync the table session
CREATE OR REPLACE FUNCTION public.sync_table_session_on_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Mark the active session for this table as having orders
  UPDATE public.table_sessions
  SET has_orders = true
  WHERE restaurant_id = NEW.restaurant_id
    AND table_number = NEW.table_number
    AND is_active = true;

  -- If all orders for this table are delivered/cancelled, stamp last_order_delivered_at
  IF NEW.status IN ('delivered', 'cancelled') THEN
    -- Check if there are remaining active orders for this table
    IF NOT EXISTS (
      SELECT 1 FROM public.orders
      WHERE restaurant_id = NEW.restaurant_id
        AND table_number = NEW.table_number
        AND status NOT IN ('delivered', 'cancelled')
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

-- Attach trigger to orders table
CREATE TRIGGER trg_sync_table_session
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_table_session_on_order();
