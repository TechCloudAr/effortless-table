

# Plan: Landing page renovada

Rediseno completo de `src/pages/Index.tsx` centrado en los 3 diferenciadores clave que mencionaste. Sin testimonios, sin pricing, sin social proof ficticio.

## Mensajes centrales

1. **Se alimenta sola** — No cargas datos, el sistema aprende del uso real de tus clientes
2. **Inteligencia analitica infinita** — Cada interaccion genera datos accionables: que vender, que sacar, que mover, cuando reforzar
3. **Reduccion de costos real** — Menos personal operativo, menos errores, menos friccion. Ahorro para vos y para el cliente (propina digital, sin esperas)

## Estructura de la pagina

### 1. Nav (sin cambios)
Logo + "Acceso staff" + "Ver demo"

### 2. Hero
- Titulo fuerte: algo como "Tu restaurante genera datos con cada pedido. Nosotros los convertimos en decisiones."
- Subtitulo enfocado en que no hay carga manual, se adapta al negocio
- Dos CTAs: "Probar como cliente" + "Panel del restaurante"

### 3. Seccion "Se adapta a vos, no vos a la app"
- Comparacion visual (dos columnas):
  - Izquierda: "Software tradicional" — cargar productos, cargar stock, cargar reportes, adaptarte a la herramienta
  - Derecha: "Mesa Digital" — el cliente escanea, pide, paga. Los datos se generan solos. Vos solo decidis.

### 4. Las 3 capas del producto
Tres cards grandes con scroll animation:
- **Pedir facil**: QR, menu interactivo, carrito, pago, sin mozo intermediario
- **Operar mejor**: pedidos en tiempo real, tiempos de cocina, alertas, rotacion de mesas
- **Decidir mejor**: rentabilidad por plato, inteligencia de menu, forecasting, recomendaciones de IA

### 5. Metricas de impacto
Mismas 3 metricas (40% menos espera, 3x mas rapido, 25% mas ticket) + agregar una 4ta: reduccion de costos operativos

### 6. Seccion "Inteligencia que crece con tu negocio"
Lista de capacidades analiticas presentadas como bullets cortos y potentes:
- Sabe que plato vende mucho pero te hace perder plata
- Te dice que mover en el menu para vender mas
- Detecta cuellos de botella en cocina antes de que exploten
- Proyecta ventas y te sugiere que comprar manana

### 7. CTA final
Fondo gradiente, copy directo: "Implementa en minutos. Sin hardware. Sin carga de datos."

### 8. Footer (sin cambios)

## Detalles tecnicos
- Mismo stack: framer-motion `whileInView` para animaciones de scroll
- Sin componentes externos nuevos
- Un solo archivo: `src/pages/Index.tsx`

