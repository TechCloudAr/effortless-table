import { useState } from 'react';
import { menuItems as initialMenuItems, categories } from '@/data/mockData';
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
import { Plus, Pencil, Trash2, ImagePlus, Search, GripVertical } from 'lucide-react';
import type { MenuItem } from '@/types/restaurant';
import { toast } from 'sonner';

type FormData = {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  image: string;
  tags: string;
  available: boolean;
  popular: boolean;
};

const emptyForm: FormData = {
  name: '',
  description: '',
  price: '',
  categoryId: '',
  image: '',
  tags: '',
  available: true,
  popular: false,
};

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>(initialMenuItems);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  const toggleAvailability = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, available: !i.available } : i));
  };

  const openCreate = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      description: item.description,
      price: String(item.price),
      categoryId: item.categoryId,
      image: item.image,
      tags: item.tags.join(', '),
      available: item.available,
      popular: item.popular ?? false,
    });
    setDialogOpen(true);
  };

  const openDelete = (item: MenuItem) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.price || !form.categoryId) {
      toast.error('Completa nombre, precio y categoría');
      return;
    }
    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) {
      toast.error('El precio debe ser un número válido mayor a 0');
      return;
    }

    if (editingItem) {
      setItems(prev => prev.map(i => i.id === editingItem.id ? {
        ...i,
        name: form.name.trim(),
        description: form.description.trim(),
        price,
        categoryId: form.categoryId,
        image: form.image || i.image,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        available: form.available,
        popular: form.popular,
      } : i));
      toast.success(`"${form.name.trim()}" actualizado`);
    } else {
      const newItem: MenuItem = {
        id: `item-${Date.now()}`,
        name: form.name.trim(),
        description: form.description.trim(),
        price,
        categoryId: form.categoryId,
        image: form.image || '/placeholder.svg',
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        available: form.available,
        popular: form.popular,
        optionGroups: [],
      };
      setItems(prev => [...prev, newItem]);
      toast.success(`"${form.name.trim()}" agregado al menú`);
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (deletingItem) {
      setItems(prev => prev.filter(i => i.id !== deletingItem.id));
      toast.success(`"${deletingItem.name}" eliminado`);
      setDeleteDialogOpen(false);
      setDeletingItem(null);
    }
  };

  const filtered = items
    .filter(i => activeCategory === 'all' || i.categoryId === activeCategory)
    .filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()));

  const availableCount = items.filter(i => i.available).length;
  const unavailableCount = items.length - availableCount;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Gestión del Menú</h1>
          <div className="flex gap-3 mt-1">
            <span className="text-sm text-muted-foreground">{items.length} productos</span>
            <span className="text-sm text-green-500 font-medium">{availableCount} activos</span>
            {unavailableCount > 0 && (
              <span className="text-sm text-destructive font-medium">{unavailableCount} inactivos</span>
            )}
          </div>
        </div>
        <Button onClick={openCreate} className="gradient-primary gap-2 shadow-lg">
          <Plus className="h-4 w-4" />
          Nuevo producto
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar productos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${
            activeCategory === 'all' ? 'gradient-primary text-primary-foreground border-transparent' : 'bg-card text-muted-foreground border-border'
          }`}
        >
          Todos ({items.length})
        </button>
        {categories.map(cat => {
          const count = items.filter(i => i.categoryId === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${
                activeCategory === cat.id ? 'gradient-primary text-primary-foreground border-transparent' : 'bg-card text-muted-foreground border-border'
              }`}
            >
              {cat.icon} {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Items list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg mb-2">No se encontraron productos</p>
          <p className="text-sm">Prueba con otro filtro o agrega un nuevo producto</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => (
            <div
              key={item.id}
              className={`bg-card rounded-xl p-3 shadow-card flex items-center gap-3 group transition-all hover:shadow-md border ${
                !item.available ? 'opacity-60 border-border' : 'border-transparent'
              }`}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground/40 flex-shrink-0 hidden md:block" />
              <div className="relative flex-shrink-0">
                <img src={item.image} alt={item.name} className="h-14 w-14 rounded-lg object-cover" />
                {!item.available && (
                  <div className="absolute inset-0 bg-background/60 rounded-lg flex items-center justify-center">
                    <span className="text-[9px] font-bold text-destructive uppercase">Pausado</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-semibold text-sm truncate">{item.name}</h3>
                  {item.popular && <Badge variant="secondary" className="text-[10px] h-4 bg-orange-500/20 text-orange-400">⭐ Popular</Badge>}
                  {item.tags.slice(0, 1).map(t => (
                    <Badge key={t} variant="outline" className="text-[10px] h-4">{t}</Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                <p className="text-xs font-semibold mt-0.5 text-primary">${item.price} • {categories.find(c => c.id === item.categoryId)?.name}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => openEdit(item)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                  onClick={() => openDelete(item)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
                <Switch checked={item.available} onCheckedChange={() => toggleAvailability(item.id)} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Modifica los datos del producto' : 'Completa los datos para agregar un nuevo producto al menú'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Image preview */}
            <div>
              <Label>Imagen</Label>
              <div className="mt-1.5 flex items-center gap-3">
                <div className="h-20 w-20 rounded-xl bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                  {form.image ? (
                    <img src={form.image} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <ImagePlus className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <Input
                  placeholder="URL de la imagen"
                  value={form.image}
                  onChange={e => setForm({ ...form, image: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label>Nombre *</Label>
              <Input
                placeholder="Ej: Burger Clásica"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Descripción</Label>
              <Textarea
                placeholder="Breve descripción del producto..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="mt-1.5 min-h-[60px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Precio *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Categoría *</Label>
                <Select value={form.categoryId} onValueChange={v => setForm({ ...form, categoryId: v })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Etiquetas</Label>
              <Input
                placeholder="Ej: más vendido, nuevo, picante"
                value={form.tags}
                onChange={e => setForm({ ...form, tags: e.target.value })}
                className="mt-1.5"
              />
              <p className="text-[11px] text-muted-foreground mt-1">Separar con comas</p>
            </div>

            <div className="flex items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.available}
                  onCheckedChange={v => setForm({ ...form, available: v })}
                />
                <Label className="text-sm cursor-pointer">Disponible</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.popular}
                  onCheckedChange={v => setForm({ ...form, popular: v })}
                />
                <Label className="text-sm cursor-pointer">⭐ Popular</Label>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="gradient-primary">
              {editingItem ? 'Guardar cambios' : 'Agregar producto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar "{deletingItem?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto será eliminado permanentemente del menú.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
