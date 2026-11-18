# IDOTIZA — Sistema de marca (Módulo 4.1)

Proyecto **Idotiza**. DIY, hecho a mano, busca tu verdad, usa tu ingenio. Deep lore alquimista de Santiago de Chile en búsqueda de la YDL.

**Dirección artística:** punk, underground, fanzine, collage, post-punk, grunge 90s, horror punk, cómic underground, editorial retro y digital/cibernético 2000. Crudo, artesanal, rebelde, nostálgico, irónico, experimental.

## Paleta formal

| Token | Hex | Uso |
| --- | --- | --- |
| `blanco` | `#F5F5F5` | Fondo |
| `negro` | `#000000` | Letras y desarrollo |
| `rojo` | `#FF1E00` | Títulos y acentos |
| `celeste` | `#62F2F6` | Filtros |

## Tipografía

- **Máquina de escribir** (`Special Elite`): títulos y párrafos.
- **Mano alzada** (`Permanent Marker`): detalles.
- **JetBrains Mono**: lecturas técnicas / datos.

## Texturas

- Grano + VHS + compresión digital: capa `body::before` (SVG turbulence) y overlays del viewport.
- Papel de cuaderno: líneas horizontales + margen rojo en `body`.
- Papel de plástico: brillo diagonal suave sobre las superficies.

## Sellos e iconografía

`brand/logo.png` es el **logotipo principal** (archivo del usuario, transparente). Alimenta cabecera y favicon. `brand/sock.svg` queda como sello histórico del módulo anterior. Reemplaza `logo.png` conservando el nombre para que todas las apps hereden el cambio. Registro detallado en `brand/ICONOGRAFIA.md`.

## Consumirlo

### CSS / HTML

```css
@import 'brand/tokens.css';
```

Usa `--ido-blanco`, `--ido-negro`, `--ido-rojo`, `--ido-celeste`, `--ido-font-typewriter`, `--ido-font-hand`.

### TypeScript / Canvas

```ts
import { IDO_COLORS, hexToRgb01 } from 'brand/tokens';

ctx.fillStyle = IDO_COLORS.rojo;
const [r, g, b] = hexToRgb01(IDO_COLORS.celeste); // 0..1 para WebGL
```

### GLSL

```ts
import gradeChunk from 'brand/grade.glsl?raw';

const fragment = `#version 300 es
precision highp float;
${gradeChunk}
// idoBrandGrade(color, sombra, medio, alto, intensidad)
`;
```

`grade.glsl` no declara uniforms: recibe la paleta por parámetro y funciona en cualquier motor GLSL ES 3.00.

### Otras apps sin TS

`tokens.json` usa formato W3C Design Tokens (referencias `{color.celeste}`), importable en Style Dictionary o Figma Tokens.

## Regla de oro

Ningún hex de la marca fuera de esta carpeta. Cambia un token y se propaga a CSS, TS, shaders y al sello en todas las apps.
