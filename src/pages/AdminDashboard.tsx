import { useState } from 'react';
import { TrendingUp, TrendingDown, ShoppingBag, Clock, Users, DollarSign, ChefHat, Flame, Star, ArrowUpRight, Utensils, CreditCard, BarChart3, Target } from 'lucide-react';
import { demoOrders, tables, menuItems } from '@/data/mockData';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import ForecastingPanel from '@/components/admin/ForecastingPanel';

const hourlyData = [
  { hour: '10am', ventas: 1200 }, { hour: '11am', ventas: 2800 },
  { hour: '12pm', ventas: 5400 }, { hour: '1pm', ventas: 7200 },
  { hour: '2pm', ventas: 4800 }, { hour: '3pm', ventas: 2100 },
  { hour: '4pm', ventas: 1800 }, { hour: '5pm', ventas: 3200 },
  { hour: '6pm', ventas: 5800 }, { hour: '7pm', ventas: 8400 },
  { hour: '8pm', ventas: 9200 }, { hour: '9pm', ventas: 6100 },
];

const weeklyData = [
  { day: 'Lun', ingresos: 12400, pedidos: 38 },
  { day: 'Mar', ingresos: 10800, pedidos: 32 },
  { day: 'Mié', ingresos: 14200, pedidos: 45 },
  { day: 'Jue', ingresos: 11600, pedidos: 36 },
  { day: 'Vie', ingresos: 18900, pedidos: 58 },
  { day: 'Sáb', ingresos: 22400, pedidos: 72 },
  { day: 'Dom', ingresos: 19800, pedidos: 61 },
];

const categoryBreakdown = [
  { name: 'Principales', value: 42, color: 'hsl(24, 95%, 50%)' },
  { name: 'Combos', value: 28, color: 'hsl(38, 92%, 50%)' },
  { name: 'Entradas', value: 15, color: 'hsl(152, 60%, 42%)' },
  { name: 'Bebidas', value: 10, color: 'hsl(210, 80%, 55%)' },
  { name: 'Postres', value: 5, color: 'hsl(340, 65%, 55%)' },
];

const topProducts = [
  { name: 'Combo Fuego', orders: 23, revenue: 5727, trend: +12 },
  { name: 'Burger Clásica', orders: 18, revenue: 3402, trend: +5 },
  { name: 'Nachos Supremos', orders: 15, revenue: 2235, trend: -2 },
  { name: 'Tacos al Pastor', orders: 14, revenue: 2226, trend: +18 },
  { name: 'Churros con Chocolate', orders: 12, revenue: 1068, trend: +8 },
];

const stats = [
  { label: 'Ventas hoy', value: '$18,420', icon: DollarSign, change: '+12.5%', up: true, sub: 'vs ayer $16,373' },
  { label: 'Pedidos', value: '47', icon: ShoppingBag, change: '+8', up: true, sub: '6 en preparación' },
  { label: 'Ticket promedio', value: '$392', icon: CreditCard, change: '+5.2%', up: true, sub: 'Meta: $400' },
  { label: 'Tiempo medio', value: '14 min', icon: Clock, change: '-1.2 min', up: true, sub: 'Objetivo: 12 min' },
  { label: 'Mesas activas', value: `${tables.filter(t => t.status === 'occupied').length}/${tables.length}`, icon: Users, change: '', up: true, sub: '1 reservada' },
  { label: 'Satisfacción', value: '4.8', icon: Star, change: '+0.1', up: true, sub: '32 reseñas hoy' },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState<'overview' | 'forecast'>('overview');
  const activeOrders = demoOrders.filter(o => o.status !== 'delivered');
  const totalRevenue = weeklyData.reduce((s, d) => s + d.ingresos, 0);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Flame className="h-7 w-7 text-primary" /> Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Fuego & Sazón — Viernes 28 Mar, 2026</p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-accent/50 rounded-xl px-4 py-2">
          <Target className="h-4 w-4 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Meta diaria</p>
            <p className="font-heading font-bold text-sm">$18,420 / $20,000 <span className="text-primary">(92%)</span></p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab('overview')}
          className={`px-4 py-1.5 rounded-md text-xs font-heading font-semibold transition-colors ${tab === 'overview' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Resumen
        </button>
        <button
          onClick={() => setTab('forecast')}
          className={`px-4 py-1.5 rounded-md text-xs font-heading font-semibold transition-colors ${tab === 'forecast' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Forecasting & Compras
        </button>
      </div>

      {tab === 'forecast' ? <ForecastingPanel /> : <>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map(stat => (
          <div key={stat.label} className="bg-card rounded-xl p-4 shadow-card border border-border/50 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="h-9 w-9 rounded-lg bg-accent/60 flex items-center justify-center">
                <stat.icon className="h-4.5 w-4.5 text-primary" />
              </div>
              {stat.change && (
                <span className={`text-xs font-semibold flex items-center gap-0.5 ${stat.up ? 'text-success' : 'text-destructive'}`}>
                  {stat.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {stat.change}
                </span>
              )}
            </div>
            <p className="font-heading font-bold text-xl leading-tight">{stat.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
            <p className="text-[10px] text-muted-foreground/70 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-3 bg-card rounded-xl p-5 shadow-card border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-heading font-semibold text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" /> Ventas por hora
              </h2>
              <p className="text-xs text-muted-foreground">Hoy vs promedio semanal</p>
            </div>
            <div className="text-right">
              <p className="font-heading font-bold text-lg text-primary">$18,420</p>
              <p className="text-[10px] text-muted-foreground">Acumulado hoy</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(24, 95%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(24, 95%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: 'hsl(20, 10%, 45%)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(20, 10%, 45%)' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: 'hsl(0,0%,100%)', border: '1px solid hsl(35,15%,90%)', borderRadius: '8px', fontSize: '12px' }}
                formatter={(v: number) => [`$${v.toLocaleString()}`, 'Ventas']}
              />
              <Area type="monotone" dataKey="ventas" stroke="hsl(24, 95%, 50%)" strokeWidth={2.5} fill="url(#salesGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Bar Chart */}
        <div className="lg:col-span-2 bg-card rounded-xl p-5 shadow-card border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-heading font-semibold text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Esta semana
              </h2>
              <p className="text-xs text-muted-foreground">Ingresos diarios</p>
            </div>
            <p className="font-heading font-bold text-sm text-primary">${(totalRevenue / 1000).toFixed(1)}k</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData} barSize={24}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(20, 10%, 45%)' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: 'hsl(0,0%,100%)', border: '1px solid hsl(35,15%,90%)', borderRadius: '8px', fontSize: '12px' }}
                formatter={(v: number) => [`$${v.toLocaleString()}`, 'Ingresos']}
              />
              <Bar dataKey="ingresos" fill="hsl(24, 95%, 50%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Top Products */}
        <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
          <h2 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2">
            <Flame className="h-4 w-4 text-primary" /> Top productos
          </h2>
          <div className="space-y-3">
            {topProducts.map((product, i) => (
              <div key={product.name} className="flex items-center gap-3">
                <span className={`font-heading font-bold text-sm w-6 h-6 rounded-full flex items-center justify-center ${
                  i === 0 ? 'bg-primary text-primary-foreground' : i === 1 ? 'bg-warning text-warning-foreground' : 'bg-muted text-muted-foreground'
                }`}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-semibold text-sm truncate">{product.name}</p>
                  <p className="text-[11px] text-muted-foreground">{product.orders} pedidos</p>
                </div>
                <div className="text-right">
                  <span className="font-heading font-semibold text-sm">${product.revenue.toLocaleString()}</span>
                  <p className={`text-[10px] font-medium ${product.trend > 0 ? 'text-success' : 'text-destructive'}`}>
                    {product.trend > 0 ? '+' : ''}{product.trend}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
          <h2 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2">
            <Utensils className="h-4 w-4 text-primary" /> Ventas por categoría
          </h2>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={2} stroke="hsl(0,0%,100%)">
                  {categoryBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
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
        </div>

        {/* Active Orders */}
        <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
          <h2 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2">
            <ChefHat className="h-4 w-4 text-primary" /> Pedidos activos
            <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">{activeOrders.length}</span>
          </h2>
          <div className="space-y-2.5">
            {activeOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
                <div>
                  <p className="font-heading font-semibold text-sm">{order.id}</p>
                  <p className="text-[11px] text-muted-foreground">Mesa {order.tableNumber} · hace {Math.round((Date.now() - new Date(order.createdAt).getTime()) / 60000)} min</p>
                </div>
                <div className="text-right">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                    order.status === 'received' ? 'bg-info/15 text-info' :
                    order.status === 'preparing' ? 'bg-warning/15 text-warning' :
                    'bg-success/15 text-success'
                  }`}>
                    {order.status === 'received' ? '🔵 Nuevo' : order.status === 'preparing' ? '🟡 Cocina' : '🟢 Listo'}
                  </span>
                  <p className="text-xs font-heading font-semibold mt-1">${order.total.toFixed(0)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
