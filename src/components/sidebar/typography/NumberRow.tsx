import type { InputRange } from "../../../common/types";
import "../SidebarRow.css";
import "./NumberRow.css";

interface Props extends InputRange {
  id: string;
  label: string;
  onChange: (value: number) => void;
}

export default function NumberRow({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: Props) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    if (!isNaN(value)) {
      onChange(value);
    }
  };

  return (
    <div className="sidebar-row">
      <label htmlFor={id} className="row-label">
        {label}
      </label>
      <div className="number-controls">
        <input
          type="range"
          className="number-slider"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
        />
        <input
          id={id}
          className="number-input"
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
