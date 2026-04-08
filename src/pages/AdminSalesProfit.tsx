import { useState, useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Star, Package, AlertTriangle, Clock, Users, Lightbulb, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ScatterChart, Scatter, ZAxis, Cell } from 'recharts';
import { useSalesData } from '@/hooks/useSalesData';
import { useMenu } from '@/hooks/useMenu';

type Tab = 'overview' | 'matrix' | 'tickets';

const COLORS_CAT = ['hsl(210, 80%, 55%)', 'hsl(340, 65%, 55%)', 'hsl(38, 92%, 50%)', 'hsl(24, 95%, 50%)', 'hsl(152, 60%, 42%)'];

export default function AdminSalesProfit() {
  const [tab, setTab] = useState<Tab>('overview');
  const { stats, getProductCost, loading } = useSalesData();
  const { menuItems, categories } = useMenu();

  // Build product profitability from real data
  const productProfitability = useMemo(() => {
    const result: { name: string; id: string; sold: number; revenue: number; cost: number; margin: number; marginPct: number; category: string }[] = [];

    for (const order of stats.orders) {
      const items = Array.isArray(order.items) ? order.items : [];
      for (const item of items) {
        const id = (item as any)?.menuItem?.id || (item as any)?.id || 'unknown';
        const name = (item as any)?.menuItem?.name || (item as any)?.name || 'Desconocido';
        const qty = (item as any)?.quantity || 1;
        const price = ((item as any)?.unitPrice || (item as any)?.menuItem?.price || 0) * qty;
        const catId = (item as any)?.menuItem?.categoryId || '';
        const cat = categories.find(c => c.id === catId)?.name || 'Otros';

        const existing = result.find(p => p.id === id);
        if (existing) {
          existing.sold += qty;
          existing.revenue += price;
        } else {
          result.push({ name, id, sold: qty, revenue: price, cost: 0, margin: 0, marginPct: 0, category: cat });
        }
      }
    }

    // Calculate costs from ingredients
    for (const p of result) {
      const unitCost = getProductCost(p.id);
      p.cost = Math.round(unitCost * p.sold);
      p.margin = Math.round(p.revenue - p.cost);
      p.marginPct = p.revenue > 0 ? Math.round((p.margin / p.revenue) * 100) : 0;
    }

    return result.sort((a, b) => b.margin - a.margin);
  }, [stats.orders, categories, getProductCost]);

  // Category margins
  const categoryMargins = useMemo(() => {
    const cats: Record<string, { name: string; revenue: number; cost: number; margin: number; marginPct: number }> = {};
    for (const p of productProfitability) {
      if (!cats[p.category]) cats[p.category] = { name: p.category, revenue: 0, cost: 0, margin: 0, marginPct: 0 };
      cats[p.category].revenue += p.revenue;
      cats[p.category].cost += p.cost;
      cats[p.category].margin += p.margin;
    }
    return Object.values(cats).map(c => ({ ...c, marginPct: c.revenue > 0 ? Math.round((c.margin / c.revenue) * 100) : 0 })).sort((a, b) => b.marginPct - a.marginPct);
  }, [productProfitability]);

  // Ticket by table
  const ticketByTable = useMemo(() => {
    return Object.entries(stats.ordersByTable).map(([num, orders]) => {
      const total = orders.reduce((s, o) => s + Number(o.total), 0);
      return { mesa: `Mesa ${num}`, ticket: orders.length > 0 ? Math.round(total / orders.length) : 0, orders: orders.length };
    }).sort((a, b) => b.ticket - a.ticket);
  }, [stats.ordersByTable]);

  // Ticket by hour
  const ticketByHour = useMemo(() => {
    const hours: Record<string, { total: number; count: number }> = {};
    for (const o of stats.orders) {
      const h = new Date(o.created_at).getHours();
      const label = `${h}-${h + 1}`;
      if (!hours[label]) hours[label] = { total: 0, count: 0 };
      hours[label].total += Number(o.total);
      hours[label].count += 1;
    }
    return Object.entries(hours).map(([hour, d]) => ({ hour, ticket: Math.round(d.total / d.count), orders: d.count }));
  }, [stats.orders]);

  const totalRevenue = productProfitability.reduce((s, p) => s + p.revenue, 0);
  const totalCost = productProfitability.reduce((s, p) => s + p.cost, 0);
  const totalMargin = totalRevenue - totalCost;
  const avgMarginPct = totalRevenue > 0 ? Math.round((totalMargin / totalRevenue) * 100) : 0;

  // BCG classification
  const medianSold = useMemo(() => {
    const sorted = [...productProfitability].sort((a, b) => a.sold - b.sold);
    return sorted.length > 0 ? sorted[Math.floor(sorted.length / 2)].sold : 0;
  }, [productProfitability]);

  const medianMargin = useMemo(() => {
    const sorted = [...productProfitability].sort((a, b) => a.marginPct - b.marginPct);
    return sorted.length > 0 ? sorted[Math.floor(sorted.length / 2)].marginPct : 0;
  }, [productProfitability]);

  const classifiedProducts = useMemo(() => {
    return productProfitability.map(p => {
      const highPop = p.sold >= medianSold;
      const highMargin = p.marginPct >= medianMargin;
      let classification;
      if (highPop && highMargin) classification = { type: '⭐ Estrella', color: 'hsl(38, 92%, 50%)', desc: 'Alta venta + alto margen' };
      else if (highPop && !highMargin) classification = { type: '🪝 Gancho', color: 'hsl(210, 80%, 55%)', desc: 'Alta venta, bajo margen' };
      else if (!highPop && highMargin) classification = { type: '📦 Relleno', color: 'hsl(152, 60%, 42%)', desc: 'Baja venta, alto margen' };
      else classification = { type: '⚠️ Problema', color: 'hsl(0, 84%, 60%)', desc: 'Baja venta + bajo margen' };
      return { ...p, classification };
    });
  }, [productProfitability, medianSold, medianMargin]);

  const topRentable = productProfitability.length > 0 ? productProfitability[0] : null;

  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando datos de rentabilidad...</div>;

  if (stats.totalOrders === 0) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        <h1 className="font-heading text-2xl md:text-3xl font-bold flex items-center gap-2 mb-4"><DollarSign className="h-7 w-7 text-primary" /> Sales & Profit</h1>
        <div className="text-center py-16 text-muted-foreground"><p className="text-lg mb-2">Sin datos suficientes</p><p className="text-sm">Los reportes se generarán automáticamente cuando haya pedidos registrados</p></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold flex items-center gap-2"><DollarSign className="h-7 w-7 text-primary" /> Sales & Profit</h1>
        <p className="text-sm text-muted-foreground mt-1">Rentabilidad calculada desde pedidos reales</p>
      </div>

      <div className="flex gap-1 bg-muted/50 rounded-lg p-1 w-fit">
        {[{ id: 'overview' as Tab, label: 'Rentabilidad' }, { id: 'matrix' as Tab, label: 'Matriz BCG' }, { id: 'tickets' as Tab, label: 'Ticket Promedio' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-1.5 rounded-md text-xs font-heading font-semibold transition-colors ${tab === t.id ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>{t.label}</button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="Ingresos brutos" value={`$${(totalRevenue / 1000).toFixed(1)}k`} sub={`${stats.totalOrders} pedidos`} icon={BarChart3} />
        <SummaryCard label="Costo total" value={`$${(totalCost / 1000).toFixed(1)}k`} sub={totalRevenue > 0 ? `${Math.round((totalCost / totalRevenue) * 100)}% del ingreso` : ''} icon={Package} negative />
        <SummaryCard label="Margen bruto" value={`$${(totalMargin / 1000).toFixed(1)}k`} sub={`${avgMarginPct}% margen`} icon={TrendingUp} />
        <SummaryCard label="Más rentable" value={topRentable?.name || '-'} sub={topRentable ? `${topRentable.marginPct}% margen` : ''} icon={Star} />
      </div>

      {tab === 'overview' && <OverviewTab categoryMargins={categoryMargins} classifiedProducts={classifiedProducts} />}
      {tab === 'matrix' && <MatrixTab classifiedProducts={classifiedProducts} />}
      {tab === 'tickets' && <TicketsTab ticketByHour={ticketByHour} ticketByTable={ticketByTable} />}
    </div>
  );
}

function SummaryCard({ label, value, sub, icon: Icon, negative }: { label: string; value: string; sub: string; icon: any; negative?: boolean }) {
  return (
    <div className="bg-card rounded-xl p-4 shadow-card border border-border/50">
      <div className="flex items-center justify-between mb-2"><div className="h-9 w-9 rounded-lg bg-accent/60 flex items-center justify-center"><Icon className={`h-4 w-4 ${negative ? 'text-destructive' : 'text-primary'}`} /></div></div>
      <p className="font-heading font-bold text-xl leading-tight">{value}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
      <p className="text-[10px] text-muted-foreground/70 mt-1">{sub}</p>
    </div>
  );
}

function OverviewTab({ categoryMargins, classifiedProducts }: any) {
  return (
    <>
      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-card rounded-xl p-5 shadow-card border border-border/50">
          <h2 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2"><PieChartIcon className="h-4 w-4 text-primary" /> Margen por categoría</h2>
          {categoryMargins.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={categoryMargins} layout="vertical" barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 15%, 90%)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(20, 10%, 45%)' }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: 'hsl(20, 10%, 45%)' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ background: 'hsl(0,0%,100%)', border: '1px solid hsl(35,15%,90%)', borderRadius: '8px', fontSize: '12px' }} formatter={(v: number, name: string) => [`$${v.toLocaleString()}`, name === 'margin' ? 'Margen' : 'Costo']} />
                <Bar dataKey="cost" stackId="a" fill="hsl(0, 84%, 60%)" name="Costo" opacity={0.4} />
                <Bar dataKey="margin" stackId="a" fill="hsl(152, 60%, 42%)" radius={[0, 4, 4, 0]} name="Margen" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-muted-foreground text-center py-10">Sin datos</p>}
        </div>
        <div className="lg:col-span-2 bg-card rounded-xl p-5 shadow-card border border-border/50">
          <h2 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /> % Margen por categoría</h2>
          <div className="space-y-3">
            {categoryMargins.map((cat: any, i: number) => (
              <div key={cat.name}><div className="flex justify-between text-xs mb-1"><span className="font-medium">{cat.name}</span><span className="font-heading font-bold" style={{ color: COLORS_CAT[i % COLORS_CAT.length] }}>{cat.marginPct}%</span></div><div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${cat.marginPct}%`, backgroundColor: COLORS_CAT[i % COLORS_CAT.length] }} /></div></div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
        <h2 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Productos: Más vendidos vs Más rentables</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-muted-foreground text-xs border-b border-border"><th className="pb-2 pr-4">Producto</th><th className="pb-2 pr-4">Tipo</th><th className="pb-2 pr-4 text-right">Vendidos</th><th className="pb-2 pr-4 text-right">Ingreso</th><th className="pb-2 pr-4 text-right">Costo</th><th className="pb-2 pr-4 text-right">Margen $</th><th className="pb-2 text-right">Margen %</th></tr></thead>
            <tbody>
              {classifiedProducts.map((p: any) => (
                <tr key={p.name} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 pr-4 font-heading font-semibold">{p.name}</td>
                  <td className="py-2.5 pr-4"><span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${p.classification.color}20`, color: p.classification.color }}>{p.classification.type}</span></td>
                  <td className="py-2.5 pr-4 text-right">{p.sold}</td>
                  <td className="py-2.5 pr-4 text-right">${p.revenue.toLocaleString()}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">${p.cost.toLocaleString()}</td>
                  <td className="py-2.5 pr-4 text-right font-heading font-semibold text-success">${p.margin.toLocaleString()}</td>
                  <td className="py-2.5 text-right"><span className={`font-heading font-bold ${p.marginPct >= 55 ? 'text-success' : p.marginPct >= 45 ? 'text-warning' : 'text-destructive'}`}>{p.marginPct}%</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function MatrixTab({ classifiedProducts }: any) {
  const stars = classifiedProducts.filter((p: any) => p.classification.type.includes('Estrella'));
  const hooks = classifiedProducts.filter((p: any) => p.classification.type.includes('Gancho'));
  const fillers = classifiedProducts.filter((p: any) => p.classification.type.includes('Relleno'));
  const problems = classifiedProducts.filter((p: any) => p.classification.type.includes('Problema'));

  const scatterData = classifiedProducts.map((p: any) => ({ x: p.sold, y: p.marginPct, z: p.revenue / 1000, name: p.name, fill: p.classification.color }));

  const quadrants = [
    { label: '⭐ Estrellas', items: stars, color: 'hsl(38, 92%, 50%)', desc: 'Venden mucho y dejan buen margen.' },
    { label: '🪝 Ganchos', items: hooks, color: 'hsl(210, 80%, 55%)', desc: 'Atraen clientes pero margen bajo.' },
    { label: '📦 Rellenos', items: fillers, color: 'hsl(152, 60%, 42%)', desc: 'Buenos márgenes, pocas ventas.' },
    { label: '⚠️ Problemas', items: problems, color: 'hsl(0, 84%, 60%)', desc: 'Ni venden ni dejan margen.' },
  ];

  return (
    <>
      <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
        <h2 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Matriz de Ingeniería de Menú</h2>
        {scatterData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 15%, 90%)" />
              <XAxis type="number" dataKey="x" name="Vendidos" tick={{ fontSize: 11, fill: 'hsl(20, 10%, 45%)' }} axisLine={false} />
              <YAxis type="number" dataKey="y" name="Margen %" tick={{ fontSize: 11, fill: 'hsl(20, 10%, 45%)' }} axisLine={false} unit="%" />
              <ZAxis type="number" dataKey="z" range={[80, 400]} />
              <Tooltip contentStyle={{ background: 'hsl(0,0%,100%)', border: '1px solid hsl(35,15%,90%)', borderRadius: '8px', fontSize: '12px' }} />
              <Scatter data={scatterData} shape={(props: any) => {
                const { cx, cy, payload } = props;
                return (<g><circle cx={cx} cy={cy} r={Math.sqrt(payload.z) * 2.5} fill={payload.fill} fillOpacity={0.7} stroke={payload.fill} strokeWidth={2} /><text x={cx} y={cy - Math.sqrt(payload.z) * 2.5 - 6} textAnchor="middle" fontSize={10} fill="hsl(20, 10%, 45%)">{payload.name}</text></g>);
              }} />
            </ScatterChart>
          </ResponsiveContainer>
        ) : <p className="text-sm text-muted-foreground text-center py-10">Sin datos para la matriz</p>}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {quadrants.map(q => (
          <div key={q.label} className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <h3 className="font-heading font-semibold text-sm mb-1">{q.label}</h3>
            <p className="text-xs text-muted-foreground mb-3">{q.desc}</p>
            <div className="space-y-2">
              {q.items.length === 0 ? <p className="text-xs text-muted-foreground/60 italic">Ningún producto</p> : q.items.map((p: any) => (
                <div key={p.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <div><p className="font-heading font-semibold text-sm">{p.name}</p><p className="text-[11px] text-muted-foreground">{p.sold} uds · {p.category}</p></div>
                  <div className="text-right"><p className="font-heading font-semibold text-sm">${p.margin.toLocaleString()}</p><p className="text-[10px] font-medium" style={{ color: q.color }}>{p.marginPct}% margen</p></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function TicketsTab({ ticketByHour, ticketByTable }: any) {
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
        <h2 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Ticket promedio por franja horaria</h2>
        {ticketByHour.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ticketByHour} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 15%, 90%)" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: 'hsl(20, 10%, 45%)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(20, 10%, 45%)' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip contentStyle={{ background: 'hsl(0,0%,100%)', border: '1px solid hsl(35,15%,90%)', borderRadius: '8px', fontSize: '12px' }} formatter={(v: number) => [`$${v}`, 'Ticket promedio']} />
              <Bar dataKey="ticket" fill="hsl(24, 95%, 50%)" radius={[6, 6, 0, 0]}>
                {ticketByHour.map((entry: any, i: number) => <Cell key={i} fill={entry.ticket >= 450 ? 'hsl(152, 60%, 42%)' : entry.ticket >= 350 ? 'hsl(24, 95%, 50%)' : 'hsl(38, 92%, 50%)'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : <p className="text-sm text-muted-foreground text-center py-10">Sin datos por hora</p>}
      </div>
      <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
        <h2 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Ticket promedio por mesa</h2>
        {ticketByTable.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ticketByTable} barSize={28} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 15%, 90%)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(20, 10%, 45%)' }} axisLine={false} tickFormatter={v => `$${v}`} />
              <YAxis type="category" dataKey="mesa" tick={{ fontSize: 11, fill: 'hsl(20, 10%, 45%)' }} axisLine={false} tickLine={false} width={60} />
              <Tooltip contentStyle={{ background: 'hsl(0,0%,100%)', border: '1px solid hsl(35,15%,90%)', borderRadius: '8px', fontSize: '12px' }} formatter={(v: number) => [`$${v}`, 'Ticket promedio']} />
              <Bar dataKey="ticket" fill="hsl(24, 95%, 50%)" radius={[0, 6, 6, 0]}>
                {ticketByTable.map((entry: any, i: number) => <Cell key={i} fill={entry.ticket >= 500 ? 'hsl(152, 60%, 42%)' : entry.ticket >= 350 ? 'hsl(24, 95%, 50%)' : 'hsl(38, 92%, 50%)'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : <p className="text-sm text-muted-foreground text-center py-10">Sin datos por mesa</p>}
      </div>
    </div>
  );
}
