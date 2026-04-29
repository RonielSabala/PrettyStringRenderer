export interface BracketArm {
  top: string;
  mid: string;
  bottom: string;
}

export interface MultilineBracketShape {
  left: BracketArm;
  right: BracketArm;
}

export const INLINE_BRACKETS = Object.freeze({
  ")": "(",
  "]": "[",
  "}": "{",
} as const);

export const MULTILINE_BRACKETS: ReadonlyArray<MultilineBracketShape> =
  Object.freeze([
    {
      // Round brackets
      left: { top: "/", mid: "▏", bottom: "\\" },
      right: { top: "\\", mid: "▕", bottom: "/" },
    },
    {
      // Square brackets
      left: { top: "┌", mid: "│", bottom: "└" },
      right: { top: "┐", mid: "│", bottom: "┘" },
    },
  ]);

function buildInlineBracketSets() {
  return Object.freeze({
    inlineOpen: new Set(Object.values(INLINE_BRACKETS)),
    inlineClose: new Set(Object.keys(INLINE_BRACKETS)),
    multilineOpen: new Set(
      MULTILINE_BRACKETS.flatMap(({ left, right }) => [left.top, right.top]),
    ),
  });
}

function buildMultilineBracketChars(): Set<string> {
  return new Set(
    MULTILINE_BRACKETS.flatMap(({ left, right }) => [
      ...Object.values(left),
      ...Object.values(right),
    ]),
  );
}

export const BRACKET_SETS = buildInlineBracketSets();
export const ML_BRACKET_CHARS = buildMultilineBracketChars();
export const ML_BRACKETS_COUNT = MULTILINE_BRACKETS.length;
