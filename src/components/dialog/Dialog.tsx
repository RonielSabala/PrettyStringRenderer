import { X } from "react-bootstrap-icons";
import "./Dialog.css";

interface DialogProps {
  isOpen: boolean;
  title?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
  overlayClassName?: string;
  dialogClassName?: string;
}

export default function Dialog({
  isOpen,
  title,
  onClose,
  children,
  actions,
  overlayClassName = "",
  dialogClassName = "",
}: DialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={`dialog-overlay ${overlayClassName}`} onClick={onClose}>
      <div
        className={`dialog-container ${dialogClassName}`}
        onClick={(event) => event.stopPropagation()}
      >
        {title && (
          <div className="dialog-header">
            <p className="dialog-title">{title}</p>
            <button className="dialog-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        )}
        {children}
        {actions && <div className="dialog-actions">{actions}</div>}
      </div>
    </div>
  );
}
