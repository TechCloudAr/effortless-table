import { tables } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { QrCode, Users, TrendingUp, Clock, Receipt, DollarSign } from 'lucide-react';
import { useMemo } from 'react';

const statusLabel: Record<string, string> = {
  available: 'Disponible',
  occupied: 'Ocupada',
  reserved: 'Reservada',
};

const statusColor: Record<string, string> = {
  available: 'bg-success/10 text-success',
  occupied: 'bg-warning/10 text-warning',
  reserved: 'bg-info/10 text-info',
};

// Mock performance data per table (simulates historical stats)
function generateTablePerformance(tableNumber: number) {
  const seed = tableNumber * 7;
  const ordersToday = 2 + (seed % 6);
  const avgTicket = 180 + (seed % 120);
  const totalRevenue = ordersToday * avgTicket;
  const avgTime = 12 + (seed % 18); // minutes avg occupation
  const rotations = 1 + (seed % 5);
  return { ordersToday, avgTicket, totalRevenue, avgTime, rotations };
}

export default function AdminTables() {
  const occupied = tables.filter(t => t.status === 'occupied').length;

  const globalStats = useMemo(() => {
    const perfs = tables.map(t => generateTablePerformance(t.number));
    const totalOrders = perfs.reduce((s, p) => s + p.ordersToday, 0);
    const totalRev = perfs.reduce((s, p) => s + p.totalRevenue, 0);
    const avgTicket = Math.round(totalRev / totalOrders);
    const avgRotation = (perfs.reduce((s, p) => s + p.rotations, 0) / perfs.length).toFixed(1);
    return { totalOrders, totalRev, avgTicket, avgRotation };
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Mesas y Performance</h1>
        <p className="text-sm text-muted-foreground">
          {occupied} ocupadas de {tables.length} mesas — Hoy
        </p>
      </div>

      {/* Global summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Pedidos hoy', value: globalStats.totalOrders, icon: Receipt },
          { label: 'Facturación', value: `$${globalStats.totalRev.toLocaleString()}`, icon: DollarSign },
          { label: 'Ticket promedio', value: `$${globalStats.avgTicket}`, icon: TrendingUp },
          { label: 'Rotación prom.', value: `${globalStats.avgRotation}x`, icon: Clock },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl p-4 shadow-card">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="font-heading font-bold text-xl">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table grid with performance */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {tables.map(table => {
          const perf = generateTablePerformance(table.number);
          return (
            <div key={table.id} className="bg-card rounded-xl p-4 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <span className="font-heading font-bold text-2xl">{table.number}</span>
                <Badge variant="secondary" className={`text-[10px] ${statusColor[table.status]}`}>
                  {statusLabel[table.status]}
                </Badge>
              </div>

              {/* Performance stats */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs mb-3">
                <div>
                  <span className="text-muted-foreground">Pedidos</span>
                  <p className="font-heading font-semibold">{perf.ordersToday}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Ticket prom.</span>
                  <p className="font-heading font-semibold">${perf.avgTicket}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Facturación</span>
                  <p className="font-heading font-semibold">${perf.totalRevenue.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Rotaciones</span>
                  <p className="font-heading font-semibold">{perf.rotations}x</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-2">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />{table.capacity} pers.
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />{perf.avgTime} min prom.
                </span>
                <button className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <QrCode className="h-3 w-3" /> QR
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
