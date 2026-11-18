import { afterEach, describe, expect, it, vi } from 'vitest';
import { INPUT_ACCEPT, pickVideoFormat, validateInputFile } from '../src/core/mediaFormats';

function file(name: string, type = ''): File {
  return { name, type } as File;
}

describe('formatos de entrada', () => {
  it('acepta jpg, jpeg, png y mp4', () => {
    expect(validateInputFile(file('foto.jpg', 'image/jpeg'))).toEqual({
      extension: 'jpg',
      kind: 'image',
    });
    expect(validateInputFile(file('foto.JPEG', 'image/jpeg'))).toEqual({
      extension: 'jpeg',
      kind: 'image',
    });
    expect(validateInputFile(file('foto.png', 'image/png'))).toEqual({
      extension: 'png',
      kind: 'image',
    });
    expect(validateInputFile(file('clip.mp4', 'video/mp4'))).toEqual({
      extension: 'mp4',
      kind: 'video',
    });
  });

  it('rechaza formatos fuera de la lista', () => {
    expect(() => validateInputFile(file('anim.webp', 'image/webp'))).toThrow(
      'Formato no soportado',
    );
    expect(() => validateInputFile(file('clip.mov', 'video/quicktime'))).toThrow(
      'Formato no soportado',
    );
    expect(() => validateInputFile(file('sin_extension'))).toThrow('Formato no soportado');
  });

  it('rechaza un MIME que no coincide con la extensión', () => {
    expect(() => validateInputFile(file('foto.png', 'image/gif'))).toThrow('no coincide');
    expect(() => validateInputFile(file('clip.mp4', 'video/webm'))).toThrow('no coincide');
  });

  it('acepta MIME ausente o genérico', () => {
    expect(validateInputFile(file('foto.jpg')).kind).toBe('image');
    expect(validateInputFile(file('clip.mp4', 'application/octet-stream')).kind).toBe('video');
  });

  it('expone la lista usada por el input de archivos', () => {
    expect(INPUT_ACCEPT).toBe('.jpg,.jpeg,.png,.mp4');
  });
});

describe('formatos de salida', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('prefiere MP4 cuando está disponible', () => {
    vi.stubGlobal('MediaRecorder', {
      isTypeSupported: (type: string) => type === 'video/mp4',
    });
    expect(pickVideoFormat()).toEqual({ mimeType: 'video/mp4', extension: 'mp4' });
  });

  it('usa WebM como fallback', () => {
    vi.stubGlobal('MediaRecorder', {
      isTypeSupported: (type: string) => type.startsWith('video/webm'),
    });
    expect(pickVideoFormat()).toEqual({ mimeType: 'video/webm;codecs=vp9', extension: 'webm' });
  });

  it('avisa si el navegador no puede grabar', () => {
    vi.stubGlobal('MediaRecorder', undefined);
    expect(() => pickVideoFormat()).toThrow('no está disponible');
  });
});
