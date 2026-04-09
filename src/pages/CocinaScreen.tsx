import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ChefHat, Clock, Flame } from 'lucide-react';

interface OrderRow {
  id: string;
  table_number: number;
  items: any;
  status: string;
  created_at: string;
}

export default function CocinaScreen() {
  const { branchId } = useParams();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!branchId) return;
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('branch_id', branchId)
      .in('status', ['paid', 'preparing'])
      .order('created_at', { ascending: true });
    if (data) setOrders(data as OrderRow[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    const channel = supabase
      .channel('cocina-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [branchId]);

  const updateStatus = async (orderId: string, newStatus: 'preparing' | 'ready') => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) { toast.error('Error al actualizar'); return; }
    toast.success(newStatus === 'preparing' ? '🔥 Preparando...' : '✅ ¡Listo para servir!');
    fetchOrders();
  };

  const minutesAgo = (date: string) => Math.floor((Date.now() - new Date(date).getTime()) / 60000);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background text-2xl text-muted-foreground">Cargando...</div>;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
            <ChefHat className="h-6 w-6 text-warning" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold">Cocina</h1>
            <p className="text-lg text-muted-foreground">{orders.length} pedidos en cola</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <ChefHat className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-2xl font-heading">Sin pedidos en cocina</p>
            <p className="text-lg mt-2">Los pedidos cobrados aparecerán aquí</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {orders.map(order => {
              const items = Array.isArray(order.items) ? order.items : [];
              const mins = minutesAgo(order.created_at);
              const isPreparando = order.status === 'preparing';
              return (
                <div key={order.id} className={`bg-card rounded-2xl p-5 shadow-card border-2 ${isPreparando ? 'border-warning' : 'border-border'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-heading font-bold text-2xl">Mesa {order.table_number}</p>
                    <span className={`flex items-center gap-1 text-base font-medium ${mins > 15 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      <Clock className="h-4 w-4" /> {mins} min
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {items.map((item: any, i: number) => (
                      <div key={i} className="text-lg font-medium">
                        <span className="font-bold text-primary">{(item as any)?.quantity || 1}x</span>{' '}
                        {(item as any)?.menuItem?.name || (item as any)?.name || 'Item'}
                        {(item as any)?.removedIngredients?.length > 0 && (
                          <span className="text-sm text-destructive block ml-6">
                            Sin: {(item as any).removedIngredients.join(', ')}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {isPreparando ? (
                    <Button
                      onClick={() => updateStatus(order.id, 'ready')}
                      className="w-full h-14 text-xl font-heading font-bold bg-success hover:bg-success/90 text-success-foreground"
                    >
                      ✅ Marcar listo
                    </Button>
                  ) : (
                    <Button
                      onClick={() => updateStatus(order.id, 'preparing')}
                      className="w-full h-14 text-xl font-heading font-bold bg-warning hover:bg-warning/90 text-warning-foreground"
                    >
                      <Flame className="h-5 w-5 mr-2" /> Empezar a preparar
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
