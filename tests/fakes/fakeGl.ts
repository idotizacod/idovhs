export interface GlCall {
  name: string;
  args: readonly unknown[];
}

export interface FakeGl {
  gl: WebGL2RenderingContext;
  calls: GlCall[];
}

/** Mock mínimo: registra llamadas sin necesitar un contexto WebGL real. */
export function createFakeGl(): FakeGl {
  const calls: GlCall[] = [];
  const record = (name: string) => (...args: unknown[]): void => {
    calls.push({ name, args });
  };

  const gl = {
    ARRAY_BUFFER: 0x8894,
    COLOR_ATTACHMENT0: 0x8ce0,
    FLOAT: 0x1406,
    FRAMEBUFFER: 0x8d40,
    FRAMEBUFFER_COMPLETE: 0x8cd5,
    LINEAR: 0x2601,
    RGBA: 0x1908,
    RGBA8: 0x8058,
    STATIC_DRAW: 0x88e4,
    TEXTURE_2D: 0x0de1,
    TEXTURE_MAG_FILTER: 0x2800,
    TEXTURE_MIN_FILTER: 0x2801,
    TEXTURE_WRAP_S: 0x2802,
    TEXTURE_WRAP_T: 0x2803,
    TRIANGLES: 0x0004,
    UNSIGNED_BYTE: 0x1401,
    createVertexArray: record('createVertexArray'),
    bindVertexArray: record('bindVertexArray'),
    createBuffer: record('createBuffer'),
    bindBuffer: record('bindBuffer'),
    bufferData: record('bufferData'),
    enableVertexAttribArray: record('enableVertexAttribArray'),
    vertexAttribPointer: record('vertexAttribPointer'),
    createTexture: record('createTexture'),
    bindTexture: record('bindTexture'),
    texImage2D: record('texImage2D'),
    texParameteri: record('texParameteri'),
    createFramebuffer: record('createFramebuffer'),
    bindFramebuffer: record('bindFramebuffer'),
    framebufferTexture2D: record('framebufferTexture2D'),
    checkFramebufferStatus: () => 0x8cd5,
    viewport: record('viewport'),
    drawArrays: record('drawArrays'),
    deleteTexture: record('deleteTexture'),
    deleteFramebuffer: record('deleteFramebuffer'),
    deleteBuffer: record('deleteBuffer'),
    deleteVertexArray: record('deleteVertexArray'),
  };

  return { gl: gl as unknown as WebGL2RenderingContext, calls };
}
