import { useMemo } from 'react';
import { Building2, ShoppingBag, DollarSign, TrendingUp, UserX, AlertTriangle, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import SAMetricCard from './components/SAMetricCard';
import ClientFunnelChart from './components/ClientFunnelChart';
import { formatARS, ACTIVE_STATUSES } from './utils';
import { usePeriod } from '@/contexts/PeriodContext';

interface SAOverviewProps {
  restaurants: any[];
  orders: any[];
}

export default function SAOverview({ restaurants, orders }: SAOverviewProps) {
  const { filterByPeriod } = usePeriod();
  const filtered = useMemo(() => filterByPeriod(orders), [orders, filterByPeriod]);

  const activeOrders = orders.filter(o => ACTIVE_STATUSES.includes(o.status));
  const totalRevenue = filtered.reduce((s: number, o: any) => s + Number(o.total), 0);

  // Orders today
  const todayStr = new Date().toISOString().slice(0, 10);
  const ordersToday = orders.filter(o => o.created_at.slice(0, 10) === todayStr).length;
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const ordersYesterday = orders.filter(o => o.created_at.slice(0, 10) === yesterdayStr).length;
  const ordersTrend = ordersYesterday > 0 ? Math.round(((ordersToday - ordersYesterday) / ordersYesterday) * 100) : 0;

  // Activity chart — last 7 days
  const dailyActivity = useMemo(() => {
    const days: { name: string; pedidos: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const count = orders.filter(o => o.created_at.slice(0, 10) === key).length;
      days.push({ name: d.toLocaleDateString('es-AR', { weekday: 'short' }), pedidos: count });
    }
    return days;
  }, [orders]);

  // Alerts
  const alerts = useMemo(() => {
    const result: { icon: string; text: string; sub: string }[] = [];
    const twoDaysAgo = Date.now() - 48 * 60 * 60 * 1000;
    restaurants.forEach(r => {
      const hasRecent = orders.some(o => o.restaurant_id === r.id && new Date(o.created_at).getTime() > twoDaysAgo);
      if (!hasRecent && orders.some(o => o.restaurant_id === r.id)) {
        result.push({ icon: '⚠️', text: `${r.name}: sin pedidos en 48h`, sub: 'Riesgo de churn' });
      }
    });
    const noOrders = restaurants.filter(r => !orders.some(o => o.restaurant_id === r.id));
    if (noOrders.length > 0) {
      result.push({ icon: '🆕', text: `${noOrders.length} restaurante(s) sin ningún pedido`, sub: 'No completaron onboarding' });
    }
    return result;
  }, [restaurants, orders]);

  // Recent activity
  const recentEvents = useMemo(() => {
    const events: { dot: string; text: string; time: string }[] = [];
    const sorted = [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);
    sorted.forEach(o => {
      const rName = restaurants.find(r => r.id === o.restaurant_id)?.name || 'Desconocido';
      const ago = getRelativeTime(o.created_at);
      events.push({
        dot: o.status === 'nuevo' ? '🟢' : o.status === 'cancelled' || o.status === 'cancelado' ? '⚫' : '🟠',
        text: `Pedido en ${rName} — Mesa ${o.table_number}`,
        time: ago,
      });
    });
    return events;
  }, [orders, restaurants]);

  return (
    <div className="space-y-5">
      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <SAMetricCard label="MRR" value="$0" icon={DollarSign} iconColor="#16a34a" iconBg="rgba(22,163,74,0.1)" trend="Sin cobro configurado" trendColor="#9ca3af" />
        <SAMetricCard label="Restaurantes activos" value={restaurants.length} icon={Building2} trend={`${restaurants.length} registrados`} />
        <SAMetricCard label="Trial → Conversión" value="—" icon={TrendingUp} iconColor="#2563eb" iconBg="rgba(37,99,235,0.1)" trend="Target: 40%" trendColor="#9ca3af" />
        <SAMetricCard label="Pedidos hoy" value={ordersToday} icon={ShoppingBag} iconColor="#7c3aed" iconBg="rgba(124,58,237,0.1)" trend={ordersTrend !== 0 ? `${ordersTrend > 0 ? '↑' : '↓'} ${Math.abs(ordersTrend)}% vs ayer` : 'Sin cambios'} trendColor={ordersTrend > 0 ? '#16a34a' : ordersTrend < 0 ? '#dc2626' : '#9ca3af'} />
        <SAMetricCard label="Churn este mes" value={0} icon={UserX} iconColor="#dc2626" iconBg="rgba(220,38,38,0.1)" trend="Target: 0" trendColor="#16a34a" />
      </div>

      {/* Funnel + Activity chart */}
      <div className="grid md:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg p-4" style={{ border: '0.5px solid rgba(0,0,0,0.08)' }}>
          <p className="text-[9px] font-medium text-[#9ca3af] uppercase tracking-[0.06em] mb-3">Funnel de clientes</p>
          <ClientFunnelChart restaurants={restaurants} orders={orders} />
        </div>

        <div className="bg-white rounded-lg p-4" style={{ border: '0.5px solid rgba(0,0,0,0.08)' }}>
          <p className="text-[9px] font-medium text-[#9ca3af] uppercase tracking-[0.06em] mb-3">Actividad últimos 7 días</p>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyActivity}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 6, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: 'none' }}
                  cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                />
                <Bar dataKey="pedidos" fill="#f97316" opacity={0.7} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alerts + Activity */}
      <div className="grid md:grid-cols-[360px_1fr] gap-3">
        <div className="bg-white rounded-lg p-4" style={{ border: '0.5px solid rgba(0,0,0,0.08)' }}>
          <p className="text-[9px] font-medium text-[#9ca3af] uppercase tracking-[0.06em] mb-3">Alertas</p>
          {alerts.length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-[12px] text-[#16a34a]">✓ Todo en orden</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((a, i) => (
                <div key={i} className="flex items-start gap-2 rounded-md p-2 bg-[#fffbeb]">
                  <span className="text-[14px]">{a.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-[#111110]">{a.text}</p>
                    <p className="text-[10px] text-[#9ca3af]">{a.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg p-4" style={{ border: '0.5px solid rgba(0,0,0,0.08)' }}>
          <p className="text-[9px] font-medium text-[#9ca3af] uppercase tracking-[0.06em] mb-3">Actividad reciente</p>
          <div className="space-y-2.5 max-h-[250px] overflow-y-auto">
            {recentEvents.length === 0 ? (
              <p className="text-[12px] text-[#9ca3af] text-center py-4">Sin actividad</p>
            ) : recentEvents.map((e, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="text-[8px] mt-0.5">{e.dot}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-[#111110]">{e.text}</p>
                  <p className="text-[10px] text-[#9ca3af]">{e.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} día${days > 1 ? 's' : ''}`;
}
