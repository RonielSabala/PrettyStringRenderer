import { ArrowCounterclockwise, Eraser } from "react-bootstrap-icons";
import { MAX_HEX_INPUT_LENGTH } from "../../../common/config";
import { CSS_VISIBILITY } from "../../../common/constants/css";
import { useColorRow, type UseColorRowProps } from "../../../hooks/useColorRow";
import "../SidebarRow.css";
import { TransparentSwatchIcon } from "../TransparentSwatchIcon";
import "./ColorRow.css";

interface Props extends UseColorRowProps {
  id: string;
  label: string;
}

export default function ColorRow({ id, label, color, onChange }: Props) {
  const { hexValue, handleHexChange, handleClear, handleUndo, canUndo } =
    useColorRow({ color, onChange });

  const hexInputId = `hex-input-${id}`;

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
          ) : canUndo ? (
            <button className="app-btn color-action-btn" onClick={handleUndo}>
              <ArrowCounterclockwise className="app-icon" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
