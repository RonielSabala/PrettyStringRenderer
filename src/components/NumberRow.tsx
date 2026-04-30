interface Props {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
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
  return (
    <div className="row">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        className="number-input"
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => {
          const value = parseFloat(event.target.value);
          if (!isNaN(value)) {
            onChange(value);
          }
        }}
      />
    </div>
  );
}
