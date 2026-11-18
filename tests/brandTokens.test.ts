import { describe, expect, it } from 'vitest';
import { BRAND_NAME, IDO_COLORS, IDO_GRADE_PALETTE, hexToRgb01 } from '../brand/tokens';
import { APP_TITLE } from '../src/config';
import { withBrandChunk } from '../src/core/shaderSources';

describe('Idotiza design tokens', () => {
  it('expone la paleta formal, la tríada de grade y los nombres', () => {
    expect(BRAND_NAME).toBe('Idotiza');
    expect(APP_TITLE).toBe('IDOVHS');
    expect(IDO_COLORS).toEqual({
      blanco: '#f5f5f5',
      negro: '#000000',
      rojo: '#ff1e00',
      celeste: '#62f2f6',
    });
    expect(IDO_GRADE_PALETTE).toEqual({
      shadow: IDO_COLORS.negro,
      mid: IDO_COLORS.celeste,
      highlight: IDO_COLORS.blanco,
    });
  });

  it('convierte hexadecimales a RGB normalizado', () => {
    expect(hexToRgb01('#ffffff')).toEqual([1, 1, 1]);
    expect(hexToRgb01('000000')).toEqual([0, 0, 0]);
    expect(hexToRgb01(IDO_COLORS.celeste)).toEqual([98 / 255, 242 / 255, 246 / 255]);
    expect(() => hexToRgb01('rojo')).toThrow();
  });

  it('inyecta el chunk GLSL después de precision', () => {
    const source = '#version 300 es\nprecision highp float;\nvoid main() {}';
    const result = withBrandChunk(source);
    expect(result).toContain('idoBrandGrade');
    expect(result.indexOf('idoBrandGrade')).toBeGreaterThan(result.indexOf('precision highp float;'));
  });
});
