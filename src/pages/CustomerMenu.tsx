import { useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Bell, Flame, Zap, Clock, Star, Crown, TrendingUp, Sparkles, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { restaurant, categories, menuItems } from '@/data/mockData';
import ProductDetailModal from '@/components/customer/ProductDetailModal';
import CartSheet from '@/components/customer/CartSheet';
import type { MenuItem } from '@/types/restaurant';
import { useCart } from '@/contexts/CartContext';
import { useMenuTheme } from '@/contexts/MenuThemeContext';
import { useMenuLayout, type MenuSection } from '@/contexts/MenuLayoutContext';
import { useBranding } from '@/contexts/BrandingContext';
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
  const { activeTheme: theme } = useMenuTheme();
  const { layout } = useMenuLayout();
  const { branding } = useBranding();
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

  const flashDeals = useMemo(() => [
    { ...menuItems.find(i => i.id === 'combo-fuego')!, originalPrice: 310, discount: 20 },
    { ...menuItems.find(i => i.id === 'combo-familiar')!, originalPrice: 750, discount: 20 },
    { ...menuItems.find(i => i.id === 'nachos-supremos')!, originalPrice: 189, discount: 21 },
  ], []);

  const enabledSections = [...layout.sections].filter(s => s.enabled).sort((a, b) => a.order - b.order);
  const enabledCategories = enabledSections.filter(s => s.type === 'category' && s.config.categoryId);

  const renderSection = (section: MenuSection) => {
    switch (section.type) {
      case 'flash-deals':
        return <FlashDealsSection key={section.id} flashDeals={flashDeals} onSelect={setSelectedItem} />;
      case 'popular':
        return (
          <PopularSection
            key={section.id}
            items={popularItems}
            title={section.config.title || 'Los más pedidos'}
            theme={theme}
            onSelect={setSelectedItem}
            onQuickAdd={handleQuickAdd}
          />
        );
      case 'custom-banner':
        return section.config.banner ? <CustomBannerSection key={section.id} banner={section.config.banner} /> : null;
      case 'category': {
        const catId = section.config.categoryId!;
        const cat = categories.find(c => c.id === catId);
        let catItems = allAvailable.filter(i => i.categoryId === catId);
        // Apply custom product order
        if (section.config.productOrder && section.config.productOrder.length > 0) {
          const orderMap = new Map(section.config.productOrder.map((id, idx) => [id, idx]));
          catItems = [...catItems].sort((a, b) => (orderMap.get(a.id) ?? 999) - (orderMap.get(b.id) ?? 999));
        }
        if (!cat || catItems.length === 0) return null;
        return (
          <CategorySection
            key={section.id}
            cat={cat}
            items={catItems}
            theme={theme}
            sectionRefs={sectionRefs}
            onSelect={setSelectedItem}
            onQuickAdd={handleQuickAdd}
            displayMode={section.displayMode}
            cardStyle={section.cardStyle}
          />
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${theme.colors.pageBg} pb-24`}>
      {/* Header */}
      <div className={`${theme.colors.headerBg} px-4 pt-5 pb-4`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
              <Flame className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className={`font-heading text-sm font-bold ${theme.colors.headerText} leading-tight`}>{restaurant.name}</h1>
              <p className={`text-[10px] ${theme.colors.headerAccent}`}>Mesa {tableNum} • Menú digital</p>
            </div>
          </div>
          <button onClick={handleCallWaiter} className="bg-white/15 backdrop-blur text-white p-2 rounded-full hover:bg-white/25 transition-colors">
            <Bell className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="¿Qué se te antoja hoy?"
            className="w-full bg-white/15 backdrop-blur text-white placeholder:text-white/40 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
          />
        </div>
      </div>

      {/* Category nav */}
      {!search && enabledCategories.length > 0 && (
        <div className={`sticky top-0 z-40 ${theme.colors.pageBg} backdrop-blur-lg border-b border-border`}>
          <div className="flex gap-1 px-3 py-2 overflow-x-auto no-scrollbar">
            {enabledCategories.map(s => {
              const cat = categories.find(c => c.id === s.config.categoryId);
              if (!cat) return null;
              return (
                <button key={cat.id} onClick={() => scrollToSection(cat.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${theme.colors.categoryBg} hover:opacity-80 transition-colors ${theme.colors.categoryText}`}
                >
                  <span>{cat.icon}</span><span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Search results */}
      {search && filteredItems && (
        <div className="px-4 py-4">
          <p className={`text-xs ${theme.colors.textSecondary} mb-3`}>
            {filteredItems.length} resultado{filteredItems.length !== 1 ? 's' : ''} para "{search}"
          </p>
          <div className="grid gap-3">
            {filteredItems.map(item => (
              <CompactCard key={item.id} item={item} theme={theme} onSelect={setSelectedItem} onQuickAdd={handleQuickAdd} />
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

      {/* Dynamic sections from layout */}
      {!search && (
        <div className="space-y-0">
          {enabledSections.map(renderSection)}
          <div className="h-8" />
        </div>
      )}

      <ProductDetailModal item={selectedItem} open={!!selectedItem} onClose={() => setSelectedItem(null)} />
      <CartSheet />

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
}

/* ── Section Components ── */

function FlashDealsSection({ flashDeals, onSelect }: { flashDeals: any[]; onSelect: (i: MenuItem) => void }) {
  return (
    <section className="px-4 pt-4 pb-2">
      <div className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 rounded-2xl p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
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
            {flashDeals.map(deal => (
              <button key={deal.id} onClick={() => onSelect(deal)} className="flex-shrink-0 w-28 rounded-xl overflow-hidden bg-white/15 backdrop-blur active:scale-[0.96] transition-transform">
                <div className="relative">
                  <img src={deal.image} alt={deal.name} className="w-full h-20 object-cover" loading="lazy" />
                  <div className="absolute top-1 left-1 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">-{deal.discount}%</div>
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
  );
}

function PopularSection({ items, title, theme, onSelect, onQuickAdd }: any) {
  return (
    <section className="px-4 pt-4 pb-2">
      <div className="flex items-center gap-2 mb-3">
        <div className={`h-6 w-6 rounded-lg bg-gradient-to-br ${theme.colors.accentGradient} flex items-center justify-center`}>
          <Crown className="h-3.5 w-3.5 text-white" />
        </div>
        <h2 className={`font-heading font-bold text-base ${theme.colors.textPrimary}`}>{title}</h2>
        <TrendingUp className={`h-3.5 w-3.5 ${theme.colors.priceColor} ml-auto`} />
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
        {items.map((item: MenuItem, i: number) => (
          <motion.button key={item.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
            onClick={() => onSelect(item)}
            className={`flex-shrink-0 w-40 ${theme.style.cardRadius} overflow-hidden ${theme.colors.cardBg} shadow-card active:scale-[0.96] transition-transform relative group border ${theme.colors.cardBorder}`}
          >
            <div className="relative">
              <img src={item.image} alt={item.name} className="w-full h-28 object-cover" loading="lazy" />
              <div className={`absolute inset-0 bg-gradient-to-t ${theme.style.heroOverlay}`} />
              <div className={`absolute top-2 left-2 bg-gradient-to-r ${theme.colors.accentGradient} text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5`}>
                <Flame className="h-2.5 w-2.5" /> #{i + 1} vendido
              </div>
              <button onClick={(e) => onQuickAdd(e, item)} className="absolute bottom-2 right-2 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="p-2.5">
              <p className={`font-heading font-${theme.style.fontWeight} text-sm truncate text-left ${theme.colors.textPrimary}`}>{item.name}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`font-heading font-bold ${theme.colors.priceColor} text-sm`}>{restaurant.currency}{item.price}</span>
                <div className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-warning text-warning" />
                  <span className={`text-[10px] ${theme.colors.textSecondary} font-medium`}>4.{8 + i}</span>
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
}

function CustomBannerSection({ banner }: { banner: any }) {
  return (
    <section className="px-4 pt-3 pb-1">
      <div className={`bg-gradient-to-r ${banner.gradient} rounded-2xl p-4 flex items-center gap-3 relative overflow-hidden`}>
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full" />
        {banner.imageUrl ? (
          <img src={banner.imageUrl} alt="" className="h-12 w-12 rounded-xl object-cover flex-shrink-0 relative z-10" />
        ) : (
          <div className="h-12 w-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center flex-shrink-0 text-xl relative z-10">
            {banner.icon}
          </div>
        )}
        <div className="flex-1 min-w-0 relative z-10">
          <p className="text-white font-heading font-bold text-sm truncate">{banner.title}</p>
          {banner.subtitle && <p className="text-white/70 text-[11px] truncate">{banner.subtitle}</p>}
        </div>
        {banner.badge && (
          <div className="bg-white/20 rounded-lg px-2.5 py-1 relative z-10 flex-shrink-0">
            <p className="text-white text-[10px] font-bold">{banner.badge}</p>
          </div>
        )}
      </div>
    </section>
  );
}

function CategorySection({ cat, items, theme, sectionRefs, onSelect, onQuickAdd, displayMode, cardStyle }: any) {
  const isHorizontal = displayMode === 'horizontal';
  const isGrid = displayMode === 'grid';

  return (
    <section ref={(el: HTMLDivElement | null) => { sectionRefs.current[cat.id] = el; }} className="px-4 pt-5 pb-1">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{cat.icon}</span>
        <h2 className={`font-heading font-bold text-base ${theme.colors.textPrimary}`}>{cat.name}</h2>
        <span className={`text-xs ${theme.colors.textSecondary}`}>({items.length})</span>
      </div>

      {isHorizontal ? (
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
          {items.map((item: MenuItem, i: number) => (
            <motion.button key={item.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => onSelect(item)}
              className={`flex-shrink-0 w-40 ${theme.style.cardRadius} overflow-hidden ${theme.colors.cardBg} shadow-card active:scale-[0.96] transition-transform relative border ${theme.colors.cardBorder}`}
            >
              <div className="relative">
                <img src={item.image} alt={item.name} className="w-full h-28 object-cover" loading="lazy" />
                <div className={`absolute inset-0 bg-gradient-to-t ${theme.style.heroOverlay}`} />
                {item.tags.length > 0 && (
                  <div className={`absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-full ${tagConfig[item.tags[0]]?.bg || 'bg-white/20 text-white'}`}>
                    {tagConfig[item.tags[0]]?.icon} {item.tags[0]}
                  </div>
                )}
                <button onClick={(e) => onQuickAdd(e, item)} className="absolute bottom-2 right-2 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="p-2.5">
                <p className={`font-heading font-${theme.style.fontWeight} text-sm truncate text-left ${theme.colors.textPrimary}`}>{item.name}</p>
                <span className={`font-heading font-bold ${theme.colors.priceColor} text-sm`}>{restaurant.currency}{item.price}</span>
              </div>
            </motion.button>
          ))}
        </div>
      ) : isGrid ? (
        <div className="grid grid-cols-2 gap-2.5">
          {items.map((item: MenuItem) => (
            <button key={item.id} onClick={() => onSelect(item)}
              className={`${theme.style.cardRadius} overflow-hidden ${theme.colors.cardBg} shadow-card active:scale-[0.96] transition-transform relative border ${theme.colors.cardBorder} text-left`}
            >
              <div className="relative">
                <img src={item.image} alt={item.name} className="w-full h-32 object-cover" loading="lazy" />
                <div className={`absolute inset-0 bg-gradient-to-t ${theme.style.heroOverlay}`} />
                {item.tags.length > 0 && (
                  <div className={`absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${tagConfig[item.tags[0]]?.bg || 'bg-white/20 text-white'}`}>
                    {tagConfig[item.tags[0]]?.icon} {item.tags[0]}
                  </div>
                )}
                <button onClick={(e) => onQuickAdd(e, item)} className="absolute bottom-1.5 right-1.5 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="p-2">
                <p className={`font-heading font-${theme.style.fontWeight} text-sm truncate ${theme.colors.textPrimary}`}>{item.name}</p>
                <span className={`font-heading font-bold ${theme.colors.priceColor} text-sm`}>{restaurant.currency}{item.price}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* Vertical mode */
        <div className="space-y-2.5">
          {cardStyle === 'hero-first' && items.length > 0 && <HeroCard item={items[0]} theme={theme} onSelect={onSelect} onQuickAdd={onQuickAdd} />}
          {(cardStyle === 'hero-first' ? items.slice(1) : items).map((item: MenuItem) => (
            cardStyle === 'cards-only' ? (
              <button key={item.id} onClick={() => onSelect(item)}
                className={`w-full ${theme.style.cardRadius} overflow-hidden ${theme.colors.cardBg} shadow-card text-left active:scale-[0.98] transition-transform relative border ${theme.colors.cardBorder}`}
              >
                <div className="relative">
                  <img src={item.image} alt={item.name} className="w-full h-36 object-cover" loading="lazy" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${theme.style.heroOverlay}`} />
                  <button onClick={(e) => onQuickAdd(e, item)} className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-3">
                  <p className={`font-heading font-${theme.style.fontWeight} text-base ${theme.colors.textPrimary}`}>{item.name}</p>
                  <p className={`text-xs ${theme.colors.textSecondary} mt-0.5 line-clamp-1`}>{item.description}</p>
                  <span className={`font-heading font-bold ${theme.colors.priceColor} text-base mt-1 block`}>{restaurant.currency}{item.price}</span>
                </div>
              </button>
            ) : (
              <CompactCard key={item.id} item={item} theme={theme} onSelect={onSelect} onQuickAdd={onQuickAdd} />
            )
          ))}
        </div>
      )}
    </section>
  );
}

function HeroCard({ item, theme, onSelect, onQuickAdd }: any) {
  return (
    <button onClick={() => onSelect(item)} className={`w-full ${theme.style.cardRadius} overflow-hidden ${theme.colors.cardBg} shadow-card text-left active:scale-[0.98] transition-transform relative border ${theme.colors.cardBorder}`}>
      <div className="relative">
        <img src={item.image} alt={item.name} className="w-full h-44 object-cover" loading="lazy" />
        <div className={`absolute inset-0 bg-gradient-to-t ${theme.style.heroOverlay}`} />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-end justify-between">
            <div>
              {item.tags.length > 0 && (
                <div className="flex gap-1 mb-1.5">
                  {item.tags.map((tag: string) => (
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
              <div onClick={(e: React.MouseEvent) => onQuickAdd(e, item)} className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <Plus className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

function CompactCard({ item, theme, onSelect, onQuickAdd }: any) {
  return (
    <button onClick={() => onSelect(item)}
      className={`flex gap-3 ${theme.style.cardRadius} ${theme.colors.cardBg} p-2.5 shadow-card text-left w-full transition-all active:scale-[0.98] hover:shadow-elevated relative border ${theme.colors.cardBorder}`}
    >
      <div className="relative flex-shrink-0">
        <img src={item.image} alt={item.name} loading="lazy" className={`h-20 w-20 ${theme.style.imageRadius} object-cover`} />
        {item.tags.includes('más vendido') && (
          <div className={`absolute -top-1 -left-1 bg-gradient-to-r ${theme.colors.accentGradient} text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md`}>🔥 TOP</div>
        )}
        {item.tags.includes('nuevo') && (
          <div className="absolute -top-1 -left-1 bg-gradient-to-r from-emerald-500 to-green-400 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md">✨ NEW</div>
        )}
      </div>
      <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
        <div>
          <h3 className={`font-heading font-${theme.style.fontWeight} text-sm leading-tight ${theme.colors.textPrimary}`}>{item.name}</h3>
          <p className={`text-[11px] ${theme.colors.textSecondary} mt-0.5 line-clamp-2`}>{item.description}</p>
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-baseline gap-1.5">
            <span className={`font-heading font-bold ${theme.colors.priceColor} text-base`}>{restaurant.currency}{item.price}</span>
            {item.tags.includes('ahorro') && (
              <span className={`text-[10px] ${theme.colors.textSecondary} line-through`}>${Math.round(item.price * 1.25)}</span>
            )}
          </div>
          <div className="flex gap-1">
            {item.tags.filter((t: string) => !['más vendido', 'nuevo', 'ahorro'].includes(t)).slice(0, 1).map((tag: string) => (
              <span key={tag} className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${tagConfig[tag]?.bg || `${theme.colors.badgeBg} ${theme.colors.badgeText}`}`}>
                {tagConfig[tag]?.icon} {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div onClick={(e: React.MouseEvent) => onQuickAdd(e, item)} className="absolute bottom-2.5 right-2.5 h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
        <Plus className="h-4 w-4" />
      </div>
    </button>
  );
}
