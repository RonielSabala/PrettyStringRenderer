export interface Bracket {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  depth: number;
}

export interface RawBracket {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface ThemeColors {
  bracket: string | string[];
  function: string;
  variable: string;
  operator: string;
  semicolon: string;
  number: string;
  comment: string;
  unknown: string;
  background: string;
  [key: string]: string | string[];
}
