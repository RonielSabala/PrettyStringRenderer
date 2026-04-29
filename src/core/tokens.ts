import type { ThemeColors } from "../common/types";

export const TOKENS = Object.freeze({
  WHITE_SPACE: "white_space",
  COMMENT: "comment",
  NUMBER: "number",
  OPERATOR: "operator",
  VARIABLE: "variable",
  FUNCTION: "function",
  SEMICOLON: "semicolon",
  BRACKET: "bracket",
  UNKNOWN: "unknown",
} as const);

export type TokenType = (typeof TOKENS)[keyof typeof TOKENS];

export class Token {
  value: string;
  type: TokenType;
  depth: number | null;
  color: string | null = null;

  constructor(
    value: string,
    type: TokenType,
    depth: number | null,
    colors: ThemeColors,
  ) {
    this.value = value;
    this.type = type;
    this.depth = depth;
    this.updateColor(colors);
  }

  updateColor(colors: ThemeColors): void {
    if (this.type === TOKENS.WHITE_SPACE) {
      return;
    }

    const colorValue = colors[this.type as keyof ThemeColors];
    if (Array.isArray(colorValue)) {
      const colorIdx = (this.depth ?? 0) % colorValue.length;
      this.color = colorValue[colorIdx] ?? colors.unknown;
      return;
    }

    this.color = (colorValue as string | undefined) ?? colors.unknown;
  }
}

export class TokenResult {
  list: Token[] = [];

  add(
    value: string,
    type: TokenType,
    depth: number | null,
    colors: ThemeColors,
  ): void {
    this.list.push(new Token(value, type, depth, colors));
  }
}
