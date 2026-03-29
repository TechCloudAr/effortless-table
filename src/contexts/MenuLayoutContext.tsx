import { createContext, useContext, useState, type ReactNode } from 'react';

export type SectionType = 
  | 'flash-deals'
  | 'popular'
  | 'custom-banner'
  | 'category';

export interface BannerConfig {
  title: string;
  subtitle: string;
  gradient: string;
  icon: string;
  badge?: string;
  imageUrl?: string;
}

export type DisplayMode = 'vertical' | 'horizontal' | 'grid';
export type CardStyle = 'compact' | 'hero-first' | 'cards-only' | 'image-grid';

export interface MenuSection {
  id: string;
  type: SectionType;
  enabled: boolean;
  order: number;
  label: string; // admin-facing label
  displayMode: DisplayMode;
  cardStyle: CardStyle;
  config: {
    // For custom-banner
    banner?: BannerConfig;
    // For category
    categoryId?: string;
    // For category – custom product order
    productOrder?: string[];
    // For popular
    title?: string;
  };
}

export interface MenuLayoutConfig {
  sections: MenuSection[];
  categoryOrder: string[]; // ordered category IDs
}

const defaultBanners: BannerConfig[] = [
  {
    title: '¡2x1 en bebidas!',
    subtitle: 'De lunes a jueves, de 4 a 7pm',
    gradient: 'from-violet-600 to-fuchsia-500',
    icon: '✨',
    badge: 'HOY',
  },
];

export const defaultLayout: MenuLayoutConfig = {
  sections: [
    { id: 'flash-deals', type: 'flash-deals', enabled: true, order: 0, label: '⚡ Ofertas Relámpago', displayMode: 'horizontal', cardStyle: 'compact', config: {} },
    { id: 'popular', type: 'popular', enabled: true, order: 1, label: '🏆 Los más pedidos', displayMode: 'horizontal', cardStyle: 'cards-only', config: { title: 'Los más pedidos' } },
    { id: 'banner-1', type: 'custom-banner', enabled: true, order: 2, label: '🎁 Banner Promo', displayMode: 'horizontal', cardStyle: 'compact', config: { banner: defaultBanners[0] } },
    { id: 'cat-entradas', type: 'category', enabled: true, order: 3, label: '🥑 Entradas', displayMode: 'vertical', cardStyle: 'hero-first', config: { categoryId: 'entradas' } },
    { id: 'cat-principales', type: 'category', enabled: true, order: 4, label: '🔥 Principales', displayMode: 'vertical', cardStyle: 'hero-first', config: { categoryId: 'principales' } },
    { id: 'cat-bebidas', type: 'category', enabled: true, order: 5, label: '🥤 Bebidas', displayMode: 'horizontal', cardStyle: 'cards-only', config: { categoryId: 'bebidas' } },
    { id: 'cat-postres', type: 'category', enabled: true, order: 6, label: '🍰 Postres', displayMode: 'vertical', cardStyle: 'compact', config: { categoryId: 'postres' } },
    { id: 'cat-combos', type: 'category', enabled: true, order: 7, label: '🎯 Combos', displayMode: 'grid', cardStyle: 'image-grid', config: { categoryId: 'combos' } },
  ],
  categoryOrder: ['entradas', 'principales', 'bebidas', 'postres', 'combos'],
};

const STORAGE_KEY = 'menu-layout';

function loadLayout(): MenuLayoutConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultLayout;
}

interface MenuLayoutContextType {
  layout: MenuLayoutConfig;
  updateLayout: (layout: MenuLayoutConfig) => void;
  toggleSection: (id: string) => void;
  moveSection: (id: string, direction: 'up' | 'down') => void;
  updateSection: (id: string, updates: Partial<MenuSection>) => void;
  addBanner: (banner: BannerConfig) => void;
  removeSection: (id: string) => void;
}

const MenuLayoutContext = createContext<MenuLayoutContextType | null>(null);

export function MenuLayoutProvider({ children }: { children: ReactNode }) {
  const [layout, setLayout] = useState<MenuLayoutConfig>(loadLayout);

  const save = (l: MenuLayoutConfig) => {
    setLayout(l);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(l));
  };

  const toggleSection = (id: string) => {
    save({
      ...layout,
      sections: layout.sections.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s),
    });
  };

  const moveSection = (id: string, direction: 'up' | 'down') => {
    const sorted = [...layout.sections].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex(s => s.id === id);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const tempOrder = sorted[idx].order;
    sorted[idx] = { ...sorted[idx], order: sorted[swapIdx].order };
    sorted[swapIdx] = { ...sorted[swapIdx], order: tempOrder };
    save({ ...layout, sections: sorted });
  };

  const updateSection = (id: string, updates: Partial<MenuSection>) => {
    save({
      ...layout,
      sections: layout.sections.map(s => s.id === id ? { ...s, ...updates } : s),
    });
  };

  const addBanner = (banner: BannerConfig) => {
    const maxOrder = Math.max(...layout.sections.map(s => s.order), -1);
    const newSection: MenuSection = {
      id: `banner-${Date.now()}`,
      type: 'custom-banner',
      enabled: true,
      order: maxOrder + 1,
      label: `🎁 ${banner.title}`,
      config: { banner },
    };
    save({ ...layout, sections: [...layout.sections, newSection] });
  };

  const removeSection = (id: string) => {
    save({ ...layout, sections: layout.sections.filter(s => s.id !== id) });
  };

  return (
    <MenuLayoutContext.Provider value={{ layout, updateLayout: save, toggleSection, moveSection, updateSection, addBanner, removeSection }}>
      {children}
    </MenuLayoutContext.Provider>
  );
}

export function useMenuLayout() {
  const ctx = useContext(MenuLayoutContext);
  if (!ctx) throw new Error('useMenuLayout must be inside MenuLayoutProvider');
  return ctx;
}
