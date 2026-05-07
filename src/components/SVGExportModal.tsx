import { useEffect, useState } from "react";
import { FileEarmarkRichtext, X } from "react-bootstrap-icons";
import { EVENTS } from "../common/constants/events";
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

  if (!isOpen) {
    return null;
  }

  return (
    <div className="svg-export-modal-overlay" onClick={onCancel}>
      <div
        className="svg-export-modal-dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="svg-export-modal-header">
          <p className="svg-export-modal-title">
            <FileEarmarkRichtext size={16} />
            Export SVG
          </p>
          <button className="svg-export-modal-close" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>

        <p className="svg-export-modal-description">
          Enter a filename for the SVG export:
        </p>

        <div className="svg-export-scalar-section">
          <input
            value={filename}
            onChange={(event) => setFilename(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === EVENTS.ENTER) {
                onExport(filename);
              } else if (event.key === EVENTS.ESCAPE) {
                onCancel();
              }
            }}
            className="svg-export-scalar-input"
            autoFocus
          />
        </div>

        <div className="svg-export-modal-actions">
          <button className="svg-export-modal-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="svg-export-modal-confirm"
            onClick={() => onExport(filename)}
          >
            Export SVG
          </button>
        </div>
      </div>
    </div>
  );
}
