import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { CartItem, MenuItem } from '@/types/restaurant';

interface CartContextType {
  items: CartItem[];
  addItem: (menuItem: MenuItem, quantity: number, selectedOptions: Record<string, string[]>, notes: string) => void;
  removeItem: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  tax: number;
  total: number;
  tableNumber: number;
  setTableNumber: (n: number) => void;
  taxRate: number;
  setTaxRate: (r: number) => void;
  restaurantId: string | null;
  setRestaurantId: (id: string) => void;
  branchId: string | null;
  setBranchId: (id: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function calculateItemPrice(menuItem: MenuItem, selectedOptions: Record<string, string[]>): number {
  let price = menuItem.price;
  if (menuItem.optionGroups) {
    for (const group of menuItem.optionGroups) {
      const selected = selectedOptions[group.id] || [];
      for (const optId of selected) {
        const opt = group.options.find(o => o.id === optId);
        if (opt) price += opt.price;
      }
    }
  }
  return price;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumber] = useState(5);
  const [taxRate, setTaxRate] = useState(0.16);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [branchId, setBranchId] = useState<string | null>(null);

  const addItem = useCallback((menuItem: MenuItem, quantity: number, selectedOptions: Record<string, string[]>, notes: string) => {
    const unitPrice = calculateItemPrice(menuItem, selectedOptions);
    const cartItem: CartItem = {
      cartId: `${menuItem.id}-${Date.now()}`,
      menuItem,
      quantity,
      selectedOptions,
      notes,
      unitPrice,
    };
    setItems(prev => [...prev, cartItem]);
  }, []);

  const removeItem = useCallback((cartId: string) => {
    setItems(prev => prev.filter(i => i.cartId !== cartId));
  }, []);

  const updateQuantity = useCallback((cartId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.cartId !== cartId));
    } else {
      setItems(prev => prev.map(i => i.cartId === cartId ? { ...i, quantity } : i));
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal, tax, total, tableNumber, setTableNumber, taxRate, setTaxRate, restaurantId, setRestaurantId, branchId, setBranchId }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
