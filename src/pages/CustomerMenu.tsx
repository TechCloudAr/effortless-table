import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Bell, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { restaurant, categories, menuItems } from '@/data/mockData';
import MenuItemCard from '@/components/customer/MenuItemCard';
import ProductDetailModal from '@/components/customer/ProductDetailModal';
import CartSheet from '@/components/customer/CartSheet';
import type { MenuItem } from '@/types/restaurant';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function CustomerMenu() {
  const { tableId } = useParams();
  const { setTableNumber } = useCart();
  const tableNum = parseInt(tableId || '5');
  
  // Set table number in cart context
  useState(() => { setTableNumber(tableNum); });

  const [activeCategory, setActiveCategory] = useState(categories[0].id);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const filteredItems = useMemo(() => {
    let items = menuItems.filter(i => i.available);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.tags.some(t => t.includes(q)));
    } else {
      items = items.filter(i => i.categoryId === activeCategory);
    }
    return items;
  }, [activeCategory, search]);

  const popularItems = useMemo(() => menuItems.filter(i => i.popular && i.available), []);

  const handleCallWaiter = () => {
    toast.success('Un mesero ha sido notificado y se dirigirá a tu mesa.');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-dark px-4 pt-6 pb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-heading text-lg font-bold text-primary-foreground">{restaurant.name}</h1>
            <p className="text-xs text-primary-foreground/60">{restaurant.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-primary-foreground/10 text-primary-foreground/80 text-xs px-2.5 py-1 rounded-full font-medium">
              Mesa {tableNum}
            </span>
            <button onClick={handleCallWaiter} className="bg-primary-foreground/10 text-primary-foreground/80 p-2 rounded-full hover:bg-primary-foreground/20 transition-colors">
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-foreground/40" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar en el menú..."
            className="w-full bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/40 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Categories */}
      {!search && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'gradient-primary text-primary-foreground shadow-soft'
                  : 'bg-card text-muted-foreground border border-border hover:border-primary/30'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Popular section (show only on first category) */}
      {!search && activeCategory === categories[0].id && (
        <div className="px-4 mb-4">
          <h2 className="font-heading font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-1">
            🔥 Más populares
          </h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {popularItems.map(item => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="flex-shrink-0 w-32 rounded-lg overflow-hidden bg-card shadow-card active:scale-[0.97] transition-transform"
              >
                <img src={item.image} alt={item.name} className="w-full h-20 object-cover" loading="lazy" width={128} height={80} />
                <div className="p-2">
                  <p className="font-heading font-semibold text-xs truncate">{item.name}</p>
                  <p className="text-primary font-bold text-xs mt-0.5">{restaurant.currency}{item.price}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div className="px-4">
        {search && (
          <p className="text-xs text-muted-foreground mb-2">
            {filteredItems.length} resultado{filteredItems.length !== 1 ? 's' : ''} para "{search}"
          </p>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={search || activeCategory}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="grid gap-3"
          >
            {filteredItems.map(item => (
              <MenuItemCard key={item.id} item={item} onSelect={setSelectedItem} />
            ))}
            {filteredItems.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg mb-1">🔍</p>
                <p className="text-sm">No encontramos resultados</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal item={selectedItem} open={!!selectedItem} onClose={() => setSelectedItem(null)} />

      {/* Cart */}
      <CartSheet />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
