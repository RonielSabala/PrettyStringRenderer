import { forwardRef, type ReactNode } from "react";
import { FileEarmarkImage, FileEarmarkRichtext } from "react-bootstrap-icons";
import {
  DEFAULT_EXPORT_IMAGE_FILENAME,
  PNG_EXTENSION,
  SVG_EXTENSION,
} from "../../common/config";
import { useStore } from "../../common/store";
import {
  useExportDialog,
  type ExportDialogHandle,
} from "../../hooks/useExportDialog";
import { getFilename } from "../../utils/exporters";
import { Dialog } from "../dialog";
import "./ExportDialog.css";
import PNGExportModal from "./PNGExportModal";
import SVGExportModal from "./SVGExportModal";

// Sub-component

interface ExportFormatButtonProps {
  label: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
}

function ExportFormatButton({
  label,
  description,
  icon,
  onClick,
}: ExportFormatButtonProps) {
  return (
    <button className="action-btn export-format-btn" onClick={onClick}>
      {icon}
      <div className="export-btn-container no-user-select">
        <p className="export-btn-label">{label}</p>
        <p className="export-btn-description">{description}</p>
      </div>
    </button>
  );
}

// Main Component

export const ExportDialog = forwardRef<ExportDialogHandle>((_, ref) => {
  const width = useStore((state) => state.canvasConfig.width);
  const height = useStore((state) => state.canvasConfig.height);

  const {
    isOpen,
    isPNGModalOpen,
    isSVGModalOpen,
    closeDialog,
    handlePNGClick,
    handleSVGClick,
    handlePNGExport,
    handleSVGExport,
    handleClosePNGModal,
    handleCloseSVGModal,
  } = useExportDialog({ ref });

  return (
    <>
      <Dialog isOpen={isOpen} title="Export" onClose={closeDialog}>
        <div className="export-dialog-actions">
          <ExportFormatButton
            label="PNG"
            description="Raster image"
            icon={<FileEarmarkImage className="app-icon" />}
            onClick={handlePNGClick}
          />
          <ExportFormatButton
            label="SVG"
            description="Vector image"
            icon={<FileEarmarkRichtext className="app-icon" />}
            onClick={handleSVGClick}
          />
        </div>
      </Dialog>

      <PNGExportModal
        isOpen={isPNGModalOpen}
        canvasWidth={width}
        canvasHeight={height}
        defaultFilename={getFilename(
          width,
          height,
          DEFAULT_EXPORT_IMAGE_FILENAME,
          PNG_EXTENSION,
        )}
        onExport={handlePNGExport}
        onCancel={handleClosePNGModal}
      />

      <SVGExportModal
        isOpen={isSVGModalOpen}
        defaultFilename={getFilename(
          width,
          height,
          DEFAULT_EXPORT_IMAGE_FILENAME,
          SVG_EXTENSION,
        )}
        onExport={handleSVGExport}
        onCancel={handleCloseSVGModal}
      />
    </>
  );
});

export default ExportDialog;
