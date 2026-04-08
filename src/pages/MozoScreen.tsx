import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { HandPlatter, Clock, CheckCircle2 } from 'lucide-react';

interface OrderRow {
  id: string;
  table_number: number;
  items: any;
  status: string;
  created_at: string;
}

export default function MozoScreen() {
  const { branchId } = useParams();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!branchId) return;
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('branch_id', branchId)
      .eq('status', 'listo')
      .order('created_at', { ascending: true });
    if (data) setOrders(data as OrderRow[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    const channel = supabase
      .channel('mozo-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [branchId]);

  const markDelivered = async (orderId: string) => {
    const { error } = await supabase.from('orders').update({ status: 'entregado' }).eq('id', orderId);
    if (error) { toast.error('Error al marcar como entregado'); return; }
    toast.success('🍽️ ¡Pedido entregado!');
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background text-2xl text-muted-foreground">Cargando...</div>;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
            <HandPlatter className="h-6 w-6 text-success" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold">Mozo</h1>
            <p className="text-lg text-muted-foreground">{orders.length} pedidos listos para entregar</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <HandPlatter className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-2xl font-heading">Sin pedidos listos</p>
            <p className="text-lg mt-2">Los pedidos listos de cocina aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const items = Array.isArray(order.items) ? order.items : [];
              return (
                <div key={order.id} className="bg-card rounded-2xl p-6 shadow-card border-2 border-success">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-heading font-bold text-3xl">Mesa {order.table_number}</p>
                    <span className="bg-success/10 text-success font-heading font-bold text-lg px-4 py-1 rounded-full">
                      ¡Listo!
                    </span>
                  </div>

                  <div className="space-y-2 mb-5">
                    {items.map((item: any, i: number) => (
                      <div key={i} className="text-lg">
                        <span className="font-bold">{(item as any)?.quantity || 1}x</span>{' '}
                        {(item as any)?.menuItem?.name || (item as any)?.name || 'Item'}
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => markDelivered(order.id)}
                    className="w-full h-14 text-xl font-heading font-bold bg-success hover:bg-success/90 text-success-foreground"
                  >
                    <CheckCircle2 className="h-6 w-6 mr-2" />
                    Marcar entregado
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
