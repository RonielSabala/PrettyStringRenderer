import { useEffect, useState } from "react";
import { ArrowCounterclockwise, Eraser } from "react-bootstrap-icons";
import { MAX_HEX_INPUT_LENGTH } from "../../../common/config";
import { CSS_VISIBILITY } from "../../../common/constants/css";
import type { ThemeColor } from "../../../common/types";
import "../SidebarRow.css";
import { TransparentSwatchIcon } from "../TransparentSwatchIcon";
import "./ColorRow.css";

interface Props {
  id: string;
  label: string;
  color: ThemeColor;
  onChange: (value: ThemeColor) => void;
}

export default function ColorRow({ id, label, color, onChange }: Props) {
  const [hexValue, setHexValue] = useState(color);
  const [previousColor, setPreviousColor] = useState<ThemeColor>(null);

  const hexInputId = `hex-input-${id}`;

  // Sync external color changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHexValue(color);
  }, [color]);

  const handleHexChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    setHexValue(value);
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
    <div className="sidebar-row">
      <label htmlFor={hexInputId} className="row-label">
        {label}
      </label>
      <div className="color-controls">
        <div className="input-group">
          <div className="swatch-container">
            <div
              className="swatch-preview"
              style={{ background: color || CSS_VISIBILITY.TRANSPARENT }}
            >
              {!color && <TransparentSwatchIcon />}
            </div>

            <input
              type="color"
              className="hidden-color-picker"
              value={color || "#000000"}
              onChange={(event) => onChange(event.target.value)}
            />
          </div>

          <input
            id={hexInputId}
            className="hex-input"
            value={hexValue || ""}
            placeholder="None"
            autoComplete="off"
            maxLength={MAX_HEX_INPUT_LENGTH}
            onChange={handleHexChange}
          />
        </div>

        <div className="action-container">
          {color ? (
            <button className="app-btn color-action-btn" onClick={handleClear}>
              <Eraser className="app-icon" />
            </button>
          ) : previousColor ? (
            <button className="app-btn color-action-btn" onClick={handleUndo}>
              <ArrowCounterclockwise className="app-icon" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
