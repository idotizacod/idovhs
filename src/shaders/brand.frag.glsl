#version 300 es
precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_texture;
uniform vec3 u_idoShadow;
uniform vec3 u_idoMid;
uniform vec3 u_idoHighlight;
uniform float u_idoGrade;
uniform float u_dirtAmount;
uniform float u_scratchesAmount;
uniform float u_dustAmount;
uniform float u_crtAmount;
uniform float u_crtCurvature;
uniform float u_crtScanlines;
uniform float u_crtMask;
uniform float u_crtVignette;
uniform float u_crtHalation;
uniform float u_crtConvergence;
uniform float u_crtCompensation;
uniform float u_time;
uniform vec2 u_resolution;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

vec2 crtCurve(vec2 uv, float k) {
  vec2 cc = uv * 2.0 - 1.0;
  float r2 = dot(cc, cc);
  cc *= 1.0 + k * r2 + k * 0.35 * r2 * r2;
  return cc * 0.5 + 0.5;
}

void main() {
  vec2 uv = v_texCoord;
  float crt = clamp(u_crtAmount, 0.0, 1.0);
  float curvature = clamp(u_crtCurvature, 0.0, 1.0);
  float scanlines = clamp(u_crtScanlines, 0.0, 1.0);
  float maskStrength = clamp(u_crtMask, 0.0, 1.0);
  float vignetteAmt = clamp(u_crtVignette, 0.0, 1.0);
  float halation = clamp(u_crtHalation, 0.0, 1.0);
  float convergence = clamp(u_crtConvergence, 0.0, 1.0);
  float compensation = clamp(u_crtCompensation, 0.0, 1.0);

  // Compensación de curvatura: zoom uniforme centrado (preserva proporción) para recortar bordes.
  float zoom = 1.0 + compensation * 0.6;
  vec2 zUv = (uv - 0.5) / zoom + 0.5;
  vec2 sampleUv = zUv;

  float curveAmt = crt * curvature;
  if (curveAmt > 0.001) {
    sampleUv = crtCurve(zUv, curveAmt * 0.18);
  }

  vec2 px = 1.0 / max(u_resolution, vec2(1.0));
  bool outside = sampleUv.x < 0.0 || sampleUv.x > 1.0 || sampleUv.y < 0.0 || sampleUv.y > 1.0;
  vec3 color = vec3(0.02);
  if (!outside) {
    vec2 baseUv = clamp(sampleUv, 0.0, 1.0);
    float convAmt = crt * convergence;
    if (convAmt > 0.001) {
      vec2 dir = (baseUv - 0.5);
      vec2 offset = dir * vec2(px.x * 10.0, px.y * 6.0) * convAmt;
      color.r = texture(u_texture, clamp(baseUv + offset, 0.0, 1.0)).r;
      color.g = texture(u_texture, baseUv).g;
      color.b = texture(u_texture, clamp(baseUv - offset, 0.0, 1.0)).b;
    } else {
      color = texture(u_texture, baseUv).rgb;
    }
  }

  // Halación/bloom leve estilo CRT.
  float halationAmt = crt * halation;
  if (halationAmt > 0.001 && !outside) {
    vec2 baseUv = clamp(sampleUv, 0.0, 1.0);
    vec3 glow = vec3(0.0);
    glow += texture(u_texture, clamp(baseUv + vec2(px.x, 0.0) * 2.0, 0.0, 1.0)).rgb;
    glow += texture(u_texture, clamp(baseUv - vec2(px.x, 0.0) * 2.0, 0.0, 1.0)).rgb;
    glow += texture(u_texture, clamp(baseUv + vec2(0.0, px.y) * 2.0, 0.0, 1.0)).rgb;
    glow += texture(u_texture, clamp(baseUv - vec2(0.0, px.y) * 2.0, 0.0, 1.0)).rgb;
    glow *= 0.25;
    color += max(glow - 0.55, vec3(0.0)) * halationAmt * 0.35;
  }

  color = idoBrandGrade(color, u_idoShadow, u_idoMid, u_idoHighlight, u_idoGrade);

  // Suciedad: manchas y velos suaves.
  if (u_dirtAmount > 0.001) {
    float n1 = noise(sampleUv * 3.5 + vec2(1.7, 4.2));
    float n2 = noise(sampleUv * 11.0 - vec2(3.1, 0.7));
    float blotch = smoothstep(0.55, 0.92, n1) * (0.5 + 0.5 * n2);
    float smudge = smoothstep(0.65, 1.0, noise(sampleUv * vec2(18.0, 4.0) + vec2(0.0, 2.3)));
    float dirt = clamp(blotch * 0.7 + smudge * 0.3, 0.0, 1.0);
    color *= 1.0 - dirt * u_dirtAmount * 0.45;
    color += vec3(0.08, 0.07, 0.06) * dirt * u_dirtAmount * 0.08;
  }

  // Rayones: líneas finas verticales con movimiento temporal.
  if (u_scratchesAmount > 0.001) {
    float scratch = 0.0;
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      float t = floor(u_time * (6.0 + fi * 2.0));
      float x = hash(vec2(t, fi * 13.1));
      float w = mix(0.0008, 0.0022, hash(vec2(t, fi * 7.7)));
      float line = smoothstep(w, 0.0, abs(sampleUv.x - x));
      float seg = step(0.35, hash(vec2(floor(sampleUv.y * 12.0), t + fi)));
      scratch = max(scratch, line * seg * (0.4 + 0.6 * hash(vec2(t, fi + 2.0))));
    }
    float darkScratch = scratch * step(0.5, hash(vec2(floor(u_time * 5.0), 9.2)));
    color += vec3(1.0) * scratch * u_scratchesAmount * 0.18;
    color -= vec3(0.25) * darkScratch * u_scratchesAmount * 0.12;
  }

  // Polvo: motas pequeñas intermitentes.
  if (u_dustAmount > 0.001) {
    vec2 grid = floor(sampleUv * u_resolution * 0.35);
    float t = floor(u_time * 18.0);
    float d = hash(grid + vec2(t, 5.3));
    float speck = step(1.0 - u_dustAmount * 0.02, d);
    float tone = step(0.5, hash(grid + vec2(t, 17.9)));
    float dustColor = mix(-0.35, 0.45, tone);
    color += vec3(dustColor) * speck * u_dustAmount;
  }

  // CRT: scanlines, máscara de fósforo, viñeta y bordes (controles independientes).
  float scanAmt = crt * scanlines;
  float maskAmt = crt * maskStrength;
  if (scanAmt > 0.001 || maskAmt > 0.001) {
    float scan = 0.92 + 0.08 * sin((sampleUv.y * u_resolution.y + u_time * 12.0) * 3.14159);
    float mask = 0.94 + 0.06 * sin(sampleUv.x * u_resolution.x * 1.2);
    float scanFactor = mix(1.0, scan, scanAmt);
    float maskFactor = mix(1.0, mask, maskAmt);
    color *= scanFactor * maskFactor;
  }
  float vignAmt = crt * vignetteAmt;
  if (vignAmt > 0.001) {
    vec2 d = abs(uv - 0.5) * 2.0;
    float vign = 1.0 - smoothstep(0.72, 1.25, dot(d, d));
    color *= mix(1.0, vign, vignAmt * 0.45);
  }
  if (outside) {
    color = vec3(0.01);
  }

  // Grano sutil para unificar imagen y UI bajo la misma textura de marca.
  float grain = hash(gl_FragCoord.xy + vec2(floor(u_time * 60.0), 0.0)) - 0.5;
  color += grain * u_idoGrade * 0.025;

  fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
