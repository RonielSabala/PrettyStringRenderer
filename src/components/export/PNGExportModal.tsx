import { useEffect, useState } from "react";
import { FileEarmarkImage, X } from "react-bootstrap-icons";
import {
  DEFAULT_EXPORT_IMAGE_FILENAME,
  DEFAULT_PNG_SCALAR,
  EXPORT_PNG_PROMPT_SCALAR_EXAMPLES,
  PNG_EXTENSION,
} from "../../common/config";
import { EVENTS } from "../../common/constants/events";
import { parseNumber } from "../../utils/parse";
import { createResolution, getScaledDimensions } from "../../utils/resolution";
import "./PNGExportModal.css";

interface PNGExportModalProps {
  isOpen: boolean;
  canvasWidth: number;
  canvasHeight: number;
  onExport: (scalar: number, filename: string) => void;
  onCancel: () => void;
  defaultFilename: string;
}

export default function PNGExportModal({
  isOpen,
  canvasWidth,
  canvasHeight,
  onExport,
  onCancel,
  defaultFilename,
}: PNGExportModalProps) {
  const [scalar, setScalar] = useState(DEFAULT_PNG_SCALAR);
  const [filename, setFilename] = useState("");

  useEffect(() => {
    const [exportWidth, exportHeight] = getScaledDimensions(
      canvasWidth,
      canvasHeight,
      scalar,
    );
    const resolution = createResolution(exportWidth, exportHeight);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilename(
      `${DEFAULT_EXPORT_IMAGE_FILENAME}-${resolution}${PNG_EXTENSION}`,
    );
  }, [scalar, canvasWidth, canvasHeight]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="png-export-modal-overlay" onClick={onCancel}>
      <div
        className="png-export-modal-dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="png-export-modal-header">
          <p className="png-export-modal-title">
            <FileEarmarkImage size={16} />
            Export PNG
          </p>
          <button className="png-export-modal-close" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>

        <p className="png-export-modal-description">
          Choose a scale factor for the export:
        </p>

        <div className="png-export-scalar-section">
          <div className="png-export-scalar-input-group">
            <label htmlFor="png-scalar">Scale:</label>
            <input
              id="png-scalar"
              type="number"
              min="0.5"
              max="10"
              step="0.5"
              value={scalar}
              onChange={(event) => {
                const value = parseNumber(
                  event.target.value,
                  DEFAULT_PNG_SCALAR,
                );
                setScalar(Math.max(0.5, value));
              }}
              onKeyDown={(event) => {
                if (event.key === EVENTS.ENTER) {
                  onExport(scalar, filename);
                } else if (event.key === EVENTS.ESCAPE) {
                  onCancel();
                }
              }}
              className="png-export-scalar-input"
            />
            <span className="png-export-scalar-unit"></span>
          </div>

          <div className="png-export-scalar-preview">
            <p className="png-export-preview-label">Preview:</p>
            <div className="png-export-preview-items">
              {EXPORT_PNG_PROMPT_SCALAR_EXAMPLES.map((scalarExample) => {
                const [width, height] = getScaledDimensions(
                  canvasWidth,
                  canvasHeight,
                  scalarExample,
                );
                const resolution = createResolution(width, height);
                return (
                  <button
                    key={scalarExample}
                    className={`png-export-preview-item ${scalar === scalarExample ? "active" : ""}`}
                    onClick={() => setScalar(scalarExample)}
                  >
                    <span className="png-export-preview-label">
                      {scalarExample}
                      <X />
                    </span>
                    <span className="png-export-preview-res">{resolution}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="png-export-filename-section">
            <label htmlFor="png-filename" className="png-export-filename-label">
              Filename:
            </label>
            <input
              id="png-filename"
              className="png-export-filename-input"
              value={filename}
              onChange={(event) => setFilename(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === EVENTS.ENTER) {
                  onExport(scalar, filename);
                } else if (event.key === EVENTS.ESCAPE) {
                  onCancel();
                }
              }}
              placeholder={defaultFilename}
            />
          </div>
        </div>

        <div className="png-export-modal-actions">
          <button className="png-export-modal-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="png-export-modal-confirm"
            onClick={() => onExport(scalar, filename)}
          >
            Export PNG
          </button>
        </div>
      </div>
    </div>
  );
}
