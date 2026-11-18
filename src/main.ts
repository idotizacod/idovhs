import './styles.css';
import logoUrl from '../brand/logo.png?url';
import { cloneDefaultParams } from './config';
import { Engine } from './core/Engine';
import { INPUT_ACCEPT } from './core/mediaFormats';
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

const exportPngButton = element<HTMLButtonElement>('btn-export-png');
const exportMp4Button = element<HTMLButtonElement>('btn-export-mp4');

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

exportMp4Button.addEventListener('click', () => {
  clearError();
  if (engine.isRecording()) {
    exportMp4Button.disabled = true;
    engine.stopVideoExport()
      .then(({ blob, format }) => downloadBlob(blob, format.extension))
      .catch(reportError)
      .finally(() => {
        exportMp4Button.disabled = false;
        exportMp4Button.textContent = 'EXPORTAR MP4';
        exportPngButton.disabled = false;
      });
    return;
  }
  try {
    const format = engine.startVideoExport();
    exportPngButton.disabled = true;
    exportMp4Button.textContent = format.extension === 'mp4' ? '■ DETENER' : '■ DETENER (WEBM)';
  } catch (error) {
    reportError(error);
  }
});

engine.send('PLAY');
engine.start();
window.addEventListener('beforeunload', () => engine.dispose());
