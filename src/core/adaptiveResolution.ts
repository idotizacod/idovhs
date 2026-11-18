import type { Size } from '../types';

const SLOW_FPS = 55;
const FAST_FPS = 58.5;
const SLOW_FRAMES_TO_REDUCE = 30;
const FAST_FRAMES_TO_RESTORE = 180;
const REDUCTION_FACTOR = 0.85;
const RESTORE_FACTOR = 1.1;
const MIN_WIDTH = 320;

export function fitWithin(size: Size, max: Size): Size {
  if (size.width <= 0 || size.height <= 0) {
    return { width: max.width, height: max.height };
  }
  const scale = Math.min(1, max.width / size.width, max.height / size.height);
  return {
    width: Math.max(1, Math.round(size.width * scale)),
    height: Math.max(1, Math.round(size.height * scale)),
  };
}

export class AdaptiveResolution {
  private scale = 1;
  private slowFrames = 0;
  private fastFrames = 0;

  /** Devuelve el tamaño de render recomendado aplicando histéresis sobre el FPS. */
  update(fps: number, source: Size, max: Size): Size {
    if (fps > 0 && fps < SLOW_FPS) {
      this.slowFrames += 1;
      this.fastFrames = 0;
    } else if (fps >= FAST_FPS) {
      this.fastFrames += 1;
      this.slowFrames = 0;
    } else {
      this.slowFrames = 0;
      this.fastFrames = 0;
    }

    if (this.slowFrames >= SLOW_FRAMES_TO_REDUCE) {
      this.scale = Math.min(1, Math.max(MIN_WIDTH / source.width, this.scale * REDUCTION_FACTOR));
      this.slowFrames = 0;
    } else if (this.fastFrames >= FAST_FRAMES_TO_RESTORE) {
      this.scale = Math.min(1, this.scale * RESTORE_FACTOR);
      this.fastFrames = 0;
    }

    const bounded = fitWithin(source, max);
    return {
      width: Math.max(1, Math.round(bounded.width * this.scale)),
      height: Math.max(1, Math.round(bounded.height * this.scale)),
    };
  }

  reset(): void {
    this.scale = 1;
    this.slowFrames = 0;
    this.fastFrames = 0;
  }
}
