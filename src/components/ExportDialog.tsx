import { forwardRef } from "react";

const ExportDialog = forwardRef<HTMLDialogElement>((_, ref) => (
  <dialog id="dialog-export" ref={ref}>
    <p className="dialog-title no-select">Export canvas as</p>
    <div className="dialog-actions">
      <button id="btn-export-png" className="btn no-select" type="button">
        PNG
      </button>
      <button id="btn-export-svg" className="btn no-select" type="button">
        SVG
      </button>
    </div>
  </dialog>
));

ExportDialog.displayName = "ExportDialog";
export default ExportDialog;
