import { getStore } from "../common/store";
import type { ThemeColors } from "../common/types";

export function setColor(
  themeKey: string,
  themeValue: string | string[],
): void {
  getStore().setColors({ [themeKey]: themeValue });
  getStore().recolor();
}

export function applyThemeColors(theme: Partial<ThemeColors>): void {
  getStore().setColors(theme);
  getStore().recolor();
}
