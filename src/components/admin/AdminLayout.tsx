import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, UtensilsCrossed, Grid3X3, Palette, LogOut, Flame, CreditCard, DollarSign, Brain, Building2, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBranch } from '@/contexts/BranchContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

export default function AdminLayout() {
  const { signOut, role } = useAuth();
  const { branches, activeBranch, setActiveBranchId } = useBranch();

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
        {branches.length > 1 && (
          <div className="mb-6 px-1">
            <Select value={activeBranch?.id ?? ''} onValueChange={setActiveBranchId}>
              <SelectTrigger className="h-9 text-xs">
                <Building2 className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                <SelectValue placeholder="Sucursal" />
              </SelectTrigger>
              <SelectContent>
                {branches.map(b => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <nav className="flex-1 space-y-1">
          {links.map(link => (
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

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card border-t border-border flex justify-around py-2">
        {links.map(link => (
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
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <Outlet />
      </main>

      <AIChatWidget />
    </div>
  );
}
