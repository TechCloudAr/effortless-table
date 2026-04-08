import { useState } from 'react';
import { useBranch, type Branch } from '@/contexts/BranchContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, MapPin, Pencil, Trash2, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminBranches() {
  const { branches, refetch } = useBranch();
  const { restaurantId } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditing(null);
    setName('');
    setAddress('');
    setDialogOpen(true);
  };

  const openEdit = (b: Branch) => {
    setEditing(b);
    setName(b.name);
    setAddress(b.address ?? '');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !restaurantId) return;
    setSaving(true);

    if (editing) {
      const { error } = await supabase.from('branches').update({ name: name.trim(), address: address.trim() || null }).eq('id', editing.id);
      if (error) toast.error('Error al actualizar');
      else toast.success('Sucursal actualizada');
    } else {
      const { error } = await supabase.from('branches').insert({ name: name.trim(), address: address.trim() || null, restaurant_id: restaurantId });
      if (error) toast.error('Error al crear');
      else toast.success('Sucursal creada');
    }

    setSaving(false);
    setDialogOpen(false);
    await refetch();
  };

  const handleDelete = async (b: Branch) => {
    if (branches.length <= 1) {
      toast.error('Debe tener al menos una sucursal');
      return;
    }
    if (!confirm(`¿Eliminar la sucursal "${b.name}"?`)) return;
    const { error } = await supabase.from('branches').delete().eq('id', b.id);
    if (error) toast.error('Error al eliminar');
    else { toast.success('Sucursal eliminada'); await refetch(); }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Sucursales</h1>
          <p className="text-muted-foreground text-sm">Gestioná las sucursales de tu restaurante</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Nueva sucursal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar sucursal' : 'Nueva sucursal'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Nombre</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Palermo, Centro" />
              </div>
              <div>
                <Label>Dirección (opcional)</Label>
                <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Av. Corrientes 1234" />
              </div>
              <Button onClick={handleSave} disabled={saving || !name.trim()} className="w-full">
                {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear sucursal'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {branches.map(b => (
          <Card key={b.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-medium">{b.name}</p>
                  {b.address && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {b.address}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => openEdit(b)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(b)} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
