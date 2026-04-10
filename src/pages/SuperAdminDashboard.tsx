import { useState, useEffect } from 'react';
import { NavLink, Navigate, useLocation, Routes, Route } from 'react-router-dom';
import { LayoutDashboard, Building2, ShoppingBag, Users, LogOut, Flame, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import CommandSearch from './superadmin/components/CommandSearch';
import SAOverview from './superadmin/SAOverview';
import SARestaurants from './superadmin/SARestaurants';
import SALiveOrders from './superadmin/SALiveOrders';
import SAUsers from './superadmin/SAUsers';
import { ACTIVE_STATUSES } from './superadmin/utils';

const navLinks = [
  { to: '/superadmin', icon: LayoutDashboard, label: 'Overview', mobileLabel: 'Inicio', end: true },
  { to: '/superadmin/restaurantes', icon: Building2, label: 'Restaurantes', mobileLabel: 'Restos', end: false },
  { to: '/superadmin/pedidos', icon: ShoppingBag, label: 'Pedidos en vivo', mobileLabel: 'Pedidos', end: false },
  { to: '/superadmin/usuarios', icon: Users, label: 'Usuarios', mobileLabel: 'Usuarios', end: false },
];

export default function SuperAdminDashboard() {
  const { role, signOut, loading, user } = useAuth();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (role !== 'superadmin') return;
    Promise.all([
      supabase.from('restaurants').select('*').order('created_at', { ascending: false }).then(r => { if (r.data) setRestaurants(r.data); }),
      supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(1000).then(r => { if (r.data) setOrders(r.data); }),
      supabase.from('branches').select('*').then(r => { if (r.data) setBranches(r.data); }),
    ]).then(() => setLoadingData(false));
  }, [role]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><span className="text-muted-foreground">Cargando...</span></div>;
  if (role !== 'superadmin') return <Navigate to="/admin/dashboard" replace />;

  const activeCount = orders.filter(o => ACTIVE_STATUSES.includes(o.status)).length;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-60 border-r border-border bg-card p-4">
        <div className="flex items-center gap-2.5 mb-6 px-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <Flame className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <span className="font-heading font-bold text-sm block">Mesa Digital</span>
            <span className="text-[10px] text-muted-foreground">Super Admin</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted'
                }`
              }
            >
              <link.icon className="h-4 w-4" />
              {link.label}
              {link.to === '/superadmin/pedidos' && activeCount > 0 && (
                <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeCount}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="text-[10px] text-muted-foreground px-2 mb-2 truncate">{user?.email}</div>
        <button onClick={() => signOut()} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <LogOut className="h-4 w-4" /> Salir
        </button>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="border-b border-border bg-card px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:hidden">
            <div className="h-7 w-7 bg-primary rounded-md flex items-center justify-center">
              <Flame className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-sm">Super Admin</span>
          </div>
          <CommandSearch restaurants={restaurants} />
          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full md:hidden">{activeCount}</span>
            )}
            <Button variant="ghost" size="sm" onClick={() => signOut()} className="md:hidden">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {loadingData ? (
            <div className="flex items-center justify-center py-20"><span className="text-muted-foreground text-sm">Cargando datos...</span></div>
          ) : (
            <Routes>
              <Route index element={<SAOverview restaurants={restaurants} orders={orders} />} />
              <Route path="restaurantes" element={<SARestaurants restaurants={restaurants} orders={orders} branches={branches} />} />
              <Route path="pedidos" element={<SALiveOrders restaurants={restaurants} orders={orders} setOrders={setOrders} />} />
              <Route path="usuarios" element={<SAUsers />} />
            </Routes>
          )}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card border-t border-border flex overflow-x-auto no-scrollbar gap-1 py-2 px-2">
        {navLinks.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 min-w-[60px] flex-shrink-0 px-2 py-1 text-[10px] font-medium ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }
          >
            <link.icon className="h-5 w-5" />
            {link.mobileLabel}
          </NavLink>
        ))}
      </nav>

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
}
