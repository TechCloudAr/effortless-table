import { useState, useMemo } from 'react';
import { TrendingUp, ShoppingBag, Clock, Users, DollarSign, ChefHat, Flame, Utensils, CreditCard, BarChart3, Timer, CalendarDays, Building2 } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';
import ForecastingPanel from '@/components/admin/ForecastingPanel';
import { useSalesData } from '@/hooks/useSalesData';
import { useMenu } from '@/hooks/useMenu';
import { useBranch } from '@/contexts/BranchContext';

type TimeRange = 'day' | 'week' | 'month' | '90d' | 'year';

const TIME_LABELS: Record<TimeRange, string> = { day: 'Hoy', week: 'Semana', month: 'Mes', '90d': '90 días', year: 'Año' };

/** Format currency short for axis ticks: $0, $500, $1,5k, $10k */
function fmtShort(v: number): string {
  if (v === 0) return '$0';
  if (v >= 1_000_000) return `$${(v / 1_000_000).toLocaleString('es-AR', { maximumFractionDigits: 1 })}M`;
  if (v >= 1000) return `$${(v / 1000).toLocaleString('es-AR', { maximumFractionDigits: 1 })}k`;
  return `$${Math.round(v).toLocaleString('es-AR')}`;
}

/** Format currency full for tooltips */
function fmtARS(v: number): string {
  return v.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

/** Custom tooltip component – Stripe/Linear style */
function ChartTooltipContent({ active, payload, label, prefix = '' }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/30 bg-card/95 backdrop-blur-md px-3 py-2 shadow-lg">
      <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
          <span className="text-[11px] font-medium tabular-nums">{prefix}{fmtARS(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function getTimeRangeStart(range: TimeRange): Date {
  const now = new Date();
  switch (range) {
    case 'day': return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'week': { const d = new Date(now); d.setDate(d.getDate() - 7); return d; }
    case 'month': { const d = new Date(now); d.setMonth(d.getMonth() - 1); return d; }
    case '90d': { const d = new Date(now); d.setDate(d.getDate() - 90); return d; }
    case 'year': { const d = new Date(now); d.setFullYear(d.getFullYear() - 1); return d; }
  }
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<'overview' | 'forecast'>('overview');
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const { stats, loading } = useSalesData();
  const { categories, menuItems } = useMenu();
  const { branches } = useBranch();
  const isMobile = useIsMobile();

  // Build menuItemId -> categoryId lookup from menu_items
  const menuItemCategoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const item of menuItems) {
      map[item.id] = item.categoryId;
    }
    return map;
  }, [menuItems]);

  const catIdToName = useMemo(() => {
    const map: Record<string, string> = {};
    for (const cat of categories) map[cat.id] = cat.name;
    return map;
  }, [categories]);

  // Filter orders by time range
  const filteredOrders = useMemo(() => {
    const start = getTimeRangeStart(timeRange);
    return stats.orders.filter(o => new Date(o.created_at) >= start);
  }, [stats.orders, timeRange]);

  // Summary stats from filtered orders
  const totalRevenue = useMemo(() => filteredOrders.reduce((s, o) => s + Number(o.total), 0), [filteredOrders]);
  const totalOrders = filteredOrders.length;
  const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Avg order time (paid_at → delivered_at)
  const avgOrderTime = useMemo(() => {
    const times: number[] = [];
    for (const o of filteredOrders) {
      const start = o.paid_at || o.preparing_at || o.created_at;
      const end = o.delivered_at;
      if (start && end) {
        const diffSec = (new Date(end).getTime() - new Date(start).getTime()) / 1000;
        if (diffSec > 0 && diffSec < 18000) times.push(diffSec);
      }
    }
    if (times.length === 0) return null;
    const avgSec = Math.round(times.reduce((s, t) => s + t, 0) / times.length);
    return avgSec >= 60 ? `${Math.round(avgSec / 60)} min` : `${avgSec} seg`;
  }, [filteredOrders]);

  // Avg preparation time (preparing_at → ready_at)
  const avgPrepTime = useMemo(() => {
    const times: number[] = [];
    for (const o of filteredOrders) {
      const start = o.preparing_at;
      const end = o.ready_at;
      if (start && end) {
        const diffSec = (new Date(end).getTime() - new Date(start).getTime()) / 1000;
        if (diffSec > 0 && diffSec < 18000) times.push(diffSec);
      }
    }
    if (times.length === 0) return null;
    const avgSec = Math.round(times.reduce((s, t) => s + t, 0) / times.length);
    return avgSec >= 60 ? `${Math.round(avgSec / 60)} min` : `${avgSec} seg`;
  }, [filteredOrders]);

  // Revenue per table (efficiency metric)
  const tablesWithOrders = useMemo(() => {
    const tables = new Set(filteredOrders.map(o => o.table_number));
    return tables.size;
  }, [filteredOrders]);
  const revenuePerTable = tablesWithOrders > 0 ? Math.round(totalRevenue / tablesWithOrders) : 0;

  // Build hourly data - always show all 24 hours
  const hourlyData = useMemo(() => {
    const hours: Record<number, number> = {};
    for (let i = 0; i < 24; i++) hours[i] = 0;
    for (const o of filteredOrders) {
      const h = new Date(o.created_at).getHours();
      hours[h] = (hours[h] || 0) + Number(o.total);
    }
    return Object.entries(hours)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([h]) => {
        const hour = Number(h);
        const label = `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'pm' : 'am'}`;
        return { hour: label, ventas: Math.round(hours[hour]) };
      });
  }, [filteredOrders]);

  // Sales trend - fill all periods
  const dailyTrend = useMemo(() => {
    if (timeRange === 'day') return [];

    if (timeRange === 'year') {
      // 12 months - only month name, no year
      const months: Record<string, number> = {};
      const orderedKeys: string[] = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleDateString('es', { month: 'short' });
        // Use index to avoid duplicate month names across years
        const uniqueKey = `${key}${i < now.getMonth() ? '' : ''}`;
        months[`${i}_${key}`] = 0;
        orderedKeys.push(`${i}_${key}`);
      }
      for (const o of filteredOrders) {
        const d = new Date(o.created_at);
        const monthsDiff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
        if (monthsDiff >= 0 && monthsDiff <= 11) {
          const k = orderedKeys[11 - monthsDiff];
          if (k) months[k] = (months[k] || 0) + Number(o.total);
        }
      }
      return orderedKeys.map(k => {
        const label = k.split('_')[1]; // just the month name
        return { dia: label.charAt(0).toUpperCase() + label.slice(1), ventas: Math.round(months[k]) };
      });
    }

    // week (7), month (30), 90d (90) - fill all days
    const numDays = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    const days: Record<string, number> = {};
    const now = new Date();
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = d.toLocaleDateString('es', { day: '2-digit', month: 'short' });
      days[key] = 0;
    }
    for (const o of filteredOrders) {
      const d = new Date(o.created_at);
      const key = d.toLocaleDateString('es', { day: '2-digit', month: 'short' });
      if (key in days) days[key] = (days[key] || 0) + Number(o.total);
    }
    return Object.entries(days).map(([dia, ventas]) => ({ dia, ventas: Math.round(ventas) }));
  }, [filteredOrders, timeRange]);

  // Top products from filtered orders
  const topProducts = useMemo(() => {
    const products: { name: string; orders: number; revenue: number }[] = [];
    for (const order of filteredOrders) {
      const items = Array.isArray(order.items) ? order.items : [];
      for (const item of items) {
        const name = (item as any)?.name || (item as any)?.menuItem?.name || 'Desconocido';
        const qty = (item as any)?.quantity || 1;
        const price = ((item as any)?.unitPrice || (item as any)?.menuItem?.price || 0) * qty;
        const existing = products.find(p => p.name === name);
        if (existing) { existing.orders += qty; existing.revenue += price; }
        else products.push({ name, orders: qty, revenue: price });
      }
    }
    return products.sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [filteredOrders]);

  // Category breakdown - use categoryId from item or lookup from menuItems
  const categoryBreakdown = useMemo(() => {
    const catRevenue: Record<string, number> = {};
    for (const order of filteredOrders) {
      const items = Array.isArray(order.items) ? order.items : [];
      for (const item of items) {
        const catId = (item as any)?.categoryId || (item as any)?.menuItem?.categoryId || menuItemCategoryMap[(item as any)?.menuItemId || ''] || '';
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
      .map(([name, value], i) => ({ name, value: Math.round((value / total) * 100), rawValue: Math.round(value), color: colors[i % colors.length] }));
  }, [filteredOrders, catIdToName, menuItemCategoryMap]);

  // Peak hour
  const peakHour = useMemo(() => {
    const hours: Record<number, number> = {};
    for (const o of filteredOrders) {
      const h = new Date(o.created_at).getHours();
      hours[h] = (hours[h] || 0) + 1;
    }
    let maxH = 0, maxCount = 0;
    for (const [h, c] of Object.entries(hours)) { if (c > maxCount) { maxH = Number(h); maxCount = c; } }
    return maxH > 0 ? `${maxH > 12 ? maxH - 12 : maxH || 12}${maxH >= 12 ? 'pm' : 'am'}` : '-';
  }, [filteredOrders]);

  // Orders by day of week
  const ordersByDayOfWeek = useMemo(() => {
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const days: Record<number, { orders: number; revenue: number }> = {};
    for (let i = 0; i < 7; i++) days[i] = { orders: 0, revenue: 0 };
    for (const o of filteredOrders) {
      const d = new Date(o.created_at).getDay();
      days[d].orders += 1;
      days[d].revenue += Number(o.total);
    }
    return Object.entries(days).map(([d, v]) => ({ dia: dayNames[Number(d)], pedidos: v.orders, ventas: Math.round(v.revenue) }));
  }, [filteredOrders]);

  const summaryStats = [
    { label: 'Ventas totales', value: fmtARS(totalRevenue), icon: DollarSign, sub: `${totalOrders} pedidos` },
    { label: 'Ticket promedio', value: fmtARS(Math.round(avgTicket)), icon: CreditCard, sub: 'por pedido' },
    { label: 'Tiempo promedio', value: avgOrderTime || 'Sin datos', icon: Timer, sub: avgPrepTime ? `Cocina: ${avgPrepTime}` : 'del pedido al entregado' },
    { label: 'Ingreso por mesa', value: fmtARS(revenuePerTable), icon: Users, sub: `${tablesWithOrders} mesas activas` },
  ];

  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando dashboard...</div>;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Flame className="h-7 w-7 text-primary" /> Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Datos en tiempo real</p>
        </div>
      </div>

      {/* Main tabs */}
      <div className="flex gap-1 bg-muted/50 rounded-lg p-1 w-fit">
        <button onClick={() => setTab('overview')} className={`px-4 py-1.5 rounded-md text-xs font-heading font-semibold transition-colors ${tab === 'overview' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Resumen</button>
        <button onClick={() => setTab('forecast')} className={`px-4 py-1.5 rounded-md text-xs font-heading font-semibold transition-colors ${tab === 'forecast' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Forecasting & Compras</button>
      </div>

      {tab === 'forecast' ? <ForecastingPanel /> : <>
        {/* Timeline filter */}
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
            {(['day', 'week', 'month', '90d', 'year'] as TimeRange[]).map(r => (
              <button key={r} onClick={() => setTimeRange(r)} className={`px-3 py-1 rounded-md text-[11px] font-heading font-semibold transition-colors ${timeRange === r ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                {TIME_LABELS[r]}
              </button>
            ))}
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {summaryStats.map(stat => (
            <div key={stat.label} className="bg-card rounded-xl p-4 shadow-card border border-border/50 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="h-9 w-9 rounded-lg bg-accent/60 flex items-center justify-center">
                  <stat.icon className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="font-heading font-bold text-xl leading-tight">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
              <p className="text-[10px] text-muted-foreground/70 mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>

        {branches.length > 1 && (
          <div>
            <h2 className="font-heading font-semibold text-sm flex items-center gap-2 mb-3">
              <Building2 className="h-4 w-4 text-primary" /> Comparativa por sucursal
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {branches.map(branch => {
                const branchOrders = filteredOrders.filter(o => o.branch_id === branch.id);
                const branchRevenue = branchOrders.reduce((s, o) => s + Number(o.total), 0);
                const branchAvg = branchOrders.length > 0 ? branchRevenue / branchOrders.length : 0;
                return (
                  <div key={branch.id} className="bg-card rounded-xl p-4 shadow-card border border-border/50">
                    <p className="font-heading font-semibold text-sm truncate">{branch.name}</p>
                    <p className="font-heading font-bold text-lg mt-1">{fmtARS(branchRevenue)}</p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                      <span>{branchOrders.length} pedidos</span>
                      <span>Ticket: {fmtARS(Math.round(branchAvg))}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 bg-card rounded-xl p-5 shadow-card border border-border/50">
            <h2 className="font-heading font-semibold text-sm flex items-center gap-2 mb-4">
              <BarChart3 className="h-4 w-4 text-primary" /> {timeRange === 'day' ? 'Ventas por hora' : 'Ventas diarias'}
            </h2>
            {(timeRange === 'day' ? hourlyData : dailyTrend).length > 0 ? (
              <ResponsiveContainer width="100%" height={isMobile ? 180 : 280}>
                <AreaChart data={timeRange === 'day' ? hourlyData : dailyTrend} margin={{ top: 4, right: 8, left: 0, bottom: isMobile ? 4 : 0 }}>
                  <defs><linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(24, 95%, 50%)" stopOpacity={0.15} /><stop offset="95%" stopColor="hsl(24, 95%, 50%)" stopOpacity={0.02} /></linearGradient></defs>
                  <XAxis dataKey={timeRange === 'day' ? 'hour' : 'dia'} tick={{ fontSize: isMobile ? 9 : 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} interval={timeRange === 'day' ? (isMobile ? 5 : 2) : (isMobile ? Math.max(1, Math.floor(dailyTrend.length / 6)) : (timeRange === 'year' ? 0 : 'preserveStartEnd'))} angle={isMobile && timeRange !== 'year' ? -45 : 0} textAnchor={isMobile && timeRange !== 'year' ? 'end' : 'middle'} height={isMobile ? 35 : 30} />
                  {!isMobile && <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={fmtShort} width={55} allowDecimals={false} tickCount={5} />}
                  <Tooltip content={<ChartTooltipContent />} cursor={{ stroke: 'hsl(var(--border))', strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="ventas" stroke="hsl(24, 95%, 50%)" strokeWidth={2} fill="url(#salesGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground text-center py-10">Sin datos de ventas</p>}
          </div>

          <div className="lg:col-span-2 bg-card rounded-xl p-5 shadow-card border border-border/50">
            <h2 className="font-heading font-semibold text-sm flex items-center gap-2 mb-4">
              <Utensils className="h-4 w-4 text-primary" /> Ventas por categoría
            </h2>
            {categoryBreakdown.length > 0 ? (
              <div className="flex items-center gap-4">
                <div style={{ width: isMobile ? 110 : 140, height: isMobile ? 110 : 140 }}>
                  <PieChart width={isMobile ? 110 : 140} height={isMobile ? 110 : 140}><Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={isMobile ? 30 : 40} outerRadius={isMobile ? 50 : 65} dataKey="value" strokeWidth={2} stroke="hsl(0,0%,100%)">{categoryBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}</Pie></PieChart>
                </div>
                <div className="space-y-2 flex-1">
                  {categoryBreakdown.map(cat => (
                    <div key={cat.name} className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-xs flex-1">{cat.name}</span>
                      <span className="font-heading font-semibold text-xs">{cat.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : <p className="text-sm text-muted-foreground text-center py-10">Sin datos de categorías</p>}
          </div>
        </div>

        {/* Charts row 2: Top products + Day of week heatmap + Peak hour */}
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
                    <span className="font-heading font-semibold text-sm">{fmtARS(product.revenue)}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground text-center py-10">Sin ventas registradas</p>}
          </div>

          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <h2 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" /> Ventas por día de la semana
              <span className="ml-auto text-[10px] text-muted-foreground font-normal">Hora pico: {peakHour}</span>
            </h2>
            {ordersByDayOfWeek.some(d => d.pedidos > 0) ? (
              <ResponsiveContainer width="100%" height={isMobile ? 180 : 240}>
                <BarChart data={ordersByDayOfWeek} barSize={isMobile ? 12 : 24} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <XAxis dataKey="dia" tick={{ fontSize: isMobile ? 9 : 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  {!isMobile && <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={fmtShort} width={55} allowDecimals={false} tickCount={5} />}
                  <Tooltip content={<ChartTooltipContent />} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
                  <Bar dataKey="ventas" fill="hsl(24, 95%, 50%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground text-center py-10">Sin datos</p>}
          </div>
        </div>
      </>}
    </div>
  );
}
