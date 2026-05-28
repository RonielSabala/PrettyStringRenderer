import { useEffect, useState } from "react";
import { FileEarmarkRichtext } from "react-bootstrap-icons";
import {
  Dialog,
  FilenameInput,
  PrimaryButton,
  SecondaryButton,
} from "../dialog";

interface Props {
  isOpen: boolean;
  defaultFilename: string;
  onExport: (filename: string) => void;
  onCancel: () => void;
}

export default function SVGExportModal({
  isOpen,
  defaultFilename,
  onExport,
  onCancel,
}: Props) {
  const [filename, setFilename] = useState(defaultFilename);

  useEffect(() => {
    if (isOpen && defaultFilename) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilename(defaultFilename);
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
      title={
        <>
          <FileEarmarkRichtext className="app-icon" />
          Export SVG
        </>
      }
      onClose={onCancel}
      actions={
        <>
          <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
          <PrimaryButton onClick={handleSubmit} disabled={!filename.trim()}>
            Export SVG
          </PrimaryButton>
        </>
      }
    >
      <FilenameInput
        value={filename}
        placeholder={defaultFilename}
        onChange={setFilename}
        onSubmit={handleSubmit}
        autoFocus
      />
    </Dialog>
  );
}
