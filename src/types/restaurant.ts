export interface Restaurant {
  id: string;
  name: string;
  logo?: string;
  description: string;
  currency: string;
  taxRate: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  order: number;
}

export interface MenuItemOptionGroup {
  id: string;
  name: string;
  required: boolean;
  maxSelections: number;
  options: MenuItemOption[];
}

export interface MenuItemOption {
  id: string;
  name: string;
  price: number;
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  removable: boolean;
  defaultIncluded: boolean;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  images?: string[];
  tags: string[];
  available: boolean;
  optionGroups?: MenuItemOptionGroup[];
  popular?: boolean;
}

export interface CartItem {
  cartId: string;
  menuItem: MenuItem;
  quantity: number;
  selectedOptions: Record<string, string[]>;
  notes: string;
  unitPrice: number;
}

export type OrderStatus = 'pending_payment' | 'received' | 'paid' | 'preparing' | 'ready' | 'delivered';

export interface Order {
  id: string;
  tableNumber: number;
  items: CartItem[];
  status: OrderStatus;
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
  estimatedMinutes: number;
}

export interface TableInfo {
  id: string;
  number: number;
  status: 'available' | 'occupied' | 'reserved';
  currentOrderId?: string;
  capacity: number;
}
