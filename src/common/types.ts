import type { CssTextRendering } from "./constants/css";

export interface CollapsedSections {
  [key: string]: boolean;
}

export interface InputRange {
  value: number;
  min: number;
  max: number;
  step?: number;
}

// Configs

export interface TypographyConfig {
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  padX: number;
  padY: number;
  textRendering: CssTextRendering;
}

export interface EditorConfig {
  cursorSelection: number[];
  heightFraction: number;
  content: string;
  fontSize: number;
}

export interface CanvasConfig {
  zoom: number;
  panX: number;
  panY: number;
  width: number;
  height: number;
  fitToContent: boolean;
}

// Tokens

export const TOKENS = Object.freeze({
  BRACKET: "bracket",
  FUNCTION: "function",
  VARIABLE: "variable",
  OPERATOR: "operator",
  SEMICOLON: "semicolon",
  NUMBER: "number",
  COMMENT: "comment",
  UNKNOWN: "unknown",
  BACKGROUND: "background",
} as const);

export type TokenType = (typeof TOKENS)[keyof typeof TOKENS];

// Themes

export const THEME_KEYS = Object.values(TOKENS) as readonly TokenType[];

export type ThemeColor = string | null | undefined;

export type ThemeColors = {
  [K in TokenType]?: (K extends "bracket" ? string[] : string) | null;
};

export type Theme = ThemeColors & { _name: string };

// App themes

export const APP_THEMES = Object.freeze({
  LIGHT: "light",
  DARK: "dark",
} as const);

export type AppThemeType = (typeof APP_THEMES)[keyof typeof APP_THEMES];
