import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, ShoppingBag, Clock, Users, DollarSign, ChefHat, Flame, Star, Utensils, CreditCard, BarChart3, Target } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import ForecastingPanel from '@/components/admin/ForecastingPanel';
import { useSalesData } from '@/hooks/useSalesData';
import { useMenu } from '@/hooks/useMenu';

export default function AdminDashboard() {
  const [tab, setTab] = useState<'overview' | 'forecast'>('overview');
  const { stats, loading } = useSalesData();
  const { categories, menuItems } = useMenu();

  // Build hourly data from real orders
  const hourlyData = useMemo(() => {
    const hours: Record<string, number> = {};
    for (const o of stats.orders) {
      const h = new Date(o.created_at).getHours();
      const label = `${h > 12 ? h - 12 : h}${h >= 12 ? 'pm' : 'am'}`;
      hours[label] = (hours[label] || 0) + Number(o.total);
    }
    return Object.entries(hours).map(([hour, ventas]) => ({ hour, ventas: Math.round(ventas) }));
  }, [stats.orders]);

  // Build top products from real orders
  const topProducts = useMemo(() => {
    const ps = stats.productSales;
    // We need names from items in orders JSONB
    const products: { name: string; orders: number; revenue: number }[] = [];
    for (const order of stats.orders) {
      const items = Array.isArray(order.items) ? order.items : [];
      for (const item of items) {
        const name = (item as any)?.menuItem?.name || (item as any)?.name || 'Desconocido';
        const qty = (item as any)?.quantity || 1;
        const price = ((item as any)?.unitPrice || (item as any)?.menuItem?.price || 0) * qty;
        const existing = products.find(p => p.name === name);
        if (existing) { existing.orders += qty; existing.revenue += price; }
        else products.push({ name, orders: qty, revenue: price });
      }
    }
    return products.sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [stats.orders]);

  // Category breakdown from real orders
  const categoryBreakdown = useMemo(() => {
    const catRevenue: Record<string, number> = {};
    const catIdToName: Record<string, string> = {};
    for (const cat of categories) catIdToName[cat.id] = cat.name;

    for (const order of stats.orders) {
      const items = Array.isArray(order.items) ? order.items : [];
      for (const item of items) {
        const catId = (item as any)?.menuItem?.categoryId || '';
        const qty = (item as any)?.quantity || 1;
        const price = ((item as any)?.unitPrice || (item as any)?.menuItem?.price || 0) * qty;
        const catName = catIdToName[catId] || 'Otros';
        catRevenue[catName] = (catRevenue[catName] || 0) + price;
      }
    }
    const total = Object.values(catRevenue).reduce((s, v) => s + v, 0) || 1;
    const colors = ['hsl(24, 95%, 50%)', 'hsl(38, 92%, 50%)', 'hsl(152, 60%, 42%)', 'hsl(210, 80%, 55%)', 'hsl(340, 65%, 55%)'];
    return Object.entries(catRevenue)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({ name, value: Math.round((value / total) * 100), color: colors[i % colors.length] }));
  }, [stats.orders, categories]);

  const activeOrders = stats.activeOrders;

  const summaryStats = [
    { label: 'Ventas totales', value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, sub: `${stats.totalOrders} pedidos` },
    { label: 'Pedidos activos', value: String(activeOrders.length), icon: ShoppingBag, sub: `de ${stats.totalOrders} totales` },
    { label: 'Ticket promedio', value: `$${Math.round(stats.avgTicket)}`, icon: CreditCard, sub: 'por pedido' },
    { label: 'Mesas con pedidos', value: String(Object.keys(stats.ordersByTable).length), icon: Users, sub: 'mesas registradas' },
  ];

  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando dashboard...</div>;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Flame className="h-7 w-7 text-primary" /> Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Datos en tiempo real desde la base de datos</p>
        </div>
      </div>

      <div className="flex gap-1 bg-muted/50 rounded-lg p-1 w-fit">
        <button onClick={() => setTab('overview')} className={`px-4 py-1.5 rounded-md text-xs font-heading font-semibold transition-colors ${tab === 'overview' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Resumen</button>
        <button onClick={() => setTab('forecast')} className={`px-4 py-1.5 rounded-md text-xs font-heading font-semibold transition-colors ${tab === 'forecast' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Forecasting & Compras</button>
      </div>

      {tab === 'forecast' ? <ForecastingPanel /> : <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {summaryStats.map(stat => (
            <div key={stat.label} className="bg-card rounded-xl p-4 shadow-card border border-border/50 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="h-9 w-9 rounded-lg bg-accent/60 flex items-center justify-center">
                  <stat.icon className="h-4.5 w-4.5 text-primary" />
                </div>
              </div>
              <p className="font-heading font-bold text-xl leading-tight">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
              <p className="text-[10px] text-muted-foreground/70 mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 bg-card rounded-xl p-5 shadow-card border border-border/50">
            <h2 className="font-heading font-semibold text-sm flex items-center gap-2 mb-4">
              <BarChart3 className="h-4 w-4 text-primary" /> Ventas por hora
            </h2>
            {hourlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={hourlyData}>
                  <defs><linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(24, 95%, 50%)" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(24, 95%, 50%)" stopOpacity={0} /></linearGradient></defs>
                  <XAxis dataKey="hour" tick={{ fontSize: 11, fill: 'hsl(20, 10%, 45%)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(20, 10%, 45%)' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: 'hsl(0,0%,100%)', border: '1px solid hsl(35,15%,90%)', borderRadius: '8px', fontSize: '12px' }} formatter={(v: number) => [`$${v.toLocaleString()}`, 'Ventas']} />
                  <Area type="monotone" dataKey="ventas" stroke="hsl(24, 95%, 50%)" strokeWidth={2.5} fill="url(#salesGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground text-center py-10">Sin datos de ventas por hora</p>}
          </div>

          <div className="lg:col-span-2 bg-card rounded-xl p-5 shadow-card border border-border/50">
            <h2 className="font-heading font-semibold text-sm flex items-center gap-2 mb-4">
              <Utensils className="h-4 w-4 text-primary" /> Ventas por categoría
            </h2>
            {categoryBreakdown.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={140} height={140}>
                  <PieChart><Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={2} stroke="hsl(0,0%,100%)">{categoryBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}</Pie></PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 flex-1">
                  {categoryBreakdown.map(cat => (
                    <div key={cat.name} className="flex items-center gap-2"><div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} /><span className="text-xs flex-1">{cat.name}</span><span className="font-heading font-semibold text-xs">{cat.value}%</span></div>
                  ))}
                </div>
              </div>
            ) : <p className="text-sm text-muted-foreground text-center py-10">Sin datos de categorías</p>}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <h2 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2">
              <Flame className="h-4 w-4 text-primary" /> Top productos
            </h2>
            {topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((product, i) => (
                  <div key={product.name} className="flex items-center gap-3">
                    <span className={`font-heading font-bold text-sm w-6 h-6 rounded-full flex items-center justify-center ${i === 0 ? 'bg-primary text-primary-foreground' : i === 1 ? 'bg-warning text-warning-foreground' : 'bg-muted text-muted-foreground'}`}>{i + 1}</span>
                    <div className="flex-1 min-w-0"><p className="font-heading font-semibold text-sm truncate">{product.name}</p><p className="text-[11px] text-muted-foreground">{product.orders} pedidos</p></div>
                    <span className="font-heading font-semibold text-sm">${product.revenue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground text-center py-10">Sin ventas registradas</p>}
          </div>

          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <h2 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2">
              <ChefHat className="h-4 w-4 text-primary" /> Pedidos activos
              <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">{activeOrders.length}</span>
            </h2>
            {activeOrders.length > 0 ? (
              <div className="space-y-2.5">
                {activeOrders.slice(0, 5).map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
                    <div><p className="font-heading font-semibold text-sm">{order.id.slice(0, 8)}</p><p className="text-[11px] text-muted-foreground">Mesa {order.table_number}</p></div>
                    <div className="text-right">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${order.status === 'nuevo' ? 'bg-info/15 text-info' : order.status === 'preparando' ? 'bg-warning/15 text-warning' : 'bg-success/15 text-success'}`}>
                        {order.status === 'nuevo' ? '🔵 Nuevo' : order.status === 'preparando' ? '🟡 Cocina' : order.status === 'listo' ? '🟢 Listo' : '✅ Aceptado'}
                      </span>
                      <p className="text-xs font-heading font-semibold mt-1">${Number(order.total).toFixed(0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground text-center py-10">No hay pedidos activos</p>}
          </div>
        </div>
      </>}
    </div>
  );
}
