import { describe, expect, it } from 'vitest';
import { EngineStateMachine } from '../src/core/stateMachine';

describe('máquina de estados del motor', () => {
  it('arranca en idle y permite PLAY', () => {
    const machine = new EngineStateMachine();
    expect(machine.current).toBe('idle');
    expect(machine.send('PLAY')).toBe(true);
    expect(machine.current).toBe('playing');
  });

  it('bloquea transiciones inválidas', () => {
    const machine = new EngineStateMachine();
    expect(machine.send('PAUSE')).toBe(false);
    expect(machine.current).toBe('idle');
  });

  it('gestiona scrubbing y exportación', () => {
    const machine = new EngineStateMachine();
    machine.send('PLAY');
    expect(machine.send('SCRUB_START')).toBe(true);
    expect(machine.current).toBe('scrubbing');
    expect(machine.send('PLAY')).toBe(false);
    expect(machine.send('SCRUB_END')).toBe(true);
    expect(machine.current).toBe('paused');
    expect(machine.send('EXPORT_START')).toBe(true);
    expect(machine.current).toBe('exporting');
    expect(machine.send('EXPORT_END')).toBe(true);
    expect(machine.current).toBe('paused');
  });

  it('solo permite RESET desde error', () => {
    const machine = new EngineStateMachine();
    machine.send('PLAY');
    machine.send('ERROR');
    expect(machine.current).toBe('error');
    expect(machine.send('PAUSE')).toBe(false);
    expect(machine.send('RESET')).toBe(true);
    expect(machine.current).toBe('idle');
  });
});
