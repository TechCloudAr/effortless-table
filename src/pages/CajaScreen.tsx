import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CheckCircle, Clock, DollarSign } from 'lucide-react';

interface OrderRow {
  id: string;
  table_number: number;
  items: any;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
}

export default function CajaScreen() {
  const { branchId } = useParams();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!branchId) return;
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('branch_id', branchId)
      .in('status', ['nuevo', 'pending_payment'])
      .order('created_at', { ascending: true });
    if (data) setOrders(data as OrderRow[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    const channel = supabase
      .channel('caja-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [branchId]);

  const acceptOrder = async (orderId: string) => {
    const { error } = await supabase.from('orders').update({ 
      status: 'aceptado', 
      payment_status: 'paid' 
    }).eq('id', orderId);
    if (error) { toast.error('Error al aceptar pedido'); return; }
    toast.success('Pedido aceptado → enviado a cocina');
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background text-2xl text-muted-foreground">Cargando...</div>;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold">Caja</h1>
            <p className="text-lg text-muted-foreground">{orders.length} pedidos nuevos</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Clock className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-2xl font-heading">Sin pedidos nuevos</p>
            <p className="text-lg mt-2">Los pedidos aparecerán aquí automáticamente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const items = Array.isArray(order.items) ? order.items : [];
              return (
                <div key={order.id} className="bg-card rounded-2xl p-6 shadow-card border border-border">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-heading font-bold text-2xl">Mesa {order.table_number}</p>
                      <p className="text-base text-muted-foreground">
                        {new Date(order.created_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="font-heading font-bold text-3xl text-primary">${Number(order.total).toFixed(0)}</span>
                  </div>
                  
                  <div className="space-y-2 mb-5">
                    {items.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-lg">
                        <span>{(item as any)?.quantity || 1}x {(item as any)?.menuItem?.name || (item as any)?.name || 'Item'}</span>
                        <span className="text-muted-foreground">${((item as any)?.unitPrice || 0) * ((item as any)?.quantity || 1)}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={() => acceptOrder(order.id)} 
                    className="w-full h-14 text-xl font-heading font-bold gradient-primary"
                  >
                    <CheckCircle className="h-6 w-6 mr-2" />
                    Aceptar y cobrar
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
