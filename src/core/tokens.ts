import { TOKENS, type ThemeColors, type TokenType } from "../common/types";

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
    if (this.type === TOKENS.BACKGROUND) {
      return;
    }

    const colorValue = colors[this.type];
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
