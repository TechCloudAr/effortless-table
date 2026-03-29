import { useState, useRef } from 'react';
import { useMenuLayout, type BannerConfig, type MenuSection, type DisplayMode, type CardStyle } from '@/contexts/MenuLayoutContext';
import { useMenuTheme, menuThemes, type MenuThemeConfig } from '@/contexts/MenuThemeContext';
import { useBranding, fontCatalog, type FontPair } from '@/contexts/BrandingContext';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  ChevronUp, ChevronDown, Plus, Trash2, Pencil, Image as ImageIcon,
  Palette, LayoutList, GripVertical, Check, Smartphone, Eye, Zap, Clock,
  Crown, TrendingUp, Flame, Star, Bell, Search, Sparkles,
  Rows3, Columns3, LayoutGrid, ChevronRight, ArrowUpDown, Type, Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { categories, menuItems, restaurant } from '@/data/mockData';
import type { MenuCategory, MenuItem } from '@/types/restaurant';

const gradientOptions = [
  { value: 'from-violet-600 to-fuchsia-500', label: '💜 Violeta → Fucsia' },
  { value: 'from-red-600 to-orange-500', label: '🔴 Rojo → Naranja' },
  { value: 'from-emerald-500 to-teal-400', label: '🟢 Verde → Teal' },
  { value: 'from-blue-600 to-cyan-500', label: '🔵 Azul → Cyan' },
  { value: 'from-amber-500 to-yellow-400', label: '🟡 Ámbar → Amarillo' },
  { value: 'from-pink-500 to-rose-400', label: '🩷 Rosa → Rose' },
  { value: 'from-slate-700 to-slate-900', label: '⚫ Oscuro' },
];

const iconOptions = ['✨', '🔥', '🎁', '💰', '🎉', '⭐', '🏷️', '🍔', '🥤', '🍕'];

const displayModeOptions: { value: DisplayMode; label: string; icon: typeof Rows3 }[] = [
  { value: 'vertical', label: 'Vertical', icon: Rows3 },
  { value: 'horizontal', label: 'Horizontal', icon: Columns3 },
  { value: 'grid', label: 'Grilla', icon: LayoutGrid },
];

const cardStyleOptions: { value: CardStyle; label: string; desc: string }[] = [
  { value: 'hero-first', label: 'Hero + lista', desc: 'Primero grande, resto compacto' },
  { value: 'compact', label: 'Compacto', desc: 'Todos en lista compacta' },
  { value: 'cards-only', label: 'Tarjetas', desc: 'Tarjetas con imagen' },
  { value: 'image-grid', label: 'Galería', desc: 'Grilla de imágenes' },
];

export default function AdminThemes() {
  const { layout, toggleSection, moveSection, updateSection, addBanner, removeSection } = useMenuLayout();
  const { activeTheme, setThemeId } = useMenuTheme();
  const [bannerDialogOpen, setBannerDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<MenuSection | null>(null);
  const [activePanel, setActivePanel] = useState<'sections' | 'theme'>('sections');
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [bannerForm, setBannerForm] = useState<BannerConfig>({
    title: '', subtitle: '', gradient: 'from-violet-600 to-fuchsia-500', icon: '✨', badge: '', imageUrl: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sortedSections = [...layout.sections].sort((a, b) => a.order - b.order);
  const enabledSections = sortedSections.filter(s => s.enabled);

  const openNewBanner = () => {
    setEditingSection(null);
    setBannerForm({ title: '', subtitle: '', gradient: 'from-violet-600 to-fuchsia-500', icon: '✨', badge: '', imageUrl: '' });
    setBannerDialogOpen(true);
  };

  const openEditBanner = (section: MenuSection) => {
    if (section.config.banner) {
      setEditingSection(section);
      setBannerForm({ ...section.config.banner });
      setBannerDialogOpen(true);
    }
  };

  const handleSaveBanner = () => {
    if (!bannerForm.title.trim()) { toast.error('El banner necesita un título'); return; }
    if (editingSection) {
      updateSection(editingSection.id, { label: `🎁 ${bannerForm.title}`, config: { ...editingSection.config, banner: bannerForm } });
      toast.success('Banner actualizado');
    } else {
      addBanner(bannerForm);
      toast.success('Banner agregado');
    }
    setBannerDialogOpen(false);
  };

  const handleEditTitle = (section: MenuSection) => {
    const currentTitle = section.type === 'popular' ? (section.config.title || 'Los más pedidos') : section.label;
    const newTitle = prompt('Título de la sección:', currentTitle);
    if (newTitle !== null && newTitle.trim()) {
      if (section.type === 'popular') {
        updateSection(section.id, { config: { ...section.config, title: newTitle }, label: `🏆 ${newTitle}` });
      } else if (section.type === 'flash-deals') {
        updateSection(section.id, { label: `⚡ ${newTitle}`, config: { ...section.config, title: newTitle } });
      } else if (section.type === 'category') {
        updateSection(section.id, { label: newTitle });
      }
      toast.success('Título actualizado');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Solo imágenes'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Máximo 5MB'); return; }
    const reader = new FileReader();
    reader.onload = () => setBannerForm(f => ({ ...f, imageUrl: reader.result as string }));
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getProductsForSection = (section: MenuSection): MenuItem[] => {
    if (section.type !== 'category' || !section.config.categoryId) return [];
    const catItems = menuItems.filter(i => i.categoryId === section.config.categoryId && i.available);
    if (section.config.productOrder && section.config.productOrder.length > 0) {
      const orderMap = new Map(section.config.productOrder.map((id, idx) => [id, idx]));
      return [...catItems].sort((a, b) => {
        const aIdx = orderMap.get(a.id) ?? 999;
        const bIdx = orderMap.get(b.id) ?? 999;
        return aIdx - bIdx;
      });
    }
    return catItems;
  };

  const moveProduct = (section: MenuSection, productId: string, direction: 'up' | 'down') => {
    const products = getProductsForSection(section);
    const currentOrder = products.map(p => p.id);
    const idx = currentOrder.indexOf(productId);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= currentOrder.length) return;
    [currentOrder[idx], currentOrder[swapIdx]] = [currentOrder[swapIdx], currentOrder[idx]];
    updateSection(section.id, { config: { ...section.config, productOrder: currentOrder } });
  };

  return (
    <div className="h-[calc(100vh-0px)] md:h-screen flex flex-col">
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-lg font-bold hidden sm:block">Editor Visual</h1>
          <div className="flex bg-muted rounded-lg p-0.5">
            <button
              onClick={() => setActivePanel('sections')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activePanel === 'sections' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
              }`}
            >
              <LayoutList className="h-3.5 w-3.5" /> Secciones
            </button>
            <button
              onClick={() => setActivePanel('theme')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activePanel === 'theme' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
              }`}
            >
              <Palette className="h-3.5 w-3.5" /> Tema
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px] h-5 hidden sm:flex">{activeTheme.name}</Badge>
          <Button size="sm" onClick={openNewBanner} className="gradient-primary gap-1.5 h-8 text-xs">
            <Plus className="h-3.5 w-3.5" /> Banner
          </Button>
        </div>
      </div>

      {/* Main split panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel — controls */}
        <div className="w-full md:w-[380px] lg:w-[420px] border-r border-border overflow-y-auto bg-background flex-shrink-0">
          {activePanel === 'sections' ? (
            <SectionsPanel
              sections={sortedSections}
              hoveredSection={hoveredSection}
              setHoveredSection={setHoveredSection}
              expandedSection={expandedSection}
              setExpandedSection={setExpandedSection}
              onToggle={toggleSection}
              onMove={moveSection}
              onEditBanner={openEditBanner}
              onEditTitle={handleEditTitle}
              onRemove={removeSection}
              onAddBanner={openNewBanner}
              onUpdateSection={updateSection}
              getProductsForSection={getProductsForSection}
              onMoveProduct={moveProduct}
            />
          ) : (
            <ThemePanel activeTheme={activeTheme} setThemeId={setThemeId} />
          )}
        </div>

        {/* Right panel — live preview */}
        <div className="hidden md:flex flex-1 items-center justify-center bg-[hsl(var(--muted)/0.3)] overflow-hidden p-6">
          <PhonePreview
            sections={enabledSections}
            theme={activeTheme}
            hoveredSection={hoveredSection}
            getProductsForSection={getProductsForSection}
          />
        </div>
      </div>

      {/* Banner Dialog */}
      <BannerDialog
        open={bannerDialogOpen}
        onOpenChange={setBannerDialogOpen}
        form={bannerForm}
        setForm={setBannerForm}
        editing={!!editingSection}
        onSave={handleSaveBanner}
        onImageUpload={handleImageUpload}
        fileInputRef={fileInputRef}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTIONS PANEL
   ═══════════════════════════════════════════════════════════ */
function SectionsPanel({
  sections, hoveredSection, setHoveredSection, expandedSection, setExpandedSection,
  onToggle, onMove, onEditBanner, onEditTitle, onRemove, onAddBanner, onUpdateSection,
  getProductsForSection, onMoveProduct,
}: {
  sections: MenuSection[];
  hoveredSection: string | null;
  setHoveredSection: (id: string | null) => void;
  expandedSection: string | null;
  setExpandedSection: (id: string | null) => void;
  onToggle: (id: string) => void;
  onMove: (id: string, dir: 'up' | 'down') => void;
  onEditBanner: (s: MenuSection) => void;
  onEditTitle: (s: MenuSection) => void;
  onRemove: (id: string) => void;
  onAddBanner: () => void;
  onUpdateSection: (id: string, updates: Partial<MenuSection>) => void;
  getProductsForSection: (s: MenuSection) => MenuItem[];
  onMoveProduct: (s: MenuSection, productId: string, dir: 'up' | 'down') => void;
}) {
  const typeLabels: Record<string, { icon: string; text: string; color: string }> = {
    'flash-deals': { icon: '⚡', text: 'Ofertas', color: 'bg-orange-500/15 text-orange-500' },
    'popular': { icon: '🏆', text: 'Populares', color: 'bg-amber-500/15 text-amber-600' },
    'custom-banner': { icon: '🎨', text: 'Banner', color: 'bg-violet-500/15 text-violet-500' },
    'category': { icon: '📂', text: 'Categoría', color: 'bg-blue-500/15 text-blue-500' },
  };

  return (
    <div className="p-4 space-y-2">
      <p className="text-[11px] text-muted-foreground mb-3">
        Reordená, activá o editá cada sección. Expandí categorías para reordenar productos →
      </p>

      {sections.map((section, idx) => {
        const tl = typeLabels[section.type] || { icon: '?', text: section.type, color: 'bg-muted' };
        const isHovered = hoveredSection === section.id;
        const isExpanded = expandedSection === section.id;
        const canEdit = section.type === 'custom-banner' || section.type === 'popular' || section.type === 'flash-deals' || section.type === 'category';
        const canExpand = section.type === 'category';
        const products = canExpand ? getProductsForSection(section) : [];

        return (
          <div key={section.id}>
            <div
              onMouseEnter={() => setHoveredSection(section.id)}
              onMouseLeave={() => setHoveredSection(null)}
              className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-default ${
                isHovered ? 'border-primary/40 bg-primary/5 shadow-sm' :
                section.enabled ? 'bg-card border-border' : 'bg-muted/30 border-border/50 opacity-50'
              } ${isExpanded ? 'rounded-b-none border-b-0' : ''}`}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground/30 flex-shrink-0" />

              {canExpand && (
                <button onClick={() => setExpandedSection(isExpanded ? null : section.id)} className="flex-shrink-0">
                  <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-semibold text-xs truncate">{section.label}</span>
                  <Badge variant="outline" className={`text-[9px] h-4 ${tl.color} border-0`}>{tl.icon} {tl.text}</Badge>
                </div>
                {section.type === 'custom-banner' && section.config.banner && (
                  <p className="text-[10px] text-muted-foreground truncate">{section.config.banner.subtitle || 'Sin subtítulo'}</p>
                )}
                {section.type === 'category' && section.config.categoryId && (
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] text-muted-foreground">
                      {products.length} productos
                    </p>
                    <DisplayModeChips section={section} onUpdate={onUpdateSection} />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-0.5 flex-shrink-0">
                {canEdit && (
                  <Button variant="ghost" size="icon" className="h-6 w-6"
                    onClick={() => section.type === 'custom-banner' ? onEditBanner(section) : onEditTitle(section)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === 0}
                  onClick={() => onMove(section.id, 'up')}>
                  <ChevronUp className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === sections.length - 1}
                  onClick={() => onMove(section.id, 'down')}>
                  <ChevronDown className="h-3 w-3" />
                </Button>
                {section.type === 'custom-banner' && (
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={() => { onRemove(section.id); toast.success('Eliminado'); }}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
                <Switch checked={section.enabled} onCheckedChange={() => onToggle(section.id)} className="ml-1" />
              </div>
            </div>

            {/* Expanded category: display settings + product order */}
            {isExpanded && canExpand && (
              <div className="border border-t-0 border-border rounded-b-xl bg-muted/20 p-3 space-y-3">
                {/* Display mode */}
                <div>
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Disposición</Label>
                  <div className="flex gap-1.5 mt-1.5">
                    {displayModeOptions.map(opt => {
                      const Icon = opt.icon;
                      return (
                        <button key={opt.value}
                          onClick={() => onUpdateSection(section.id, { displayMode: opt.value })}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                            section.displayMode === opt.value
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                          }`}>
                          <Icon className="h-3 w-3" />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Card style */}
                <div>
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Estilo de tarjeta</Label>
                  <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                    {cardStyleOptions.map(opt => (
                      <button key={opt.value}
                        onClick={() => onUpdateSection(section.id, { cardStyle: opt.value })}
                        className={`text-left px-2.5 py-1.5 rounded-lg text-[10px] transition-all ${
                          section.cardStyle === opt.value
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                        }`}>
                        <span className="font-medium">{opt.label}</span>
                        <p className={`text-[8px] mt-0.5 ${section.cardStyle === opt.value ? 'text-primary-foreground/70' : 'text-muted-foreground/60'}`}>{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Product order */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Orden de productos</Label>
                  </div>
                  <div className="space-y-1">
                    {products.map((product, pIdx) => (
                      <div key={product.id} className="flex items-center gap-2 bg-card rounded-lg p-1.5 border border-border">
                        <img src={product.image} alt="" className="h-7 w-7 rounded object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-medium truncate">{product.name}</p>
                          <p className="text-[9px] text-muted-foreground">{restaurant.currency}{product.price}</p>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <Button variant="ghost" size="icon" className="h-5 w-5" disabled={pIdx === 0}
                            onClick={() => onMoveProduct(section, product.id, 'up')}>
                            <ChevronUp className="h-2.5 w-2.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-5 w-5" disabled={pIdx === products.length - 1}
                            onClick={() => onMoveProduct(section, product.id, 'down')}>
                            <ChevronDown className="h-2.5 w-2.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <button onClick={onAddBanner}
        className="w-full border-2 border-dashed border-border rounded-xl p-3 text-center hover:border-primary/40 hover:bg-primary/5 transition-all group">
        <Plus className="h-4 w-4 mx-auto text-muted-foreground group-hover:text-primary mb-1" />
        <p className="text-xs text-muted-foreground group-hover:text-foreground">Agregar banner</p>
      </button>
    </div>
  );
}

/* ── Display Mode Chips (inline) ── */
function DisplayModeChips({ section, onUpdate }: { section: MenuSection; onUpdate: (id: string, u: Partial<MenuSection>) => void }) {
  return (
    <div className="flex gap-0.5">
      {displayModeOptions.map(opt => {
        const Icon = opt.icon;
        return (
          <button key={opt.value}
            onClick={(e) => { e.stopPropagation(); onUpdate(section.id, { displayMode: opt.value }); }}
            className={`p-0.5 rounded transition-colors ${
              section.displayMode === opt.value ? 'text-primary' : 'text-muted-foreground/40 hover:text-muted-foreground'
            }`}
            title={opt.label}>
            <Icon className="h-2.5 w-2.5" />
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   THEME PANEL
   ═══════════════════════════════════════════════════════════ */
function ThemePanel({ activeTheme, setThemeId }: { activeTheme: MenuThemeConfig; setThemeId: (id: any) => void }) {
  return (
    <div className="p-4 space-y-3">
      <p className="text-[11px] text-muted-foreground mb-2">Elegí el estilo visual del menú. Se aplica al instante.</p>
      {menuThemes.map(theme => (
        <button
          key={theme.id}
          onClick={() => { setThemeId(theme.id); toast.success(`Tema "${theme.name}" aplicado`); }}
          className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
            activeTheme.id === theme.id ? 'border-primary shadow-md bg-primary/5' : 'border-border hover:border-primary/30'
          }`}
        >
          <div className="flex gap-1 mb-2">
            <div className={`h-6 w-10 rounded-md ${theme.colors.headerBg}`} />
            <div className={`h-6 w-6 rounded-md ${theme.colors.pageBg} border border-border`} />
            <div className={`h-6 flex-1 rounded-md bg-gradient-to-r ${theme.colors.accentGradient}`} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-xs">{theme.name}</h3>
              <p className="text-[10px] text-muted-foreground">{theme.description}</p>
            </div>
            {activeTheme.id === theme.id && (
              <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Check className="h-3 w-3 text-primary-foreground" />
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PHONE PREVIEW
   ═══════════════════════════════════════════════════════════ */
function PhonePreview({ sections, theme, hoveredSection, getProductsForSection }: {
  sections: MenuSection[];
  theme: MenuThemeConfig;
  hoveredSection: string | null;
  getProductsForSection: (s: MenuSection) => MenuItem[];
}) {
  const allAvailable = menuItems.filter(i => i.available);
  const popularItems = menuItems.filter(i => i.popular && i.available);

  return (
    <div className="w-[320px] h-[620px] rounded-[2.5rem] border-[6px] border-foreground/20 bg-foreground/10 shadow-2xl overflow-hidden flex flex-col">
      <div className="h-6 bg-foreground/20 flex items-center justify-center">
        <div className="w-20 h-3 bg-foreground/30 rounded-full" />
      </div>
      <div className={`flex-1 overflow-y-auto ${theme.colors.pageBg}`}>
        {/* Header */}
        <div className={`${theme.colors.headerBg} px-3 pt-3 pb-2.5`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div className="h-5 w-5 bg-white/20 rounded-md flex items-center justify-center">
                <Flame className="h-3 w-3 text-white" />
              </div>
              <div>
                <p className={`text-[9px] font-bold ${theme.colors.headerText}`}>{restaurant.name}</p>
                <p className={`text-[7px] ${theme.colors.headerAccent}`}>Mesa 5 • Menú digital</p>
              </div>
            </div>
            <div className="h-5 w-5 bg-white/15 rounded-full flex items-center justify-center">
              <Bell className="h-2.5 w-2.5 text-white" />
            </div>
          </div>
          <div className="bg-white/15 rounded-lg h-5 flex items-center px-2 gap-1">
            <Search className="h-2.5 w-2.5 text-white/40" />
            <span className="text-[8px] text-white/40">¿Qué se te antoja hoy?</span>
          </div>
        </div>

        {/* Category pills */}
        <div className={`${theme.colors.pageBg} px-2 py-1.5 flex gap-1 overflow-x-hidden border-b border-border/30`}>
          {categories.slice(0, 4).map((cat, i) => (
            <div key={cat.id} className={`px-1.5 py-0.5 rounded-full text-[7px] font-medium whitespace-nowrap ${
              i === 0 ? `${theme.colors.categoryActiveBg} ${theme.colors.categoryActiveText}` : `${theme.colors.categoryBg} ${theme.colors.categoryText}`
            }`}>
              {cat.icon} {cat.name}
            </div>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-0">
          {sections.map(section => (
            <div
              key={section.id}
              className={`transition-all ${hoveredSection === section.id ? 'ring-2 ring-primary ring-inset rounded-sm' : ''}`}
            >
              <PreviewSection section={section} theme={theme} allAvailable={allAvailable} popularItems={popularItems} getProductsForSection={getProductsForSection} />
            </div>
          ))}
        </div>

        <div className="h-4" />
      </div>
      <div className="h-5 bg-foreground/10 flex items-center justify-center">
        <div className="w-24 h-1 bg-foreground/20 rounded-full" />
      </div>
    </div>
  );
}

function PreviewSection({ section, theme, allAvailable, popularItems, getProductsForSection }: {
  section: MenuSection; theme: MenuThemeConfig; allAvailable: any[]; popularItems: any[];
  getProductsForSection: (s: MenuSection) => MenuItem[];
}) {
  switch (section.type) {
    case 'flash-deals':
      return (
        <div className="px-2 pt-2 pb-1">
          <div className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 rounded-lg p-2 relative overflow-hidden">
            <div className="flex items-center gap-1 mb-1">
              <Zap className="h-2.5 w-2.5 text-yellow-200" />
              <span className="text-white font-heading font-bold text-[8px]">{section.config.title || 'OFERTAS RELÁMPAGO'}</span>
              <div className="ml-auto flex items-center gap-0.5 bg-white/20 rounded-full px-1 py-0.5">
                <Clock className="h-2 w-2 text-white" />
                <span className="text-white text-[6px] font-bold">02:34</span>
              </div>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-14 bg-white/15 rounded-md overflow-hidden">
                  <div className="h-8 bg-white/10" />
                  <div className="p-1">
                    <div className="h-[3px] bg-white/40 rounded w-10 mb-0.5" />
                    <div className="h-[3px] bg-yellow-200/50 rounded w-6" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'popular':
      return (
        <div className="px-2 pt-2 pb-1">
          <div className="flex items-center gap-1 mb-1.5">
            <div className={`h-4 w-4 rounded bg-gradient-to-br ${theme.colors.accentGradient} flex items-center justify-center`}>
              <Crown className="h-2.5 w-2.5 text-white" />
            </div>
            <span className={`font-heading font-bold text-[9px] ${theme.colors.textPrimary}`}>{section.config.title || 'Los más pedidos'}</span>
          </div>
          <div className="flex gap-1.5 overflow-hidden">
            {popularItems.slice(0, 3).map((item, i) => (
              <div key={item.id} className={`w-[80px] flex-shrink-0 ${theme.style.cardRadius} overflow-hidden ${theme.colors.cardBg} border ${theme.colors.cardBorder} shadow-sm`}>
                <div className="relative h-14">
                  <img src={item.image} alt="" className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${theme.style.heroOverlay}`} />
                  <div className={`absolute top-0.5 left-0.5 bg-gradient-to-r ${theme.colors.accentGradient} text-white text-[5px] font-bold px-1 rounded-full`}>#{i + 1}</div>
                </div>
                <div className="p-1">
                  <p className={`text-[7px] font-bold ${theme.colors.textPrimary} truncate`}>{item.name}</p>
                  <p className={`text-[7px] font-bold ${theme.colors.priceColor}`}>${item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'custom-banner':
      if (!section.config.banner) return null;
      const b = section.config.banner;
      return (
        <div className="px-2 pt-1.5 pb-0.5">
          <div className={`bg-gradient-to-r ${b.gradient} rounded-lg p-2 flex items-center gap-2 relative overflow-hidden`}>
            <div className="absolute -right-3 -top-3 w-10 h-10 bg-white/10 rounded-full" />
            {b.imageUrl ? (
              <img src={b.imageUrl} alt="" className="h-7 w-7 rounded-md object-cover flex-shrink-0 relative z-10" />
            ) : (
              <div className="h-7 w-7 bg-white/20 rounded-md flex items-center justify-center flex-shrink-0 text-sm relative z-10">{b.icon}</div>
            )}
            <div className="flex-1 min-w-0 relative z-10">
              <p className="text-white font-heading font-bold text-[8px] truncate">{b.title}</p>
              {b.subtitle && <p className="text-white/70 text-[7px] truncate">{b.subtitle}</p>}
            </div>
            {b.badge && (
              <div className="bg-white/20 rounded px-1 py-0.5 relative z-10">
                <p className="text-white text-[6px] font-bold">{b.badge}</p>
              </div>
            )}
          </div>
        </div>
      );

    case 'category': {
      const catId = section.config.categoryId;
      const cat = categories.find(c => c.id === catId);
      const items = getProductsForSection(section);
      if (!cat || items.length === 0) return null;

      const isHorizontal = section.displayMode === 'horizontal';
      const isGrid = section.displayMode === 'grid';

      return (
        <div className="px-2 pt-2.5 pb-0.5">
          <div className="flex items-center gap-1 mb-1.5">
            <span className="text-[10px]">{cat.icon}</span>
            <span className={`font-heading font-bold text-[9px] ${theme.colors.textPrimary}`}>{cat.name}</span>
            <span className={`text-[7px] ${theme.colors.textSecondary}`}>({items.length})</span>
            {isHorizontal && <Columns3 className="h-2.5 w-2.5 text-muted-foreground/40 ml-auto" />}
            {isGrid && <LayoutGrid className="h-2.5 w-2.5 text-muted-foreground/40 ml-auto" />}
          </div>

          {isHorizontal ? (
            <div className="flex gap-1.5 overflow-hidden">
              {items.slice(0, 3).map(item => (
                <div key={item.id} className={`w-[80px] flex-shrink-0 ${theme.style.cardRadius} overflow-hidden ${theme.colors.cardBg} border ${theme.colors.cardBorder} shadow-sm`}>
                  <img src={item.image} alt="" className="w-full h-10 object-cover" />
                  <div className="p-1">
                    <p className={`text-[7px] font-bold ${theme.colors.textPrimary} truncate`}>{item.name}</p>
                    <p className={`text-[7px] font-bold ${theme.colors.priceColor}`}>${item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : isGrid ? (
            <div className="grid grid-cols-2 gap-1">
              {items.slice(0, 4).map(item => (
                <div key={item.id} className={`${theme.style.cardRadius} overflow-hidden ${theme.colors.cardBg} border ${theme.colors.cardBorder} shadow-sm`}>
                  <img src={item.image} alt="" className="w-full h-12 object-cover" />
                  <div className="p-1">
                    <p className={`text-[6px] font-bold ${theme.colors.textPrimary} truncate`}>{item.name}</p>
                    <p className={`text-[6px] font-bold ${theme.colors.priceColor}`}>${item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {section.cardStyle === 'hero-first' && (
                <div className={`${theme.style.cardRadius} overflow-hidden ${theme.colors.cardBg} border ${theme.colors.cardBorder} shadow-sm mb-1.5`}>
                  <div className="relative h-16">
                    <img src={items[0].image} alt="" className="w-full h-full object-cover" />
                    <div className={`absolute inset-0 bg-gradient-to-t ${theme.style.heroOverlay}`} />
                    <div className="absolute bottom-1 left-1.5">
                      <p className="text-white font-heading font-bold text-[8px]">{items[0].name}</p>
                      <p className="text-white font-bold text-[8px]">${items[0].price}</p>
                    </div>
                  </div>
                </div>
              )}
              {items.slice(section.cardStyle === 'hero-first' ? 1 : 0, section.cardStyle === 'hero-first' ? 3 : 3).map(item => (
                <div key={item.id} className={`flex gap-1.5 ${theme.style.cardRadius} ${theme.colors.cardBg} p-1 border ${theme.colors.cardBorder} shadow-sm mb-1`}>
                  <img src={item.image} alt="" className={`h-8 w-8 ${theme.style.imageRadius} object-cover flex-shrink-0`} />
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className={`text-[7px] font-bold ${theme.colors.textPrimary} truncate`}>{item.name}</p>
                    <p className={`text-[7px] font-bold ${theme.colors.priceColor}`}>${item.price}</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      );
    }

    default:
      return null;
  }
}

/* ═══════════════════════════════════════════════════════════
   BANNER DIALOG
   ═══════════════════════════════════════════════════════════ */
function BannerDialog({ open, onOpenChange, form, setForm, editing, onSave, onImageUpload, fileInputRef }: {
  open: boolean; onOpenChange: (v: boolean) => void; form: BannerConfig;
  setForm: (fn: (f: BannerConfig) => BannerConfig) => void;
  editing: boolean; onSave: () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar banner' : 'Nuevo banner'}</DialogTitle>
          <DialogDescription>Creá un banner promocional para tu menú</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Live preview */}
          <div className={`bg-gradient-to-r ${form.gradient} rounded-2xl p-4 flex items-center gap-3 relative overflow-hidden`}>
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full" />
            {form.imageUrl ? (
              <img src={form.imageUrl} alt="" className="h-12 w-12 rounded-xl object-cover flex-shrink-0 relative z-10" />
            ) : (
              <div className="h-12 w-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center flex-shrink-0 text-xl relative z-10">{form.icon}</div>
            )}
            <div className="flex-1 min-w-0 relative z-10">
              <p className="text-white font-heading font-bold text-sm truncate">{form.title || 'Título del banner'}</p>
              <p className="text-white/70 text-[11px] truncate">{form.subtitle || 'Subtítulo opcional'}</p>
            </div>
            {form.badge && (
              <div className="bg-white/20 rounded-lg px-2.5 py-1 flex-shrink-0 relative z-10">
                <p className="text-white text-[10px] font-bold">{form.badge}</p>
              </div>
            )}
          </div>

          <div>
            <Label>Título *</Label>
            <Input placeholder="Ej: ¡2x1 en bebidas!" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="mt-1.5" />
          </div>
          <div>
            <Label>Subtítulo</Label>
            <Input placeholder="Ej: De lunes a jueves" value={form.subtitle}
              onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} className="mt-1.5" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Etiqueta</Label>
              <Input placeholder="HOY, NUEVO, -20%" value={form.badge || ''}
                onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} className="mt-1.5" />
            </div>
            <div>
              <Label>Color</Label>
              <Select value={form.gradient} onValueChange={v => setForm(f => ({ ...f, gradient: v }))}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {gradientOptions.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Icono</Label>
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              {iconOptions.map(icon => (
                <button key={icon} onClick={() => setForm(f => ({ ...f, icon }))}
                  className={`h-9 w-9 rounded-lg flex items-center justify-center text-lg transition-all ${
                    form.icon === icon ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted hover:bg-accent'
                  }`}>
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Imagen (opcional)</Label>
            <div className="flex gap-2 mt-1.5">
              <Input placeholder="URL de imagen" value={form.imageUrl || ''}
                onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} className="flex-1" />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <ImageIcon className="h-3.5 w-3.5" />
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onImageUpload} />
            </div>
            {form.imageUrl && (
              <button onClick={() => setForm(f => ({ ...f, imageUrl: '' }))} className="text-xs text-destructive mt-1">Quitar imagen</button>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onSave} className="gradient-primary">{editing ? 'Guardar' : 'Agregar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
