import { useCallback, useEffect, useRef } from "react";
import {
  DEFAULT_EXPORT_THEME_FILENAME,
  DEFAULT_THEME,
  EXPORT_THEME_PROMPT_MESSAGE,
  THEME_BLOB_TYPE,
  THEME_KEYS,
  THEMES_EXTENSION,
  THEMES_FILE_TYPE,
} from "../common/config";
import { EVENTS } from "../common/constants/events";
import { matchesKeybinding } from "../common/keybindings";
import { useStore } from "../common/store";
import type { Theme, ThemeColors } from "../common/types";
import { applyThemeColors, setColor } from "../utils/color_sync";
import { isObjectEmpty } from "../utils/parse";
import {
  createSaveScheduler,
  saveActiveThemeNameState,
  saveColorsState,
  saveThemesState,
} from "../utils/persistence";
import SidebarSection from "./SidebarSection";

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

// Theme section

export default function ThemesSection() {
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

    for (const [themeKey, themeValue] of Object.entries(themeToApply))
      setColor(themeKey, themeValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Theme functions

  const applyTheme = useCallback(
    (theme: Theme) => {
      const patch: Partial<ThemeColors> = {};
      for (const key of THEME_KEYS) {
        const value = theme[key];
        if (value != null) {
          patch[key] = value as string;
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
    const handler = (event: KeyboardEvent) => {
      if (matchesKeybinding(event, "themes.import")) {
        event.preventDefault();
        importThemes();
      } else if (matchesKeybinding(event, "themes.export")) {
        event.preventDefault();
        exportTheme();
      } else if (matchesKeybinding(event, "themes.focus")) {
        event.preventDefault();
        activeItem.current?.focus();
      }
    };

    document.addEventListener(EVENTS.KEY_DOWN, handler);
    return () => document.removeEventListener(EVENTS.KEY_DOWN, handler);
  }, [importThemes, exportTheme]);

  return (
    <SidebarSection
      id="section-themes"
      headerId="section-header-themes"
      title="Themes"
    >
      <div className="theme-list">
        {themes.length === 0 ? (
          <div id="theme-empty">No themes loaded.</div>
        ) : (
          themes.map((theme, index) => {
            const isActive = theme._name === activeThemeName;
            return (
              <div
                key={theme._name}
                ref={isActive ? activeItem : null}
                className={`theme-item${isActive ? " active" : ""}`}
                tabIndex={0}
                onClick={() => applyTheme(theme)}
                onDoubleClick={() => showInNewWindow(theme)}
                onKeyDown={(event) => {
                  if (
                    matchesKeybinding(
                      event as unknown as KeyboardEvent,
                      "themes.navigateUp",
                    )
                  ) {
                    event.preventDefault();
                    applyTheme(themes.at(index - 1)!);
                  } else if (
                    matchesKeybinding(
                      event as unknown as KeyboardEvent,
                      "themes.navigateDown",
                    )
                  ) {
                    event.preventDefault();
                    applyTheme(themes.at((index + 1) % themes.length)!);
                  }
                }}
              >
                <span className="theme-name">{theme._name}</span>
                <div
                  className="theme-swatch"
                  style={{ background: theme.background }}
                />
              </div>
            );
          })
        )}
      </div>
      <button
        id="btn-import-themes"
        className="theme-btn no-select"
        onClick={importThemes}
      >
        Import themes
      </button>
      <button
        id="btn-export-theme"
        className="theme-btn no-select"
        onClick={exportTheme}
      >
        Export theme
      </button>
    </SidebarSection>
  );
}
