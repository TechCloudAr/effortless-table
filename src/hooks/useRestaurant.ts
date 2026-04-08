import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Restaurant } from '@/types/restaurant';
import { restaurant as mockRestaurant } from '@/data/mockData';

export function useRestaurant(restaurantId?: string) {
  const [restaurant, setRestaurant] = useState<Restaurant>(mockRestaurant);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      let query = supabase.from('restaurants').select('*');

      if (restaurantId) {
        query = query.eq('id', restaurantId);
      }

      const { data, error } = await query.limit(1).single();

      if (!error && data) {
        setRestaurant({
          id: data.id,
          name: data.name,
          description: data.description || '',
          currency: data.currency,
          taxRate: Number(data.tax_rate),
          logo: data.logo_url || undefined,
        });
      }
      setLoading(false);
    }
    fetch();
  }, [restaurantId]);

  return { restaurant, loading };
}
