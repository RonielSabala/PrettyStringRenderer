import { X } from "react-bootstrap-icons";
import { useKeybinding } from "../../hooks/useKeybinding";
import "./Dialog.css";

interface Props {
  isOpen: boolean;
  title?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export default function Dialog({
  isOpen,
  title,
  onClose,
  children,
  actions,
}: Props) {
  // Keybindings
  useKeybinding("dialog.close", onClose);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div
        className="dialog-container"
        onClick={(event) => event.stopPropagation()}
      >
        {title && (
          <div className="dialog-header no-user-select">
            <p className="dialog-title">{title}</p>
            <button className="app-btn dialog-close-btn" onClick={onClose}>
              <X className="app-icon" />
            </button>
          </div>
        )}
        {children}
        {actions && <div className="dialog-actions">{actions}</div>}
      </div>
    </div>
  );
}
