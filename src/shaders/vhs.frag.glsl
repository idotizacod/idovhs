#version 300 es
precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_texture;
uniform float u_time;
uniform float u_frame;
uniform float u_trackingJitter;      // [0-1]
uniform float u_barrelDistortion;    // [-0.5, 0.5]
uniform float u_magneticNoise;       // [0-1]
uniform float u_colorBleed;          // [0-1]
uniform float u_scanlineIntensity;   // [0-1]
uniform vec2 u_resolution;
uniform vec2 u_opticalCenter;

float hash(float n) {
  return fract(sin(n * 127.1) * 43758.5453123);
}

float perlin1d(float x) {
  float i = floor(x);
  float f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(hash(i), hash(i + 1.0), f);
}

// Distorsión de barril/tubo CRT centrada en el optical center.
vec2 barrel(vec2 uv, float k) {
  vec2 centred = uv * 2.0 - 1.0;
  float r2 = dot(centred, centred);
  centred *= 1.0 + k * r2;
  return clamp(centred * 0.5 + 0.5, 0.0, 1.0);
}

void main() {
  vec2 uv = barrel(v_texCoord, u_barrelDistortion);

  // Jitter de tracking: Perlin 1D por línea + ruido blanco de alta frecuencia.
  float line = floor(uv.y * u_resolution.y);
  float smoothJitter = (perlin1d(line * 0.07 + u_time * 1.6) - 0.5) * u_trackingJitter * 0.022;
  float whiteJitter = (hash(line + u_time * 60.0) - 0.5) * u_trackingJitter * 0.006;
  float headSwitch = step(0.975, hash(floor(u_time * 6.0))) * step(0.82, uv.y) * u_trackingJitter * 0.03;
  uv.x = clamp(uv.x + smoothJitter + whiteJitter + headSwitch, 0.0, 1.0);

  // Aberración cromática radial + color bleed horizontal (RF).
  vec2 radial = uv - u_opticalCenter;
  float kChroma = 0.004 + u_colorBleed * 0.014;
  float bleedOffset = u_colorBleed * 0.005;
  float r = texture(u_texture, clamp(uv + radial * kChroma + vec2(bleedOffset, 0.0), 0.0, 1.0)).r;
  float g = texture(u_texture, uv).g;
  float b = texture(u_texture, clamp(uv - radial * kChroma - vec2(bleedOffset, 0.0), 0.0, 1.0)).b;
  vec3 color = vec3(r, g, b);

  // Ruido magnético + bandas de RF.
  float grain = (hash(dot(floor(uv * u_resolution), vec2(1.0, 57.0)) + u_time * 97.0) - 0.5);
  color += grain * u_magneticNoise * 0.3;
  float band = step(0.985, hash(floor(uv.y * 42.0) + floor(u_time * 8.0)));
  color += band * u_magneticNoise * 0.12;

  // Entrelazado temporal: la paridad depende del fotograma F.
  float parity = mod(floor(uv.y * u_resolution.y) + u_frame, 2.0);
  float scanlines = 1.0 - parity * u_scanlineIntensity * 0.22;
  scanlines -= (sin(uv.y * u_resolution.y * 1.5) * 0.5 + 0.5) * u_scanlineIntensity * 0.05;
  color *= scanlines;

  fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
