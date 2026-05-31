import { useCallback, useRef, useState } from "react";
import {
  DEFAULT_EXPORT_THEME_FILENAME,
  DEFAULT_THEME,
  THEME_BLOB_TYPE,
  THEMES_EXTENSION,
  THEMES_FILE_TYPE,
} from "../common/config";
import { EVENTS } from "../common/constants/events";
import { getStore, useStore } from "../common/store";
import { type Theme, THEME_KEYS, type ThemeColors } from "../common/types";
import { useKeybinding } from "../hooks/useKeybinding";
import { isObjectEmpty } from "../utils/parse";
import {
  createSaveScheduler,
  saveActiveThemeNameState,
  saveColorsState,
  saveThemesState,
} from "../utils/persistence";
import { revokeAfter, urlFromObject } from "../utils/url";

const _scheduleSave = createSaveScheduler(saveColorsState);
const _scheduleThemeNameSave = createSaveScheduler(saveActiveThemeNameState);

// Private helpers

function _applyThemeColors(theme: Partial<ThemeColors>): void {
  getStore().setColors(theme);
  getStore().recolor();
}

export function useThemes() {
  const colors = useStore((state) => state.colors);
  const themes = useStore((state) => state.themes) as Theme[];
  const activeThemeName = useStore((state) => state.activeThemeName);

  const redraw = useStore((state) => state.redraw);
  const setThemes = useStore((state) => state.setThemes);
  const setActiveThemeName = useStore((state) => state.setActiveThemeName);

  const activeThemeItemRef = useRef<HTMLDivElement | null>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [exportFilename, setExportFilename] = useState<string | null>(null);
  const [viewingTheme, setViewingTheme] = useState<Theme | null>(null);

  // Apply initial colors
  if (isObjectEmpty(colors)) {
    _applyThemeColors(DEFAULT_THEME);
  }

  // Theme functions

  const applyTheme = useCallback(
    (theme: Theme) => {
      _applyThemeColors(
        Object.fromEntries(THEME_KEYS.map((key) => [key, theme[key]])),
      );

      setActiveThemeName(theme._name);
      _scheduleThemeNameSave();
      _scheduleSave();
      redraw();

      // Focus active item after render
      requestAnimationFrame(() => activeThemeItemRef.current?.focus());
    },
    [setActiveThemeName, redraw],
  );

  const deleteTheme = useCallback(
    (themeToDelete: Theme) => {
      const themeToDeleteName = themeToDelete._name;
      const next = themes.filter((t) => t._name !== themeToDeleteName);
      setThemes(next);
      saveThemesState();

      // If the active theme is deleted, apply the first available one
      if (activeThemeName === themeToDeleteName) {
        applyTheme(next.length > 0 ? next[0] : { ...DEFAULT_THEME, _name: "" });
      }
    },
    [themes, setThemes, activeThemeName, applyTheme],
  );

  const importThemes = useCallback(() => {
    const inputElement = document.createElement("input");
    inputElement.type = THEMES_FILE_TYPE;
    inputElement.accept = THEMES_EXTENSION;
    inputElement.multiple = true;

    inputElement.addEventListener(EVENTS.CHANGE, async () => {
      const files = inputElement.files;
      if (!files) {
        return;
      }

      const next = [...themes];
      for (const file of Array.from(files)) {
        const theme = JSON.parse(await file.text()) as Theme;
        const themeName = file.name.replace(
          new RegExp(`${THEMES_EXTENSION}$`, "i"),
          "",
        );

        // Merge theme
        theme._name = themeName;
        const idx = next.findIndex((t) => t._name === themeName);
        if (idx === -1) {
          next.push(theme);
        } else {
          next[idx] = theme;
        }
      }

      setThemes(next);
      saveThemesState();

      if (next.length > 0) {
        applyTheme(next.at(-1)!);
      }
    });

    inputElement.click();
  }, [themes, setThemes, applyTheme]);

  const exportTheme = useCallback(() => {
    setExportFilename(activeThemeName || DEFAULT_EXPORT_THEME_FILENAME);
    setIsExporting(true);
  }, [activeThemeName]);

  const confirmExport = useCallback(
    (filename: string) => {
      const anchorElement = document.createElement("a");
      anchorElement.href = urlFromObject(colors, THEME_BLOB_TYPE);
      anchorElement.download = filename.endsWith(THEMES_EXTENSION)
        ? filename
        : `${filename}${THEMES_EXTENSION}`;

      anchorElement.click();
      revokeAfter(anchorElement.href);
      setIsExporting(false);
    },
    [colors],
  );

  const showInModal = useCallback((theme: Theme) => {
    setViewingTheme(theme);
  }, []);

  // Keybindings
  useKeybinding("themes.focus", () => activeThemeItemRef.current?.focus());
  useKeybinding("themes.import", importThemes);
  useKeybinding("themes.export", exportTheme);
  useKeybinding("themes.delete", () => {
    const active = themes.find((theme) => theme._name === activeThemeName);
    if (active) {
      deleteTheme(active);
    }
  });

  return {
    themes,
    activeThemeName,
    activeThemeItemRef,
    applyTheme,
    deleteTheme,
    showInModal,
    importThemes,
    exportTheme,
    isExporting,
    exportFilename,
    confirmExport,
    cancelExport: () => setIsExporting(false),
    viewingTheme,
    closeViewingTheme: () => setViewingTheme(null),
  };
}
