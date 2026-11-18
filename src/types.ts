export type SensorProfile = 'sony_ccd_v1' | 'early_cmos' | 'lofi_ccd';
export type DitheringType = 'bayer_4x4' | 'bayer_8x8' | 'noise';
export type SourceKind = 'procedural' | 'image' | 'video' | 'camera';
export type EngineStatus = 'idle' | 'playing' | 'paused' | 'scrubbing' | 'exporting' | 'error';
export type EngineEvent =
  | 'PLAY'
  | 'PAUSE'
  | 'SCRUB_START'
  | 'SCRUB_END'
  | 'EXPORT_START'
  | 'EXPORT_END'
  | 'ERROR'
  | 'RESET';

export interface DigicamParams {
  isoGain: number; // [100 - 6400]
  flashThreshold: number; // [0.0 - 1.0]
  flashBloomRadius: number; // [1.0 - 16.0]
  sensorProfile: SensorProfile;
}

export interface VhsParams {
  trackingJitter: number; // [0.0 - 1.0]
  barrelDistortion: number; // [-0.5 - 0.5]
  magneticNoise: number; // [0.0 - 1.0]
  colorBleed: number; // [0.0 - 1.0]
  scanlineIntensity: number; // [0.0 - 1.0]
}

export interface CompressionParams {
  jpegQuality: number; // [0.1 - 1.0]
  blockinessSize: number; // [4, 8, 16]
  ditheringType: DitheringType;
  posterizationLevels: number; // [2 - 16]
}

export interface BrandParams {
  gradeAmount: number; // [0.0 - 1.0]
}

export interface EngineParams {
  digicam: DigicamParams;
  vhs: VhsParams;
  compression: CompressionParams;
  brand: BrandParams;
}

export interface EngineState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  resolution: { width: number; height: number };
  fps: number;
}

export interface RenderStats {
  fps: number;
  width: number;
  height: number;
  status: EngineStatus;
  source: SourceKind;
}

export interface Size {
  width: number;
  height: number;
}
