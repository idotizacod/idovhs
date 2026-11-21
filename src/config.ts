import type { EngineParams, Size } from './types';

export const APP_TITLE = 'IDOVHS';

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
  imageAdjust: {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hslSatRed: 0,
    hslSatOrange: 0,
    hslSatYellow: 0,
    hslSatGreen: 0,
    hslSatCyan: 0,
    hslSatBlue: 0,
    hslSatViolet: 0,
    hslSatMagenta: 0,
    sharpen: 0,
  },
  digicam: {
    isoGain: 100,
    flashThreshold: 1,
    flashBloomRadius: 1,
    sensorProfile: 'sony_ccd_v1',
    chromaAberration: 0,
    lumaGrain: 0,
  },
  vhs: {
    trackingJitter: 0,
    barrelDistortion: 0,
    magneticNoise: 0,
    colorBleed: 0,
    scanlineIntensity: 0,
    chromaDelay: 0,
    syncDrift: 0,
    headSwitching: 0,
    dropouts: 0,
    tapeDamage: 0,
  },
  compression: {
    jpegQuality: 1,
    blockinessSize: 4,
    ditheringType: 'bayer_4x4',
    posterizationLevels: 16,
    blockCorruption: 0,
    blockCorruptionShift: 0,
  },
  brand: {
    gradeAmount: 0,
    dirtAmount: 0,
    scratchesAmount: 0,
    dustAmount: 0,
    crtAmount: 0,
    crtCurvature: 0,
    crtScanlines: 0,
    crtMask: 0,
    crtVignette: 0,
    crtHalation: 0,
    crtConvergence: 0,
    crtCompensation: 0,
  },
  datamosh: {
    amount: 0,
    motionThreshold: 0,
    blockSize: 4,
    feedback: 0,
  },
};

export function cloneDefaultParams(): EngineParams {
  return {
    imageAdjust: { ...DEFAULT_PARAMS.imageAdjust },
    digicam: { ...DEFAULT_PARAMS.digicam },
    vhs: { ...DEFAULT_PARAMS.vhs },
    compression: { ...DEFAULT_PARAMS.compression },
    brand: { ...DEFAULT_PARAMS.brand },
    datamosh: { ...DEFAULT_PARAMS.datamosh },
  };
}
