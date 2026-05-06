import { X } from "react-bootstrap-icons";
import { THEME_BLOB_TYPE, THEMES_EXTENSION } from "../../../common/config";
import type { Theme } from "../../../common/types";
import { revokeAfter, urlFromObject } from "../../../utils/url";
import "./ThemeViewDialog.css";

interface ThemeViewDialogProps {
  theme: Theme | null;
  onClose: () => void;
}

export default function ThemeViewDialog({
  theme,
  onClose,
}: ThemeViewDialogProps) {
  if (!theme) {
    return null;
  }

  const jsonString = JSON.stringify(theme, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
  };

  const handleDownload = () => {
    const url = urlFromObject(theme, THEME_BLOB_TYPE);
    const anchorElement = document.createElement("a");
    anchorElement.href = url;
    anchorElement.download = `${theme._name}${THEMES_EXTENSION}`;
    anchorElement.click();
    revokeAfter(url);
  };

  return (
    <div className="theme-view-overlay" onClick={onClose}>
      <div
        className="theme-view-dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="theme-view-header">
          <p className="theme-view-title">{theme._name}</p>
          <button className="theme-view-close" onClick={onClose}>
            <X />
          </button>
        </div>
        <pre className="theme-view-content">{jsonString}</pre>
        <div className="theme-view-actions">
          <button className="theme-view-btn" onClick={handleCopy}>
            Copy
          </button>
          <button className="theme-view-btn" onClick={handleDownload}>
            Download
          </button>
          <button
            className="theme-view-btn theme-view-btn-primary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
