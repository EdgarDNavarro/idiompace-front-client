# 🎬 Remotion - Creación de Videos con IdiomPace

## ¿Qué es Remotion?

Remotion es una librería que te permite crear videos programáticamente usando React. En lugar de usar software de edición tradicional, escribes código React para generar videos con animaciones, transiciones y efectos.

## 📁 Estructura del Proyecto

```
src/remotion/
├── index.ts                    # Punto de entrada de Remotion
├── Root.tsx                    # Definición de composiciones
└── compositions/
    └── HomeShowcase.tsx        # Video del home de la app
```

## 🚀 Cómo usar Remotion

### 1. Abrir el Studio de Remotion

El Studio de Remotion es una interfaz visual donde puedes previsualizar y editar tus videos en tiempo real:

```bash
npm run remotion:studio
```

Esto abrirá el navegador en `http://localhost:3000` donde verás:
- La lista de composiciones disponibles
- Un preview del video
- Controles de reproducción (play, pause, frame-by-frame)
- Timeline para navegar por el video
- Panel de props para modificar valores en tiempo real

### 2. Previsualizar el Video

Una vez abierto el Studio:
1. Selecciona "HomeShowcase" en la lista de composiciones
2. Presiona el botón play o usa la barra de progreso
3. Ajusta los props en el panel lateral si quieres cambiar el título

### 3. Renderizar el Video

Para exportar el video como archivo MP4:

```bash
npm run remotion:render
```

El video se guardará en la carpeta `out/home-showcase.mp4`

### 4. Opciones avanzadas de renderizado

Puedes personalizar el renderizado con flags adicionales:

```bash
# Renderizar con mejor calidad
npx remotion render src/remotion/index.ts HomeShowcase out/video.mp4 --quality 100

# Renderizar solo una parte del video (frames 0-90)
npx remotion render src/remotion/index.ts HomeShowcase out/video.mp4 --frames=0-90

# Renderizar con diferentes dimensiones
npx remotion render src/remotion/index.ts HomeShowcase out/video.mp4 --width=1920 --height=1080

# Renderizar en formato diferente
npx remotion render src/remotion/index.ts HomeShowcase out/video.webm --codec=vp8
```

## 🎨 Estructura del Video HomeShowcase

El video tiene **450 frames (15 segundos a 30fps)** y está dividido en dos secuencias principales:

### Secuencia 1: Intro Épica (0-90 frames / 0-3 segundos)
- 📚 Logo animado con rotación 360° y efecto pulso
- ✨ Título con efecto glow y sombra dinámica
- 🌊 Subtítulo con fade in y slide up
- ⚡ Línea decorativa que se expande
- 🎆 Partículas flotantes de fondo
- 💫 Gradientes decorativos en movimiento

### Secuencia 2: Interface Dinámica del Home (90-450 frames / 3-15 segundos)
- **Header**: Bounce effect con subrayado animado que crece
- **Streak Counter**: 
  - Entrada con scale y rotación dramática
  - Flame icon con pulso constante
  - Glow rotatorio en el fondo
  - Barra de progreso con animación spring
  - Milestones con efectos de llama animados
  - Efecto de flotación sutil
- **Search Bar**: 
  - Slide in lateral suave
  - Campos aparecen escalonadamente
  - Botón con pulso y brillo animado
  - Efecto shine atravesando el botón
  - Hover effects en inputs
- **Stories Grid**:
  - Fade y scale de entrada coordinados
  - Cards aparecen con delay escalonado
  - Hover effect simulado constante
  - Play button con escala pulsante
  - Categorías con animación de slide
  - Borde brillante en hover
  - Iconos con micro-rotaciones
- **Floating Badges**:
  - 3 badges informativos flotantes
  - Aparición escalonada desde la derecha
  - Movimiento de flotación continuo
  - Gradientes de colores vibrantes

### 🎭 Efectos Especiales
- ✨ 15 partículas flotantes animadas
- 🌈 Gradientes decorativos en movimiento
- 💫 Efectos de glow en múltiples elementos
- 🔄 Rotaciones y escalas dinámicas
- 📊 Animaciones spring para movimientos naturales
- 🎨 Transiciones suaves con interpolaciones personalizadas

## 🎨 Usando Tailwind CSS

Este proyecto usa **Tailwind CSS** para los estilos, igual que tu app React:

```tsx
// ✅ Correcto - Usando clases de Tailwind
<div className="bg-neutral-900 p-6 rounded-xl">
  <h1 className="text-4xl font-bold text-white">Título</h1>
</div>

// ❌ Evitar - No usar clases de animación de Tailwind
<div className="animate-bounce"> {/* No funciona en Remotion */}
</div>

// ✅ Correcto - Animar con useCurrentFrame()
const frame = useCurrentFrame();
const opacity = interpolate(frame, [0, 30], [0, 1]);
<div className="bg-blue-500" style={{ opacity }}>
</div>
```

**Notas importantes:**
- ✅ Usa todas las clases de Tailwind: colores, espaciado, tipografía, etc.
- ❌ **NO usar** `transition-*` o `animate-*` de Tailwind
- ✅ Anima con `useCurrentFrame()` y `interpolate()`

## 📐 Configuración del Video

- **Resolución**: 1920x1080 (horizontal, Full HD, ideal para presentaciones y YouTube)
- **FPS**: 30
- **Duración**: 15 segundos (450 frames)
- **Formato**: MP4 (configurable)
- **Estilo**: Tailwind CSS nativo
- **Iconos**: Lucide React
- **Animaciones**: Spring physics + interpolaciones personalizadas

## ✏️ Cómo Editar el Video

### Cambiar el título

Modifica el `defaultProps` en [src/remotion/Root.tsx](src/remotion/Root.tsx):

```tsx
<Composition
  id="HomeShowcase"
  component={HomeShowcase}
  durationInFrames={300}
  fps={30}
  width={1080}
  height={1920}
  defaultProps={{
    title: "TU NUEVO TÍTULO",
  }}
/>
```

### Cambiar colores

Los colores usan clases de Tailwind CSS. En [src/remotion/compositions/HomeShowcase.tsx](src/remotion/compositions/HomeShowcase.tsx):

```tsx
// Cambiar fondo
<div className="bg-neutral-900"> {/* Cambia a bg-slate-900, bg-zinc-900, etc. */}

// Cambiar color de texto
<h1 className="text-white"> {/* Cambia a text-gray-100, text-blue-500, etc. */}

// Cambiar color principal
<button className="bg-green-600"> {/* Cambia a bg-blue-600, bg-purple-600, etc. */}
```

### Agregar más animaciones

Usa las funciones de Remotion:

```tsx
import { useCurrentFrame, interpolate, spring } from "remotion";

const frame = useCurrentFrame();
const { fps } = useVideoConfig();

// Fade in simple
const opacity = interpolate(frame, [0, 30], [0, 1], {
  extrapolateRight: "clamp",
});

// Animación spring (rebote)
const scale = spring({
  frame: frame,
  fps,
  config: { damping: 200 },
});

// Movimiento
const y = interpolate(frame, [0, 60], [-100, 0], {
  extrapolateRight: "clamp",
});
```

### Cambiar duración

Modifica `durationInFrames` en Root.tsx. Recuerda:
- A 30fps: `30 frames = 1 segundo`
- Ejemplo: `600 frames = 20 segundos`
- Actual: `450 frames = 15 segundos`

### Personalizar animaciones

Las animaciones usan configuración spring para movimientos naturales:

```tsx
// Animación rápida y elástica
const myAnimation = spring({
  frame: frame,
  fps,
  config: {
    damping: 60,    // Bajo = más rebote
    stiffness: 200, // Alto = más rápido
    mass: 0.5,      // Bajo = más ligero
  },
});

// Animación suave y lenta
const smoothAnimation = spring({
  frame: frame,
  fps,
  config: {
    damping: 100,   // Alto = menos rebote
    stiffness: 100, // Bajo = más lento
  },
});
```

### Ajustar velocidad de efectos

Los efectos de pulso y brillo usan módulo de frames:

```tsx
// Pulso rápido (cada 2 segundos)
const fastPulse = interpolate(frame % 60, [0, 30, 60], [1, 1.2, 1]);

// Pulso lento (cada 4 segundos)
const slowPulse = interpolate(frame % 120, [0, 60, 120], [1, 1.2, 1]);
```

## 🎯 Conceptos Clave de Remotion

### 1. Frame-based Animation
Todas las animaciones se basan en frames, no en tiempo real:
```tsx
const frame = useCurrentFrame(); // Frame actual (0, 1, 2, 3...)
```

### 2. Interpolate
Transforma valores de un rango a otro:
```tsx
// De frame 0 a 30, opacidad va de 0 a 1
const opacity = interpolate(frame, [0, 30], [0, 1]);
```

### 3. Spring
Crea animaciones con efecto de rebote natural:
```tsx
const scale = spring({
  frame: frame,
  fps,
  config: { damping: 200 },
});
```

### 4. Sequence
Organiza clips en el tiempo:
```tsx
<Sequence from={90} durationInFrames={210}>
  <MiComponente />
</Sequence>
```

## 📚 Recursos Adicionales

- [Documentación oficial de Remotion](https://www.remotion.dev/docs)
- [Ejemplos de animaciones](https://www.remotion.dev/docs/animating-properties)
- [API Reference](https://www.remotion.dev/docs/api)
- [Foro de la comunidad](https://remotion.dev/discord)

## 🎥 Próximos Pasos

Ideas para expandir:
1. Crear video mostrando la funcionalidad de flashcards
2. Tutorial animado de cómo usar la app
3. Video promocional con testimonios
4. Demo de la funcionalidad de historias
5. Tour completo de todas las features

## 🐛 Troubleshooting

### El Studio no abre
```bash
# Limpia caché y reinstala
rm -rf node_modules
npm install
npm run remotion:studio
```

### Error de renderizado
```bash
# Verifica que todos los assets existen
# Revisa la consola del Studio para ver errores específicos
```

### Video renderizado en blanco
- Asegúrate de que todos los componentes retornan JSX válido
- Verifica que no hay errores en la consola del Studio
- Confirma que las duraciones de las secuencias no se solapan incorrectamente

## 💡 Tips

1. **Siempre trabaja en el Studio primero** - Es más rápido iterar
2. **Usa `extrapolateRight: 'clamp'`** - Evita valores fuera de rango
3. **Piensa en frames, no en segundos** - Multiplica segundos × fps
4. **Divide en Sequences** - Mantén el código organizado
5. **Usa componentes pequeños** - Facilita la reutilización
6. **Spring para movimientos naturales** - Más realista que interpolate lineal
7. **Módulo (%) para animaciones cíclicas** - Perfectas para pulsos y rotaciones
8. **Delay en apariciones** - Animaciones escalonadas son más profesionales

## 🎬 Efectos Especiales Incluidos

### Partículas flotantes
15 partículas que flotan hacia arriba con diferentes velocidades. Para desactivar, comenta:
```tsx
<AnimatedBackground frame={frame} />
```

### Efectos de brillo (glow)
Múltiples elementos tienen sombras brillantes animadas:
- Logo principal
- Título
- Botones
- Flame icons
- Cards en hover

### Rotaciones dinámicas
- Logo: 360° en intro
- Glow del streak counter: rotación continua
- Play button: ligera rotación en hover
- Mic icon: micro-rotación sutil

### Escalas pulsantes
- Logo: pulso cada 1 segundo
- Flame icon: pulso cada 2 segundos
- Botón buscar: pulso cada 3 segundos
- Play button: pulso cada 3 segundos

### Efectos shine
El botón "Buscar" tiene un brillo que atraviesa el elemento cada pocos segundos

## 🎯 Optimización de Renderizado

Para videos más rápidos de renderizar:
1. Reduce las partículas de 15 a 5
2. Desactiva los efectos de blur
3. Simplifica las animaciones spring a interpolate
4. Reduce la duración a 360 frames (12 segundos)

---

¡Ahora estás listo para crear videos increíbles con Remotion! 🎬✨
