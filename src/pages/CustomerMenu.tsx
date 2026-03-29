import { useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Bell, Flame, Zap, Clock, Star, ChevronRight, Tag, Crown, TrendingUp, Sparkles, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { restaurant, categories, menuItems } from '@/data/mockData';
import ProductDetailModal from '@/components/customer/ProductDetailModal';
import CartSheet from '@/components/customer/CartSheet';
import type { MenuItem } from '@/types/restaurant';
import { useCart } from '@/contexts/CartContext';
import { useMenuTheme } from '@/contexts/MenuThemeContext';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const tagConfig: Record<string, { bg: string; icon?: string }> = {
  'más vendido': { bg: 'bg-gradient-to-r from-red-500 to-orange-500 text-white', icon: '🔥' },
  'nuevo': { bg: 'bg-gradient-to-r from-emerald-500 to-green-400 text-white', icon: '✨' },
  'vegano': { bg: 'bg-green-100 text-green-800', icon: '🌱' },
  'picante': { bg: 'bg-red-100 text-red-700', icon: '🌶️' },
  'sin gluten': { bg: 'bg-amber-100 text-amber-800' },
  'ahorro': { bg: 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white', icon: '💰' },
};

export default function CustomerMenu() {
  const { tableId } = useParams();
  const { setTableNumber, addItem } = useCart();
  const tableNum = parseInt(tableId || '5');
  useState(() => { setTableNumber(tableNum); });

  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const popularItems = useMemo(() => menuItems.filter(i => i.popular && i.available), []);
  const allAvailable = useMemo(() => menuItems.filter(i => i.available), []);

  const filteredItems = useMemo(() => {
    if (!search) return null;
    const q = search.toLowerCase();
    return allAvailable.filter(i =>
      i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.tags.some(t => t.includes(q))
    );
  }, [search, allAvailable]);

  const scrollToSection = (catId: string) => {
    sectionRefs.current[catId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleQuickAdd = (e: React.MouseEvent, item: MenuItem) => {
    e.stopPropagation();
    addItem(item, 1, {}, '');
    toast.success(`${item.name} agregado`, { duration: 1500 });
  };

  const handleCallWaiter = () => {
    toast.success('Un mesero ha sido notificado y se dirigirá a tu mesa.');
  };

  // Flash deal items (simulated)
  const flashDeals = useMemo(() => [
    { ...menuItems.find(i => i.id === 'combo-fuego')!, originalPrice: 310, discount: 20 },
    { ...menuItems.find(i => i.id === 'combo-familiar')!, originalPrice: 750, discount: 20 },
    { ...menuItems.find(i => i.id === 'nachos-supremos')!, originalPrice: 189, discount: 21 },
  ], []);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header — compact, vibrant */}
      <div className="bg-gradient-to-br from-[hsl(var(--primary))] via-[hsl(var(--primary)/0.9)] to-[hsl(20,90%,45%)] px-4 pt-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
              <Flame className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-sm font-bold text-white leading-tight">{restaurant.name}</h1>
              <p className="text-[10px] text-white/60">Mesa {tableNum} • Menú digital</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={handleCallWaiter} className="bg-white/15 backdrop-blur text-white p-2 rounded-full hover:bg-white/25 transition-colors">
              <Bell className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="¿Qué se te antoja hoy?"
            className="w-full bg-white/15 backdrop-blur text-white placeholder:text-white/40 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
          />
        </div>
      </div>

      {/* Quick category nav — sticky */}
      {!search && (
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
          <div className="flex gap-1 px-3 py-2 overflow-x-auto no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => scrollToSection(cat.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap bg-muted hover:bg-accent transition-colors"
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search results */}
      {search && filteredItems && (
        <div className="px-4 py-4">
          <p className="text-xs text-muted-foreground mb-3">
            {filteredItems.length} resultado{filteredItems.length !== 1 ? 's' : ''} para "{search}"
          </p>
          <div className="grid gap-3">
            {filteredItems.map(item => (
              <CompactCard key={item.id} item={item} onSelect={setSelectedItem} onQuickAdd={handleQuickAdd} />
            ))}
            {filteredItems.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-3xl mb-2">🔍</p>
                <p className="text-sm">No encontramos resultados</p>
              </div>
            )}
          </div>
        </div>
      )}

      {!search && (
        <div className="space-y-0">
          {/* 🔥 FLASH DEALS BANNER */}
          <section className="px-4 pt-4 pb-2">
            <div className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-1.5 mb-2">
                  <Zap className="h-4 w-4 text-yellow-200 animate-pulse" />
                  <span className="text-white font-heading font-bold text-sm">OFERTAS RELÁMPAGO</span>
                  <div className="ml-auto flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
                    <Clock className="h-3 w-3 text-white" />
                    <span className="text-white text-[10px] font-bold">02:34:17</span>
                  </div>
                </div>
                <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
                  {flashDeals.map((deal) => (
                    <button
                      key={deal.id}
                      onClick={() => setSelectedItem(deal)}
                      className="flex-shrink-0 w-28 rounded-xl overflow-hidden bg-white/15 backdrop-blur active:scale-[0.96] transition-transform"
                    >
                      <div className="relative">
                        <img src={deal.image} alt={deal.name} className="w-full h-20 object-cover" loading="lazy" />
                        <div className="absolute top-1 left-1 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                          -{deal.discount}%
                        </div>
                      </div>
                      <div className="p-2">
                        <p className="text-white font-heading font-semibold text-[11px] truncate">{deal.name}</p>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-yellow-200 font-bold text-xs">${deal.price}</span>
                          <span className="text-white/40 text-[10px] line-through">${deal.originalPrice}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 🏆 TOP SELLERS — big hero cards */}
          <section className="px-4 pt-4 pb-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <Crown className="h-3.5 w-3.5 text-white" />
              </div>
              <h2 className="font-heading font-bold text-base">Los más pedidos</h2>
              <TrendingUp className="h-3.5 w-3.5 text-primary ml-auto" />
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
              {popularItems.map((item, i) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => setSelectedItem(item)}
                  className="flex-shrink-0 w-40 rounded-2xl overflow-hidden bg-card shadow-card active:scale-[0.96] transition-transform relative group"
                >
                  <div className="relative">
                    <img src={item.image} alt={item.name} className="w-full h-28 object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Flame className="h-2.5 w-2.5" /> #{i + 1} vendido
                    </div>
                    <button
                      onClick={(e) => handleQuickAdd(e, item)}
                      className="absolute bottom-2 right-2 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-2.5">
                    <p className="font-heading font-bold text-sm truncate text-left">{item.name}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="font-heading font-bold text-primary text-sm">{restaurant.currency}{item.price}</span>
                      <div className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-warning text-warning" />
                        <span className="text-[10px] text-muted-foreground font-medium">4.{8 + i}</span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </section>

          {/* 🎁 PROMO BANNER */}
          <section className="px-4 pt-3 pb-1">
            <div className="bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-2xl p-4 flex items-center gap-3 relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full" />
              <div className="h-12 w-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-heading font-bold text-sm">¡2x1 en bebidas!</p>
                <p className="text-white/70 text-[11px]">De lunes a jueves, de 4 a 7pm</p>
              </div>
              <div className="bg-white/20 rounded-lg px-2.5 py-1">
                <p className="text-white text-[10px] font-bold">HOY</p>
              </div>
            </div>
          </section>

          {/* ALL CATEGORIES — vertical feed */}
          {categories.map(cat => {
            const catItems = allAvailable.filter(i => i.categoryId === cat.id);
            if (catItems.length === 0) return null;
            return (
              <section
                key={cat.id}
                ref={(el: HTMLDivElement | null) => { sectionRefs.current[cat.id] = el; }}
                className="px-4 pt-5 pb-1"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{cat.icon}</span>
                  <h2 className="font-heading font-bold text-base">{cat.name}</h2>
                  <span className="text-xs text-muted-foreground">({catItems.length})</span>
                </div>

                {/* Mix layout: first item big, rest compact */}
                <div className="space-y-2.5">
                  {catItems.length > 0 && (
                    <HeroCard item={catItems[0]} onSelect={setSelectedItem} onQuickAdd={handleQuickAdd} />
                  )}
                  {catItems.slice(1).map(item => (
                    <CompactCard key={item.id} item={item} onSelect={setSelectedItem} onQuickAdd={handleQuickAdd} />
                  ))}
                </div>
              </section>
            );
          })}

          {/* Bottom spacer */}
          <div className="h-8" />
        </div>
      )}

      <ProductDetailModal item={selectedItem} open={!!selectedItem} onClose={() => setSelectedItem(null)} />
      <CartSheet />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

/* ── Hero Card (big, first in category) ── */
function HeroCard({ item, onSelect, onQuickAdd }: { item: MenuItem; onSelect: (i: MenuItem) => void; onQuickAdd: (e: React.MouseEvent, i: MenuItem) => void }) {
  return (
    <button onClick={() => onSelect(item)} className="w-full rounded-2xl overflow-hidden bg-card shadow-card text-left active:scale-[0.98] transition-transform relative">
      <div className="relative">
        <img src={item.image} alt={item.name} className="w-full h-44 object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-end justify-between">
            <div>
              {item.tags.length > 0 && (
                <div className="flex gap-1 mb-1.5">
                  {item.tags.map(tag => (
                    <span key={tag} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tagConfig[tag]?.bg || 'bg-white/20 text-white'}`}>
                      {tagConfig[tag]?.icon} {tag}
                    </span>
                  ))}
                </div>
              )}
              <h3 className="font-heading font-bold text-white text-lg leading-tight">{item.name}</h3>
              <p className="text-white/70 text-xs mt-0.5 line-clamp-1">{item.description}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0 ml-3">
              <span className="font-heading font-bold text-white text-xl">{restaurant.currency}{item.price}</span>
              <div
                onClick={(e) => onQuickAdd(e, item)}
                className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              >
                <Plus className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

/* ── Compact Card (list-style) ── */
function CompactCard({ item, onSelect, onQuickAdd }: { item: MenuItem; onSelect: (i: MenuItem) => void; onQuickAdd: (e: React.MouseEvent, i: MenuItem) => void }) {
  return (
    <button
      onClick={() => onSelect(item)}
      className="flex gap-3 rounded-xl bg-card p-2.5 shadow-card text-left w-full transition-all active:scale-[0.98] hover:shadow-elevated relative"
    >
      <div className="relative flex-shrink-0">
        <img src={item.image} alt={item.name} loading="lazy" className="h-20 w-20 rounded-xl object-cover" />
        {item.tags.includes('más vendido') && (
          <div className="absolute -top-1 -left-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md">
            🔥 TOP
          </div>
        )}
        {item.tags.includes('nuevo') && (
          <div className="absolute -top-1 -left-1 bg-gradient-to-r from-emerald-500 to-green-400 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md">
            ✨ NEW
          </div>
        )}
      </div>
      <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
        <div>
          <h3 className="font-heading font-semibold text-sm leading-tight">{item.name}</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading font-bold text-primary text-base">{restaurant.currency}{item.price}</span>
            {item.tags.includes('ahorro') && (
              <span className="text-[10px] text-muted-foreground line-through">${Math.round(item.price * 1.25)}</span>
            )}
          </div>
          <div className="flex gap-1">
            {item.tags.filter(t => !['más vendido', 'nuevo', 'ahorro'].includes(t)).slice(0, 1).map(tag => (
              <span key={tag} className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${tagConfig[tag]?.bg || 'bg-muted text-muted-foreground'}`}>
                {tagConfig[tag]?.icon} {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div
        onClick={(e) => onQuickAdd(e, item)}
        className="absolute bottom-2.5 right-2.5 h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
      >
        <Plus className="h-4 w-4" />
      </div>
    </button>
  );
}
