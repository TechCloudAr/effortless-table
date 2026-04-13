import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChefHat, Clock, Flame, Volume2, VolumeX } from 'lucide-react';

interface OrderRow {
  id: string;
  table_number: number;
  items: any;
  status: string;
  created_at: string;
}

/** Beep using Web Audio API */
function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'triangle';
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
    // Play a second beep
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.value = 1100;
      osc2.type = 'triangle';
      gain2.gain.setValueAtTime(0.4, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 0.5);
    }, 200);
  } catch { /* Audio not available */ }
}

export default function CocinaScreen() {
  const { branchId } = useParams();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const prevCountRef = useRef<number>(0);
  const [now, setNow] = useState(Date.now());

  // Update clock every 30s for time display
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!branchId) return;
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('branch_id', branchId)
      .in('status', ['paid', 'preparing'])
      .order('created_at', { ascending: true });
    if (data) {
      const newOrders = data as OrderRow[];
      // Audio alert if new orders appeared
      if (soundOn && newOrders.length > prevCountRef.current && prevCountRef.current > 0) {
        playBeep();
      }
      prevCountRef.current = newOrders.length;
      setOrders(newOrders);
    }
    setLoading(false);
  }, [branchId, soundOn]);

  useEffect(() => {
    fetchOrders();
    const channel = supabase
      .channel('cocina-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchOrders]);

  const updateStatus = async (orderId: string, newStatus: 'preparing' | 'ready') => {
    const updateData: any = { status: newStatus };
    if (newStatus === 'preparing') updateData.preparing_at = new Date().toISOString();
    if (newStatus === 'ready') updateData.ready_at = new Date().toISOString();
    
    const { error } = await supabase.from('orders').update(updateData).eq('id', orderId);
    if (error) { toast.error('Error al actualizar'); return; }
    toast.success(newStatus === 'preparing' ? '🔥 Preparando...' : '✅ ¡Listo para servir!');
    fetchOrders();
  };

  const minutesAgo = (date: string) => Math.floor((now - new Date(date).getTime()) / 60000);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f0f0f', color: '#888' }}>
        <ChefHat className="h-12 w-12 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 select-none" style={{ background: '#0f0f0f', color: '#f0f0f0', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl flex items-center justify-center" style={{ background: '#2a1f00' }}>
            <ChefHat className="h-8 w-8" style={{ color: '#f59e0b' }} />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Cocina</h1>
            <p className="text-xl" style={{ color: '#888' }}>
              {orders.length} pedido{orders.length !== 1 ? 's' : ''} en cola
            </p>
          </div>
        </div>
        <button
          onClick={() => setSoundOn(!soundOn)}
          className="h-14 w-14 rounded-2xl flex items-center justify-center transition-colors"
          style={{ background: soundOn ? '#1a2e1a' : '#2e1a1a' }}
        >
          {soundOn ? (
            <Volume2 className="h-7 w-7" style={{ color: '#4ade80' }} />
          ) : (
            <VolumeX className="h-7 w-7" style={{ color: '#f87171' }} />
          )}
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center" style={{ minHeight: '60vh' }}>
          <ChefHat className="h-24 w-24 mb-6" style={{ color: '#333' }} />
          <p className="text-3xl font-bold" style={{ color: '#555' }}>Sin pedidos en cocina</p>
          <p className="text-xl mt-3" style={{ color: '#444' }}>Los pedidos cobrados aparecerán aquí</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {orders.map(order => {
            const items = Array.isArray(order.items) ? order.items : [];
            const mins = minutesAgo(order.created_at);
            const isPreparing = order.status === 'preparing';
            const isUrgent = mins > 15;

            // Color scheme
            const borderColor = isPreparing ? '#f59e0b' : '#3b82f6';
            const bgColor = isPreparing ? '#1a1500' : '#0a1628';
            const statusLabel = isPreparing ? 'PREPARANDO' : 'NUEVO';
            const statusBg = isPreparing ? '#78350f' : '#1e3a5f';
            const statusColor = isPreparing ? '#fbbf24' : '#60a5fa';

            return (
              <div
                key={order.id}
                className="rounded-3xl p-5 transition-all"
                style={{
                  background: bgColor,
                  border: `3px solid ${borderColor}`,
                  boxShadow: `0 0 20px ${borderColor}22`,
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-3xl font-black tracking-tight">Mesa {order.table_number}</p>
                  <span
                    className="px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider"
                    style={{ background: statusBg, color: statusColor }}
                  >
                    {statusLabel}
                  </span>
                </div>

                {/* Timer */}
                <div
                  className="flex items-center gap-2 mb-4 text-xl font-bold"
                  style={{ color: isUrgent ? '#ef4444' : '#888' }}
                >
                  <Clock className="h-5 w-5" />
                  <span>{mins} min</span>
                  {isUrgent && <span className="text-sm ml-1">⚠️ URGENTE</span>}
                </div>

                {/* Items — NO PRICES */}
                <div className="space-y-3 mb-5">
                  {items.map((item: any, i: number) => (
                    <div key={i}>
                      <div className="text-xl font-semibold leading-tight">
                        <span className="font-black" style={{ color: borderColor }}>
                          {(item as any)?.quantity || 1}×
                        </span>{' '}
                        {(item as any)?.menuItem?.name || (item as any)?.name || 'Item'}
                      </div>
                      {/* Special instructions / removed ingredients */}
                      {(item as any)?.removedIngredients?.length > 0 && (
                        <p className="text-base mt-1 pl-6" style={{ color: '#f87171' }}>
                          ✕ Sin: {(item as any).removedIngredients.join(', ')}
                        </p>
                      )}
                      {(item as any)?.notes && (
                        <p className="text-base mt-1 pl-6" style={{ color: '#fbbf24' }}>
                          📝 {(item as any).notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Action button */}
                {isPreparing ? (
                  <button
                    onClick={() => updateStatus(order.id, 'ready')}
                    className="w-full py-5 rounded-2xl text-2xl font-black uppercase tracking-wide transition-all active:scale-95"
                    style={{ background: '#166534', color: '#4ade80', border: '2px solid #22c55e' }}
                  >
                    ✅ LISTO
                  </button>
                ) : (
                  <button
                    onClick={() => updateStatus(order.id, 'preparing')}
                    className="w-full py-5 rounded-2xl text-2xl font-black uppercase tracking-wide transition-all active:scale-95"
                    style={{ background: '#78350f', color: '#fbbf24', border: '2px solid #f59e0b' }}
                  >
                    <Flame className="h-6 w-6 inline mr-2" />
                    EMPEZAR
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
