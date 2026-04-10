import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, ShoppingBag, LayoutDashboard, Users } from 'lucide-react';
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
  { label: 'Pedidos en vivo', path: '/superadmin/pedidos', icon: ShoppingBag },
  { label: 'Usuarios', path: '/superadmin/usuarios', icon: Users },
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
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/50 text-sm text-muted-foreground hover:bg-muted transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        Buscar...
        <kbd className="ml-2 text-[10px] bg-background px-1.5 py-0.5 rounded border border-border font-mono">⌘K</kbd>
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
