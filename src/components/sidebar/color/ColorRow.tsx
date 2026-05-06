import { useEffect, useState } from "react";
import { ArrowCounterclockwise, Eraser } from "react-bootstrap-icons";
import { MAX_HEX_INPUT_LENGTH } from "../../../common/config";
import { CSS_STYLE } from "../../../common/constants/css";
import type { ThemeColor } from "../../../common/types";
import { TransparentSwatchIcon } from "../TransparentSwatchIcon";

interface Props {
  id: string;
  label: string;
  color: ThemeColor;
  onChange: (value: ThemeColor) => void;
}

export default function ColorRow({ id, label, color, onChange }: Props) {
  const [hexValue, setHexValue] = useState(color);
  const [previousColor, setPreviousColor] = useState<ThemeColor>(null);

  // Sync external color changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHexValue(color);
  }, [color]);

  const handleHex = (value: ThemeColor) => {
    if (!value || /^#[0-9A-Fa-f]{6}$/.test(value)) {
      onChange(value);
    }
  };

  const handleClear = () => {
    setPreviousColor(color);
    onChange(null);
  };

  const handleUndo = () => {
    onChange(previousColor);
    setPreviousColor(null);
  };

  return (
    <div className="row">
      <label>{label}</label>
      <div className="swatch">
        <div
          id={`swatch-fill-${id}`}
          className="swatch-fill"
          style={{ background: color || CSS_STYLE.TRANSPARENT }}
        >
          {!color && <TransparentSwatchIcon />}
        </div>
        <input
          id={`color-picker-${id}`}
          type="color"
          value={color || "#000000"}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      <input
        id={`hex-input-${id}`}
        className="hex-input"
        value={hexValue || ""}
        maxLength={MAX_HEX_INPUT_LENGTH}
        onChange={(event) => handleHex(event.target.value)}
      />
      {color ? (
        <button
          id={`clear-color-${id}`}
          className="clear-color-btn"
          onClick={handleClear}
          title="Clear color"
        >
          <Eraser size={16} />
        </button>
      ) : previousColor ? (
        <button
          id={`undo-clear-${id}`}
          className="clear-color-btn"
          onClick={handleUndo}
          title="Undo clear"
        >
          <ArrowCounterclockwise size={16} />
        </button>
      ) : null}
    </div>
  );
}
