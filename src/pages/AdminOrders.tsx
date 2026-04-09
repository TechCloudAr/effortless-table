import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useBranch } from '@/contexts/BranchContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type OrderStatus = 'pending_payment' | 'received' | 'paid' | 'preparing' | 'ready' | 'delivered';

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

const statusLabels: Record<OrderStatus, string> = {
  pending_payment: 'Pago pendiente',
  received: 'Recibido',
  paid: 'Cobrado',
  preparing: 'Preparando',
  ready: 'Listo',
  delivered: 'Entregado',
};

const statusColors: Record<OrderStatus, string> = {
  pending_payment: 'bg-warning/10 text-warning border-warning/20',
  received: 'bg-info/10 text-info border-info/20',
  paid: 'bg-primary/10 text-primary border-primary/20',
  preparing: 'bg-warning/10 text-warning border-warning/20',
  ready: 'bg-success/10 text-success border-success/20',
  delivered: 'bg-muted text-muted-foreground border-border',
};

const nextStatus: Record<OrderStatus, OrderStatus | null> = {
  pending_payment: null,
  received: 'paid',
  paid: 'preparing',
  preparing: 'ready',
  ready: 'delivered',
  delivered: null,
};

const nextAction: Record<OrderStatus, string> = {
  pending_payment: '',
  received: 'Marcar cobrado',
  paid: 'Iniciar preparación',
  preparing: 'Marcar listo',
  ready: 'Marcar entregado',
  delivered: '',
};

export default function AdminOrders() {
  const { restaurantId } = useAuth();
  const { activeBranchId } = useBranch();
  const [allOrders, setAllOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  const fetchOrders = async () => {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (restaurantId) query = query.eq('restaurant_id', restaurantId);
    const { data } = await query;
    if (data) setAllOrders(data as OrderRow[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [restaurantId]);

  // Filter by branch
  const orders = activeBranchId
    ? allOrders.filter(o => o.branch_id === activeBranchId)
    : allOrders;

  const advanceStatus = async (orderId: string, currentStatus: string) => {
    const next = nextStatus[currentStatus as OrderStatus];
    if (!next) return;
    const { error } = await supabase.from('orders').update({ status: next }).eq('id', orderId);
    if (error) {
      toast.error('Error al actualizar estado');
      return;
    }
    setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: next } : o));
    toast.success(`Pedido actualizado a "${statusLabels[next]}"`);
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando pedidos...</div>;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Pedidos en vivo</h1>
        <p className="text-sm text-muted-foreground">{orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length} pedidos activos</p>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
        {(['all', 'pending_payment', 'received', 'paid', 'preparing', 'ready', 'delivered'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
              filter === s ? 'gradient-primary text-primary-foreground border-transparent' : 'bg-card text-muted-foreground border-border'
            }`}
          >
            {s === 'all' ? 'Todos' : statusLabels[s]}
            <span className="ml-1 opacity-70">
              ({s === 'all' ? orders.length : orders.filter(o => o.status === s).length})
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg mb-2">No hay pedidos</p>
          <p className="text-sm">Los pedidos aparecerán aquí cuando los clientes ordenen</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => {
            const status = order.status as OrderStatus;
            return (
              <div key={order.id} className="bg-card rounded-xl p-4 shadow-card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-bold text-sm">{order.id.slice(0, 8)}</h3>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusColors[status] || 'bg-muted text-muted-foreground border-border'}`}>
                        {statusLabels[status] || order.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Mesa {order.table_number} • {new Date(order.created_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className="font-heading font-bold">${Number(order.total).toFixed(0)}</span>
                </div>
                {nextStatus[status] && (
                  <Button
                    size="sm"
                    onClick={() => advanceStatus(order.id, status)}
                    className={`font-heading text-xs ${
                      status === 'received' ? 'gradient-primary' :
                      status === 'paid' || status === 'preparing' ? 'bg-success hover:bg-success/90 text-success-foreground' :
                      'bg-muted text-foreground hover:bg-muted/80'
                    }`}
                  >
                    {nextAction[status]}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
