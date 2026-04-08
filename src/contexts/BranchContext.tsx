import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export interface Branch {
  id: string;
  name: string;
  address: string | null;
  is_active: boolean;
  restaurant_id: string;
}

interface BranchContextType {
  branches: Branch[];
  activeBranch: Branch | null;
  setActiveBranchId: (id: string) => void;
  loading: boolean;
  refetch: () => Promise<void>;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: ReactNode }) {
  const { restaurantId } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBranches = async () => {
    if (!restaurantId) {
      setBranches([]);
      setActiveBranchId(null);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('branches')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: true });

    const list = (data ?? []) as Branch[];
    setBranches(list);

    if (!activeBranchId || !list.find(b => b.id === activeBranchId)) {
      setActiveBranchId(list[0]?.id ?? null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBranches();
  }, [restaurantId]);

  const activeBranch = branches.find(b => b.id === activeBranchId) ?? null;

  return (
    <BranchContext.Provider value={{ branches, activeBranch, setActiveBranchId, loading, refetch: fetchBranches }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const ctx = useContext(BranchContext);
  if (!ctx) throw new Error('useBranch must be used within BranchProvider');
  return ctx;
}
