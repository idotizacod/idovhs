/** Formatos de entrada y salida soportados por IDOVHS. */

export type MediaKind = 'image' | 'video';
export type InputExtension = 'jpg' | 'jpeg' | 'png' | 'mp4';
export type OutputExtension = 'png' | 'mp4' | 'webm';

interface InputFormat {
  readonly extension: InputExtension;
  readonly mimeTypes: readonly string[];
  readonly kind: MediaKind;
}

const INPUT_FORMATS: readonly InputFormat[] = [
  { extension: 'jpg', mimeTypes: ['image/jpeg', 'image/jpg'], kind: 'image' },
  { extension: 'jpeg', mimeTypes: ['image/jpeg', 'image/jpg'], kind: 'image' },
  { extension: 'png', mimeTypes: ['image/png'], kind: 'image' },
  { extension: 'mp4', mimeTypes: ['video/mp4'], kind: 'video' },
];

/** Lista para el atributo `accept` del input de archivos. */
export const INPUT_ACCEPT = '.jpg,.jpeg,.png,.mp4';

/** Etiqueta usada en los mensajes de error. */
export const INPUT_LABEL = 'JPG, PNG o MP4';

export interface InputFileInfo {
  readonly extension: InputExtension;
  readonly kind: MediaKind;
}

/**
 * Valida extension y MIME. Si el navegador no informa el MIME (cadena vacía),
 * se confía en la extensión; si lo informa, debe ser compatible con ella.
 */
export function validateInputFile(file: File): InputFileInfo {
  const name = file.name.toLowerCase();
  const dot = name.lastIndexOf('.');
  const extension = dot < 0 ? '' : name.slice(dot + 1);

  const format = INPUT_FORMATS.find((entry) => entry.extension === extension);
  if (format === undefined) {
    throw new Error(`Formato no soportado: usa ${INPUT_LABEL}`);
  }

  const mime = file.type.trim().toLowerCase();
  if (mime !== '' && mime !== 'application/octet-stream' && !format.mimeTypes.includes(mime)) {
    throw new Error(`El tipo "${mime}" no coincide con la extensión .${extension}`);
  }

  return { extension: format.extension, kind: format.kind };
}

export interface OutputFormat {
  readonly mimeType: string;
  readonly extension: OutputExtension;
}

/** Exportación de un fotograma. */
export const PNG_FORMAT: OutputFormat = { mimeType: 'image/png', extension: 'png' };

/**
 * Elige el mejor códec disponible. Si se indica un formato preferido, se intentan
 * primero sus contenedores (p. ej. preservar MP4 al exportar un MP4 de origen).
 * WebM es el fallback de navegadores como Firefox, que no pueden grabar `video/mp4`.
 */
/** Devuelve las extensiones de contenedor de vídeo soportadas para grabación. */
export function getSupportedVideoExtensions(): OutputExtension[] {
  if (typeof MediaRecorder === 'undefined') {
    return [];
  }
  const supported: OutputExtension[] = [];
  const mp4 = ['video/mp4;codecs=avc1.42E01E', 'video/mp4'].some((type) =>
    MediaRecorder.isTypeSupported(type),
  );
  if (mp4) {
    supported.push('mp4');
  }
  const webm = ['video/webm;codecs=vp9', 'video/webm'].some((type) =>
    MediaRecorder.isTypeSupported(type),
  );
  if (webm) {
    supported.push('webm');
  }
  return supported;
}

export function pickVideoFormat(preferred?: OutputExtension): OutputFormat {
  if (typeof MediaRecorder === 'undefined') {
    throw new Error('La grabación de vídeo no está disponible en este navegador');
  }

  const candidates: readonly OutputFormat[] = [
    { mimeType: 'video/mp4;codecs=avc1.42E01E', extension: 'mp4' },
    { mimeType: 'video/mp4', extension: 'mp4' },
    { mimeType: 'video/webm;codecs=vp9', extension: 'webm' },
    { mimeType: 'video/webm', extension: 'webm' },
  ];
  const ordered =
    preferred === undefined
      ? candidates
      : [...candidates.filter((candidate) => candidate.extension === preferred), ...candidates.filter((candidate) => candidate.extension !== preferred)];
  const found = ordered.find((candidate) => MediaRecorder.isTypeSupported(candidate.mimeType));
  if (found === undefined) {
    throw new Error('Este navegador no puede grabar MP4 ni WebM');
  }
  return found;
}
