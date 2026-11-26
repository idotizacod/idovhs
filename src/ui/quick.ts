import type { Engine } from '../core/Engine';
import type { EngineParams } from '../types';
import {
  applyPreset,
  presetBase,
  presetsForCategory,
  QUICK_CATEGORY_LABELS,
  QUICK_PRESETS,
  type QuickCategory,
  type QuickPreset,
} from './quickPresets';
import {
  createSavedFilter,
  loadSavedFilters,
  nextSavedFilterName,
  normalizeFilterName,
  persistSavedFilters,
  removeSavedFilter,
  upsertSavedFilter,
  type SavedFilter,
} from './savedFilters';

const DEFAULT_INTENSITY = 0.7;
const SAVED_TAB_LABEL = 'MIS FILTROS';
type QuickTab = QuickCategory | 'saved';

function element<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (found === null) {
    throw new Error(`Elemento #${id} no encontrado`);
  }
  return found as T;
}

function swatchIndex(name: string): number {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) >>> 0;
  }
  return hash % 4;
}

export interface QuickControls {
  reset: () => void;
}

/** Panel rápido estilo InShot: presets, intensidad, comparar y filtros guardados. */
export function buildQuickControls(engine: Engine): QuickControls {
  const title = element<HTMLElement>('quick-title');
  const tabList = element<HTMLElement>('quick-tabs');
  const presetRow = element<HTMLElement>('quick-presets');
  const intensityRow = element<HTMLElement>('quick-intensity-row');
  const intensityInput = element<HTMLInputElement>('quick-intensity');
  const intensityValue = element<HTMLOutputElement>('quick-intensity-value');
  const compareButton = element<HTMLButtonElement>('quick-compare');
  const resetButton = element<HTMLButtonElement>('quick-reset');
  const exportButton = element<HTMLButtonElement>('quick-export');
  const saveRow = element<HTMLElement>('quick-save');
  const nameInput = element<HTMLInputElement>('quick-filter-name');
  const saveButton = element<HTMLButtonElement>('quick-save-filter');
  const saveStatus = element<HTMLElement>('quick-save-status');
  const savedEmpty = element<HTMLElement>('quick-saved-empty');

  let tab: QuickTab = 'looks';
  let preset: QuickPreset = QUICK_PRESETS[0]!;
  let intensity = DEFAULT_INTENSITY;
  let savedFilters: SavedFilter[] = loadSavedFilters();
  let activeSavedId: string | null = null;
  let compareRestore: EngineParams | null = null;
  let statusTimer: number | null = null;

  const tabs = Array.from(tabList.querySelectorAll<HTMLButtonElement>('[data-category]'));

  const setStatus = (message: string): void => {
    saveStatus.textContent = message;
    if (statusTimer !== null) {
      window.clearTimeout(statusTimer);
    }
    statusTimer = window.setTimeout(() => {
      saveStatus.textContent = '';
      statusTimer = null;
    }, 2400);
  };

  const syncIntensity = (): void => {
    intensityInput.value = String(intensity);
    intensityValue.textContent = `${Math.round(intensity * 100)}%`;
  };

  const applyCurrentPreset = (): void => {
    if (compareRestore !== null) {
      return;
    }
    engine.setParams(applyPreset(preset, engine.getParams(), intensity));
    activeSavedId = null;
  };

  const renderPresets = (): void => {
    presetRow.replaceChildren();
    presetsForCategory(tab as QuickCategory).forEach((item) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'preset';
      button.dataset.preset = item.id;
      button.setAttribute('aria-pressed', String(tab !== 'saved' && item.id === preset.id));
      button.title = item.hint;

      const thumb = document.createElement('span');
      thumb.className = `preset-thumb swatch-${item.swatch}`;
      const label = document.createElement('span');
      label.className = 'preset-label';
      label.textContent = item.label;

      button.append(thumb, label);
      button.addEventListener('click', () => {
        preset = item;
        renderPresets();
        applyCurrentPreset();
      });
      presetRow.append(button);
    });
  };

  const renderSaved = (): void => {
    presetRow.replaceChildren();
    savedEmpty.hidden = savedFilters.length > 0;

    savedFilters.forEach((filter) => {
      const card = document.createElement('div');
      card.className = 'saved-card';

      const applyButton = document.createElement('button');
      applyButton.type = 'button';
      applyButton.className = 'preset preset-saved';
      applyButton.dataset.savedId = filter.id;
      applyButton.setAttribute('aria-pressed', String(filter.id === activeSavedId));
      applyButton.title = `Aplicar ${filter.name} (${Math.round(filter.intensity * 100)}%)`;

      const thumb = document.createElement('span');
      thumb.className = `preset-thumb swatch-saved saved-swatch-${swatchIndex(filter.name)}`;
      const label = document.createElement('span');
      label.className = 'preset-label';
      label.textContent = filter.name;

      applyButton.append(thumb, label);
      applyButton.addEventListener('click', () => {
        if (compareRestore !== null) {
          return;
        }
        engine.setParams(filter.params);
        intensity = filter.intensity;
        syncIntensity();
        activeSavedId = filter.id;
        renderSaved();
        setStatus(`APLICADO: ${filter.name}`);
      });

      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'saved-delete';
      deleteButton.textContent = '×';
      deleteButton.title = `Borrar ${filter.name}`;
      deleteButton.setAttribute('aria-label', `Borrar ${filter.name}`);
      deleteButton.addEventListener('click', () => {
        savedFilters = removeSavedFilter(savedFilters, filter.id);
        persistSavedFilters(savedFilters);
        if (activeSavedId === filter.id) {
          activeSavedId = null;
        }
        renderSaved();
        setStatus(`BORRADO: ${filter.name}`);
      });

      card.append(applyButton, deleteButton);
      presetRow.append(card);
    });
  };

  const selectTab = (next: QuickTab): void => {
    tab = next;
    const saved = next === 'saved';
    title.textContent = saved ? SAVED_TAB_LABEL : QUICK_CATEGORY_LABELS[next];
    tabs.forEach((item) => {
      item.setAttribute('aria-selected', String(item.dataset.category === next));
    });
    saveRow.hidden = !saved;
    intensityRow.hidden = saved;
    savedEmpty.hidden = true;
    saveStatus.textContent = '';

    if (saved) {
      renderSaved();
      return;
    }

    const first = presetsForCategory(next)[0];
    if (first !== undefined) {
      preset = first;
    }
    renderPresets();
  };

  const resetQuick = (): void => {
    intensity = DEFAULT_INTENSITY;
    syncIntensity();
    activeSavedId = null;
    nameInput.value = '';
    selectTab('looks');
    applyCurrentPreset();
  };

  const saveCurrentFilter = (): void => {
    if (compareRestore !== null) {
      return;
    }
    const name = normalizeFilterName(nameInput.value) || nextSavedFilterName(savedFilters);
    const filter = createSavedFilter({ name, params: engine.getParams(), intensity });
    const nextFilters = upsertSavedFilter(savedFilters, filter);
    if (!persistSavedFilters(nextFilters)) {
      setStatus('NO SE PUDO GUARDAR');
      return;
    }

    savedFilters = nextFilters;
    activeSavedId = filter.id;
    nameInput.value = '';
    renderSaved();
    setStatus(`GUARDADO: ${filter.name}`);
  };

  tabs.forEach((item) => {
    item.addEventListener('click', () => {
      const next = item.dataset.category;
      if (next !== undefined) {
        selectTab(next as QuickTab);
      }
    });
  });

  intensityInput.addEventListener('input', () => {
    intensity = Number(intensityInput.value);
    intensityValue.textContent = `${Math.round(intensity * 100)}%`;
    applyCurrentPreset();
  });

  saveButton.addEventListener('click', saveCurrentFilter);
  nameInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveCurrentFilter();
    }
  });

  compareButton.addEventListener('pointerdown', () => {
    if (compareRestore !== null) {
      return;
    }
    compareRestore = engine.getParams();
    engine.setParams(presetBase(compareRestore));
    compareButton.setAttribute('aria-pressed', 'true');
  });

  const endCompare = (): void => {
    if (compareRestore === null) {
      return;
    }
    engine.setParams(compareRestore);
    compareRestore = null;
    compareButton.setAttribute('aria-pressed', 'false');
  };
  compareButton.addEventListener('pointerup', endCompare);
  compareButton.addEventListener('pointercancel', endCompare);
  compareButton.addEventListener('pointerleave', endCompare);
  window.addEventListener('pointerup', endCompare);

  resetButton.addEventListener('click', resetQuick);

  exportButton.addEventListener('click', () => {
    document.getElementById('btn-export-video')?.click();
  });

  syncIntensity();
  selectTab('looks');

  return { reset: resetQuick };
}
