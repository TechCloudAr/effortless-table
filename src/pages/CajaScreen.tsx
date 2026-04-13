import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  CheckCircle, Clock, DollarSign, ArrowRight, ChefHat,
  UtensilsCrossed, CreditCard, Banknote, ShoppingBag, Hash
} from 'lucide-react';

interface OrderRow {
  id: string;
  table_number: number;
  items: any;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
}

const STATUS_FLOW: Record<string, { next: string; label: string; icon: any; color: string }> = {
  received: { next: 'paid', label: 'Confirmar pago', icon: CheckCircle, color: 'bg-blue-600 hover:bg-blue-700 text-white' },
  pending_payment: { next: 'paid', label: 'Confirmar pago', icon: CheckCircle, color: 'bg-blue-600 hover:bg-blue-700 text-white' },
  nuevo: { next: 'paid', label: 'Confirmar pago', icon: CheckCircle, color: 'bg-blue-600 hover:bg-blue-700 text-white' },
  paid: { next: 'preparing', label: 'A cocina', icon: ChefHat, color: 'bg-amber-500 hover:bg-amber-600 text-white' },
  preparing: { next: 'ready', label: 'Listo', icon: UtensilsCrossed, color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
  ready: { next: 'delivered', label: 'Entregado', icon: CheckCircle, color: 'bg-violet-600 hover:bg-violet-700 text-white' },
};

const STATUS_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  received: { label: 'Nuevo', bg: 'bg-blue-100', text: 'text-blue-700' },
  pending_payment: { label: 'Pago pendiente', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  nuevo: { label: 'Nuevo', bg: 'bg-blue-100', text: 'text-blue-700' },
  paid: { label: 'Pagado', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  preparing: { label: 'En cocina', bg: 'bg-amber-100', text: 'text-amber-700' },
  ready: { label: 'Listo', bg: 'bg-green-100', text: 'text-green-700' },
  delivered: { label: 'Entregado', bg: 'bg-gray-100', text: 'text-gray-600' },
};

export default function CajaScreen() {
  const { branchId } = useParams();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!branchId) return;
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('branch_id', branchId)
      .order('created_at', { ascending: true });
    if (data) setOrders(data as OrderRow[]);
    setLoading(false);
  }, [branchId]);

  useEffect(() => {
    fetchOrders();
    const channel = supabase
      .channel('caja-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchOrders]);

  const advanceStatus = async (orderId: string, currentStatus: string) => {
    const flow = STATUS_FLOW[currentStatus];
    if (!flow) return;
    
    const updateData: any = { status: flow.next };
    if (flow.next === 'paid') { updateData.payment_status = 'paid'; updateData.paid_at = new Date().toISOString(); }
    if (flow.next === 'preparing') updateData.preparing_at = new Date().toISOString();
    if (flow.next === 'ready') updateData.ready_at = new Date().toISOString();
    if (flow.next === 'delivered') updateData.delivered_at = new Date().toISOString();

    const { error } = await supabase.from('orders').update(updateData).eq('id', orderId);
    if (error) { toast.error('Error al actualizar'); return; }
    toast.success(`Pedido → ${STATUS_LABELS[flow.next]?.label || flow.next}`);
    fetchOrders();
  };

  // Today's orders
  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);

  const todayOrders = useMemo(
    () => orders.filter(o => new Date(o.created_at).getTime() >= todayStart),
    [orders, todayStart]
  );

  const activeOrders = useMemo(
    () => todayOrders.filter(o => !['delivered', 'cancelled', 'cancelado'].includes(o.status)),
    [todayOrders]
  );

  const closedOrders = useMemo(
    () => todayOrders.filter(o => ['delivered'].includes(o.status)),
    [todayOrders]
  );

  const todayRevenue = useMemo(
    () => closedOrders.reduce((s, o) => s + Number(o.total), 0),
    [closedOrders]
  );

  const avgTicket = closedOrders.length > 0 ? todayRevenue / closedOrders.length : 0;

  const activeTables = useMemo(
    () => [...new Set(activeOrders.map(o => o.table_number))].sort((a, b) => a - b),
    [activeOrders]
  );

  const minutesAgo = (date: string) => Math.floor((Date.now() - new Date(date).getTime()) / 60000);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-400">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 select-none" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Caja</h1>
            <p className="text-sm text-gray-500">{activeOrders.length} pedidos activos</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="text-center">
            <p className="text-gray-500">Hoy</p>
            <p className="text-xl font-bold text-gray-900">${Math.round(todayRevenue).toLocaleString('es-AR')}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">Pedidos</p>
            <p className="text-xl font-bold text-gray-900">{closedOrders.length}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">Ticket prom.</p>
            <p className="text-xl font-bold text-gray-900">${Math.round(avgTicket).toLocaleString('es-AR')}</p>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-72px)]">
        {/* Left: Active Orders */}
        <div className="flex-1 overflow-y-auto p-5">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-blue-600" />
            Pedidos activos
          </h2>

          {activeOrders.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Clock className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-xl font-semibold">Sin pedidos activos</p>
              <p className="mt-2">Los nuevos pedidos aparecerán aquí</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeOrders.map(order => {
                const items = Array.isArray(order.items) ? order.items : [];
                const mins = minutesAgo(order.created_at);
                const flow = STATUS_FLOW[order.status];
                const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS.received;

                return (
                  <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-black text-gray-900">Mesa {order.table_number}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.text}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-gray-900">${Number(order.total).toLocaleString('es-AR', { minimumFractionDigits: 0 })}</span>
                        <div className="flex items-center gap-1 text-sm text-gray-400 mt-0.5">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{mins} min</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 mb-4">
                      {items.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-base">
                          <span className="text-gray-700">
                            <span className="font-semibold text-gray-900">{(item as any)?.quantity || 1}×</span>{' '}
                            {(item as any)?.menuItem?.name || (item as any)?.name || 'Item'}
                          </span>
                          <span className="text-gray-500">${((item as any)?.unitPrice || 0) * ((item as any)?.quantity || 1)}</span>
                        </div>
                      ))}
                    </div>

                    {flow && (
                      <button
                        onClick={() => advanceStatus(order.id, order.status)}
                        className={`w-full py-3.5 rounded-xl text-lg font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${flow.color}`}
                      >
                        <flow.icon className="h-5 w-5" />
                        {flow.label}
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Day Summary */}
        <div className="w-[380px] bg-white border-l border-gray-200 overflow-y-auto p-5 hidden md:block">
          <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-600" />
            Resumen del día
          </h2>

          {/* Daily stats cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-emerald-50 rounded-xl p-4">
              <DollarSign className="h-5 w-5 text-emerald-600 mb-1" />
              <p className="text-2xl font-bold text-emerald-700">${Math.round(todayRevenue).toLocaleString('es-AR')}</p>
              <p className="text-xs text-emerald-600">Cobrado hoy</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <ShoppingBag className="h-5 w-5 text-blue-600 mb-1" />
              <p className="text-2xl font-bold text-blue-700">{closedOrders.length}</p>
              <p className="text-xs text-blue-600">Pedidos cerrados</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <Banknote className="h-5 w-5 text-purple-600 mb-1" />
              <p className="text-2xl font-bold text-purple-700">${Math.round(avgTicket).toLocaleString('es-AR')}</p>
              <p className="text-xs text-purple-600">Ticket promedio</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4">
              <Hash className="h-5 w-5 text-orange-600 mb-1" />
              <p className="text-2xl font-bold text-orange-700">{activeTables.length}</p>
              <p className="text-xs text-orange-600">Mesas activas</p>
            </div>
          </div>

          {/* Active tables */}
          {activeTables.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Mesas con pedidos abiertos</h3>
              <div className="flex flex-wrap gap-2">
                {activeTables.map(t => (
                  <span key={t} className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm font-semibold">
                    Mesa {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Closed orders list */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3">Pedidos cobrados hoy</h3>
            {closedOrders.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">Aún no hay pedidos cobrados</p>
            ) : (
              <div className="space-y-2">
                {closedOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
                    <div>
                      <span className="font-semibold text-gray-800 text-sm">Mesa {order.table_number}</span>
                      <span className="text-xs text-gray-400 ml-2">
                        {new Date(order.created_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className="font-bold text-gray-900">${Number(order.total).toLocaleString('es-AR', { minimumFractionDigits: 0 })}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
