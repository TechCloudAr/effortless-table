import { useState, useEffect, useRef, useMemo } from 'react';
import { ShoppingBag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatARS, STATUS_LABELS, STATUS_COLORS, ACTIVE_STATUSES } from './utils';

interface SALiveOrdersProps {
  restaurants: any[];
  orders: any[];
  setOrders: React.Dispatch<React.SetStateAction<any[]>>;
}

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.value = 0.3;
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {}
}

export default function SALiveOrders({ restaurants, orders, setOrders }: SALiveOrdersProps) {
  const [filterRestaurant, setFilterRestaurant] = useState<string>('all');
  const prevCountRef = useRef(orders.length);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('sa-live-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setOrders(prev => [payload.new as any, ...prev]);
          playBeep();
        } else if (payload.eventType === 'UPDATE') {
          setOrders(prev => prev.map(o => o.id === (payload.new as any).id ? payload.new as any : o));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [setOrders]);

  // Sound on new orders
  useEffect(() => {
    if (orders.length > prevCountRef.current) {
      playBeep();
    }
    prevCountRef.current = orders.length;
  }, [orders.length]);

  const activeOrders = useMemo(() => {
    let filtered = orders.filter(o => ACTIVE_STATUSES.includes(o.status));
    if (filterRestaurant !== 'all') {
      filtered = filtered.filter(o => o.restaurant_id === filterRestaurant);
    }
    return filtered;
  }, [orders, filterRestaurant]);

  const restName = (id: string) => restaurants.find(r => r.id === id)?.name || 'Desconocido';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="font-heading font-bold text-xl flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-primary" /> Pedidos en vivo
          <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">{activeOrders.length}</span>
        </h1>
      </div>

      {/* Restaurant filter */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setFilterRestaurant('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
            filterRestaurant === 'all'
              ? 'bg-primary text-primary-foreground border-transparent'
              : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
          }`}
        >
          Todos
        </button>
        {restaurants.map(r => (
          <button
            key={r.id}
            onClick={() => setFilterRestaurant(r.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
              filterRestaurant === r.id
                ? 'bg-primary text-primary-foreground border-transparent'
                : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
            }`}
          >
            {r.name}
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div className="bg-card rounded-xl border border-border/50">
        <div className="divide-y divide-border/50 max-h-[calc(100vh-220px)] overflow-y-auto">
          {activeOrders.length === 0 ? (
            <div className="p-8 text-center">
              <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-muted-foreground text-sm">Sin pedidos activos</p>
            </div>
          ) : activeOrders.map(o => (
            <div key={o.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-heading font-semibold text-sm">{restName(o.restaurant_id)} — Mesa {o.table_number}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(o.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[o.status] || 'bg-muted text-muted-foreground'}`}>
                  {STATUS_LABELS[o.status] || o.status}
                </span>
                <span className="font-heading font-bold text-sm">{formatARS(Number(o.total))}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
}
