import { MAX_HEX_INPUT_LENGTH } from "../common/config";

interface Props {
  key: string;
  label: string;
  color: string;
  onChange: (value: string) => void;
}

export default function ColorRow({ key, label, color, onChange }: Props) {
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
          id={`swatch-fill-${key}`}
          className="swatch-fill"
          style={{ background: color }}
        />
        <input
          id={`color-picker-${key}`}
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <input
        id={`hex-input-${key}`}
        className="hex-input"
        defaultValue={color}
        maxLength={MAX_HEX_INPUT_LENGTH}
        onChange={(e) => handleHex(e.target.value)}
      />
    </div>
  );
}
