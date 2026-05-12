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
import {
  Dialog,
  FilenameInput,
  PrimaryButton,
  SecondaryButton,
} from "../dialog";
import "./PNGExportModal.css";

interface Props {
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
  defaultFilename,
  onExport,
  onCancel,
}: Props) {
  const [scalar, setScalar] = useState(DEFAULT_PNG_SCALAR);
  const [filename, setFilename] = useState(defaultFilename);

  useEffect(() => {
    if (!isOpen || !defaultFilename) {
      return;
    }

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
  }, [isOpen, defaultFilename, canvasWidth, canvasHeight, scalar]);

  const handleSubmit = () => {
    if (filename.trim()) {
      onExport(scalar, filename);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      title={
        <>
          <FileEarmarkImage className="app-icon" />
          Export PNG
        </>
      }
      onClose={onCancel}
      actions={
        <>
          <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
          <PrimaryButton onClick={handleSubmit} disabled={!filename.trim()}>
            Export PNG
          </PrimaryButton>
        </>
      }
    >
      <p className="png-export-modal-description no-user-select">
        Choose a scale factor for the export:
      </p>
      <div className="png-export-scalar-section">
        <div className="png-export-scalar-input-group">
          <label htmlFor="png-scalar" className="no-user-select">
            Scale:
          </label>
          <input
            id="png-scalar"
            className="number-input png-export-scalar-input"
            type="number"
            min="0.5"
            max="10"
            step="0.5"
            value={scalar}
            onChange={(event) => {
              const value = parseNumber(event.target.value, DEFAULT_PNG_SCALAR);
              setScalar(Math.max(0.5, value));
            }}
            onKeyDown={(event) => {
              if (event.key === EVENTS.ENTER) {
                onExport(scalar, filename);
              } else if (event.key === EVENTS.ESCAPE) {
                onCancel();
              }
            }}
          />
          <span className="png-export-scalar-unit"></span>
        </div>

        <div className="png-export-scalar-preview">
          <p className="png-export-preview-label no-user-select">Preview:</p>
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
                  className={`static-action-btn png-export-preview-btn ${scalar === scalarExample ? "active" : ""}`}
                  onClick={() => setScalar(scalarExample)}
                >
                  <span className="png-export-preview-label no-user-select">
                    {scalarExample}
                    <X />
                  </span>
                  <span className="png-export-preview-resolution no-user-select">
                    {resolution}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <FilenameInput
          value={filename}
          placeholder={defaultFilename}
          onChange={setFilename}
          onSubmit={handleSubmit}
          onCancel={onCancel}
        />
      </div>
    </Dialog>
  );
}
