import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Building2, ShoppingBag, DollarSign, Users, LogOut, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RestaurantRow {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

interface OrderRow {
  id: string;
  restaurant_id: string;
  total: number;
  status: string;
  created_at: string;
  table_number: number;
}

export default function SuperAdminDashboard() {
  const { role, signOut, loading, user } = useAuth();
  const [restaurants, setRestaurants] = useState<RestaurantRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (role !== 'superadmin') return;
    fetchAll();
    const channel = supabase
      .channel('superadmin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [role]);

  const fetchAll = async () => {
    await Promise.all([fetchRestaurants(), fetchOrders()]);
    setLoadingData(false);
  };

  const fetchRestaurants = async () => {
    const { data } = await supabase.from('restaurants').select('*').order('created_at', { ascending: false });
    if (data) setRestaurants(data as RestaurantRow[]);
  };

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(100);
    if (data) setOrders(data as OrderRow[]);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><span className="text-muted-foreground">Cargando...</span></div>;
  if (role !== 'superadmin') return <Navigate to="/admin/dashboard" replace />;

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
  const activeOrders = orders.filter(o => !['entregado', 'delivered', 'cancelled'].includes(o.status));

  const revenueByRestaurant = restaurants.map(r => ({
    ...r,
    revenue: orders.filter(o => o.restaurant_id === r.id).reduce((s, o) => s + Number(o.total), 0),
    orderCount: orders.filter(o => o.restaurant_id === r.id).length,
    activeOrders: orders.filter(o => o.restaurant_id === r.id && !['entregado', 'delivered', 'cancelled'].includes(o.status)).length,
  }));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 gradient-primary rounded-xl flex items-center justify-center">
            <Flame className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-lg">Mesa Digital — Super Admin</h1>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => signOut()}>
          <LogOut className="h-4 w-4 mr-2" /> Salir
        </Button>
      </header>

      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Restaurantes', value: restaurants.length, icon: Building2 },
            { label: 'Pedidos totales', value: orders.length, icon: ShoppingBag },
            { label: 'Pedidos activos', value: activeOrders.length, icon: Users },
            { label: 'Facturación total', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign },
          ].map(s => (
            <div key={s.label} className="bg-card rounded-xl p-4 shadow-card border border-border/50">
              <s.icon className="h-5 w-5 text-primary mb-2" />
              <p className="font-heading font-bold text-2xl">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Restaurants table */}
        <div className="bg-card rounded-xl shadow-card border border-border/50">
          <div className="p-5 border-b border-border">
            <h2 className="font-heading font-bold text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" /> Restaurantes registrados
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left p-4 font-medium">Restaurante</th>
                  <th className="text-right p-4 font-medium">Pedidos</th>
                  <th className="text-right p-4 font-medium">Activos</th>
                  <th className="text-right p-4 font-medium">Facturación</th>
                  <th className="text-right p-4 font-medium">Registrado</th>
                </tr>
              </thead>
              <tbody>
                {revenueByRestaurant.map(r => (
                  <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="p-4 font-heading font-semibold">{r.name}</td>
                    <td className="p-4 text-right">{r.orderCount}</td>
                    <td className="p-4 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.activeOrders > 0 ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                        {r.activeOrders}
                      </span>
                    </td>
                    <td className="p-4 text-right font-heading font-semibold">${r.revenue.toLocaleString()}</td>
                    <td className="p-4 text-right text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString('es')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live orders */}
        <div className="bg-card rounded-xl shadow-card border border-border/50">
          <div className="p-5 border-b border-border">
            <h2 className="font-heading font-bold text-lg flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" /> Pedidos en tiempo real
              <span className="ml-auto bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">{activeOrders.length}</span>
            </h2>
          </div>
          <div className="divide-y divide-border/50 max-h-96 overflow-y-auto">
            {activeOrders.length === 0 ? (
              <p className="p-8 text-center text-muted-foreground">Sin pedidos activos</p>
            ) : activeOrders.slice(0, 20).map(o => {
              const restName = restaurants.find(r => r.id === o.restaurant_id)?.name || 'Desconocido';
              return (
                <div key={o.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-heading font-semibold text-sm">{restName} — Mesa {o.table_number}</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      o.status === 'nuevo' ? 'bg-info/10 text-info' :
                      o.status === 'aceptado' ? 'bg-primary/10 text-primary' :
                      o.status === 'preparando' ? 'bg-warning/10 text-warning' :
                      'bg-success/10 text-success'
                    }`}>
                      {o.status}
                    </span>
                    <span className="font-heading font-bold">${Number(o.total).toFixed(0)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
