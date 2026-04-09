
ALTER TABLE public.orders
ADD COLUMN paid_at timestamptz,
ADD COLUMN preparing_at timestamptz,
ADD COLUMN ready_at timestamptz,
ADD COLUMN delivered_at timestamptz;
