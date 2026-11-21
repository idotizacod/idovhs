#version 300 es
precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_texture;
uniform float u_brightness;    // [-1, 1]
uniform float u_contrast;      // [-1, 1]
uniform float u_saturation;    // [-1, 1] ajuste global (0 neutro)
uniform float u_hslSatRed;     // [-1, 1]
uniform float u_hslSatOrange;  // [-1, 1]
uniform float u_hslSatYellow;  // [-1, 1]
uniform float u_hslSatGreen;   // [-1, 1]
uniform float u_hslSatCyan;    // [-1, 1]
uniform float u_hslSatBlue;    // [-1, 1]
uniform float u_hslSatViolet;  // [-1, 1]
uniform float u_hslSatMagenta; // [-1, 1]
uniform float u_sharpen;       // [0, 1]
uniform vec2 u_resolution;

float luma(vec3 c) {
  return dot(c, vec3(0.299, 0.587, 0.114));
}

vec3 rgb2hsl(vec3 c) {
  float maxc = max(c.r, max(c.g, c.b));
  float minc = min(c.r, min(c.g, c.b));
  float d = maxc - minc;
  float h = 0.0;
  if (d > 1e-5) {
    if (maxc == c.r) {
      h = mod((c.g - c.b) / d, 6.0);
    } else if (maxc == c.g) {
      h = (c.b - c.r) / d + 2.0;
    } else {
      h = (c.r - c.g) / d + 4.0;
    }
    h /= 6.0;
    if (h < 0.0) h += 1.0;
  }
  float l = (maxc + minc) * 0.5;
  float s = 0.0;
  if (d > 1e-5) {
    s = d / (1.0 - abs(2.0 * l - 1.0));
  }
  return vec3(h, clamp(s, 0.0, 1.0), l);
}

float hue2rgb(float p, float q, float t) {
  if (t < 0.0) t += 1.0;
  if (t > 1.0) t -= 1.0;
  if (t < 1.0 / 6.0) return p + (q - p) * 6.0 * t;
  if (t < 1.0 / 2.0) return q;
  if (t < 2.0 / 3.0) return p + (q - p) * (2.0 / 3.0 - t) * 6.0;
  return p;
}

vec3 hsl2rgb(vec3 hsl) {
  float h = hsl.x;
  float s = clamp(hsl.y, 0.0, 1.0);
  float l = clamp(hsl.z, 0.0, 1.0);
  if (s <= 1e-5) {
    return vec3(l);
  }
  float q = l < 0.5 ? l * (1.0 + s) : l + s - l * s;
  float p = 2.0 * l - q;
  float r = hue2rgb(p, q, h + 1.0 / 3.0);
  float g = hue2rgb(p, q, h);
  float b = hue2rgb(p, q, h - 1.0 / 3.0);
  return vec3(r, g, b);
}

float hueDist(float a, float b) {
  float d = abs(a - b);
  return min(d, 1.0 - d);
}

float hueWeight(float h, float center, float width) {
  return 1.0 - smoothstep(width * 0.5, width, hueDist(h, center));
}

void main() {
  vec2 uv = clamp(v_texCoord, 0.0, 1.0);
  vec2 px = 1.0 / max(u_resolution, vec2(1.0));
  vec4 src = texture(u_texture, uv);
  vec3 color = clamp(src.rgb, 0.0, 1.0);

  bool neutral =
    abs(u_brightness) <= 0.0001 &&
    abs(u_contrast) <= 0.0001 &&
    abs(u_saturation) <= 0.0001 &&
    abs(u_hslSatRed) <= 0.0001 &&
    abs(u_hslSatOrange) <= 0.0001 &&
    abs(u_hslSatYellow) <= 0.0001 &&
    abs(u_hslSatGreen) <= 0.0001 &&
    abs(u_hslSatCyan) <= 0.0001 &&
    abs(u_hslSatBlue) <= 0.0001 &&
    abs(u_hslSatViolet) <= 0.0001 &&
    abs(u_hslSatMagenta) <= 0.0001 &&
    u_sharpen <= 0.0001;
  if (neutral) {
    fragColor = vec4(color, src.a);
    return;
  }

  // Brillo y contraste.
  float contrastFactor = 1.0 + u_contrast;
  color = (color - 0.5) * contrastFactor + 0.5;
  color += u_brightness;

  // Saturación global.
  if (abs(u_saturation) > 0.0001) {
    float y = luma(color);
    float satFactor = 1.0 + u_saturation;
    color = mix(vec3(y), color, satFactor);
  }

  // HSL por colores (solo saturación): rojo, naranja, amarillo, verde, cian, azul, violeta, magenta.
  vec3 hsl = rgb2hsl(clamp(color, 0.0, 1.0));
  float w = 0.14;
  float satAdjust = 0.0;
  satAdjust += hueWeight(hsl.x, 0.0 / 360.0, w) * u_hslSatRed;
  satAdjust += hueWeight(hsl.x, 30.0 / 360.0, w) * u_hslSatOrange;
  satAdjust += hueWeight(hsl.x, 60.0 / 360.0, w) * u_hslSatYellow;
  satAdjust += hueWeight(hsl.x, 120.0 / 360.0, w) * u_hslSatGreen;
  satAdjust += hueWeight(hsl.x, 180.0 / 360.0, w) * u_hslSatCyan;
  satAdjust += hueWeight(hsl.x, 240.0 / 360.0, w) * u_hslSatBlue;
  satAdjust += hueWeight(hsl.x, 270.0 / 360.0, w) * u_hslSatViolet;
  satAdjust += hueWeight(hsl.x, 300.0 / 360.0, w) * u_hslSatMagenta;
  if (abs(satAdjust) > 0.0001) {
    hsl.y = clamp(hsl.y * (1.0 + satAdjust), 0.0, 1.0);
    color = hsl2rgb(hsl);
  }

  // Afilar imagen (unsharp mask agresivo).
  if (u_sharpen > 0.0001) {
    vec3 baseBlur =
      texture(u_texture, clamp(uv + vec2(px.x, 0.0), 0.0, 1.0)).rgb +
      texture(u_texture, clamp(uv - vec2(px.x, 0.0), 0.0, 1.0)).rgb +
      texture(u_texture, clamp(uv + vec2(0.0, px.y), 0.0, 1.0)).rgb +
      texture(u_texture, clamp(uv - vec2(0.0, px.y), 0.0, 1.0)).rgb +
      texture(u_texture, clamp(uv + vec2(px.x, px.y), 0.0, 1.0)).rgb +
      texture(u_texture, clamp(uv + vec2(-px.x, px.y), 0.0, 1.0)).rgb +
      texture(u_texture, clamp(uv + vec2(px.x, -px.y), 0.0, 1.0)).rgb +
      texture(u_texture, clamp(uv + vec2(-px.x, -px.y), 0.0, 1.0)).rgb;
    baseBlur *= 1.0 / 8.0;
    vec3 detail = src.rgb - baseBlur;
    color += detail * u_sharpen * 3.5;
  }

  fragColor = vec4(clamp(color, 0.0, 1.0), src.a);
}