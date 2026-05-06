import { SAVE_TIMEOUT_MS } from "../common/config";
import { getStore } from "../common/store";
import type {
  CanvasConfig,
  CollapsedSections,
  EditorConfig,
  ThemeColors,
  TypographyConfig,
} from "../common/types";

const STORAGE_KEYS = Object.freeze({
  COLORS: "psr:colors",
  THEMES: "psr:themes",
  ACTIVE_THEME_NAME: "psr:activeThemeName",
  ACTIVE_ELEMENT_ID: "psr:activeElementID",
  COLLAPSED_SECTIONS: "psr:collapsedSections",
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
      console.warn("Could not save state:\n", e);
    }
  }, 0);
}

function _saveObjectAsync(key: string, value: unknown): void {
  _saveAsync(key, JSON.stringify(value));
}

function _get(key: string): string | null {
  return localStorage.getItem(key);
}

function _getObject<T>(key: string): T | null {
  const json = _get(key);
  if (json === null) {
    return null;
  }

  return JSON.parse(json) as T;
}

// Public save functions

export const saveColorsState = () =>
  _saveObjectAsync(STORAGE_KEYS.COLORS, getStore().colors);

export const saveThemesState = () =>
  _saveObjectAsync(STORAGE_KEYS.THEMES, getStore().themes);

export const saveActiveThemeNameState = () =>
  _saveAsync(STORAGE_KEYS.ACTIVE_THEME_NAME, getStore().activeThemeName);

export const saveActiveElementIdState = () =>
  _saveAsync(STORAGE_KEYS.ACTIVE_ELEMENT_ID, getStore().activeElementId);

export const saveCollapsedSectionsState = () =>
  _saveObjectAsync(
    STORAGE_KEYS.COLLAPSED_SECTIONS,
    getStore().collapsedSections,
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
    const colors = _getObject<ThemeColors>(STORAGE_KEYS.COLORS);
    const themes = _getObject<ThemeColors[]>(STORAGE_KEYS.THEMES);
    const activeThemeName = _get(STORAGE_KEYS.ACTIVE_THEME_NAME);
    const activeElementId = _get(STORAGE_KEYS.ACTIVE_ELEMENT_ID);
    const collapsedSections = _getObject<CollapsedSections>(
      STORAGE_KEYS.COLLAPSED_SECTIONS,
    );
    const typographyConfig = _getObject<TypographyConfig>(
      STORAGE_KEYS.TYPOGRAPHY_CONFIG,
    );
    const editorConfig = _getObject<EditorConfig>(STORAGE_KEYS.EDITOR_CONFIG);
    const canvasConfig = _getObject<CanvasConfig>(STORAGE_KEYS.CANVAS_CONFIG);

    if (colors) set.setColors(colors);
    if (themes) set.setThemes(themes);
    if (activeThemeName) set.setActiveThemeName(activeThemeName);
    if (activeElementId) set.setActiveElementId(activeElementId);
    if (collapsedSections) set.setCollapsedSections(collapsedSections);
    if (typographyConfig) set.setTypographyConfig(typographyConfig);
    if (editorConfig) set.setEditorConfig(editorConfig);
    if (canvasConfig) set.setCanvasConfig(canvasConfig);
  } catch (e) {
    console.warn("Could not restore state:\n", e);
  }
}

export function clearState(): void {
  localStorage.clear();
}
