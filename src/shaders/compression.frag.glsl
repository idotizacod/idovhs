#version 300 es
precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_texture;
uniform float u_jpegQuality;        // [0.1-1]
uniform float u_blockSize;          // 4, 8 o 16
uniform int u_ditherType;           // 0 bayer4, 1 bayer8, 2 ruido
uniform float u_posterizationLevels;// [2-16]
uniform vec2 u_resolution;

const int BAYER4[16] = int[16](
   0,  8,  2, 10,
  12,  4, 14,  6,
   3, 11,  1,  9,
  15,  7, 13,  5
);

float bayer4Value(int x, int y) {
  return (float(BAYER4[(y & 3) * 4 + (x & 3)]) + 0.5) / 16.0;
}

float bayer8Value(int x, int y) {
  float low = float(BAYER4[(y & 3) * 4 + (x & 3)]);
  float high = float(BAYER4[((y >> 2) & 3) * 4 + ((x >> 2) & 3)]);
  return (low * 4.0 + high + 0.5) / 64.0;
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 pixel = v_texCoord * u_resolution;
  ivec2 cell = ivec2(floor(pixel));
  vec3 color = max(texture(u_texture, v_texCoord).rgb, vec3(0.0));

  // Macrobloques MPEG: muestreo forzado al centro de cada bloque.
  vec2 snappedUv = (floor(pixel / u_blockSize) + 0.5) * u_blockSize / u_resolution;
  vec3 blockColor = max(texture(u_texture, clamp(snappedUv, 0.0, 1.0)).rgb, vec3(0.0));
  float blockMix = (1.0 - u_jpegQuality) * 0.85;
  color = mix(color, blockColor, blockMix);

  // Cuantización tipo JPEG (aproximación por niveles).
  float qLevels = 2.0 + u_jpegQuality * 62.0;
  color = floor(color * qLevels + 0.5) / qLevels;

  // Dithering + posterización combinados.
  float threshold;
  if (u_ditherType == 0) {
    threshold = bayer4Value(cell.x, cell.y);
  } else if (u_ditherType == 1) {
    threshold = bayer8Value(cell.x, cell.y);
  } else {
    threshold = hash(pixel);
  }
  float steps = max(u_posterizationLevels - 1.0, 1.0);
  color = floor(color * steps + threshold) / steps;

  fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
