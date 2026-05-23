import { ML_BRACKET_CHARS, type Bracket } from "./data";

export class LineAnalysis {
  bracketArmDepths: (number | undefined)[];
  bracketNestingDepths: Int32Array;

  constructor(lineWidth: number) {
    this.bracketArmDepths = new Array(lineWidth).fill(undefined);
    this.bracketNestingDepths = new Int32Array(lineWidth);
  }

  equals(other: LineAnalysis): boolean {
    if (this === other) {
      return true;
    }

    const boundaryA = this.bracketArmDepths;
    const boundaryB = other.bracketArmDepths;
    const len = boundaryA.length;

    if (len !== boundaryB.length) {
      return false;
    }

    const containmentA = this.bracketNestingDepths;
    const containmentB = other.bracketNestingDepths;

    for (let i = 0; i < len; i++) {
      if (
        boundaryA[i] !== boundaryB[i] ||
        containmentA[i] !== containmentB[i]
      ) {
        return false;
      }
    }

    return true;
  }

  isPairCompleteAtIndex(idx: number): boolean {
    if (this.bracketArmDepths[idx] === undefined) {
      return false;
    }

    const seen = new Set<number>();
    for (let i = idx; i < this.bracketArmDepths.length; i++) {
      const depth = this.bracketArmDepths[i];
      if (depth === undefined) {
        continue;
      }

      if (seen.has(depth)) {
        return true;
      }

      seen.add(depth);
    }

    return false;
  }
}

export function lineHasBracketChars(line: string): boolean {
  for (let i = 0; i < line.length; i++) {
    if (ML_BRACKET_CHARS.has(line[i])) {
      return true;
    }
  }

  return false;
}

export function getLineAnalysis(
  line: string,
  lineIdx: number,
  brackets: Bracket[],
): LineAnalysis {
  const lineWidth = line.length;
  const analysis = new LineAnalysis(lineWidth);

  if (!lineHasBracketChars(line)) {
    return analysis;
  }

  for (const bracket of brackets) {
    if (lineIdx < bracket.y1 || lineIdx > bracket.y2) {
      continue;
    }

    const { x1, x2, depth } = bracket;
    if (x1 < lineWidth) {
      analysis.bracketArmDepths[x1] = depth;
    }
    if (x2 < lineWidth) {
      analysis.bracketArmDepths[x2] = depth;
    }

    const xEnd = Math.min(lineWidth, x2);
    for (let x = x1 + 1; x < xEnd; x++) {
      analysis.bracketNestingDepths[x]++;
    }
  }

  return analysis;
}
