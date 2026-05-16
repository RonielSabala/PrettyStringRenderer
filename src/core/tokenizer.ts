import { LINE_BREAK } from "../common/config";
import { TOKENS, type ThemeColors, type TokenType } from "../common/types";
import {
  BRACKET_SETS,
  INLINE_BRACKETS,
  ML_BRACKET_CHARS,
  type Bracket,
  type RawBracket,
} from "./brackets/data";
import { buildBracketsWithDepth, detectBrackets } from "./brackets/detector";
import type { LineAnalysis } from "./brackets/line_analysis";
import { getLineAnalysis, lineHasBracketChars } from "./brackets/line_analysis";
import {
  isCommentPart,
  isCommentStart,
  isDigit,
  isDot,
  isFunctionStart,
  isIdentifierPart,
  isIdentifierStart,
  isNumberStart,
  isOperator,
  isSemicolon,
  isSpace,
} from "./predicates";
import type { Token } from "./tokens";
import { TokenResult } from "./tokens";

function _consumeLine(
  line: string,
  start: number,
  end: number,
  predicate: (char: string) => boolean,
): number {
  let i = start;
  while (i < end && predicate(line[i])) {
    i++;
  }

  return i;
}

export class Tokenizer {
  private _brackets: Bracket[] = [];
  private _rawBrackets: RawBracket[] = [];
  private _lines: string[] = [];
  private _lineAnalysis: (LineAnalysis | undefined)[] = [];
  private _tokenizedLines: Token[][] = [];

  maxLine: number = 0;
  linesCount: number = 0;

  get lines(): string[] {
    return this._lines;
  }

  get tokenizedLines(): Token[][] {
    return this._tokenizedLines;
  }

  tokenize(text: string, colors: ThemeColors): void {
    const newLines = text.split(LINE_BREAK);
    const height = newLines.length;

    const newLineAnalysis: (LineAnalysis | undefined)[] = new Array(height);
    const newTokenizedLines: Token[][] = new Array(height);
    const bracketsChanged = this._syncBrackets(newLines);
    let maxLine = 0;

    for (let i = 0; i < height; i++) {
      const line = newLines[i];
      const prevTokens = this._tokenizedLines[i];
      const prevLineAnalysis = this._lineAnalysis[i];
      maxLine = Math.max(maxLine, line.length);

      const lineChanged = bracketsChanged || this._lines[i] !== line;
      const reuseLineAnalysis = !lineChanged && prevLineAnalysis !== undefined;

      const lineAnalysis = reuseLineAnalysis
        ? prevLineAnalysis
        : getLineAnalysis(line, i, this._brackets);

      const reuseTokens =
        !lineChanged &&
        prevLineAnalysis?.equals(lineAnalysis) &&
        prevTokens !== undefined;

      const tokens = reuseTokens
        ? prevTokens
        : this._tokenizeLine(line, lineAnalysis, colors);

      newTokenizedLines[i] = tokens;
      newLineAnalysis[i] = lineAnalysis;
    }

    this.maxLine = maxLine;
    this.linesCount = height;

    this._lines = newLines;
    this._lineAnalysis = newLineAnalysis;
    this._tokenizedLines = newTokenizedLines;
  }

  recolor(colors: ThemeColors, changedKey?: string): void {
    const updateAll = changedKey === undefined;

    for (const line of this._tokenizedLines) {
      for (const token of line) {
        // Skip tokens unaffected by the changed key
        if (!updateAll && token.type !== changedKey) {
          continue;
        }

        token.updateColor(colors);
      }
    }
  }

  private _syncBrackets(newLines: string[]): boolean {
    const oldLines = this._lines;
    const newHeight = newLines.length;
    const oldHeight = oldLines.length;
    const minHeight = Math.min(newHeight, oldHeight);
    const maxHeight = Math.max(newHeight, oldHeight);

    let yStart = Infinity;
    let yEnd = -Infinity;

    const updateRange = (yIdx: number) => {
      yStart = Math.min(yStart, yIdx);
      yEnd = Math.max(yEnd, yIdx);
    };

    const lineHasBrackets = (lineIdx: number) =>
      lineHasBracketChars(newLines[lineIdx] ?? oldLines[lineIdx]);

    // Find range
    for (let i = 0; i < minHeight; i++) {
      const newLine = newLines[i];
      const oldLine = oldLines[i];
      if (newLine === oldLine) {
        continue;
      }

      const newLineWidth = newLine.length;
      const oldLineWidth = oldLine.length;
      const sharedWidth = Math.min(newLineWidth, oldLineWidth);
      let hit = false;

      for (let j = 0; j < sharedWidth && !hit; j++) {
        const oldChar = oldLine[j];
        const newChar = newLine[j];
        hit =
          oldChar !== newChar &&
          (ML_BRACKET_CHARS.has(oldChar) || ML_BRACKET_CHARS.has(newChar));
      }

      if (!hit) {
        const longestLine = newLineWidth > oldLineWidth ? newLine : oldLine;

        for (let j = sharedWidth; j < longestLine.length && !hit; j++) {
          hit = ML_BRACKET_CHARS.has(longestLine[j]);
        }
      }

      if (hit) {
        updateRange(i);
      }
    }

    if (newHeight !== oldHeight) {
      for (let i = minHeight; i < maxHeight; i++) {
        if (lineHasBrackets(i)) {
          updateRange(i);
        }
      }
    }

    if (yStart === Infinity) {
      return false;
    }

    // Expand yStart from cached brackets
    const prevStart = yStart;
    for (const bracket of this._rawBrackets) {
      const y1 = bracket.y1;
      if (y1 <= yEnd && bracket.y2 >= prevStart) {
        yStart = Math.min(yStart, y1);
      }
    }

    // Expand yStart upward
    let i = yStart - 1;
    while (i >= 0 && lineHasBrackets(i)) {
      yStart = i;
      i--;
    }

    const lineDelta = newHeight - oldHeight;
    const safeRawBrackets: RawBracket[] = [];

    // Partition cached raw brackets
    for (const bracket of this._rawBrackets) {
      const y1 = bracket.y1;
      const y2 = bracket.y2;
      if (y2 >= yStart && y1 <= yEnd) {
        continue;
      }

      const dy = lineDelta !== 0 && y1 > yEnd ? lineDelta : 0;
      safeRawBrackets.push({
        x1: bracket.x1,
        y1: y1 + dy,
        x2: bracket.x2,
        y2: y2 + dy,
      });
    }

    const newRawBrackets = detectBrackets(newLines, yStart, yEnd);
    const allRawBrackets = [...safeRawBrackets, ...newRawBrackets];

    this._rawBrackets = structuredClone(allRawBrackets);
    this._brackets = buildBracketsWithDepth(allRawBrackets as Bracket[]);
    return true;
  }

  private _tokenizeLine(
    line: string,
    lineAnalysis: LineAnalysis,
    colors: ThemeColors,
  ): Token[] {
    let i = 0;
    let inlineDepth = 0;
    const inlineBrackets: string[] = [];
    const lineWidth = line.length;
    const tokens = new TokenResult();

    // Little helpers
    const addSlice = (j: number, type: TokenType) => {
      tokens.add(line.slice(i, j), type, null, colors);
      i = j;
    };
    const consume = (predicate: (char: string) => boolean, type: TokenType) => {
      const j = _consumeLine(line, i, lineWidth, predicate);
      addSlice(j, type);
    };

    while (i < lineWidth) {
      const char = line[i];
      const baseDepth = lineAnalysis.bracketNestingDepths[i];
      const boundaryDepth = lineAnalysis.bracketArmDepths[i];

      if (boundaryDepth !== undefined) {
        // Multiline bracket char
        tokens.add(char, TOKENS.BRACKET, boundaryDepth, colors);
        i++;
      } else if (BRACKET_SETS.inlineOpen.has(char)) {
        // Inline opening bracket
        const currentDepth = baseDepth + inlineDepth++;
        tokens.add(char, TOKENS.BRACKET, currentDepth, colors);
        inlineBrackets.push(char);
        i++;
      } else if (BRACKET_SETS.inlineClose.has(char)) {
        // Inline closing bracket
        inlineDepth = Math.max(0, inlineDepth - 1);
        const currentDepth = baseDepth + inlineDepth;

        const expected = INLINE_BRACKETS[char as keyof typeof INLINE_BRACKETS];
        const actual = inlineBrackets.pop();
        const tokenType = actual === expected ? TOKENS.BRACKET : TOKENS.UNKNOWN;

        tokens.add(char, tokenType, currentDepth, colors);
        i++;
      } else if (isSpace(char)) {
        consume(isSpace, TOKENS.BACKGROUND);
      } else if (isOperator(char)) {
        consume(isOperator, TOKENS.OPERATOR);
      } else if (isIdentifierStart(char)) {
        const j = _consumeLine(line, i, lineWidth, isIdentifierPart);
        const k = _consumeLine(line, j, lineWidth, isSpace);
        const isFunction = k < lineWidth && isFunctionStart(line[k]);
        addSlice(j, isFunction ? TOKENS.FUNCTION : TOKENS.VARIABLE);
      } else if (isCommentStart(char)) {
        consume(isCommentPart, TOKENS.COMMENT);
      } else if (isSemicolon(char)) {
        consume(isSemicolon, TOKENS.SEMICOLON);
      } else if (isNumberStart(char, line[i - 1], line[i + 1])) {
        let j = i;
        let dotSeen = false;

        while (j < lineWidth) {
          const current = line[j];
          if (isDot(current) && !dotSeen) {
            dotSeen = true;
          } else if (!isDigit(current)) {
            break;
          }

          j++;
        }

        addSlice(j, isDot(line[j - 1]) ? TOKENS.UNKNOWN : TOKENS.NUMBER);
      } else {
        tokens.add(char, TOKENS.UNKNOWN, null, colors);
        i++;
      }
    }

    return tokens.list;
  }
}
