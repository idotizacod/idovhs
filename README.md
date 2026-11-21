# IDOVHS — SASED Core

Motor multimedia retro en tiempo real basado en **TypeScript estricto + WebGL 2.0**. Emula sensores CCD digicam, artefactos de cinta VHS y compresión/dithering agresivo mediante una cascada de fragment shaders con FBOs en ping-pong.

## Estado del MVP

Incluido:

- Pipeline GPU de 6 pasos (Ajustes de imagen → Óptica → VHS → Acabado/CRT y superficie → Compresión digital → Datamosh simulado) + pass final a pantalla, con edición base al inicio y degradación ordenada de analógico a digital.
- Fuentes: imagen (**JPG/PNG**), vídeo (**MP4**), cámara web y patrón procedural.
- Exportación: **PNG** del fotograma actual y **MP4** del viewport o del vídeo cargado (WebM como fallback de navegador).
- Consola de hardware con seis racks: ajustes base de imagen y, a continuación, cadena de degradación ordenada de analógico a digital (Óptica/Sensor, VHS, Acabado/CRT/Superficie, Compresión, Datamosh simulado), teclado accesible y layout responsive.
- Sistema de marca reutilizable en `brand/`: paquete agnóstico (tokens CSS/TS/JSON + chunk GLSL + assets), sincronizable como fuente única.
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

Al cargar un vídeo de archivo, el preview reproduce en bucle los **primeros 10 segundos** (o la duración total si es menor) para evaluar el efecto rápidamente. Al exportar ese vídeo, se graba automáticamente la **duración completa del original** intentando conservar el formato (MP4). Para cámara, imagen o patrón, la exportación sigue siendo manual en tiempo real. No incluye audio (`captureStream()` del canvas solo entrega vídeo) y usa la resolución adaptativa del preview.

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
  → FBO A: imageAdjust.frag.glsl (brillo, contraste, saturación, curva de blancos, HSL, nitidez)
  → FBO B: digicam.frag.glsl   (ISO, rolloff CCD, flash/bloom, óptica/sensor)
  → FBO A: vhs.frag.glsl       (degradación analógica de cinta/señal)
  → FBO B: brand.frag.glsl + brand/grade.glsl (acabado CRT/superficie analógica y marca)
  → FBO A: compression.frag.glsl (compresión y artefactos digitales)
  → FBO B: datamosh.frag.glsl  (mosh simulado digital/temporal con historial de frame)
  → Historial persistente (copia del frame final para el siguiente ciclo)
  → Framebuffer por defecto (passthrough)
```

Cada pass es un `ShaderProgram` con uniforms inyectados desde los contratos de datos (`src/types.ts`). `RenderPipeline` posee dos texturas/FBOs RGBA8 en ping-pong para la cadena y una textura/FBO adicional persistente para el historial temporal, sin round-trips CPU↔GPU.

### Estructura

| Ruta | Responsabilidad |
| --- | --- |
| `src/core/RenderPipeline.ts` | VAO del quad, FBOs ping-pong, historial temporal, resize, renderQuad, dispose |
| `src/core/ShaderProgram.ts` | Compilación GLSL, caché de uniforms, enlace de texturas |
| `src/core/MediaSource.ts` | Ingesta de imagen/vídeo/cámara/patrón y upload a textura |
| `src/core/mediaFormats.ts` | Whitelist de entrada y selección de códec de salida |
| `src/core/Engine.ts` | Bucle rAF, máquina de estados, cascada de shaders, historial para datamosh, context loss y exportación PNG/MP4 |
| `src/core/uniforms.ts` | Mapeo de parámetros TS → uniforms GLSL |
| `src/core/validators.ts` | Normalización y límites de parámetros |
| `src/core/adaptiveResolution.ts` | Histéresis FPS → resolución de preview |
| `src/shaders/*.glsl` | Fragment/vertex shaders GLSL ES 3.00 (incluye `datamosh.frag.glsl`) |
| `src/core/shaderSources.ts` | Composición/importación de shaders de la cadena |
| `src/config.ts` | Configuración de runtime (`APP_TITLE`, viewport, flags) y parámetros por defecto |
| `src/ui/controls.ts` | Construcción de los racks y controles |
| `brand/` | Paquete de marca agnóstico: tokens CSS/TS/JSON, `grade.glsl`, assets (`logo.png`, `sock.svg`) y metadatos (`package.json`) |
| `brand/tokens.css` / `tokens.ts` / `tokens.json` | Paleta Idotiza, fuente única para CSS/TS/otras apps |
| `src/styles.css` | Sistema de diseño y layout de consola |

## Parámetros

Ver `src/types.ts` para los contratos completos (`ImageAdjustParams`, `DigicamParams`, `VhsParams`, `CompressionParams`, `BrandParams`, `DatamoshParams`, `EngineState`). Rangos:

- ajustes de imagen: brillo −1–1 · contraste −1–1 · saturación −1–1 · HSL por color (saturación) rojos/naranjas/amarillos/verdes/cianes/azules/violetas/magentas −1–1 · afilar 0–1
- ISO: 100–6400 · flash: 0–1 · bloom: 1–16 · aberración cromática: 0–1 · grano por luma: 0–1
- tracking: 0–1 · barril: −0.5–0.5 · ruido magnético: 0–1 · color bleed: 0–1 · scanlines: 0–1 · chroma delay: 0–1 · sync drift: 0–1 · head switching: 0–1 · dropouts: 0–1 · daño de cinta: 0–1
- JPEG: 0.1–1 · bloque: 4/8/16 · niveles de posterización: 2–16 · corrupción de bloques: 0–1 · desplazamiento de bloques: 0–1 · dither: bayer 4×4 / 8×8 / ruido
- acabado: grade 0–1 · CRT master 0–1 · curvatura CRT 0–1 · compensación curvatura CRT 0–1 · scanlines CRT 0–1 · máscara/fósforo 0–1 · viñeta CRT 0–1 · halación CRT 0–1 · convergencia RGB 0–1 · suciedad 0–1 · rayones 0–1 · polvo 0–1
- datamosh (simulado): intensidad 0–1 · umbral de movimiento 0–1 · bloque 4/8/16 · feedback temporal 0–1

## Idotiza (Módulo 4.1)

Identidad DIY / fanzine / post-punk con deep lore alquimista santiaguino en búsqueda de la YDL. Paleta, tipografías, texturas y sello viven **solo** en `brand/`:

| Token | Hex | Uso |
| --- | --- | --- |
| `blanco` | `#F5F5F5` | Fondo |
| `negro` | `#000000` | Letras y desarrollo |
| `rojo` | `#FF1E00` | Títulos y acentos |
| `celeste` | `#62F2F6` | Filtros |

Tipografía: máquina de escribir monospace (`Special Elite`, fallback `Courier New`/`monospace`) en **toda** la interfaz — títulos, párrafos, botones, etiquetas, lecturas y detalles. Texturas: grano, VHS, compresión digital, papel de cuaderno y papel de plástico. Logo: `brand/logo.png` (PNG transparente; cabecera y favicon). El paquete `brand/` es agnóstico: el título de la app (**IDOVHS**, subtítulo **idotiza**) se define en la app (`index.html`, `src/config.ts`), no en los tokens de marca. Doble click en un fader lo devuelve a su valor inicial.

Para otra app: `@import 'brand/tokens.css'`, importar `IDO_COLORS`/`hexToRgb01` (y `IDO_GRADE_PALETTE` si aplica) desde `brand/tokens`, y concatenar `brand/grade.glsl?raw` en el fragment shader. El control **INTENSIDAD DEL GRADE** del RACK 04 ajusta el mismo filtro en tiempo real. `brand/package.json` expone exports para consumo como paquete/submódulo. Ver `brand/README.md`.

## Notas de hardware

El preview se limita por defecto a 1280×720 (`VITE_MAX_VIEWPORT_WIDTH/HEIGHT`). Si la media de FPS cae por debajo de 55 durante 30 fotogramas, se reduce la resolución en un 15% (mínimo 320 px de ancho); si se mantiene por encima de 58.5 durante 180 fotogramas, se restaura progresivamente. La exportación hereda esa resolución; el render offline a resolución nativa sigue pendiente.
