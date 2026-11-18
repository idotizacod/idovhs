import type { EngineParams, Size } from './types';

function positiveInt(value: string | undefined, fallback: number): number {
  if (value === undefined || value.trim() === '') {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function booleanFlag(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }
  return value.toLowerCase() === 'true' || value === '1';
}

export const MAX_PREVIEW_SIZE: Size = {
  width: positiveInt(import.meta.env.VITE_MAX_VIEWPORT_WIDTH, 1280),
  height: positiveInt(import.meta.env.VITE_MAX_VIEWPORT_HEIGHT, 720),
};

export const ENABLE_DEBUG_STATS = booleanFlag(import.meta.env.VITE_ENABLE_DEBUG_STATS, true);

export const DEFAULT_PARAMS: Readonly<EngineParams> = {
  digicam: {
    isoGain: 400,
    flashThreshold: 0.82,
    flashBloomRadius: 6,
    sensorProfile: 'sony_ccd_v1',
  },
  vhs: {
    trackingJitter: 0.28,
    barrelDistortion: 0.08,
    magneticNoise: 0.22,
    colorBleed: 0.35,
    scanlineIntensity: 0.4,
  },
  compression: {
    jpegQuality: 0.6,
    blockinessSize: 8,
    ditheringType: 'bayer_4x4',
    posterizationLevels: 12,
  },
  brand: {
    gradeAmount: 0.35,
  },
};

export function cloneDefaultParams(): EngineParams {
  return {
    digicam: { ...DEFAULT_PARAMS.digicam },
    vhs: { ...DEFAULT_PARAMS.vhs },
    compression: { ...DEFAULT_PARAMS.compression },
    brand: { ...DEFAULT_PARAMS.brand },
  };
}
