import { useState, useMemo } from 'react';
import { Building2 } from 'lucide-react';
import { formatARS, isTestAccount, ACTIVE_STATUSES } from './utils';
import RestaurantSlideOver from './components/RestaurantSlideOver';
import ExportCSVButton from './components/ExportCSVButton';

type Period = 'today' | '7d' | '30d' | '90d' | 'all';

interface SARestaurantsProps {
  restaurants: any[];
  orders: any[];
  branches: any[];
}

const periodFilters: { key: Period; label: string }[] = [
  { key: 'today', label: 'Hoy' },
  { key: '7d', label: '7d' },
  { key: '30d', label: '30d' },
  { key: '90d', label: '90d' },
  { key: 'all', label: 'Todo' },
];

function filterByPeriod(orders: any[], period: Period) {
  if (period === 'all') return orders;
  const now = Date.now();
  const ms: Record<string, number> = { today: 86400000, '7d': 604800000, '30d': 2592000000, '90d': 7776000000 };
  const cutoff = now - ms[period];
  return orders.filter(o => new Date(o.created_at).getTime() >= cutoff);
}

export default function SARestaurants({ restaurants, orders, branches }: SARestaurantsProps) {
  const [period, setPeriod] = useState<Period>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredOrders = useMemo(() => filterByPeriod(orders, period), [orders, period]);

  const rows = useMemo(() =>
    restaurants.map(r => {
      const rOrders = filteredOrders.filter(o => o.restaurant_id === r.id);
      return {
        ...r,
        orderCount: rOrders.length,
        activeOrders: rOrders.filter(o => ACTIVE_STATUSES.includes(o.status)).length,
        revenue: rOrders.reduce((s: number, o: any) => s + Number(o.total), 0),
        isTest: isTestAccount(r.name),
      };
    }).sort((a, b) => b.revenue - a.revenue),
  [restaurants, filteredOrders]);

  const csvHeaders = ['Nombre', 'Pedidos', 'Activos', 'Facturación', 'Prueba', 'Registrado'];
  const csvRows = rows.map(r => [
    r.name,
    r.orderCount,
    r.activeOrders,
    r.revenue,
    r.isTest ? 'Sí' : 'No',
    new Date(r.created_at).toLocaleDateString('es-AR'),
  ]);

  const selectedRestaurant = restaurants.find((r: any) => r.id === selectedId) || null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="font-heading font-bold text-xl flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" /> Restaurantes
        </h1>
        <ExportCSVButton headers={csvHeaders} rows={csvRows} filename="restaurantes.csv" />
      </div>

      {/* Period filter */}
      <div className="flex gap-1.5">
        {periodFilters.map(p => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
              period === p.key
                ? 'bg-primary text-primary-foreground border-transparent'
                : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border/50 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left p-4 font-medium">Restaurante</th>
              <th className="text-right p-4 font-medium">Pedidos</th>
              <th className="text-right p-4 font-medium">Activos</th>
              <th className="text-right p-4 font-medium">Facturación</th>
              <th className="text-right p-4 font-medium hidden md:table-cell">Registrado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
              >
                <td className="p-4 font-heading font-semibold">
                  {r.name}
                  {r.isTest && (
                    <span className="ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600">Prueba</span>
                  )}
                </td>
                <td className="p-4 text-right">{r.orderCount}</td>
                <td className="p-4 text-right">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.activeOrders > 0 ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                    {r.activeOrders}
                  </span>
                </td>
                <td className="p-4 text-right font-heading font-semibold">{formatARS(r.revenue)}</td>
                <td className="p-4 text-right text-muted-foreground hidden md:table-cell">
                  {new Date(r.created_at).toLocaleDateString('es-AR')}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Sin restaurantes</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedId && (
        <RestaurantSlideOver
          restaurant={selectedRestaurant}
          orders={orders}
          branches={branches}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
