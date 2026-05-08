import { useEffect, useState } from "react";
import {
  DEFAULT_EXPORT_THEME_FILENAME,
  THEMES_EXTENSION,
} from "../../../common/config";
import { EVENTS } from "../../../common/constants/events";
import { Dialog, PrimaryButton, SecondaryButton } from "../../dialog";
import "./ThemeExportDialog.css";

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
      setInputValue(filename + THEMES_EXTENSION);
    }
  }, [filename, isOpen]);

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onConfirm(inputValue);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      title="Export Theme"
      onClose={onCancel}
      actions={
        <>
          <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
          <PrimaryButton onClick={handleSubmit} disabled={!inputValue.trim()}>
            Export
          </PrimaryButton>
        </>
      }
    >
      <p className="theme-export-description">
        Enter a filename for the theme export:
      </p>
      <input
        className="theme-export-input"
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === EVENTS.ENTER) {
            handleSubmit();
          } else if (event.key === EVENTS.ESCAPE) {
            onCancel();
          }
        }}
        placeholder={DEFAULT_EXPORT_THEME_FILENAME + THEMES_EXTENSION}
        autoFocus
      />
    </Dialog>
  );
}
