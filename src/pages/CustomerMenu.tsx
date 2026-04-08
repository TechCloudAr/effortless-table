import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Bell, MapPin, Star, Plus, ChevronRight, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductDetailModal from '@/components/customer/ProductDetailModal';
import CartSheet from '@/components/customer/CartSheet';
import type { MenuItem, MenuCategory } from '@/types/restaurant';
import { useCart } from '@/contexts/CartContext';
import { useMenu } from '@/hooks/useMenu';
import { useRestaurant } from '@/hooks/useRestaurant';
import { useBranding } from '@/contexts/BrandingContext';
import { toast } from 'sonner';

export default function CustomerMenu() {
  const { restaurantId, tableId } = useParams();
  const { setTableNumber, setTaxRate, setRestaurantId, addItem } = useCart();
  const { branding } = useBranding();
  const { restaurant } = useRestaurant(restaurantId);
  const { categories, menuItems, ingredients } = useMenu(restaurantId);
  const tableNum = parseInt(tableId || '5');

  useEffect(() => {
    setTableNumber(tableNum);
    setTaxRate(restaurant.taxRate);
    if (restaurantId) setRestaurantId(restaurantId);
  }, [tableNum, restaurant.taxRate, restaurantId, setTableNumber, setTaxRate, setRestaurantId]);

  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const navRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  const allAvailable = useMemo(() => menuItems.filter(i => i.available), [menuItems]);
  const popularItems = useMemo(() => allAvailable.filter(i => i.popular), [allAvailable]);

  const categoriesWithItems = useMemo(() => {
    return categories
      .map(cat => ({
        ...cat,
        items: allAvailable.filter(i => i.categoryId === cat.id),
      }))
      .filter(cat => cat.items.length > 0);
  }, [categories, allAvailable]);

  const filteredItems = useMemo(() => {
    if (!search) return null;
    const q = search.toLowerCase();
    return allAvailable.filter(i =>
      i.name.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      i.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [search, allAvailable]);

  // Scroll spy for active category
  useEffect(() => {
    if (search) return;
    const observer = new IntersectionObserver(
      entries => {
        if (isScrollingRef.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.getAttribute('data-cat-id'));
          }
        }
      },
      { rootMargin: '-120px 0px -60% 0px', threshold: 0 }
    );
    Object.values(sectionRefs.current).forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, [categoriesWithItems, search]);

  const scrollToCategory = useCallback((catId: string) => {
    setActiveCategory(catId);
    isScrollingRef.current = true;
    sectionRefs.current[catId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => { isScrollingRef.current = false; }, 800);
  }, []);

  const handleQuickAdd = (e: React.MouseEvent, item: MenuItem) => {
    e.stopPropagation();
    addItem(item, 1, {}, '');
    toast.success(`${item.name} agregado`, { duration: 1500 });
  };

  const handleCallWaiter = () => {
    toast.success('Un mesero ha sido notificado y se dirigirá a tu mesa.');
  };

  const currency = restaurant.currency;

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-50" />
        <div className="relative px-4 pt-6 pb-5">
          {/* Top row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {branding.logoUrl ? (
                <img src={branding.logoUrl} alt="" className="h-11 w-11 rounded-2xl object-contain bg-white/10 backdrop-blur-sm p-0.5" />
              ) : (
                <div className="h-11 w-11 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center text-xl">
                  🔥
                </div>
              )}
              <div>
                <h1 className="font-heading text-lg font-bold text-white leading-tight">
                  {branding.restaurantName || restaurant.name}
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-white/90 text-xs font-medium">4.8</span>
                  </div>
                  <span className="text-white/40">•</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-white/60" />
                    <span className="text-white/70 text-xs">Mesa {tableNum}</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleCallWaiter}
              className="bg-white/15 backdrop-blur-sm text-white p-2.5 rounded-xl hover:bg-white/25 transition-colors active:scale-95"
            >
              <Bell className="h-4 w-4" />
            </button>
          </div>

          {/* Info chips */}
          <div className="flex gap-2 mb-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-white/70" />
              <span className="text-white/90 text-xs font-medium">Abierto ahora</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-1.5">
              <span className="text-xs">🍽️</span>
              <span className="text-white/90 text-xs font-medium">{allAvailable.length} platos</span>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar en el menú..."
              className="w-full bg-background text-foreground placeholder:text-muted-foreground rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-lg"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sticky category nav */}
      {!search && categoriesWithItems.length > 0 && (
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border shadow-sm">
          <div ref={navRef} className="flex gap-1 px-3 py-2.5 overflow-x-auto no-scrollbar">
            {categoriesWithItems.map(cat => (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-primary text-primary-foreground shadow-md scale-105'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                }`}
              >
                <span className="text-sm">{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search results */}
      <AnimatePresence mode="wait">
        {search && filteredItems && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-4 py-4"
          >
            <p className="text-xs text-muted-foreground mb-3">
              {filteredItems.length} resultado{filteredItems.length !== 1 ? 's' : ''} para "<span className="font-medium text-foreground">{search}</span>"
            </p>
            {filteredItems.length > 0 ? (
              <div className="space-y-2">
                {filteredItems.map(item => (
                  <MenuItemRow key={item.id} item={item} currency={currency} onSelect={setSelectedItem} onQuickAdd={handleQuickAdd} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-sm font-medium text-foreground">No encontramos resultados</p>
                <p className="text-xs text-muted-foreground mt-1">Probá con otro término</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content: categories */}
      {!search && (
        <div>
          {/* Popular section */}
          {popularItems.length > 0 && (
            <section className="px-4 pt-5 pb-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔥</span>
                  <h2 className="font-heading font-bold text-base text-foreground">Populares</h2>
                </div>
                <span className="text-xs text-muted-foreground">{popularItems.length} platos</span>
              </div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
                {popularItems.map((item, i) => (
                  <PopularCard key={item.id} item={item} index={i} currency={currency} onSelect={setSelectedItem} onQuickAdd={handleQuickAdd} />
                ))}
              </div>
            </section>
          )}

          {/* Category sections */}
          {categoriesWithItems.map(cat => (
            <section
              key={cat.id}
              ref={(el: HTMLDivElement | null) => { sectionRefs.current[cat.id] = el; }}
              data-cat-id={cat.id}
              className="px-4 pt-6 pb-2"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{cat.icon}</span>
                <h2 className="font-heading font-bold text-base text-foreground">{cat.name}</h2>
                <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full">{cat.items.length}</span>
              </div>
              <div className="space-y-2">
                {cat.items.map(item => (
                  <MenuItemRow key={item.id} item={item} currency={currency} onSelect={setSelectedItem} onQuickAdd={handleQuickAdd} />
                ))}
              </div>
            </section>
          ))}

          <div className="h-8" />
        </div>
      )}

      <ProductDetailModal
        item={selectedItem}
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        currency={restaurant.currency}
        ingredients={selectedItem ? ingredients[selectedItem.id] || [] : []}
      />
      <CartSheet />

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
}

/* ── Popular Card (horizontal scroll) ── */
function PopularCard({ item, index, currency, onSelect, onQuickAdd }: {
  item: MenuItem; index: number; currency: string;
  onSelect: (i: MenuItem) => void; onQuickAdd: (e: React.MouseEvent, i: MenuItem) => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      onClick={() => onSelect(item)}
      className="flex-shrink-0 w-36 rounded-2xl overflow-hidden bg-card shadow-md active:scale-[0.96] transition-transform relative border border-border group"
    >
      <div className="relative">
        <img src={item.image} alt={item.name} className="w-full h-24 object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
          🔥 #{index + 1}
        </div>
        <button
          onClick={(e) => onQuickAdd(e, item)}
          className="absolute bottom-1.5 right-1.5 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="p-2.5">
        <p className="font-heading font-semibold text-sm truncate text-left text-foreground">{item.name}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="font-heading font-bold text-primary text-sm">{currency}{item.price}</span>
          <div className="flex items-center gap-0.5">
            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
            <span className="text-[10px] text-muted-foreground font-medium">4.{8 + (index % 2)}</span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

/* ── Menu Item Row (Uber Eats style) ── */
function MenuItemRow({ item, currency, onSelect, onQuickAdd }: {
  item: MenuItem; currency: string;
  onSelect: (i: MenuItem) => void; onQuickAdd: (e: React.MouseEvent, i: MenuItem) => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={() => onSelect(item)}
      className="flex gap-3 bg-card rounded-2xl p-3 shadow-sm text-left w-full transition-all active:scale-[0.98] hover:shadow-md border border-border group relative"
    >
      <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-heading font-semibold text-sm text-foreground leading-tight">{item.name}</h3>
            {item.popular && <span className="text-[10px]">🔥</span>}
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-heading font-bold text-primary text-base">{currency}{item.price}</span>
          {item.tags.length > 0 && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {item.tags[0]}
            </span>
          )}
        </div>
      </div>
      <div className="relative flex-shrink-0">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="h-24 w-24 rounded-xl object-cover"
        />
        <button
          onClick={(e) => onQuickAdd(e, item)}
          className="absolute -bottom-1.5 -right-1.5 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform border-2 border-background"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </motion.button>
  );
}
