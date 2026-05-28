import { useRef } from "react";
import { useKeybinding } from "../../hooks/useKeybinding";
import "./FilenameInput.css";

interface Props {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  autoFocus?: boolean;
}

export default function FilenameInput({
  value,
  placeholder,
  onChange,
  onSubmit,
  autoFocus = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Keybindings
  useKeybinding("input.submit", onSubmit, { targetRef: inputRef });

  return (
    <div className="filename-input-container no-user-select">
      <label htmlFor="filename-input" className="filename-input-label">
        Filename:
      </label>
      <input
        ref={inputRef}
        id="filename-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
      />
    </div>
  );
}
