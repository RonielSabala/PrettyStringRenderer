import { useCallback, useEffect, useRef, useState } from "react";
import { Download, FolderX, Upload } from "react-bootstrap-icons";
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
  const [isExporting, setIsExporting] = useState(false);
  const [exportFilename, setExportFilename] = useState<string | null>(null);
  const [viewingTheme, setViewingTheme] = useState<Theme | null>(null);

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
    setExportFilename(activeThemeName || DEFAULT_EXPORT_THEME_FILENAME);
    setIsExporting(true);
  }, [activeThemeName]);

  const confirmExport = useCallback(
    (filename: string) => {
      const anchorElement = document.createElement("a");
      anchorElement.href = _urlFromObject(colors);
      anchorElement.download = filename.endsWith(THEMES_EXTENSION)
        ? filename
        : `${filename}${THEMES_EXTENSION}`;

      anchorElement.click();
      _revokeAfter(anchorElement.href);
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

// Theme export dialog

interface ThemeExportDialogProps {
  isOpen: boolean;
  filename: string | null;
  onConfirm: (filename: string) => void;
  onCancel: () => void;
}

function ThemeExportDialog({
  isOpen,
  filename,
  onConfirm,
  onCancel,
}: ThemeExportDialogProps) {
  const [inputValue, setInputValue] = useState(filename || "");

  useEffect(() => {
    if (filename) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInputValue(filename);
    }
  }, [filename, isOpen]);

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onConfirm(inputValue);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="theme-export-overlay" onClick={onCancel}>
      <div
        className="theme-export-dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="theme-export-title">Export Theme</p>
        <p className="theme-export-description">
          Enter a name for your theme file:
        </p>
        <input
          type="text"
          className="theme-export-input"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={(event) => {
            if (matchesKeybinding(event, "themes.export.confirm")) {
              handleSubmit();
            } else if (matchesKeybinding(event, "themes.export.cancel")) {
              onCancel();
            }
          }}
          placeholder={DEFAULT_EXPORT_THEME_FILENAME}
          autoFocus
        />
        <p className="theme-export-preview">
          File:{" "}
          <strong>
            {inputValue || DEFAULT_EXPORT_THEME_FILENAME}
            {THEMES_EXTENSION}
          </strong>
        </p>
        <div className="theme-export-actions">
          <button className="theme-export-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="theme-export-confirm"
            onClick={handleSubmit}
            disabled={!inputValue.trim()}
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
}

// Theme view dialog

interface ThemeViewDialogProps {
  theme: Theme | null;
  onClose: () => void;
}

function ThemeViewDialog({ theme, onClose }: ThemeViewDialogProps) {
  if (!theme) {
    return null;
  }

  const jsonString = JSON.stringify(theme, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
  };

  const handleDownload = () => {
    const url = _urlFromObject(theme);
    const anchorElement = document.createElement("a");
    anchorElement.href = url;
    anchorElement.download = `${theme._name}${THEMES_EXTENSION}`;
    anchorElement.click();
    _revokeAfter(url);
  };

  return (
    <div className="theme-view-overlay" onClick={onClose}>
      <div
        className="theme-view-dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="theme-view-header">
          <p className="theme-view-title">{theme._name}</p>
          <button className="theme-view-close" onClick={onClose}>
            ×
          </button>
        </div>
        <pre className="theme-view-content">{jsonString}</pre>
        <div className="theme-view-actions">
          <button className="theme-view-btn" onClick={handleCopy}>
            Copy
          </button>
          <button className="theme-view-btn" onClick={handleDownload}>
            Download
          </button>
          <button
            className="theme-view-btn theme-view-btn-primary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
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

      <ThemeExportDialog
        isOpen={isExporting}
        filename={exportFilename}
        onConfirm={confirmExport}
        onCancel={cancelExport}
      />

      <ThemeViewDialog theme={viewingTheme} onClose={closeViewingTheme} />
    </SidebarSection>
  );
}
