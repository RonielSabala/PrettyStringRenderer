import { EVENTS } from "../../common/constants/events";
import "./FilenameInput.css";

interface Props {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  autoFocus?: boolean;
}

export default function FilenameInput({
  value,
  placeholder,
  onChange,
  onSubmit,
  onCancel,
  autoFocus = false,
}: Props) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === EVENTS.ENTER) {
      onSubmit();
    } else if (event.key === EVENTS.ESCAPE) {
      onCancel();
    }
  };

  return (
    <div className="filename-input-container no-user-select">
      <label htmlFor="filename-input" className="filename-input-label">
        Filename:
      </label>
      <input
        id="filename-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
    </div>
  );
}
