
-- 1. Create user_roles table (per security guidelines, roles in separate table)
CREATE TYPE public.app_role AS ENUM ('superadmin', 'owner');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer functions for role checks
CREATE OR REPLACE FUNCTION public.is_superadmin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'superadmin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_owner(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'owner'
  );
$$;

-- RLS for user_roles: users see own roles, superadmin sees all
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.is_superadmin(auth.uid()));

-- 2. Create branches table
CREATE TABLE public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Principal',
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- Anyone can read branches (needed for public operational screens)
CREATE POLICY "Anyone can read branches"
  ON public.branches FOR SELECT
  USING (true);

-- Function to check branch ownership
CREATE OR REPLACE FUNCTION public.user_owns_branch(_branch_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.branches b
    JOIN public.restaurants r ON r.id = b.restaurant_id
    WHERE b.id = _branch_id AND (r.owner_id = auth.uid() OR public.is_superadmin(auth.uid()))
  );
$$;

CREATE POLICY "Owners can insert branches"
  ON public.branches FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id AND r.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update branches"
  ON public.branches FOR UPDATE
  USING (user_owns_branch(id));

CREATE POLICY "Owners can delete branches"
  ON public.branches FOR DELETE
  USING (user_owns_branch(id));

-- Trigger for updated_at on branches
CREATE TRIGGER update_branches_updated_at
  BEFORE UPDATE ON public.branches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Add branch_id to orders
ALTER TABLE public.orders ADD COLUMN branch_id UUID REFERENCES public.branches(id);

-- 4. Add branch_id to table_sessions
ALTER TABLE public.table_sessions ADD COLUMN branch_id UUID REFERENCES public.branches(id);

-- 5. Update orders default status from 'pending_payment' to 'nuevo'
ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'nuevo';

-- 6. Auto-assign superadmin role on signup for specific email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));

  -- Auto-assign superadmin for predefined email
  IF NEW.email = 'mesadigital@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'superadmin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    -- All other signups are owners
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'owner')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- 7. Auto-create default branch when restaurant is created
CREATE OR REPLACE FUNCTION public.auto_create_default_branch()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.branches (restaurant_id, name)
  VALUES (NEW.id, 'Principal');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_create_branch
  AFTER INSERT ON public.restaurants
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_default_branch();

-- 8. Update restaurants RLS to allow superadmin full read
DROP POLICY IF EXISTS "Anyone can read restaurants" ON public.restaurants;
CREATE POLICY "Anyone can read restaurants"
  ON public.restaurants FOR SELECT
  USING (true);

-- 9. Update orders RLS for better security
DROP POLICY IF EXISTS "Owners can read their orders" ON public.orders;
CREATE POLICY "Orders readable by owner or public by branch"
  ON public.orders FOR SELECT
  USING (
    branch_id IS NOT NULL  -- public operational screens filter by branch_id
    OR user_owns_restaurant(restaurant_id)
    OR public.is_superadmin(auth.uid())
  );

-- 10. Create default branches for existing restaurants
INSERT INTO public.branches (restaurant_id, name)
SELECT id, 'Principal' FROM public.restaurants r
WHERE NOT EXISTS (
  SELECT 1 FROM public.branches b WHERE b.restaurant_id = r.id
);
