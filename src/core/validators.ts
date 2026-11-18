import { DEFAULT_PARAMS } from '../config';
import type {
  BrandParams,
  CompressionParams,
  DigicamParams,
  DitheringType,
  EngineParams,
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
  };
}

export function validateBrand(params: BrandParams): BrandParams {
  return {
    gradeAmount: bounded(params.gradeAmount, DEFAULT_PARAMS.brand.gradeAmount, 0, 1),
  };
}

export function validateParams(params: EngineParams): EngineParams {
  return {
    digicam: validateDigicam(params.digicam),
    vhs: validateVhs(params.vhs),
    compression: validateCompression(params.compression),
    brand: validateBrand(params.brand),
  };
}

/** ISO lineal [100-6400] → factor normalizado [0-1] para el shader. */
export function normalizeIso(isoGain: number): number {
  return (bounded(isoGain, DEFAULT_PARAMS.digicam.isoGain, 100, 6400) - 100) / 6300;
}
