import { forwardRef } from "react";
import { Trash } from "react-bootstrap-icons";
import { CSS_VISIBILITY } from "../../../common/constants/css";
import {
  useThemeItem,
  type UseThemeItemProps,
} from "../../../hooks/sidebar/themes/useThemeItem";
import { titleToKebab } from "../../../utils/parse";
import { TransparentSwatchIcon } from "../TransparentSwatchIcon";
import "./ThemeItem.css";

interface Props extends UseThemeItemProps {
  isActive: boolean;
}

export const ThemeItem = forwardRef<HTMLDivElement, Props>(
  (
    { theme, isActive, onApply, onDelete, onShow, onNavigate },
    forwardedRef,
  ) => {
    const {
      localRef,
      handleClick,
      handleDoubleClick,
      handleDelete,
      hasBackground,
    } = useThemeItem({
      theme,
      onApply,
      onDelete,
      onShow,
      onNavigate,
    });

    // Merge refs
    const setRefs = (element: HTMLDivElement | null) => {
      localRef.current = element;

      if (typeof forwardedRef === "function") {
        forwardedRef(element);
      } else if (forwardedRef) {
        forwardedRef.current = element;
      }
    };

    return (
      <div
        ref={setRefs}
        id={`theme-item-${titleToKebab(theme._name)}`}
        className={`action-btn theme-item${isActive ? " active" : ""}`}
        tabIndex={0}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        <span className="theme-name">{theme._name}</span>
        <div className="theme-item-controls">
          <button className="app-btn theme-delete-btn" onClick={handleDelete}>
            <Trash className="app-icon" />
          </button>

          <div
            className={`theme-swatch ${hasBackground ? "" : "no-swatch-border"}`}
            style={{
              background: theme.background ?? CSS_VISIBILITY.TRANSPARENT,
            }}
          >
            {!hasBackground && <TransparentSwatchIcon />}
          </div>
        </div>
      </div>
    );
  },
);
