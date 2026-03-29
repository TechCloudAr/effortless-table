import { TrendingUp, Package, AlertTriangle, Calendar, ShoppingCart } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const forecastData = [
  { day: 'Lun', real: 12400, forecast: 12000 },
  { day: 'Mar', real: 10800, forecast: 11500 },
  { day: 'Mié', real: 14200, forecast: 13800 },
  { day: 'Jue', real: 11600, forecast: 12200 },
  { day: 'Vie', real: 18900, forecast: 17500 },
  { day: 'Sáb', real: 22400, forecast: 21000 },
  { day: 'Dom', real: null, forecast: 19500 },
  { day: 'Lun*', real: null, forecast: 13200 },
  { day: 'Mar*', real: null, forecast: 12000 },
  { day: 'Mié*', real: null, forecast: 14500 },
  { day: 'Jue*', real: null, forecast: 12800 },
  { day: 'Vie*', real: null, forecast: 18200 },
  { day: 'Sáb*', real: null, forecast: 22800 },
  { day: 'Dom*', real: null, forecast: 20100 },
];

const ingredients = [
  { name: 'Carne Angus', current: '8 kg', needed: '22 kg', buy: '14 kg', cost: '$4,200', urgency: 'high' as const },
  { name: 'Pan Brioche', current: '40 u', needed: '120 u', buy: '80 u', cost: '$1,600', urgency: 'high' as const },
  { name: 'Queso Cheddar', current: '3 kg', needed: '8 kg', buy: '5 kg', cost: '$1,250', urgency: 'medium' as const },
  { name: 'Aguacate', current: '12 u', needed: '30 u', buy: '18 u', cost: '$900', urgency: 'medium' as const },
  { name: 'Tortillas', current: '200 u', needed: '350 u', buy: '150 u', cost: '$450', urgency: 'low' as const },
  { name: 'Chocolate', current: '2 kg', needed: '4 kg', buy: '2 kg', cost: '$380', urgency: 'low' as const },
];

const productAnalysis = [
  { name: 'Combo Fuego', margin: 68, trend: '+12%', projection: '~160 u/sem', risk: 'Demanda alta, asegurar stock carne' },
  { name: 'Burger Clásica', margin: 62, trend: '+5%', projection: '~125 u/sem', risk: 'Estable' },
  { name: 'Nachos Supremos', margin: 74, trend: '-2%', projection: '~100 u/sem', risk: 'Leve baja, considerar promo' },
  { name: 'Tacos al Pastor', margin: 71, trend: '+18%', projection: '~110 u/sem', risk: 'Crecimiento fuerte' },
  { name: 'Churros', margin: 82, trend: '+8%', projection: '~85 u/sem', risk: 'Máximo margen, empujar' },
];

export default function ForecastingPanel() {
  const forecastTotal = forecastData.filter(d => !d.real).reduce((s, d) => s + (d.forecast || 0), 0);

  return (
    <div className="space-y-4">
      {/* Forecast Chart */}
      <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading font-semibold text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Proyección de ventas
            </h2>
            <p className="text-xs text-muted-foreground">Semana actual + próxima semana</p>
          </div>
          <div className="text-right">
            <p className="font-heading font-bold text-lg text-primary">${(forecastTotal / 1000).toFixed(1)}k</p>
            <p className="text-[10px] text-muted-foreground">Proyectado próx. semana</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={forecastData}>
            <defs>
              <linearGradient id="realGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(24, 95%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(24, 95%, 50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(210, 80%, 55%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(210, 80%, 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(20, 10%, 45%)' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: 'hsl(0,0%,100%)', border: '1px solid hsl(35,15%,90%)', borderRadius: '8px', fontSize: '11px' }}
              formatter={(v: number | null, name: string) => [v ? `$${v.toLocaleString()}` : '—', name === 'real' ? 'Real' : 'Proyectado']}
            />
            <Area type="monotone" dataKey="real" stroke="hsl(24, 95%, 50%)" strokeWidth={2} fill="url(#realGrad)" connectNulls={false} />
            <Area type="monotone" dataKey="forecast" stroke="hsl(210, 80%, 55%)" strokeWidth={2} strokeDasharray="5 3" fill="url(#forecastGrad)" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 justify-center">
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><span className="h-2 w-4 rounded bg-primary inline-block" /> Real</span>
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><span className="h-2 w-4 rounded bg-info inline-block border border-dashed border-info" /> Proyectado</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Product Analysis */}
        <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
          <h2 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" /> Análisis de productos
          </h2>
          <div className="space-y-3">
            {productAnalysis.map(p => (
              <div key={p.name} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-heading font-semibold text-sm truncate">{p.name}</p>
                    <span className={`text-[10px] font-medium ${p.trend.startsWith('+') ? 'text-success' : 'text-destructive'}`}>{p.trend}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{p.projection} · {p.risk}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1">
                    <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${p.margin}%` }} />
                    </div>
                    <span className="text-[10px] font-heading font-semibold w-8">{p.margin}%</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground">margen</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ingredient Planning */}
        <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
          <h2 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-primary" /> Compras sugeridas
            <span className="ml-auto text-[10px] text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Próx. 7 días
            </span>
          </h2>
          <div className="space-y-2">
            {ingredients.map(ing => (
              <div key={ing.name} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                {ing.urgency === 'high' && <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />}
                {ing.urgency === 'medium' && <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />}
                {ing.urgency === 'low' && <div className="h-3.5 w-3.5 rounded-full bg-success/20 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-semibold text-xs truncate">{ing.name}</p>
                  <p className="text-[10px] text-muted-foreground">Tenés {ing.current} · Necesitás {ing.needed}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-heading font-bold text-xs text-primary">{ing.buy}</p>
                  <p className="text-[10px] text-muted-foreground">{ing.cost}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border/50 flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Total estimado</span>
            <span className="font-heading font-bold text-sm text-primary">$8,780</span>
          </div>
        </div>
      </div>
    </div>
  );
}
