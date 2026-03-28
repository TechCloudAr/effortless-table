import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, ChefHat, Package, Utensils, Star, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { restaurant } from '@/data/mockData';

const steps = [
  { key: 'received', label: 'Pedido recibido', icon: CheckCircle2, description: 'Tu pedido fue registrado' },
  { key: 'preparing', label: 'En preparación', icon: ChefHat, description: 'El chef está preparando tu orden' },
  { key: 'ready', label: 'Listo', icon: Package, description: 'Tu pedido está listo' },
  { key: 'delivered', label: 'Entregado', icon: Utensils, description: '¡Buen provecho!' },
] as const;

export default function OrderStatus() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [currentStatus] = useState<number>(1); // simulated: "preparing"
  const [rating, setRating] = useState(0);
  const [feedbackSent, setFeedbackSent] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-dark px-4 pt-6 pb-8">
        <button onClick={() => navigate(-1)} className="text-primary-foreground/60 mb-3 flex items-center gap-1 text-sm">
          <ArrowLeft className="h-4 w-4" /> Volver al menú
        </button>
        <h1 className="font-heading text-lg font-bold text-primary-foreground">Estado del pedido</h1>
        <p className="text-primary-foreground/60 text-sm mt-0.5">Pedido #{orderId}</p>
        <div className="mt-3 bg-primary-foreground/10 rounded-lg px-4 py-3 flex items-center gap-3">
          <Clock className="h-5 w-5 text-primary animate-pulse-soft" />
          <div>
            <p className="text-primary-foreground text-sm font-medium">Tiempo estimado</p>
            <p className="text-primary-foreground/70 text-xs">15–20 minutos</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="relative">
          {steps.map((step, i) => {
            const isActive = i <= currentStatus;
            const isCurrent = i === currentStatus;
            const Icon = step.icon;
            return (
              <div key={step.key} className="flex gap-4 mb-8 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                    isActive ? 'gradient-primary shadow-soft' : 'bg-muted border border-border'
                  }`}>
                    <Icon className={`h-5 w-5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-0.5 h-8 mt-1 rounded-full ${
                      i < currentStatus ? 'bg-primary' : 'bg-border'
                    }`} />
                  )}
                </div>
                <div className="pt-1.5">
                  <p className={`font-heading font-semibold text-sm ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                    {isCurrent && <span className="ml-2 text-xs text-primary animate-pulse-soft">• En curso</span>}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feedback section */}
      <div className="px-4 pb-8">
        <div className="bg-card rounded-xl p-5 shadow-card">
          <h3 className="font-heading font-semibold text-sm mb-2">¿Cómo estuvo tu experiencia?</h3>
          {feedbackSent ? (
            <p className="text-sm text-muted-foreground">¡Gracias por tu feedback! 🎉</p>
          ) : (
            <>
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setRating(n)} className="p-1">
                    <Star className={`h-6 w-6 transition-colors ${n <= rating ? 'fill-warning text-warning' : 'text-border'}`} />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <Button size="sm" variant="outline" onClick={() => setFeedbackSent(true)} className="font-heading">
                  Enviar
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="px-4 pb-8">
        <Button variant="outline" className="w-full font-heading" onClick={() => navigate(`/mesa/5`)}>
          Pedir algo más
        </Button>
      </div>
    </div>
  );
}
