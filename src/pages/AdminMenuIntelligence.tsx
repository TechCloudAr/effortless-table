import { useState, useMemo } from 'react';
import { Brain, Eye, ShoppingCart, TrendingUp, TrendingDown, ArrowUp, ArrowDown, EyeOff, Lightbulb, Link2, AlertTriangle, Zap, BarChart3, MousePointerClick, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, FunnelChart, Funnel, LabelList } from 'recharts';

// --- MOCK DATA ---

const productPerformance = [
  { name: 'Combo Fuego', views: 420, addToCart: 245, purchased: 187, conversion: 44.5, avgTimeToDecide: 42, position: 1, category: 'Combos' },
  { name: 'Burger Clásica', views: 380, addToCart: 210, purchased: 156, conversion: 41.1, avgTimeToDecide: 38, position: 2, category: 'Principales' },
  { name: 'Limonada Fuego', views: 340, addToCart: 280, purchased: 198, conversion: 58.2, avgTimeToDecide: 12, position: 8, category: 'Bebidas' },
  { name: 'Tacos al Pastor', views: 310, addToCart: 178, purchased: 134, conversion: 43.2, avgTimeToDecide: 55, position: 3, category: 'Principales' },
  { name: 'Nachos Supremos', views: 290, addToCart: 160, purchased: 128, conversion: 44.1, avgTimeToDecide: 35, position: 4, category: 'Entradas' },
  { name: 'Alitas BBQ', views: 260, addToCart: 120, purchased: 95, conversion: 36.5, avgTimeToDecide: 68, position: 5, category: 'Entradas' },
  { name: 'Churros con Chocolate', views: 250, addToCart: 145, purchased: 112, conversion: 44.8, avgTimeToDecide: 22, position: 9, category: 'Postres' },
  { name: 'Combo Familiar', views: 210, addToCart: 108, purchased: 89, conversion: 42.4, avgTimeToDecide: 95, position: 6, category: 'Combos' },
  { name: 'Quesadilla Triple', views: 180, addToCart: 95, purchased: 76, conversion: 42.2, avgTimeToDecide: 48, position: 7, category: 'Principales' },
  { name: 'Ensalada César', views: 150, addToCart: 52, purchased: 42, conversion: 28.0, avgTimeToDecide: 120, position: 10, category: 'Principales' },
  { name: 'Helado Artesanal', views: 130, addToCart: 82, purchased: 67, conversion: 51.5, avgTimeToDecide: 18, position: 11, category: 'Postres' },
  { name: 'Agua Mineral', views: 90, addToCart: 88, purchased: 85, conversion: 94.4, avgTimeToDecide: 5, position: 12, category: 'Bebidas' },
];

const crossSellPairs = [
  { itemA: 'Burger Clásica', itemB: 'Limonada Fuego', frequency: 67, lift: 2.4 },
  { itemA: 'Tacos al Pastor', itemB: 'Nachos Supremos', frequency: 52, lift: 1.9 },
  { itemA: 'Combo Fuego', itemB: 'Churros con Chocolate', frequency: 48, lift: 1.7 },
  { itemA: 'Alitas BBQ', itemB: 'Limonada Fuego', frequency: 41, lift: 1.5 },
  { itemA: 'Quesadilla Triple', itemB: 'Helado Artesanal', frequency: 34, lift: 1.8 },
];

const categoryConversion = [
  { name: 'Bebidas', views: 430, conversion: 65.8, firstView: 32 },
  { name: 'Postres', views: 380, conversion: 47.1, firstView: 8 },
  { name: 'Combos', views: 630, conversion: 43.8, firstView: 45 },
  { name: 'Principales', views: 1020, conversion: 39.8, firstView: 78 },
  { name: 'Entradas', views: 550, conversion: 40.5, firstView: 22 },
];

const funnelData = [
  { name: 'Escaneo QR', value: 1200, fill: 'hsl(24, 95%, 50%)' },
  { name: 'Ven el menú', value: 1080, fill: 'hsl(38, 92%, 50%)' },
  { name: 'Abren producto', value: 820, fill: 'hsl(152, 60%, 42%)' },
  { name: 'Agregan al carrito', value: 580, fill: 'hsl(210, 80%, 55%)' },
  { name: 'Confirman pedido', value: 470, fill: 'hsl(280, 60%, 55%)' },
];

const recommendations = [
  { priority: 'alta', icon: ArrowUp, text: 'Mover Limonada Fuego a posición 3. Tiene 58% de conversión pero está en posición 8. Potencial de +35% en ventas.', category: 'visibility' },
  { priority: 'alta', icon: Link2, text: 'Sugerir Churros con Chocolate después de Combo Fuego. Se compran juntos 48 veces/semana con lift de 1.7x.', category: 'cross-sell' },
  { priority: 'alta', icon: EyeOff, text: 'Ensalada César tiene 150 views pero solo 28% convierte. Precio ($150) percibido como alto para la categoría.', category: 'pricing' },
  { priority: 'media', icon: Zap, text: 'Alitas BBQ tarda 68s en decidir (promedio: 42s). Agregar foto secundaria o reseña corta para acelerar decisión.', category: 'content' },
  { priority: 'media', icon: TrendingUp, text: 'Postres convierten mejor cuando aparecen después de Principales. Reorganizar el flujo del menú.', category: 'layout' },
  { priority: 'baja', icon: ArrowDown, text: 'Agua Mineral tiene 94% conversión pero solo 90 views. No necesita más visibilidad, es compra utilitaria.', category: 'info' },
  { priority: 'media', icon: AlertTriangle, text: 'Combo Familiar tiene 95s de tiempo de decisión. Es el más lento. Simplificar opciones o agregar "más elegido".', category: 'content' },
  { priority: 'alta', icon: TrendingDown, text: 'Principales tiene 39.8% conversión (la más baja). La categoría es la más vista (1020) pero convierte menos. Revisar precios y fotos.', category: 'pricing' },
];

const abandonedProducts = [
  { name: 'Alitas BBQ', addedTimes: 120, removedTimes: 25, abandonRate: 20.8 },
  { name: 'Combo Familiar', addedTimes: 108, removedTimes: 19, abandonRate: 17.6 },
  { name: 'Ensalada César', addedTimes: 52, removedTimes: 10, abandonRate: 19.2 },
  { name: 'Quesadilla Triple', addedTimes: 95, removedTimes: 19, abandonRate: 20.0 },
];

type Tab = 'funnel' | 'products' | 'recommendations';

export default function AdminMenuIntelligence() {
  const [tab, setTab] = useState<Tab>('funnel');
  const [weekOffset, setWeekOffset] = useState(0);

  const weekRange = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay() + 1 + weekOffset * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const fmt = (d: Date) => `${d.getDate()} ${months[d.getMonth()]}`;
    return `${fmt(start)} – ${fmt(end)}`;
  }, [weekOffset]);

  const avgConversion = (productPerformance.reduce((s, p) => s + p.conversion, 0) / productPerformance.length).toFixed(1);
  const avgDecisionTime = Math.round(productPerformance.reduce((s, p) => s + p.avgTimeToDecide, 0) / productPerformance.length);
  const highConversionCount = productPerformance.filter(p => p.conversion > 50).length;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Brain className="h-7 w-7 text-primary" /> Menu Intelligence
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <button onClick={() => setWeekOffset(w => w - 1)} className="p-1 rounded-md hover:bg-muted transition-colors">
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <span className="text-sm font-heading font-semibold text-muted-foreground">{weekRange}</span>
          <button onClick={() => setWeekOffset(w => Math.min(w + 1, 0))} className="p-1 rounded-md hover:bg-muted transition-colors" disabled={weekOffset >= 0}>
            <ChevronRight className={`h-4 w-4 ${weekOffset >= 0 ? 'text-muted-foreground/30' : 'text-muted-foreground'}`} />
          </button>
        </div>
      </div>

      <div className="flex gap-1 bg-muted/50 rounded-lg p-1 w-fit">
        {[
          { id: 'funnel' as Tab, label: 'Embudo & Categorías' },
          { id: 'products' as Tab, label: 'Por Producto' },
          { id: 'recommendations' as Tab, label: 'Recomendaciones' },
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

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Conversión promedio" value={`${avgConversion}%`} sub="View → compra" icon={MousePointerClick} />
        <StatCard label="Tiempo de decisión" value={`${avgDecisionTime}s`} sub="Promedio por producto" icon={Eye} />
        <StatCard label="Productos alta conv." value={`${highConversionCount}`} sub="Más de 50% conversión" icon={TrendingUp} />
        <StatCard label="Pares frecuentes" value={`${crossSellPairs.length}`} sub="Combinaciones detectadas" icon={Link2} />
      </div>

      {tab === 'funnel' && <FunnelTab />}
      {tab === 'products' && <ProductsTab />}
      {tab === 'recommendations' && <RecommendationsTab />}
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon }: { label: string; value: string; sub: string; icon: any }) {
  return (
    <div className="bg-card rounded-xl p-4 shadow-card border border-border/50">
      <div className="h-9 w-9 rounded-lg bg-accent/60 flex items-center justify-center mb-2">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="font-heading font-bold text-xl leading-tight">{value}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
      <p className="text-[10px] text-muted-foreground/70 mt-1">{sub}</p>
    </div>
  );
}

function FunnelTab() {
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Funnel */}
        <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
          <h2 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> Embudo de conversión
          </h2>
          <div className="space-y-2">
            {funnelData.map((step, i) => {
              const pct = Math.round((step.value / funnelData[0].value) * 100);
              const dropoff = i > 0 ? Math.round(((funnelData[i - 1].value - step.value) / funnelData[i - 1].value) * 100) : 0;
              return (
                <div key={step.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">{step.name}</span>
                    <span className="flex items-center gap-2">
                      <span className="font-heading font-bold">{step.value}</span>
                      {i > 0 && <span className="text-destructive text-[10px]">-{dropoff}%</span>}
                    </span>
                  </div>
                  <div className="h-6 bg-muted rounded-lg overflow-hidden relative">
                    <div className="h-full rounded-lg transition-all flex items-center" style={{ width: `${pct}%`, backgroundColor: step.fill }}>
                      <span className="text-[10px] font-bold text-white ml-2">{pct}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-accent/30">
            <p className="text-xs flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-primary shrink-0" />
              El mayor drop-off (30%) ocurre entre ver el menú y abrir un producto. Mejorar las fotos de portada puede reducirlo.
            </p>
          </div>
        </div>

        {/* Category conversion */}
        <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
          <h2 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-primary" /> Conversión por categoría
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryConversion.sort((a, b) => b.conversion - a.conversion)} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 15%, 90%)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(20, 10%, 45%)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(20, 10%, 45%)' }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip
                contentStyle={{ background: 'hsl(0,0%,100%)', border: '1px solid hsl(35,15%,90%)', borderRadius: '8px', fontSize: '12px' }}
                formatter={(v: number) => [`${v}%`, 'Conversión']}
              />
              <Bar dataKey="conversion" radius={[6, 6, 0, 0]}>
                {categoryConversion.sort((a, b) => b.conversion - a.conversion).map((entry, i) => (
                  <Cell key={i} fill={entry.conversion >= 50 ? 'hsl(152, 60%, 42%)' : entry.conversion >= 40 ? 'hsl(24, 95%, 50%)' : 'hsl(0, 84%, 60%)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 p-3 rounded-lg bg-accent/30">
            <p className="text-xs flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-primary shrink-0" />
              Principales es la categoría más vista (1020) pero la que menos convierte (39.8%). Revisar precios y presentación.
            </p>
          </div>
        </div>
      </div>

      {/* Category first view */}
      <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
        <h2 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" /> ¿Qué categoría miran primero?
        </h2>
        <p className="text-xs text-muted-foreground mb-3">% de clientes que interactúan con cada categoría primero</p>
        <div className="grid grid-cols-5 gap-3">
          {categoryConversion.sort((a, b) => b.firstView - a.firstView).map(cat => {
            const total = categoryConversion.reduce((s, c) => s + c.firstView, 0);
            const pct = Math.round((cat.firstView / total) * 100);
            return (
              <div key={cat.name} className="text-center p-3 rounded-lg bg-muted/40">
                <p className="font-heading font-bold text-2xl text-primary">{pct}%</p>
                <p className="text-xs font-medium mt-1">{cat.name}</p>
                <p className="text-[10px] text-muted-foreground">{cat.firstView} primeros clicks</p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function ProductsTab() {
  const [sortBy, setSortBy] = useState<'conversion' | 'views' | 'decision'>('conversion');

  const sorted = [...productPerformance].sort((a, b) => {
    if (sortBy === 'conversion') return b.conversion - a.conversion;
    if (sortBy === 'views') return b.views - a.views;
    return a.avgTimeToDecide - b.avgTimeToDecide;
  });

  return (
    <>
      {/* Product performance table */}
      <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-sm flex items-center gap-2">
            <MousePointerClick className="h-4 w-4 text-primary" /> Performance por producto
          </h2>
          <div className="flex gap-1 bg-muted/50 rounded-md p-0.5">
            {[
              { id: 'conversion' as const, label: 'Conversión' },
              { id: 'views' as const, label: 'Vistas' },
              { id: 'decision' as const, label: 'Decisión' },
            ].map(s => (
              <button key={s.id} onClick={() => setSortBy(s.id)} className={`px-2.5 py-1 rounded text-[10px] font-heading font-semibold transition-colors ${sortBy === s.id ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground text-xs border-b border-border">
                <th className="pb-2 pr-4">Pos</th>
                <th className="pb-2 pr-4">Producto</th>
                <th className="pb-2 pr-4 text-right">👁 Vistas</th>
                <th className="pb-2 pr-4 text-right">🛒 Carrito</th>
                <th className="pb-2 pr-4 text-right">✅ Comprado</th>
                <th className="pb-2 pr-4 text-right">Conv %</th>
                <th className="pb-2 text-right">⏱ Decisión</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p, i) => (
                <tr key={p.name} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 pr-4 text-muted-foreground text-xs">#{p.position}</td>
                  <td className="py-2.5 pr-4">
                    <p className="font-heading font-semibold">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">{p.category}</p>
                  </td>
                  <td className="py-2.5 pr-4 text-right">{p.views}</td>
                  <td className="py-2.5 pr-4 text-right">{p.addToCart}</td>
                  <td className="py-2.5 pr-4 text-right font-heading font-semibold">{p.purchased}</td>
                  <td className="py-2.5 pr-4 text-right">
                    <span className={`font-heading font-bold ${p.conversion >= 50 ? 'text-success' : p.conversion >= 40 ? 'text-foreground' : 'text-destructive'}`}>
                      {p.conversion}%
                    </span>
                  </td>
                  <td className="py-2.5 text-right">
                    <span className={`text-xs ${p.avgTimeToDecide <= 30 ? 'text-success' : p.avgTimeToDecide <= 60 ? 'text-warning' : 'text-destructive'}`}>
                      {p.avgTimeToDecide}s
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cross-sell pairs */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
          <h2 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2">
            <Link2 className="h-4 w-4 text-primary" /> Productos que se compran juntos
          </h2>
          <div className="space-y-3">
            {crossSellPairs.map((pair, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-semibold text-sm">{pair.itemA}</span>
                  <span className="text-muted-foreground text-xs">+</span>
                  <span className="font-heading font-semibold text-sm">{pair.itemB}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-heading font-semibold">{pair.frequency}x /sem</p>
                  <p className="text-[10px] text-success font-medium">Lift {pair.lift}x</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart abandonment */}
        <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
          <h2 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" /> Productos que frenan el carrito
          </h2>
          <p className="text-xs text-muted-foreground mb-3">Productos agregados al carrito pero removidos antes de confirmar</p>
          <div className="space-y-3">
            {abandonedProducts.sort((a, b) => b.abandonRate - a.abandonRate).map(p => (
              <div key={p.name} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-destructive font-heading font-bold">{p.abandonRate}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-destructive/60 transition-all" style={{ width: `${p.abandonRate * 4}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Agregado {p.addedTimes}x · Removido {p.removedTimes}x
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function RecommendationsTab() {
  const priorityOrder = { alta: 0, media: 1, baja: 2 };
  const sorted = [...recommendations].sort((a, b) => priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]);

  const categoryLabels: Record<string, string> = {
    visibility: '📍 Visibilidad',
    'cross-sell': '🔗 Cross-sell',
    pricing: '💰 Pricing',
    content: '📝 Contenido',
    layout: '🗂 Layout',
    info: 'ℹ️ Info',
  };

  return (
    <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
      <h2 className="font-heading font-semibold text-sm mb-1 flex items-center gap-2">
        <Zap className="h-4 w-4 text-primary" /> Recomendaciones accionables
      </h2>
      <p className="text-xs text-muted-foreground mb-4">Sugerencias basadas en el comportamiento de tus clientes</p>
      <div className="space-y-3">
        {sorted.map((rec, i) => (
          <div key={i} className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${
            rec.priority === 'alta' ? 'bg-primary/5 border-primary/20' :
            rec.priority === 'media' ? 'bg-warning/5 border-warning/20' :
            'bg-muted/30 border-border/50'
          }`}>
            <rec.icon className={`h-4 w-4 mt-0.5 shrink-0 ${
              rec.priority === 'alta' ? 'text-primary' : rec.priority === 'media' ? 'text-warning' : 'text-muted-foreground'
            }`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                  rec.priority === 'alta' ? 'bg-primary/15 text-primary' :
                  rec.priority === 'media' ? 'bg-warning/15 text-warning' :
                  'bg-muted text-muted-foreground'
                }`}>{rec.priority}</span>
                <span className="text-[10px] text-muted-foreground">{categoryLabels[rec.category]}</span>
              </div>
              <p className="text-sm">{rec.text}</p>
            </div>
            <button className="text-[11px] font-heading font-semibold text-primary whitespace-nowrap hover:underline mt-1">
              Aplicar →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
