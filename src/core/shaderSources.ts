import gradeChunk from '../../brand/grade.glsl?raw';
import fullscreenVert from '../shaders/fullscreen.vert.glsl?raw';
import passthroughFrag from '../shaders/passthrough.frag.glsl?raw';
import digicamFrag from '../shaders/digicam.frag.glsl?raw';
import vhsFrag from '../shaders/vhs.frag.glsl?raw';
import compressionFrag from '../shaders/compression.frag.glsl?raw';
import brandFrag from '../shaders/brand.frag.glsl?raw';

/** Inserta el chunk de marca compartido justo después de la precisión del shader. */
export function withBrandChunk(source: string): string {
  const marker = 'precision highp float;';
  if (!source.includes(marker)) {
    return source;
  }
  return source.replace(marker, `${marker}\n${gradeChunk}`);
}

export const VERTEX_SOURCE = fullscreenVert;
export const PASSTHROUGH_SOURCE = passthroughFrag;
export const DIGICAM_SOURCE = digicamFrag;
export const VHS_SOURCE = vhsFrag;
export const COMPRESSION_SOURCE = compressionFrag;
export const BRAND_SOURCE = withBrandChunk(brandFrag);
