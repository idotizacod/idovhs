import { DEFAULT_PARAMS } from '../config';
import type {
  BrandParams,
  CompressionParams,
  DatamoshParams,
  DigicamParams,
  DitheringType,
  EngineParams,
  ImageAdjustParams,
  SensorProfile,
  VhsParams,
} from '../types';

const SENSOR_PROFILES: readonly SensorProfile[] = ['sony_ccd_v1', 'early_cmos', 'lofi_ccd'];
const DITHER_TYPES: readonly DitheringType[] = ['bayer_4x4', 'bayer_8x8', 'noise'];
const BLOCK_SIZES: readonly number[] = [4, 8, 16];

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function finiteOrDefault(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

function bounded(value: number, fallback: number, min: number, max: number): number {
  return clamp(finiteOrDefault(value, fallback), min, max);
}

function oneOf<T extends string>(value: unknown, options: readonly T[], fallback: T): T {
  return options.includes(value as T) ? (value as T) : fallback;
}

function nearest(value: number, options: readonly number[], fallback: number): number {
  const safe = finiteOrDefault(value, fallback);
  return options.reduce((best, candidate) =>
    Math.abs(candidate - safe) < Math.abs(best - safe) ? candidate : best,
  );
}

export function validateDigicam(params: DigicamParams): DigicamParams {
  const fallback = DEFAULT_PARAMS.digicam;
  return {
    isoGain: bounded(params.isoGain, fallback.isoGain, 100, 6400),
    flashThreshold: bounded(params.flashThreshold, fallback.flashThreshold, 0, 1),
    flashBloomRadius: bounded(params.flashBloomRadius, fallback.flashBloomRadius, 1, 16),
    sensorProfile: oneOf(params.sensorProfile, SENSOR_PROFILES, fallback.sensorProfile),
    chromaAberration: bounded(params.chromaAberration, fallback.chromaAberration, 0, 1),
    lumaGrain: bounded(params.lumaGrain, fallback.lumaGrain, 0, 1),
  };
}

export function validateVhs(params: VhsParams): VhsParams {
  const fallback = DEFAULT_PARAMS.vhs;
  return {
    trackingJitter: bounded(params.trackingJitter, fallback.trackingJitter, 0, 1),
    barrelDistortion: bounded(params.barrelDistortion, fallback.barrelDistortion, -0.5, 0.5),
    magneticNoise: bounded(params.magneticNoise, fallback.magneticNoise, 0, 1),
    colorBleed: bounded(params.colorBleed, fallback.colorBleed, 0, 1),
    scanlineIntensity: bounded(params.scanlineIntensity, fallback.scanlineIntensity, 0, 1),
    chromaDelay: bounded(params.chromaDelay, fallback.chromaDelay, 0, 1),
    syncDrift: bounded(params.syncDrift, fallback.syncDrift, 0, 1),
    headSwitching: bounded(params.headSwitching, fallback.headSwitching, 0, 1),
    dropouts: bounded(params.dropouts, fallback.dropouts, 0, 1),
    tapeDamage: bounded(params.tapeDamage, fallback.tapeDamage, 0, 1),
  };
}

export function validateCompression(params: CompressionParams): CompressionParams {
  const fallback = DEFAULT_PARAMS.compression;
  return {
    jpegQuality: bounded(params.jpegQuality, fallback.jpegQuality, 0.1, 1),
    blockinessSize: nearest(params.blockinessSize, BLOCK_SIZES, fallback.blockinessSize),
    ditheringType: oneOf(params.ditheringType, DITHER_TYPES, fallback.ditheringType),
    posterizationLevels: Math.round(
      bounded(params.posterizationLevels, fallback.posterizationLevels, 2, 16),
    ),
    blockCorruption: bounded(params.blockCorruption, fallback.blockCorruption, 0, 1),
    blockCorruptionShift: bounded(params.blockCorruptionShift, fallback.blockCorruptionShift, 0, 1),
  };
}

export function validateBrand(params: BrandParams): BrandParams {
  const fallback = DEFAULT_PARAMS.brand;
  return {
    gradeAmount: bounded(params.gradeAmount, fallback.gradeAmount, 0, 1),
    dirtAmount: bounded(params.dirtAmount, fallback.dirtAmount, 0, 1),
    scratchesAmount: bounded(params.scratchesAmount, fallback.scratchesAmount, 0, 1),
    dustAmount: bounded(params.dustAmount, fallback.dustAmount, 0, 1),
    crtAmount: bounded(params.crtAmount, fallback.crtAmount, 0, 1),
    crtCurvature: bounded(params.crtCurvature, fallback.crtCurvature, 0, 1),
    crtScanlines: bounded(params.crtScanlines, fallback.crtScanlines, 0, 1),
    crtMask: bounded(params.crtMask, fallback.crtMask, 0, 1),
    crtVignette: bounded(params.crtVignette, fallback.crtVignette, 0, 1),
    crtHalation: bounded(params.crtHalation, fallback.crtHalation, 0, 1),
    crtConvergence: bounded(params.crtConvergence, fallback.crtConvergence, 0, 1),
    crtCompensation: bounded(params.crtCompensation, fallback.crtCompensation, 0, 1),
  };
}

export function validateDatamosh(params: DatamoshParams): DatamoshParams {
  const fallback = DEFAULT_PARAMS.datamosh;
  return {
    amount: bounded(params.amount, fallback.amount, 0, 1),
    motionThreshold: bounded(params.motionThreshold, fallback.motionThreshold, 0, 1),
    blockSize: nearest(params.blockSize, BLOCK_SIZES, fallback.blockSize),
    feedback: bounded(params.feedback, fallback.feedback, 0, 1),
  };
}

export function validateImageAdjust(params: ImageAdjustParams): ImageAdjustParams {
  const fallback = DEFAULT_PARAMS.imageAdjust;
  return {
    brightness: bounded(params.brightness, fallback.brightness, -1, 1),
    contrast: bounded(params.contrast, fallback.contrast, -1, 1),
    saturation: bounded(params.saturation, fallback.saturation, -1, 1),
    hslSatRed: bounded(params.hslSatRed, fallback.hslSatRed, -1, 1),
    hslSatOrange: bounded(params.hslSatOrange, fallback.hslSatOrange, -1, 1),
    hslSatYellow: bounded(params.hslSatYellow, fallback.hslSatYellow, -1, 1),
    hslSatGreen: bounded(params.hslSatGreen, fallback.hslSatGreen, -1, 1),
    hslSatCyan: bounded(params.hslSatCyan, fallback.hslSatCyan, -1, 1),
    hslSatBlue: bounded(params.hslSatBlue, fallback.hslSatBlue, -1, 1),
    hslSatViolet: bounded(params.hslSatViolet, fallback.hslSatViolet, -1, 1),
    hslSatMagenta: bounded(params.hslSatMagenta, fallback.hslSatMagenta, -1, 1),
    sharpen: bounded(params.sharpen, fallback.sharpen, 0, 1),
  };
}

export function validateParams(params: EngineParams): EngineParams {
  return {
    imageAdjust: validateImageAdjust(params.imageAdjust),
    digicam: validateDigicam(params.digicam),
    vhs: validateVhs(params.vhs),
    compression: validateCompression(params.compression),
    brand: validateBrand(params.brand),
    datamosh: validateDatamosh(params.datamosh),
  };
}

/** ISO lineal [100-6400] → factor normalizado [0-1] para el shader. */
export function normalizeIso(isoGain: number): number {
  return (bounded(isoGain, DEFAULT_PARAMS.digicam.isoGain, 100, 6400) - 100) / 6300;
}
