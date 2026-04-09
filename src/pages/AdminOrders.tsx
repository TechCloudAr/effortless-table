import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useBranch } from '@/contexts/BranchContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ChefHat, Clock, Flame, HandPlatter, CheckCircle2, ClipboardList } from 'lucide-react';

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

  const orders = activeBranchId
    ? allOrders.filter(o => o.branch_id === activeBranchId)
    : [];

  const advanceStatus = async (orderId: string, currentStatus: string) => {
    const next = nextStatus[currentStatus as OrderStatus];
    if (!next) return;
    const timestamps: { paid_at?: string; preparing_at?: string; ready_at?: string; delivered_at?: string } = {};
    if (next === 'paid') timestamps.paid_at = new Date().toISOString();
    if (next === 'preparing') timestamps.preparing_at = new Date().toISOString();
    if (next === 'ready') timestamps.ready_at = new Date().toISOString();
    if (next === 'delivered') timestamps.delivered_at = new Date().toISOString();
    const { error } = await supabase.from('orders').update({ status: next, ...timestamps }).eq('id', orderId);
    if (error) {
      toast.error('Error al actualizar estado');
      return;
    }
    setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: next, ...timestamps } : o));
    toast.success(`Pedido actualizado a "${statusLabels[next]}"`);
  };

  const minutesAgo = (date: string) => Math.floor((Date.now() - new Date(date).getTime()) / 60000);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando pedidos...</div>;

  if (!activeBranchId) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p className="text-lg mb-2">Seleccioná una sucursal</p>
        <p className="text-sm">Los pedidos son internos de cada sucursal. Elegí una sucursal desde el selector de arriba.</p>
      </div>
    );
  }

  const cocinaOrders = orders.filter(o => o.status === 'paid' || o.status === 'preparing').sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const mozoOrders = orders.filter(o => o.status === 'ready').sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <Tabs defaultValue="todos" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-6">
          <TabsTrigger value="todos" className="gap-1.5">
            <ClipboardList className="h-4 w-4" />
            Todos
            <span className="text-xs opacity-70">({orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length})</span>
          </TabsTrigger>
          <TabsTrigger value="cocina" className="gap-1.5">
            <ChefHat className="h-4 w-4" />
            Cocina
            <span className="text-xs opacity-70">({cocinaOrders.length})</span>
          </TabsTrigger>
          <TabsTrigger value="mozo" className="gap-1.5">
            <HandPlatter className="h-4 w-4" />
            Mozo
            <span className="text-xs opacity-70">({mozoOrders.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* ─── TODOS ─── */}
        <TabsContent value="todos">
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
        </TabsContent>

        {/* ─── COCINA ─── */}
        <TabsContent value="cocina">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <ChefHat className="h-6 w-6 text-warning" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold">Cocina</h1>
              <p className="text-sm text-muted-foreground">{cocinaOrders.length} pedidos en cola</p>
            </div>
          </div>

          {cocinaOrders.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <ChefHat className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-xl font-heading">Sin pedidos en cocina</p>
              <p className="text-sm mt-2">Los pedidos cobrados aparecerán aquí</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {cocinaOrders.map(order => {
                const items = Array.isArray(order.items) ? order.items : [];
                const mins = minutesAgo(order.created_at);
                const isPreparando = order.status === 'preparing';
                return (
                  <div key={order.id} className={`bg-card rounded-2xl p-5 shadow-card border-2 ${isPreparando ? 'border-warning' : 'border-border'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-heading font-bold text-2xl">Mesa {order.table_number}</p>
                      <span className={`flex items-center gap-1 text-sm font-medium ${mins > 15 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        <Clock className="h-4 w-4" /> {mins} min
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      {items.map((item: any, i: number) => (
                        <div key={i} className="text-base font-medium">
                          <span className="font-bold text-primary">{item?.quantity || 1}x</span>{' '}
                          {item?.menuItem?.name || item?.name || 'Item'}
                          {item?.selectedOptions && Object.entries(item.selectedOptions).map(([group, opts]: [string, any]) => {
                            const optList = Array.isArray(opts) ? opts : [];
                            return optList.length > 0 ? (
                              <span key={group} className="text-xs text-muted-foreground block ml-6">
                                {optList.join(', ')}
                              </span>
                            ) : null;
                          })}
                          {item?.removedIngredients?.length > 0 && (
                            <span className="text-xs text-destructive block ml-6">
                              Sin: {item.removedIngredients.join(', ')}
                            </span>
                          )}
                          {item?.notes && (
                            <span className="text-xs text-muted-foreground italic block ml-6">
                              Nota: {item.notes}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {isPreparando ? (
                      <Button
                        onClick={() => advanceStatus(order.id, 'preparing')}
                        className="w-full h-12 text-lg font-heading font-bold bg-success hover:bg-success/90 text-success-foreground"
                      >
                        ✅ Marcar listo
                      </Button>
                    ) : (
                      <Button
                        onClick={() => advanceStatus(order.id, 'paid')}
                        className="w-full h-12 text-lg font-heading font-bold bg-warning hover:bg-warning/90 text-warning-foreground"
                      >
                        <Flame className="h-5 w-5 mr-2" /> Empezar a preparar
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ─── MOZO ─── */}
        <TabsContent value="mozo">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
              <HandPlatter className="h-6 w-6 text-success" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold">Mozo</h1>
              <p className="text-sm text-muted-foreground">{mozoOrders.length} pedidos listos para entregar</p>
            </div>
          </div>

          {mozoOrders.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <HandPlatter className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-xl font-heading">Sin pedidos listos</p>
              <p className="text-sm mt-2">Los pedidos listos de cocina aparecerán aquí</p>
            </div>
          ) : (
            <div className="space-y-4">
              {mozoOrders.map(order => {
                const items = Array.isArray(order.items) ? order.items : [];
                return (
                  <div key={order.id} className="bg-card rounded-2xl p-5 shadow-card border-2 border-success">
                    <div className="flex items-center justify-between mb-4">
                      <p className="font-heading font-bold text-2xl">Mesa {order.table_number}</p>
                      <span className="bg-success/10 text-success font-heading font-bold text-sm px-3 py-1 rounded-full">
                        ¡Listo!
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      {items.map((item: any, i: number) => (
                        <div key={i} className="text-base">
                          <span className="font-bold">{item?.quantity || 1}x</span>{' '}
                          {item?.menuItem?.name || item?.name || 'Item'}
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => advanceStatus(order.id, 'ready')}
                      className="w-full h-12 text-lg font-heading font-bold bg-success hover:bg-success/90 text-success-foreground"
                    >
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Marcar entregado
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
