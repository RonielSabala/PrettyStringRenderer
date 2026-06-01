import { useRef } from "react";
import type { Theme } from "../../../common/types";
import { useKeybinding } from "../../useKeybinding";

export interface UseThemeItemProps {
  theme: Theme;
  onApply: (theme: Theme) => void;
  onDelete: (theme: Theme) => void;
  onShow: (theme: Theme) => void;
  onNavigate: (upDirection: boolean) => void;
}

export function useThemeItem({
  theme,
  onApply,
  onDelete,
  onShow,
  onNavigate,
}: UseThemeItemProps) {
  const localRef = useRef<HTMLDivElement>(null);

  // Handlers
  const handleClick = () => onApply(theme);
  const handleDoubleClick = () => onShow(theme);
  const handleDelete = (
    event: import("react").MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void => {
    event.stopPropagation();
    onDelete(theme);
  };

  const hasBackground = Boolean(theme.background);

  // Keybindings
  useKeybinding("themes.navigateUp", () => onNavigate(true), {
    targetRef: localRef,
  });
  useKeybinding("themes.navigateDown", () => onNavigate(false), {
    targetRef: localRef,
  });

  return {
    localRef,
    handleClick,
    handleDoubleClick,
    handleDelete,
    hasBackground,
  };
}
