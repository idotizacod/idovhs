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
  chromaAberration: number; // [0.0 - 1.0]
  lumaGrain: number; // [0.0 - 1.0]
}

export interface VhsParams {
  trackingJitter: number; // [0.0 - 1.0]
  barrelDistortion: number; // [-0.5 - 0.5]
  magneticNoise: number; // [0.0 - 1.0]
  colorBleed: number; // [0.0 - 1.0]
  scanlineIntensity: number; // [0.0 - 1.0]
  chromaDelay: number; // [0.0 - 1.0]
  syncDrift: number; // [0.0 - 1.0]
  headSwitching: number; // [0.0 - 1.0]
  dropouts: number; // [0.0 - 1.0]
  tapeDamage: number; // [0.0 - 1.0]
}

export interface CompressionParams {
  jpegQuality: number; // [0.1 - 1.0]
  blockinessSize: number; // [4, 8, 16]
  ditheringType: DitheringType;
  posterizationLevels: number; // [2 - 16]
  blockCorruption: number; // [0.0 - 1.0]
  blockCorruptionShift: number; // [0.0 - 1.0]
}

export interface BrandParams {
  gradeAmount: number; // [0.0 - 1.0]
  dirtAmount: number; // [0.0 - 1.0]
  scratchesAmount: number; // [0.0 - 1.0]
  dustAmount: number; // [0.0 - 1.0]
  crtAmount: number; // [0.0 - 1.0] master
  crtCurvature: number; // [0.0 - 1.0]
  crtScanlines: number; // [0.0 - 1.0]
  crtMask: number; // [0.0 - 1.0]
  crtVignette: number; // [0.0 - 1.0]
  crtHalation: number; // [0.0 - 1.0]
  crtConvergence: number; // [0.0 - 1.0]
  crtCompensation: number; // [0.0 - 1.0] zoom para compensar curvatura CRT
}

export interface DatamoshParams {
  amount: number; // [0.0 - 1.0]
  motionThreshold: number; // [0.0 - 1.0]
  blockSize: number; // [4, 8, 16]
  feedback: number; // [0.0 - 1.0]
}

export interface ImageAdjustParams {
  brightness: number; // [-1.0 - 1.0]
  contrast: number; // [-1.0 - 1.0]
  saturation: number; // [-1.0 - 1.0]
  hslSatRed: number; // [-1.0 - 1.0]
  hslSatOrange: number; // [-1.0 - 1.0]
  hslSatYellow: number; // [-1.0 - 1.0]
  hslSatGreen: number; // [-1.0 - 1.0]
  hslSatCyan: number; // [-1.0 - 1.0]
  hslSatBlue: number; // [-1.0 - 1.0]
  hslSatViolet: number; // [-1.0 - 1.0]
  hslSatMagenta: number; // [-1.0 - 1.0]
  sharpen: number; // [0.0 - 1.0]
}

export type AspectRatio = 'original' | '4:5' | '1:1' | '16:9' | '9:16';

export interface OutputParams {
  aspectRatio: AspectRatio;
}

export interface EngineParams {
  imageAdjust: ImageAdjustParams;
  digicam: DigicamParams;
  vhs: VhsParams;
  compression: CompressionParams;
  brand: BrandParams;
  datamosh: DatamoshParams;
  output: OutputParams;
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
