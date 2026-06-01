import { useEffect, useState } from "react";
import type { ThemeColor } from "../../../common/types";

export interface UseColorRowProps {
  color: ThemeColor;
  onChange: (value: ThemeColor) => void;
}

export function useColorRow({ color, onChange }: UseColorRowProps) {
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

  return {
    hexValue,
    handleHexChange,
    handleClear,
    handleUndo,
    canUndo: previousColor !== null,
  };
}
