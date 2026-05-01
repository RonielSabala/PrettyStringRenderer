import { MAX_HEX_INPUT_LENGTH } from "../common/config";

interface Props {
  id: string;
  label: string;
  color: string;
  onChange: (value: string) => void;
}

export default function ColorRow({ id, label, color, onChange }: Props) {
  const handleHex = (value: string) => {
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      onChange(value);
    }
  };

  return (
    <div className="row">
      <label>{label}</label>
      <div className="swatch">
        <div
          id={`swatch-fill-${id}`}
          className="swatch-fill"
          style={{ background: color }}
        />
        <input
          id={`color-picker-${id}`}
          type="color"
          value={color}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      <input
        id={`hex-input-${id}`}
        className="hex-input"
        defaultValue={color}
        maxLength={MAX_HEX_INPUT_LENGTH}
        onChange={(event) => handleHex(event.target.value)}
      />
    </div>
  );
}
