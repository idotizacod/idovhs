import { describe, expect, it } from 'vitest';
import { cloneDefaultParams } from '../src/config';
import { applyPreset, QUICK_PRESETS } from '../src/ui/quickPresets';
import type { EngineParams } from '../src/types';

function withAspect(params: EngineParams, aspectRatio: EngineParams['output']['aspectRatio']): EngineParams {
  return { ...params, output: { aspectRatio } };
}

describe('presets rápidos', () => {
  it('cubre las cuatro categorías del panel', () => {
    const categories = new Set(QUICK_PRESETS.map((preset) => preset.category));
    expect([...categories].sort()).toEqual(['camera', 'finish', 'looks', 'vhs']);
  });

  it('con intensidad 0 deja los parámetros por defecto y conserva el formato', () => {
    const current = withAspect(cloneDefaultParams(), '9:16');
    const expected = withAspect(cloneDefaultParams(), '9:16');

    QUICK_PRESETS.forEach((preset) => {
      expect(applyPreset(preset, current, 0)).toEqual(expected);
    });
  });

  it('con intensidad 1 aplica un cambio real en todos los presets excepto Original', () => {
    const defaults = cloneDefaultParams();

    QUICK_PRESETS.filter((preset) => preset.id !== 'original').forEach((preset) => {
      const applied = applyPreset(preset, defaults, 1);
      expect(applied).not.toEqual(defaults);
    });
  });
});
