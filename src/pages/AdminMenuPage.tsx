import { useState } from 'react';
import { menuItems, categories } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import type { MenuItem } from '@/types/restaurant';

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>(menuItems);
  const [activeCategory, setActiveCategory] = useState('all');

  const toggleAvailability = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, available: !i.available } : i));
  };

  const filtered = activeCategory === 'all' ? items : items.filter(i => i.categoryId === activeCategory);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Gestión del menú</h1>
        <p className="text-sm text-muted-foreground">{items.length} productos • {items.filter(i => i.available).length} disponibles</p>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${
            activeCategory === 'all' ? 'gradient-primary text-primary-foreground border-transparent' : 'bg-card text-muted-foreground border-border'
          }`}
        >
          Todos
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${
              activeCategory === cat.id ? 'gradient-primary text-primary-foreground border-transparent' : 'bg-card text-muted-foreground border-border'
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(item => (
          <div key={item.id} className="bg-card rounded-xl p-3 shadow-card flex items-center gap-3">
            <img src={item.image} alt={item.name} className="h-14 w-14 rounded-md object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-semibold text-sm truncate">{item.name}</h3>
                {item.tags.slice(0, 1).map(t => (
                  <Badge key={t} variant="secondary" className="text-[10px] h-4">{t}</Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">${item.price} • {categories.find(c => c.id === item.categoryId)?.name}</p>
            </div>
            <Switch checked={item.available} onCheckedChange={() => toggleAvailability(item.id)} />
          </div>
        ))}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
