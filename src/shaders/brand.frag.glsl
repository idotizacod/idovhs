#version 300 es
precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_texture;
uniform vec3 u_idoShadow;
uniform vec3 u_idoMid;
uniform vec3 u_idoHighlight;
uniform float u_idoGrade;

void main() {
  vec3 color = texture(u_texture, v_texCoord).rgb;
  color = idoBrandGrade(color, u_idoShadow, u_idoMid, u_idoHighlight, u_idoGrade);

  // Grano sutil para unificar imagen y UI bajo la misma textura de marca.
  float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
  color += grain * u_idoGrade * 0.025;

  fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
