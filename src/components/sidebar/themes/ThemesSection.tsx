import { useCallback, useEffect, useRef, useState } from "react";
import { FolderX } from "react-bootstrap-icons";
import {
  DEFAULT_EXPORT_THEME_FILENAME,
  DEFAULT_THEME,
  THEME_BLOB_TYPE,
  THEMES_EXTENSION,
  THEMES_FILE_TYPE,
} from "../../../common/config";
import { EVENTS } from "../../../common/constants/events";
import { matchesKeybinding } from "../../../common/keybindings";
import { useStore } from "../../../common/store";
import type { Theme, ThemeColors } from "../../../common/types";
import { THEME_KEYS, TOKENS } from "../../../common/types";
import { applyThemeColors } from "../../../utils/color_sync";
import { isObjectEmpty } from "../../../utils/parse";
import {
  createSaveScheduler,
  saveActiveThemeNameState,
  saveColorsState,
  saveThemesState,
} from "../../../utils/persistence";
import { revokeAfter, urlFromObject } from "../../../utils/url";
import SidebarSection from "../SidebarSection";
import ThemeActions from "./ThemeActions";
import ThemeExportDialog from "./ThemeExportDialog";
import { ThemeItem } from "./ThemeItem";
import ThemeViewDialog from "./ThemeViewDialog";
import "./ThemesSection.css";

const _scheduleSave = createSaveScheduler(saveColorsState);
const _scheduleThemeNameSave = createSaveScheduler(saveActiveThemeNameState);

function useThemes() {
  const colors = useStore((state) => state.colors);
  const themes = useStore((state) => state.themes) as Theme[];
  const activeThemeName = useStore((state) => state.activeThemeName);
  const activeItem = useRef<HTMLDivElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFilename, setExportFilename] = useState<string | null>(null);
  const [viewingTheme, setViewingTheme] = useState<Theme | null>(null);

  const setThemes = useStore((state) => state.setThemes);
  const setActiveName = useStore((state) => state.setActiveThemeName);
  const redraw = useStore((state) => state.redraw);

  // Apply initial colors on mount
  useEffect(() => {
    if (isObjectEmpty(colors)) {
      applyThemeColors(DEFAULT_THEME);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Theme functions
  const applyTheme = useCallback(
    (theme: Theme) => {
      const patch: Partial<ThemeColors> = {};

      for (const key of THEME_KEYS) {
        if (key === TOKENS.BRACKET) {
          patch[key] = theme[key];
        } else {
          patch[key] = theme[key];
        }
      }

      applyThemeColors(patch);
      setActiveName(theme._name);
      _scheduleThemeNameSave();
      _scheduleSave();
      redraw();

      // Focus active item after render
      requestAnimationFrame(() => activeItem.current?.focus());
    },
    [setActiveName, redraw],
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

  const showInNewWindow = useCallback((theme: Theme) => {
    setViewingTheme(theme);
  }, []);

  // Global keybindings
  useEffect(() => {
    const handler = (event: Event) => {
      if (!(event instanceof KeyboardEvent)) {
        return;
      }

      if (matchesKeybinding(event, "themes.focus")) {
        event.preventDefault();
        activeItem.current?.focus();
      } else if (matchesKeybinding(event, "themes.import")) {
        event.preventDefault();
        importThemes();
      } else if (matchesKeybinding(event, "themes.export")) {
        event.preventDefault();
        exportTheme();
      }
    };

    document.addEventListener(EVENTS.KEY_DOWN, handler);
    return () => document.removeEventListener(EVENTS.KEY_DOWN, handler);
  }, [activeItem, importThemes, exportTheme]);

  return {
    themes,
    activeThemeName,
    activeItem,
    applyTheme,
    showInNewWindow,
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

export default function ThemesSection() {
  const {
    themes,
    activeThemeName,
    activeItem,
    applyTheme,
    showInNewWindow,
    importThemes,
    exportTheme,
    isExporting,
    exportFilename,
    confirmExport,
    cancelExport,
    viewingTheme,
    closeViewingTheme,
  } = useThemes();

  const themesCount = themes.length;
  const noThemes = themesCount === 0;

  return (
    <SidebarSection title="Themes">
      <div className="theme-list no-user-select">
        {noThemes ? (
          <div id="theme-empty">
            <FolderX className="app-icon" />
            <p>No themes loaded</p>
            <span>Import or create a theme to get started.</span>
          </div>
        ) : (
          themes.map((theme, index) => (
            <ThemeItem
              key={theme._name}
              ref={theme._name === activeThemeName ? activeItem : null}
              theme={theme}
              isActive={theme._name === activeThemeName}
              onApply={applyTheme}
              onShow={showInNewWindow}
              onNavigate={(upDirection) => {
                const nextIdx = upDirection
                  ? index - 1
                  : (index + 1) % themesCount;
                applyTheme(themes.at(nextIdx)!);
              }}
            />
          ))
        )}
      </div>

      <ThemeActions onImport={importThemes} onExport={exportTheme} />

      <ThemeExportDialog
        isOpen={isExporting}
        defaultFilename={exportFilename}
        onExport={confirmExport}
        onCancel={cancelExport}
      />

      <ThemeViewDialog theme={viewingTheme} onClose={closeViewingTheme} />
    </SidebarSection>
  );
}
