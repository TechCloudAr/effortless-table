

# Plan: Backend real con datos bien calculados + Personalización de ingredientes

## Resumen

Dos objetivos: (1) mover toda la data del menú a la base de datos con fórmulas reales para métricas, y (2) que el cliente pueda quitar ingredientes y elegir opciones como término de carne.

---

## Parte 1: Tablas de backend

### Nuevas tablas (migración SQL)

| Tabla | Propósito |
|---|---|
| `restaurants` | Config del restaurante (nombre, moneda, tax_rate) |
| `menu_categories` | Categorías con orden e ícono |
| `menu_items` | Productos con precio, imagen, tags, disponibilidad |
| `menu_item_option_groups` | Grupos de opciones (término, salsas, extras) |
| `menu_item_options` | Opciones individuales con precio adicional |
| `menu_item_ingredients` | Ingredientes con costo, cantidad, unidad, y flag `removable` |

Todas con RLS permisiva para lectura pública (menú público). Escritura abierta por ahora (admin auth viene después).

La migración incluye seed data con los productos actuales de mockData.ts y sus ingredientes con costos realistas.

### Datos calculados reales

El dashboard de **Sales & Profit** deja de usar arrays hardcodeados y pasa a calcular desde la tabla `orders` (que ya tiene 12 pedidos reales):

- **Ingresos**: `SUM(total)` de orders agrupado por período
- **Productos vendidos**: parseando el JSONB `items` de cada order para contar por producto
- **Costo por producto**: cruzando items vendidos × costo de ingredientes de `menu_item_ingredients`
- **Margen**: ingresos - costo, calculado en código, no inventado
- **Ticket promedio**: `total / count(orders)` por mesa o por hora
- **Clasificación BCG**: calculada dinámicamente sobre los datos reales

Si no hay suficientes datos para una métrica, se muestra "Sin datos suficientes" en vez de inventar números.

---

## Parte 2: Hooks de datos

Nuevos hooks que reemplazan imports de `mockData.ts`:

- **`useMenu.ts`**: lee `menu_items`, `menu_categories`, `menu_item_option_groups`, `menu_item_options`, `menu_item_ingredients` desde la DB
- **`useRestaurant.ts`**: lee config del restaurante
- **`useSalesData.ts`**: queries a `orders` + `menu_item_ingredients` para calcular métricas reales

---

## Parte 3: Personalización de ingredientes (cliente)

### En `AdminMenuPage.tsx`
- Sección "Composición" en el dialog de editar: lista de ingredientes con nombre, cantidad, unidad (`g`, `ml`, `unidad`), costo por unidad, y checkbox **"¿Removible?"**
- Los ingredientes se guardan en `menu_item_ingredients`

### En `ProductDetailModal.tsx`
- Nueva sección **"Personalizar"** antes de las notas: muestra ingredientes marcados como `removable = true`
- UI: lista con switches o chips con X para desmarcar (ej: "Sin tomate", "Sin cebolla")
- Los ingredientes removidos se guardan en `selectedOptions` del carrito y se envían con la order
- Los option groups existentes (término, salsas) siguen funcionando igual, ahora desde la DB

---

## Parte 4: Dashboards con datos reales

### `AdminDashboard.tsx`
- Stats calculadas desde `orders`: ventas del día, cantidad de pedidos, ticket promedio
- Top productos: parseando JSONB de items en orders reales

### `AdminSalesProfit.tsx`
- Reemplazar arrays mock por queries reales
- Margen = precio venta - costo ingredientes (calculado, no inventado)
- Si los datos son insuficientes, mostrar estado vacío claro

### `AdminTables.tsx`
- Performance por mesa calculada desde orders reales (filtrado por `table_number`)

---

## Archivos a crear/modificar

| Archivo | Acción |
|---|---|
| Migración SQL | 6 tablas + seed data + RLS |
| `src/types/restaurant.ts` | Agregar `Ingredient` con `removable`, `defaultIncluded` |
| `src/hooks/useMenu.ts` | Nuevo: lee menú desde DB |
| `src/hooks/useRestaurant.ts` | Nuevo: lee config restaurante |
| `src/hooks/useSalesData.ts` | Nuevo: métricas calculadas desde orders |
| `src/pages/AdminMenuPage.tsx` | CRUD real + editor de ingredientes |
| `src/components/customer/ProductDetailModal.tsx` | Sección de ingredientes removibles |
| `src/pages/CustomerMenu.tsx` | Usar hooks en vez de mock |
| `src/pages/AdminDashboard.tsx` | Datos reales desde orders |
| `src/pages/AdminSalesProfit.tsx` | Métricas calculadas, no hardcodeadas |
| `src/pages/AdminTables.tsx` | Stats por mesa desde orders reales |
| `src/data/mockData.ts` | Se mantiene como fallback |

---

## Orden de implementación

1. Migración SQL (tablas + seed)
2. Hooks de datos (useMenu, useRestaurant, useSalesData)
3. AdminMenuPage con ingredientes y CRUD real
4. ProductDetailModal con personalización de ingredientes
5. CustomerMenu usando hooks
6. Dashboards con datos reales

