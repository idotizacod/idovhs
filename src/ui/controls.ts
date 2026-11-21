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

/** Construye los racks de parámetros y devuelve un reset que restaura valores y parámetros. */
export function buildControls(params: EngineParams, engine: Engine): { reset: () => void } {
  const controls: BoundControl[] = [];
  const imageAdjust = document.getElementById('rack-image-adjust');
  const digicam = document.getElementById('rack-digicam');
  const vhs = document.getElementById('rack-vhs');
  const compression = document.getElementById('rack-compression');
  const brand = document.getElementById('rack-brand');
  const datamosh = document.getElementById('rack-datamosh');

  if (
    imageAdjust === null ||
    digicam === null ||
    vhs === null ||
    compression === null ||
    brand === null ||
    datamosh === null
  ) {
    throw new Error('No se encontraron los contenedores de los racks');
  }

  const hslDropdown = document.createElement('details');
  hslDropdown.className = 'control-dropdown';
  const hslSummary = document.createElement('summary');
  hslSummary.textContent = 'HSL SATURACIÓN (POR COLOR)';
  const hslBody = document.createElement('div');
  hslBody.className = 'control-dropdown-body';
  hslDropdown.append(hslSummary, hslBody);

  controls.push(
    createSelect(
      imageAdjust,
      {
        label: 'FORMATO DE SALIDA',
        value: params.output.aspectRatio,
        options: [
          { value: 'original', label: 'Libre (original)' },
          { value: '4:5', label: '4:5' },
          { value: '1:1', label: '1:1' },
          { value: '16:9', label: '16:9' },
          { value: '9:16', label: '9:16' },
        ],
      },
      (value) => engine.setOutput({ aspectRatio: value }),
    ),
    createSlider(
      imageAdjust,
      {
        label: 'BRILLO',
        min: -1,
        max: 1,
        step: 0.01,
        value: params.imageAdjust.brightness,
      },
      (value) => engine.setImageAdjust({ brightness: value }),
    ),
    createSlider(
      imageAdjust,
      {
        label: 'CONTRASTE',
        min: -1,
        max: 1,
        step: 0.01,
        value: params.imageAdjust.contrast,
      },
      (value) => engine.setImageAdjust({ contrast: value }),
    ),
    createSlider(
      imageAdjust,
      {
        label: 'SATURACIÓN',
        min: -1,
        max: 1,
        step: 0.01,
        value: params.imageAdjust.saturation,
      },
      (value) => engine.setImageAdjust({ saturation: value }),
    ),
  );

  imageAdjust.append(hslDropdown);

  controls.push(
    createSlider(
      hslBody,
      {
        label: 'ROJOS',
        min: -1,
        max: 1,
        step: 0.01,
        value: params.imageAdjust.hslSatRed,
      },
      (value) => engine.setImageAdjust({ hslSatRed: value }),
    ),
    createSlider(
      hslBody,
      {
        label: 'NARANJAS',
        min: -1,
        max: 1,
        step: 0.01,
        value: params.imageAdjust.hslSatOrange,
      },
      (value) => engine.setImageAdjust({ hslSatOrange: value }),
    ),
    createSlider(
      hslBody,
      {
        label: 'AMARILLOS',
        min: -1,
        max: 1,
        step: 0.01,
        value: params.imageAdjust.hslSatYellow,
      },
      (value) => engine.setImageAdjust({ hslSatYellow: value }),
    ),
    createSlider(
      hslBody,
      {
        label: 'VERDES',
        min: -1,
        max: 1,
        step: 0.01,
        value: params.imageAdjust.hslSatGreen,
      },
      (value) => engine.setImageAdjust({ hslSatGreen: value }),
    ),
    createSlider(
      hslBody,
      {
        label: 'CIANES',
        min: -1,
        max: 1,
        step: 0.01,
        value: params.imageAdjust.hslSatCyan,
      },
      (value) => engine.setImageAdjust({ hslSatCyan: value }),
    ),
    createSlider(
      hslBody,
      {
        label: 'AZULES',
        min: -1,
        max: 1,
        step: 0.01,
        value: params.imageAdjust.hslSatBlue,
      },
      (value) => engine.setImageAdjust({ hslSatBlue: value }),
    ),
    createSlider(
      hslBody,
      {
        label: 'VIOLETAS',
        min: -1,
        max: 1,
        step: 0.01,
        value: params.imageAdjust.hslSatViolet,
      },
      (value) => engine.setImageAdjust({ hslSatViolet: value }),
    ),
    createSlider(
      hslBody,
      {
        label: 'MAGENTAS',
        min: -1,
        max: 1,
        step: 0.01,
        value: params.imageAdjust.hslSatMagenta,
      },
      (value) => engine.setImageAdjust({ hslSatMagenta: value }),
    ),
  );

  controls.push(
    createSlider(
      imageAdjust,
      {
        label: 'AFILAR IMAGEN',
        min: 0,
        max: 1,
        step: 0.01,
        value: params.imageAdjust.sharpen,
      },
      (value) => engine.setImageAdjust({ sharpen: value }),
    ),
  );

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
    createSlider(
      digicam,
      {
        label: 'ABERRACIÓN CROMÁTICA',
        min: 0,
        max: 1,
        step: 0.01,
        value: params.digicam.chromaAberration,
      },
      (value) => engine.setDigicam({ chromaAberration: value }),
    ),
    createSlider(
      digicam,
      {
        label: 'GRANO POR LUMA',
        min: 0,
        max: 1,
        step: 0.01,
        value: params.digicam.lumaGrain,
      },
      (value) => engine.setDigicam({ lumaGrain: value }),
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
    createSlider(
      vhs,
      {
        label: 'Y/C CHROMA DELAY',
        min: 0,
        max: 1,
        step: 0.01,
        value: params.vhs.chromaDelay,
      },
      (value) => engine.setVhs({ chromaDelay: value }),
    ),
    createSlider(
      vhs,
      {
        label: 'SYNC DRIFT',
        min: 0,
        max: 1,
        step: 0.01,
        value: params.vhs.syncDrift,
      },
      (value) => engine.setVhs({ syncDrift: value }),
    ),
    createSlider(
      vhs,
      {
        label: 'HEAD SWITCHING',
        min: 0,
        max: 1,
        step: 0.01,
        value: params.vhs.headSwitching,
      },
      (value) => engine.setVhs({ headSwitching: value }),
    ),
    createSlider(
      vhs,
      {
        label: 'DROPOUTS',
        min: 0,
        max: 1,
        step: 0.01,
        value: params.vhs.dropouts,
      },
      (value) => engine.setVhs({ dropouts: value }),
    ),
    createSlider(
      vhs,
      {
        label: 'DAÑO DE CINTA',
        min: 0,
        max: 1,
        step: 0.01,
        value: params.vhs.tapeDamage,
      },
      (value) => engine.setVhs({ tapeDamage: value }),
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
    createSlider(
      compression,
      {
        label: 'CORRUPCIÓN DE BLOQUES',
        min: 0,
        max: 1,
        step: 0.01,
        value: params.compression.blockCorruption,
      },
      (value) => engine.setCompression({ blockCorruption: value }),
    ),
    createSlider(
      compression,
      {
        label: 'DESPLAZAMIENTO DE BLOQUES',
        min: 0,
        max: 1,
        step: 0.01,
        value: params.compression.blockCorruptionShift,
      },
      (value) => engine.setCompression({ blockCorruptionShift: value }),
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
    createSlider(
      brand,
      {
        label: 'CRT (MASTER)',
        min: 0,
        max: 1,
        step: 0.01,
        value: params.brand.crtAmount,
      },
      (value) => engine.setBrand({ crtAmount: value }),
    ),
    createSlider(
      brand,
      {
        label: 'CURVATURA CRT',
        min: 0,
        max: 1,
        step: 0.01,
        value: params.brand.crtCurvature,
      },
      (value) => engine.setBrand({ crtCurvature: value }),
    ),
    createSlider(
      brand,
      {
        label: 'COMPENSACIÓN CURVATURA CRT',
        min: 0,
        max: 1,
        step: 0.01,
        value: params.brand.crtCompensation,
      },
      (value) => engine.setBrand({ crtCompensation: value }),
    ),
    createSlider(
      brand,
      {
        label: 'SCANLINES CRT',
        min: 0,
        max: 1,
        step: 0.01,
        value: params.brand.crtScanlines,
      },
      (value) => engine.setBrand({ crtScanlines: value }),
    ),
    createSlider(
      brand,
      {
        label: 'MÁSCARA/FÓSFORO',
        min: 0,
        max: 1,
        step: 0.01,
        value: params.brand.crtMask,
      },
      (value) => engine.setBrand({ crtMask: value }),
    ),
    createSlider(
      brand,
      {
        label: 'VIÑETA CRT',
        min: 0,
        max: 1,
        step: 0.01,
        value: params.brand.crtVignette,
      },
      (value) => engine.setBrand({ crtVignette: value }),
    ),
    createSlider(
      brand,
      {
        label: 'HALACIÓN CRT',
        min: 0,
        max: 1,
        step: 0.01,
        value: params.brand.crtHalation,
      },
      (value) => engine.setBrand({ crtHalation: value }),
    ),
    createSlider(
      brand,
      {
        label: 'CONVERGENCIA RGB',
        min: 0,
        max: 1,
        step: 0.01,
        value: params.brand.crtConvergence,
      },
      (value) => engine.setBrand({ crtConvergence: value }),
    ),
    createSlider(
      brand,
      {
        label: 'SUCIEDAD',
        min: 0,
        max: 1,
        step: 0.01,
        value: params.brand.dirtAmount,
      },
      (value) => engine.setBrand({ dirtAmount: value }),
    ),
    createSlider(
      brand,
      {
        label: 'RAYONES',
        min: 0,
        max: 1,
        step: 0.01,
        value: params.brand.scratchesAmount,
      },
      (value) => engine.setBrand({ scratchesAmount: value }),
    ),
    createSlider(
      brand,
      {
        label: 'POLVO',
        min: 0,
        max: 1,
        step: 0.01,
        value: params.brand.dustAmount,
      },
      (value) => engine.setBrand({ dustAmount: value }),
    ),
  );

  controls.push(
    createSlider(
      datamosh,
      {
        label: 'INTENSIDAD DATAMOSH',
        min: 0,
        max: 1,
        step: 0.01,
        value: params.datamosh.amount,
      },
      (value) => engine.setDatamosh({ amount: value }),
    ),
    createSlider(
      datamosh,
      {
        label: 'UMBRAL DE MOVIMIENTO',
        min: 0,
        max: 1,
        step: 0.01,
        value: params.datamosh.motionThreshold,
      },
      (value) => engine.setDatamosh({ motionThreshold: value }),
    ),
    createSlider(
      datamosh,
      {
        label: 'TAMAÑO DE BLOQUE MOSH',
        min: 4,
        max: 16,
        step: 4,
        value: params.datamosh.blockSize,
        format: (value) => `${value}×${value} px`,
      },
      (value) => engine.setDatamosh({ blockSize: value }),
    ),
    createSlider(
      datamosh,
      {
        label: 'FEEDBACK TEMPORAL',
        min: 0,
        max: 1,
        step: 0.01,
        value: params.datamosh.feedback,
      },
      (value) => engine.setDatamosh({ feedback: value }),
    ),
  );

  return {
    reset: () => controls.forEach((control) => control.reset()),
  };
}
