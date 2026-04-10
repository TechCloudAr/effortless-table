

# Plan: Redisenar Super Admin Dashboard

## Alcance
Reconstruir `/superadmin` como un dashboard profesional completo con sidebar, metricas en tiempo real, tabla de restaurantes con slide-over, filtros por periodo, busqueda global Cmd+K, sonido en pedidos nuevos, exportacion CSV, y formato ARS.

## Arquitectura

Se crearan 8 archivos nuevos bajo `src/pages/superadmin/` mas un layout dedicado, reemplazando el archivo actual monolitico.

```text
src/
├── pages/
│   ├── SuperAdminDashboard.tsx  (reescribir como layout con sidebar)
│   └── superadmin/
│       ├── SAOverview.tsx        (metricas + grafico actividad)
│       ├── SARestaurants.tsx     (tabla + slide-over detalle)
│       ├── SALiveOrders.tsx      (pedidos en vivo + sonido)
│       ├── SAUsers.tsx           (listado de usuarios/owners)
│       └── components/
│           ├── SAMetricCard.tsx
│           ├── RestaurantSlideOver.tsx
│           ├── CommandSearch.tsx  (Cmd+K dialog)
│           └── ExportCSVButton.tsx
```

## Cambios detallados

### 1. Layout con Sidebar (`SuperAdminDashboard.tsx`)
- Sidebar fija en desktop (w-60) con logo Mesa Digital, links: Overview, Restaurantes, Pedidos en vivo, Usuarios
- Topbar con busqueda Cmd+K, badge de pedidos activos, boton Salir
- En movil: bottom nav scrollable (patron ya existente en AdminLayout)
- Guard: si `role !== 'superadmin'` redirige a `/admin/dashboard`

### 2. Overview (`SAOverview.tsx`)
- 4 metric cards: Restaurantes, Pedidos totales, Pedidos activos (con pulso verde), Facturacion total
- Formato ARS: `$7.759,24` usando `toLocaleString('es-AR')`
- Grafico de actividad ultimos 7 dias (barras simples con CSS, sin libreria)
- Distribucion de estados de pedidos (mini donut o barras horizontales)
- Alertas: restaurantes sin pedidos en 48h, picos de actividad

### 3. Restaurantes (`SARestaurants.tsx`)
- Tabla con columnas: Nombre, Pedidos, Activos, Facturacion, Registrado, badge "Prueba" para restaurantes "Francisco"
- Filtro por periodo: Hoy, 7d, 30d, 90d, Todo
- Click en fila abre slide-over con detalle del restaurante (ultimos pedidos, sucursales, metricas)
- Boton exportar CSV

### 4. Pedidos en vivo (`SALiveOrders.tsx`)
- Realtime via `supabase.channel()` (ya configurado)
- Sonido en pedido nuevo: `new Audio('/notification.mp3').play()` con un beep generado por Web Audio API como fallback
- Status badges traducidos al espanol: nuevo, pagado, preparando, listo, entregado, cancelado
- Filtro por restaurante

### 5. Busqueda global (`CommandSearch.tsx`)
- Dialog con Cmd+K / Ctrl+K shortcut
- Busca entre restaurantes, pedidos (por mesa), paginas
- Usa el componente Command de shadcn ya instalado

### 6. Exportacion CSV (`ExportCSVButton.tsx`)
- Genera CSV client-side con los datos actuales de la tabla
- Descarga automatica con `URL.createObjectURL`

### 7. Routing
Actualizar `App.tsx`:
```
/superadmin → layout
/superadmin/overview → SAOverview (index)
/superadmin/restaurantes → SARestaurants
/superadmin/pedidos → SALiveOrders
/superadmin/usuarios → SAUsers
```

### 8. Detalles criticos
- Color marca: `#f97316` (ya configurado como --primary)
- Moneda: pesos argentinos `$7.759,24` en todo el dashboard
- Status inicial de orders: `pending_payment` y `nuevo` (ambos existen en DB)
- Restaurantes "Francisco" marcados con badge "Prueba" (match por nombre)
- No crear nuevas credenciales de Supabase

## No se necesitan migraciones
Todo se lee de tablas existentes (restaurants, orders, profiles, user_roles, branches). Sin cambios de schema.

