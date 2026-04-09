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
  /** null = "Todas las sucursales" */
  activeBranchId: string | null;
  activeBranch: Branch | null;
  /** Pass null to select "Todas" */
  setActiveBranchId: (id: string | null) => void;
  loading: boolean;
  refetch: () => Promise<void>;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: ReactNode }) {
  const { restaurantId } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  // null means "all branches"
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

    // Keep activeBranchId as-is (null = todas). Only reset if selected branch no longer exists
    if (activeBranchId !== null && !list.find(b => b.id === activeBranchId)) {
      setActiveBranchId(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBranches();
  }, [restaurantId]);

  const activeBranch = activeBranchId ? branches.find(b => b.id === activeBranchId) ?? null : null;

  return (
    <BranchContext.Provider value={{ branches, activeBranchId, activeBranch, setActiveBranchId, loading, refetch: fetchBranches }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const ctx = useContext(BranchContext);
  if (!ctx) throw new Error('useBranch must be used within BranchProvider');
  return ctx;
}
