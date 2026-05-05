import { ML_BRACKET_CHARS } from "./brackets/data";
import { OPERATORS_SET } from "./operators";

export const isSpace = (char: string): boolean => char === " " || char === "\t";

export const isDot = (char: string): boolean => char === ".";

export const isDigit = (char: string): boolean => /[0-9]/.test(char);

export const isOperator = (char: string): boolean => OPERATORS_SET.has(char);

export const isIdentifierStart = (char: string): boolean =>
  /[a-zA-Z_]/.test(char);

export const isIdentifierPart = (char: string): boolean =>
  /[a-zA-Z0-9_]/.test(char);

export const isFunctionStart = (char: string): boolean => char === "(";

export const isCommentStart = (char: string): boolean => char === "#";

export const isCommentPart = (char: string): boolean =>
  !ML_BRACKET_CHARS.has(char);

export const isSemicolon = (char: string): boolean => char === ";";

export const isNumberStart = (
  char: string,
  prevChar: string | undefined,
  nextChar: string | undefined,
): boolean => {
  if (isDigit(char)) {
    return true;
  }

  return (
    isDot(char) &&
    (prevChar === undefined || isSpace(prevChar)) &&
    isDigit(nextChar ?? "")
  );
};
