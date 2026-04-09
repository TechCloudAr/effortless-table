import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Minus, Plus, Trash2, Loader2, Banknote, CreditCard } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useRestaurant } from '@/hooks/useRestaurant';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type PaymentMethod = 'mercadopago' | 'cash';

export default function CartSheet() {
  const { items, itemCount, subtotal, tax, total, removeItem, updateQuantity, clearCart, tableNumber, restaurantId, branchId } = useCart();
  const { restaurant } = useRestaurant(restaurantId || undefined);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mercadopago');

  const handleConfirmOrder = async () => {
    setLoading(true);
    try {
      const orderItems = items.map(i => ({
        name: i.menuItem.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        menuItemId: i.menuItem.id,
        selectedOptions: i.selectedOptions,
        notes: i.notes,
      }));

      const resolvedBranchId = branchId ?? (
        await supabase
          .from('branches')
          .select('id')
          .eq('restaurant_id', restaurant.id)
          .eq('is_active', true)
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle()
          .then(({ data, error }) => {
            if (error) throw error;
            if (!data?.id) throw new Error('No se encontró una sucursal activa para este restaurante');
            return data.id;
          })
      );

      if (paymentMethod === 'cash') {
        // Cash: create order as received, no payment gateway
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            restaurant_id: restaurant.id,
            branch_id: resolvedBranchId,
            table_number: tableNumber,
            items: orderItems,
            subtotal,
            tax,
            total,
            status: 'received',
            payment_status: 'cash',
          })
          .select('id')
          .single();

        if (orderError || !order) throw new Error(orderError?.message || 'Error creating order');

        clearCart();
        setOpen(false);
        toast.success('¡Pedido enviado! Pagá en mostrador.');
        navigate(`/pedido/${order.id}`);
        return;
      }

      // MercadoPago flow
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          restaurant_id: restaurant.id,
          branch_id: resolvedBranchId,
          table_number: tableNumber,
          items: orderItems,
          subtotal,
          tax,
          total,
          status: 'pending_payment',
          payment_status: 'pending',
        })
        .select('id')
        .single();

      if (orderError || !order) throw new Error(orderError?.message || 'Error creating order');

      const backUrl = window.location.origin;
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { orderId: order.id, items: orderItems, total, tableNumber, backUrl },
      });

      if (error) throw new Error(error.message || 'Error creating payment');

      const paymentUrl = data.sandboxInitPoint || data.initPoint;
      if (paymentUrl) {
        clearCart();
        setOpen(false);
        window.location.href = paymentUrl;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      toast.error(err?.message || 'Error al procesar el pedido. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (itemCount === 0) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="fixed bottom-4 left-4 right-4 z-50 gradient-primary text-primary-foreground rounded-xl px-5 py-3.5 flex items-center justify-between shadow-elevated animate-slide-up">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary-foreground/20 rounded-lg h-8 w-8 flex items-center justify-center">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <span className="font-heading font-semibold">
              {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}
            </span>
          </div>
          <span className="font-heading font-bold text-lg">{restaurant.currency}{total.toFixed(0)}</span>
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
        <SheetHeader className="text-left pb-2">
          <SheetTitle className="font-heading text-lg">Tu pedido — Mesa {tableNumber}</SheetTitle>
        </SheetHeader>

        <div className="space-y-3 py-3">
          {items.map(item => (
            <div key={item.cartId} className="flex gap-3 items-start">
              <img src={item.menuItem.image} alt={item.menuItem.name} className="h-14 w-14 rounded-md object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-heading font-semibold text-sm truncate">{item.menuItem.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {restaurant.currency}{item.unitPrice} c/u
                </p>
                {item.notes && <p className="text-xs text-muted-foreground italic mt-0.5">"{item.notes}"</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => updateQuantity(item.cartId, item.quantity - 1)} className="h-7 w-7 rounded-full border border-border flex items-center justify-center hover:bg-muted">
                  {item.quantity === 1 ? <Trash2 className="h-3 w-3 text-destructive" /> : <Minus className="h-3 w-3" />}
                </button>
                <span className="font-heading font-bold w-5 text-center text-sm">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.cartId, item.quantity + 1)} className="h-7 w-7 rounded-full border border-border flex items-center justify-center hover:bg-muted">
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        <div className="py-3 space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{restaurant.currency}{subtotal.toFixed(0)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">IVA (16%)</span><span>{restaurant.currency}{tax.toFixed(0)}</span></div>
          <Separator className="my-2" />
          <div className="flex justify-between font-heading font-bold text-base"><span>Total</span><span>{restaurant.currency}{total.toFixed(0)}</span></div>
        </div>

        {/* Payment method selector */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setPaymentMethod('mercadopago')}
            className={`flex-1 flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${
              paymentMethod === 'mercadopago'
                ? 'border-primary bg-primary/5'
                : 'border-border/50 bg-muted/30'
            }`}
          >
            <CreditCard className={`h-5 w-5 flex-shrink-0 ${paymentMethod === 'mercadopago' ? 'text-primary' : 'text-muted-foreground'}`} />
            <div>
              <p className="font-heading font-semibold text-xs">MercadoPago</p>
              <p className="text-[10px] text-muted-foreground">Tarjeta o digital</p>
            </div>
          </button>
          <button
            onClick={() => setPaymentMethod('cash')}
            className={`flex-1 flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${
              paymentMethod === 'cash'
                ? 'border-primary bg-primary/5'
                : 'border-border/50 bg-muted/30'
            }`}
          >
            <Banknote className={`h-5 w-5 flex-shrink-0 ${paymentMethod === 'cash' ? 'text-primary' : 'text-muted-foreground'}`} />
            <div>
              <p className="font-heading font-semibold text-xs">Efectivo</p>
              <p className="text-[10px] text-muted-foreground">Pagá en mostrador</p>
            </div>
          </button>
        </div>

        <Button
          onClick={handleConfirmOrder}
          disabled={loading}
          className="w-full gradient-primary font-heading font-semibold h-12 text-base mt-3"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : paymentMethod === 'cash' ? (
            <>Confirmar pedido — {restaurant.currency}{total.toFixed(0)}</>
          ) : (
            <>Pagar con MercadoPago — {restaurant.currency}{total.toFixed(0)}</>
          )}
        </Button>

        <p className="text-[11px] text-muted-foreground text-center mt-2">
          {paymentMethod === 'cash'
            ? 'Tu pedido será enviado y pagarás en efectivo en el mostrador'
            : 'Serás redirigido a MercadoPago para completar el pago'}
        </p>
      </SheetContent>
    </Sheet>
  );
}
