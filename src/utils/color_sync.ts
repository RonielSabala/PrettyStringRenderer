import { getStore } from "../common/store";
import type { ThemeColors, TokenType } from "../common/types";

export function setColor(
  themeKey: TokenType,
  themeValue: string | string[],
): void {
  getStore().setColors({ [themeKey]: themeValue });
  getStore().recolor(themeKey);
}

export function applyThemeColors(theme: Partial<ThemeColors>): void {
  getStore().setColors(theme);
  getStore().recolor();
}
