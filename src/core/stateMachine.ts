import type { EngineEvent, EngineStatus } from '../types';

const EVENT_TARGET: Readonly<Record<EngineEvent, EngineStatus>> = {
  PLAY: 'playing',
  PAUSE: 'paused',
  SCRUB_START: 'scrubbing',
  SCRUB_END: 'paused',
  EXPORT_START: 'exporting',
  EXPORT_END: 'paused',
  ERROR: 'error',
  RESET: 'idle',
};

const ALLOWED_EVENTS: Readonly<Record<EngineStatus, readonly EngineEvent[]>> = {
  idle: ['PLAY', 'SCRUB_START', 'EXPORT_START', 'ERROR'],
  playing: ['PAUSE', 'SCRUB_START', 'EXPORT_START', 'ERROR'],
  paused: ['PLAY', 'SCRUB_START', 'EXPORT_START', 'ERROR'],
  scrubbing: ['SCRUB_END', 'ERROR'],
  exporting: ['EXPORT_END', 'ERROR'],
  error: ['RESET'],
};

export class EngineStateMachine {
  private status: EngineStatus = 'idle';

  get current(): EngineStatus {
    return this.status;
  }

  can(event: EngineEvent): boolean {
    return ALLOWED_EVENTS[this.status].includes(event);
  }

  send(event: EngineEvent): boolean {
    if (!this.can(event)) {
      return false;
    }
    this.status = EVENT_TARGET[event];
    return true;
  }

  reset(): void {
    this.status = 'idle';
  }
}
