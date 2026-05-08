import "./DialogButton.css";

interface Props {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export function PrimaryButton({ onClick, children, disabled = false }: Props) {
  return (
    <button
      className="dialog-button dialog-button-primary no-user-select"
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
}: Props) {
  return (
    <button
      className="dialog-button dialog-button-secondary no-user-select"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
