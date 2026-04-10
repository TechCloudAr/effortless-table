

# Plan: Ajustar header de Menu Intelligence

## Cambios (archivo único: `src/pages/AdminMenuIntelligence.tsx`)

1. **Agregar selector de semana** al header, tipo "Semana del 22 al 28 Mar" con flechas para navegar entre semanas (← →), similar al patrón usado en otros dashboards del proyecto.

2. **Eliminar la línea descriptiva** "Entendé cómo interactúan tus clientes con el menú" — queda solo el título "Menu Intelligence" y el selector de semana debajo.

### Detalle técnico
- Línea 79: Eliminar el `<p>` con el texto descriptivo
- Agregar debajo del `<h1>` un selector de semana con botones de navegación (← semana →) que muestre el rango de fechas actual
- El selector será visual (mock) ya que los datos son mock — mostrará la semana actual calculada dinámicamente

