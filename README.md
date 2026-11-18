# IDOVHS — SASED Core

Motor multimedia retro en tiempo real basado en **TypeScript estricto + WebGL 2.0**. Emula sensores CCD digicam, artefactos de cinta VHS y compresión/dithering agresivo mediante una cascada de fragment shaders con FBOs en ping-pong.

## Estado del MVP

Incluido:

- Pipeline GPU de 3 pasos (Óptica → VHS → Compresión) + pass final a pantalla.
- Fuentes: imagen (**JPG/PNG**), vídeo (**MP4**), cámara web y patrón procedural.
- Exportación: **PNG** del fotograma actual y **MP4** del viewport (WebM como fallback de navegador).
- Consola de hardware con cuatro racks (incluido el **filtro Idotiza**), teclado accesible y layout responsive.
- Sistema de marca reutilizable en `brand/`: tokens CSS/TS/JSON + chunk GLSL de color grade.
- Resolución adaptativa (downscale automático a 720p si baja el FPS).
- Recuperación ante pérdida del contexto WebGL.
- Pruebas unitarias (Vitest) de validadores, máquina de estados, resolución adaptativa e inyección de uniforms.

Pendiente (fuera del MVP): render offline cuadro a cuadro a resolución nativa, datamoshing real con vectores de movimiento y perfiles de sensor por LUT.

## Formatos

| Dirección | Formatos | Implementación |
| --- | --- | --- |
| Entrada | `.jpg`, `.jpeg`, `.png`, `.mp4` | Whitelist de extensión + MIME en `src/core/mediaFormats.ts`, aplicada en `MediaSource.loadFile()` desde el explorador de archivos. |
| Salida | `.png` | `canvas.toBlob()` capturado dentro del bucle de render. |
| Salida | `.mp4` | `MediaRecorder` sobre `canvas.captureStream(30)`. Firefox usa `.webm` por falta de soporte MP4. |

La exportación de vídeo es **en tiempo real**: graba lo que se ve en el viewport mientras se reproduce. No incluye audio (`captureStream()` del canvas solo entrega vídeo) y usa la resolución adaptativa del preview.

## Requisitos

- Node.js 20+ (se recomienda 22 LTS) y npm/pnpm.
- Navegador con WebGL 2.0 (Chrome 58+, Firefox 51+, Safari 15+).
- Hardware objetivo: GPU de gama de entrada (GT 710, 2 GB VRAM), i5-9400F, 16 GB RAM.

## Instalación

```bash
npm install
cp .env.example .env
npm run dev
```

Abrir `http://localhost:5173`.

```bash
npm run build     # tsc --noEmit + vite build
npm test          # pruebas unitarias
npm run preview   # servir dist/
```

## Arquitectura

```
Entrada (archivo/cámara/patrón)
  → Textura GPU
  → FBO A: digicam.frag.glsl   (ISO, rolloff CCD, flash/bloom)
  → FBO B: vhs.frag.glsl       (jitter, barril, aberración, ruido, scanlines)
  → FBO A: compression.frag.glsl (macrobloques, cuantización, Bayer)
  → FBO B: brand.frag.glsl + brand/grade.glsl (filtro Idotiza)
  → Framebuffer por defecto (passthrough)
```

Cada pass es un `ShaderProgram` con uniforms inyectados desde los contratos de datos (`src/types.ts`). `RenderPipeline` posee dos texturas RGBA8 y dos FBOs que se reciclan, sin round-trips CPU↔GPU.

### Estructura

| Ruta | Responsabilidad |
| --- | --- |
| `src/core/RenderPipeline.ts` | VAO del quad, FBOs ping-pong, resize, renderQuad, dispose |
| `src/core/ShaderProgram.ts` | Compilación GLSL, caché de uniforms, enlace de texturas |
| `src/core/MediaSource.ts` | Ingesta de imagen/vídeo/cámara/patrón y upload a textura |
| `src/core/mediaFormats.ts` | Whitelist de entrada y selección de códec de salida |
| `src/core/Engine.ts` | Bucle rAF, máquina de estados, cascada de shaders, context loss y exportación PNG/MP4 |
| `src/core/uniforms.ts` | Mapeo de parámetros TS → uniforms GLSL |
| `src/core/validators.ts` | Normalización y límites de parámetros |
| `src/core/adaptiveResolution.ts` | Histéresis FPS → resolución de preview |
| `src/shaders/*.glsl` | Fragment/vertex shaders GLSL ES 3.00 |
| `src/core/shaderSources.ts` | Composición de shaders con el chunk de marca |
| `src/ui/controls.ts` | Construcción de los racks y controles |
| `brand/tokens.css` / `tokens.ts` / `tokens.json` | Paleta Idotiza, fuente única para CSS/TS/otras apps |
| `brand/logo.png` | Logo principal: cabecera y favicon |
| `brand/grade.glsl` | Filtro reutilizable en cualquier pipeline GLSL |
| `src/styles.css` | Sistema de diseño y layout de consola |

## Parámetros

Ver `src/types.ts` para los contratos completos (`DigicamParams`, `VhsParams`, `CompressionParams`, `EngineState`). Rangos:

- ISO: 100–6400 · flash: 0–1 · bloom: 1–16
- tracking: 0–1 · barril: −0.5–0.5 · ruido magnético: 0–1 · color bleed: 0–1 · scanlines: 0–1
- JPEG: 0.1–1 · bloque: 4/8/16 · niveles de posterización: 2–16 · dither: bayer 4×4 / 8×8 / ruido

## Idotiza (Módulo 4.1)

Identidad DIY / fanzine / post-punk con deep lore alquimista santiaguino en búsqueda de la YDL. Paleta, tipografías, texturas y sello viven **solo** en `brand/`:

| Token | Hex | Uso |
| --- | --- | --- |
| `blanco` | `#F5F5F5` | Fondo |
| `negro` | `#000000` | Letras y desarrollo |
| `rojo` | `#FF1E00` | Títulos y acentos |
| `celeste` | `#62F2F6` | Filtros |

Tipografía: máquina de escribir (`Special Elite`) para títulos/párrafos, mano alzada (`Permanent Marker`) para detalles. Texturas: grano, VHS, compresión digital, papel de cuaderno y papel de plástico. Logo: `brand/logo.png` (PNG transparente; cabecera y favicon). El título de la app es **IDOVHS** y el subtítulo **idotiza**. Doble click en un fader lo devuelve a su valor inicial.

Para otra app: `@import 'brand/tokens.css'`, importar `IDO_COLORS`/`hexToRgb01` desde `brand/tokens`, y concatenar `brand/grade.glsl?raw` en el fragment shader. El control **INTENSIDAD DEL GRADE** del RACK 04 ajusta el mismo filtro en tiempo real. Ver `brand/README.md`.

## Notas de hardware

El preview se limita por defecto a 1280×720 (`VITE_MAX_VIEWPORT_WIDTH/HEIGHT`). Si la media de FPS cae por debajo de 55 durante 30 fotogramas, se reduce la resolución en un 15% (mínimo 320 px de ancho); si se mantiene por encima de 58.5 durante 180 fotogramas, se restaura progresivamente. La exportación hereda esa resolución; el render offline a resolución nativa sigue pendiente.
