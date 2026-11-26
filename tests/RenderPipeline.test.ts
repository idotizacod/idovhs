import { describe, expect, it } from 'vitest';
import { RenderPipeline } from '../src/core/RenderPipeline';
import { createFakeGl } from './fakes/fakeGl';

describe('RenderPipeline', () => {
  it('crea dos texturas FBO y las redimensiona sin fugas', () => {
    const { gl, calls } = createFakeGl();
    const pipeline = new RenderPipeline(gl, 1280, 720);

    const initialUploads = calls.filter((call) => call.name === 'texImage2D');
    expect(initialUploads).toHaveLength(3);
    expect(initialUploads[0]?.args[3]).toBe(1280);
    expect(initialUploads[0]?.args[4]).toBe(720);

    pipeline.resize(640, 360);
    const uploads = calls.filter((call) => call.name === 'texImage2D');
    expect(uploads).toHaveLength(6);
    expect(uploads[3]?.args[3]).toBe(640);
    expect(uploads[4]?.args[4]).toBe(360);

    pipeline.resize(640, 360);
    expect(calls.filter((call) => call.name === 'texImage2D')).toHaveLength(6);
  });

  it('alterna FBOs y dibuja el quad', () => {
    const { gl, calls } = createFakeGl();
    const pipeline = new RenderPipeline(gl, 320, 180);

    pipeline.bindTarget(0);
    pipeline.renderQuad();
    pipeline.bindTarget(1);
    pipeline.renderQuad();
    pipeline.bindTarget(null);

    const framebufferBinds = calls.filter((call) => call.name === 'bindFramebuffer');
    expect(framebufferBinds).toHaveLength(12);
    expect(framebufferBinds[11]?.args[1]).toBeNull();
    expect(calls.filter((call) => call.name === 'drawArrays')).toHaveLength(2);
    expect(pipeline.getFBO(2)).toBe(pipeline.getFBO(0));
    expect(pipeline.getTexture(3)).toBe(pipeline.getTexture(1));
  });

  it('libera todos los recursos WebGL al dispose', () => {
    const { gl, calls } = createFakeGl();
    const pipeline = new RenderPipeline(gl, 320, 180);
    pipeline.dispose();
    pipeline.dispose();

    expect(calls.filter((call) => call.name === 'deleteTexture')).toHaveLength(3);
    expect(calls.filter((call) => call.name === 'deleteFramebuffer')).toHaveLength(3);
    expect(calls.filter((call) => call.name === 'deleteBuffer')).toHaveLength(1);
    expect(calls.filter((call) => call.name === 'deleteVertexArray')).toHaveLength(1);
  });
});
