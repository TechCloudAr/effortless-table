

# Plan: Auto-cancelar sesiones con pago pendiente después de 15 min

## Problema
Si un pedido queda en `pending_payment` más de 15 minutos, la mesa sigue apareciendo como "ocupada" indefinidamente. El pago debería confirmarse casi al instante — si no pasó, el cliente se fue.

## Cambios

### 1. Migración SQL — Actualizar `expire_stale_table_sessions()`
Agregar una regla: cancelar pedidos `pending_payment` con más de 15 minutos y liberar la sesión de mesa asociada.

```sql
-- Dentro de expire_stale_table_sessions():
-- Cancelar pedidos pending_payment > 15 min
UPDATE public.orders
SET status = 'cancelado', updated_at = now()
WHERE status = 'pending_payment'
AND created_at < now() - interval '15 minutes';
```

### 2. Migración SQL — Limpiar datos actuales
Cancelar todos los pedidos `pending_payment` existentes con más de 15 min (los fantasma de ahora).

### 3. Corregir filtro en `AdminTables.tsx` (~línea 91)
Cambiar el filtro de `activeOrders` para excluir `pending_payment` y pedidos con más de 4 horas:

```ts
const activeOrders = orders.filter(o =>
  ['nuevo', 'preparing', 'preparando', 'ready', 'listo'].includes(o.status)
  && (Date.now() - new Date(o.created_at).getTime()) < 4 * 3600000
);
```

### 4. Mismo fix en `useSalesData.ts` (~línea 76)
Aplicar el mismo filtro de estados activos para consistencia en el dashboard.

## Resultado
- Mesa 5 aparece como "Disponible" inmediatamente
- Pedidos que nunca se pagaron → `cancelado`
- A futuro, la función cron limpia automáticamente cada 15 min

