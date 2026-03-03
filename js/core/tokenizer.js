import {
    LINE_BREAK
} from '../common/config.js';
import {
    BRACKET_SETS,
    findBracketsWithDepth
} from './brackets.js';
import {
    isCommentPart,
    isCommentStart,
    isDigit,
    isFunctionStart,
    isIdentifierPart,
    isIdentifierStart,
    isNumeric,
    isOperator,
    isSemicolon,
    isSpace
} from './predicates.js';
import {
    TOKENS,
    TokenResult,
} from './tokens.js';

function _consumeLine(line, i, maxIndex, predicate) {
    let j = i;
    while (j < maxIndex && predicate(line[j])) {
        j++;
    }

    return j;
}

class LineAnalysis {
    constructor(lineWidth) {
        this.bracketArmDepths = new Array(lineWidth).fill(undefined);
        this.bracketNestingDepths = new Int32Array(lineWidth).fill(0);
    }

    equals(other) {
        if (!other || this.bracketArmDepths.length !== other.bracketArmDepths.length) {
            return false;
        }

        const otherBoundary = other.bracketArmDepths;
        const otherContainment = other.bracketNestingDepths;
        return (
            this.bracketArmDepths.every((item, i) => item === otherBoundary[i]) &&
            this.bracketNestingDepths.every((item, i) => item === otherContainment[i])
        );
    }

    static generateAnalysisMap(lines) {
        const foundBrackets = findBracketsWithDepth(lines);
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
                    lineAnalysis.bracketArmDepths[x1] = depth;
                }
                if (x2 < lineWidth) {
                    lineAnalysis.bracketArmDepths[x2] = depth;
                }

                // Mark chars between the left and right arms
                const xStart = x1 + 1;
                const xEnd = Math.min(lineWidth, x2);
                for (let x = xStart; x < xEnd; x++) {
                    lineAnalysis.bracketNestingDepths[x]++;
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

    tokenize(text) {
        const result = [];
        const newLines = text.split(LINE_BREAK);
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
            const j = _consumeLine(line, i, lineWidth, predicate);
            tokens.add(line.slice(i, j), tokenType);
            i = j;
        }

        while (i < lineWidth) {
            const char = line[i];
            const baseDepth = lineAnalysis.bracketNestingDepths[i];
            const boundaryDepth = lineAnalysis.bracketArmDepths[i];

            if (boundaryDepth !== undefined) {
                tokens.addBracket(char, boundaryDepth);
                i++;

            } else if (BRACKET_SETS.inlineOpen.has(char)) {
                tokens.addBracket(char, baseDepth + inlineDepth++);
                i++;

            } else if (BRACKET_SETS.inlineClose.has(char)) {
                inlineDepth = Math.max(0, inlineDepth - 1);
                tokens.addBracket(char, baseDepth + inlineDepth);
                i++;

            } else if (isIdentifierStart(char)) {
                const j = _consumeLine(line, i, lineWidth, isIdentifierPart);
                const k = _consumeLine(line, j, lineWidth, isSpace);
                const isFunction = k < lineWidth && isFunctionStart(line[k]);

                tokens.add(line.slice(i, j), isFunction ? TOKENS.FUNCTION : TOKENS.VARIABLE);
                i = j;

            } else if (isCommentStart(char)) {
                addTokens(isCommentPart, TOKENS.COMMENT)

            } else if (isSpace(char)) {
                addTokens(isSpace, TOKENS.WHITE_SPACE)

            } else if (isDigit(char)) {
                addTokens(isNumeric, TOKENS.NUMBER)

            } else if (isOperator(char)) {
                addTokens(isOperator, TOKENS.OPERATOR)

            } else if (isSemicolon(char)) {
                addTokens(isSemicolon, TOKENS.SEMICOLON)

            } else {
                tokens.add(char, TOKENS.UNKNOWN);
                i++;
            }
        }

        return tokens.list;
    }
}