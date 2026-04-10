import { X, Building2, ShoppingBag, DollarSign, MapPin } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { formatARS } from '../utils';

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
  table_number: number;
}

interface Branch {
  id: string;
  name: string;
  address: string | null;
  is_active: boolean;
}

interface Restaurant {
  id: string;
  name: string;
  created_at: string;
  owner_id: string;
}

interface RestaurantSlideOverProps {
  restaurant: Restaurant | null;
  orders: Order[];
  branches: Branch[];
  onClose: () => void;
}

export default function RestaurantSlideOver({ restaurant, orders, branches, onClose }: RestaurantSlideOverProps) {
  if (!restaurant) return null;

  const restOrders = orders.filter(o => (o as any).restaurant_id === restaurant.id);
  const revenue = restOrders.reduce((s, o) => s + Number(o.total), 0);
  const activeOrders = restOrders.filter(o => !['entregado', 'delivered', 'cancelled', 'cancelado'].includes(o.status));
  const restBranches = branches.filter(b => (b as any).restaurant_id === restaurant.id);
  const avgTicket = restOrders.length > 0 ? revenue / restOrders.length : 0;

  // Mini chart: daily orders last 14 days
  const chartData = (() => {
    const data: { day: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      data.push({ day: key, count: restOrders.filter(o => o.created_at.slice(0, 10) === key).length });
    }
    return data;
  })();

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-full max-w-[480px] bg-white overflow-y-auto" style={{ borderLeft: '0.5px solid rgba(0,0,0,0.08)', animation: 'slideFromRight 300ms ease-out' }}>
        <div className="sticky top-0 bg-white z-10 px-5 py-4 flex items-center justify-between" style={{ borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
          <div>
            <h2 className="text-[15px] font-medium text-[#111110]">{restaurant.name}</h2>
            <p className="text-[10px] text-[#9ca3af]">Registrado {new Date(restaurant.created_at).toLocaleDateString('es-AR')}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-[#f8f8f7] transition-colors">
            <X className="h-4 w-4 text-[#6b7280]" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Pedidos', value: restOrders.length, icon: ShoppingBag },
              { label: 'Activos', value: activeOrders.length, icon: ShoppingBag },
              { label: 'GMV', value: formatARS(revenue), icon: DollarSign },
              { label: 'Ticket prom.', value: avgTicket > 0 ? formatARS(avgTicket) : '—', icon: DollarSign },
            ].map(m => (
              <div key={m.label} className="rounded-md p-3" style={{ border: '0.5px solid rgba(0,0,0,0.08)' }}>
                <p className="text-[9px] font-medium text-[#9ca3af] uppercase tracking-[0.06em] mb-1">{m.label}</p>
                <p className="text-[15px] font-medium text-[#111110]">{m.value}</p>
              </div>
            ))}
          </div>

          {/* Mini chart */}
          <div>
            <p className="text-[9px] font-medium text-[#9ca3af] uppercase tracking-[0.06em] mb-2">Pedidos últimos 14 días</p>
            <div className="h-[120px] bg-[#f8f8f7] rounded-md p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={1.5} dot={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 10, borderRadius: 6, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: 'none' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Branches */}
          {restBranches.length > 0 && (
            <div>
              <p className="text-[9px] font-medium text-[#9ca3af] uppercase tracking-[0.06em] mb-2">Sucursales</p>
              <div className="space-y-1.5">
                {restBranches.map(b => (
                  <div key={b.id} className="flex items-center justify-between rounded-md px-3 py-2 text-[12px]" style={{ border: '0.5px solid rgba(0,0,0,0.04)', backgroundColor: '#f9f9f8' }}>
                    <span className="text-[#111110]">{b.name}</span>
                    <span className={`text-[10px] font-medium ${b.is_active ? 'text-[#16a34a]' : 'text-[#9ca3af]'}`}>
                      {b.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent orders */}
          <div>
            <p className="text-[9px] font-medium text-[#9ca3af] uppercase tracking-[0.06em] mb-2">Últimos pedidos</p>
            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {restOrders.length === 0 ? (
                <p className="text-[12px] text-[#9ca3af] text-center py-4">Sin pedidos</p>
              ) : restOrders.slice(0, 10).map(o => (
                <div key={o.id} className="flex items-center justify-between rounded-md px-3 py-2 text-[12px]" style={{ border: '0.5px solid rgba(0,0,0,0.04)', backgroundColor: '#f9f9f8' }}>
                  <div>
                    <span className="font-medium text-[#111110]">Mesa {o.table_number}</span>
                    <span className="text-[#9ca3af] text-[10px] ml-2">
                      {new Date(o.created_at).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className="font-medium text-[#111110]">{formatARS(Number(o.total))}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes slideFromRight{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
    </div>
  );
}
