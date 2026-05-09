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
        <Upload size={16} />
        <span>Import</span>
      </button>
      <button className="action-btn theme-action-btn" onClick={onExport}>
        <Download size={16} />
        <span>Export</span>
      </button>
    </div>
  );
}
