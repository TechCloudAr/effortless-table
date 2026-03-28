import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { restaurant } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function CartSheet() {
  const { items, itemCount, subtotal, tax, total, removeItem, updateQuantity, clearCart, tableNumber } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleConfirmOrder = () => {
    setOpen(false);
    clearCart();
    navigate(`/pedido/ORD-${Date.now().toString().slice(-4)}`);
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

        <Button onClick={handleConfirmOrder} className="w-full gradient-primary font-heading font-semibold h-12 text-base mt-2">
          Confirmar pedido
        </Button>
      </SheetContent>
    </Sheet>
  );
}
