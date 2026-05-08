import "./DialogButton.css";

interface DialogButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export function PrimaryButton({
  onClick,
  children,
  disabled = false,
}: DialogButtonProps) {
  return (
    <button
      className="dialog-button dialog-button-primary"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  onClick,
  children,
  disabled = false,
}: DialogButtonProps) {
  return (
    <button
      className="dialog-button dialog-button-secondary"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
