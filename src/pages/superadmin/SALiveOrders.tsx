import { useState, useEffect, useRef, useMemo } from 'react';
import { ShoppingBag, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';
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
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
}

function getTimeSince(dateStr: string): { text: string; isStuck: boolean } {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  const isStuck = mins > 30;
  if (mins < 1) return { text: 'ahora', isStuck: false };
  if (mins < 60) return { text: `${mins} min`, isStuck };
  const hours = Math.floor(mins / 60);
  return { text: `${hours}h ${mins % 60}m`, isStuck };
}

export default function SALiveOrders({ restaurants, orders, setOrders }: SALiveOrdersProps) {
  const [filterRestaurant, setFilterRestaurant] = useState<string>('all');
  const [soundOn, setSoundOn] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const prevCountRef = useRef(orders.length);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel('sa-live-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setOrders(prev => [payload.new as any, ...prev]);
          if (soundOn) playBeep();
        } else if (payload.eventType === 'UPDATE') {
          setOrders(prev => prev.map(o => o.id === (payload.new as any).id ? payload.new as any : o));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [setOrders, soundOn]);

  useEffect(() => {
    if (orders.length > prevCountRef.current && soundOn) playBeep();
    prevCountRef.current = orders.length;
  }, [orders.length, soundOn]);

  const activeOrders = useMemo(() => {
    let filtered = orders.filter(o => ACTIVE_STATUSES.includes(o.status));
    if (filterRestaurant !== 'all') filtered = filtered.filter(o => o.restaurant_id === filterRestaurant);
    return filtered;
  }, [orders, filterRestaurant]);

  const preparing = orders.filter(o => ['preparing', 'preparando'].includes(o.status)).length;
  const ready = orders.filter(o => ['ready', 'listo'].includes(o.status)).length;
  const cancelledToday = orders.filter(o => ['cancelled', 'cancelado'].includes(o.status) && o.created_at.slice(0, 10) === new Date().toISOString().slice(0, 10)).length;

  const restName = (id: string) => restaurants.find(r => r.id === id)?.name || 'Desconocido';

  return (
    <div className={`space-y-4 ${fullscreen ? 'fixed inset-0 z-[100] bg-[#f8f8f7] p-6 overflow-y-auto' : ''}`}>
      {/* Live metrics bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { label: 'Activos', value: activeOrders.length, dot: true },
          { label: 'En preparación', value: preparing },
          { label: 'Listos', value: ready },
          { label: 'Cancelados hoy', value: cancelledToday },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-lg px-3 py-2.5 flex items-center gap-2" style={{ border: '0.5px solid rgba(0,0,0,0.08)' }}>
            {m.dot && m.value > 0 && <span className="h-2 w-2 rounded-full bg-[#16a34a] animate-pulse" />}
            <span className="text-[15px] font-medium text-[#111110]">{m.value}</span>
            <span className="text-[10px] text-[#9ca3af]">{m.label}</span>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterRestaurant('all')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              filterRestaurant === 'all' ? 'bg-white text-[#111110] shadow-sm' : 'text-[#6b7280] hover:text-[#111110]'
            }`}
            style={filterRestaurant === 'all' ? { border: '0.5px solid rgba(0,0,0,0.08)' } : {}}
          >
            Todos
          </button>
          {restaurants.map(r => (
            <button
              key={r.id}
              onClick={() => setFilterRestaurant(r.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all ${
                filterRestaurant === r.id ? 'bg-white text-[#111110] shadow-sm' : 'text-[#6b7280] hover:text-[#111110]'
              }`}
              style={filterRestaurant === r.id ? { border: '0.5px solid rgba(0,0,0,0.08)' } : {}}
            >
              {r.name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setSoundOn(!soundOn)} className="p-1.5 rounded-md hover:bg-white transition-colors" title={soundOn ? 'Silenciar' : 'Activar sonido'}>
            {soundOn ? <Volume2 className="h-4 w-4 text-[#6b7280]" /> : <VolumeX className="h-4 w-4 text-[#9ca3af]" />}
          </button>
          <button onClick={() => setFullscreen(!fullscreen)} className="p-1.5 rounded-md hover:bg-white transition-colors">
            {fullscreen ? <Minimize2 className="h-4 w-4 text-[#6b7280]" /> : <Maximize2 className="h-4 w-4 text-[#6b7280]" />}
          </button>
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-lg" style={{ border: '0.5px solid rgba(0,0,0,0.08)' }}>
        <div className={`divide-y max-h-[calc(100vh-280px)] overflow-y-auto ${fullscreen ? 'max-h-[calc(100vh-200px)]' : ''}`} style={{ '--tw-divide-opacity': '0.04' } as any}>
          {activeOrders.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-[12px] text-[#9ca3af]">Sin pedidos activos ahora — todo tranquilo 🧘</p>
            </div>
          ) : activeOrders.map(o => {
            const time = getTimeSince(o.created_at);
            return (
              <div
                key={o.id}
                className="px-4 py-3 flex items-center justify-between"
                style={{ animation: 'fadeSlideIn 200ms ease-out' }}
              >
                <div className="flex-1 min-w-0">
                  <p className={`text-[12px] font-medium text-[#111110] ${fullscreen ? 'text-[14px]' : ''}`}>
                    {restName(o.restaurant_id)} — Mesa {o.table_number}
                  </p>
                  <p className="text-[10px] text-[#9ca3af]">
                    {new Date(o.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[o.status] || 'bg-muted text-muted-foreground'}`}>
                    {STATUS_LABELS[o.status] || o.status}
                  </span>
                  <span className={`text-[10px] ${time.isStuck ? 'text-[#dc2626] font-medium' : 'text-[#9ca3af]'}`}>
                    {time.text}
                  </span>
                  <span className={`text-[12px] font-medium text-[#111110] ${fullscreen ? 'text-[14px]' : ''}`}>
                    {formatARS(Number(o.total))}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
        @keyframes fadeSlideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </div>
  );
}
