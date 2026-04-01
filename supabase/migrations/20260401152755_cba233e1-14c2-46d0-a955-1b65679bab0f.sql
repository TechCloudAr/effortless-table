
-- restaurants
CREATE TABLE public.restaurants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  currency TEXT NOT NULL DEFAULT '$',
  tax_rate NUMERIC NOT NULL DEFAULT 0.16,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read restaurants" ON public.restaurants FOR SELECT USING (true);
CREATE POLICY "Public write restaurants" ON public.restaurants FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update restaurants" ON public.restaurants FOR UPDATE USING (true);
CREATE POLICY "Public delete restaurants" ON public.restaurants FOR DELETE USING (true);
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON public.restaurants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- menu_categories
CREATE TABLE public.menu_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🍽️',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read menu_categories" ON public.menu_categories FOR SELECT USING (true);
CREATE POLICY "Public write menu_categories" ON public.menu_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update menu_categories" ON public.menu_categories FOR UPDATE USING (true);
CREATE POLICY "Public delete menu_categories" ON public.menu_categories FOR DELETE USING (true);
CREATE TRIGGER update_menu_categories_updated_at BEFORE UPDATE ON public.menu_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- menu_items
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.menu_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  image_url TEXT,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  available BOOLEAN NOT NULL DEFAULT true,
  popular BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read menu_items" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Public write menu_items" ON public.menu_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update menu_items" ON public.menu_items FOR UPDATE USING (true);
CREATE POLICY "Public delete menu_items" ON public.menu_items FOR DELETE USING (true);
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- menu_item_option_groups
CREATE TABLE public.menu_item_option_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  required BOOLEAN NOT NULL DEFAULT false,
  max_selections INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.menu_item_option_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read option_groups" ON public.menu_item_option_groups FOR SELECT USING (true);
CREATE POLICY "Public write option_groups" ON public.menu_item_option_groups FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update option_groups" ON public.menu_item_option_groups FOR UPDATE USING (true);
CREATE POLICY "Public delete option_groups" ON public.menu_item_option_groups FOR DELETE USING (true);

-- menu_item_options
CREATE TABLE public.menu_item_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  option_group_id UUID NOT NULL REFERENCES public.menu_item_option_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.menu_item_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read options" ON public.menu_item_options FOR SELECT USING (true);
CREATE POLICY "Public write options" ON public.menu_item_options FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update options" ON public.menu_item_options FOR UPDATE USING (true);
CREATE POLICY "Public delete options" ON public.menu_item_options FOR DELETE USING (true);

-- menu_item_ingredients
CREATE TABLE public.menu_item_ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'g',
  cost_per_unit NUMERIC NOT NULL DEFAULT 0,
  removable BOOLEAN NOT NULL DEFAULT false,
  default_included BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.menu_item_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read ingredients" ON public.menu_item_ingredients FOR SELECT USING (true);
CREATE POLICY "Public write ingredients" ON public.menu_item_ingredients FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update ingredients" ON public.menu_item_ingredients FOR UPDATE USING (true);
CREATE POLICY "Public delete ingredients" ON public.menu_item_ingredients FOR DELETE USING (true);

-- SEED DATA

INSERT INTO public.restaurants (id, name, description, currency, tax_rate) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'Fuego & Sazón', 'Cocina casual con sabor auténtico', '$', 0.16);

INSERT INTO public.menu_categories (id, restaurant_id, name, icon, sort_order) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'Entradas', '🥑', 0),
  ('c0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001', 'Principales', '🔥', 1),
  ('c0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001', 'Bebidas', '🥤', 2),
  ('c0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000001', 'Postres', '🍰', 3),
  ('c0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000001', 'Combos', '🎯', 4);

INSERT INTO public.menu_items (id, category_id, name, description, price, image_url, tags, available, popular) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'Nachos Supremos', 'Totopos crujientes con queso fundido, jalapeños, guacamole y crema.', 149, '/placeholder.svg', '["más vendido"]', true, true),
  ('b0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001', 'Alitas BBQ', 'Alitas de pollo bañadas en salsa BBQ ahumada con apio y aderezo blue cheese.', 169, '/placeholder.svg', '["picante"]', true, false),
  ('b0000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000001', 'Guacamole Fresco', 'Guacamole preparado al momento con totopos artesanales.', 119, '/placeholder.svg', '["vegano","sin gluten"]', true, false),
  ('b0000001-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000002', 'Burger Clásica', 'Doble carne angus, queso cheddar, lechuga, tomate y salsa especial en pan brioche.', 189, '/placeholder.svg', '["más vendido"]', true, true),
  ('b0000001-0000-0000-0000-000000000005', 'c0000001-0000-0000-0000-000000000002', 'Tacos al Pastor', 'Tres tacos de cerdo marinado con piña, cilantro, cebolla y limón.', 159, '/placeholder.svg', '["nuevo"]', true, false),
  ('b0000001-0000-0000-0000-000000000006', 'c0000001-0000-0000-0000-000000000002', 'Bowl Mediterráneo', 'Quinoa, aguacate, garbanzos, tomates cherry, pepino, feta y aderezo de limón.', 169, '/placeholder.svg', '["vegano","sin gluten"]', true, false),
  ('b0000001-0000-0000-0000-000000000007', 'c0000001-0000-0000-0000-000000000002', 'Burrito Supremo', 'Tortilla de harina rellena de arroz, frijoles, carne, queso y pico de gallo.', 175, '/placeholder.svg', '[]', true, false),
  ('b0000001-0000-0000-0000-000000000008', 'c0000001-0000-0000-0000-000000000003', 'Limonada Natural', 'Limonada recién exprimida con hierbabuena.', 55, '/placeholder.svg', '[]', true, false),
  ('b0000001-0000-0000-0000-000000000009', 'c0000001-0000-0000-0000-000000000003', 'Agua de Jamaica', 'Infusión tradicional de jamaica, servida bien fría.', 49, '/placeholder.svg', '["vegano"]', true, false),
  ('b0000001-0000-0000-0000-000000000010', 'c0000001-0000-0000-0000-000000000003', 'Cerveza Artesanal', 'IPA local con notas cítricas y amargor equilibrado. 355ml.', 85, '/placeholder.svg', '[]', true, false),
  ('b0000001-0000-0000-0000-000000000011', 'c0000001-0000-0000-0000-000000000003', 'Smoothie Tropical', 'Mango, piña, plátano y leche de coco.', 75, '/placeholder.svg', '["vegano"]', true, false),
  ('b0000001-0000-0000-0000-000000000012', 'c0000001-0000-0000-0000-000000000004', 'Churros con Chocolate', 'Churros recién hechos espolvoreados con canela y chocolate caliente.', 89, '/placeholder.svg', '["más vendido"]', true, true),
  ('b0000001-0000-0000-0000-000000000013', 'c0000001-0000-0000-0000-000000000004', 'Brownie Caliente', 'Brownie de chocolate oscuro con helado de vainilla y salsa de caramelo.', 99, '/placeholder.svg', '["nuevo"]', true, false),
  ('b0000001-0000-0000-0000-000000000014', 'c0000001-0000-0000-0000-000000000005', 'Combo Fuego', 'Burger Clásica + Papas + Bebida de tu elección. ¡El más popular!', 249, '/placeholder.svg', '["más vendido","ahorro"]', true, true),
  ('b0000001-0000-0000-0000-000000000015', 'c0000001-0000-0000-0000-000000000005', 'Combo Familiar', '2 Burgers + Nachos Supremos + 4 Bebidas. Ideal para compartir.', 599, '/placeholder.svg', '["ahorro"]', true, false);

INSERT INTO public.menu_item_option_groups (id, menu_item_id, name, required, max_selections, sort_order) VALUES
  ('d0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'Agregar proteína', false, 1, 0),
  ('d0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000002', 'Salsa', true, 1, 0),
  ('d0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000004', 'Término', true, 1, 0),
  ('d0000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000004', 'Extras', false, 3, 1),
  ('d0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000005', 'Nivel de picante', false, 1, 0),
  ('d0000001-0000-0000-0000-000000000006', 'b0000001-0000-0000-0000-000000000007', 'Proteína', true, 1, 0),
  ('d0000001-0000-0000-0000-000000000007', 'b0000001-0000-0000-0000-000000000010', 'Estilo', true, 1, 0);

INSERT INTO public.menu_item_options (id, option_group_id, name, price, sort_order) VALUES
  ('e0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 'Pollo', 35, 0),
  ('e0000001-0000-0000-0000-000000000002', 'd0000001-0000-0000-0000-000000000001', 'Res', 45, 1),
  ('e0000001-0000-0000-0000-000000000003', 'd0000001-0000-0000-0000-000000000001', 'Chorizo', 40, 2),
  ('e0000001-0000-0000-0000-000000000004', 'd0000001-0000-0000-0000-000000000002', 'BBQ Clásica', 0, 0),
  ('e0000001-0000-0000-0000-000000000005', 'd0000001-0000-0000-0000-000000000002', 'Buffalo', 0, 1),
  ('e0000001-0000-0000-0000-000000000006', 'd0000001-0000-0000-0000-000000000002', 'Mango Habanero', 0, 2),
  ('e0000001-0000-0000-0000-000000000007', 'd0000001-0000-0000-0000-000000000003', 'Medio', 0, 0),
  ('e0000001-0000-0000-0000-000000000008', 'd0000001-0000-0000-0000-000000000003', 'Tres cuartos', 0, 1),
  ('e0000001-0000-0000-0000-000000000009', 'd0000001-0000-0000-0000-000000000003', 'Bien cocido', 0, 2),
  ('e0000001-0000-0000-0000-000000000010', 'd0000001-0000-0000-0000-000000000004', 'Bacon', 25, 0),
  ('e0000001-0000-0000-0000-000000000011', 'd0000001-0000-0000-0000-000000000004', 'Extra queso', 15, 1),
  ('e0000001-0000-0000-0000-000000000012', 'd0000001-0000-0000-0000-000000000004', 'Huevo frito', 20, 2),
  ('e0000001-0000-0000-0000-000000000013', 'd0000001-0000-0000-0000-000000000004', 'Aguacate', 25, 3),
  ('e0000001-0000-0000-0000-000000000014', 'd0000001-0000-0000-0000-000000000005', 'Suave', 0, 0),
  ('e0000001-0000-0000-0000-000000000015', 'd0000001-0000-0000-0000-000000000005', 'Medio', 0, 1),
  ('e0000001-0000-0000-0000-000000000016', 'd0000001-0000-0000-0000-000000000005', '¡Máximo!', 0, 2),
  ('e0000001-0000-0000-0000-000000000017', 'd0000001-0000-0000-0000-000000000006', 'Pollo', 0, 0),
  ('e0000001-0000-0000-0000-000000000018', 'd0000001-0000-0000-0000-000000000006', 'Res', 15, 1),
  ('e0000001-0000-0000-0000-000000000019', 'd0000001-0000-0000-0000-000000000006', 'Carnitas', 10, 2),
  ('e0000001-0000-0000-0000-000000000020', 'd0000001-0000-0000-0000-000000000007', 'IPA', 0, 0),
  ('e0000001-0000-0000-0000-000000000021', 'd0000001-0000-0000-0000-000000000007', 'Lager', 0, 1),
  ('e0000001-0000-0000-0000-000000000022', 'd0000001-0000-0000-0000-000000000007', 'Stout', 10, 2);

INSERT INTO public.menu_item_ingredients (menu_item_id, name, quantity, unit, cost_per_unit, removable, default_included) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'Totopos', 150, 'g', 0.08, false, true),
  ('b0000001-0000-0000-0000-000000000001', 'Queso fundido', 80, 'g', 0.12, false, true),
  ('b0000001-0000-0000-0000-000000000001', 'Jalapeños', 30, 'g', 0.05, true, true),
  ('b0000001-0000-0000-0000-000000000001', 'Guacamole', 60, 'g', 0.15, false, true),
  ('b0000001-0000-0000-0000-000000000001', 'Crema', 40, 'ml', 0.06, true, true),
  ('b0000001-0000-0000-0000-000000000002', 'Alitas de pollo', 350, 'g', 0.12, false, true),
  ('b0000001-0000-0000-0000-000000000002', 'Salsa BBQ', 60, 'ml', 0.08, false, true),
  ('b0000001-0000-0000-0000-000000000002', 'Apio', 40, 'g', 0.03, true, true),
  ('b0000001-0000-0000-0000-000000000002', 'Aderezo blue cheese', 30, 'ml', 0.15, true, true),
  ('b0000001-0000-0000-0000-000000000003', 'Aguacate', 200, 'g', 0.10, false, true),
  ('b0000001-0000-0000-0000-000000000003', 'Tomate', 40, 'g', 0.04, true, true),
  ('b0000001-0000-0000-0000-000000000003', 'Cebolla', 20, 'g', 0.03, true, true),
  ('b0000001-0000-0000-0000-000000000003', 'Cilantro', 10, 'g', 0.05, true, true),
  ('b0000001-0000-0000-0000-000000000003', 'Limón', 15, 'ml', 0.04, false, true),
  ('b0000001-0000-0000-0000-000000000003', 'Totopos artesanales', 100, 'g', 0.09, false, true),
  ('b0000001-0000-0000-0000-000000000004', 'Pan brioche', 1, 'unidad', 8.00, false, true),
  ('b0000001-0000-0000-0000-000000000004', 'Carne angus (doble)', 250, 'g', 0.14, false, true),
  ('b0000001-0000-0000-0000-000000000004', 'Queso cheddar', 40, 'g', 0.12, true, true),
  ('b0000001-0000-0000-0000-000000000004', 'Lechuga', 30, 'g', 0.03, true, true),
  ('b0000001-0000-0000-0000-000000000004', 'Tomate', 40, 'g', 0.04, true, true),
  ('b0000001-0000-0000-0000-000000000004', 'Salsa especial', 20, 'ml', 0.10, true, true),
  ('b0000001-0000-0000-0000-000000000004', 'Cebolla', 20, 'g', 0.03, true, true),
  ('b0000001-0000-0000-0000-000000000005', 'Tortillas', 3, 'unidad', 2.00, false, true),
  ('b0000001-0000-0000-0000-000000000005', 'Cerdo marinado', 180, 'g', 0.14, false, true),
  ('b0000001-0000-0000-0000-000000000005', 'Piña', 40, 'g', 0.05, true, true),
  ('b0000001-0000-0000-0000-000000000005', 'Cilantro', 10, 'g', 0.05, true, true),
  ('b0000001-0000-0000-0000-000000000005', 'Cebolla', 20, 'g', 0.03, true, true),
  ('b0000001-0000-0000-0000-000000000005', 'Limón', 1, 'unidad', 1.50, false, true),
  ('b0000001-0000-0000-0000-000000000006', 'Quinoa', 120, 'g', 0.10, false, true),
  ('b0000001-0000-0000-0000-000000000006', 'Aguacate', 80, 'g', 0.10, true, true),
  ('b0000001-0000-0000-0000-000000000006', 'Garbanzos', 60, 'g', 0.06, true, true),
  ('b0000001-0000-0000-0000-000000000006', 'Tomates cherry', 50, 'g', 0.08, true, true),
  ('b0000001-0000-0000-0000-000000000006', 'Pepino', 40, 'g', 0.03, true, true),
  ('b0000001-0000-0000-0000-000000000006', 'Queso feta', 30, 'g', 0.20, true, true),
  ('b0000001-0000-0000-0000-000000000006', 'Aderezo de limón', 20, 'ml', 0.10, false, true),
  ('b0000001-0000-0000-0000-000000000007', 'Tortilla de harina', 1, 'unidad', 5.00, false, true),
  ('b0000001-0000-0000-0000-000000000007', 'Arroz', 100, 'g', 0.04, false, true),
  ('b0000001-0000-0000-0000-000000000007', 'Frijoles', 80, 'g', 0.05, true, true),
  ('b0000001-0000-0000-0000-000000000007', 'Queso', 40, 'g', 0.12, true, true),
  ('b0000001-0000-0000-0000-000000000007', 'Pico de gallo', 40, 'g', 0.06, true, true),
  ('b0000001-0000-0000-0000-000000000007', 'Crema', 20, 'ml', 0.06, true, true),
  ('b0000001-0000-0000-0000-000000000008', 'Limón', 3, 'unidad', 1.50, false, true),
  ('b0000001-0000-0000-0000-000000000008', 'Azúcar', 30, 'g', 0.02, false, true),
  ('b0000001-0000-0000-0000-000000000008', 'Hierbabuena', 5, 'g', 0.10, true, true),
  ('b0000001-0000-0000-0000-000000000008', 'Hielo', 200, 'g', 0.01, false, true),
  ('b0000001-0000-0000-0000-000000000009', 'Flor de jamaica', 20, 'g', 0.25, false, true),
  ('b0000001-0000-0000-0000-000000000009', 'Azúcar', 40, 'g', 0.02, false, true),
  ('b0000001-0000-0000-0000-000000000009', 'Hielo', 200, 'g', 0.01, false, true),
  ('b0000001-0000-0000-0000-000000000010', 'Cerveza artesanal 355ml', 1, 'unidad', 35.00, false, true),
  ('b0000001-0000-0000-0000-000000000011', 'Mango', 80, 'g', 0.08, false, true),
  ('b0000001-0000-0000-0000-000000000011', 'Piña', 60, 'g', 0.05, false, true),
  ('b0000001-0000-0000-0000-000000000011', 'Plátano', 1, 'unidad', 3.00, false, true),
  ('b0000001-0000-0000-0000-000000000011', 'Leche de coco', 150, 'ml', 0.06, false, true),
  ('b0000001-0000-0000-0000-000000000012', 'Masa de churro', 150, 'g', 0.06, false, true),
  ('b0000001-0000-0000-0000-000000000012', 'Canela', 5, 'g', 0.20, false, true),
  ('b0000001-0000-0000-0000-000000000012', 'Chocolate caliente', 80, 'ml', 0.15, false, true),
  ('b0000001-0000-0000-0000-000000000012', 'Azúcar', 20, 'g', 0.02, false, true),
  ('b0000001-0000-0000-0000-000000000013', 'Brownie de chocolate', 1, 'unidad', 18.00, false, true),
  ('b0000001-0000-0000-0000-000000000013', 'Helado de vainilla', 80, 'g', 0.10, true, true),
  ('b0000001-0000-0000-0000-000000000013', 'Salsa de caramelo', 30, 'ml', 0.12, true, true),
  ('b0000001-0000-0000-0000-000000000014', 'Burger Clásica', 1, 'unidad', 62.00, false, true),
  ('b0000001-0000-0000-0000-000000000014', 'Papas fritas', 150, 'g', 0.06, false, true),
  ('b0000001-0000-0000-0000-000000000014', 'Bebida', 1, 'unidad', 12.00, false, true),
  ('b0000001-0000-0000-0000-000000000015', '2 Burgers Clásicas', 1, 'unidad', 124.00, false, true),
  ('b0000001-0000-0000-0000-000000000015', 'Nachos Supremos', 1, 'unidad', 42.00, false, true),
  ('b0000001-0000-0000-0000-000000000015', '4 Bebidas', 1, 'unidad', 48.00, false, true);
