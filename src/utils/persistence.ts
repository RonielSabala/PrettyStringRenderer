import { SAVE_TIMEOUT_MS } from "../common/config";
import {
  getStore,
  type CanvasConfig,
  type CollapsedSections,
  type EditorConfig,
  type TypographyConfig,
} from "../common/store";
import type { ThemeColors } from "../common/types";

const STORAGE_KEYS = Object.freeze({
  COLORS: "psr:colors",
  THEMES: "psr:themes",
  ACTIVE_THEME_NAME: "psr:activeThemeName",
  ACTIVE_ELEMENT_ID: "psr:activeElementID",
  COLLAPSED_SECTION_IDS: "psr:collapsedSectionIds",
  TYPOGRAPHY_CONFIG: "psr:typographyConfig",
  EDITOR_CONFIG: "psr:editorConfig",
  CANVAS_CONFIG: "psr:canvasConfig",
} as const);

export function createSaveScheduler(
  saveFn: () => void,
  ms = SAVE_TIMEOUT_MS,
): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return () => {
    if (timer !== null) {
      clearTimeout(timer);
    }

    timer = setTimeout(saveFn, ms);
  };
}

// Internal helpers

function _saveAsync(key: string, value: string): void {
  setTimeout(() => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("Could not save state:", e);
    }
  }, 0);
}

function _saveObjectAsync(key: string, value: unknown): void {
  _saveAsync(key, JSON.stringify(value));
}

function _get(key: string): string | null {
  return localStorage.getItem(key);
}

function _getObject<T>(key: string): T {
  const json = _get(key);
  return JSON.parse(json!) as T;
}

// Public save functions

export const saveThemesState = () =>
  _saveObjectAsync(STORAGE_KEYS.THEMES, getStore().themes);

export const saveActiveThemeNameState = () =>
  _saveAsync(STORAGE_KEYS.ACTIVE_THEME_NAME, getStore().activeThemeName);

export const saveActiveElementIdState = () =>
  _saveAsync(STORAGE_KEYS.ACTIVE_ELEMENT_ID, getStore().activeElementId);

export const saveCollapsedSectionIdsState = () =>
  _saveObjectAsync(
    STORAGE_KEYS.COLLAPSED_SECTION_IDS,
    getStore().collapsedSectionIds,
  );

export const saveTypographyConfigState = () =>
  _saveObjectAsync(STORAGE_KEYS.TYPOGRAPHY_CONFIG, getStore().typographyConfig);

export const saveEditorConfigState = () =>
  _saveObjectAsync(STORAGE_KEYS.EDITOR_CONFIG, getStore().editorConfig);

export const saveCanvasConfigState = () =>
  _saveObjectAsync(STORAGE_KEYS.CANVAS_CONFIG, getStore().canvasConfig);

// Restore

export function restoreState(): void {
  const set = getStore();
  try {
    set.setColors(_getObject<ThemeColors>(STORAGE_KEYS.COLORS));
    set.setThemes(_getObject<ThemeColors[]>(STORAGE_KEYS.THEMES));
    set.setCollapsedSectionIds(
      _getObject<CollapsedSections>(STORAGE_KEYS.COLLAPSED_SECTION_IDS),
    );
    set.setTypographyConfig(
      _getObject<TypographyConfig>(STORAGE_KEYS.TYPOGRAPHY_CONFIG),
    );
    set.setEditorConfig(_getObject<EditorConfig>(STORAGE_KEYS.EDITOR_CONFIG));
    set.setCanvasConfig(_getObject<CanvasConfig>(STORAGE_KEYS.CANVAS_CONFIG));

    const activeThemeName = _get(STORAGE_KEYS.ACTIVE_THEME_NAME);
    const activeElementId = _get(STORAGE_KEYS.ACTIVE_ELEMENT_ID);
    if (activeThemeName) set.setActiveThemeName(activeThemeName);
    if (activeElementId) set.setActiveElementId(activeElementId);
  } catch (e) {
    console.warn("Could not restore state:", e);
  }
}

export function clearState(): void {
  localStorage.clear();
}
