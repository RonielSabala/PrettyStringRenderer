import { useCallback, useEffect, useRef } from "react";
import { Download, FolderX, Upload } from "react-bootstrap-icons";
import {
  DEFAULT_EXPORT_THEME_FILENAME,
  DEFAULT_THEME,
  EXPORT_THEME_PROMPT_MESSAGE,
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
import SidebarSection from "../SidebarSection";
import { ThemeItem } from "./ThemeItem";

const _scheduleSave = createSaveScheduler(saveColorsState);
const _scheduleThemeNameSave = createSaveScheduler(saveActiveThemeNameState);

// Private helpers

function _urlFromObject(obj: object): string {
  return URL.createObjectURL(
    new Blob([JSON.stringify(obj, null, 2)], THEME_BLOB_TYPE),
  );
}

function _revokeAfter(url: string) {
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function useThemes() {
  const colors = useStore((state) => state.colors);
  const themes = useStore((state) => state.themes) as Theme[];
  const activeThemeName = useStore((state) => state.activeThemeName);
  const activeItem = useRef<HTMLDivElement | null>(null);

  const setThemes = useStore((state) => state.setThemes);
  const setActiveName = useStore((state) => state.setActiveThemeName);
  const redraw = useStore((state) => state.redraw);

  // Apply initial colors on mount
  useEffect(() => {
    const themeToApply = isObjectEmpty(colors) ? DEFAULT_THEME : colors;
    applyThemeColors(themeToApply);
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
    const filename = prompt(
      EXPORT_THEME_PROMPT_MESSAGE,
      activeThemeName || DEFAULT_EXPORT_THEME_FILENAME,
    );
    if (!filename) {
      return;
    }

    const anchorElement = document.createElement("a");
    anchorElement.href = _urlFromObject(colors);
    anchorElement.download = filename.endsWith(THEMES_EXTENSION)
      ? filename
      : `${filename}${THEMES_EXTENSION}`;

    anchorElement.click();
    _revokeAfter(anchorElement.href);
  }, [colors, activeThemeName]);

  const showInNewWindow = useCallback((theme: Theme) => {
    const url = _urlFromObject(theme);
    window.open(url, "_blank");
    _revokeAfter(url);
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
  };
}

// Theme action buttons

interface ThemeActionsProps {
  onImport: () => void;
  onExport: () => void;
}

function ThemeActions({ onImport, onExport }: ThemeActionsProps) {
  return (
    <div className="theme-actions">
      <button
        id="btn-import-themes"
        className="theme-btn theme-btn-import no-select"
        onClick={onImport}
        title="Import theme files"
      >
        <Upload size={16} />
        <span>Import</span>
      </button>
      <button
        id="btn-export-theme"
        className="theme-btn theme-btn-export no-select"
        onClick={onExport}
        title="Export current theme"
      >
        <Download size={16} />
        <span>Export</span>
      </button>
    </div>
  );
}

// Theme section

export default function ThemesSection() {
  const {
    themes,
    activeThemeName,
    activeItem,
    applyTheme,
    showInNewWindow,
    importThemes,
    exportTheme,
  } = useThemes();

  const themesCount = themes.length;
  const noThemes = themesCount === 0;
  return (
    <SidebarSection
      id="section-themes"
      headerId="section-header-themes"
      title="Themes"
    >
      <div className="theme-list">
        {noThemes ? (
          <div id="theme-empty">
            <FolderX size={32} />
            <p>No themes loaded</p>
            <span>Import or create a theme to get started</span>
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
    </SidebarSection>
  );
}
