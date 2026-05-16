import { forwardRef } from "react";
import { Trash } from "react-bootstrap-icons";
import { CSS_STYLE } from "../../../common/constants/css";
import { matchesKeybinding } from "../../../common/keybindings";
import type { Theme } from "../../../common/types";
import { titleToKebab } from "../../../utils/parse";
import { TransparentSwatchIcon } from "../TransparentSwatchIcon";
import "./ThemeItem.css";

interface Props {
  theme: Theme;
  isActive: boolean;
  onApply: (theme: Theme) => void;
  onDelete: (theme: Theme) => void;
  onShow: (theme: Theme) => void;
  onNavigate: (upDirection: boolean) => void;
}

export const ThemeItem = forwardRef<HTMLDivElement, Props>(
  ({ theme, isActive, onApply, onDelete, onShow, onNavigate }, ref) => (
    <div
      ref={ref}
      id={`theme-item-${titleToKebab(theme._name)}`}
      className={`action-btn theme-item${isActive ? " active" : ""}`}
      tabIndex={0}
      onClick={() => onApply(theme)}
      onDoubleClick={() => onShow(theme)}
      onKeyDown={(event) => {
        if (
          matchesKeybinding(
            event as unknown as KeyboardEvent,
            "themes.navigateUp",
          )
        ) {
          event.preventDefault();
          onNavigate(true);
        } else if (
          matchesKeybinding(
            event as unknown as KeyboardEvent,
            "themes.navigateDown",
          )
        ) {
          event.preventDefault();
          onNavigate(false);
        }
      }}
    >
      <span className="theme-name">{theme._name}</span>

      <div className="theme-item-controls">
        <button
          className="app-btn theme-delete-btn"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(theme);
          }}
        >
          <Trash className="app-icon" />
        </button>

        <div
          className="theme-swatch"
          style={{ background: theme.background ?? CSS_STYLE.TRANSPARENT }}
        >
          {!theme.background && <TransparentSwatchIcon />}
        </div>
      </div>
    </div>
  ),
);
