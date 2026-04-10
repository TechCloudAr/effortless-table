

# Plan: Corregir todos los charts del Dashboard admin

## Problemas detectados

1. **Eje Y duplicado**: "$2k" aparece dos veces porque `tickFormatter` redondea valores distintos (1800, 2200) al mismo "$2k". Recharts no deduplica ticks.
2. **Formato de moneda inconsistente**: Se usa `$${v.toLocaleString()}` en vez del formato ARS estándar del proyecto.
3. **Charts apretados en mobile**: Altura insuficiente, labels cortados, tooltips grandes.
4. **PieChart con dimensiones fijas**: No usa `ResponsiveContainer`, genera warnings.
5. **BarChart "Ventas por día"**: CartesianGrid innecesaria, barras gruesas en mobile.

## Cambios (archivo único: `src/pages/AdminDashboard.tsx`)

### 1. Eje Y inteligente
- Usar `YAxis` con `domain={[0, 'auto']}` y `allowDecimals={false}` para evitar ticks duplicados.
- Crear un `tickFormatter` que distinga entre valores < 1000 (`$500`), miles (`$1,5k`), y millones.
- Agregar `tickCount={5}` para forzar distribución uniforme.

### 2. Formato ARS consistente
- Crear helper `fmtShort(v)` para ejes: `$0`, `$500`, `$1,5k`, `$10k`.
- En tooltips usar `toLocaleString('es-AR', {style:'currency', currency:'ARS'})` completo.

### 3. Mobile-first charts
- AreaChart (Ventas diarias): height 180px mobile / 280px desktop. Ocultar YAxis en mobile para dar más espacio al gráfico. Reducir strokeWidth a 2.
- BarChart (Ventas por día): height 180px mobile / 240px desktop. `barSize={12}` en mobile. Quitar CartesianGrid en mobile.
- PieChart: Envolver en `ResponsiveContainer` con height fijo. Tamaño dinámico con `outerRadius="75%"`.

### 4. Tooltip mejorado
- Fondo semi-transparente con backdrop-blur (estilo Stripe/Linear).
- Font size 11px, border 0.5px, sin sombra agresiva.
- Mostrar valor formateado como moneda ARS completa.

### 5. Pequeñas mejoras de diseño
- Quitar `CartesianGrid` de todos los charts (estilo clean/flat como Linear).
- Gradiente del AreaChart más sutil (opacity 0.15 → 0.02).
- Labels del eje X en mobile: solo mostrar cada 2do o 3er label para evitar overlap.

