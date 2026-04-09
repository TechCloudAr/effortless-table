import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useBranch } from '@/contexts/BranchContext';
import type { Ingredient } from '@/types/restaurant';

interface OrderRow {
  id: string;
  table_number: number;
  items: any;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  created_at: string;
  branch_id: string | null;
}

export interface SalesStats {
  totalRevenue: number;
  totalOrders: number;
  avgTicket: number;
  activeOrders: OrderRow[];
  ordersByTable: Record<number, OrderRow[]>;
  ordersByBranch: Record<string, OrderRow[]>;
  productSales: Record<string, { sold: number; revenue: number }>;
  orders: OrderRow[];
}

export function useSalesData() {
  const { restaurantId } = useAuth();
  const { activeBranchId } = useBranch();
  const [allOrders, setAllOrders] = useState<OrderRow[]>([]);
  const [ingredients, setIngredients] = useState<Record<string, Ingredient[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      let ordersQuery = supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (restaurantId) ordersQuery = ordersQuery.eq('restaurant_id', restaurantId);

      const [ordersRes, ingRes] = await Promise.all([
        ordersQuery,
        supabase.from('menu_item_ingredients').select('*'),
      ]);

      if (ordersRes.data) setAllOrders(ordersRes.data as OrderRow[]);

      if (ingRes.data) {
        const map: Record<string, Ingredient[]> = {};
        for (const i of ingRes.data) {
          if (!map[i.menu_item_id]) map[i.menu_item_id] = [];
          map[i.menu_item_id].push({
            id: i.id,
            name: i.name,
            quantity: Number(i.quantity),
            unit: i.unit,
            costPerUnit: Number(i.cost_per_unit),
            removable: i.removable,
            defaultIncluded: i.default_included,
          });
        }
        setIngredients(map);
      }
      setLoading(false);
    }
    fetch();
  }, [restaurantId]);

  // Filter orders by active branch
  const orders = useMemo(() => {
    if (!activeBranchId) return allOrders; // null = todas
    return allOrders.filter(o => o.branch_id === activeBranchId);
  }, [allOrders, activeBranchId]);

  const stats = useMemo<SalesStats>(() => {
    const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
    const totalOrders = orders.length;
    const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));

    const ordersByTable: Record<number, OrderRow[]> = {};
    for (const o of orders) {
      if (!ordersByTable[o.table_number]) ordersByTable[o.table_number] = [];
      ordersByTable[o.table_number].push(o);
    }

    const productSales: Record<string, { sold: number; revenue: number }> = {};
    for (const order of orders) {
      const items = Array.isArray(order.items) ? order.items : [];
      for (const item of items) {
        const id = (item as any)?.menuItem?.id || (item as any)?.id || 'unknown';
        const qty = (item as any)?.quantity || 1;
        const price = ((item as any)?.unitPrice || (item as any)?.menuItem?.price || 0) * qty;
        if (!productSales[id]) productSales[id] = { sold: 0, revenue: 0 };
        productSales[id].sold += qty;
        productSales[id].revenue += price;
      }
    }

    return { totalRevenue, totalOrders, avgTicket, activeOrders, ordersByTable, productSales, orders };
  }, [orders]);

  const getProductCost = (menuItemId: string): number => {
    const ings = ingredients[menuItemId] || [];
    return ings.reduce((sum, ing) => sum + ing.quantity * ing.costPerUnit, 0);
  };

  return { stats, ingredients, loading, getProductCost };
}
