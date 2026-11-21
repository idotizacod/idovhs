import type { Size } from '../types';

/**
 * Quad a pantalla completa + dos framebuffers en ping-pong.
 * La salida de un pass se convierte en la textura de entrada del siguiente
 * sin leer de vuelta a la CPU.
 */
export class RenderPipeline {
  private quadVAO: WebGLVertexArrayObject | null = null;
  private quadBuffer: WebGLBuffer | null = null;
  private readonly fbos: WebGLFramebuffer[] = [];
  private readonly textures: WebGLTexture[] = [];
  private historyFBO: WebGLFramebuffer | null = null;
  private historyTexture: WebGLTexture | null = null;
  private width: number;
  private height: number;
  private disposed = false;

  constructor(
    private readonly gl: WebGL2RenderingContext,
    width: number,
    height: number,
  ) {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.initBuffers();
  }

  get size(): Size {
    return { width: this.width, height: this.height };
  }

  private initBuffers(): void {
    const gl = this.gl;
    const positions = new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1,
    ]);

    this.quadVAO = gl.createVertexArray();
    gl.bindVertexArray(this.quadVAO);
    this.quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    for (let i = 0; i < 2; i += 1) {
      this.createTarget(this.textures, this.fbos);
    }

    // Textura/FBO persistente para historial de frame (datamosh simulado).
    const historyTextures: WebGLTexture[] = [];
    const historyFbos: WebGLFramebuffer[] = [];
    this.createTarget(historyTextures, historyFbos);
    this.historyTexture = historyTextures[0] ?? null;
    this.historyFBO = historyFbos[0] ?? null;

    this.allocateTextures();
    this.clearHistory();
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  private createTarget(textures: WebGLTexture[], fbos: WebGLFramebuffer[]): void {
    const gl = this.gl;
    const texture = gl.createTexture();
    if (texture === null) {
      throw new Error('No se pudo crear la textura del FBO');
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const fbo = gl.createFramebuffer();
    if (fbo === null) {
      throw new Error('No se pudo crear el framebuffer');
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    textures.push(texture);
    fbos.push(fbo);
  }

  private allocateTextures(): void {
    const gl = this.gl;
    const allTextures = [...this.textures];
    if (this.historyTexture !== null) {
      allTextures.push(this.historyTexture);
    }
    allTextures.forEach((texture) => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA8,
        this.width,
        this.height,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null,
      );
    });

    const allFbos = [...this.fbos];
    if (this.historyFBO !== null) {
      allFbos.push(this.historyFBO);
    }
    allFbos.forEach((fbo) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
        throw new Error('Framebuffer incompleto: VRAM insuficiente o formato no soportado');
      }
    });
  }

  clearHistory(): void {
    if (this.disposed || this.historyFBO === null) {
      return;
    }
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.historyFBO);
    gl.viewport(0, 0, this.width, this.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  /** Redimensiona las texturas solo cuando cambian las dimensiones. */
  resize(width: number, height: number): void {
    if (this.disposed) {
      return;
    }
    const nextWidth = Math.max(1, Math.round(width));
    const nextHeight = Math.max(1, Math.round(height));
    if (nextWidth === this.width && nextHeight === this.height) {
      return;
    }
    this.width = nextWidth;
    this.height = nextHeight;
    this.allocateTextures();
    this.clearHistory();
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  }

  /** `null` enlaza el framebuffer por defecto (pantalla). */
  bindTarget(index: number | null): void {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, index === null ? null : this.getFBO(index));
    gl.viewport(0, 0, this.width, this.height);
  }

  getFBO(index: number): WebGLFramebuffer {
    return this.fbos[((index % 2) + 2) % 2];
  }

  getTexture(index: number): WebGLTexture {
    return this.textures[((index % 2) + 2) % 2];
  }

  bindHistoryTarget(): void {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.historyFBO);
    gl.viewport(0, 0, this.width, this.height);
  }

  getHistoryTexture(): WebGLTexture {
    if (this.historyTexture === null) {
      throw new Error('Textura de historial no disponible');
    }
    return this.historyTexture;
  }

  renderQuad(): void {
    if (this.disposed) {
      return;
    }
    const gl = this.gl;
    gl.bindVertexArray(this.quadVAO);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindVertexArray(null);
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }
    const gl = this.gl;
    this.textures.forEach((texture) => gl.deleteTexture(texture));
    this.fbos.forEach((fbo) => gl.deleteFramebuffer(fbo));
    if (this.historyTexture !== null) {
      gl.deleteTexture(this.historyTexture);
    }
    if (this.historyFBO !== null) {
      gl.deleteFramebuffer(this.historyFBO);
    }
    if (this.quadBuffer !== null) {
      gl.deleteBuffer(this.quadBuffer);
    }
    if (this.quadVAO !== null) {
      gl.deleteVertexArray(this.quadVAO);
    }
    this.disposed = true;
  }
}
