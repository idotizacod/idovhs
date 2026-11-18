import { describe, expect, it } from 'vitest';
import { AdaptiveResolution, fitWithin } from '../src/core/adaptiveResolution';

const SOURCE = { width: 1920, height: 1080 };
const MAX = { width: 1280, height: 720 };

describe('resolución adaptativa', () => {
  it('ajusta la fuente al máximo conservando proporción', () => {
    expect(fitWithin(SOURCE, MAX)).toEqual({ width: 1280, height: 720 });
    expect(fitWithin({ width: 640, height: 480 }, MAX)).toEqual({ width: 640, height: 480 });
  });

  it('reduce resolución tras 30 fotogramas lentos', () => {
    const adaptive = new AdaptiveResolution();
    let size = adaptive.update(60, SOURCE, MAX);
    expect(size).toEqual(MAX);
    for (let i = 0; i < 30; i += 1) {
      size = adaptive.update(40, SOURCE, MAX);
    }
    expect(size.width).toBeLessThan(1280);
    expect(size.height).toBeLessThan(720);
  });

  it('restaura resolución tras 180 fotogramas rápidos', () => {
    const adaptive = new AdaptiveResolution();
    for (let i = 0; i < 30; i += 1) {
      adaptive.update(40, SOURCE, MAX);
    }
    const reduced = adaptive.update(60, SOURCE, MAX);
    expect(reduced.width).toBeLessThan(1280);
    let size = reduced;
    for (let i = 0; i < 360; i += 1) {
      size = adaptive.update(60, SOURCE, MAX);
    }
    expect(size.width).toBe(1280);
    expect(size.height).toBe(720);
  });
});
