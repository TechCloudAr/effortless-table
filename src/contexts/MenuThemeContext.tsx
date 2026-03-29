import { createContext, useContext, useState, type ReactNode } from 'react';

export type MenuThemeId = 'fuego' | 'elegante' | 'fresco';

export interface MenuThemeConfig {
  id: MenuThemeId;
  name: string;
  description: string;
  preview: string; // emoji/icon preview
  colors: {
    headerBg: string;
    headerText: string;
    headerAccent: string;
    pageBg: string;
    cardBg: string;
    cardBorder: string;
    textPrimary: string;
    textSecondary: string;
    priceColor: string;
    accentGradient: string;
    badgeBg: string;
    badgeText: string;
    categoryActiveBg: string;
    categoryActiveText: string;
    categoryBg: string;
    categoryText: string;
  };
  style: {
    cardRadius: string;
    imageRadius: string;
    fontWeight: 'bold' | 'semibold' | 'medium';
    showFlashDeals: boolean;
    showPromoBanner: boolean;
    heroOverlay: string;
  };
}

export const menuThemes: MenuThemeConfig[] = [
  {
    id: 'fuego',
    name: 'Fuego 🔥',
    description: 'Agresivo y vibrante. Ideal para comida rápida, tacos, burgers. Estilo marketplace.',
    preview: '🔥',
    colors: {
      headerBg: 'bg-gradient-to-br from-[hsl(24,95%,50%)] via-[hsl(24,95%,45%)] to-[hsl(20,90%,45%)]',
      headerText: 'text-white',
      headerAccent: 'text-white/60',
      pageBg: 'bg-background',
      cardBg: 'bg-card',
      cardBorder: 'border-transparent',
      textPrimary: 'text-foreground',
      textSecondary: 'text-muted-foreground',
      priceColor: 'text-primary',
      accentGradient: 'from-red-500 to-orange-500',
      badgeBg: 'bg-gradient-to-r from-red-500 to-orange-500',
      badgeText: 'text-white',
      categoryActiveBg: 'gradient-primary',
      categoryActiveText: 'text-primary-foreground',
      categoryBg: 'bg-muted',
      categoryText: 'text-foreground',
    },
    style: {
      cardRadius: 'rounded-2xl',
      imageRadius: 'rounded-xl',
      fontWeight: 'bold',
      showFlashDeals: true,
      showPromoBanner: true,
      heroOverlay: 'from-black/70 via-black/20 to-transparent',
    },
  },
  {
    id: 'elegante',
    name: 'Elegante ✨',
    description: 'Oscuro y sofisticado. Perfecto para restaurantes gourmet, sushi, vinos.',
    preview: '✨',
    colors: {
      headerBg: 'bg-gradient-to-br from-[hsl(220,20%,12%)] via-[hsl(220,15%,16%)] to-[hsl(240,10%,18%)]',
      headerText: 'text-white',
      headerAccent: 'text-amber-300/70',
      pageBg: 'bg-[hsl(220,15%,8%)]',
      cardBg: 'bg-[hsl(220,15%,14%)]',
      cardBorder: 'border-white/5',
      textPrimary: 'text-white',
      textSecondary: 'text-white/50',
      priceColor: 'text-amber-400',
      accentGradient: 'from-amber-500 to-yellow-400',
      badgeBg: 'bg-amber-500/20',
      badgeText: 'text-amber-300',
      categoryActiveBg: 'bg-amber-500/20',
      categoryActiveText: 'text-amber-300',
      categoryBg: 'bg-white/5',
      categoryText: 'text-white/60',
    },
    style: {
      cardRadius: 'rounded-xl',
      imageRadius: 'rounded-lg',
      fontWeight: 'semibold',
      showFlashDeals: false,
      showPromoBanner: false,
      heroOverlay: 'from-black/80 via-black/40 to-transparent',
    },
  },
  {
    id: 'fresco',
    name: 'Fresco 🌿',
    description: 'Limpio y natural. Ideal para comida saludable, cafeterías, brunch.',
    preview: '🌿',
    colors: {
      headerBg: 'bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500',
      headerText: 'text-white',
      headerAccent: 'text-emerald-100/70',
      pageBg: 'bg-[hsl(140,20%,97%)]',
      cardBg: 'bg-white',
      cardBorder: 'border-emerald-100',
      textPrimary: 'text-[hsl(160,20%,15%)]',
      textSecondary: 'text-[hsl(160,10%,45%)]',
      priceColor: 'text-emerald-600',
      accentGradient: 'from-emerald-500 to-teal-400',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-700',
      categoryActiveBg: 'bg-emerald-500',
      categoryActiveText: 'text-white',
      categoryBg: 'bg-emerald-50',
      categoryText: 'text-emerald-700',
    },
    style: {
      cardRadius: 'rounded-2xl',
      imageRadius: 'rounded-xl',
      fontWeight: 'medium',
      showFlashDeals: false,
      showPromoBanner: true,
      heroOverlay: 'from-black/50 via-transparent to-transparent',
    },
  },
];

interface MenuThemeContextType {
  activeTheme: MenuThemeConfig;
  setThemeId: (id: MenuThemeId) => void;
}

const MenuThemeContext = createContext<MenuThemeContextType | null>(null);

export function MenuThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<MenuThemeId>(() => {
    return (localStorage.getItem('menu-theme') as MenuThemeId) || 'fuego';
  });

  const activeTheme = menuThemes.find(t => t.id === themeId) || menuThemes[0];

  const handleSetTheme = (id: MenuThemeId) => {
    setThemeId(id);
    localStorage.setItem('menu-theme', id);
  };

  return (
    <MenuThemeContext.Provider value={{ activeTheme, setThemeId: handleSetTheme }}>
      {children}
    </MenuThemeContext.Provider>
  );
}

export function useMenuTheme() {
  const ctx = useContext(MenuThemeContext);
  if (!ctx) throw new Error('useMenuTheme must be inside MenuThemeProvider');
  return ctx;
}
