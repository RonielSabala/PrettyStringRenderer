import { TOKENS, type ThemeColors, type TokenType } from "../common/types";
import { isObjectEmpty } from "../utils/parse";

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

    if (!(this.type in colors)) {
      this.color = colors.unknown ?? null;
      return;
    }

    const colorValue = colors[this.type];
    if (!colorValue) {
      return;
    }

    if (!Array.isArray(colorValue)) {
      this.color = colorValue;
      return;
    }

    if (isObjectEmpty(colorValue)) {
      return;
    }

    const colorIdx = (this.depth ?? 0) % colorValue.length;
    this.color = colorValue[colorIdx] ?? colors.unknown ?? null;
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
