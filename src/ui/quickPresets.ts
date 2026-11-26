import { cloneDefaultParams } from '../config';
import { validateParams } from '../core/validators';
import type { EngineParams } from '../types';

export type QuickCategory = 'looks' | 'camera' | 'vhs' | 'finish';

export interface QuickPreset {
  id: string;
  category: QuickCategory;
  label: string;
  hint: string;
  swatch: string;
  apply: (params: EngineParams, intensity: number) => void;
}

export const QUICK_CATEGORY_LABELS: Record<QuickCategory, string> = {
  looks: 'LOOKS',
  camera: 'CÁMARA',
  vhs: 'VHS',
  finish: 'ACABADO',
};

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

function withoutNegativeZero<T extends object>(group: T): T {
  const entries = Object.entries(group as Record<string, unknown>).map(([key, value]) => [
    key,
    typeof value === 'number' && value === 0 ? 0 : value,
  ]);
  return Object.fromEntries(entries) as T;
}

/** Presets rápidos: siempre parten de los defaults para no acumular capas. */
export function presetBase(current: EngineParams): EngineParams {
  const base = cloneDefaultParams();
  base.output = { ...validateParams(current).output };
  return base;
}

export function applyPreset(
  preset: QuickPreset,
  current: EngineParams,
  intensity: number,
): EngineParams {
  const next = presetBase(current);
  preset.apply(next, clamp01(intensity));
  const validated = validateParams(next);
  return {
    imageAdjust: withoutNegativeZero(validated.imageAdjust),
    digicam: withoutNegativeZero(validated.digicam),
    vhs: withoutNegativeZero(validated.vhs),
    compression: withoutNegativeZero(validated.compression),
    brand: withoutNegativeZero(validated.brand),
    datamosh: withoutNegativeZero(validated.datamosh),
    output: withoutNegativeZero(validated.output),
  };
}

export const QUICK_PRESETS: readonly QuickPreset[] = [
  {
    id: 'original',
    category: 'looks',
    label: 'ORIGINAL',
    hint: 'Sin procesar',
    swatch: 'original',
    apply: () => undefined,
  },
  {
    id: 'vhs-clasico',
    category: 'looks',
    label: 'VHS CLÁSICO',
    hint: 'Tracking + chroma + scanlines',
    swatch: 'vhs-classic',
    apply: (params, k) => {
      params.imageAdjust.saturation = -0.15 * k;
      params.vhs.trackingJitter = 0.25 * k;
      params.vhs.colorBleed = 0.35 * k;
      params.vhs.scanlineIntensity = 0.3 * k;
      params.vhs.chromaDelay = 0.2 * k;
      params.vhs.syncDrift = 0.12 * k;
      params.brand.crtAmount = 0.15 * k;
    },
  },
  {
    id: 'ccd-2000',
    category: 'looks',
    label: 'CCD 2000',
    hint: 'Sensor compacto con glow',
    swatch: 'ccd-2000',
    apply: (params, k) => {
      params.imageAdjust.contrast = 0.15 * k;
      params.imageAdjust.saturation = 0.1 * k;
      params.digicam.isoGain = 100 + 1500 * k;
      params.digicam.flashThreshold = 1 - 0.7 * k;
      params.digicam.chromaAberration = 0.2 * k;
      params.digicam.lumaGrain = 0.2 * k;
    },
  },
  {
    id: 'crt-nocturno',
    category: 'looks',
    label: 'CRT NOCTURNO',
    hint: 'Curvatura, máscara y halación',
    swatch: 'crt-night',
    apply: (params, k) => {
      params.imageAdjust.brightness = -0.12 * k;
      params.imageAdjust.contrast = 0.2 * k;
      params.brand.crtAmount = 0.75 * k;
      params.brand.crtCurvature = 0.4 * k;
      params.brand.crtScanlines = 0.5 * k;
      params.brand.crtMask = 0.35 * k;
      params.brand.crtVignette = 0.6 * k;
      params.brand.crtHalation = 0.35 * k;
    },
  },
  {
    id: 'glitch-vhs',
    category: 'looks',
    label: 'GLITCH VHS',
    hint: 'Datamosh + dropout + bloques',
    swatch: 'glitch-vhs',
    apply: (params, k) => {
      params.vhs.trackingJitter = 0.6 * k;
      params.vhs.dropouts = 0.5 * k;
      params.vhs.headSwitching = 0.4 * k;
      params.compression.blockCorruption = 0.35 * k;
      params.datamosh.amount = 0.55 * k;
      params.datamosh.motionThreshold = 0.35 * k;
      params.datamosh.blockSize = k > 0 ? 8 : 4;
      params.datamosh.feedback = 0.3 * k;
    },
  },
  {
    id: 'iso-alto',
    category: 'camera',
    label: 'ISO ALTO',
    hint: 'Ganancia y grano de sensor',
    swatch: 'iso-high',
    apply: (params, k) => {
      params.digicam.isoGain = 100 + 5000 * k;
      params.digicam.lumaGrain = 0.5 * k;
      params.digicam.chromaAberration = 0.15 * k;
    },
  },
  {
    id: 'flash-directo',
    category: 'camera',
    label: 'FLASH DIRECTO',
    hint: 'Flash bajo con bloom',
    swatch: 'flash',
    apply: (params, k) => {
      params.imageAdjust.contrast = 0.2 * k;
      params.digicam.flashThreshold = 1 - 0.8 * k;
      params.digicam.flashBloomRadius = 1 + 8 * k;
    },
  },
  {
    id: 'cmos-temprano',
    category: 'camera',
    label: 'CMOS TEMPRANO',
    hint: 'Sensor frío y nitidez',
    swatch: 'cmos',
    apply: (params, k) => {
      params.imageAdjust.saturation = -0.1 * k;
      params.imageAdjust.sharpen = 0.2 * k;
      params.digicam.isoGain = 100 + 800 * k;
      params.digicam.sensorProfile = k > 0 ? 'early_cmos' : 'sony_ccd_v1';
    },
  },
  {
    id: 'lofi-ccd',
    category: 'camera',
    label: 'LO-FI CCD',
    hint: 'Color sucio y aberración',
    swatch: 'lofi',
    apply: (params, k) => {
      params.imageAdjust.saturation = 0.15 * k;
      params.digicam.sensorProfile = k > 0 ? 'lofi_ccd' : 'sony_ccd_v1';
      params.digicam.lumaGrain = 0.35 * k;
      params.digicam.chromaAberration = 0.25 * k;
    },
  },
  {
    id: 'tracking',
    category: 'vhs',
    label: 'TRACKING',
    hint: 'Inestabilidad de cinta',
    swatch: 'tracking',
    apply: (params, k) => {
      params.vhs.trackingJitter = 0.8 * k;
      params.vhs.syncDrift = 0.25 * k;
      params.vhs.headSwitching = 0.2 * k;
    },
  },
  {
    id: 'barril',
    category: 'vhs',
    label: 'BARRIL',
    hint: 'Distorsión de lente CRT',
    swatch: 'barrel',
    apply: (params, k) => {
      params.vhs.barrelDistortion = 0.4 * k;
      params.brand.crtCurvature = 0.25 * k;
      params.brand.crtCompensation = 0.3 * k;
    },
  },
  {
    id: 'scanlines',
    category: 'vhs',
    label: 'SCANLINES',
    hint: 'Líneas de barrido',
    swatch: 'scanlines',
    apply: (params, k) => {
      params.vhs.scanlineIntensity = 0.85 * k;
      params.brand.crtAmount = 0.3 * k;
      params.brand.crtScanlines = 0.5 * k;
    },
  },
  {
    id: 'dano-cinta',
    category: 'vhs',
    label: 'DAÑO DE CINTA',
    hint: 'Dropouts y ruido magnético',
    swatch: 'tape',
    apply: (params, k) => {
      params.vhs.magneticNoise = 0.35 * k;
      params.vhs.colorBleed = 0.3 * k;
      params.vhs.dropouts = 0.7 * k;
      params.vhs.tapeDamage = 0.6 * k;
    },
  },
  {
    id: 'curtido',
    category: 'finish',
    label: 'CURTIDO',
    hint: 'Grade IDO con contraste',
    swatch: 'grade',
    apply: (params, k) => {
      params.imageAdjust.brightness = -0.05 * k;
      params.imageAdjust.contrast = 0.25 * k;
      params.imageAdjust.saturation = -0.2 * k;
      params.brand.gradeAmount = 0.8 * k;
    },
  },
  {
    id: 'suciedad',
    category: 'finish',
    label: 'SUCIEDAD',
    hint: 'Polvo y tierra de película',
    swatch: 'dirt',
    apply: (params, k) => {
      params.brand.gradeAmount = 0.2 * k;
      params.brand.dirtAmount = 0.7 * k;
      params.brand.dustAmount = 0.5 * k;
    },
  },
  {
    id: 'rayas',
    category: 'finish',
    label: 'RAYAS',
    hint: 'Rayones CRT y compresión',
    swatch: 'scratches',
    apply: (params, k) => {
      params.brand.crtAmount = 0.3 * k;
      params.brand.scratchesAmount = 0.8 * k;
      params.compression.jpegQuality = 1 - 0.3 * k;
    },
  },
  {
    id: 'bloques',
    category: 'finish',
    label: 'BLOQUES',
    hint: 'Posterización y corruptos',
    swatch: 'blocks',
    apply: (params, k) => {
      params.compression.blockinessSize = k > 0 ? 8 : 4;
      params.compression.blockCorruption = 0.7 * k;
      params.compression.posterizationLevels = 16 - Math.round(10 * k);
      params.compression.ditheringType = k > 0 ? 'noise' : 'bayer_4x4';
    },
  },
];

export function presetsForCategory(category: QuickCategory): readonly QuickPreset[] {
  return QUICK_PRESETS.filter((preset) => preset.category === category);
}
