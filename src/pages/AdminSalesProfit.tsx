import { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Star, Anchor, Package, AlertTriangle, Clock, Users, ArrowUpRight, ArrowDownRight, Lightbulb, BarChart3, PieChart as PieChartIcon, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter, CartesianGrid, ZAxis, Legend } from 'recharts';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';

// --- MOCK DATA PER PERIOD ---

type Period = 'day' | 'week' | 'month' | 'custom';

type DateRange = { from: Date; to: Date };

const periodMultipliers: Record<string, number> = { day: 1, week: 1, month: 4.2 };

function getPeriodLabel(period: Period, customRange?: DateRange): string {
  if (period === 'day') return 'Hoy — Viernes 28 Mar, 2026';
  if (period === 'week') return 'Semana del 22 al 28 Mar';
  if (period === 'month') return 'Marzo 2026';
  if (customRange) {
    return `${format(customRange.from, "d MMM", { locale: es })} — ${format(customRange.to, "d MMM yyyy", { locale: es })}`;
  }
  return '';
}

function getMultiplier(period: Period, customRange?: DateRange): number {
  if (period === 'day') return 1 / 7;
  if (period === 'week') return 1;
  if (period === 'month') return 4.2;
  if (customRange) {
    const days = differenceInDays(customRange.to, customRange.from) + 1;
    return days / 7;
  }
  return 1;
}

const baseProductProfitability = [
  { name: 'Combo Fuego', sold: 187, revenue: 46563, cost: 18625, margin: 27938, marginPct: 60, views: 420, category: 'Combos' },
  { name: 'Burger Clásica', sold: 156, revenue: 29484, cost: 14040, margin: 15444, marginPct: 52, views: 380, category: 'Principales' },
  { name: 'Tacos al Pastor', sold: 134, revenue: 21306, cost: 8040, margin: 13266, marginPct: 62, views: 310, category: 'Principales' },
  { name: 'Nachos Supremos', sold: 128, revenue: 19072, cost: 8960, margin: 10112, marginPct: 53, views: 290, category: 'Entradas' },
  { name: 'Combo Familiar', sold: 89, revenue: 35511, cost: 16020, margin: 19491, marginPct: 55, views: 210, category: 'Combos' },
  { name: 'Churros con Chocolate', sold: 112, revenue: 9968, cost: 3360, margin: 6608, marginPct: 66, views: 250, category: 'Postres' },
  { name: 'Limonada Fuego', sold: 198, revenue: 13860, cost: 3960, margin: 9900, marginPct: 71, views: 340, category: 'Bebidas' },
  { name: 'Quesadilla Triple', sold: 76, revenue: 15960, cost: 9120, margin: 6840, marginPct: 43, views: 180, category: 'Principales' },
  { name: 'Alitas BBQ', sold: 95, revenue: 17100, cost: 10450, margin: 6650, marginPct: 39, views: 260, category: 'Entradas' },
  { name: 'Ensalada César', sold: 42, revenue: 6300, cost: 3780, margin: 2520, marginPct: 40, views: 150, category: 'Principales' },
  { name: 'Helado Artesanal', sold: 67, revenue: 5360, cost: 2010, margin: 3350, marginPct: 63, views: 130, category: 'Postres' },
  { name: 'Agua Mineral', sold: 230, revenue: 6900, cost: 1380, margin: 5520, marginPct: 80, views: 90, category: 'Bebidas' },
];

function getProductData(period: Period) {
  if (period === 'week') return baseProductProfitability;
  const m = period === 'day' ? 1 / 7 : periodMultipliers.month;
  return baseProductProfitability.map(p => ({
    ...p,
    sold: Math.round(p.sold * m),
    revenue: Math.round(p.revenue * m),
    cost: Math.round(p.cost * m),
    margin: Math.round(p.margin * m),
    views: Math.round(p.views * m),
  }));
}

function getCategoryMargins(period: Period) {
  const base = [
    { name: 'Bebidas', revenue: 20760, cost: 5340, margin: 15420, marginPct: 74 },
    { name: 'Postres', revenue: 15328, cost: 5370, margin: 9958, marginPct: 65 },
    { name: 'Combos', revenue: 82074, cost: 34645, margin: 47429, marginPct: 58 },
    { name: 'Principales', revenue: 73050, cost: 34980, margin: 38070, marginPct: 52 },
    { name: 'Entradas', revenue: 36172, cost: 19410, margin: 16762, marginPct: 46 },
  ];
  if (period === 'week') return base;
  const m = period === 'day' ? 1 / 7 : periodMultipliers.month;
  return base.map(c => ({
    ...c,
    revenue: Math.round(c.revenue * m),
    cost: Math.round(c.cost * m),
    margin: Math.round(c.margin * m),
  }));
}

const ticketByHour = [
  { hour: '10-11', ticket: 285, orders: 12 },
  { hour: '11-12', ticket: 340, orders: 18 },
  { hour: '12-13', ticket: 420, orders: 32 },
  { hour: '13-14', ticket: 465, orders: 38 },
  { hour: '14-15', ticket: 380, orders: 22 },
  { hour: '18-19', ticket: 310, orders: 15 },
  { hour: '19-20', ticket: 395, orders: 28 },
  { hour: '20-21', ticket: 510, orders: 42 },
  { hour: '21-22', ticket: 480, orders: 36 },
  { hour: '22-23', ticket: 350, orders: 18 },
];

const ticketByTable = [
  { mesa: 'Mesa 1', ticket: 520, orders: 8 },
  { mesa: 'Mesa 2', ticket: 380, orders: 12 },
  { mesa: 'Mesa 3', ticket: 610, orders: 6 },
  { mesa: 'Mesa 4', ticket: 290, orders: 14 },
  { mesa: 'Mesa 5', ticket: 445, orders: 10 },
  { mesa: 'Mesa 6', ticket: 350, orders: 11 },
  { mesa: 'Mesa 7', ticket: 680, orders: 5 },
  { mesa: 'Mesa 8', ticket: 310, orders: 13 },
];

// BCG-like matrix
const medianSold = 110;
const medianMargin = 55;

function classifyProduct(p: { sold: number; marginPct: number }, medSold: number) {
  const highPop = p.sold >= medSold;
  const highMargin = p.marginPct >= medianMargin;
  if (highPop && highMargin) return { type: '⭐ Estrella', color: 'hsl(38, 92%, 50%)', desc: 'Alta venta + alto margen' };
  if (highPop && !highMargin) return { type: '🪝 Gancho', color: 'hsl(210, 80%, 55%)', desc: 'Alta venta, bajo margen' };
  if (!highPop && highMargin) return { type: '📦 Relleno', color: 'hsl(152, 60%, 42%)', desc: 'Baja venta, alto margen' };
  return { type: '⚠️ Problema', color: 'hsl(0, 84%, 60%)', desc: 'Baja venta + bajo margen' };
}

const insights = [
  { type: 'profit', icon: Lightbulb, text: 'Tu Burger Clásica es el producto más vendido, pero el Combo Fuego deja 1.8x más margen por unidad.', action: 'Destacar Combo Fuego' },
  { type: 'warning', icon: AlertTriangle, text: 'Las Alitas BBQ tienen margen del 39%. Si sube el costo del pollo un 10%, pierden rentabilidad.', action: 'Revisar proveedor' },
  { type: 'profit', icon: TrendingUp, text: 'Bebidas tienen 74% de margen. Aumentar la visibilidad de Limonada Fuego podría sumar $2,800/semana.', action: 'Mover arriba en menú' },
  { type: 'warning', icon: AlertTriangle, text: 'Ensalada César vende poco (42 uds.) y tiene margen bajo (40%). Candidata a salir del menú.', action: 'Evaluar retiro' },
  { type: 'profit', icon: Star, text: 'El ticket promedio sube 32% entre las 20-21hs. Ideal para promos de combos premium.', action: 'Crear promo horaria' },
];

const COLORS_CAT = ['hsl(210, 80%, 55%)', 'hsl(340, 65%, 55%)', 'hsl(38, 92%, 50%)', 'hsl(24, 95%, 50%)', 'hsl(152, 60%, 42%)'];

type Tab = 'overview' | 'matrix' | 'tickets';

export default function AdminSalesProfit() {
  const [tab, setTab] = useState<Tab>('overview');
  const [period, setPeriod] = useState<Period>('week');

  const productProfitability = getProductData(period);
  const categoryMargins = getCategoryMargins(period);

  const medSold = period === 'day' ? Math.round(medianSold / 7) : period === 'month' ? Math.round(medianSold * 4.2) : medianSold;
  const classifiedProducts = productProfitability.map(p => ({
    ...p,
    classification: classifyProduct(p, medSold),
  }));

  const totalRevenue = productProfitability.reduce((s, p) => s + p.revenue, 0);
  const totalCost = productProfitability.reduce((s, p) => s + p.cost, 0);
  const totalMargin = totalRevenue - totalCost;
  const avgMarginPct = Math.round((totalMargin / totalRevenue) * 100);

  const stars = classifiedProducts.filter(p => p.classification.type.includes('Estrella'));
  const hooks = classifiedProducts.filter(p => p.classification.type.includes('Gancho'));
  const fillers = classifiedProducts.filter(p => p.classification.type.includes('Relleno'));
  const problems = classifiedProducts.filter(p => p.classification.type.includes('Problema'));

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold flex items-center gap-2">
            <DollarSign className="h-7 w-7 text-primary" /> Sales & Profit
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Rentabilidad real, no solo ventas — {periodLabels[period]}</p>
        </div>
        <div className="flex gap-1 bg-muted/50 rounded-lg p-1 w-fit">
          {([
            { id: 'day' as Period, label: 'Hoy' },
            { id: 'week' as Period, label: 'Semana' },
            { id: 'month' as Period, label: 'Mes' },
          ]).map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-heading font-semibold transition-colors flex items-center gap-1.5 ${period === p.id ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {period === p.id && <Calendar className="h-3 w-3" />}
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 rounded-lg p-1 w-fit">
        {[
          { id: 'overview' as Tab, label: 'Rentabilidad' },
          { id: 'matrix' as Tab, label: 'Matriz BCG' },
          { id: 'tickets' as Tab, label: 'Ticket Promedio' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-md text-xs font-heading font-semibold transition-colors ${tab === t.id ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="Ingresos brutos" value={`$${(totalRevenue / 1000).toFixed(1)}k`} sub={periodLabels[period]} icon={BarChart3} />
        <SummaryCard label="Costo total" value={`$${(totalCost / 1000).toFixed(1)}k`} sub={`${Math.round((totalCost / totalRevenue) * 100)}% del ingreso`} icon={Package} negative />
        <SummaryCard label="Margen bruto" value={`$${(totalMargin / 1000).toFixed(1)}k`} sub={`${avgMarginPct}% margen`} icon={TrendingUp} />
        <SummaryCard label="Producto más rentable" value="Limonada Fuego" sub="71% margen" icon={Star} />
      </div>

      {tab === 'overview' && <OverviewTab categoryMargins={categoryMargins} classifiedProducts={classifiedProducts} insights={insights} />}
      {tab === 'matrix' && <MatrixTab classifiedProducts={classifiedProducts} stars={stars} hooks={hooks} fillers={fillers} problems={problems} />}
      {tab === 'tickets' && <TicketsTab ticketByHour={ticketByHour} ticketByTable={ticketByTable} />}
    </div>
  );
}

function SummaryCard({ label, value, sub, icon: Icon, negative }: { label: string; value: string; sub: string; icon: any; negative?: boolean }) {
  return (
    <div className="bg-card rounded-xl p-4 shadow-card border border-border/50">
      <div className="flex items-center justify-between mb-2">
        <div className="h-9 w-9 rounded-lg bg-accent/60 flex items-center justify-center">
          <Icon className={`h-4 w-4 ${negative ? 'text-destructive' : 'text-primary'}`} />
        </div>
      </div>
      <p className="font-heading font-bold text-xl leading-tight">{value}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
      <p className="text-[10px] text-muted-foreground/70 mt-1">{sub}</p>
    </div>
  );
}

function OverviewTab({ categoryMargins, classifiedProducts, insights }: any) {
  return (
    <>
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Margen por categoría */}
        <div className="lg:col-span-3 bg-card rounded-xl p-5 shadow-card border border-border/50">
          <h2 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-primary" /> Margen por categoría
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={categoryMargins} layout="vertical" barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 15%, 90%)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(20, 10%, 45%)' }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} axisLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: 'hsl(20, 10%, 45%)' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip
                contentStyle={{ background: 'hsl(0,0%,100%)', border: '1px solid hsl(35,15%,90%)', borderRadius: '8px', fontSize: '12px' }}
                formatter={(v: number, name: string) => [`$${v.toLocaleString()}`, name === 'margin' ? 'Margen' : 'Costo']}
              />
              <Bar dataKey="cost" stackId="a" fill="hsl(0, 84%, 60%)" radius={[0, 0, 0, 0]} name="Costo" opacity={0.4} />
              <Bar dataKey="margin" stackId="a" fill="hsl(152, 60%, 42%)" radius={[0, 4, 4, 0]} name="Margen" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Margen % por categoría donut */}
        <div className="lg:col-span-2 bg-card rounded-xl p-5 shadow-card border border-border/50">
          <h2 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" /> % Margen por categoría
          </h2>
          <div className="space-y-3">
            {categoryMargins.sort((a: any, b: any) => b.marginPct - a.marginPct).map((cat: any, i: number) => (
              <div key={cat.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">{cat.name}</span>
                  <span className="font-heading font-bold" style={{ color: COLORS_CAT[i] }}>{cat.marginPct}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${cat.marginPct}%`, backgroundColor: COLORS_CAT[i] }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top productos por margen absoluto */}
      <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
        <h2 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" /> Productos: Más vendidos vs Más rentables
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground text-xs border-b border-border">
                <th className="pb-2 pr-4">Producto</th>
                <th className="pb-2 pr-4">Tipo</th>
                <th className="pb-2 pr-4 text-right">Vendidos</th>
                <th className="pb-2 pr-4 text-right">Ingreso</th>
                <th className="pb-2 pr-4 text-right">Costo</th>
                <th className="pb-2 pr-4 text-right">Margen $</th>
                <th className="pb-2 text-right">Margen %</th>
              </tr>
            </thead>
            <tbody>
              {classifiedProducts
                .sort((a: any, b: any) => b.margin - a.margin)
                .map((p: any) => (
                  <tr key={p.name} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 pr-4 font-heading font-semibold">{p.name}</td>
                    <td className="py-2.5 pr-4">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${p.classification.color}20`, color: p.classification.color }}>
                        {p.classification.type}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-right">{p.sold}</td>
                    <td className="py-2.5 pr-4 text-right">${p.revenue.toLocaleString()}</td>
                    <td className="py-2.5 pr-4 text-right text-muted-foreground">${p.cost.toLocaleString()}</td>
                    <td className="py-2.5 pr-4 text-right font-heading font-semibold text-success">${p.margin.toLocaleString()}</td>
                    <td className="py-2.5 text-right">
                      <span className={`font-heading font-bold ${p.marginPct >= 55 ? 'text-success' : p.marginPct >= 45 ? 'text-warning' : 'text-destructive'}`}>
                        {p.marginPct}%
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights accionables */}
      <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
        <h2 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" /> Insights de rentabilidad
        </h2>
        <div className="space-y-3">
          {insights.map((insight: any, i: number) => (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${insight.type === 'warning' ? 'bg-destructive/5' : 'bg-success/5'}`}>
              <insight.icon className={`h-4 w-4 mt-0.5 shrink-0 ${insight.type === 'warning' ? 'text-destructive' : 'text-success'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm">{insight.text}</p>
              </div>
              <button className="text-[11px] font-heading font-semibold text-primary whitespace-nowrap hover:underline">
                {insight.action} →
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function MatrixTab({ classifiedProducts, stars, hooks, fillers, problems }: any) {
  const scatterData = classifiedProducts.map((p: any) => ({
    x: p.sold,
    y: p.marginPct,
    z: p.revenue / 1000,
    name: p.name,
    fill: p.classification.color,
  }));

  const quadrants = [
    { label: '⭐ Estrellas', items: stars, color: 'hsl(38, 92%, 50%)', desc: 'Venden mucho y dejan buen margen. Proteger y potenciar.' },
    { label: '🪝 Ganchos', items: hooks, color: 'hsl(210, 80%, 55%)', desc: 'Atraen clientes pero margen bajo. Subir precio o reducir costo.' },
    { label: '📦 Rellenos', items: fillers, color: 'hsl(152, 60%, 42%)', desc: 'Buenos márgenes, pocas ventas. Aumentar visibilidad.' },
    { label: '⚠️ Problemas', items: problems, color: 'hsl(0, 84%, 60%)', desc: 'Ni venden ni dejan margen. Evaluar retiro o reformulación.' },
  ];

  return (
    <>
      {/* Scatter chart */}
      <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
        <h2 className="font-heading font-semibold text-sm mb-1 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" /> Matriz de Ingeniería de Menú
        </h2>
        <p className="text-xs text-muted-foreground mb-4">Eje X: unidades vendidas · Eje Y: % margen · Tamaño: ingreso total</p>
        <ResponsiveContainer width="100%" height={350}>
          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 15%, 90%)" />
            <XAxis type="number" dataKey="x" name="Vendidos" tick={{ fontSize: 11, fill: 'hsl(20, 10%, 45%)' }} axisLine={false} />
            <YAxis type="number" dataKey="y" name="Margen %" tick={{ fontSize: 11, fill: 'hsl(20, 10%, 45%)' }} axisLine={false} unit="%" domain={[30, 85]} />
            <ZAxis type="number" dataKey="z" range={[80, 400]} />
            <Tooltip
              contentStyle={{ background: 'hsl(0,0%,100%)', border: '1px solid hsl(35,15%,90%)', borderRadius: '8px', fontSize: '12px' }}
              formatter={(v: number, name: string) => {
                if (name === 'Vendidos') return [v, 'Unidades'];
                if (name === 'Margen %') return [`${v}%`, 'Margen'];
                return [v, name];
              }}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ''}
            />
            {/* Reference lines for quadrants */}
            <Scatter data={scatterData} shape={(props: any) => {
              const { cx, cy, payload } = props;
              return (
                <g>
                  <circle cx={cx} cy={cy} r={Math.sqrt(payload.z) * 2.5} fill={payload.fill} fillOpacity={0.7} stroke={payload.fill} strokeWidth={2} />
                  <text x={cx} y={cy - Math.sqrt(payload.z) * 2.5 - 6} textAnchor="middle" fontSize={10} fill="hsl(20, 10%, 45%)">{payload.name}</text>
                </g>
              );
            }} />
          </ScatterChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-muted-foreground">
          <span>← Baja venta | Alta venta →</span>
          <span className="text-muted-foreground/50">·</span>
          <span>↓ Bajo margen | Alto margen ↑</span>
        </div>
      </div>

      {/* Quadrant cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {quadrants.map(q => (
          <div key={q.label} className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <h3 className="font-heading font-semibold text-sm mb-1">{q.label}</h3>
            <p className="text-xs text-muted-foreground mb-3">{q.desc}</p>
            <div className="space-y-2">
              {q.items.length === 0 ? (
                <p className="text-xs text-muted-foreground/60 italic">Ningún producto en esta categoría</p>
              ) : (
                q.items.map((p: any) => (
                  <div key={p.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-heading font-semibold text-sm">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground">{p.sold} uds · {p.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-heading font-semibold text-sm">${p.margin.toLocaleString()}</p>
                      <p className="text-[10px] font-medium" style={{ color: q.color }}>{p.marginPct}% margen</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function TicketsTab({ ticketByHour, ticketByTable }: any) {
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Ticket por franja horaria */}
        <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
          <h2 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Ticket promedio por franja horaria
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ticketByHour} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 15%, 90%)" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: 'hsl(20, 10%, 45%)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(20, 10%, 45%)' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip
                contentStyle={{ background: 'hsl(0,0%,100%)', border: '1px solid hsl(35,15%,90%)', borderRadius: '8px', fontSize: '12px' }}
                formatter={(v: number, name: string) => name === 'ticket' ? [`$${v}`, 'Ticket promedio'] : [v, 'Pedidos']}
              />
              <Bar dataKey="ticket" fill="hsl(24, 95%, 50%)" radius={[6, 6, 0, 0]}>
                {ticketByHour.map((entry: any, i: number) => (
                  <Cell key={i} fill={entry.ticket >= 450 ? 'hsl(152, 60%, 42%)' : entry.ticket >= 350 ? 'hsl(24, 95%, 50%)' : 'hsl(38, 92%, 50%)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 text-[10px] text-muted-foreground justify-center">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success" /> &gt;$450</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> $350-$450</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warning" /> &lt;$350</span>
          </div>
        </div>

        {/* Ticket por mesa */}
        <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
          <h2 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Ticket promedio por mesa
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ticketByTable} barSize={28} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 15%, 90%)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(20, 10%, 45%)' }} axisLine={false} tickFormatter={v => `$${v}`} />
              <YAxis type="category" dataKey="mesa" tick={{ fontSize: 11, fill: 'hsl(20, 10%, 45%)' }} axisLine={false} tickLine={false} width={60} />
              <Tooltip
                contentStyle={{ background: 'hsl(0,0%,100%)', border: '1px solid hsl(35,15%,90%)', borderRadius: '8px', fontSize: '12px' }}
                formatter={(v: number) => [`$${v}`, 'Ticket promedio']}
              />
              <Bar dataKey="ticket" fill="hsl(24, 95%, 50%)" radius={[0, 6, 6, 0]}>
                {ticketByTable.map((entry: any, i: number) => (
                  <Cell key={i} fill={entry.ticket >= 500 ? 'hsl(152, 60%, 42%)' : entry.ticket >= 350 ? 'hsl(24, 95%, 50%)' : 'hsl(38, 92%, 50%)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 p-3 rounded-lg bg-accent/30">
            <p className="text-xs font-medium flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-primary" />
              <span>Mesa 7 tiene el ticket más alto ($680) pero menos pedidos. Mesa 4 tiene el ticket más bajo ($290) con alta rotación.</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
