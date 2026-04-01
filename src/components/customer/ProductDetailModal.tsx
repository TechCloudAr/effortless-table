import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, X } from 'lucide-react';
import type { MenuItem, Ingredient } from '@/types/restaurant';
import { useCart } from '@/contexts/CartContext';

interface ProductDetailModalProps {
  item: MenuItem | null;
  open: boolean;
  onClose: () => void;
  currency?: string;
  ingredients?: Ingredient[];
}

export default function ProductDetailModal({ item, open, onClose, currency = '$', ingredients = [] }: ProductDetailModalProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  if (!item) return null;

  const removableIngredients = ingredients.filter(i => i.removable && i.defaultIncluded);

  const toggleOption = (groupId: string, optionId: string, maxSelections: number) => {
    setSelectedOptions(prev => {
      const current = prev[groupId] || [];
      if (current.includes(optionId)) {
        return { ...prev, [groupId]: current.filter(id => id !== optionId) };
      }
      if (maxSelections === 1) {
        return { ...prev, [groupId]: [optionId] };
      }
      if (current.length >= maxSelections) return prev;
      return { ...prev, [groupId]: [...current, optionId] };
    });
  };

  const toggleIngredient = (ingredientId: string) => {
    setRemovedIngredients(prev =>
      prev.includes(ingredientId)
        ? prev.filter(id => id !== ingredientId)
        : [...prev, ingredientId]
    );
  };

  let unitPrice = item.price;
  if (item.optionGroups) {
    for (const group of item.optionGroups) {
      for (const optId of (selectedOptions[group.id] || [])) {
        const opt = group.options.find(o => o.id === optId);
        if (opt) unitPrice += opt.price;
      }
    }
  }

  const handleAdd = () => {
    // Include removed ingredients info in notes
    const removedNames = removedIngredients
      .map(id => ingredients.find(i => i.id === id)?.name)
      .filter(Boolean);
    const fullNotes = [
      ...(removedNames.length > 0 ? [`Sin: ${removedNames.join(', ')}`] : []),
      ...(notes ? [notes] : []),
    ].join(' | ');

    addItem(item, quantity, selectedOptions, fullNotes);
    onClose();
    setQuantity(1);
    setSelectedOptions({});
    setRemovedIngredients([]);
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md p-0 gap-0 max-h-[90vh] overflow-y-auto">
        <img src={item.image} alt={item.name} className="w-full h-48 object-cover rounded-t-lg" />
        <div className="p-5 space-y-4">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="font-heading text-xl">{item.name}</DialogTitle>
            <p className="text-sm text-muted-foreground">{item.description}</p>
            <div className="flex gap-1.5 pt-1">
              {item.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          </DialogHeader>

          {/* Option groups */}
          {item.optionGroups?.map(group => (
            <div key={group.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-heading font-semibold text-sm">{group.name}</span>
                {group.required && (
                  <Badge variant="outline" className="text-[10px] h-4 border-primary/30 text-primary">Requerido</Badge>
                )}
              </div>
              <div className="grid gap-1.5">
                {group.options.map(opt => {
                  const isSelected = (selectedOptions[group.id] || []).includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleOption(group.id, opt.id, group.maxSelections)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-md border text-sm transition-all ${
                        isSelected
                          ? 'border-primary bg-accent text-accent-foreground'
                          : 'border-border bg-card hover:border-primary/40'
                      }`}
                    >
                      <span>{opt.name}</span>
                      {opt.price > 0 && (
                        <span className="text-muted-foreground">+{currency}{opt.price}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Removable ingredients */}
          {removableIngredients.length > 0 && (
            <div className="space-y-2">
              <span className="font-heading font-semibold text-sm">Personalizar ingredientes</span>
              <div className="flex flex-wrap gap-2">
                {removableIngredients.map(ing => {
                  const isRemoved = removedIngredients.includes(ing.id);
                  return (
                    <button
                      key={ing.id}
                      onClick={() => toggleIngredient(ing.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                        isRemoved
                          ? 'bg-destructive/10 text-destructive line-through border border-destructive/20'
                          : 'bg-accent text-accent-foreground border border-border'
                      }`}
                    >
                      {isRemoved && <X className="h-3 w-3" />}
                      <span>{ing.name}</span>
                    </button>
                  );
                })}
              </div>
              {removedIngredients.length > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  Se quitarán: {removedIngredients.map(id => ingredients.find(i => i.id === id)?.name).filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <span className="font-heading font-semibold text-sm">Notas especiales</span>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Sin cebolla, extra salsa..."
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none h-16"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-3">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="font-heading font-bold text-lg w-6 text-center">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <Button onClick={handleAdd} className="gradient-primary font-heading font-semibold px-6">
              Agregar {currency}{(unitPrice * quantity).toFixed(0)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
