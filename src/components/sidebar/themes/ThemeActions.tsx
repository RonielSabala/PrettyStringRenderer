import { Download, Upload } from "react-bootstrap-icons";
import "./ThemeActions.css";

interface Props {
  onImport: () => void;
  onExport: () => void;
}

export default function ThemeActions({ onImport, onExport }: Props) {
  return (
    <div className="theme-actions">
      <button className="action-btn theme-action-btn" onClick={onImport}>
        <Upload className="app-icon" />
        <span>Import</span>
      </button>
      <button className="action-btn theme-action-btn" onClick={onExport}>
        <Download className="app-icon" />
        <span>Export</span>
      </button>
    </div>
  );
}
