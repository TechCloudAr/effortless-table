
-- Table for per-branch menu overrides
CREATE TABLE public.branch_menu_overrides (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  menu_item_id uuid NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  available_override boolean DEFAULT true,
  price_override numeric DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (branch_id, menu_item_id)
);

-- Enable RLS
ALTER TABLE public.branch_menu_overrides ENABLE ROW LEVEL SECURITY;

-- Anyone can read overrides (needed for customer menu)
CREATE POLICY "Anyone can read branch_menu_overrides"
  ON public.branch_menu_overrides FOR SELECT
  USING (true);

-- Owners can manage overrides for their branches
CREATE POLICY "Owners can insert branch_menu_overrides"
  ON public.branch_menu_overrides FOR INSERT
  TO authenticated
  WITH CHECK (user_owns_branch(branch_id));

CREATE POLICY "Owners can update branch_menu_overrides"
  ON public.branch_menu_overrides FOR UPDATE
  TO authenticated
  USING (user_owns_branch(branch_id));

CREATE POLICY "Owners can delete branch_menu_overrides"
  ON public.branch_menu_overrides FOR DELETE
  TO authenticated
  USING (user_owns_branch(branch_id));

-- Auto-update updated_at
CREATE TRIGGER update_branch_menu_overrides_updated_at
  BEFORE UPDATE ON public.branch_menu_overrides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
