import { vec2 } from 'gl-matrix';
import { MAX_PREVIEW_SIZE } from '../config';
import type {
  AspectRatio,
  BrandParams,
  CompressionParams,
  DatamoshParams,
  DigicamParams,
  EngineEvent,
  EngineParams,
  EngineState,
  ImageAdjustParams,
  OutputParams,
  RenderStats,
  Size,
  VhsParams,
} from '../types';
import { AdaptiveResolution, fitWithin } from './adaptiveResolution';
import { MediaSource } from './MediaSource';
import { pickVideoFormat, PNG_FORMAT, type OutputFormat } from './mediaFormats';
import { RenderPipeline } from './RenderPipeline';
import { ShaderProgram } from './ShaderProgram';
import { EngineStateMachine } from './stateMachine';
import {
  applyBrandUniforms,
  applyCompressionUniforms,
  applyDatamoshUniforms,
  applyDigicamUniforms,
  applyImageAdjustUniforms,
  applyVhsUniforms,
} from './uniforms';

function aspectRatioValue(ratio: AspectRatio, source: Size): number {
  switch (ratio) {
    case '4:5':
      return 4 / 5;
    case '1:1':
      return 1;
    case '16:9':
      return 16 / 9;
    case '9:16':
      return 9 / 16;
    case 'original':
    default:
      if (source.width > 0 && source.height > 0) {
        return source.width / source.height;
      }
      return 16 / 9;
  }
}

function frameSizeForAspect(ratio: AspectRatio, source: Size, max: Size): Size {
  if (ratio === 'original') {
    const base = source.width > 0 && source.height > 0 ? source : { width: 1280, height: 720 };
    return fitWithin(base, max);
  }
  const r = aspectRatioValue(ratio, source);
  // Ajustar un rectángulo de relación r para que quepa en max.
  let width = max.width;
  let height = Math.round(width / r);
  if (height > max.height) {
    height = max.height;
    width = Math.round(height * r);
  }
  return { width: Math.max(1, width), height: Math.max(1, height) };
}
import {
  BRAND_SOURCE,
  COMPRESSION_SOURCE,
  DATAMOSH_SOURCE,
  DIGICAM_SOURCE,
  IMAGE_ADJUST_SOURCE,
  PASSTHROUGH_SOURCE,
  VERTEX_SOURCE,
  VHS_SOURCE,
} from './shaderSources';
import { validateParams } from './validators';

export interface EngineCallbacks {
  onStats?: (stats: RenderStats) => void;
  onContextChange?: (lost: boolean) => void;
  onError?: (message: string) => void;
}

const PASS_COUNT = 6;
const STATS_INTERVAL_MS = 200;
const FPS_WINDOW = 60;
const RECORD_FPS = 30;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

interface PendingCapture {
  readonly resolve: (blob: Blob) => void;
  readonly reject: (reason: Error) => void;
}

interface VideoRecordingResult {
  readonly blob: Blob;
  readonly format: OutputFormat;
}

/** Orquesta ingesta, cascada de shaders, bucle de render y ciclo de vida del contexto. */
export class Engine {
  private gl: WebGL2RenderingContext | null = null;
  private pipeline: RenderPipeline | null = null;
  private source: MediaSource | null = null;
  private programs: ShaderProgram[] = [];
  private finalProgram: ShaderProgram | null = null;
  private readonly machine = new EngineStateMachine();
  private readonly adaptive = new AdaptiveResolution();
  private readonly opticalCenter = vec2.fromValues(0.5, 0.5);
  private params: EngineParams;
  private rafId: number | null = null;
  private lastTimestamp = 0;
  private lastStatsAt = 0;
  private elapsed = 0;
  private frame = 0;
  private fps = 60;
  private fpsSamples: number[] = [];
  private contextLost = false;
  private disposed = false;
  private pendingCapture: PendingCapture | null = null;
  private recorder: MediaRecorder | null = null;
  private recordStream: MediaStream | null = null;
  private recordChunks: Blob[] = [];
  private recordFormat: OutputFormat | null = null;
  private recordResolve: ((result: VideoRecordingResult) => void) | null = null;
  private recordReject: ((reason: Error) => void) | null = null;
  private resumeAfterExport = false;
  private recordingFullSource = false;
  private stoppingFullSourceRecording = false;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    params: EngineParams,
    private readonly callbacks: EngineCallbacks = {},
  ) {
    this.params = validateParams(params);
    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      // Conservar el buffer evita que el viewport quede en negro cuando el
      // navegador pausa el RAF (pestaña en segundo plano) o al exportar.
      preserveDrawingBuffer: true,
      powerPreference: 'default',
    });
    if (gl === null) {
      throw new Error('WebGL 2.0 no está disponible en este navegador');
    }
    this.gl = gl;
    canvas.addEventListener('webglcontextlost', this.onContextLost, false);
    canvas.addEventListener('webglcontextrestored', this.onContextRestored, false);
    this.buildResources();
  }

  private buildResources(): void {
    const gl = this.gl;
    if (gl === null) {
      return;
    }
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    this.pipeline = new RenderPipeline(gl, this.canvas.width, this.canvas.height);
    this.source = new MediaSource(gl);
    this.programs = [
      new ShaderProgram(gl, VERTEX_SOURCE, IMAGE_ADJUST_SOURCE, 'image-adjust'),
      new ShaderProgram(gl, VERTEX_SOURCE, DIGICAM_SOURCE, 'digicam'),
      new ShaderProgram(gl, VERTEX_SOURCE, VHS_SOURCE, 'vhs'),
      new ShaderProgram(gl, VERTEX_SOURCE, BRAND_SOURCE, 'brand'),
      new ShaderProgram(gl, VERTEX_SOURCE, COMPRESSION_SOURCE, 'compression'),
      new ShaderProgram(gl, VERTEX_SOURCE, DATAMOSH_SOURCE, 'datamosh'),
    ];
    this.finalProgram = new ShaderProgram(gl, VERTEX_SOURCE, PASSTHROUGH_SOURCE, 'output');
    this.contextLost = false;
    this.callbacks.onContextChange?.(false);
  }

  private readonly onContextLost = (event: Event): void => {
    event.preventDefault();
    this.contextLost = true;
    this.callbacks.onContextChange?.(true);
    this.pendingCapture?.reject(new Error('Contexto WebGL perdido durante la exportación'));
    this.pendingCapture = null;
    if (this.recorder !== null) {
      this.recordingFullSource = false;
      void this.stopVideoExport().catch(() => undefined);
    }
  };

  private readonly onContextRestored = (): void => {
    this.disposeResources();
    try {
      this.buildResources();
      this.adaptive.reset();
    } catch (error) {
      this.callbacks.onError?.(`No se pudo recuperar WebGL: ${errorMessage(error)}`);
    }
  };

  private disposeResources(): void {
    this.programs.forEach((program) => program.dispose());
    this.programs = [];
    this.finalProgram?.dispose();
    this.finalProgram = null;
    this.pipeline?.dispose();
    this.pipeline = null;
    this.source?.dispose();
    this.source = null;
  }

  start(): void {
    if (this.disposed || this.rafId !== null) {
      return;
    }
    this.lastTimestamp = performance.now();
    this.rafId = requestAnimationFrame(this.loop);
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  get status(): string {
    return this.machine.current;
  }

  get state(): EngineState {
    const size: Size = this.source?.size ?? { width: 0, height: 0 };
    return {
      isPlaying: this.machine.current === 'playing',
      currentTime: this.source?.currentTime ?? this.elapsed,
      duration: this.source?.duration ?? 0,
      resolution: size,
      fps: this.fps,
    };
  }

  setParams(params: EngineParams): void {
    this.params = validateParams(params);
  }

  setDigicam(patch: Partial<DigicamParams>): void {
    this.setParams({ ...this.params, digicam: { ...this.params.digicam, ...patch } });
  }

  setVhs(patch: Partial<VhsParams>): void {
    this.setParams({ ...this.params, vhs: { ...this.params.vhs, ...patch } });
  }

  setCompression(patch: Partial<CompressionParams>): void {
    this.setParams({ ...this.params, compression: { ...this.params.compression, ...patch } });
  }

  setBrand(patch: Partial<BrandParams>): void {
    this.setParams({ ...this.params, brand: { ...this.params.brand, ...patch } });
  }

  setDatamosh(patch: Partial<DatamoshParams>): void {
    this.setParams({ ...this.params, datamosh: { ...this.params.datamosh, ...patch } });
  }

  setImageAdjust(patch: Partial<ImageAdjustParams>): void {
    this.setParams({ ...this.params, imageAdjust: { ...this.params.imageAdjust, ...patch } });
  }

  setOutput(patch: Partial<OutputParams>): void {
    this.setParams({ ...this.params, output: { ...this.params.output, ...patch } });
    // Al cambiar el formato de salida, reiniciar adaptación para evitar transiciones extrañas.
    this.adaptive.reset();
  }

  send(event: EngineEvent): boolean {
    if (!this.machine.send(event)) {
      return false;
    }
    switch (event) {
      case 'PLAY':
        this.source?.play();
        break;
      case 'PAUSE':
      case 'SCRUB_END':
      case 'EXPORT_END':
        this.source?.pause();
        break;
      case 'RESET':
        this.adaptive.reset();
        this.source?.pause();
        this.source?.loadProcedural();
        this.elapsed = 0;
        this.pipeline?.clearHistory();
        break;
      default:
        break;
    }
    this.emitStats();
    return true;
  }

  async loadFile(file: File): Promise<void> {
    if (this.source === null) {
      return;
    }
    try {
      await this.source.loadFile(file);
      if (this.machine.current === 'error') {
        this.machine.reset();
      }
      this.pipeline?.clearHistory();
      this.send('PLAY');
      this.adaptive.reset();
      this.renderNow();
    } catch (error) {
      this.fail(errorMessage(error));
    }
  }

  async loadCamera(): Promise<void> {
    if (this.source === null) {
      return;
    }
    try {
      await this.source.loadCamera();
      if (this.machine.current === 'error') {
        this.machine.reset();
      }
      this.pipeline?.clearHistory();
      this.send('PLAY');
      this.adaptive.reset();
      this.renderNow();
    } catch (error) {
      this.fail(errorMessage(error));
    }
  }

  loadProcedural(): void {
    if (this.source === null) {
      return;
    }
    this.source.loadProcedural();
    if (this.machine.current === 'error') {
      this.machine.reset();
    }
    this.pipeline?.clearHistory();
    this.send('PAUSE');
    this.adaptive.reset();
  }

  /**
   * Captura el fotograma actual como PNG. La petición se resuelve dentro del
   * render: un WebGL canvas sin `preserveDrawingBuffer` se limpia al compositar.
   */
  exportPng(): Promise<Blob> {
    if (this.disposed || this.gl === null || this.contextLost) {
      return Promise.reject(new Error('El motor no está listo para exportar PNG'));
    }
    return new Promise<Blob>((resolve, reject) => {
      this.pendingCapture = { resolve, reject };
    });
  }

  isRecording(): boolean {
    return this.recorder !== null;
  }

  canExportSourceVideo(): boolean {
    return this.source?.isFileVideoSource() === true;
  }

  isExportingSourceVideo(): boolean {
    return this.recordingFullSource;
  }

  getSourcePreviewDuration(): number {
    return this.source?.previewDuration ?? 0;
  }

  getSourceDuration(): number {
    return this.source?.duration ?? 0;
  }

  /** Inicia la grabación del canvas. Devuelve el formato realmente usado. */
  startVideoExport(preferredFormat?: OutputFormat['extension']): OutputFormat {
    if (this.recorder !== null) {
      throw new Error('Ya hay una grabación en curso');
    }
    if (this.disposed || this.gl === null) {
      throw new Error('El motor no está listo para grabar');
    }
    if (typeof this.canvas.captureStream !== 'function') {
      throw new Error('canvas.captureStream no está disponible en este navegador');
    }

    const format = pickVideoFormat(preferredFormat);
    const stream = this.canvas.captureStream(RECORD_FPS);
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, { mimeType: format.mimeType });
    } catch (error) {
      stream.getTracks().forEach((track) => track.stop());
      throw error;
    }

    this.recordStream = stream;
    this.recordChunks = [];
    this.recordFormat = format;
    this.recorder = recorder;
    this.recordResolve = null;
    this.recordReject = null;
    this.resumeAfterExport = this.machine.current === 'playing';

    recorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        this.recordChunks.push(event.data);
      }
    };
    recorder.onerror = () => {
      this.callbacks.onError?.('Error durante la grabación de vídeo');
    };
    recorder.onstop = () => {
      const chunks = this.recordChunks;
      const usedFormat = this.recordFormat ?? format;
      const resolve = this.recordResolve;
      const reject = this.recordReject;
      const wasFullSource = this.recordingFullSource;
      this.recordStream?.getTracks().forEach((track) => track.stop());
      this.recordStream = null;
      this.recorder = null;
      this.recordChunks = [];
      this.recordFormat = null;
      this.recordResolve = null;
      this.recordReject = null;
      this.recordingFullSource = false;
      this.stoppingFullSourceRecording = false;
      this.send('EXPORT_END');
      if (wasFullSource && this.source !== null) {
        this.source.setPreviewLimited(true);
        this.source.seek(0);
      }
      if (this.resumeAfterExport) {
        this.send('PLAY');
      } else if (wasFullSource) {
        // Volver al preview del vídeo tras una exportación automática.
        this.send('PLAY');
      }
      this.resumeAfterExport = false;
      if (chunks.length === 0) {
        reject?.(new Error('La grabación fue demasiado corta; mantén al menos 2 segundos'));
        return;
      }
      resolve?.({
        blob: new Blob(chunks, { type: usedFormat.mimeType }),
        format: usedFormat,
      });
    };

    this.send('EXPORT_START');
    recorder.start(1000);
    return format;
  }

  /**
   * Exporta automáticamente un vídeo de archivo cargado: reproduce y graba la
   * duración completa del original, intentando conservar el formato (MP4).
   */
  async exportSourceVideo(): Promise<VideoRecordingResult> {
    if (!this.canExportSourceVideo() || this.source === null) {
      throw new Error('No hay un vídeo de archivo cargado para exportar');
    }
    if (this.recorder !== null) {
      throw new Error('Ya hay una grabación en curso');
    }

    this.source.setPreviewLimited(false);
    this.source.seek(0);
    // Forzar reproducción desde el inicio para grabar el metraje completo.
    this.machine.reset();
    this.send('PLAY');

    const format = this.startVideoExport('mp4');
    this.recordingFullSource = true;
    this.stoppingFullSourceRecording = false;

    // startVideoExport() cambió el estado a EXPORT_START; reanudar reproducción del vídeo.
    this.source.play();
    if (this.machine.current !== 'exporting') {
      this.send('PLAY');
    }

    return new Promise<VideoRecordingResult>((resolve, reject) => {
      this.recordResolve = resolve;
      this.recordReject = reject;
      // Asegurar que el bucle siga vivo aunque el tab pierda foco brevemente.
      this.start();
      void format;
    });
  }

  stopVideoExport(): Promise<VideoRecordingResult> {
    const recorder = this.recorder;
    if (recorder === null) {
      return Promise.reject(new Error('No hay ninguna grabación en curso'));
    }
    return new Promise<VideoRecordingResult>((resolve, reject) => {
      if (recorder.state === 'inactive') {
        reject(new Error('La grabación ya había terminado'));
        return;
      }
      this.recordResolve = resolve;
      this.recordReject = reject;
      recorder.stop();
    });
  }

  private maybeStopFullSourceRecording(): void {
    if (!this.recordingFullSource || this.stoppingFullSourceRecording || this.recorder === null || this.source === null) {
      return;
    }
    if (this.source.hasReachedSourceEnd()) {
      this.stoppingFullSourceRecording = true;
      // Dar un pequeño margen para que el último frame se capture.
      window.setTimeout(() => {
        if (this.recorder !== null && this.recorder.state !== 'inactive') {
          this.recorder.stop();
        }
      }, 120);
    }
  }

  seek(time: number): void {
    this.source?.seek(time);
  }

  private fail(message: string): void {
    this.machine.send('ERROR');
    if (this.machine.current !== 'error') {
      this.machine.reset();
      this.machine.send('ERROR');
    }
    this.callbacks.onError?.(message);
    this.emitStats();
  }

  private readonly loop = (timestamp: number): void => {
    if (this.disposed) {
      return;
    }
    const delta = Math.min(0.1, Math.max(0, (timestamp - this.lastTimestamp) / 1000));
    this.lastTimestamp = timestamp;

    if (this.machine.current === 'playing' || this.machine.current === 'scrubbing') {
      this.elapsed += delta;
    }
    if (delta > 0) {
      this.fpsSamples.push(1 / delta);
      if (this.fpsSamples.length > FPS_WINDOW) {
        this.fpsSamples.shift();
      }
      this.fps = this.fpsSamples.reduce((sum, value) => sum + value, 0) / this.fpsSamples.length;
    }
    this.frame += 1;

    if (!this.contextLost) {
      this.render();
    }
    if (timestamp - this.lastStatsAt >= STATS_INTERVAL_MS) {
      this.lastStatsAt = timestamp;
      this.emitStats();
    }
    this.rafId = requestAnimationFrame(this.loop);
  };

  /** Dibuja un frame sin esperar al RAF (útil al cargar una fuente o si el tab está en segundo plano). */
  private renderNow(): void {
    if (!this.contextLost) {
      this.render();
    }
  }

  private render(): void {
    const gl = this.gl;
    const pipeline = this.pipeline;
    const source = this.source;
    const output = this.finalProgram;
    if (gl === null || pipeline === null || source === null || output === null) {
      return;
    }

    const desiredFrame = frameSizeForAspect(this.params.output.aspectRatio, source.size, MAX_PREVIEW_SIZE);
    const target = this.adaptive.update(this.fps, desiredFrame, MAX_PREVIEW_SIZE);
    if (this.canvas.width !== target.width || this.canvas.height !== target.height) {
      this.canvas.width = target.width;
      this.canvas.height = target.height;
    }
    pipeline.resize(target.width, target.height);
    source.update(this.elapsed);
    this.maybeStopFullSourceRecording();

    let inputTexture = source.texture;
    let writeIndex = -1;
    for (let index = 0; index < PASS_COUNT; index += 1) {
      writeIndex = (writeIndex + 1) % 2;
      const program = this.programs[index];
      if (program === undefined) {
        return;
      }
      pipeline.bindTarget(writeIndex);
      program.use();
      if (index === 0) {
        applyImageAdjustUniforms(program, this.params.imageAdjust, target, source.size);
      } else if (index === 1) {
        applyDigicamUniforms(program, this.params.digicam, this.elapsed, target);
      } else if (index === 2) {
        applyVhsUniforms(program, this.params.vhs, this.elapsed, this.frame, target);
        program.setVec2('u_opticalCenter', this.opticalCenter[0], this.opticalCenter[1]);
      } else if (index === 3) {
        applyBrandUniforms(program, this.params.brand, this.elapsed, target);
      } else if (index === 4) {
        applyCompressionUniforms(program, this.params.compression, this.elapsed, target);
      } else {
        applyDatamoshUniforms(program, this.params.datamosh, this.elapsed, target);
        program.bindTexture('u_history', pipeline.getHistoryTexture(), 1);
      }
      program.bindTexture('u_texture', inputTexture, 0);
      pipeline.renderQuad();
      inputTexture = pipeline.getTexture(writeIndex);
    }

    pipeline.bindTarget(null);
    output.use();
    output.bindTexture('u_texture', inputTexture, 0);
    pipeline.renderQuad();

    // Persistir frame final para el siguiente ciclo de datamosh simulado.
    pipeline.bindHistoryTarget();
    output.use();
    output.bindTexture('u_texture', inputTexture, 0);
    pipeline.renderQuad();

    const capture = this.pendingCapture;
    if (capture !== null) {
      this.pendingCapture = null;
      this.canvas.toBlob((blob) => {
        if (blob === null) {
          capture.reject(new Error('No se pudo generar el PNG'));
        } else {
          capture.resolve(blob);
        }
      }, PNG_FORMAT.mimeType);
    }
  }

  private emitStats(): void {
    const size = this.pipeline?.size ?? { width: 0, height: 0 };
    this.callbacks.onStats?.({
      fps: this.fps,
      width: size.width,
      height: size.height,
      status: this.machine.current,
      source: this.source?.sourceKind ?? 'procedural',
    });
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }
    this.stop();
    this.canvas.removeEventListener('webglcontextlost', this.onContextLost, false);
    this.canvas.removeEventListener('webglcontextrestored', this.onContextRestored, false);
    if (this.recorder !== null) {
      this.recorder.onstop = null;
      if (this.recorder.state !== 'inactive') {
        this.recorder.stop();
      }
      this.recorder = null;
    }
    this.recordStream?.getTracks().forEach((track) => track.stop());
    this.recordStream = null;
    this.pendingCapture?.reject(new Error('El motor se ha detenido'));
    this.pendingCapture = null;
    this.disposeResources();
    this.gl = null;
    this.disposed = true;
  }
}
