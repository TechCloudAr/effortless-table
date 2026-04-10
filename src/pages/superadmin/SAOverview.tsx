import { useMemo } from 'react';
import { Building2, ShoppingBag, DollarSign, Users, TrendingUp } from 'lucide-react';
import SAMetricCard from './components/SAMetricCard';
import { formatARS, ACTIVE_STATUSES, STATUS_LABELS, STATUS_COLORS } from './utils';

interface SAOverviewProps {
  restaurants: any[];
  orders: any[];
}

export default function SAOverview({ restaurants, orders }: SAOverviewProps) {
  const activeOrders = orders.filter(o => ACTIVE_STATUSES.includes(o.status));
  const totalRevenue = orders.reduce((s: number, o: any) => s + Number(o.total), 0);

  // Activity last 7 days
  const dailyActivity = useMemo(() => {
    const days: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const count = orders.filter(o => o.created_at.slice(0, 10) === key).length;
      days.push({ label: d.toLocaleDateString('es-AR', { weekday: 'short' }), count });
    }
    return days;
  }, [orders]);

  const maxCount = Math.max(...dailyActivity.map(d => d.count), 1);

  // Status distribution
  const statusDist = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach(o => {
      const s = o.status as string;
      map[s] = (map[s] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [orders]);

  // Alerts
  const alerts = useMemo(() => {
    const result: string[] = [];
    const twoDaysAgo = Date.now() - 48 * 60 * 60 * 1000;
    restaurants.forEach(r => {
      const hasRecent = orders.some(o => o.restaurant_id === r.id && new Date(o.created_at).getTime() > twoDaysAgo);
      if (!hasRecent && orders.some(o => o.restaurant_id === r.id)) {
        result.push(`${r.name}: sin pedidos en 48h`);
      }
    });
    return result;
  }, [restaurants, orders]);

  return (
    <div className="space-y-6">
      <h1 className="font-heading font-bold text-xl">Overview</h1>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SAMetricCard label="Restaurantes" value={restaurants.length} icon={Building2} />
        <SAMetricCard label="Pedidos totales" value={orders.length} icon={ShoppingBag} />
        <SAMetricCard label="Pedidos activos" value={activeOrders.length} icon={Users} pulse={activeOrders.length > 0} />
        <SAMetricCard label="Facturación total" value={formatARS(totalRevenue)} icon={DollarSign} />
      </div>

      {/* Activity chart */}
      <div className="bg-card rounded-xl p-4 border border-border/50">
        <h2 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" /> Actividad últimos 7 días
        </h2>
        <div className="flex items-end gap-2 h-32">
          {dailyActivity.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] font-medium text-muted-foreground">{d.count}</span>
              <div
                className="w-full rounded-t-md bg-primary/80 transition-all"
                style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count > 0 ? 4 : 0 }}
              />
              <span className="text-[10px] text-muted-foreground capitalize">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Status distribution */}
        <div className="bg-card rounded-xl p-4 border border-border/50">
          <h2 className="font-heading font-semibold text-sm mb-3">Distribución de estados</h2>
          <div className="space-y-2">
            {statusDist.map(([status, count]) => (
              <div key={status} className="flex items-center gap-2">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[status] || 'bg-muted text-muted-foreground'}`}>
                  {STATUS_LABELS[status] || status}
                </span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary/70" style={{ width: `${(count / orders.length) * 100}%` }} />
                </div>
                <span className="text-xs text-muted-foreground font-medium w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-card rounded-xl p-4 border border-border/50">
          <h2 className="font-heading font-semibold text-sm mb-3">⚠️ Alertas</h2>
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Sin alertas</p>
          ) : (
            <div className="space-y-2">
              {alerts.map((a, i) => (
                <div key={i} className="text-sm bg-orange-500/10 text-orange-600 rounded-lg px-3 py-2">{a}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
