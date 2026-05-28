import { useEffect, useState } from "react";
import { THEMES_EXTENSION } from "../../../common/config";
import {
  Dialog,
  FilenameInput,
  PrimaryButton,
  SecondaryButton,
} from "../../dialog";

interface Props {
  isOpen: boolean;
  defaultFilename: string | null;
  onExport: (filename: string) => void;
  onCancel: () => void;
}

export default function ThemeExportDialog({
  isOpen,
  defaultFilename,
  onExport,
  onCancel,
}: Props) {
  const [filename, setFilename] = useState(defaultFilename || "");

  useEffect(() => {
    if (isOpen && defaultFilename) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilename(defaultFilename + THEMES_EXTENSION);
    }
  }, [isOpen, defaultFilename]);

  const handleSubmit = () => {
    if (filename.trim()) {
      onExport(filename);
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
          <PrimaryButton onClick={handleSubmit} disabled={!filename.trim()}>
            Export Theme
          </PrimaryButton>
        </>
      }
    >
      <FilenameInput
        value={filename}
        placeholder={defaultFilename + THEMES_EXTENSION}
        onChange={setFilename}
        onSubmit={handleSubmit}
        autoFocus
      />
    </Dialog>
  );
}
