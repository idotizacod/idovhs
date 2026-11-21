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
uniform float u_chromaDelay;         // [0-1]
uniform float u_syncDrift;           // [0-1]
uniform float u_headSwitching;       // [0-1]
uniform float u_dropouts;            // [0-1]
uniform float u_tapeDamage;          // [0-1]
uniform vec2 u_resolution;
uniform vec2 u_opticalCenter;

float hash(float n) {
  return fract(sin(n * 127.1) * 43758.5453123);
}

float hash2(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float perlin1d(float x) {
  float i = floor(x);
  float f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(hash(i), hash(i + 1.0), f);
}

vec3 rgb2yiq(vec3 c) {
  return vec3(
    dot(c, vec3(0.299, 0.587, 0.114)),
    dot(c, vec3(0.596, -0.274, -0.322)),
    dot(c, vec3(0.211, -0.523, 0.312))
  );
}

vec3 yiq2rgb(vec3 c) {
  return vec3(
    c.x + 0.956 * c.y + 0.621 * c.z,
    c.x - 0.272 * c.y - 0.647 * c.z,
    c.x - 1.106 * c.y + 1.703 * c.z
  );
}

// Distorsión de barril/tubo CRT centrada en el optical center.
vec2 barrel(vec2 uv, float k) {
  vec2 centred = uv * 2.0 - 1.0;
  float r2 = dot(centred, centred);
  centred *= 1.0 + k * r2;
  return clamp(centred * 0.5 + 0.5, 0.0, 1.0);
}

vec2 sampleUv(vec2 uv) {
  return clamp(uv, 0.0, 1.0);
}

void main() {
  vec4 src = texture(u_texture, v_texCoord);
  float vhsFx = clamp(
    u_trackingJitter +
    abs(u_barrelDistortion) * 2.0 +
    u_magneticNoise +
    u_colorBleed +
    u_scanlineIntensity +
    u_chromaDelay +
    u_syncDrift +
    u_headSwitching +
    u_dropouts +
    u_tapeDamage,
    0.0,
    1.0
  );

  // Estado neutro: preservar imagen natural sin procesado VHS.
  if (vhsFx <= 0.0001) {
    fragColor = vec4(clamp(src.rgb, 0.0, 1.0), src.a);
    return;
  }

  vec2 uv = barrel(v_texCoord, u_barrelDistortion);
  float line = floor(uv.y * u_resolution.y);
  vec2 px = 1.0 / max(u_resolution, vec2(1.0));

  // 6) Inestabilidad temporal más coherente: bandas persistentes + skew mecánico.
  float driftBand = floor(uv.y * 20.0);
  float driftStep = floor(u_time * 1.8);
  float slowBand = mix(hash(driftBand + driftStep * 7.3), hash(driftBand + (driftStep + 1.0) * 7.3), fract(u_time * 1.8));
  float drift = (slowBand - 0.5) * 0.018;
  float jumpGate = step(0.965, hash(driftBand * 0.37 + floor(u_time * 1.1) * 3.7));
  float driftJump = jumpGate * (hash(driftBand + floor(u_time * 1.1) * 9.1) - 0.5) * 0.05;
  float bandPhase = fract(uv.y * 20.0) - 0.5;
  float driftSkew = bandPhase * (hash(driftBand + driftStep * 2.0) - 0.5) * 0.02;
  float driftOffset = (drift + driftJump + driftSkew) * u_syncDrift;

  // Jitter de tracking con componente por grupos de líneas (persistencia corta).
  float lineGroup = floor(line / 3.0);
  float smoothJitter = (perlin1d(line * 0.065 + u_time * 1.2) - 0.5) * u_trackingJitter * 0.02;
  float groupJitter = (hash(lineGroup + floor(u_time * 7.0) * 5.3) - 0.5) * u_trackingJitter * 0.01;
  float whiteJitter = (hash(line + u_time * 55.0) - 0.5) * u_trackingJitter * 0.004;

  // 4) Head switching más característico: banda inferior con borde irregular y ondulación.
  float hsBase = 0.86 - u_headSwitching * 0.05;
  float hsWobble = (perlin1d(uv.x * 18.0 + u_time * 5.0) - 0.5) * 0.012;
  float hsLineWobble = (hash(line + floor(u_time * 30.0)) - 0.5) * 0.003;
  float hsMask = smoothstep(hsBase + hsWobble, 0.997, uv.y + hsLineWobble);
  float hsEvent = step(0.955, hash(floor(u_time * 6.0)));
  float hsOffset = (hash(line + u_time * 42.0) - 0.5) * hsMask * (0.01 + hsEvent * 0.045) * u_headSwitching;
  float hsBend = (uv.y - hsBase) * (hash(floor(u_time * 3.0)) - 0.5) * hsMask * 0.03 * u_headSwitching;

  uv.x = clamp(uv.x + smoothJitter + groupJitter + whiteJitter + driftOffset + hsOffset + hsBend, 0.0, 1.0);

  // Pliegues / daño de cinta: distorsiones locales tipo arruga.
  vec3 tapeOverlay = vec3(0.0);
  float tapeMix = 0.0;
  if (u_tapeDamage > 0.001) {
    for (int i = 0; i < 2; i++) {
      float slot = floor(u_time * 0.7) + float(i) * 17.0;
      float enabled = step(1.0 - u_tapeDamage * 0.55, hash(slot + 3.1));
      float cy = hash(slot + 11.0);
      float cx = hash(slot + 19.0);
      float h = mix(0.04, 0.16, hash(slot + 23.0));
      float w = mix(0.08, 0.45, hash(slot + 29.0));
      float dy = abs(uv.y - cy);
      if (enabled > 0.5 && dy < h && abs(uv.x - cx) < w) {
        float edge = 1.0 - dy / h;
        float warp = (hash(slot + floor(uv.y * 120.0)) - 0.5) * 0.06 * edge * u_tapeDamage;
        uv.x = clamp(uv.x + warp, 0.0, 1.0);
        uv.y = clamp(uv.y + (hash(slot + 41.0) - 0.5) * 0.02 * edge * u_tapeDamage, 0.0, 1.0);
        vec2 ghostUv = sampleUv(uv + vec2(0.012 * edge * u_tapeDamage, 0.0));
        tapeOverlay += texture(u_texture, ghostUv).rgb * edge;
        tapeMix = max(tapeMix, edge * 0.35 * u_tapeDamage);
      }
    }
  }

  // 1) Ancho de banda limitado de croma + 5) luma más suave (look VHS).
  float lumaDelay = u_chromaDelay * 0.045;
  vec2 radial = uv - u_opticalCenter;
  vec2 chromaBaseUv = sampleUv(uv - vec2(lumaDelay, 0.0) + radial * (0.002 + u_colorBleed * 0.01));

  // Chroma blur horizontal (I/Q) con varios taps.
  float chromaBlurPx = mix(0.0, 6.0, clamp(u_colorBleed * 0.7 + u_chromaDelay * 0.5, 0.0, 1.0));
  vec2 chromaOff = vec2(px.x * chromaBlurPx, 0.0);
  vec3 yiqC = vec3(0.0);
  yiqC += rgb2yiq(texture(u_texture, sampleUv(chromaBaseUv - chromaOff * 1.6)).rgb) * 0.08;
  yiqC += rgb2yiq(texture(u_texture, sampleUv(chromaBaseUv - chromaOff)).rgb) * 0.17;
  yiqC += rgb2yiq(texture(u_texture, sampleUv(chromaBaseUv)).rgb) * 0.50;
  yiqC += rgb2yiq(texture(u_texture, sampleUv(chromaBaseUv + chromaOff)).rgb) * 0.17;
  yiqC += rgb2yiq(texture(u_texture, sampleUv(chromaBaseUv + chromaOff * 1.6)).rgb) * 0.08;

  // Luma con suavizado horizontal sutil (proporcional a intensidad VHS).
  float lumaTapL = rgb2yiq(texture(u_texture, sampleUv(uv - vec2(px.x * 1.2, 0.0))).rgb).x;
  float lumaTapC = rgb2yiq(texture(u_texture, uv).rgb).x;
  float lumaTapR = rgb2yiq(texture(u_texture, sampleUv(uv + vec2(px.x * 1.2, 0.0))).rgb).x;
  float lumaSoft = lumaTapC * 0.7 + (lumaTapL + lumaTapR) * 0.15;
  float luma = mix(lumaTapC, lumaSoft, 0.22 * vhsFx);

  // Inestabilidad de fase/croma leve.
  float chromaPhase = (hash(floor(u_time * 15.0) + line * 0.13) - 0.5) * 0.03 * (u_colorBleed + u_magneticNoise * 0.5);
  vec3 yiq = vec3(luma, yiqC.y + chromaPhase * 0.5, yiqC.z - chromaPhase);
  vec3 color = yiq2rgb(yiq);

  // Mezcla de daño de cinta (pliegues/doble imagen local).
  if (tapeMix > 0.0) {
    color = mix(color, tapeOverlay, clamp(tapeMix, 0.0, 0.7));
    color *= 1.0 - tapeMix * 0.22;
  }

  // 4) Head switching: ruido estructurado y cambio de nivel en la banda inferior.
  if (hsMask > 0.001) {
    float hsNoise = hash2(vec2(line, floor(u_time * 60.0))) - 0.5;
    float hsStripe = sin((uv.y * u_resolution.y + u_time * 25.0) * 6.2831) * 0.5 + 0.5;
    color += vec3(hsNoise * 0.14 + (hsStripe - 0.5) * 0.06) * hsMask * u_headSwitching;
    color *= 1.0 - hsMask * u_headSwitching * 0.08;
  }

  // 2) Ruido magnético separado luma/croma (más en sombras y en croma).
  float yNow = dot(clamp(color, 0.0, 1.0), vec3(0.299, 0.587, 0.114));
  float shadowBoost = 0.55 + (1.0 - yNow) * 0.85;
  vec3 nyiq = rgb2yiq(color);
  float nTime = floor(u_time * 60.0);
  float nY = hash2(floor(uv * u_resolution) + vec2(nTime, u_frame)) - 0.5;
  float nI = hash2(floor(uv * u_resolution * 0.75) + vec2(nTime + 17.0, u_frame)) - 0.5;
  float nQ = hash2(floor(uv * u_resolution * 0.75) + vec2(nTime + 43.0, u_frame + 3.0)) - 0.5;
  nyiq.x += nY * u_magneticNoise * 0.12;
  nyiq.y += nI * u_magneticNoise * 0.22 * shadowBoost;
  nyiq.z += nQ * u_magneticNoise * 0.22 * shadowBoost;

  // Bandas de RF: leve contaminación de luma/croma.
  float rfBand = step(0.985, hash(floor(uv.y * 46.0) + floor(u_time * 9.0)));
  nyiq.x += rfBand * u_magneticNoise * 0.08;
  nyiq.yz += (hash2(vec2(floor(uv.y * 46.0), floor(u_time * 9.0))) - 0.5) * rfBand * u_magneticNoise * 0.12;
  color = yiq2rgb(nyiq);

  // 3) Dropouts tipo raya horizontal con cola (forma VHS).
  if (u_dropouts > 0.001) {
    float dLine = floor(uv.y * u_resolution.y);
    float dTime = floor(u_time * 24.0);
    float dSeed = hash2(vec2(dLine, dTime));
    float dTrig = step(1.0 - u_dropouts * 0.16, dSeed);
    if (dTrig > 0.5) {
      float startX = hash2(vec2(dLine + 3.0, dTime * 1.3)) * 0.85;
      float len = mix(0.03, 0.45, hash2(vec2(dLine, dTime + 11.0))) * (0.4 + u_dropouts);
      if (uv.x >= startX && uv.x <= startX + len) {
        float t = (uv.x - startX) / max(len, 0.0001);
        float fade = 1.0 - smoothstep(0.0, 1.0, t);
        float edgeNoise = 0.85 + 0.3 * hash2(vec2(floor(uv.x * 160.0), dLine + dTime));
        float dropout = fade * edgeNoise;
        float polarity = step(0.5, hash2(vec2(dLine + 7.0, dTime)));
        vec3 dropColor = mix(vec3(0.03), vec3(0.97), polarity);
        dropColor += (hash2(vec2(uv.x * u_resolution.x * 0.3, dTime)) - 0.5) * 0.08;
        color = mix(color, dropColor, clamp(dropout * (0.45 + u_dropouts * 0.45), 0.0, 1.0));
      }
    }
  }

  // Entrelazado temporal: la paridad depende del fotograma F.
  float parity = mod(floor(uv.y * u_resolution.y) + u_frame, 2.0);
  float scanlines = 1.0 - parity * u_scanlineIntensity * 0.22;
  scanlines -= (sin(uv.y * u_resolution.y * 1.5) * 0.5 + 0.5) * u_scanlineIntensity * 0.05;
  color *= scanlines;

  // 7) Respuesta de cinta: rolloff suave, negros levantados y leve desaturación en daño.
  color = clamp(color, 0.0, 1.0);
  float lumaTone = dot(color, vec3(0.299, 0.587, 0.114));
  vec3 gradedColor = color / (color + vec3(0.22)) * 1.22; // soft knee / rolloff
  gradedColor = mix(vec3(0.012), gradedColor, 0.992); // leve black lift
  float wear = clamp(u_magneticNoise * 0.5 + u_tapeDamage * 0.5 + u_dropouts * 0.25, 0.0, 1.0);
  float sat = mix(1.0, 0.86, wear * (0.35 + (1.0 - lumaTone) * 0.25));
  float grey = dot(gradedColor, vec3(0.299, 0.587, 0.114));
  gradedColor = mix(vec3(grey), gradedColor, sat);
  color = mix(color, gradedColor, clamp(vhsFx, 0.0, 1.0));

  fragColor = vec4(clamp(color, 0.0, 1.0), src.a);
}
