import { describe, expect, it } from 'vitest';
import { cloneDefaultParams } from '../src/config';
import type { EngineParams } from '../src/types';
import {
  createSavedFilter,
  loadSavedFilters,
  MAX_SAVED_FILTERS,
  nextSavedFilterName,
  normalizeFilterName,
  parseSavedFilters,
  persistSavedFilters,
  removeSavedFilter,
  SAVED_FILTERS_STORAGE_KEY,
  serializeSavedFilters,
  upsertSavedFilter,
} from '../src/ui/savedFilters';

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.values.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

function paramsWithTracking(value: number): EngineParams {
  const params = cloneDefaultParams();
  params.vhs.trackingJitter = value;
  params.output.aspectRatio = '9:16';
  return params;
}

describe('filtros guardados', () => {
  it('serializa y restaura nombre, intensidad, parámetros y aspecto', () => {
    const filter = createSavedFilter({
      id: 'filtro-1',
      name: '  mi filtro  ',
      params: paramsWithTracking(0.42),
      intensity: 0.65,
      createdAt: 1234,
    });

    expect(filter.name).toBe('MI FILTRO');
    expect(parseSavedFilters(serializeSavedFilters([filter]))).toEqual([filter]);
  });

  it('descarta JSON corrupto, versión desconocida y entradas inválidas', () => {
    expect(parseSavedFilters(null)).toEqual([]);
    expect(parseSavedFilters('{')).toEqual([]);
    expect(parseSavedFilters(JSON.stringify({ version: 2, filters: [] }))).toEqual([]);
    expect(parseSavedFilters(JSON.stringify({ version: 1, filters: {} }))).toEqual([]);

    const invalid = JSON.stringify({
      version: 1,
      filters: [
        { id: 'a', name: 'SIN GRUPOS', params: {} },
        { id: 'b', name: '   ', params: cloneDefaultParams() },
      ],
    });
    expect(parseSavedFilters(invalid)).toEqual([]);
  });

  it('normaliza nombres y genera el siguiente disponible', () => {
    expect(normalizeFilterName('  vhs\nnoche  ')).toBe('VHS NOCHE');
    const first = createSavedFilter({ name: 'FILTRO 01', params: cloneDefaultParams(), intensity: 1 });
    expect(nextSavedFilterName([])).toBe('FILTRO 01');
    expect(nextSavedFilterName([first])).toBe('FILTRO 02');
  });

  it('reemplaza un filtro por nombre sin duplicarlo y puede borrarlo', () => {
    const original = createSavedFilter({
      id: 'a',
      name: 'uno',
      params: cloneDefaultParams(),
      intensity: 0.7,
    });
    const other = createSavedFilter({
      id: 'b',
      name: 'otro',
      params: cloneDefaultParams(),
      intensity: 0.7,
    });
    const replacement = createSavedFilter({
      id: 'c',
      name: ' UNO ',
      params: paramsWithTracking(0.9),
      intensity: 0.3,
    });

    const updated = upsertSavedFilter([original, other], replacement);
    expect(updated.map((item) => item.id)).toEqual(['c', 'b']);
    expect(removeSavedFilter(updated, 'c').map((item) => item.id)).toEqual(['b']);
  });

  it('limita la lista al máximo y persiste en localStorage', () => {
    const storage = new MemoryStorage();
    const filters = Array.from({ length: MAX_SAVED_FILTERS + 2 }, (_, index) =>
      createSavedFilter({
        id: `id-${index}`,
        name: `LOOK ${index}`,
        params: paramsWithTracking(index / 100),
        intensity: 1,
      }),
    );

    const capped = upsertSavedFilter(filters.slice(0, MAX_SAVED_FILTERS), filters[MAX_SAVED_FILTERS]!);
    expect(capped).toHaveLength(MAX_SAVED_FILTERS);
    expect(capped[0]?.name).toBe(`LOOK ${MAX_SAVED_FILTERS}`);

    expect(persistSavedFilters(capped, storage)).toBe(true);
    expect(storage.getItem(SAVED_FILTERS_STORAGE_KEY)).not.toBeNull();
    expect(loadSavedFilters(storage)).toEqual(capped);
  });
});
