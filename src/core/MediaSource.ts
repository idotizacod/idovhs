import type { Size, SourceKind } from '../types';
import { validateInputFile } from './mediaFormats';

type UploadSource = HTMLCanvasElement | HTMLImageElement | HTMLVideoElement;

const FILE_VIDEO_PREVIEW_SECONDS = 10;
const END_EPSILON = 0.05;

/** Ingesta de medios: convierte archivos, cámara o un patrón procedural en una textura GPU. */
export class MediaSource {
  private readonly gpuTexture: WebGLTexture;
  private readonly patternCanvas: HTMLCanvasElement;
  private readonly patternContext: CanvasRenderingContext2D;
  private image: HTMLImageElement | null = null;
  private video: HTMLVideoElement | null = null;
  private mediaStream: MediaStream | null = null;
  private objectUrl: string | null = null;
  private needsUpload = true;
  private kind: SourceKind = 'procedural';
  private fileVideo = false;
  private previewLimitSeconds = 0;
  private previewLimited = true;

  constructor(private readonly gl: WebGL2RenderingContext) {
    const texture = gl.createTexture();
    if (texture === null) {
      throw new Error('No se pudo crear la textura de origen');
    }
    this.gpuTexture = texture;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([16, 16, 20, 255]),
    );

    this.patternCanvas = document.createElement('canvas');
    this.patternCanvas.width = 1280;
    this.patternCanvas.height = 720;
    const context = this.patternCanvas.getContext('2d');
    if (context === null) {
      throw new Error('Canvas 2D no disponible para el patrón de prueba');
    }
    this.patternContext = context;
    this.drawPattern(0);
  }

  get texture(): WebGLTexture {
    return this.gpuTexture;
  }

  get sourceKind(): SourceKind {
    return this.kind;
  }

  get size(): Size {
    if (this.video !== null && this.video.videoWidth > 0) {
      return { width: this.video.videoWidth, height: this.video.videoHeight };
    }
    if (this.image !== null && this.image.naturalWidth > 0) {
      return { width: this.image.naturalWidth, height: this.image.naturalHeight };
    }
    return { width: this.patternCanvas.width, height: this.patternCanvas.height };
  }

  get duration(): number {
    const duration = this.video?.duration ?? 0;
    return Number.isFinite(duration) ? duration : 0;
  }

  get currentTime(): number {
    return this.video?.currentTime ?? 0;
  }

  /** Duración del tramo de preview para vídeos de archivo (máx. 10 s). */
  get previewDuration(): number {
    if (!this.fileVideo) {
      return this.duration;
    }
    return this.previewLimitSeconds;
  }

  /** Indica si la fuente actual es un vídeo de archivo apto para exportación completa. */
  isFileVideoSource(): boolean {
    return this.fileVideo && this.video !== null;
  }

  /** Activa o desactiva el límite de preview (10 s) para vídeos de archivo. */
  setPreviewLimited(limited: boolean): void {
    this.previewLimited = limited;
    if (!limited) {
      this.needsUpload = true;
      return;
    }
    if (this.fileVideo && this.video !== null && this.previewLimitSeconds > 0 && this.video.currentTime >= this.previewLimitSeconds) {
      this.video.currentTime = 0;
      this.needsUpload = true;
    }
  }

  /** True cuando un vídeo de archivo en modo completo llegó al final. */
  hasReachedSourceEnd(): boolean {
    if (!this.fileVideo || this.video === null) {
      return false;
    }
    const duration = this.duration;
    if (duration <= 0) {
      return false;
    }
    return this.video.ended || this.video.currentTime >= duration - END_EPSILON;
  }

  loadProcedural(): void {
    this.releaseCurrentSource();
    this.kind = 'procedural';
    this.needsUpload = true;
  }

  async loadFile(file: File): Promise<void> {
    // Validar antes de liberar la fuente actual: un archivo inválido no debe
    // detener lo que se está viendo.
    const input = validateInputFile(file);
    this.releaseCurrentSource();
    const url = URL.createObjectURL(file);
    this.objectUrl = url;

    try {
      if (input.kind === 'video') {
        const video = document.createElement('video');
        video.muted = true;
        // El bucle se gestiona manualmente para permitir preview de 10 s y exportación completa.
        video.loop = false;
        video.playsInline = true;
        video.preload = 'auto';
        this.video = video;
        this.kind = 'video';
        this.fileVideo = true;
        await this.waitForMetadata(video, url);
        const duration = Number.isFinite(video.duration) ? video.duration : 0;
        this.previewLimitSeconds = duration > 0 ? Math.min(FILE_VIDEO_PREVIEW_SECONDS, duration) : 0;
        this.previewLimited = true;
        this.needsUpload = true;
        await video.play().catch(() => undefined);
        return;
      }

      const image = new Image();
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('No se pudo decodificar la imagen'));
        image.src = url;
      });
      // onload solo garantiza la descarga; en imágenes grandes los píxeles aún
      // pueden no estar decodificados y texImage2D falla con INVALID_VALUE.
      // decode() fuerza la decodificación completa antes de publicar la fuente.
      await image.decode();
      this.image = image;
      this.kind = 'image';
      this.needsUpload = true;
    } catch (error) {
      // La fuente ya se liberó; limpiar la URL creada para no filtrar memoria.
      this.video = null;
      this.image = null;
      this.kind = 'procedural';
      this.fileVideo = false;
      this.previewLimitSeconds = 0;
      this.previewLimited = true;
      URL.revokeObjectURL(url);
      this.objectUrl = null;
      this.needsUpload = true;
      throw error;
    }
  }

  async loadCamera(): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('La cámara no está disponible en este navegador');
    }
    this.releaseCurrentSource();
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    });
    this.mediaStream = stream;
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    this.video = video;
    this.kind = 'camera';
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error('No se pudo iniciar la cámara'));
      video.srcObject = stream;
    });
    await video.play();
  }

  private waitForMetadata(video: HTMLVideoElement, url: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error('No se pudo decodificar el vídeo'));
      video.src = url;
      video.load();
    });
  }

  play(): void {
    void this.video?.play().catch(() => undefined);
  }

  pause(): void {
    if (this.video !== null) {
      this.video.pause();
    }
  }

  seek(time: number): void {
    if (this.video !== null && Number.isFinite(time)) {
      const max = this.fileVideo && this.previewLimited && this.previewLimitSeconds > 0 ? this.previewLimitSeconds : this.duration;
      this.video.currentTime = Math.max(0, Math.min(max, time));
      this.needsUpload = true;
    }
  }

  /** Sube a GPU el fotograma actual. Devuelve false si no hay datos nuevos. */
  update(time: number): boolean {
    if (this.kind === 'procedural') {
      this.drawPattern(time);
      this.upload(this.patternCanvas);
      return true;
    }
    if (this.kind === 'video' || this.kind === 'camera') {
      const video = this.video;
      if (video !== null && video.readyState >= 2) {
        if (this.fileVideo && this.previewLimited && this.previewLimitSeconds > 0 && video.currentTime >= this.previewLimitSeconds - END_EPSILON) {
          // Preview rápido: reproducir solo los primeros N segundos en bucle.
          video.currentTime = 0;
          if (video.paused) {
            void video.play().catch(() => undefined);
          }
          this.needsUpload = true;
        }
        if (!video.paused || this.needsUpload) {
          this.upload(video);
          this.needsUpload = false;
          return true;
        }
      }
      return false;
    }
    if (this.needsUpload && this.image !== null && this.image.complete && this.image.naturalWidth > 0) {
      this.needsUpload = false;
      this.upload(this.image);
      return true;
    }
    return false;
  }

  private upload(source: UploadSource): void {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.gpuTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    if (gl.getError() !== gl.NO_ERROR) {
      // La subida falló: permitir reintentar en el siguiente frame.
      this.needsUpload = true;
    }
  }

  private drawPattern(time: number): void {
    const ctx = this.patternContext;
    const width = this.patternCanvas.width;
    const height = this.patternCanvas.height;

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#14213d');
    gradient.addColorStop(0.5, '#3a2c5f');
    gradient.addColorStop(1, '#0f0f14');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += 80) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const barHeight = 90;
    for (let i = 0; i < 7; i += 1) {
      ctx.fillStyle = `hsl(${(i * 47) % 360} 85% 55%)`;
      ctx.fillRect(120, 90 + i * (barHeight + 10), width - 240 - i * 40, barHeight);
    }

    const pulse = Math.sin(time * 2) * 0.5 + 0.5;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + pulse * 0.5})`;
    ctx.beginPath();
    ctx.arc(width * (0.5 + Math.sin(time) * 0.22), height * 0.62, 70, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'bold 46px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('SASED // TEST PATTERN', 120, height - 60);
  }

  private releaseCurrentSource(): void {
    this.video?.pause();
    if (this.video !== null) {
      this.video.srcObject = null;
      this.video.removeAttribute('src');
      this.video.load();
    }
    this.video = null;
    this.image = null;
    this.fileVideo = false;
    this.previewLimitSeconds = 0;
    this.previewLimited = true;
    this.mediaStream?.getTracks().forEach((track) => track.stop());
    this.mediaStream = null;
    if (this.objectUrl !== null) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
    this.needsUpload = true;
  }

  dispose(): void {
    this.releaseCurrentSource();
    this.gl.deleteTexture(this.gpuTexture);
  }
}
