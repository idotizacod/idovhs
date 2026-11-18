import { IDO_COLORS } from '../../brand/tokens';
import type { EngineParams } from '../types';
import type { Engine } from '../core/Engine';

interface SliderOptions {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  format?: (value: number) => string;
}

interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectOptions<T extends string> {
  label: string;
  value: T;
  options: readonly SelectOption<T>[];
}

interface BoundControl {
  reset: () => void;
}

let controlCounter = 0;

function nextId(prefix: string): string {
  controlCounter += 1;
  return `${prefix}-${controlCounter}`;
}

function defaultFormat(value: number): string {
  return value.toFixed(2);
}

function createSlider(
  container: HTMLElement,
  options: SliderOptions,
  onChange: (value: number) => void,
): BoundControl {
  const id = nextId('slider');
  const row = document.createElement('div');
  row.className = 'control';

  const label = document.createElement('label');
  label.htmlFor = id;
  label.textContent = options.label;

  const output = document.createElement('output');
  output.className = 'control-value';
  const format = options.format ?? defaultFormat;
  output.textContent = format(options.value);
  output.htmlFor = id;

  const input = document.createElement('input');
  input.id = id;
  input.type = 'range';
  input.min = String(options.min);
  input.max = String(options.max);
  input.step = String(options.step);
  input.value = String(options.value);
  input.title = 'Doble click para volver al valor inicial';

  const apply = (): void => {
    const value = Number(input.value);
    output.textContent = format(value);
    onChange(value);
  };
  const reset = (): void => {
    input.value = String(options.value);
    apply();
  };
  input.addEventListener('input', apply);
  // Doble click: el fader vuelve a su posición inicial.
  input.addEventListener('dblclick', reset);

  row.append(label, output, input);
  container.append(row);
  return { reset };
}

function createSelect<T extends string>(
  container: HTMLElement,
  options: SelectOptions<T>,
  onChange: (value: T) => void,
): BoundControl {
  const id = nextId('select');
  const row = document.createElement('div');
  row.className = 'control control-select';

  const label = document.createElement('label');
  label.htmlFor = id;
  label.textContent = options.label;

  const select = document.createElement('select');
  select.id = id;
  select.title = 'Doble click para volver al valor inicial';
  options.options.forEach((option) => {
    const element = document.createElement('option');
    element.value = option.value;
    element.textContent = option.label;
    element.selected = option.value === options.value;
    select.append(element);
  });

  const apply = (): void => {
    onChange(select.value as T);
  };
  const reset = (): void => {
    select.value = options.value;
    apply();
  };
  select.addEventListener('change', apply);
  select.addEventListener('dblclick', reset);

  row.append(label, select);
  container.append(row);
  return { reset };
}

/** Construye los cuatro racks y devuelve un reset que restaura valores y parámetros. */
export function buildControls(params: EngineParams, engine: Engine): { reset: () => void } {
  const controls: BoundControl[] = [];
  const digicam = document.getElementById('rack-digicam');
  const vhs = document.getElementById('rack-vhs');
  const compression = document.getElementById('rack-compression');
  const brand = document.getElementById('rack-brand');

  if (digicam === null || vhs === null || compression === null || brand === null) {
    throw new Error('No se encontraron los contenedores de los racks');
  }

  controls.push(
    createSlider(
      digicam,
      {
        label: 'GANANCIA ISO',
        min: 100,
        max: 6400,
        step: 100,
        value: params.digicam.isoGain,
        format: (value) => `ISO ${value}`,
      },
      (value) => engine.setDigicam({ isoGain: value }),
    ),
    createSlider(
      digicam,
      {
        label: 'UMBRAL DE FLASH',
        min: 0,
        max: 1,
        step: 0.01,
        value: params.digicam.flashThreshold,
      },
      (value) => engine.setDigicam({ flashThreshold: value }),
    ),
    createSlider(
      digicam,
      {
        label: 'RADIO DE BLOOM',
        min: 1,
        max: 16,
        step: 1,
        value: params.digicam.flashBloomRadius,
        format: (value) => `${value} px`,
      },
      (value) => engine.setDigicam({ flashBloomRadius: value }),
    ),
    createSelect(
      digicam,
      {
        label: 'PERFIL DE SENSOR',
        value: params.digicam.sensorProfile,
        options: [
          { value: 'sony_ccd_v1', label: 'Sony CCD v1' },
          { value: 'early_cmos', label: 'CMOS temprano' },
          { value: 'lofi_ccd', label: 'Lo-fi CCD' },
        ],
      },
      (value) => engine.setDigicam({ sensorProfile: value }),
    ),
  );

  controls.push(
    createSlider(
      vhs,
      {
        label: 'TRACKING JITTER',
        min: 0,
        max: 1,
        step: 0.01,
        value: params.vhs.trackingJitter,
      },
      (value) => engine.setVhs({ trackingJitter: value }),
    ),
    createSlider(
      vhs,
      {
        label: 'DISTORSIÓN BARRIL',
        min: -0.5,
        max: 0.5,
        step: 0.01,
        value: params.vhs.barrelDistortion,
      },
      (value) => engine.setVhs({ barrelDistortion: value }),
    ),
    createSlider(
      vhs,
      {
        label: 'RUIDO MAGNÉTICO',
        min: 0,
        max: 1,
        step: 0.01,
        value: params.vhs.magneticNoise,
      },
      (value) => engine.setVhs({ magneticNoise: value }),
    ),
    createSlider(
      vhs,
      {
        label: 'COLOR BLEED',
        min: 0,
        max: 1,
        step: 0.01,
        value: params.vhs.colorBleed,
      },
      (value) => engine.setVhs({ colorBleed: value }),
    ),
    createSlider(
      vhs,
      {
        label: 'SCANLINES',
        min: 0,
        max: 1,
        step: 0.01,
        value: params.vhs.scanlineIntensity,
      },
      (value) => engine.setVhs({ scanlineIntensity: value }),
    ),
  );

  controls.push(
    createSlider(
      compression,
      {
        label: 'CALIDAD JPEG',
        min: 0.1,
        max: 1,
        step: 0.01,
        value: params.compression.jpegQuality,
      },
      (value) => engine.setCompression({ jpegQuality: value }),
    ),
    createSlider(
      compression,
      {
        label: 'TAMAÑO DE BLOQUE',
        min: 4,
        max: 16,
        step: 4,
        value: params.compression.blockinessSize,
        format: (value) => `${value}×${value} px`,
      },
      (value) => engine.setCompression({ blockinessSize: value }),
    ),
    createSlider(
      compression,
      {
        label: 'NIVELES DE POSTERIZACIÓN',
        min: 2,
        max: 16,
        step: 1,
        value: params.compression.posterizationLevels,
      },
      (value) => engine.setCompression({ posterizationLevels: value }),
    ),
    createSelect(
      compression,
      {
        label: 'MATRIZ DE DITHERING',
        value: params.compression.ditheringType,
        options: [
          { value: 'bayer_4x4', label: 'Bayer 4×4' },
          { value: 'bayer_8x8', label: 'Bayer 8×8' },
          { value: 'noise', label: 'Ruido' },
        ],
      },
      (value) => engine.setCompression({ ditheringType: value }),
    ),
  );

  const swatches = document.createElement('div');
  swatches.className = 'brand-swatches';
  Object.entries(IDO_COLORS).forEach(([name, color]) => {
    const swatch = document.createElement('span');
    swatch.className = 'brand-swatch';
    swatch.style.backgroundColor = color;
    swatch.title = `${name} · ${color}`;
    swatch.setAttribute('aria-label', `${name} ${color}`);
    swatches.append(swatch);
  });
  brand.append(swatches);

  controls.push(
    createSlider(
      brand,
      {
        label: 'INTENSIDAD DEL GRADE',
        min: 0,
        max: 1,
        step: 0.01,
        value: params.brand.gradeAmount,
      },
      (value) => engine.setBrand({ gradeAmount: value }),
    ),
  );

  return {
    reset: () => controls.forEach((control) => control.reset()),
  };
}
