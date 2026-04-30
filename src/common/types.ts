
export interface InputRange {
  value: number;
  min: number;
  max: number;
  step: number | undefined;
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
