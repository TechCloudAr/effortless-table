import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import heroPhone from '@/assets/hero-phone-mockup.png';
import { Flame, QrCode, ChefHat, BarChart3, Smartphone, ArrowRight, Zap, Clock, TrendingDown, ShieldCheck, Brain, Eye, PackageSearch, AlertTriangle, Utensils, Timer, LayoutGrid, LineChart, Lightbulb, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRestaurant } from '@/hooks/useRestaurant';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const traditional = [
  'Cargar productos a mano',
  'Actualizar stock manualmente',
  'Armar reportes en Excel',
  'Adaptarte vos a la herramienta',
  'Depender de la memoria del mozo',
];

const mesaDigital = [
  'El cliente escanea, elige y paga',
  'Los datos se generan solos',
  'Reportes en tiempo real, sin tocar nada',
  'La app se adapta a tu negocio',
  'Decisiones basadas en datos, no intuición',
];

const layers = [
  {
    tag: 'Capa 1',
    title: 'Pedir fácil',
    description: 'El cliente escanea el QR, explora el menú, personaliza su pedido y paga. Sin mozo intermediario, sin esperas.',
    icon: Smartphone,
    bullets: ['QR por mesa, menú interactivo', 'Carrito y pago integrado', 'Cero fricción para el cliente'],
    color: 'from-primary/10 to-primary/5',
  },
  {
    tag: 'Capa 2',
    title: 'Operar mejor',
    description: 'Recibí pedidos en tiempo real, controlá tiempos de cocina, rotación de mesas y alertas operativas.',
    icon: ChefHat,
    bullets: ['Pedidos en vivo a cocina', 'Alertas de demora y cuellos de botella', 'Rotación y estado de mesas'],
    color: 'from-warning/10 to-warning/5',
  },
  {
    tag: 'Capa 3',
    title: 'Decidir mejor',
    description: 'Cada pedido alimenta tu inteligencia de negocio. Sabés qué vender, qué sacar y cuándo reforzar.',
    icon: Brain,
    bullets: ['Rentabilidad real por plato', 'Inteligencia de menú con IA', 'Forecasting y recomendaciones'],
    color: 'from-info/10 to-info/5',
  },
];

const metrics = [
  { value: '40%', label: 'menos tiempo de espera', icon: Clock },
  { value: '3x', label: 'pedidos más rápidos', icon: Zap },
  { value: '25%', label: 'mayor ticket promedio', icon: BarChart3 },
  { value: '30%', label: 'reducción de costos operativos', icon: TrendingDown },
];

const intelligence = [
  { icon: Eye, text: 'Sabe qué plato vende mucho pero te hace perder plata' },
  { icon: LayoutGrid, text: 'Te dice qué mover en el menú para vender más' },
  { icon: AlertTriangle, text: 'Detecta cuellos de botella en cocina antes de que exploten' },
  { icon: PackageSearch, text: 'Proyecta ventas y te sugiere qué comprar mañana' },
  { icon: Lightbulb, text: 'Identifica platos estrella, gancho, relleno y problema' },
  { icon: Bot, text: 'Recomendaciones de IA que mejoran con cada servicio' },
];

export default function Index() {
  const navigate = useNavigate();
  const { restaurant } = useRestaurant();
  const demoUrl = `/mesa/${restaurant.id}/5`;

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-4 md:px-8 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 gradient-primary rounded-xl flex items-center justify-center">
            <Flame className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-lg">Mesa Digital</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="font-heading text-sm" onClick={() => navigate('/admin')}>
            Acceso staff
          </Button>
          <Button size="sm" className="gradient-primary font-heading text-sm" onClick={() => navigate(demoUrl)}>
            Ver demo
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-4 md:px-8 pt-16 pb-20 max-w-5xl mx-auto text-center">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp} className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <Zap className="h-3 w-3" /> Se alimenta con el uso, no con carga manual
          </motion.div>
          <motion.h1 variants={fadeUp} className="font-heading text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] max-w-4xl mx-auto">
            Tu restaurante genera datos con cada pedido.{' '}
            <span className="gradient-primary bg-clip-text text-transparent">Nosotros los convertimos en decisiones.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-muted-foreground text-base md:text-lg mt-5 max-w-2xl mx-auto leading-relaxed">
            No cargás nada. El cliente pide, el sistema aprende. Vos decidís con datos reales, no con intuición.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Button size="lg" className="gradient-primary font-heading font-semibold h-12 px-8 text-base" onClick={() => navigate(demoUrl)}>
              Probar como cliente <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            <Button size="lg" variant="outline" className="font-heading h-12 px-8 text-base" onClick={() => navigate('/admin')}>
              Panel del restaurante
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Comparison: Traditional vs Mesa Digital */}
      <section className="px-4 md:px-8 pb-20 max-w-5xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
          <motion.h2 variants={fadeUp} className="font-heading text-2xl md:text-3xl font-bold text-center mb-3">
            Se adapta a vos, no vos a la app
          </motion.h2>
          <motion.p variants={fadeUp} className="text-muted-foreground text-center mb-10 max-w-lg mx-auto">
            Olvidate de cargar datos. Cada interacción de tus clientes alimenta tu sistema de inteligencia.
          </motion.p>
          <div className="grid md:grid-cols-2 gap-4">
            <motion.div variants={fadeUp} className="bg-card rounded-2xl p-6 border border-destructive/20">
              <p className="font-heading font-semibold text-destructive text-sm mb-4 uppercase tracking-wide">Software tradicional</p>
              <ul className="space-y-3">
                {traditional.map((t) => (
                  <li key={t} className="flex items-start gap-3 text-muted-foreground">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-destructive/40 flex-shrink-0" />
                    <span className="text-sm">{t}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div variants={fadeUp} className="bg-card rounded-2xl p-6 border border-primary/30 shadow-card">
              <p className="font-heading font-semibold text-primary text-sm mb-4 uppercase tracking-wide">Mesa Digital</p>
              <ul className="space-y-3">
                {mesaDigital.map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm">{t}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* 3 Layers */}
      <section className="px-4 md:px-8 pb-20 max-w-5xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
          <motion.h2 variants={fadeUp} className="font-heading text-2xl md:text-3xl font-bold text-center mb-3">
            3 capas, un solo sistema
          </motion.h2>
          <motion.p variants={fadeUp} className="text-muted-foreground text-center mb-10 max-w-lg mx-auto">
            Desde el pedido hasta la estrategia. Todo conectado, todo automático.
          </motion.p>
          <div className="grid md:grid-cols-3 gap-4">
            {layers.map((layer) => (
              <motion.div
                key={layer.title}
                variants={fadeUp}
                className={`bg-gradient-to-br ${layer.color} rounded-2xl p-6 border border-border`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{layer.tag}</span>
                </div>
                <div className="h-10 w-10 rounded-lg bg-card flex items-center justify-center mb-3 shadow-sm">
                  <layer.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-2">{layer.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{layer.description}</p>
                <ul className="space-y-2">
                  {layer.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {b}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Metrics */}
      <section className="px-4 md:px-8 pb-20 max-w-5xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {metrics.map((m) => (
              <motion.div
                key={m.label}
                variants={fadeUp}
                className="bg-card rounded-xl p-5 shadow-card text-center"
              >
                <m.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="font-heading font-bold text-2xl md:text-3xl text-primary">{m.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Intelligence */}
      <section className="px-4 md:px-8 pb-20 max-w-5xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
          <motion.h2 variants={fadeUp} className="font-heading text-2xl md:text-3xl font-bold text-center mb-3">
            Inteligencia que crece con tu negocio
          </motion.h2>
          <motion.p variants={fadeUp} className="text-muted-foreground text-center mb-10 max-w-lg mx-auto">
            Cada servicio genera más datos. Cada dato genera mejores decisiones.
          </motion.p>
          <div className="grid sm:grid-cols-2 gap-3">
            {intelligence.map((item) => (
              <motion.div
                key={item.text}
                variants={fadeUp}
                className="flex items-start gap-4 bg-card rounded-xl p-4 shadow-card"
              >
                <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-4.5 w-4.5 text-accent-foreground" />
                </div>
                <p className="text-sm leading-relaxed pt-1.5">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="px-4 md:px-8 pb-16 max-w-4xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <div className="gradient-dark rounded-2xl p-8 md:p-12 text-center">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground mb-3">
              Implementá en minutos. Sin hardware. Sin carga de datos.
            </h2>
            <p className="text-primary-foreground/70 text-sm md:text-base mb-6 max-w-md mx-auto">
              Solo un QR por mesa y una conexión a internet. Tu restaurante empieza a aprender desde el primer pedido.
            </p>
            <Button size="lg" className="gradient-primary font-heading font-semibold h-12 px-8" onClick={() => navigate(demoUrl)}>
              Explorar la demo <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 md:px-8 py-6 text-center">
        <p className="text-xs text-muted-foreground">© 2025 Mesa Digital — Tu restaurante, potenciado por datos.</p>
      </footer>
    </div>
  );
}
