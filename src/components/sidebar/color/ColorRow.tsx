import { useEffect, useState } from "react";
import { ArrowCounterclockwise, Eraser } from "react-bootstrap-icons";
import { MAX_HEX_INPUT_LENGTH } from "../../../common/config";
import { CSS_STYLE } from "../../../common/constants/css";
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
      <label className="row-label">{label}</label>
      <div className="color-controls">
        <div className="input-group">
          <div className="swatch-container">
            <div
              className="swatch-preview"
              style={{ background: color || CSS_STYLE.TRANSPARENT }}
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
            id={`hex-input-${id}`}
            className="hex-input"
            value={hexValue || ""}
            placeholder="None"
            maxLength={MAX_HEX_INPUT_LENGTH}
            onChange={handleHexChange}
          />
        </div>

        <div className="action-container">
          {color ? (
            <button className="row-action-btn" onClick={handleClear}>
              <Eraser size={14} />
            </button>
          ) : previousColor ? (
            <button className="row-action-btn" onClick={handleUndo}>
              <ArrowCounterclockwise size={14} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
