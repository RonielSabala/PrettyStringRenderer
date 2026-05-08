import { useEffect, useState } from "react";
import { FileEarmarkRichtext } from "react-bootstrap-icons";
import { EVENTS } from "../../common/constants/events";
import { Dialog, PrimaryButton, SecondaryButton } from "../dialog";
import "./SVGExportModal.css";

interface SVGExportModalProps {
  isOpen: boolean;
  onExport: (filename: string) => void;
  onCancel: () => void;
  defaultFilename: string;
}

export default function SVGExportModal({
  isOpen,
  onExport,
  onCancel,
  defaultFilename,
}: SVGExportModalProps) {
  const [filename, setFilename] = useState(defaultFilename);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilename(defaultFilename);
    }
  }, [isOpen, defaultFilename]);

  return (
    <Dialog
      isOpen={isOpen}
      title={
        <>
          <FileEarmarkRichtext size={16} />
          Export SVG
        </>
      }
      onClose={onCancel}
      actions={
        <>
          <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
          <PrimaryButton onClick={() => onExport(filename)}>
            Export SVG
          </PrimaryButton>
        </>
      }
    >
      <p className="svg-export-modal-description">
        Enter a filename for the SVG export:
      </p>
      <div className="svg-export-scalar-section">
        <input
          className="svg-export-scalar-input"
          value={filename}
          onChange={(event) => setFilename(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === EVENTS.ENTER) {
              onExport(filename);
            } else if (event.key === EVENTS.ESCAPE) {
              onCancel();
            }
          }}
          placeholder={defaultFilename}
          autoFocus
        />
      </div>
    </Dialog>
  );
}
