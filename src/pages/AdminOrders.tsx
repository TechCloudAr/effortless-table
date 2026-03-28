import { useState } from 'react';
import { demoOrders } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import type { Order, OrderStatus } from '@/types/restaurant';

const statusLabels: Record<OrderStatus, string> = {
  received: 'Recibido',
  preparing: 'Preparando',
  ready: 'Listo',
  delivered: 'Entregado',
};

const statusColors: Record<OrderStatus, string> = {
  received: 'bg-info/10 text-info border-info/20',
  preparing: 'bg-warning/10 text-warning border-warning/20',
  ready: 'bg-success/10 text-success border-success/20',
  delivered: 'bg-muted text-muted-foreground border-border',
};

const nextStatus: Record<OrderStatus, OrderStatus | null> = {
  received: 'preparing',
  preparing: 'ready',
  ready: 'delivered',
  delivered: null,
};

const nextAction: Record<OrderStatus, string> = {
  received: 'Iniciar preparación',
  preparing: 'Marcar listo',
  ready: 'Marcar entregado',
  delivered: '',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>(demoOrders);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  const advanceStatus = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const next = nextStatus[o.status];
      return next ? { ...o, status: next } : o;
    }));
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Pedidos en vivo</h1>
        <p className="text-sm text-muted-foreground">{orders.filter(o => o.status !== 'delivered').length} pedidos activos</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
        {(['all', 'received', 'preparing', 'ready', 'delivered'] as const).map(s => (
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

      {/* Orders */}
      <div className="space-y-3">
        {filtered.map(order => (
          <div key={order.id} className="bg-card rounded-xl p-4 shadow-card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-bold text-sm">{order.id}</h3>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusColors[order.status]}`}>
                    {statusLabels[order.status]}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Mesa {order.tableNumber} • {new Date(order.createdAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <span className="font-heading font-bold">${order.total.toFixed(0)}</span>
            </div>
            {nextStatus[order.status] && (
              <Button
                size="sm"
                onClick={() => advanceStatus(order.id)}
                className={`font-heading text-xs ${
                  order.status === 'received' ? 'gradient-primary' :
                  order.status === 'preparing' ? 'bg-success hover:bg-success/90 text-success-foreground' :
                  'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                {nextAction[order.status]}
              </Button>
            )}
          </div>
        ))}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
