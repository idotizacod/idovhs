import './styles.css';
import logoUrl from '../brand/logo.png?url';
import { cloneDefaultParams } from './config';
import { Engine } from './core/Engine';
import { getSupportedVideoExtensions, INPUT_ACCEPT, type OutputExtension } from './core/mediaFormats';
import { buildControls } from './ui/controls';
import type { RenderStats } from './types';

function element<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (found === null) {
    throw new Error(`Elemento #${id} no encontrado`);
  }
  return found as T;
}

const canvas = element<HTMLCanvasElement>('viewport');
const statusPill = element<HTMLElement>('status-pill');
const errorMessage = element<HTMLElement>('error-message');
const contextLost = element<HTMLElement>('context-lost');
const fileInput = element<HTMLInputElement>('file-input');
fileInput.accept = INPUT_ACCEPT;

const timelineBar = element<HTMLElement>('timeline-bar');
const timelineInput = element<HTMLInputElement>('timeline');
const timeCurrent = element<HTMLElement>('time-current');
const timeDuration = element<HTMLElement>('time-duration');

const params = cloneDefaultParams();

// Logo compartido: el mismo archivo alimenta cabecera y favicon.
element<HTMLImageElement>('brand-mark').src = logoUrl;
const favicon = document.createElement('link');
favicon.rel = 'icon';
favicon.type = 'image/png';
favicon.href = logoUrl;
document.head.append(favicon);

function showError(message: string): void {
  errorMessage.textContent = `ERROR: ${message}`;
  errorMessage.hidden = false;
}

function clearError(): void {
  errorMessage.textContent = '';
  errorMessage.hidden = true;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }
  const whole = Math.floor(seconds);
  const minutes = Math.floor(whole / 60);
  const secs = whole % 60;
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

function getTimelineDuration(): number {
  if (!engine.canExportSourceVideo()) {
    return 0;
  }
  // Durante exportación completa del archivo, la barra refleja la duración original.
  if (engine.isExportingSourceVideo()) {
    return engine.getSourceDuration();
  }
  // En preview mostramos el tramo de 10 s (o la duración total si es menor).
  const preview = engine.getSourcePreviewDuration();
  if (preview > 0) {
    return preview;
  }
  return engine.getSourceDuration();
}

let scrubbingTimeline = false;
let wasPlayingBeforeScrub = false;

function updateTimeline(): void {
  const duration = getTimelineDuration();
  const show = duration > 0.01;
  timelineBar.hidden = !show;

  if (!show) {
    requestAnimationFrame(updateTimeline);
    return;
  }

  const state = engine.state;
  const current = Math.max(0, Math.min(duration, state.currentTime));
  if (timelineInput.max !== String(duration)) {
    timelineInput.max = String(duration);
  }
  if (!scrubbingTimeline) {
    timelineInput.value = String(current);
    timeCurrent.textContent = formatTime(current);
  }
  timeDuration.textContent = formatTime(duration);
  timelineInput.disabled = engine.isRecording();

  requestAnimationFrame(updateTimeline);
}

function showStats(stats: RenderStats): void {
  statusPill.textContent = stats.status.toUpperCase();
  statusPill.dataset.status = stats.status;
}

let engine: Engine;
try {
  engine = new Engine(canvas, params, {
    onStats: showStats,
    onError: showError,
    onContextChange: (lost) => {
      contextLost.hidden = !lost;
    },
  });
} catch (error) {
  showError(error instanceof Error ? error.message : String(error));
  throw error;
}

const controls = buildControls(params, engine);

element<HTMLButtonElement>('btn-play').addEventListener('click', () => {
  clearError();
  engine.send('PLAY');
});
element<HTMLButtonElement>('btn-pause').addEventListener('click', () => {
  engine.send('PAUSE');
});
element<HTMLButtonElement>('btn-reset').addEventListener('click', () => {
  clearError();
  controls.reset();
  engine.send('RESET');
});

fileInput.addEventListener('change', () => {
  const file = fileInput.files?.[0];
  if (file !== undefined) {
    clearError();
    void engine.loadFile(file);
  }
});

timelineInput.addEventListener('pointerdown', () => {
  if (timelineBar.hidden || timelineInput.disabled) {
    return;
  }
  scrubbingTimeline = true;
  wasPlayingBeforeScrub = engine.status === 'playing';
  engine.send('SCRUB_START');
});

timelineInput.addEventListener('input', () => {
  if (timelineBar.hidden) {
    return;
  }
  const value = Number(timelineInput.value);
  if (Number.isFinite(value)) {
    engine.seek(value);
    timeCurrent.textContent = formatTime(value);
  }
});

const finishScrub = (): void => {
  if (!scrubbingTimeline) {
    return;
  }
  scrubbingTimeline = false;
  engine.send('SCRUB_END');
  if (wasPlayingBeforeScrub) {
    engine.send('PLAY');
  }
};
timelineInput.addEventListener('change', finishScrub);
timelineInput.addEventListener('pointerup', finishScrub);
timelineInput.addEventListener('pointercancel', finishScrub);

const exportPngButton = element<HTMLButtonElement>('btn-export-png');
const exportVideoButton = element<HTMLButtonElement>('btn-export-video');
const videoExportChooser = element<HTMLElement>('video-export-chooser');
const formatMp4Button = element<HTMLButtonElement>('btn-format-mp4');
const formatWebmButton = element<HTMLButtonElement>('btn-format-webm');
const exportConfirmButton = element<HTMLButtonElement>('btn-export-confirm');
const exportCancelButton = element<HTMLButtonElement>('btn-export-cancel');

function reportError(error: unknown): void {
  showError(error instanceof Error ? error.message : String(error));
}

function downloadBlob(blob: Blob, extension: string): void {
  const now = new Date();
  const pad = (value: number): string => String(value).padStart(2, '0');
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `idovhs-${stamp}.${extension}`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

let selectedVideoFormat: OutputExtension | null = null;
let videoExporting = false;

function setFormatSelection(format: OutputExtension | null): void {
  selectedVideoFormat = format;
  formatMp4Button.setAttribute('aria-pressed', format === 'mp4' ? 'true' : 'false');
  formatWebmButton.setAttribute('aria-pressed', format === 'webm' ? 'true' : 'false');
  exportConfirmButton.disabled = format === null;
}

function closeVideoExportChooser(): void {
  videoExportChooser.hidden = true;
  exportVideoButton.hidden = false;
  exportVideoButton.disabled = false;
  exportVideoButton.textContent = 'EXPORTAR VIDEO';
  setFormatSelection(null);
}

function openVideoExportChooser(): void {
  if (videoExporting || engine.isRecording()) {
    return;
  }
  const supported = getSupportedVideoExtensions();
  if (supported.length === 0) {
    reportError('La grabación de vídeo no está disponible en este navegador');
    return;
  }
  formatMp4Button.disabled = !supported.includes('mp4');
  formatWebmButton.disabled = !supported.includes('webm');
  setFormatSelection(null);
  exportVideoButton.hidden = true;
  videoExportChooser.hidden = false;
}

exportPngButton.addEventListener('click', () => {
  clearError();
  exportPngButton.disabled = true;
  engine.exportPng()
    .then((blob) => downloadBlob(blob, 'png'))
    .catch(reportError)
    .finally(() => {
      exportPngButton.disabled = false;
    });
});

exportVideoButton.addEventListener('click', () => {
  clearError();
  openVideoExportChooser();
});

formatMp4Button.addEventListener('click', () => {
  if (!formatMp4Button.disabled) {
    setFormatSelection('mp4');
  }
});

formatWebmButton.addEventListener('click', () => {
  if (!formatWebmButton.disabled) {
    setFormatSelection('webm');
  }
});

exportCancelButton.addEventListener('click', () => {
  if (videoExporting) {
    return;
  }
  clearError();
  closeVideoExportChooser();
});

exportConfirmButton.addEventListener('click', () => {
  clearError();
  const format = selectedVideoFormat;
  if (format === null || videoExporting) {
    return;
  }
  videoExporting = true;
  exportPngButton.disabled = true;
  exportConfirmButton.disabled = true;
  exportCancelButton.disabled = true;
  formatMp4Button.disabled = true;
  formatWebmButton.disabled = true;
  exportConfirmButton.textContent = 'EXPORTANDO…';

  engine.exportVideo(format)
    .then(({ blob, format: usedFormat }) => downloadBlob(blob, usedFormat.extension))
    .catch(reportError)
    .finally(() => {
      videoExporting = false;
      exportPngButton.disabled = false;
      exportCancelButton.disabled = false;
      exportConfirmButton.textContent = 'CONFIRMAR';
      closeVideoExportChooser();
    });
});

engine.send('PLAY');
engine.start();
requestAnimationFrame(updateTimeline);
window.addEventListener('beforeunload', () => engine.dispose());

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => undefined);
  });
}
