import { createContext, useContext, useState, ReactNode } from 'react';

export type Period = 'today' | '7d' | '30d' | 'all';

interface PeriodContextType {
  period: Period;
  setPeriod: (p: Period) => void;
  filterByPeriod: <T extends { created_at: string }>(items: T[]) => T[];
}

const PeriodContext = createContext<PeriodContextType | undefined>(undefined);

const MS: Record<Period, number> = {
  today: 86400000,
  '7d': 604800000,
  '30d': 2592000000,
  all: 0,
};

export function PeriodProvider({ children }: { children: ReactNode }) {
  const [period, setPeriod] = useState<Period>('30d');

  const filterByPeriod = <T extends { created_at: string }>(items: T[]): T[] => {
    if (period === 'all') return items;
    const cutoff = Date.now() - MS[period];
    return items.filter(item => new Date(item.created_at).getTime() >= cutoff);
  };

  return (
    <PeriodContext.Provider value={{ period, setPeriod, filterByPeriod }}>
      {children}
    </PeriodContext.Provider>
  );
}

export function usePeriod() {
  const ctx = useContext(PeriodContext);
  if (!ctx) throw new Error('usePeriod must be used within PeriodProvider');
  return ctx;
}
