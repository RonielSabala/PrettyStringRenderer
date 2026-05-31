import { getStore, useStore } from "../common/store";
import { TOKENS, type ThemeColor, type TokenType } from "../common/types";
import { createSaveScheduler, saveColorsState } from "../utils/persistence";

// Private helpers

const _scheduleSave = createSaveScheduler(saveColorsState);

function _setColor(
  themeKey: TokenType,
  themeValue: ThemeColor | ThemeColor[],
): void {
  getStore().setColors({ [themeKey]: themeValue });
  getStore().recolor(themeKey);
}

// Generic color section

export interface UseColorSectionProps {
  doRedraw?: boolean;
}

export function useColorSection({ doRedraw }: UseColorSectionProps) {
  const redraw = useStore((state) => state.redraw);

  const handleChange = (key: TokenType, value: ThemeColor) => {
    _setColor(key, value);
    if (doRedraw) {
      redraw();
    }

    _scheduleSave();
  };

  return { handleChange };
}

// Bracket color section

export function useBracketColorSection() {
  const redraw = useStore((state) => state.redraw);
  const brackets = useStore((state) => state.colors.bracket);

  const handleChange = (idx: number, value: ThemeColor) => {
    if (!brackets) {
      if (!value) {
        return;
      }

      _setColor(TOKENS.BRACKET, [value]);
    } else {
      const next = [...brackets] as ThemeColor[];
      next[idx] = value;
      _setColor(TOKENS.BRACKET, next);
    }

    redraw();
    _scheduleSave();
  };

  return { brackets, handleChange };
}
