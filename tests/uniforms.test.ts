import { describe, expect, it } from 'vitest';
import { cloneDefaultParams } from '../src/config';
import {
  applyBrandUniforms,
  applyCompressionUniforms,
  applyDigicamUniforms,
  applyVhsUniforms,
  type UniformSink,
} from '../src/core/uniforms';
import { normalizeIso } from '../src/core/validators';
import { hexToRgb01, IDO_GRADE_PALETTE } from '../brand/tokens';

class CaptureSink implements UniformSink {
  readonly floats = new Map<string, number>();
  readonly ints = new Map<string, number>();
  readonly vec2s = new Map<string, readonly [number, number]>();
  readonly vec3s = new Map<string, readonly [number, number, number]>();

  setFloat(name: string, value: number): void {
    this.floats.set(name, value);
  }

  setInt(name: string, value: number): void {
    this.ints.set(name, value);
  }

  setVec2(name: string, x: number, y: number): void {
    this.vec2s.set(name, [x, y]);
  }

  setVec3(name: string, x: number, y: number, z: number): void {
    this.vec3s.set(name, [x, y, z]);
  }
}

const RESOLUTION = { width: 1280, height: 720 };

describe('inyección de uniforms', () => {
  it('digicam: normaliza ISO y codifica el perfil', () => {
    const sink = new CaptureSink();
    const { digicam } = cloneDefaultParams();
    applyDigicamUniforms(sink, digicam, 1.5, RESOLUTION);
    expect(sink.floats.get('u_isoGain')).toBe(normalizeIso(digicam.isoGain));
    expect(sink.floats.get('u_flashThreshold')).toBe(digicam.flashThreshold);
    expect(sink.ints.get('u_sensorProfile')).toBe(0);
    expect(sink.vec2s.get('u_resolution')).toEqual([1280, 720]);

    applyDigicamUniforms(sink, { ...digicam, sensorProfile: 'lofi_ccd' }, 1.5, RESOLUTION);
    expect(sink.ints.get('u_sensorProfile')).toBe(2);
  });

  it('vhs: inyecta jitter, ruido y fotograma', () => {
    const sink = new CaptureSink();
    const { vhs } = cloneDefaultParams();
    applyVhsUniforms(sink, vhs, 3.2, 42, RESOLUTION);
    expect(sink.floats.get('u_trackingJitter')).toBe(vhs.trackingJitter);
    expect(sink.floats.get('u_magneticNoise')).toBe(vhs.magneticNoise);
    expect(sink.floats.get('u_frame')).toBe(42);
    expect(sink.floats.get('u_time')).toBe(3.2);
    expect(sink.floats.get('u_barrelDistortion')).toBe(vhs.barrelDistortion);
  });

  it('compression: mapea el tipo de dithering', () => {
    const sink = new CaptureSink();
    const { compression } = cloneDefaultParams();
    applyCompressionUniforms(sink, compression, 1.0, RESOLUTION);
    expect(sink.ints.get('u_ditherType')).toBe(0);
    expect(sink.floats.get('u_blockSize')).toBe(compression.blockinessSize);

    applyCompressionUniforms(sink, { ...compression, ditheringType: 'noise' }, 1.0, RESOLUTION);
    expect(sink.ints.get('u_ditherType')).toBe(2);
  });

  it('brand: inyecta la paleta IDO y la intensidad del grade', () => {
    const sink = new CaptureSink();
    const { brand } = cloneDefaultParams();
    applyBrandUniforms(sink, { ...brand, gradeAmount: 0.75 }, 1.0, RESOLUTION);
    expect(sink.vec3s.get('u_idoShadow')).toEqual(hexToRgb01(IDO_GRADE_PALETTE.shadow));
    expect(sink.vec3s.get('u_idoMid')).toEqual(hexToRgb01(IDO_GRADE_PALETTE.mid));
    expect(sink.vec3s.get('u_idoHighlight')).toEqual(hexToRgb01(IDO_GRADE_PALETTE.highlight));
    // smooth01(0.75) = 0.5625
    expect(sink.floats.get('u_idoGrade')).toBeCloseTo(0.5625, 6);
  });
});
