import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Flame, QrCode, ChefHat, BarChart3, Smartphone, ArrowRight, Zap, Users, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { icon: QrCode, title: 'Escanear y pedir', description: 'El cliente escanea el QR de la mesa y accede al menú digital al instante.' },
  { icon: Smartphone, title: 'Menú interactivo', description: 'Explora categorías, personaliza productos y agrega al carrito sin fricción.' },
  { icon: ChefHat, title: 'Gestión en vivo', description: 'Recibe pedidos en tiempo real y controla el flujo operativo de la cocina.' },
  { icon: BarChart3, title: 'Analítica inteligente', description: 'Datos de comportamiento listos para IA: predicciones, upsell y eficiencia.' },
];

const metrics = [
  { value: '40%', label: 'menos tiempo de espera', icon: Clock },
  { value: '3x', label: 'pedidos más rápidos', icon: Zap },
  { value: '25%', label: 'mayor ticket promedio', icon: BarChart3 },
];

export default function Index() {
  const navigate = useNavigate();

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
          <Button size="sm" className="gradient-primary font-heading text-sm" onClick={() => navigate('/mesa/5')}>
            Ver demo
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-4 md:px-8 pt-12 pb-16 max-w-6xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <Zap className="h-3 w-3" /> Inspirado en la experiencia de restaurantes en China 2025
          </div>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-tight max-w-3xl mx-auto">
            Digitaliza la experiencia
            <span className="gradient-primary bg-clip-text text-transparent"> en mesa</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg mt-4 max-w-xl mx-auto leading-relaxed">
            Reduce trabajo duplicado, acelera el servicio y convierte cada pedido en una fuente de eficiencia, datos y crecimiento.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Button size="lg" className="gradient-primary font-heading font-semibold h-12 px-8 text-base" onClick={() => navigate('/mesa/5')}>
              Probar como cliente <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            <Button size="lg" variant="outline" className="font-heading h-12 px-8 text-base" onClick={() => navigate('/admin')}>
              Panel del restaurante
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Metrics */}
      <section className="px-4 md:px-8 pb-16 max-w-4xl mx-auto">
        <div className="grid grid-cols-3 gap-3">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-card rounded-xl p-4 md:p-6 shadow-card text-center"
            >
              <p className="font-heading font-bold text-2xl md:text-3xl text-primary">{m.value}</p>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">{m.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-4 md:px-8 pb-16 max-w-5xl mx-auto">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-center mb-8">
          Todo lo que tu restaurante necesita
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-card rounded-xl p-5 shadow-card flex gap-4"
            >
              <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                <f.icon className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-heading font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 md:px-8 pb-16 max-w-4xl mx-auto">
        <div className="gradient-dark rounded-2xl p-8 md:p-12 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground mb-3">
            ¿Listo para transformar tu restaurante?
          </h2>
          <p className="text-primary-foreground/70 text-sm md:text-base mb-6 max-w-md mx-auto">
            Implementa en minutos, sin hardware adicional. Solo QR y una conexión a internet.
          </p>
          <Button size="lg" className="gradient-primary font-heading font-semibold h-12 px-8" onClick={() => navigate('/mesa/5')}>
            Explorar la demo <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 md:px-8 py-6 text-center">
        <p className="text-xs text-muted-foreground">© 2025 Mesa Digital. Digitaliza la experiencia en mesa.</p>
      </footer>
    </div>
  );
}
