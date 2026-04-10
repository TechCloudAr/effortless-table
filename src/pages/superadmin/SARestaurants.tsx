import { useState, useMemo } from 'react';
import { Building2 } from 'lucide-react';
import { formatARS, isTestAccount, ACTIVE_STATUSES } from './utils';
import { usePeriod } from '@/contexts/PeriodContext';
import RestaurantSlideOver from './components/RestaurantSlideOver';
import ExportCSVButton from './components/ExportCSVButton';

interface SARestaurantsProps {
  restaurants: any[];
  orders: any[];
  branches: any[];
}

function getHealthScore(orders: any[], restaurantId: string, createdAt: string): number {
  const now = Date.now();
  const rOrders = orders.filter(o => o.restaurant_id === restaurantId);
  let score = 0;
  const last7d = rOrders.filter(o => now - new Date(o.created_at).getTime() < 604800000);
  if (last7d.length > 0) score += 40;
  const last30d = rOrders.filter(o => now - new Date(o.created_at).getTime() < 2592000000);
  if (last30d.length > 10) score += 30;
  // No plan data yet, skip +20
  if (now - new Date(createdAt).getTime() > 2592000000) score += 10;
  return score;
}

function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

export default function SARestaurants({ restaurants, orders, branches }: SARestaurantsProps) {
  const { filterByPeriod } = usePeriod();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filteredOrders = useMemo(() => filterByPeriod(orders), [orders, filterByPeriod]);

  const rows = useMemo(() =>
    restaurants
      .filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()))
      .map(r => {
        const rOrders = filteredOrders.filter(o => o.restaurant_id === r.id);
        const allOrders = orders.filter(o => o.restaurant_id === r.id);
        const lastOrder = allOrders.length > 0 ? allOrders.reduce((a, b) => new Date(a.created_at) > new Date(b.created_at) ? a : b) : null;
        const revenue = rOrders.reduce((s: number, o: any) => s + Number(o.total), 0);
        const avgTicket = rOrders.length > 0 ? revenue / rOrders.length : 0;
        return {
          ...r,
          orderCount: rOrders.length,
          activeOrders: rOrders.filter(o => ACTIVE_STATUSES.includes(o.status)).length,
          revenue,
          avgTicket,
          isTest: isTestAccount(r.name),
          healthScore: getHealthScore(orders, r.id, r.created_at),
          lastActivity: lastOrder ? lastOrder.created_at : null,
        };
      }).sort((a, b) => b.revenue - a.revenue),
  [restaurants, filteredOrders, orders, search]);

  const csvHeaders = ['Nombre', 'Pedidos', 'GMV', 'Ticket prom.', 'Salud', 'Últ. actividad', 'Registrado'];
  const csvRows = rows.map(r => [
    r.name,
    r.orderCount,
    r.revenue,
    Math.round(r.avgTicket),
    r.healthScore,
    r.lastActivity ? getRelativeTime(r.lastActivity) : 'Nunca',
    new Date(r.created_at).toLocaleDateString('es-AR'),
  ]);

  const selectedRestaurant = restaurants.find((r: any) => r.id === selectedId) || null;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Buscar restaurante..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="text-[12px] px-3 py-1.5 rounded-md bg-white w-48 focus:outline-none focus:ring-1 focus:ring-[#f97316]"
            style={{ border: '0.5px solid rgba(0,0,0,0.08)' }}
          />
        </div>
        <ExportCSVButton headers={csvHeaders} rows={csvRows} filename="restaurantes.csv" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg overflow-x-auto" style={{ border: '0.5px solid rgba(0,0,0,0.08)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
              <th className="text-left px-4 py-3 text-[9px] font-medium text-[#9ca3af] uppercase tracking-[0.06em]">#</th>
              <th className="text-left px-4 py-3 text-[9px] font-medium text-[#9ca3af] uppercase tracking-[0.06em]">Restaurante</th>
              <th className="text-right px-4 py-3 text-[9px] font-medium text-[#9ca3af] uppercase tracking-[0.06em]">Pedidos</th>
              <th className="text-right px-4 py-3 text-[9px] font-medium text-[#9ca3af] uppercase tracking-[0.06em] hidden md:table-cell">GMV</th>
              <th className="text-right px-4 py-3 text-[9px] font-medium text-[#9ca3af] uppercase tracking-[0.06em] hidden md:table-cell">Ticket prom.</th>
              <th className="text-right px-4 py-3 text-[9px] font-medium text-[#9ca3af] uppercase tracking-[0.06em] hidden lg:table-cell">Salud</th>
              <th className="text-right px-4 py-3 text-[9px] font-medium text-[#9ca3af] uppercase tracking-[0.06em] hidden lg:table-cell">Últ. actividad</th>
              <th className="text-right px-4 py-3 text-[9px] font-medium text-[#9ca3af] uppercase tracking-[0.06em] hidden md:table-cell">Registrado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const lastActivityDays = r.lastActivity ? Math.floor((Date.now() - new Date(r.lastActivity).getTime()) / 86400000) : 999;
              return (
                <tr
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className="cursor-pointer transition-colors duration-100 hover:bg-[#f9f9f8]"
                  style={{ borderBottom: '0.5px solid rgba(0,0,0,0.04)' }}
                >
                  <td className="px-4 py-3 text-[12px] text-[#9ca3af]">{i + 1}</td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] font-medium text-[#111110]">{r.name}</span>
                    {r.isTest && (
                      <span className="ml-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#fffbeb] text-[#d97706]">Prueba</span>
                    )}
                  </td>
                  <td className={`px-4 py-3 text-right text-[12px] ${r.orderCount === 0 ? 'text-[#9ca3af]' : 'text-[#111110]'}`}>{r.orderCount}</td>
                  <td className={`px-4 py-3 text-right text-[12px] hidden md:table-cell ${r.revenue === 0 ? 'text-[#9ca3af]' : 'text-[#111110] font-medium'}`}>
                    {formatARS(r.revenue)}
                  </td>
                  <td className="px-4 py-3 text-right text-[12px] text-[#6b7280] hidden md:table-cell">
                    {r.avgTicket > 0 ? formatARS(r.avgTicket) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right hidden lg:table-cell">
                    <span className={`text-[12px] font-medium ${r.healthScore >= 80 ? 'text-[#16a34a]' : r.healthScore >= 50 ? 'text-[#d97706]' : 'text-[#dc2626]'}`}>
                      {r.healthScore}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-right text-[12px] hidden lg:table-cell ${lastActivityDays > 5 ? 'text-[#dc2626]' : 'text-[#6b7280]'}`}>
                    {r.lastActivity ? getRelativeTime(r.lastActivity) : 'Nunca'}
                  </td>
                  <td className="px-4 py-3 text-right text-[12px] text-[#9ca3af] hidden md:table-cell">
                    {new Date(r.created_at).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-[11px] text-[#f97316] font-medium">Ver →</span>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-[12px] text-[#9ca3af]">Sin restaurantes</td></tr>
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
