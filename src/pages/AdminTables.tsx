import { Badge } from '@/components/ui/badge';
import { QrCode, Users, TrendingUp, Clock, Receipt, DollarSign } from 'lucide-react';
import { useMemo } from 'react';
import { useSalesData } from '@/hooks/useSalesData';

export default function AdminTables() {
  const { stats, loading } = useSalesData();

  const tableData = useMemo(() => {
    const byTable = stats.ordersByTable;
    const tableNumbers = Object.keys(byTable).map(Number).sort((a, b) => a - b);

    return tableNumbers.map(num => {
      const orders = byTable[num];
      const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
      const avgTicket = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;
      const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
      const isOccupied = activeOrders.length > 0;

      return {
        number: num,
        ordersCount: orders.length,
        totalRevenue,
        avgTicket,
        isOccupied,
        activeOrders: activeOrders.length,
      };
    });
  }, [stats]);

  const globalStats = useMemo(() => {
    const totalOrders = stats.totalOrders;
    const totalRev = stats.totalRevenue;
    const avgTicket = Math.round(stats.avgTicket);
    const occupiedTables = tableData.filter(t => t.isOccupied).length;
    return { totalOrders, totalRev, avgTicket, totalTables: tableData.length, occupiedTables };
  }, [stats, tableData]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando datos de mesas...</div>;

  if (tableData.length === 0) {
    return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        <h1 className="font-heading text-2xl font-bold mb-2">Mesas y Performance</h1>
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg mb-2">Sin datos de mesas</p>
          <p className="text-sm">Los datos aparecerán cuando haya pedidos registrados</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Mesas y Performance</h1>
        <p className="text-sm text-muted-foreground">
          {globalStats.occupiedTables} ocupadas de {globalStats.totalTables} mesas
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Pedidos totales', value: globalStats.totalOrders, icon: Receipt },
          { label: 'Facturación', value: `$${globalStats.totalRev.toLocaleString()}`, icon: DollarSign },
          { label: 'Ticket promedio', value: `$${globalStats.avgTicket}`, icon: TrendingUp },
          { label: 'Mesas con pedidos', value: globalStats.totalTables, icon: Clock },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-xl p-4 shadow-card">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="font-heading font-bold text-xl">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {tableData.map(table => (
          <div key={table.number} className="bg-card rounded-xl p-4 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <span className="font-heading font-bold text-2xl">{table.number}</span>
              <Badge variant="secondary" className={`text-[10px] ${table.isOccupied ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
                {table.isOccupied ? 'Ocupada' : 'Disponible'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs mb-3">
              <div>
                <span className="text-muted-foreground">Pedidos</span>
                <p className="font-heading font-semibold">{table.ordersCount}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Ticket prom.</span>
                <p className="font-heading font-semibold">${table.avgTicket}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Facturación</span>
                <p className="font-heading font-semibold">${table.totalRevenue.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Activos</span>
                <p className="font-heading font-semibold">{table.activeOrders}</p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-2">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" /> Mesa {table.number}
              </span>
              <button className="flex items-center gap-1 text-xs text-primary hover:underline">
                <QrCode className="h-3 w-3" /> QR
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
