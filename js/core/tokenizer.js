import {
    BRACKET_SETS,
    calculateNestingDepth
} from "./brackets.js";
import {
    SORTED_OPS
} from "./operators.js";
import {
    isCommentPart,
    isDigit,
    isIdentifierPart,
    isIdentifierStart,
    isNumeric,
    isSpace,
} from './predicates.js';
import {
    TOKENS,
    TokenResult,
} from "./tokens.js";

function _consumeLine(line, i, maxIndex, predicate) {
    let j = i;
    while (j < maxIndex && predicate(line[j])) {
        j++;
    }

    return j;
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
        const foundBrackets = calculateNestingDepth(lines);
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
        let i = 0;
        let inlineDepth = 0;
        const lineWidth = line.length;
        const tokens = new TokenResult();

        const addTokens = (predicate, tokenType) => {
            const k = _consumeLine(line, i, lineWidth, predicate);
            tokens.add(line.slice(i, k), tokenType);
            i = k;
        }

        while (i < lineWidth) {
            const char = line[i];

            const boundaryDepth = lineAnalysis.boundaryDepths[i];
            if (boundaryDepth !== undefined) {
                tokens.addBracket(char, boundaryDepth);
                i++;
                continue;
            }

            const baseDepth = lineAnalysis.containmentDepths[i];

            // Comments
            if (char === '#') {
                addTokens(isCommentPart, TOKENS.COMMENT)
                continue;
            }

            // Inline Brackets

            if (BRACKET_SETS.inlineOpen.has(char)) {
                tokens.addBracket(char, baseDepth + inlineDepth++);
                i++;
                continue;
            }

            if (BRACKET_SETS.inlineClose.has(char)) {
                inlineDepth = Math.max(0, inlineDepth - 1);
                tokens.addBracket(char, baseDepth + inlineDepth);
                i++;
                continue;
            }

            // Identifiers
            if (isIdentifierStart(char)) {
                const j = _consumeLine(line, i, lineWidth, isIdentifierPart);
                const k = _consumeLine(line, j, lineWidth, isSpace);
                const isFunction = k < lineWidth && line[k] === '(';

                tokens.add(line.slice(i, j), isFunction ? TOKENS.FUNCTION : TOKENS.VARIABLE);
                i = j;
                continue;
            }

            // Static Tokens

            if (isSpace(char)) {
                addTokens(isSpace, TOKENS.WHITE_SPACE)
                continue;
            }

            if (isDigit(char)) {
                addTokens(isNumeric, TOKENS.NUMBER)
                continue;
            }

            if (char === ';') {
                tokens.add(char, TOKENS.SEMICOLON);
                i++;
                continue;
            }

            // Operators
            const operator = SORTED_OPS.find(op => line.startsWith(op, i));
            if (operator) {
                tokens.add(operator, TOKENS.OPERATOR);
                i += operator.length;
                continue;
            }

            tokens.add(char, TOKENS.UNKNOWN);
            i++;
        }

        return tokens.list;
    }
}