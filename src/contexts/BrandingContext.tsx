import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface FontPair {
  id: string;
  name: string;
  heading: string;
  body: string;
  googleUrl: string;
  preview: string; // short text for preview
}

export const fontCatalog: FontPair[] = [
  {
    id: 'space-dm',
    name: 'Space + DM Sans',
    heading: "'Space Grotesk', sans-serif",
    body: "'DM Sans', sans-serif",
    googleUrl: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap',
    preview: 'Moderno y técnico',
  },
  {
    id: 'poppins-inter',
    name: 'Poppins + Inter',
    heading: "'Poppins', sans-serif",
    body: "'Inter', sans-serif",
    googleUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap',
    preview: 'Limpio y redondo',
  },
  {
    id: 'playfair-lato',
    name: 'Playfair + Lato',
    heading: "'Playfair Display', serif",
    body: "'Lato', sans-serif",
    googleUrl: 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Playfair+Display:wght@400;600;700&display=swap',
    preview: 'Elegante y clásico',
  },
  {
    id: 'montserrat-opensans',
    name: 'Montserrat + Open Sans',
    heading: "'Montserrat', sans-serif",
    body: "'Open Sans', sans-serif",
    googleUrl: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Open+Sans:wght@400;500;600;700&display=swap',
    preview: 'Profesional y versátil',
  },
  {
    id: 'bebas-roboto',
    name: 'Bebas Neue + Roboto',
    heading: "'Bebas Neue', sans-serif",
    body: "'Roboto', sans-serif",
    googleUrl: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Roboto:wght@400;500;700&display=swap',
    preview: 'Impactante y bold',
  },
  {
    id: 'raleway-nunito',
    name: 'Raleway + Nunito',
    heading: "'Raleway', sans-serif",
    body: "'Nunito', sans-serif",
    googleUrl: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&family=Raleway:wght@400;500;600;700&display=swap',
    preview: 'Suave y amigable',
  },
  {
    id: 'oswald-sourcesans',
    name: 'Oswald + Source Sans',
    heading: "'Oswald', sans-serif",
    body: "'Source Sans 3', sans-serif",
    googleUrl: 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600;700&display=swap',
    preview: 'Condensado y editorial',
  },
  {
    id: 'cormorant-mulish',
    name: 'Cormorant + Mulish',
    heading: "'Cormorant Garamond', serif",
    body: "'Mulish', sans-serif",
    googleUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Mulish:wght@400;500;600;700&display=swap',
    preview: 'Gourmet y refinado',
  },
  {
    id: 'archivo-rubik',
    name: 'Archivo Black + Rubik',
    heading: "'Archivo Black', sans-serif",
    body: "'Rubik', sans-serif",
    googleUrl: 'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Rubik:wght@400;500;600;700&display=swap',
    preview: 'Street food & urban',
  },
  {
    id: 'josefin-quicksand',
    name: 'Josefin Sans + Quicksand',
    heading: "'Josefin Sans', sans-serif",
    body: "'Quicksand', sans-serif",
    googleUrl: 'https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;500;600;700&family=Quicksand:wght@400;500;600;700&display=swap',
    preview: 'Juguetón y café',
  },
];

export interface BrandingConfig {
  logoUrl: string;
  restaurantName: string;
  fontPairId: string;
}

const STORAGE_KEY = 'restaurant-branding';

function loadBranding(): BrandingConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { logoUrl: '', restaurantName: 'Fuego & Sazón', fontPairId: 'space-dm' };
}

interface BrandingContextType {
  branding: BrandingConfig;
  updateBranding: (updates: Partial<BrandingConfig>) => void;
  activeFontPair: FontPair;
}

const BrandingContext = createContext<BrandingContextType | null>(null);

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<BrandingConfig>(loadBranding);

  const activeFontPair = fontCatalog.find(f => f.id === branding.fontPairId) || fontCatalog[0];

  // Load Google Font dynamically
  useEffect(() => {
    const linkId = 'dynamic-google-font';
    let link = document.getElementById(linkId) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = activeFontPair.googleUrl;

    // Apply CSS vars
    document.documentElement.style.setProperty('--font-heading', activeFontPair.heading);
    document.documentElement.style.setProperty('--font-body', activeFontPair.body);
  }, [activeFontPair]);

  const updateBranding = (updates: Partial<BrandingConfig>) => {
    const next = { ...branding, ...updates };
    setBranding(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <BrandingContext.Provider value={{ branding, updateBranding, activeFontPair }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const ctx = useContext(BrandingContext);
  if (!ctx) throw new Error('useBranding must be inside BrandingProvider');
  return ctx;
}
