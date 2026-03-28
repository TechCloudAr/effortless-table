import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Status = 'exito' | 'error' | 'pendiente';

const statusConfig: Record<Status, { icon: typeof CheckCircle2; title: string; description: string; color: string }> = {
  exito: {
    icon: CheckCircle2,
    title: '¡Pago exitoso!',
    description: 'Tu pedido fue recibido y está siendo preparado.',
    color: 'text-green-500',
  },
  error: {
    icon: XCircle,
    title: 'Pago rechazado',
    description: 'No pudimos procesar tu pago. Intenta de nuevo o pide ayuda al mesero.',
    color: 'text-destructive',
  },
  pendiente: {
    icon: Clock,
    title: 'Pago pendiente',
    description: 'Tu pago está siendo procesado. Te notificaremos cuando se confirme.',
    color: 'text-warning',
  },
};

export default function PaymentResult({ status }: { status: Status }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order');
  const config = statusConfig[status];
  const Icon = config.icon;

  useEffect(() => {
    if (status === 'exito' && orderId) {
      supabase
        .from('orders')
        .update({ payment_status: 'approved', status: 'received' })
        .eq('id', orderId)
        .then();
    }
  }, [status, orderId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className={`mx-auto mb-6 h-20 w-20 rounded-full bg-muted flex items-center justify-center`}>
          <Icon className={`h-10 w-10 ${config.color}`} />
        </div>
        <h1 className="font-heading text-2xl font-bold mb-2">{config.title}</h1>
        <p className="text-muted-foreground mb-2">{config.description}</p>
        {orderId && (
          <p className="text-xs text-muted-foreground mb-8">Pedido: {orderId.slice(0, 8)}...</p>
        )}

        {status === 'exito' && orderId && (
          <Button onClick={() => navigate(`/pedido/${orderId}`)} className="w-full gradient-primary font-heading font-semibold h-12 mb-3">
            Ver estado del pedido <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}

        {status === 'error' && (
          <Button onClick={() => navigate(-1)} className="w-full font-heading font-semibold h-12 mb-3">
            Intentar de nuevo
          </Button>
        )}

        <Button variant="outline" onClick={() => navigate('/mesa/5')} className="w-full font-heading">
          Volver al menú
        </Button>
      </div>
    </div>
  );
}
