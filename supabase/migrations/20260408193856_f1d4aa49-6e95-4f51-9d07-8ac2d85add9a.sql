
-- Table to track active table sessions (QR scan = occupied)
CREATE TABLE public.table_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  table_number INTEGER NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.table_sessions ENABLE ROW LEVEL SECURITY;

-- Anyone can create a session (customers are anonymous)
CREATE POLICY "Anyone can create table_sessions"
  ON public.table_sessions FOR INSERT
  WITH CHECK (true);

-- Anyone can read table_sessions  
CREATE POLICY "Anyone can read table_sessions"
  ON public.table_sessions FOR SELECT
  USING (true);

-- Anyone can update table_sessions (to end session)
CREATE POLICY "Anyone can update table_sessions"
  ON public.table_sessions FOR UPDATE
  USING (true);

-- Index for fast lookup of active sessions per restaurant
CREATE INDEX idx_table_sessions_active ON public.table_sessions (restaurant_id, table_number, is_active) WHERE is_active = true;

-- Auto-expire stale sessions older than 3 hours
CREATE OR REPLACE FUNCTION public.expire_stale_table_sessions()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.table_sessions
  SET is_active = false, ended_at = now()
  WHERE is_active = true AND created_at < now() - interval '3 hours';
$$;
