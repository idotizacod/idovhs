import { clamp, validateParams } from '../core/validators';
import type { EngineParams } from '../types';

export const SAVED_FILTERS_STORAGE_KEY = 'idovhs.savedFilters.v1';
export const MAX_SAVED_FILTERS = 24;
export const MAX_FILTER_NAME_LENGTH = 24;

const STORAGE_VERSION = 1;
const DEFAULT_INTENSITY = 0.7;
const PARAM_GROUPS = [
  'imageAdjust',
  'digicam',
  'vhs',
  'compression',
  'brand',
  'datamosh',
  'output',
] as const;

export interface SavedFilter {
  id: string;
  name: string;
  intensity: number;
  params: EngineParams;
  createdAt: number;
}

export interface SavedFilterInput {
  name: string;
  params: EngineParams;
  intensity: number;
  id?: string;
  createdAt?: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function makeId(): string {
  const webCrypto = globalThis.crypto;
  if (webCrypto !== undefined && typeof webCrypto.randomUUID === 'function') {
    return webCrypto.randomUUID();
  }
  return `filtro-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function numberOr(value: unknown, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function intensityOr(value: unknown): number {
  return clamp(numberOr(value, DEFAULT_INTENSITY), 0, 1);
}

function nameKey(value: string): string {
  return normalizeFilterName(value);
}

/** Nombres cortos, sin controles y en mayúsculas: se usan también como clave de reemplazo. */
export function normalizeFilterName(value: string): string {
  return value
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, MAX_FILTER_NAME_LENGTH)
    .toLocaleUpperCase('es');
}

function paramsOrNull(value: unknown): EngineParams | null {
  if (!isRecord(value)) {
    return null;
  }
  if (!PARAM_GROUPS.every((group) => isRecord(value[group]))) {
    return null;
  }
  return validateParams(value as unknown as EngineParams);
}

export function createSavedFilter(input: SavedFilterInput): SavedFilter {
  const trimmedId = input.id?.trim() ?? '';
  return {
    id: trimmedId !== '' ? trimmedId.slice(0, 64) : makeId(),
    name: normalizeFilterName(input.name) || 'FILTRO',
    intensity: intensityOr(input.intensity),
    params: validateParams(input.params),
    createdAt: numberOr(input.createdAt, Date.now()),
  };
}

export function serializeSavedFilters(filters: readonly SavedFilter[]): string {
  return JSON.stringify({ version: STORAGE_VERSION, filters });
}

/** Datos corruptos o de otra versión se descartan sin romper la interfaz. */
export function parseSavedFilters(raw: string | null): SavedFilter[] {
  if (raw === null || raw === '') {
    return [];
  }

  try {
    const data: unknown = JSON.parse(raw);
    if (!isRecord(data) || data.version !== STORAGE_VERSION || !Array.isArray(data.filters)) {
      return [];
    }

    const seenIds = new Set<string>();
    const parsed: SavedFilter[] = [];
    for (const entry of data.filters.slice(0, MAX_SAVED_FILTERS)) {
      if (!isRecord(entry)) {
        continue;
      }
      const name = normalizeFilterName(typeof entry.name === 'string' ? entry.name : '');
      const params = paramsOrNull(entry.params);
      if (name === '' || params === null) {
        continue;
      }

      const candidateId = typeof entry.id === 'string' ? entry.id.trim().slice(0, 64) : '';
      let id = candidateId !== '' && !seenIds.has(candidateId) ? candidateId : makeId();
      while (seenIds.has(id)) {
        id = makeId();
      }
      seenIds.add(id);

      parsed.push({
        id,
        name,
        intensity: intensityOr(entry.intensity),
        params,
        createdAt: numberOr(entry.createdAt, 0),
      });
    }
    return parsed;
  } catch {
    return [];
  }
}

function defaultStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function loadSavedFilters(storage: Storage | null = defaultStorage()): SavedFilter[] {
  if (storage === null) {
    return [];
  }
  try {
    return parseSavedFilters(storage.getItem(SAVED_FILTERS_STORAGE_KEY));
  } catch {
    return [];
  }
}

export function persistSavedFilters(
  filters: readonly SavedFilter[],
  storage: Storage | null = defaultStorage(),
): boolean {
  if (storage === null) {
    return false;
  }
  try {
    storage.setItem(SAVED_FILTERS_STORAGE_KEY, serializeSavedFilters(filters));
    return true;
  } catch {
    return false;
  }
}

/** Si el nombre ya existe, reemplaza ese filtro; si no, lo añade al principio. */
export function upsertSavedFilter(
  filters: readonly SavedFilter[],
  filter: SavedFilter,
): SavedFilter[] {
  const key = nameKey(filter.name);
  const index = filters.findIndex((item) => nameKey(item.name) === key);
  if (index >= 0) {
    const next = filters.slice();
    next[index] = filter;
    return next;
  }
  return [filter, ...filters].slice(0, MAX_SAVED_FILTERS);
}

export function removeSavedFilter(filters: readonly SavedFilter[], id: string): SavedFilter[] {
  return filters.filter((filter) => filter.id !== id);
}

export function nextSavedFilterName(filters: readonly SavedFilter[]): string {
  for (let index = 1; index <= MAX_SAVED_FILTERS; index += 1) {
    const candidate = `FILTRO ${String(index).padStart(2, '0')}`;
    if (!filters.some((filter) => nameKey(filter.name) === candidate)) {
      return candidate;
    }
  }
  return 'FILTRO PERSONALIZADO';
}
