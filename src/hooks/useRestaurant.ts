import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Restaurant } from '@/types/restaurant';
import { restaurant as mockRestaurant } from '@/data/mockData';

export function useRestaurant() {
  const [restaurant, setRestaurant] = useState<Restaurant>(mockRestaurant);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .limit(1)
        .single();

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
  }, []);

  return { restaurant, loading };
}
