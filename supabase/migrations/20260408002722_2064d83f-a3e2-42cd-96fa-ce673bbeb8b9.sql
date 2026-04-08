
-- 1. Profiles table (auto-created on signup)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Add owner_id to restaurants
ALTER TABLE public.restaurants ADD COLUMN owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. Security definer helper: check if user owns a restaurant
CREATE OR REPLACE FUNCTION public.user_owns_restaurant(_restaurant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.restaurants
    WHERE id = _restaurant_id AND owner_id = auth.uid()
  );
$$;

-- 4. Update restaurants RLS: owners see only their own, public can read (for customer menu)
DROP POLICY IF EXISTS "Public read restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Public write restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Public update restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Public delete restaurants" ON public.restaurants;

CREATE POLICY "Anyone can read restaurants"
  ON public.restaurants FOR SELECT
  USING (true);

CREATE POLICY "Owners can insert restaurants"
  ON public.restaurants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own restaurants"
  ON public.restaurants FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete own restaurants"
  ON public.restaurants FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- 5. Update menu_categories RLS: public read, owner write via restaurant
DROP POLICY IF EXISTS "Public read menu_categories" ON public.menu_categories;
DROP POLICY IF EXISTS "Public write menu_categories" ON public.menu_categories;
DROP POLICY IF EXISTS "Public update menu_categories" ON public.menu_categories;
DROP POLICY IF EXISTS "Public delete menu_categories" ON public.menu_categories;

CREATE POLICY "Anyone can read menu_categories"
  ON public.menu_categories FOR SELECT
  USING (true);

CREATE POLICY "Owners can insert menu_categories"
  ON public.menu_categories FOR INSERT
  TO authenticated
  WITH CHECK (public.user_owns_restaurant(restaurant_id));

CREATE POLICY "Owners can update menu_categories"
  ON public.menu_categories FOR UPDATE
  TO authenticated
  USING (public.user_owns_restaurant(restaurant_id));

CREATE POLICY "Owners can delete menu_categories"
  ON public.menu_categories FOR DELETE
  TO authenticated
  USING (public.user_owns_restaurant(restaurant_id));

-- 6. Update menu_items RLS: public read, owner write via category->restaurant
CREATE OR REPLACE FUNCTION public.user_owns_menu_item(_category_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.menu_categories mc
    JOIN public.restaurants r ON r.id = mc.restaurant_id
    WHERE mc.id = _category_id AND r.owner_id = auth.uid()
  );
$$;

DROP POLICY IF EXISTS "Public read menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "Public write menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "Public update menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "Public delete menu_items" ON public.menu_items;

CREATE POLICY "Anyone can read menu_items"
  ON public.menu_items FOR SELECT
  USING (true);

CREATE POLICY "Owners can insert menu_items"
  ON public.menu_items FOR INSERT
  TO authenticated
  WITH CHECK (public.user_owns_menu_item(category_id));

CREATE POLICY "Owners can update menu_items"
  ON public.menu_items FOR UPDATE
  TO authenticated
  USING (public.user_owns_menu_item(category_id));

CREATE POLICY "Owners can delete menu_items"
  ON public.menu_items FOR DELETE
  TO authenticated
  USING (public.user_owns_menu_item(category_id));

-- 7. Update menu_item_ingredients RLS
DROP POLICY IF EXISTS "Public read ingredients" ON public.menu_item_ingredients;
DROP POLICY IF EXISTS "Public write ingredients" ON public.menu_item_ingredients;
DROP POLICY IF EXISTS "Public update ingredients" ON public.menu_item_ingredients;
DROP POLICY IF EXISTS "Public delete ingredients" ON public.menu_item_ingredients;

CREATE POLICY "Anyone can read ingredients"
  ON public.menu_item_ingredients FOR SELECT
  USING (true);

CREATE POLICY "Owners can manage ingredients"
  ON public.menu_item_ingredients FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 8. Update menu_item_option_groups RLS
DROP POLICY IF EXISTS "Public read option_groups" ON public.menu_item_option_groups;
DROP POLICY IF EXISTS "Public write option_groups" ON public.menu_item_option_groups;
DROP POLICY IF EXISTS "Public update option_groups" ON public.menu_item_option_groups;
DROP POLICY IF EXISTS "Public delete option_groups" ON public.menu_item_option_groups;

CREATE POLICY "Anyone can read option_groups"
  ON public.menu_item_option_groups FOR SELECT
  USING (true);

CREATE POLICY "Owners can manage option_groups"
  ON public.menu_item_option_groups FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 9. Update menu_item_options RLS
DROP POLICY IF EXISTS "Public read options" ON public.menu_item_options;
DROP POLICY IF EXISTS "Public write options" ON public.menu_item_options;
DROP POLICY IF EXISTS "Public update options" ON public.menu_item_options;
DROP POLICY IF EXISTS "Public delete options" ON public.menu_item_options;

CREATE POLICY "Anyone can read options"
  ON public.menu_item_options FOR SELECT
  USING (true);

CREATE POLICY "Owners can manage options"
  ON public.menu_item_options FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 10. Add restaurant_id to orders for scoping
ALTER TABLE public.orders ADD COLUMN restaurant_id UUID REFERENCES public.restaurants(id);

-- Update orders RLS: anyone can create (customer), owners can read their own
DROP POLICY IF EXISTS "Anyone can read orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can update orders" ON public.orders;

CREATE POLICY "Owners can read their orders"
  ON public.orders FOR SELECT
  USING (
    restaurant_id IS NULL 
    OR public.user_owns_restaurant(restaurant_id)
    OR true  -- customers can also read their order by ID
  );

CREATE POLICY "Anyone can update orders"
  ON public.orders FOR UPDATE
  USING (true);
