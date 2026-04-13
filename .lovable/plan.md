

# Plan: Sistema de 3 vistas con acceso por rol

## Resumen
Rediseñar las 3 vistas principales (Owner, Cocina, Caja) con funcionalidad completa según la especificación. La mayor parte del trabajo es en Cocina y Caja (hoy son muy básicos) y mejoras al Owner dashboard.

## Cambios

### 1. Migración SQL — Índice en orders.branch_id
```sql
CREATE INDEX IF NOT EXISTS idx_orders_branch_id ON public.orders(branch_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
```

### 2. Cocina iPad — Rediseño completo (`src/pages/CocinaScreen.tsx`)
- **Dark theme forzado** (clases inline, no depende de sistema)
- **Texto grande** legible a 2m, cards grandes para guantes de cocina
- **Colores**: nuevo = azul, preparando = ámbar, listo = verde
- **NO muestra precios** — solo items, cantidad, instrucciones especiales, ingredientes removidos
- **Ordenado por antigüedad** (más viejo arriba = más urgente)
- **Audio alert**: Web Audio API beep cuando llega pedido nuevo (comparando count anterior vs nuevo)
- **Realtime** ya funciona, se mantiene
- **Layout landscape iPad**: grid de 3-4 columnas
- **Sin navegación** a otras secciones, pantalla completa
- **Botón único**: "Empezar" (paid→preparing) y "Listo" (preparing→ready)

### 3. Caja iPad — Rediseño completo (`src/pages/CajaScreen.tsx`)
- **Layout 2 columnas landscape**: pedidos activos (izquierda), resumen del día (derecha)
- **Pedidos activos**: todos los estados del flujo (nuevo → confirmado → preparación → listo → cobrado), con botones para avanzar estado y marcar como pagado
- **Panel derecho — Resumen del día**:
  - Total cobrado hoy (running total)
  - Cantidad de pedidos cerrados
  - Desglose por método de pago (efectivo/tarjeta/MP) — por ahora mock ya que no tenemos campo payment_method
  - Lista de pedidos cerrados hoy con montos
- **Métricas básicas**: pedidos hoy, revenue hoy, ticket promedio hoy
- **Mesas activas**: cuáles mesas tienen pedidos abiertos
- **QR generation**: botón para generar/imprimir QR por mesa (reusar lógica de AdminTables)
- **Realtime** subscription en orders
- **Light theme forzado**, diseño profesional iPad
- **Sin acceso a**: otras sucursales, menú, historial largo, settings de owner

### 4. Owner App — Mejoras al dashboard existente
El dashboard actual ya tiene bastante. Mejoras incrementales:
- **Asegurar que métricas consolidadas** (todas las sucursales) funcionen correctamente cuando `activeBranchId = null`
- **Métricas per-branch**: cuando hay múltiples branches, mostrar mini-cards comparativas por sucursal (pedidos, revenue, ticket promedio de hoy)
- El resto (menú, QR, mesas, pagos, sucursales, diseño) **ya existe** en las rutas de AdminLayout

### 5. Sesión permanente iPad (Cocina y Caja)
- Las rutas `/cocina/:branchId` y `/caja/:branchId` ya están **fuera** de `ProtectedRoute` en App.tsx → no requieren login ✓
- Agregar auto-refresh silencioso: si la sesión anónima de Supabase expira, crear una nueva automáticamente
- RLS de orders ya permite SELECT con `branch_id IS NOT NULL` → las vistas iPad pueden leer sin autenticación ✓
- RLS de orders permite UPDATE público → pueden cambiar status ✓

### 6. Actualizar rutas en App.tsx
- Verificar que `/cocina/:branchId` y `/caja/:branchId` siguen fuera de ProtectedRoute (ya lo están)
- No se necesitan cambios de routing

### 7. Guardar en memoria del proyecto
Actualizar `mem://features/roles-branches` con la lógica de las 3 vistas.

## Archivos a modificar
| Archivo | Cambio |
|---------|--------|
| `src/pages/CocinaScreen.tsx` | Rediseño completo: dark, large text, audio, landscape grid |
| `src/pages/CajaScreen.tsx` | Rediseño completo: 2-col layout, resumen día, status flow, QR |
| `src/pages/AdminDashboard.tsx` | Agregar mini-cards comparativas por sucursal |
| Migración SQL | Índices en orders.branch_id y status |
| `mem://features/roles-branches` | Documentar las 3 vistas |

## Lo que NO se construye
- Sin sistema de permisos/roles complejo
- Sin login para iPad
- Sin invitación de staff
- Sin dark mode toggle
- Sin optimización mobile para cocina/caja (iPad landscape only)

