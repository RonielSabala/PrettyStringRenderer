import { type Dispatch, type SetStateAction } from "react";
import { FileEarmarkImage, X } from "react-bootstrap-icons";
import {
  DEFAULT_EXPORT_PNG_SCALAR,
  EXPORT_PNG_PROMPT_SCALAR_EXAMPLES,
  EXPORT_PNG_SCALAR_STEP,
  MAX_EXPORT_PNG_SCALAR,
  MIN_EXPORT_PNG_SCALAR,
} from "../../common/config";
import { usePNGExportModal } from "../../hooks/export/usePNGExportModal";
import { parseNumber } from "../../utils/parse";
import { createResolution, getScaledDimensions } from "../../utils/resolution";
import {
  Dialog,
  FilenameInput,
  PrimaryButton,
  SecondaryButton,
} from "../dialog";
import "./PNGExportModal.css";

// Sub-components

interface ScalarInputGroupProps {
  scalar: number;
  setScalar: Dispatch<SetStateAction<number>>;
}

function ScalarInputGroup({ scalar, setScalar }: ScalarInputGroupProps) {
  return (
    <div id="scalar-input-group">
      <label htmlFor="png-scalar">Scale:</label>
      <input
        id="png-scalar"
        className="number-input png-export-scalar-input"
        type="number"
        min={MIN_EXPORT_PNG_SCALAR}
        max={MAX_EXPORT_PNG_SCALAR}
        step={EXPORT_PNG_SCALAR_STEP}
        value={scalar}
        onChange={(event) => {
          const value = parseNumber(
            event.target.value,
            DEFAULT_EXPORT_PNG_SCALAR,
          );
          setScalar(Math.max(MIN_EXPORT_PNG_SCALAR, value));
        }}
      />
    </div>
  );
}

interface ScalarPreviewButtonProps {
  defaultScalar: number;
  scalar: number;
  setScalar: Dispatch<SetStateAction<number>>;
  resolution: string;
}

function ScalarPreviewButton({
  defaultScalar,
  scalar,
  setScalar,
  resolution,
}: ScalarPreviewButtonProps) {
  return (
    <button
      className={`static-action-btn png-export-preview-btn ${scalar === defaultScalar ? "active" : ""}`}
      onClick={() => setScalar(defaultScalar)}
    >
      <span className="btn-preview-label">
        {defaultScalar}
        <X />
      </span>
      <span className="png-export-preview-resolution">{resolution}</span>
    </button>
  );
}

interface ScalarPreviewGroupProps {
  canvasWidth: number;
  canvasHeight: number;
  scalar: number;
  setScalar: Dispatch<SetStateAction<number>>;
}

function ScalarPreviewGroup({
  canvasWidth,
  canvasHeight,
  scalar,
  setScalar,
}: ScalarPreviewGroupProps) {
  return (
    <div id="scalar-preview-group">
      <p id="preview-label">Preview:</p>
      <div id="preview-items">
        {EXPORT_PNG_PROMPT_SCALAR_EXAMPLES.map((scalarExample) => {
          const [width, height] = getScaledDimensions(
            canvasWidth,
            canvasHeight,
            scalarExample,
          );

          return (
            <ScalarPreviewButton
              key={scalarExample}
              defaultScalar={scalarExample}
              scalar={scalar}
              setScalar={setScalar}
              resolution={createResolution(width, height)}
            />
          );
        })}
      </div>
    </div>
  );
}

// Main Component

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
  defaultFilename,
  onExport,
  onCancel,
}: PNGExportModalProps) {
  const { scalar, setScalar, filename, setFilename, handleSubmit } =
    usePNGExportModal({
      isOpen,
      canvasWidth,
      canvasHeight,
      defaultFilename,
      onExport,
    });

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
      <p id="png-export-modal-description" className="no-user-select">
        Choose a scale factor for the export:
      </p>
      <div id="png-export-body" className="no-user-select">
        <ScalarInputGroup scalar={scalar} setScalar={setScalar} />
        <ScalarPreviewGroup
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          scalar={scalar}
          setScalar={setScalar}
        />

        <FilenameInput
          value={filename}
          placeholder={defaultFilename}
          onChange={setFilename}
          onSubmit={handleSubmit}
        />
      </div>
    </Dialog>
  );
}
