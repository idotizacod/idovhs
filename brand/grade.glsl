// Idotiza — chunk GLSL reutilizable (GLSL ES 3.00).
// Filtro: sombra negra → medio celeste neón gastado → alto blanco.
// Insértalo después de `precision highp float;` y llama a idoBrandGrade().
// No declara uniforms: la paleta se pasa como parámetro para poder usarla
// en cualquier app o pipeline sin acoplamiento.

vec3 idoBrandGrade(
  vec3 color,
  vec3 shadowColor,
  vec3 midColor,
  vec3 highlightColor,
  float amount
) {
  float luma = dot(clamp(color, 0.0, 1.0), vec3(0.299, 0.587, 0.114));

  vec3 mapped = mix(shadowColor, midColor, smoothstep(0.05, 0.58, luma));
  mapped = mix(mapped, highlightColor, smoothstep(0.58, 1.0, luma));

  // Conserva detalle: modula la curva por la luminancia original.
  vec3 graded = mapped * (0.72 + 0.55 * luma);
  return clamp(mix(color, graded, clamp(amount, 0.0, 1.0)), 0.0, 1.0);
}
