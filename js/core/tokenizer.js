import {
    resolveBracketColor,
    resolveTokenColor
} from "../common/color_utils.js";
import {
    BRACKET_SETS,
    MULTILINE_BRACKETS
} from "./brackets.js";
import {
    SORTED_OPS
} from "./operators.js";
import {
    TOKENS
} from "./tokens.js";

// Character predicates
const isDigit = (char) => /[0-9]/.test(char);
const isNumeric = (char) => /[0-9.]/.test(char);
const isIdentifierStart = (char) => /[a-zA-Z_]/.test(char);
const isIdentifierPart = (char) => /[a-zA-Z0-9_]/.test(char);
const isSpace = (char) => char === ' ' || char === '\t';

class BracketAnalysis {
    static _match(lines, x, y, char) {
        return y < lines.length && lines[y][x] === char;
    }

    static _mapMultilineBrackets(lines) {
        const brackets = [];
        const stacks = new Map();
        const height = lines.length;

        for (let y = 0; y < height; y++) {
            const line = lines[y];
            const lineWidth = line.length;

            for (let x = 0; x < lineWidth; x++) {
                const char = line[x];

                for (let bracketIdx = 0; bracketIdx < MULTILINE_BRACKETS.length; bracketIdx++) {
                    const bracket = MULTILINE_BRACKETS[bracketIdx];
                    const isLeft = char === bracket.left.top;
                    const isRight = char === bracket.right.top;

                    if (!isLeft && !isRight) {
                        continue;
                    }

                    let yEnd = y + 1;
                    const part = isLeft ? bracket.left : bracket.right;
                    while (this._match(lines, x, yEnd, part.mid)) {
                        yEnd++;
                    }

                    if (!this._match(lines, x, yEnd, part.bottom)) {
                        continue;
                    }

                    const key = `${y}-${yEnd}-${bracketIdx}`;
                    if (isLeft) {
                        if (!stacks.has(key)) {
                            stacks.set(key, []);
                        }

                        stacks.get(key).push(x);
                        continue;
                    }

                    const stack = stacks.get(key);
                    if (!stack || stack.length === 0) {
                        continue;
                    }

                    brackets.push({
                        x1: stack.pop(),
                        y1: y,
                        x2: x,
                        y2: yEnd
                    });
                }
            }
        }

        return brackets;
    }

    static calculateNestingDepth(lines) {
        const foundBrackets = this._mapMultilineBrackets(lines);
        foundBrackets.forEach(bracket => {
            bracket.depth = foundBrackets.reduce((acc, other) => {
                const isInside = (
                    other !== bracket &&
                    bracket.x1 > other.x1 &&
                    bracket.x2 < other.x2 &&
                    bracket.y1 >= other.y1 &&
                    bracket.y2 <= other.y2
                );

                return isInside ? acc + 1 : acc;
            }, 0);
        });

        return foundBrackets;
    }
}

class LineAnalysis {
    constructor(lineWidth) {
        this.boundaryDepths = new Array(lineWidth).fill(undefined);
        this.containmentDepths = new Int32Array(lineWidth).fill(0);
    }

    equals(other) {
        if (!other || this.boundaryDepths.length !== other.boundaryDepths.length) {
            return false;
        }

        const otherBoundary = other.boundaryDepths;
        const otherContainment = other.containmentDepths;
        return (
            this.boundaryDepths.every((item, i) => item === otherBoundary[i]) &&
            this.containmentDepths.every((item, i) => item === otherContainment[i])
        );
    }

    static generateAnalysisMap(lines) {
        const foundBrackets = BracketAnalysis.calculateNestingDepth(lines);
        const foundBracketsCount = foundBrackets.length;

        return lines.map((line, y) => {
            const lineWidth = line.length;
            const lineAnalysis = new LineAnalysis(lineWidth);

            for (let i = 0; i < foundBracketsCount; i++) {
                const bracket = foundBrackets[i];
                const depth = bracket.depth;
                const x1 = bracket.x1;
                const x2 = bracket.x2;

                if (y < bracket.y1 || y > bracket.y2) {
                    continue;
                }
                if (x1 < lineWidth) {
                    lineAnalysis.boundaryDepths[x1] = depth;
                }
                if (x2 < lineWidth) {
                    lineAnalysis.boundaryDepths[x2] = depth;
                }

                // Mark chars between the left and right arms
                const xStart = x1 + 1;
                const xEnd = Math.min(lineWidth, x2);
                for (let x = xStart; x < xEnd; x++) {
                    lineAnalysis.containmentDepths[x]++;
                }
            }

            return lineAnalysis;
        });
    }
}

class Token {
    #type;
    #bracketDepth = null;

    constructor(string, type, bracketDepth = null) {
        this.value = string;
        this.#type = type;
        this.#bracketDepth = bracketDepth;
    }

    getColor() {
        return this.#type === null ? resolveBracketColor(this.#bracketDepth) : resolveTokenColor(this.#type);
    }
}

class TokenResult {
    constructor() {
        this.list = [];
    }

    add(string, type) {
        this.list.push(new Token(string, type));
    }

    addBracket(char, depth) {
        this.list.push(new Token(char, null, depth));
    }

    consume(line, start, predicate, type) {
        let end = start;
        const lineWidth = line.length;
        while (end < lineWidth && predicate(line[end])) {
            end++;
        }

        this.add(line.slice(start, end), type);
        return end;
    }
}


export class IncrementalTokenizer {
    constructor() {
        this.lines = [];
        this.lineAnalysis = [];
        this.tokenizedLines = [];
    }

    update(text) {
        const result = [];
        const newLines = text.split('\n');
        const newLineAnalysis = LineAnalysis.generateAnalysisMap(newLines);

        const height = newLines.length;
        for (let y = 0; y < height; y++) {
            const line = newLines[y];
            const lineAnalysis = newLineAnalysis[y];

            // Only re-tokenize if the text or the bracket depth context changed
            if (this.lines[y] === line && this.lineAnalysis[y]?.equals(lineAnalysis)) {
                result.push(this.tokenizedLines[y]);
                continue;
            }

            const tokens = this._tokenizeLine(line, lineAnalysis);

            // Update caches
            this.tokenizedLines[y] = tokens;
            this.lineAnalysis[y] = lineAnalysis;

            result.push(tokens);
        }

        this.lines = newLines;
        return result;
    }

    _tokenizeLine(line, lineAnalysis) {
        let j = 0;
        let inlineDepth = 0;
        const tokens = new TokenResult();

        const lineWidth = line.length;
        while (j < lineWidth) {
            const char = line[j];

            const boundaryDepth = lineAnalysis.boundaryDepths[j];
            if (boundaryDepth !== undefined) {
                tokens.addBracket(char, boundaryDepth);
                j++;
                continue;
            }

            const baseDepth = lineAnalysis.containmentDepths[j];

            // Comments
            if (char === '#') {
                let end = j + 1;
                while (end < line.length && !BRACKET_SETS.multilineAll.has(line[end])) {
                    end++;
                }

                tokens.add(line.slice(j, end), TOKENS.COMMENT);
                j = end;
                continue;
            }

            // Inline Brackets

            if (BRACKET_SETS.inlineOpen.has(char)) {
                tokens.addBracket(char, baseDepth + inlineDepth++);
                j++;
                continue;
            }

            if (BRACKET_SETS.inlineClose.has(char)) {
                inlineDepth = Math.max(0, inlineDepth - 1);
                tokens.addBracket(char, baseDepth + inlineDepth);
                j++;
                continue;
            }

            // Identifiers
            if (isIdentifierStart(char)) {
                let pivot1 = j;
                while (pivot1 < line.length && isIdentifierPart(line[pivot1])) {
                    pivot1++;
                }

                const word = line.slice(j, pivot1);

                // Look ahead for function call
                let pivot2 = pivot1;
                while (pivot2 < line.length && isSpace(line[pivot2])) {
                    pivot2++;
                }

                const isFunction = pivot2 < line.length && line[pivot2] === '(';
                tokens.add(word, isFunction ? TOKENS.FUNCTION : TOKENS.VARIABLE);

                j = pivot1;
                continue;
            }

            // Static Tokens

            if (isSpace(char)) {
                j = tokens.consume(line, j, isSpace, TOKENS.WHITE_SPACE);
                continue;
            }

            if (isDigit(char)) {
                j = tokens.consume(line, j, isNumeric, TOKENS.NUMBER);
                continue;
            }

            if (char === ';') {
                tokens.add(char, TOKENS.SEMICOLON);
                j++;
                continue;
            }

            // Operators
            const operator = SORTED_OPS.find(op => line.startsWith(op, j));
            if (operator) {
                tokens.add(operator, TOKENS.OPERATOR);
                j += operator.length;
                continue;
            }

            tokens.add(char, TOKENS.UNKNOWN);
            j++;
        }

        return tokens.list;
    }
}