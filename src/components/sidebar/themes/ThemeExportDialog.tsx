import { useEffect, useState } from "react";
import {
  DEFAULT_EXPORT_THEME_FILENAME,
  THEMES_EXTENSION,
} from "../../../common/config";
import { matchesKeybinding } from "../../../common/keybindings";

interface ThemeExportDialogProps {
  isOpen: boolean;
  filename: string | null;
  onConfirm: (filename: string) => void;
  onCancel: () => void;
}

export default function ThemeExportDialog({
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
