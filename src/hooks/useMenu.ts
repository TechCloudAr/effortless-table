// @refresh reset
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { MenuCategory, MenuItem, MenuItemOptionGroup, MenuItemOption } from '@/types/restaurant';
import type { Ingredient } from '@/types/restaurant';
import { categories as mockCategories, menuItems as mockMenuItems } from '@/data/mockData';

export function useMenu(restaurantId?: string) {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [ingredients, setIngredients] = useState<Record<string, Ingredient[]>>({});
  const [loading, setLoading] = useState(true);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      let catQuery = supabase.from('menu_categories').select('*').order('sort_order');
      if (restaurantId) catQuery = catQuery.eq('restaurant_id', restaurantId);

      const [catRes, itemRes, groupRes, optRes, ingRes] = await Promise.all([
        catQuery,
        supabase.from('menu_items').select('*').order('sort_order'),
        supabase.from('menu_item_option_groups').select('*').order('sort_order'),
        supabase.from('menu_item_options').select('*').order('sort_order'),
        supabase.from('menu_item_ingredients').select('*'),
      ]);

      if (catRes.error || itemRes.error || groupRes.error || optRes.error || ingRes.error) {
        console.error('Error fetching menu data');
        setLoading(false);
        return;
      }

      // Map categories
      const cats: MenuCategory[] = (catRes.data || []).map(c => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        order: c.sort_order,
      }));

      // Build option groups map: menuItemId -> groups[]
      const optionsByGroup: Record<string, MenuItemOption[]> = {};
      for (const o of (optRes.data || [])) {
        if (!optionsByGroup[o.option_group_id]) optionsByGroup[o.option_group_id] = [];
        optionsByGroup[o.option_group_id].push({
          id: o.id,
          name: o.name,
          price: Number(o.price),
        });
      }

      const groupsByItem: Record<string, MenuItemOptionGroup[]> = {};
      for (const g of (groupRes.data || [])) {
        if (!groupsByItem[g.menu_item_id]) groupsByItem[g.menu_item_id] = [];
        groupsByItem[g.menu_item_id].push({
          id: g.id,
          name: g.name,
          required: g.required,
          maxSelections: g.max_selections,
          options: optionsByGroup[g.id] || [],
        });
      }

      // Build ingredients map
      const ingMap: Record<string, Ingredient[]> = {};
      for (const i of (ingRes.data || [])) {
        if (!ingMap[i.menu_item_id]) ingMap[i.menu_item_id] = [];
        ingMap[i.menu_item_id].push({
          id: i.id,
          name: i.name,
          quantity: Number(i.quantity),
          unit: i.unit,
          costPerUnit: Number(i.cost_per_unit),
          removable: i.removable,
          defaultIncluded: i.default_included,
        });
      }

      // Map menu items
      const items: MenuItem[] = (itemRes.data || []).map(i => ({
        id: i.id,
        categoryId: i.category_id,
        name: i.name,
        description: i.description || '',
        price: Number(i.price),
        image: i.image_url || '/placeholder.svg',
        tags: Array.isArray(i.tags) ? (i.tags as string[]) : [],
        available: i.available,
        popular: i.popular,
        optionGroups: groupsByItem[i.id] || undefined,
      }));

      setCategories(cats);
      setMenuItems(items);
      setIngredients(ingMap);
    } catch (err) {
      console.error('Error loading menu:', err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchMenu(); }, [restaurantId]);

  return { categories, menuItems, ingredients, loading, refetch: fetchMenu };
}
