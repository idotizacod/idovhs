# IDOTIZA — Sistema de marca

Proyecto **Idotiza**. DIY, hecho a mano, busca tu verdad, usa tu ingenio. Deep lore alquimista de Santiago de Chile en búsqueda de la YDL.

**Dirección artística:** punk, underground, fanzine, collage, post-punk, grunge 90s, horror punk, cómic underground, editorial retro y digital/cibernético 2000. Crudo, artesanal, rebelde, nostálgico, irónico, experimental.

Paquete **agnóstico de la app**: define la identidad visual pero no impone un título de aplicación. Cada proyecto consume estos archivos y decide su propio nombre.

## Instalación

Repo privado. Clónalo donde lo necesites:

```bash
git clone https://github.com/idotizacod/idotiza-brand.git brand
```

O agrégalo como submodule para recibir actualizaciones:

```bash
git submodule add https://github.com/idotizacod/idotiza-brand.git brand
```

Después de actualizar el paquete, sincroniza los consumidores con `git submodule update --remote brand`.

## Contenido

| Archivo | Uso |
| --- | --- |
| `tokens.css` | Variables CSS (`--ido-*`) para tema, tipografía y aliases. |
| `tokens.ts` | `BRAND_NAME`, `IDO_COLORS`, `hexToRgb01` e `IDO_GRADE_PALETTE` para TS/Canvas/WebGL. |
| `tokens.json` | Design tokens W3C para Style Dictionary o Figma Tokens. |
| `grade.glsl` | Chunk GLSL ES 3.00 con `idoBrandGrade()`, sin uniforms acoplados. |
| `logo.png` | Logotipo principal en PNG 720×720, derivado de `tv.jpeg`. |
| `sock.svg` | Sello histórico del módulo original. |
| `ICONOGRAFIA.md` | Registro formal de sellos e iconografía. |

## Paleta formal

| Token | Hex | Uso |
| --- | --- | --- |
| `blanco` | `#F5F5F5` | Fondo |
| `negro` | `#000000` | Letras y desarrollo |
| `rojo` | `#FF1E00` | Títulos y acentos |
| `celeste` | `#62F2F6` | Filtros |

## Tipografía

- **Máquina de escribir monospace** (`Special Elite`, fallback `Courier New` / `monospace`): **toda** la interfaz — títulos, párrafos, botones, etiquetas, lecturas técnicas y detalles.
- Ya no se usan `Permanent Marker` ni `JetBrains Mono`. Todos los aliases (`--ido-font-display`, `--ido-font-body`, `--ido-font-mono`, `--ido-font-hand`, `--ido-font-detail`) apuntan a la misma pila.

## Texturas

- Grano + VHS + compresión digital: capa `body::before` (SVG turbulence) y overlays del viewport.
- Papel de cuaderno: líneas horizontales + margen rojo en `body`.
- Papel de plástico: brillo diagonal suave sobre las superficies.

## Consumirlo

### CSS / HTML

```css
@import 'brand/tokens.css';
```

Usa `--ido-blanco`, `--ido-negro`, `--ido-rojo`, `--ido-celeste`, `--ido-font-typewriter`, `--ido-font-hand`.

### TypeScript / Canvas

```ts
import { IDO_COLORS, hexToRgb01 } from './brand/tokens';

ctx.fillStyle = IDO_COLORS.rojo;
const [r, g, b] = hexToRgb01(IDO_COLORS.celeste); // 0..1 para WebGL
```

### GLSL

```ts
import gradeChunk from './brand/grade.glsl?raw';

const fragment = `#version 300 es
precision highp float;
${gradeChunk}
// idoBrandGrade(color, sombra, medio, alto, intensidad)
`;
```

`grade.glsl` no declara uniforms: recibe la paleta por parámetro y funciona en cualquier motor GLSL ES 3.00.

### Logo

```html
<img src="brand/logo.png" alt="Idotiza" />
```

En Vite: `import logoUrl from './brand/logo.png?url'`. Reemplaza `logo.png` conservando el nombre para que todas las apps hereden el cambio.

### Otras apps sin TS

`tokens.json` usa formato W3C Design Tokens (referencias `{color.celeste}`), importable en Style Dictionary o Figma Tokens.

## Regla de oro

Ningún hex de la marca fuera de este paquete. Cambia un token y se propaga a CSS, TS, shaders y al sello en todas las apps.
