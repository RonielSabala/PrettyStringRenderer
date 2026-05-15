import "./DialogButton.css";

interface Props {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export function PrimaryButton({ onClick, children, disabled = false }: Props) {
  return (
    <button
      id="dialog-primary-btn"
      className="action-btn"
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
    <button className="static-action-btn" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
