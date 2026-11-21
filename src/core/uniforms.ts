import { IDO_GRADE_PALETTE, hexToRgb01 } from '../../brand/tokens';
import type { BrandParams, CompressionParams, DatamoshParams, DigicamParams, ImageAdjustParams, Size, VhsParams } from '../types';
import { normalizeIso } from './validators';

/** Contrato mínimo compartido por ShaderProgram y los mocks de pruebas. */
export interface UniformSink {
  setFloat(name: string, value: number): void;
  setInt(name: string, value: number): void;
  setVec2(name: string, x: number, y: number): void;
  setVec3(name: string, x: number, y: number, z: number): void;
}

// Curvas de respuesta para faders: inicio suave, menos drástico al aplicar el filtro.
function smooth01(value: number): number {
  const x = Math.min(1, Math.max(0, value));
  return x * x;
}

function smoothSigned(value: number): number {
  const a = Math.min(1, Math.abs(value));
  return Math.sign(value) * a * a;
}

// Para parámetros donde 1 es neutro y bajar aplica más efecto (ej. calidad).
function smoothTowardZero(value: number, min: number, max: number): number {
  const clamped = Math.min(max, Math.max(min, value));
  const t = (max - clamped) / (max - min); // 0 neutro, 1 máximo efecto
  return max - smooth01(t) * (max - min);
}

const SENSOR_INDEX: Readonly<Record<DigicamParams['sensorProfile'], number>> = {
  sony_ccd_v1: 0,
  early_cmos: 1,
  lofi_ccd: 2,
};

const DITHER_INDEX: Readonly<Record<CompressionParams['ditheringType'], number>> = {
  bayer_4x4: 0,
  bayer_8x8: 1,
  noise: 2,
};

export function applyDigicamUniforms(
  program: UniformSink,
  params: DigicamParams,
  time: number,
  resolution: Size,
): void {
  program.setFloat('u_isoGain', smooth01(normalizeIso(params.isoGain)));
  program.setFloat('u_flashThreshold', smoothTowardZero(params.flashThreshold, 0, 1));
  const bloomT = (params.flashBloomRadius - 1) / 15;
  program.setFloat('u_flashBloomRadius', 1 + smooth01(bloomT) * 15);
  program.setInt('u_sensorProfile', SENSOR_INDEX[params.sensorProfile]);
  program.setFloat('u_chromaAberration', smooth01(params.chromaAberration));
  program.setFloat('u_lumaGrain', smooth01(params.lumaGrain));
  program.setFloat('u_time', time);
  program.setVec2('u_resolution', resolution.width, resolution.height);
}

export function applyVhsUniforms(
  program: UniformSink,
  params: VhsParams,
  time: number,
  frame: number,
  resolution: Size,
): void {
  program.setFloat('u_trackingJitter', smooth01(params.trackingJitter));
  program.setFloat('u_barrelDistortion', smoothSigned(params.barrelDistortion / 0.5) * 0.5);
  program.setFloat('u_magneticNoise', smooth01(params.magneticNoise));
  program.setFloat('u_colorBleed', smooth01(params.colorBleed));
  program.setFloat('u_scanlineIntensity', smooth01(params.scanlineIntensity));
  program.setFloat('u_chromaDelay', smooth01(params.chromaDelay));
  program.setFloat('u_syncDrift', smooth01(params.syncDrift));
  program.setFloat('u_headSwitching', smooth01(params.headSwitching));
  program.setFloat('u_dropouts', smooth01(params.dropouts));
  program.setFloat('u_tapeDamage', smooth01(params.tapeDamage));
  program.setFloat('u_time', time);
  program.setFloat('u_frame', frame);
  program.setVec2('u_resolution', resolution.width, resolution.height);
}

export function applyCompressionUniforms(
  program: UniformSink,
  params: CompressionParams,
  time: number,
  resolution: Size,
): void {
  program.setFloat('u_jpegQuality', smoothTowardZero(params.jpegQuality, 0.1, 1));
  program.setFloat('u_blockSize', params.blockinessSize);
  program.setInt('u_ditherType', DITHER_INDEX[params.ditheringType]);
  program.setFloat('u_posterizationLevels', smoothTowardZero(params.posterizationLevels, 2, 16));
  program.setFloat('u_blockCorruption', smooth01(params.blockCorruption));
  program.setFloat('u_blockCorruptionShift', smooth01(params.blockCorruptionShift));
  program.setFloat('u_time', time);
  program.setVec2('u_resolution', resolution.width, resolution.height);
}

/** Inyecta la paleta IDObranding y parámetros de acabado desde la única fuente de verdad. */
export function applyBrandUniforms(
  program: UniformSink,
  params: BrandParams,
  time: number,
  resolution: Size,
): void {
  const shadow = hexToRgb01(IDO_GRADE_PALETTE.shadow);
  const mid = hexToRgb01(IDO_GRADE_PALETTE.mid);
  const highlight = hexToRgb01(IDO_GRADE_PALETTE.highlight);
  program.setVec3('u_idoShadow', shadow[0], shadow[1], shadow[2]);
  program.setVec3('u_idoMid', mid[0], mid[1], mid[2]);
  program.setVec3('u_idoHighlight', highlight[0], highlight[1], highlight[2]);
  program.setFloat('u_idoGrade', smooth01(params.gradeAmount));
  program.setFloat('u_dirtAmount', smooth01(params.dirtAmount));
  program.setFloat('u_scratchesAmount', smooth01(params.scratchesAmount));
  program.setFloat('u_dustAmount', smooth01(params.dustAmount));
  program.setFloat('u_crtAmount', smooth01(params.crtAmount));
  program.setFloat('u_crtCurvature', smooth01(params.crtCurvature));
  program.setFloat('u_crtScanlines', smooth01(params.crtScanlines));
  program.setFloat('u_crtMask', smooth01(params.crtMask));
  program.setFloat('u_crtVignette', smooth01(params.crtVignette));
  program.setFloat('u_crtHalation', smooth01(params.crtHalation));
  program.setFloat('u_crtConvergence', smooth01(params.crtConvergence));
  program.setFloat('u_crtCompensation', smooth01(params.crtCompensation));
  program.setFloat('u_time', time);
  program.setVec2('u_resolution', resolution.width, resolution.height);
}

export function applyDatamoshUniforms(
  program: UniformSink,
  params: DatamoshParams,
  time: number,
  resolution: Size,
): void {
  program.setFloat('u_amount', smooth01(params.amount));
  program.setFloat('u_motionThreshold', smooth01(params.motionThreshold));
  program.setFloat('u_blockSize', params.blockSize);
  program.setFloat('u_feedback', smooth01(params.feedback));
  program.setFloat('u_time', time);
  program.setVec2('u_resolution', resolution.width, resolution.height);
}

export function applyImageAdjustUniforms(
  program: UniformSink,
  params: ImageAdjustParams,
  resolution: Size,
): void {
  program.setFloat('u_brightness', smoothSigned(params.brightness));
  program.setFloat('u_contrast', smoothSigned(params.contrast));
  program.setFloat('u_saturation', smoothSigned(params.saturation));
  program.setFloat('u_hslSatRed', smoothSigned(params.hslSatRed));
  program.setFloat('u_hslSatOrange', smoothSigned(params.hslSatOrange));
  program.setFloat('u_hslSatYellow', smoothSigned(params.hslSatYellow));
  program.setFloat('u_hslSatGreen', smoothSigned(params.hslSatGreen));
  program.setFloat('u_hslSatCyan', smoothSigned(params.hslSatCyan));
  program.setFloat('u_hslSatBlue', smoothSigned(params.hslSatBlue));
  program.setFloat('u_hslSatViolet', smoothSigned(params.hslSatViolet));
  program.setFloat('u_hslSatMagenta', smoothSigned(params.hslSatMagenta));
  program.setFloat('u_sharpen', smooth01(params.sharpen));
  program.setVec2('u_resolution', resolution.width, resolution.height);
}
