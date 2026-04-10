

# Plan: Arreglar menú de navegación móvil cortado

## Problema
La barra de navegación inferior en móvil usa `flex justify-around` con hasta 9 ítems (Overview, Pedidos, Menú, Sales & Profit, Menu Intelligence, Mesas, Pagos, Sucursales, Templates). En una pantalla de 390px, los ítems se comprimen y se cortan — no se pueden ver todos.

## Solución
Cambiar la barra inferior móvil a scroll horizontal, para que todos los ítems sean visibles deslizando.

## Cambios (archivo único: `src/components/admin/AdminLayout.tsx`)

1. **Barra inferior scrollable**: Cambiar `flex justify-around` a `flex overflow-x-auto no-scrollbar gap-1` para que los ítems se puedan deslizar horizontalmente
2. **Tamaño mínimo por ítem**: Agregar `min-w-[60px] flex-shrink-0` a cada ítem para que no se compriman
3. **Labels más cortos**: Acortar los labels largos en móvil (ej: "Sales & Profit" → "Ventas", "Menu Intelligence" → "Intel", "Sucursales" → "Locales", "Templates" → "Diseño")
4. **Padding lateral**: Agregar `px-2` al contenedor para que el primer y último ítem tengan espacio

## Resultado
Todos los ítems del menú serán visibles y legibles, con scroll horizontal suave para acceder a los que no caben en pantalla.

