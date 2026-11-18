import { IDO_GRADE_PALETTE, hexToRgb01 } from '../../brand/tokens';
import type { BrandParams, CompressionParams, DigicamParams, Size, VhsParams } from '../types';
import { normalizeIso } from './validators';

/** Contrato mínimo compartido por ShaderProgram y los mocks de pruebas. */
export interface UniformSink {
  setFloat(name: string, value: number): void;
  setInt(name: string, value: number): void;
  setVec2(name: string, x: number, y: number): void;
  setVec3(name: string, x: number, y: number, z: number): void;
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
  program.setFloat('u_isoGain', normalizeIso(params.isoGain));
  program.setFloat('u_flashThreshold', params.flashThreshold);
  program.setFloat('u_flashBloomRadius', params.flashBloomRadius);
  program.setInt('u_sensorProfile', SENSOR_INDEX[params.sensorProfile]);
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
  program.setFloat('u_trackingJitter', params.trackingJitter);
  program.setFloat('u_barrelDistortion', params.barrelDistortion);
  program.setFloat('u_magneticNoise', params.magneticNoise);
  program.setFloat('u_colorBleed', params.colorBleed);
  program.setFloat('u_scanlineIntensity', params.scanlineIntensity);
  program.setFloat('u_time', time);
  program.setFloat('u_frame', frame);
  program.setVec2('u_resolution', resolution.width, resolution.height);
}

export function applyCompressionUniforms(
  program: UniformSink,
  params: CompressionParams,
  resolution: Size,
): void {
  program.setFloat('u_jpegQuality', params.jpegQuality);
  program.setFloat('u_blockSize', params.blockinessSize);
  program.setInt('u_ditherType', DITHER_INDEX[params.ditheringType]);
  program.setFloat('u_posterizationLevels', params.posterizationLevels);
  program.setVec2('u_resolution', resolution.width, resolution.height);
}

/** Inyecta la paleta IDObranding desde la única fuente de verdad. */
export function applyBrandUniforms(program: UniformSink, params: BrandParams): void {
  const shadow = hexToRgb01(IDO_GRADE_PALETTE.shadow);
  const mid = hexToRgb01(IDO_GRADE_PALETTE.mid);
  const highlight = hexToRgb01(IDO_GRADE_PALETTE.highlight);
  program.setVec3('u_idoShadow', shadow[0], shadow[1], shadow[2]);
  program.setVec3('u_idoMid', mid[0], mid[1], mid[2]);
  program.setVec3('u_idoHighlight', highlight[0], highlight[1], highlight[2]);
  program.setFloat('u_idoGrade', params.gradeAmount);
}
