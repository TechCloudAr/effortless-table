import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, UtensilsCrossed, Grid3X3, Palette, LogOut, Flame, CreditCard, DollarSign, Brain, Building2, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBranch } from '@/contexts/BranchContext';
import AIChatWidget from './AIChatWidget';

const links = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/admin/pedidos', icon: ClipboardList, label: 'Pedidos' },
  { to: '/admin/menu', icon: UtensilsCrossed, label: 'Menú' },
  { to: '/admin/rentabilidad', icon: DollarSign, label: 'Sales & Profit' },
  { to: '/admin/inteligencia', icon: Brain, label: 'Menu Intelligence' },
  { to: '/admin/mesas', icon: Grid3X3, label: 'Mesas' },
  { to: '/admin/pagos', icon: CreditCard, label: 'Pagos' },
  { to: '/admin/sucursales', icon: Building2, label: 'Sucursales' },
  { to: '/admin/diseno', icon: Palette, label: 'Templates' },
];

const ALL_BRANCHES_VALUE = '__all__';

export default function AdminLayout() {
  const { signOut, role } = useAuth();
  const { branches, activeBranchId, setActiveBranchId } = useBranch();

  const location = useLocation();
  const navigate = useNavigate();

  const handleBranchChange = (id: string) => {
    const newBranchId = id === ALL_BRANCHES_VALUE ? null : id;
    setActiveBranchId(newBranchId);
    // If switching to a specific branch while on a "Todas"-only page, redirect
    if (newBranchId && location.pathname === '/admin/sucursales') {
      navigate('/admin/dashboard');
    }
  };

  const currentValue = activeBranchId ?? ALL_BRANCHES_VALUE;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 border-r border-border bg-card p-4">
        <div className="flex items-center gap-2.5 mb-4 px-2">
          <div className="h-8 w-8 gradient-primary rounded-lg flex items-center justify-center">
            <Flame className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-sm">Mesa Digital</span>
        </div>

        {/* Branch selector - always visible when >1 branch */}
        {branches.length > 1 && (
          <div className="mb-4 px-1">
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              <button
                onClick={() => handleBranchChange(ALL_BRANCHES_VALUE)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all border ${
                  currentValue === ALL_BRANCHES_VALUE
                    ? 'gradient-primary text-primary-foreground border-transparent'
                    : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
                }`}
              >
                Todas
              </button>
              {branches.map(b => (
                <button
                  key={b.id}
                  onClick={() => handleBranchChange(b.id)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all border ${
                    currentValue === b.id
                      ? 'gradient-primary text-primary-foreground border-transparent'
                      : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <nav className="flex-1 space-y-1">
          {links
            .filter(link => link.to !== '/admin/sucursales' || !activeBranchId)
            .map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted'
                }`
              }
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </NavLink>
          ))}
        </nav>
        {role === 'superadmin' && (
          <NavLink to="/superadmin" className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-1">
            <Shield className="h-4 w-4" /> Super Admin
          </NavLink>
        )}
        <button onClick={() => signOut()} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </button>
      </aside>

      {/* Mobile top branch selector */}
      {branches.length > 1 && (
        <div className="fixed top-0 left-0 right-0 z-40 md:hidden bg-card border-b border-border px-3 py-2">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => handleBranchChange(ALL_BRANCHES_VALUE)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all border ${
                currentValue === ALL_BRANCHES_VALUE
                  ? 'gradient-primary text-primary-foreground border-transparent'
                  : 'bg-muted/50 text-muted-foreground border-border'
              }`}
            >
              Todas
            </button>
            {branches.map(b => (
              <button
                key={b.id}
                onClick={() => handleBranchChange(b.id)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all border ${
                  currentValue === b.id
                    ? 'gradient-primary text-primary-foreground border-transparent'
                    : 'bg-muted/50 text-muted-foreground border-border'
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card border-t border-border flex justify-around py-2">
        {links
          .filter(link => link.to !== '/admin/sucursales' || !activeBranchId)
          .map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }
          >
            <link.icon className="h-5 w-5" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Main */}
      <main className={`flex-1 overflow-y-auto pb-20 md:pb-0 ${branches.length > 1 ? 'pt-12 md:pt-0' : ''}`}>
        <Outlet />
      </main>

      <AIChatWidget />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
