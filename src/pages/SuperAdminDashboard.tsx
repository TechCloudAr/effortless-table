import { useState, useEffect } from 'react';
import { NavLink, Navigate, useLocation, Routes, Route } from 'react-router-dom';
import {
  LayoutDashboard, Building2, ShoppingBag, Users, LogOut, Flame,
  DollarSign, MessageCircle, Settings, BarChart3, QrCode, Clock, Bell,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PeriodProvider, usePeriod, Period } from '@/contexts/PeriodContext';
import CommandSearch from './superadmin/components/CommandSearch';
import SAOverview from './superadmin/SAOverview';
import SARestaurants from './superadmin/SARestaurants';
import SALiveOrders from './superadmin/SALiveOrders';
import SABilling from './superadmin/SABilling';
import SASupport from './superadmin/SASupport';
import SATeam from './superadmin/SATeam';
import { ACTIVE_STATUSES } from './superadmin/utils';

const sections = [
  {
    label: 'NEGOCIO',
    items: [
      { to: '/superadmin', icon: LayoutDashboard, label: 'Overview', end: true },
      { to: '/superadmin/restaurantes', icon: Building2, label: 'Restaurantes', end: false, badge: 'count' as const },
      { to: '/superadmin/facturacion', icon: DollarSign, label: 'Facturación', end: false },
    ],
  },
  {
    label: 'OPERACIONES',
    items: [
      { to: '/superadmin/pedidos', icon: Clock, label: 'Pedidos en vivo', end: false, badge: 'live' as const },
      { to: '/superadmin/soporte', icon: MessageCircle, label: 'Soporte', end: false },
    ],
  },
  {
    label: 'SISTEMA',
    items: [
      { to: '/superadmin/equipo', icon: Users, label: 'Equipo', end: false },
    ],
  },
];

const mobileNav = [
  { to: '/superadmin', icon: LayoutDashboard, label: 'Inicio', end: true },
  { to: '/superadmin/restaurantes', icon: Building2, label: 'Restos', end: false },
  { to: '/superadmin/pedidos', icon: Clock, label: 'Pedidos', end: false },
  { to: '/superadmin/facturacion', icon: DollarSign, label: 'Billing', end: false },
  { to: '/superadmin/equipo', icon: Users, label: 'Equipo', end: false },
];

const periodOptions: { key: Period; label: string }[] = [
  { key: 'today', label: 'Hoy' },
  { key: '7d', label: '7 días' },
  { key: '30d', label: '30 días' },
  { key: 'all', label: 'Todo' },
];

function PeriodSelector() {
  const { period, setPeriod } = usePeriod();
  return (
    <div className="hidden md:flex items-center gap-0.5 bg-[#f8f8f7] rounded-lg p-0.5">
      {periodOptions.map(p => (
        <button
          key={p.key}
          onClick={() => setPeriod(p.key)}
          className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
            period === p.key
              ? 'bg-white text-[#111110] shadow-sm'
              : 'text-[#6b7280] hover:text-[#111110]'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

function DashboardInner() {
  const { role, signOut, loading, user } = useAuth();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (role !== 'superadmin') return;
    Promise.all([
      supabase.from('restaurants').select('*').order('created_at', { ascending: false }).then(r => { if (r.data) setRestaurants(r.data); }),
      supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(1000).then(r => { if (r.data) setOrders(r.data); }),
      supabase.from('branches').select('*').then(r => { if (r.data) setBranches(r.data); }),
    ]).then(() => setLoadingData(false));
  }, [role]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f8f8f7]"><span className="text-[12px] text-[#6b7280]">Cargando...</span></div>;
  if (role !== 'superadmin') return <Navigate to="/admin/dashboard" replace />;

  const activeCount = orders.filter(o => ACTIVE_STATUSES.includes(o.status)).length;

  // Page title from route
  const pageTitles: Record<string, string> = {
    '/superadmin': 'Overview',
    '/superadmin/restaurantes': 'Restaurantes',
    '/superadmin/facturacion': 'Facturación',
    '/superadmin/pedidos': 'Pedidos en vivo',
    '/superadmin/soporte': 'Soporte',
    '/superadmin/equipo': 'Equipo',
  };
  const pageTitle = pageTitles[location.pathname] || 'Super Admin';
  const today = new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-[#f8f8f7] flex">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-[200px] bg-white fixed inset-y-0 left-0 z-30" style={{ borderRight: '0.5px solid rgba(0,0,0,0.08)' }}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4">
          <div className="h-8 w-8 rounded-[10px] bg-[#f97316] flex items-center justify-center">
            <Flame className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-[13px] font-medium text-[#111110] block leading-tight">Mesa Digital</span>
            <span className="text-[10px] text-[#9ca3af]">Super Admin</span>
          </div>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 px-2 space-y-4 mt-2 overflow-y-auto">
          {sections.map(section => (
            <div key={section.label}>
              <p className="text-[9px] font-medium text-[#9ca3af] uppercase tracking-[0.06em] px-2 mb-1.5">{section.label}</p>
              <div className="space-y-0.5">
                {section.items.map(link => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-2.5 py-2 rounded-md text-[12px] font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-[rgba(249,115,22,0.10)] text-[#f97316]'
                          : 'text-[#6b7280] hover:bg-[#f8f8f7] hover:text-[#111110]'
                      }`
                    }
                  >
                    <link.icon className="h-4 w-4" />
                    <span className="flex-1">{link.label}</span>
                    {link.badge === 'count' && restaurants.length > 0 && (
                      <span className="text-[10px] text-[#9ca3af]">{restaurants.length}</span>
                    )}
                    {link.badge === 'live' && activeCount > 0 && (
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#f97316] animate-pulse" />
                        <span className="text-[10px] text-[#f97316]">{activeCount}</span>
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-3 py-3 group" style={{ borderTop: '0.5px solid rgba(0,0,0,0.08)' }}>
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-[rgba(249,115,22,0.1)] flex items-center justify-center text-[11px] font-medium text-[#f97316]">
              {(user?.email || '?')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-[#111110] truncate">{user?.email}</p>
              <p className="text-[9px] text-[#9ca3af]">superadmin</p>
            </div>
            <button onClick={() => signOut()} className="opacity-0 group-hover:opacity-100 transition-opacity">
              <LogOut className="h-3.5 w-3.5 text-[#9ca3af] hover:text-[#111110]" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-[200px]">
        {/* Topbar */}
        <header className="bg-white px-4 md:px-6 py-3 flex items-center justify-between gap-3 sticky top-0 z-20" style={{ borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
          <div className="flex items-center gap-3">
            {/* Mobile logo */}
            <div className="flex items-center gap-2 md:hidden">
              <div className="h-7 w-7 rounded-[8px] bg-[#f97316] flex items-center justify-center">
                <Flame className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
            {/* Page title - desktop */}
            <div className="hidden md:block">
              <p className="text-[15px] font-medium text-[#111110]">{pageTitle}</p>
              <p className="text-[11px] text-[#9ca3af] capitalize">{today}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <PeriodSelector />
            <CommandSearch restaurants={restaurants} />
            <button className="relative p-2 rounded-md hover:bg-[#f8f8f7] transition-colors">
              <Bell className="h-4 w-4 text-[#6b7280]" />
              {activeCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#f97316] animate-pulse" />
              )}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {loadingData ? (
            <div className="flex items-center justify-center py-20">
              <span className="text-[12px] text-[#6b7280]" style={{ opacity: 0.5, animation: 'pulse 2s infinite' }}>Cargando datos...</span>
            </div>
          ) : (
            <Routes>
              <Route index element={<SAOverview restaurants={restaurants} orders={orders} />} />
              <Route path="restaurantes" element={<SARestaurants restaurants={restaurants} orders={orders} branches={branches} />} />
              <Route path="pedidos" element={<SALiveOrders restaurants={restaurants} orders={orders} setOrders={setOrders} />} />
              <Route path="facturacion" element={<SABilling />} />
              <Route path="soporte" element={<SASupport />} />
              <Route path="equipo" element={<SATeam />} />
            </Routes>
          )}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white flex overflow-x-auto no-scrollbar gap-1 py-2 px-2" style={{ borderTop: '0.5px solid rgba(0,0,0,0.08)' }}>
        {mobileNav.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 min-w-[56px] flex-shrink-0 px-2 py-1 text-[10px] font-medium transition-all duration-150 ${
                isActive ? 'text-[#f97316]' : 'text-[#9ca3af]'
              }`
            }
          >
            <link.icon className="h-5 w-5" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
}

export default function SuperAdminDashboard() {
  return (
    <PeriodProvider>
      <DashboardInner />
    </PeriodProvider>
  );
}
