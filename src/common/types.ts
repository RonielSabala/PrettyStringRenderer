import type { CssTextRendering } from "./constants/css";

export interface InputRange {
  value: number;
  min: number;
  max: number;
  step: number | undefined;
}

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
  height: number;
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

export interface CollapsedSections {
  [key: string]: boolean;
}

export interface ThemeColors {
  [key: string]: string | string[];
  bracket: string[];
  function: string;
  variable: string;
  operator: string;
  semicolon: string;
  number: string;
  comment: string;
  unknown: string;
  background: string;
}

export type Theme = ThemeColors & { _name: string };
