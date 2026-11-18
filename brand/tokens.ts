/** IDOTIZA — fuente única de la paleta para TS, Canvas y WebGL (Módulo 4.1). */
export const BRAND_NAME = 'Idotiza';
export const APP_TITLE = 'IDOVHS';

export const IDO_COLORS = {
  blanco: '#f5f5f5',
  negro: '#000000',
  rojo: '#ff1e00',
  celeste: '#62f2f6',
} as const;

export type IdoColorKey = keyof typeof IDO_COLORS;
export type Rgb01 = readonly [number, number, number];

/** Convierte #rrggbb a componentes [0-1] listas para uniforms GLSL. */
export function hexToRgb01(hex: string): Rgb01 {
  const match = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (match === null) {
    throw new Error(`Color hexadecimal inválido: ${hex}`);
  }
  const value = Number.parseInt(match[1], 16);
  return [
    ((value >> 16) & 0xff) / 255,
    ((value >> 8) & 0xff) / 255,
    (value & 0xff) / 255,
  ];
}

/** Tríada del filtro: sombra negra, medio celeste gastado, alto blanco. */
export const IDO_GRADE_PALETTE = {
  shadow: IDO_COLORS.negro,
  mid: IDO_COLORS.celeste,
  highlight: IDO_COLORS.blanco,
} as const;
