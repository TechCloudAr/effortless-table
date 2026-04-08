
-- Fix ingredients: owner check via menu_item -> category -> restaurant
CREATE OR REPLACE FUNCTION public.user_owns_menu_item_by_id(_menu_item_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.menu_items mi
    JOIN public.menu_categories mc ON mc.id = mi.category_id
    JOIN public.restaurants r ON r.id = mc.restaurant_id
    WHERE mi.id = _menu_item_id AND r.owner_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.user_owns_option_group(_option_group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.menu_item_option_groups og
    JOIN public.menu_items mi ON mi.id = og.menu_item_id
    JOIN public.menu_categories mc ON mc.id = mi.category_id
    JOIN public.restaurants r ON r.id = mc.restaurant_id
    WHERE og.id = _option_group_id AND r.owner_id = auth.uid()
  );
$$;

-- Fix ingredients RLS
DROP POLICY IF EXISTS "Owners can manage ingredients" ON public.menu_item_ingredients;

CREATE POLICY "Owners can insert ingredients"
  ON public.menu_item_ingredients FOR INSERT
  TO authenticated
  WITH CHECK (public.user_owns_menu_item_by_id(menu_item_id));

CREATE POLICY "Owners can update ingredients"
  ON public.menu_item_ingredients FOR UPDATE
  TO authenticated
  USING (public.user_owns_menu_item_by_id(menu_item_id));

CREATE POLICY "Owners can delete ingredients"
  ON public.menu_item_ingredients FOR DELETE
  TO authenticated
  USING (public.user_owns_menu_item_by_id(menu_item_id));

-- Fix option_groups RLS
DROP POLICY IF EXISTS "Owners can manage option_groups" ON public.menu_item_option_groups;

CREATE POLICY "Owners can insert option_groups"
  ON public.menu_item_option_groups FOR INSERT
  TO authenticated
  WITH CHECK (public.user_owns_menu_item_by_id(menu_item_id));

CREATE POLICY "Owners can update option_groups"
  ON public.menu_item_option_groups FOR UPDATE
  TO authenticated
  USING (public.user_owns_menu_item_by_id(menu_item_id));

CREATE POLICY "Owners can delete option_groups"
  ON public.menu_item_option_groups FOR DELETE
  TO authenticated
  USING (public.user_owns_menu_item_by_id(menu_item_id));

-- Fix options RLS
DROP POLICY IF EXISTS "Owners can manage options" ON public.menu_item_options;

CREATE POLICY "Owners can insert options"
  ON public.menu_item_options FOR INSERT
  TO authenticated
  WITH CHECK (public.user_owns_option_group(option_group_id));

CREATE POLICY "Owners can update options"
  ON public.menu_item_options FOR UPDATE
  TO authenticated
  USING (public.user_owns_option_group(option_group_id));

CREATE POLICY "Owners can delete options"
  ON public.menu_item_options FOR DELETE
  TO authenticated
  USING (public.user_owns_option_group(option_group_id));
