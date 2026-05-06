import { Download, Upload } from "react-bootstrap-icons";

interface ThemeActionsProps {
  onImport: () => void;
  onExport: () => void;
}

export default function ThemeActions({
  onImport,
  onExport,
}: ThemeActionsProps) {
  return (
    <div className="theme-actions">
      <button
        id="btn-import-themes"
        className="theme-btn no-select"
        onClick={onImport}
      >
        <Upload size={16} />
        <span>Import</span>
      </button>
      <button
        id="btn-export-theme"
        className="theme-btn no-select"
        onClick={onExport}
      >
        <Download size={16} />
        <span>Export</span>
      </button>
    </div>
  );
}
