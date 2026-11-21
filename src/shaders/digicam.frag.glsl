#version 300 es
precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_texture;
uniform float u_isoGain;          // ISO normalizado [0-1]
uniform float u_flashThreshold;   // [0-1]
uniform float u_flashBloomRadius; // [1-16] píxeles
uniform int u_sensorProfile;      // 0 Sony CCD, 1 CMOS, 2 lofi CCD
uniform float u_chromaAberration; // [0-1]
uniform float u_lumaGrain;        // [0-1]
uniform float u_time;
uniform vec2 u_resolution;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Rolloff CCD: x*(1+k)/(x+k) satura suavemente y conserva el blanco.
vec3 sensorRolloff(vec3 x, float knee) {
  x = max(x, vec3(0.0));
  return (x * (1.0 + knee)) / (x + knee);
}

void main() {
  vec4 texel = texture(u_texture, v_texCoord);
  vec3 base = clamp(texel.rgb, 0.0, 1.0);

  // Estado neutro: preservar imagen natural sin perfil/tono de sensor.
  bool neutral =
    u_isoGain <= 0.0001 &&
    u_flashThreshold >= 0.999 &&
    u_chromaAberration <= 0.0001 &&
    u_lumaGrain <= 0.0001;
  if (neutral) {
    fragColor = vec4(base, texel.a);
    return;
  }

  vec2 center = vec2(0.5);
  vec2 caDir = v_texCoord - center;
  float caAmount = u_chromaAberration * 0.018;
  vec2 uvR = clamp(v_texCoord + caDir * caAmount, 0.0, 1.0);
  vec2 uvB = clamp(v_texCoord - caDir * caAmount, 0.0, 1.0);

  vec3 sampleR = max(texture(u_texture, uvR).rgb, vec3(0.0));
  vec3 sampleB = max(texture(u_texture, uvB).rgb, vec3(0.0));
  vec3 color = base;
  color = vec3(sampleR.r, texel.g, sampleB.b);

  // Ganancia ISO + ruido de sensor aproximando Poisson con ruido dependiente de señal.
  float gain = 1.0 + u_isoGain * 3.0;
  color *= gain;
  float shot = (hash(gl_FragCoord.xy + floor(u_time * 24.0)) - 0.5);
  color += shot * u_isoGain * (0.06 + 0.12 * sqrt(max(color.r, 0.0)));

  if (u_sensorProfile == 0) {
    color = sensorRolloff(pow(color, vec3(1.12)), 0.28);
    color *= vec3(1.0, 0.97, 0.94);
  } else if (u_sensorProfile == 1) {
    color = sensorRolloff(pow(color, vec3(0.95)), 0.48);
    color *= vec3(0.96, 1.0, 0.99);
  } else {
    color = sensorRolloff(pow(color, vec3(0.88)), 0.20);
    color *= vec3(1.08, 0.92, 1.04);
  }

  // Flash digital: overflow aditivo hacia vecinos mediante 8 taps radiales.
  float overflow = 0.0;
  vec2 px = 1.0 / u_resolution;
  for (int i = 0; i < 8; i++) {
    float angle = float(i) * 0.78539816;
    vec2 offset = vec2(cos(angle), sin(angle)) * u_flashBloomRadius * px;
    vec3 neighbour = max(texture(u_texture, v_texCoord + offset).rgb, vec3(0.0));
    float lum = dot(neighbour, vec3(0.299, 0.587, 0.114)) * gain;
    overflow += max(lum - u_flashThreshold, 0.0);
  }
  color += (overflow / 8.0) * 0.4;

  float luminance = dot(color, vec3(0.299, 0.587, 0.114));
  if (luminance > u_flashThreshold) {
    float clip = clamp((luminance - u_flashThreshold) / max(1.0 - u_flashThreshold, 0.001), 0.0, 1.0);
    color = mix(color, vec3(1.0), clip);
  }

  // Grano dependiente de luminancia: más presente en sombras y medios tonos.
  float grainLuma = dot(color, vec3(0.299, 0.587, 0.114));
  float grainWeight = clamp((1.0 - grainLuma) * 0.8 + 4.0 * grainLuma * (1.0 - grainLuma) * 0.6, 0.0, 1.25);
  float fineGrain = hash(gl_FragCoord.xy * 0.73 + floor(u_time * 60.0)) - 0.5;
  color += fineGrain * u_lumaGrain * 0.18 * grainWeight;

  fragColor = vec4(clamp(color, 0.0, 1.0), texel.a);
}
