import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, LayoutDashboard, Users, Clock, DollarSign, MessageCircle } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

interface Restaurant {
  id: string;
  name: string;
}

interface CommandSearchProps {
  restaurants: Restaurant[];
}

const pages = [
  { label: 'Overview', path: '/superadmin', icon: LayoutDashboard },
  { label: 'Restaurantes', path: '/superadmin/restaurantes', icon: Building2 },
  { label: 'Facturación', path: '/superadmin/facturacion', icon: DollarSign },
  { label: 'Pedidos en vivo', path: '/superadmin/pedidos', icon: Clock },
  { label: 'Soporte', path: '/superadmin/soporte', icon: MessageCircle },
  { label: 'Equipo', path: '/superadmin/equipo', icon: Users },
];

export default function CommandSearch({ restaurants }: CommandSearchProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const go = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-white text-[11px] text-[#6b7280] hover:text-[#111110] transition-colors"
        style={{ border: '0.5px solid rgba(0,0,0,0.08)' }}
      >
        <Search className="h-3 w-3" />
        Buscar...
        <kbd className="ml-2 text-[9px] text-[#9ca3af] px-1 py-0.5 rounded bg-[#f8f8f7] font-mono">⌘K</kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Buscar restaurantes, páginas..." />
        <CommandList>
          <CommandEmpty>Sin resultados.</CommandEmpty>
          <CommandGroup heading="Páginas">
            {pages.map(p => (
              <CommandItem key={p.path} onSelect={() => go(p.path)}>
                <p.icon className="mr-2 h-4 w-4" />
                {p.label}
              </CommandItem>
            ))}
          </CommandGroup>
          {restaurants.length > 0 && (
            <CommandGroup heading="Restaurantes">
              {restaurants.map(r => (
                <CommandItem key={r.id} onSelect={() => go('/superadmin/restaurantes')}>
                  <Building2 className="mr-2 h-4 w-4" />
                  {r.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
