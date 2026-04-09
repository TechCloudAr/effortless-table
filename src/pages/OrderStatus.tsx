import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, ChefHat, Package, Utensils, Star, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const steps = [
  { key: 'received', label: 'Pedido recibido', icon: CheckCircle2, description: 'Tu pedido fue registrado' },
  { key: 'paid', label: 'Pago confirmado', icon: CheckCircle2, description: 'Tu pedido ya está listo para cocina' },
  { key: 'preparing', label: 'En preparación', icon: ChefHat, description: 'El chef está preparando tu orden' },
  { key: 'ready', label: 'Listo', icon: Package, description: 'Tu pedido está listo para servir' },
  { key: 'delivered', label: 'Entregado', icon: Utensils, description: '¡Buen provecho!' },
] as const;

type OrderData = {
  id: string;
  status: string;
  table_number: number;
  total: number;
  created_at: string;
  restaurant_id: string | null;
};

export default function OrderStatus() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Fetch order + subscribe to realtime updates
  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      const { data } = await supabase
        .from('orders')
        .select('id, status, table_number, total, created_at')
        .eq('id', orderId)
        .single();
      if (data) setOrder(data as OrderData);
      setLoading(false);
    };

    fetchOrder();

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          setOrder(prev => prev ? { ...prev, ...payload.new } as OrderData : prev);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const currentStatus = order ? steps.findIndex(s => s.key === (order.status === 'pending_payment' ? 'received' : order.status)) : -1;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <p className="text-lg font-heading font-bold mb-2">Pedido no encontrado</p>
        <Button variant="outline" onClick={() => navigate('/')}>Volver al inicio</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-dark px-4 pt-6 pb-8">
        <button onClick={() => navigate(-1)} className="text-primary-foreground/60 mb-3 flex items-center gap-1 text-sm">
          <ArrowLeft className="h-4 w-4" /> Volver al menú
        </button>
        <h1 className="font-heading text-lg font-bold text-primary-foreground">Estado del pedido</h1>
        <p className="text-primary-foreground/60 text-sm mt-0.5">Pedido #{orderId?.slice(0, 8)}</p>
        <div className="mt-3 bg-primary-foreground/10 rounded-lg px-4 py-3 flex items-center gap-3">
          <Clock className="h-5 w-5 text-primary animate-pulse-soft" />
          <div>
            <p className="text-primary-foreground text-sm font-medium">
              {currentStatus >= 3 ? 'Entregado' : currentStatus >= 2 ? '¡Tu pedido está listo!' : 'Tiempo estimado'}
            </p>
            <p className="text-primary-foreground/70 text-xs">
              {currentStatus >= 3 ? '¡Buen provecho!' : currentStatus >= 2 ? 'Pasá a retirarlo' : '15–20 minutos'}
            </p>
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
        <Button variant="outline" className="w-full font-heading" onClick={() => navigate(`/mesa/${order.restaurant_id}/${order.table_number}`)}>
          Pedir algo más
        </Button>
      </div>
    </div>
  );
}
