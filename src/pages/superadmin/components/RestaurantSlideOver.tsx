import { X, Building2, ShoppingBag, DollarSign, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatARS } from '../utils';

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
  table_number: number;
}

interface Branch {
  id: string;
  name: string;
  address: string | null;
  is_active: boolean;
}

interface Restaurant {
  id: string;
  name: string;
  created_at: string;
  owner_id: string;
}

interface RestaurantSlideOverProps {
  restaurant: Restaurant | null;
  orders: Order[];
  branches: Branch[];
  onClose: () => void;
}

export default function RestaurantSlideOver({ restaurant, orders, branches, onClose }: RestaurantSlideOverProps) {
  if (!restaurant) return null;

  const restOrders = orders.filter(o => (o as any).restaurant_id === restaurant.id);
  const revenue = restOrders.reduce((s, o) => s + Number(o.total), 0);
  const activeOrders = restOrders.filter(o => !['entregado', 'delivered', 'cancelled', 'cancelado'].includes(o.status));
  const restBranches = branches.filter(b => (b as any).restaurant_id === restaurant.id);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card border-l border-border shadow-xl overflow-y-auto animate-in slide-in-from-right">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10">
          <h2 className="font-heading font-bold text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {restaurant.name}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <ShoppingBag className="h-4 w-4 mx-auto text-primary mb-1" />
              <p className="font-bold text-lg">{restOrders.length}</p>
              <p className="text-[10px] text-muted-foreground">Pedidos</p>
            </div>
            <div className="text-center">
              <ShoppingBag className="h-4 w-4 mx-auto text-green-500 mb-1" />
              <p className="font-bold text-lg">{activeOrders.length}</p>
              <p className="text-[10px] text-muted-foreground">Activos</p>
            </div>
            <div className="text-center">
              <DollarSign className="h-4 w-4 mx-auto text-primary mb-1" />
              <p className="font-bold text-lg">{formatARS(revenue)}</p>
              <p className="text-[10px] text-muted-foreground">Facturación</p>
            </div>
          </div>

          {/* Branches */}
          {restBranches.length > 0 && (
            <div>
              <h3 className="font-heading font-semibold text-sm mb-2 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" /> Sucursales
              </h3>
              <div className="space-y-2">
                {restBranches.map(b => (
                  <div key={b.id} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2 text-sm">
                    <span>{b.name}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${b.is_active ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                      {b.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent orders */}
          <div>
            <h3 className="font-heading font-semibold text-sm mb-2">Últimos pedidos</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {restOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Sin pedidos</p>
              ) : restOrders.slice(0, 10).map(o => (
                <div key={o.id} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2 text-sm">
                  <div>
                    <span className="font-medium">Mesa {o.table_number}</span>
                    <span className="text-muted-foreground text-xs ml-2">
                      {new Date(o.created_at).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className="font-heading font-semibold">{formatARS(Number(o.total))}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground">
            Registrado: {new Date(restaurant.created_at).toLocaleDateString('es-AR')}
          </p>
        </div>
      </div>
    </div>
  );
}
