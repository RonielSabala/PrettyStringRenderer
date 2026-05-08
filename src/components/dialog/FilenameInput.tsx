import { EVENTS } from "../../common/constants/events";
import "./FilenameInput.css";

interface Props {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  autoFocus?: boolean;
}

export default function FilenameInput({
  label,
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
    <div className="filename-input-container">
      <label
        htmlFor="filename-input"
        className="filename-input-label no-user-select"
      >
        {label}
      </label>
      <input
        id="filename-input"
        className="filename-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
    </div>
  );
}
