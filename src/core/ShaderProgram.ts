import type { UniformSink } from './uniforms';

export class ShaderProgram implements UniformSink {
  readonly program: WebGLProgram;
  private readonly locations = new Map<string, WebGLUniformLocation | null>();
  private disposed = false;

  constructor(
    private readonly gl: WebGL2RenderingContext,
    vertexSource: string,
    fragmentSource: string,
    label = 'shader',
  ) {
    const vertex = this.compile(gl.VERTEX_SHADER, vertexSource, `${label}:vertex`);
    const fragment = this.compile(gl.FRAGMENT_SHADER, fragmentSource, `${label}:fragment`);
    const program = gl.createProgram();
    if (program === null) {
      throw new Error(`No se pudo crear el programa ${label}`);
    }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(program) ?? 'sin detalles';
      gl.deleteProgram(program);
      throw new Error(`Error enlazando ${label}: ${log}`);
    }
    this.program = program;
  }

  private compile(type: number, source: string, label: string): WebGLShader {
    const shader = this.gl.createShader(type);
    if (shader === null) {
      throw new Error(`No se pudo crear el shader ${label}`);
    }
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const log = this.gl.getShaderInfoLog(shader) ?? 'sin detalles';
      this.gl.deleteShader(shader);
      throw new Error(`Error compilando ${label}: ${log}`);
    }
    return shader;
  }

  private location(name: string): WebGLUniformLocation | null {
    if (!this.locations.has(name)) {
      this.locations.set(name, this.gl.getUniformLocation(this.program, name));
    }
    return this.locations.get(name) ?? null;
  }

  use(): void {
    if (!this.disposed) {
      this.gl.useProgram(this.program);
    }
  }

  setFloat(name: string, value: number): void {
    const location = this.location(name);
    if (location !== null) {
      this.gl.uniform1f(location, value);
    }
  }

  setInt(name: string, value: number): void {
    const location = this.location(name);
    if (location !== null) {
      this.gl.uniform1i(location, value);
    }
  }

  setVec2(name: string, x: number, y: number): void {
    const location = this.location(name);
    if (location !== null) {
      this.gl.uniform2f(location, x, y);
    }
  }

  setVec3(name: string, x: number, y: number, z: number): void {
    const location = this.location(name);
    if (location !== null) {
      this.gl.uniform3f(location, x, y, z);
    }
  }

  bindTexture(name: string, texture: WebGLTexture, unit: number): void {
    const location = this.location(name);
    if (location === null) {
      return;
    }
    this.gl.activeTexture(this.gl.TEXTURE0 + unit);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.uniform1i(location, unit);
  }

  dispose(): void {
    if (!this.disposed) {
      this.gl.deleteProgram(this.program);
      this.disposed = true;
    }
  }
}
