#version 300 es
precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_texture;
uniform sampler2D u_history;
uniform float u_amount;          // [0-1]
uniform float u_motionThreshold; // [0-1]
uniform float u_blockSize;       // 4, 8, 16
uniform float u_feedback;        // [0-1]
uniform float u_time;
uniform vec2 u_resolution;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float luma(vec3 c) {
  return dot(c, vec3(0.299, 0.587, 0.114));
}

void main() {
  vec2 uv = clamp(v_texCoord, 0.0, 1.0);
  vec3 cur = texture(u_texture, uv).rgb;

  if (u_amount <= 0.001) {
    fragColor = vec4(cur, 1.0);
    return;
  }

  float bsz = max(u_blockSize, 4.0);
  vec2 blockId = floor(uv * u_resolution / bsz);
  vec2 blockUv = (blockId + 0.5) * bsz / u_resolution;
  blockUv = clamp(blockUv, 0.0, 1.0);

  vec3 curBlock = texture(u_texture, blockUv).rgb;
  vec3 histBlock = texture(u_history, blockUv).rgb;

  // Diferencia de movimiento aproximada por bloque.
  float motion = abs(luma(curBlock) - luma(histBlock));
  motion = max(motion, distance(curBlock, histBlock) * 0.5);

  // Umbral: valores altos de threshold => más fácil activar el mosh (menos movimiento requerido).
  float t = mix(0.02, 0.45, clamp(u_motionThreshold, 0.0, 1.0));
  float moshMask = 1.0 - smoothstep(t * 0.35, t, motion);

  // Variación temporal por bloque para que no sea estático.
  float tSlot = floor(u_time * 12.0);
  float rnd = hash(blockId + vec2(tSlot, 7.3));
  float chaos = hash(blockId + vec2(tSlot * 0.37, 19.1));

  // Desplazamiento de bloque desde historial (vectores "simulados").
  vec2 dir = vec2(hash(blockId + vec2(tSlot, 3.1)) - 0.5, hash(blockId + vec2(tSlot, 11.7)) - 0.5);
  dir *= (0.15 + 0.85 * chaos) * u_amount * 0.12;
  vec2 histUv = clamp(uv + dir * (0.5 + rnd), 0.0, 1.0);
  vec3 histSample = texture(u_history, histUv).rgb;

  // En zonas de poco movimiento, prioriza historial (smear/persistencia de macro-bloques).
  float keep = moshMask * mix(0.35, 0.98, u_feedback) * u_amount;

  // Rupturas aleatorias tipo P-frame corrupto dentro de bloques seleccionados.
  float glitch = step(1.0 - u_amount * 0.35, rnd) * moshMask;
  if (glitch > 0.5) {
    vec2 q = floor(histUv * u_resolution / bsz) * bsz / u_resolution;
    histSample = texture(u_history, clamp(q + 0.5 / u_resolution, 0.0, 1.0)).rgb;
    keep = max(keep, u_amount * (0.6 + 0.4 * u_feedback));
  }

  vec3 moshed = mix(cur, histSample, clamp(keep, 0.0, 1.0));

  // Pequeña contaminación cromática en bordes de bloque para look de compresión rota.
  vec2 blockFract = fract(uv * u_resolution / bsz);
  float edge = step(blockFract.x, 0.08) + step(0.92, blockFract.x) + step(blockFract.y, 0.08) + step(0.92, blockFract.y);
  if (edge > 0.0 && keep > 0.05) {
    float shift = (rnd - 0.5) * 0.004 * u_amount;
    vec3 cR = texture(u_history, clamp(histUv + vec2(shift, 0.0), 0.0, 1.0)).rgb;
    vec3 cB = texture(u_history, clamp(histUv - vec2(shift, 0.0), 0.0, 1.0)).rgb;
    moshed = mix(moshed, vec3(cR.r, moshed.g, cB.b), 0.25 * keep);
  }

  fragColor = vec4(clamp(moshed, 0.0, 1.0), 1.0);
}