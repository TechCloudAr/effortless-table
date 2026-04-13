import { useState, useRef } from 'react';
import { useMenu } from '@/hooks/useMenu';
import { useAuth } from '@/contexts/AuthContext';
import { useBranch } from '@/contexts/BranchContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, ImagePlus, Search, GripVertical, X, Upload, Link } from 'lucide-react';
import type { MenuItem } from '@/types/restaurant';
import { toast } from 'sonner';
import MenuExcelImport from '@/components/admin/MenuExcelImport';

type FormData = {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  images: string[];
  tags: string;
  available: boolean;
  popular: boolean;
};

const emptyForm: FormData = {
  name: '', description: '', price: '', categoryId: '', images: [], tags: '', available: true, popular: false,
};

export default function AdminMenuPage() {
  const { restaurantId } = useAuth();
  const { branches, activeBranchId, setActiveBranchId } = useBranch();
  const { categories, menuItems, branchOverrides, loading, refetch } = useMenu(restaurantId ?? undefined, activeBranchId);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [urlInput, setUrlInput] = useState('');
  const [imageMode, setImageMode] = useState<'file' | 'url'>('file');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isBranchView = !!activeBranchId;

  const toggleAvailability = async (id: string, current: boolean) => {
    if (isBranchView) {
      // Upsert branch override
      const { error } = await supabase.from('branch_menu_overrides').upsert({
        branch_id: activeBranchId!,
        menu_item_id: id,
        available_override: !current,
      }, { onConflict: 'branch_id,menu_item_id' });
      if (error) { toast.error('Error al cambiar disponibilidad en sucursal'); return; }
    } else {
      const { error } = await supabase.from('menu_items').update({ available: !current }).eq('id', id);
      if (error) { toast.error('Error al cambiar disponibilidad'); return; }
    }
    refetch();
  };

  const openCreate = () => { setEditingItem(null); setForm(emptyForm); setUrlInput(''); setDialogOpen(true); };

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setForm({
      name: item.name, description: item.description, price: String(item.price),
      categoryId: item.categoryId, images: item.images?.length ? item.images : [item.image],
      tags: item.tags.join(', '), available: item.available, popular: item.popular ?? false,
    });
    setUrlInput('');
    setDialogOpen(true);
  };

  const openDelete = (item: MenuItem) => { setDeletingItem(item); setDeleteDialogOpen(true); };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) { toast.error(`"${file.name}" no es una imagen válida`); return; }
      if (file.size > 5 * 1024 * 1024) { toast.error(`"${file.name}" excede 5MB`); return; }
      const reader = new FileReader();
      reader.onload = () => setForm(prev => ({ ...prev, images: [...prev.images, reader.result as string] }));
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addUrlImage = () => {
    const url = urlInput.trim();
    if (!url) return;
    try { new URL(url); setForm(prev => ({ ...prev, images: [...prev.images, url] })); setUrlInput(''); }
    catch { toast.error('URL inválida'); }
  };

  const removeImage = (index: number) => setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.price || !form.categoryId) { toast.error('Completa nombre, precio y categoría'); return; }
    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) { toast.error('El precio debe ser un número válido mayor a 0'); return; }

    setSaving(true);
    const mainImage = form.images[0] || '/placeholder.svg';
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);

    if (editingItem) {
      const { error } = await supabase.from('menu_items').update({
        name: form.name.trim(), description: form.description.trim(), price,
        category_id: form.categoryId, image_url: mainImage, tags,
        available: form.available, popular: form.popular,
      }).eq('id', editingItem.id);
      if (error) { toast.error('Error al actualizar'); setSaving(false); return; }
      toast.success(`"${form.name.trim()}" actualizado`);
    } else {
      const { error } = await supabase.from('menu_items').insert({
        name: form.name.trim(), description: form.description.trim(), price,
        category_id: form.categoryId, image_url: mainImage, tags,
        available: form.available, popular: form.popular,
      });
      if (error) { toast.error('Error al crear producto'); setSaving(false); return; }
      toast.success(`"${form.name.trim()}" agregado al menú`);
    }

    setSaving(false);
    setDialogOpen(false);
    refetch();
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    const { error } = await supabase.from('menu_items').delete().eq('id', deletingItem.id);
    if (error) { toast.error('Error al eliminar'); return; }
    toast.success(`"${deletingItem.name}" eliminado`);
    setDeleteDialogOpen(false);
    setDeletingItem(null);
    refetch();
  };

  const filtered = menuItems
    .filter(i => activeCategory === 'all' || i.categoryId === activeCategory)
    .filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()));

  const availableCount = menuItems.filter(i => i.available).length;
  const unavailableCount = menuItems.length - availableCount;

  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando menú...</div>;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Branch selector */}
      {branches.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
          <button onClick={() => setActiveBranchId(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${!activeBranchId ? 'gradient-primary text-primary-foreground border-transparent' : 'bg-card text-muted-foreground border-border'}`}>
            🏠 Menú base
          </button>
          {branches.map(b => (
            <button key={b.id} onClick={() => setActiveBranchId(b.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${activeBranchId === b.id ? 'gradient-primary text-primary-foreground border-transparent' : 'bg-card text-muted-foreground border-border'}`}>
              📍 {b.name}
            </button>
          ))}
        </div>
      )}

      {isBranchView && (
        <div className="bg-accent/50 border border-border rounded-lg px-3 py-2 mb-4 text-xs text-muted-foreground">
          📍 Viendo menú de <strong className="text-foreground">{branches.find(b => b.id === activeBranchId)?.name}</strong> — los cambios de disponibilidad y precio solo aplican a esta sucursal.
        </div>
      )}

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Gestión del Menú</h1>
          <div className="flex gap-3 mt-1">
            <span className="text-sm text-muted-foreground">{menuItems.length} productos</span>
            <span className="text-sm text-green-500 font-medium">{availableCount} activos</span>
            {unavailableCount > 0 && <span className="text-sm text-destructive font-medium">{unavailableCount} inactivos</span>}
          </div>
        </div>
        {!isBranchView && (
          <Button onClick={openCreate} className="gradient-primary gap-2 shadow-lg">
            <MenuExcelImport onSuccess={refetch} />
            <Plus className="h-4 w-4" /> Nuevo producto
          </Button>
        )}
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar productos..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
        <button onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${activeCategory === 'all' ? 'gradient-primary text-primary-foreground border-transparent' : 'bg-card text-muted-foreground border-border'}`}>
          Todos ({menuItems.length})
        </button>
        {categories.map(cat => {
          const count = menuItems.filter(i => i.categoryId === cat.id).length;
          return (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${activeCategory === cat.id ? 'gradient-primary text-primary-foreground border-transparent' : 'bg-card text-muted-foreground border-border'}`}>
              {cat.icon} {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg mb-2">No se encontraron productos</p>
          <p className="text-sm">Prueba con otro filtro o agrega un nuevo producto</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => {
            const imgCount = item.images?.length || 1;
            return (
              <div key={item.id}
                className={`bg-card rounded-xl p-3 shadow-card flex items-center gap-3 group transition-all hover:shadow-md border ${!item.available ? 'opacity-60 border-border' : 'border-transparent'}`}>
                <GripVertical className="h-4 w-4 text-muted-foreground/40 flex-shrink-0 hidden md:block" />
                <div className="relative flex-shrink-0">
                  <img src={item.image} alt={item.name} className="h-14 w-14 rounded-lg object-cover" />
                  {imgCount > 1 && <span className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">{imgCount}</span>}
                  {!item.available && <div className="absolute inset-0 bg-background/60 rounded-lg flex items-center justify-center"><span className="text-[9px] font-bold text-destructive uppercase">Pausado</span></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-semibold text-sm truncate">{item.name}</h3>
                    {item.popular && <Badge variant="secondary" className="text-[10px] h-4 bg-orange-500/20 text-orange-400">⭐ Popular</Badge>}
                    {item.tags.slice(0, 1).map(t => <Badge key={t} variant="outline" className="text-[10px] h-4">{t}</Badge>)}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                  <p className="text-xs font-semibold mt-0.5 text-primary">${item.price} • {categories.find(c => c.id === item.categoryId)?.name}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive" onClick={() => openDelete(item)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  <Switch checked={item.available} onCheckedChange={() => toggleAvailability(item.id, item.available)} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
            <DialogDescription>{editingItem ? 'Modifica los datos del producto' : 'Completa los datos para agregar un nuevo producto al menú'}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label>Imágenes</Label>
              {form.images.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="relative group/img">
                      <img src={img} alt={`Foto ${idx + 1}`} className={`h-20 w-20 rounded-xl object-cover border-2 transition-all ${idx === 0 ? 'border-primary' : 'border-border'}`} />
                      {idx === 0 && <span className="absolute -top-1.5 -left-1.5 bg-primary text-primary-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-full">Principal</span>}
                      <button onClick={() => removeImage(idx)} className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full h-5 w-5 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-1 mt-3 bg-muted rounded-lg p-0.5">
                <button onClick={() => setImageMode('file')} className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${imageMode === 'file' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}><Upload className="h-3.5 w-3.5" /> Subir archivo</button>
                <button onClick={() => setImageMode('url')} className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${imageMode === 'url' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}><Link className="h-3.5 w-3.5" /> Pegar URL</button>
              </div>
              {imageMode === 'file' ? (
                <div onClick={() => fileInputRef.current?.click()} className="mt-2 border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all">
                  <ImagePlus className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">Click para seleccionar imágenes</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">JPG, PNG, WebP • Máx 5MB</p>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
                </div>
              ) : (
                <div className="mt-2 flex gap-2">
                  <Input placeholder="https://ejemplo.com/foto.jpg" value={urlInput} onChange={e => setUrlInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addUrlImage()} className="flex-1" />
                  <Button variant="outline" size="sm" onClick={addUrlImage} disabled={!urlInput.trim()}>Agregar</Button>
                </div>
              )}
              {form.images.length > 0 && <p className="text-[11px] text-muted-foreground mt-1.5">{form.images.length} imagen{form.images.length !== 1 ? 'es' : ''} • La primera será la imagen principal</p>}
            </div>

            <div><Label>Nombre *</Label><Input placeholder="Ej: Burger Clásica" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1.5" /></div>
            <div><Label>Descripción</Label><Textarea placeholder="Breve descripción del producto..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-1.5 min-h-[60px]" /></div>

            <div className="grid grid-cols-2 gap-3">
              <div><Label>Precio *</Label><Input type="number" step="0.01" min="0" placeholder="0.00" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="mt-1.5" /></div>
              <div>
                <Label>Categoría *</Label>
                <Select value={form.categoryId} onValueChange={v => setForm({ ...form, categoryId: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Etiquetas</Label>
              <Input placeholder="Ej: más vendido, nuevo, picante" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="mt-1.5" />
              <p className="text-[11px] text-muted-foreground mt-1">Separar con comas</p>
            </div>

            <div className="flex items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2"><Switch checked={form.available} onCheckedChange={v => setForm({ ...form, available: v })} /><Label className="text-sm cursor-pointer">Disponible</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.popular} onCheckedChange={v => setForm({ ...form, popular: v })} /><Label className="text-sm cursor-pointer">⭐ Popular</Label></div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="gradient-primary">{saving ? 'Guardando...' : editingItem ? 'Guardar cambios' : 'Agregar producto'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar "{deletingItem?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer. El producto será eliminado permanentemente del menú.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
}
