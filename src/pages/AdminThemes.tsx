import { menuThemes, useMenuTheme, type MenuThemeConfig } from '@/contexts/MenuThemeContext';
import { Check, Eye, Palette, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useState } from 'react';
import { categories, menuItems, restaurant } from '@/data/mockData';

function ThemeMiniPreview({ theme, isActive }: { theme: MenuThemeConfig; isActive: boolean }) {
  const sampleItems = menuItems.filter(i => i.available).slice(0, 3);

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
        isActive ? 'border-primary shadow-lg scale-[1.02]' : 'border-border hover:border-primary/30 hover:shadow-md'
      }`}
    >
      {isActive && (
        <div className="absolute top-3 right-3 z-20 bg-primary text-primary-foreground rounded-full h-7 w-7 flex items-center justify-center shadow-lg">
          <Check className="h-4 w-4" />
        </div>
      )}

      {/* Mini phone mockup */}
      <div className="w-full aspect-[9/16] max-h-[420px] overflow-hidden">
        {/* Header */}
        <div className={`${theme.colors.headerBg} px-4 pt-4 pb-3`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-5 w-5 bg-white/20 rounded-md" />
            <div>
              <div className={`text-[10px] font-bold ${theme.colors.headerText}`}>{restaurant.name}</div>
              <div className={`text-[7px] ${theme.colors.headerAccent}`}>Mesa 5</div>
            </div>
          </div>
          <div className="bg-white/15 rounded-lg h-6" />
        </div>

        {/* Category pills */}
        <div className={`${theme.colors.pageBg} px-3 py-2 flex gap-1`}>
          {categories.slice(0, 3).map((cat, i) => (
            <div
              key={cat.id}
              className={`px-2 py-0.5 rounded-full text-[7px] font-medium ${
                i === 0 ? `${theme.colors.categoryActiveBg} ${theme.colors.categoryActiveText}` : `${theme.colors.categoryBg} ${theme.colors.categoryText}`
              }`}
            >
              {cat.icon} {cat.name}
            </div>
          ))}
        </div>

        {/* Content area */}
        <div className={`${theme.colors.pageBg} px-3 pb-4 space-y-2 flex-1`}>
          {/* Flash deal (only for fuego) */}
          {theme.style.showFlashDeals && (
            <div className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 rounded-lg p-2">
              <div className="text-[8px] text-white font-bold mb-1">⚡ OFERTAS RELÁMPAGO</div>
              <div className="flex gap-1.5">
                {[0, 1].map(i => (
                  <div key={i} className="w-12 bg-white/15 rounded-md overflow-hidden">
                    <div className="h-8 bg-white/10" />
                    <div className="p-1">
                      <div className="h-1 bg-white/30 rounded w-8 mb-0.5" />
                      <div className="h-1 bg-yellow-200/40 rounded w-5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hero card */}
          {sampleItems[0] && (
            <div className={`${theme.colors.cardBg} ${theme.style.cardRadius} overflow-hidden border ${theme.colors.cardBorder} shadow-sm`}>
              <div className="relative h-20">
                <img src={sampleItems[0].image} alt="" className="w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-gradient-to-t ${theme.style.heroOverlay}`} />
                <div className="absolute bottom-1.5 left-2">
                  <div className="text-white text-[9px] font-bold">{sampleItems[0].name}</div>
                  <div className={`text-[8px] font-bold ${theme.id === 'elegante' ? 'text-amber-300' : 'text-white'}`}>
                    ${sampleItems[0].price}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Compact cards */}
          {sampleItems.slice(1).map(item => (
            <div key={item.id} className={`flex gap-2 ${theme.colors.cardBg} ${theme.style.cardRadius} p-1.5 border ${theme.colors.cardBorder} shadow-sm`}>
              <img src={item.image} alt="" className={`h-10 w-10 ${theme.style.imageRadius} object-cover flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <div className={`text-[8px] font-${theme.style.fontWeight} ${theme.colors.textPrimary} truncate`}>{item.name}</div>
                <div className={`text-[7px] ${theme.colors.textSecondary} truncate`}>{item.description}</div>
                <div className={`text-[8px] font-bold ${theme.colors.priceColor}`}>${item.price}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminThemes() {
  const { activeTheme, setThemeId } = useMenuTheme();
  const [previewTheme, setPreviewTheme] = useState(activeTheme.id);

  const handleSelect = (theme: MenuThemeConfig) => {
    setThemeId(theme.id);
    toast.success(`Tema "${theme.name}" aplicado al menú`);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
            <Palette className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold">Diseño del Menú</h1>
            <p className="text-sm text-muted-foreground">
              Elegí el estilo visual que verán tus clientes al escanear el QR
            </p>
          </div>
        </div>
      </div>

      {/* Current theme badge */}
      <div className="flex items-center gap-2 mb-6 p-3 bg-card rounded-xl border border-border">
        <Smartphone className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Tema activo:</span>
        <Badge className="gradient-primary text-white border-0">{activeTheme.name}</Badge>
        <span className="text-xs text-muted-foreground ml-auto hidden sm:block">
          Los cambios se aplican al instante
        </span>
      </div>

      {/* Theme grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {menuThemes.map(theme => (
          <div key={theme.id} className="space-y-3">
            <div onClick={() => handleSelect(theme)}>
              <ThemeMiniPreview theme={theme} isActive={activeTheme.id === theme.id} />
            </div>
            <div className="px-1">
              <h3 className="font-heading font-bold text-sm">{theme.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{theme.description}</p>
              {activeTheme.id === theme.id ? (
                <Badge variant="secondary" className="mt-2 text-[10px]">
                  <Check className="h-3 w-3 mr-1" /> Activo
                </Badge>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 h-7 text-xs"
                  onClick={() => handleSelect(theme)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Aplicar tema
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Info note */}
      <div className="mt-8 p-4 bg-muted rounded-xl border border-border">
        <p className="text-xs text-muted-foreground leading-relaxed">
          💡 <strong>Tip:</strong> Los templates son ligeros y predeterminados, así tu menú carga rápido sin 
          necesidad de diseño personalizado. El tema seleccionado aplica automáticamente a lo que ven tus clientes 
          cuando escanean el QR de la mesa.
        </p>
      </div>
    </div>
  );
}
