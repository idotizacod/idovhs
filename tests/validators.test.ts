import { describe, expect, it } from 'vitest';
import { cloneDefaultParams } from '../src/config';
import {
  clamp,
  normalizeIso,
  validateCompression,
  validateDigicam,
  validateParams,
  validateVhs,
} from '../src/core/validators';

describe('validadores de parámetros', () => {
  it('clamp LIMITA valores', () => {
    expect(clamp(10, 0, 1)).toBe(1);
    expect(clamp(-5, 0, 1)).toBe(0);
    expect(clamp(0.4, 0, 1)).toBe(0.4);
  });

  it('normaliza ISO fuera de rango', () => {
    const defaults = cloneDefaultParams();
    const validated = validateDigicam({
      ...defaults.digicam,
      isoGain: 9999,
      flashThreshold: Number.NaN,
      sensorProfile: 'desconocido' as 'sony_ccd_v1',
    });
    expect(validated.isoGain).toBe(6400);
    expect(validated.flashThreshold).toBe(defaults.digicam.flashThreshold);
    expect(validated.sensorProfile).toBe('sony_ccd_v1');
    expect(normalizeIso(100)).toBe(0);
    expect(normalizeIso(6400)).toBe(1);
  });

  it('valida parámetros VHS yCompression', () => {
    const params = cloneDefaultParams();
    const vhs = validateVhs({
      ...params.vhs,
      trackingJitter: -1,
      barrelDistortion: 3,
      magneticNoise: Number.NaN,
    });
    expect(vhs.trackingJitter).toBe(0);
    expect(vhs.barrelDistortion).toBe(0.5);
    expect(vhs.magneticNoise).toBe(params.vhs.magneticNoise);

    const compression = validateCompression({
      ...params.compression,
      blockinessSize: 7,
      posterizationLevels: 99,
      ditheringType: 'otro' as 'noise',
    });
    expect(compression.blockinessSize).toBe(8);
    expect(compression.posterizationLevels).toBe(16);
    expect(compression.ditheringType).toBe('bayer_4x4');
  });

  it('validateParams preserva perfiles válidos', () => {
    const original = cloneDefaultParams();
    original.vhs.colorBleed = 0.75;
    original.compression.ditheringType = 'bayer_8x8';
    original.brand.gradeAmount = 0.9;
    const validated = validateParams(original);
    expect(validated.vhs.colorBleed).toBe(0.75);
    expect(validated.compression.ditheringType).toBe('bayer_8x8');
    expect(validated.brand.gradeAmount).toBe(0.9);
    expect(validated).not.toBe(original);
  });
});
