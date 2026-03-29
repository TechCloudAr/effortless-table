import { useState, useRef } from 'react';
import { useMenuLayout, type BannerConfig, type MenuSection } from '@/contexts/MenuLayoutContext';
import { useMenuTheme, menuThemes } from '@/contexts/MenuThemeContext';
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
  ChevronUp, ChevronDown, Eye, EyeOff, Plus, Trash2, Pencil, Image as ImageIcon,
  Palette, LayoutList, GripVertical, Sparkles, Check, Smartphone,
} from 'lucide-react';
import { toast } from 'sonner';
import { categories, menuItems, restaurant } from '@/data/mockData';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

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

function SectionTypeLabel({ type }: { type: string }) {
  const labels: Record<string, { icon: string; text: string; color: string }> = {
    'flash-deals': { icon: '⚡', text: 'Ofertas', color: 'bg-orange-500/15 text-orange-500' },
    'popular': { icon: '🏆', text: 'Populares', color: 'bg-amber-500/15 text-amber-600' },
    'custom-banner': { icon: '🎨', text: 'Banner', color: 'bg-violet-500/15 text-violet-500' },
    'category': { icon: '📂', text: 'Categoría', color: 'bg-blue-500/15 text-blue-500' },
  };
  const l = labels[type] || { icon: '?', text: type, color: 'bg-muted text-muted-foreground' };
  return <Badge variant="outline" className={`text-[10px] h-5 ${l.color} border-0`}>{l.icon} {l.text}</Badge>;
}

export default function AdminThemes() {
  const { layout, toggleSection, moveSection, updateSection, addBanner, removeSection } = useMenuLayout();
  const { activeTheme, setThemeId } = useMenuTheme();
  const [bannerDialogOpen, setBannerDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<MenuSection | null>(null);
  const [bannerForm, setBannerForm] = useState<BannerConfig>({
    title: '', subtitle: '', gradient: 'from-violet-600 to-fuchsia-500', icon: '✨', badge: '', imageUrl: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sortedSections = [...layout.sections].sort((a, b) => a.order - b.order);

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
    if (!bannerForm.title.trim()) {
      toast.error('El banner necesita un título');
      return;
    }
    if (editingSection) {
      updateSection(editingSection.id, {
        label: `🎁 ${bannerForm.title}`,
        config: { ...editingSection.config, banner: bannerForm },
      });
      toast.success('Banner actualizado');
    } else {
      addBanner(bannerForm);
      toast.success('Banner agregado');
    }
    setBannerDialogOpen(false);
  };

  const handleEditTitle = (section: MenuSection) => {
    if (section.type === 'popular' && section.config.title !== undefined) {
      const newTitle = prompt('Título de la sección:', section.config.title);
      if (newTitle !== null) {
        updateSection(section.id, { config: { ...section.config, title: newTitle }, label: `🏆 ${newTitle}` });
        toast.success('Título actualizado');
      }
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

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Editor de Menú</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Diseñá el menú que ven tus clientes: arrastrá secciones, creá banners y cambiá el tema visual
          </p>
        </div>
        <Button onClick={openNewBanner} className="gradient-primary gap-2 shadow-lg">
          <Plus className="h-4 w-4" /> Nuevo banner
        </Button>
      </div>

      <Tabs defaultValue="layout" className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="layout" className="gap-1.5"><LayoutList className="h-3.5 w-3.5" /> Secciones</TabsTrigger>
          <TabsTrigger value="theme" className="gap-1.5"><Palette className="h-3.5 w-3.5" /> Tema visual</TabsTrigger>
        </TabsList>

        {/* ─── SECCIONES TAB ─── */}
        <TabsContent value="layout" className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl border border-border">
            <Smartphone className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Las secciones se muestran en este orden en el menú del cliente. Usá las flechas para reordenar.
            </span>
          </div>

          <div className="space-y-1.5">
            {sortedSections.map((section, idx) => (
              <div
                key={section.id}
                className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                  section.enabled ? 'bg-card border-border shadow-sm' : 'bg-muted/30 border-border/50 opacity-60'
                }`}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground/40 flex-shrink-0 cursor-grab" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-semibold text-sm truncate">{section.label}</span>
                    <SectionTypeLabel type={section.type} />
                    {!section.enabled && <Badge variant="outline" className="text-[10px] h-5 text-destructive border-destructive/30">Oculto</Badge>}
                  </div>
                  {section.type === 'custom-banner' && section.config.banner && (
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{section.config.banner.subtitle || 'Sin subtítulo'}</p>
                  )}
                  {section.type === 'category' && section.config.categoryId && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {menuItems.filter(i => i.categoryId === section.config.categoryId && i.available).length} productos disponibles
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Edit button for banners and popular */}
                  {(section.type === 'custom-banner') && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditBanner(section)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {section.type === 'popular' && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditTitle(section)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  )}

                  {/* Move buttons */}
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7"
                    disabled={idx === 0}
                    onClick={() => moveSection(section.id, 'up')}
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7"
                    disabled={idx === sortedSections.length - 1}
                    onClick={() => moveSection(section.id, 'down')}
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>

                  {/* Delete (only for custom banners) */}
                  {section.type === 'custom-banner' && (
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => { removeSection(section.id); toast.success('Sección eliminada'); }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}

                  {/* Toggle visibility */}
                  <Switch
                    checked={section.enabled}
                    onCheckedChange={() => toggleSection(section.id)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Quick add section */}
          <div className="border-2 border-dashed border-border rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">¿Querés agregar más contenido?</p>
            <Button variant="outline" size="sm" onClick={openNewBanner} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Crear banner personalizado
            </Button>
          </div>
        </TabsContent>

        {/* ─── TEMA VISUAL TAB ─── */}
        <TabsContent value="theme">
          <div className="flex items-center gap-2 mb-4 p-3 bg-card rounded-xl border border-border">
            <Smartphone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Tema activo:</span>
            <Badge className="gradient-primary text-white border-0">{activeTheme.name}</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {menuThemes.map(theme => (
              <button
                key={theme.id}
                onClick={() => { setThemeId(theme.id); toast.success(`Tema "${theme.name}" aplicado`); }}
                className={`text-left p-4 rounded-2xl border-2 transition-all ${
                  activeTheme.id === theme.id ? 'border-primary shadow-lg' : 'border-border hover:border-primary/30'
                }`}
              >
                {/* Mini color preview */}
                <div className="flex gap-1 mb-3">
                  <div className={`h-8 w-8 rounded-lg ${theme.colors.headerBg}`} />
                  <div className={`h-8 w-8 rounded-lg ${theme.colors.pageBg} border border-border`} />
                  <div className={`h-8 w-8 rounded-lg ${theme.colors.cardBg} border border-border`} />
                  <div className={`h-8 flex-1 rounded-lg bg-gradient-to-r ${theme.colors.accentGradient}`} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading font-bold text-sm">{theme.name}</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{theme.description}</p>
                  </div>
                  {activeTheme.id === theme.id && (
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 ml-2">
                      <Check className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Banner Create/Edit Dialog */}
      <Dialog open={bannerDialogOpen} onOpenChange={setBannerDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSection ? 'Editar banner' : 'Nuevo banner'}</DialogTitle>
            <DialogDescription>
              Creá un banner promocional para mostrar en el menú de tus clientes
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Preview */}
            <div className={`bg-gradient-to-r ${bannerForm.gradient} rounded-2xl p-4 flex items-center gap-3 relative overflow-hidden`}>
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full" />
              {bannerForm.imageUrl ? (
                <img src={bannerForm.imageUrl} alt="" className="h-12 w-12 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="h-12 w-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
                  {bannerForm.icon}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-heading font-bold text-sm truncate">{bannerForm.title || 'Título del banner'}</p>
                <p className="text-white/70 text-[11px] truncate">{bannerForm.subtitle || 'Subtítulo opcional'}</p>
              </div>
              {bannerForm.badge && (
                <div className="bg-white/20 rounded-lg px-2.5 py-1 flex-shrink-0">
                  <p className="text-white text-[10px] font-bold">{bannerForm.badge}</p>
                </div>
              )}
            </div>

            <div>
              <Label>Título *</Label>
              <Input
                placeholder="Ej: ¡2x1 en bebidas!"
                value={bannerForm.title}
                onChange={e => setBannerForm(f => ({ ...f, title: e.target.value }))}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Subtítulo</Label>
              <Input
                placeholder="Ej: De lunes a jueves"
                value={bannerForm.subtitle}
                onChange={e => setBannerForm(f => ({ ...f, subtitle: e.target.value }))}
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Etiqueta</Label>
                <Input
                  placeholder="Ej: HOY, NUEVO, -20%"
                  value={bannerForm.badge || ''}
                  onChange={e => setBannerForm(f => ({ ...f, badge: e.target.value }))}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Color</Label>
                <Select value={bannerForm.gradient} onValueChange={v => setBannerForm(f => ({ ...f, gradient: v }))}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {gradientOptions.map(g => (
                      <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Icono</Label>
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                {iconOptions.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setBannerForm(f => ({ ...f, icon }))}
                    className={`h-9 w-9 rounded-lg flex items-center justify-center text-lg transition-all ${
                      bannerForm.icon === icon ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted hover:bg-accent'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Imagen (opcional)</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  placeholder="URL de imagen o subí un archivo"
                  value={bannerForm.imageUrl || ''}
                  onChange={e => setBannerForm(f => ({ ...f, imageUrl: e.target.value }))}
                  className="flex-1"
                />
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <ImageIcon className="h-3.5 w-3.5" />
                </Button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>
              {bannerForm.imageUrl && (
                <button onClick={() => setBannerForm(f => ({ ...f, imageUrl: '' }))} className="text-xs text-destructive mt-1">
                  Quitar imagen
                </button>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setBannerDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveBanner} className="gradient-primary">
              {editingSection ? 'Guardar cambios' : 'Agregar banner'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
