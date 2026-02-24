import {
    resolveBracketColor,
    resolveTokenColor
} from "../common/color_utils.js";
import {
    config
} from "../common/config.js";
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

class BracketAnalyzer {
    constructor(lines) {
        this.lines = lines;
        this.height = lines.length;
        this.foundBrackets = this._mapMultilineBrackets();
        this._calculateNestingDepth();
    }

    _mapMultilineBrackets() {
        const brackets = [];

        for (let y = 0; y < this.height; y++) {
            const line = this.lines[y];
            const lineWidth = line.length;

            for (let x = 0; x < lineWidth; x++) {
                const char = line[x];

                for (const bracket of MULTILINE_BRACKETS) {
                    if (char !== bracket.left.top) {
                        continue;
                    }

                    const yEnd = this._findLeftArmEnd(x, y + 1, bracket.left);
                    if (yEnd === -1) {
                        continue;
                    }

                    const xEnd = this._findRightArmMatch(x + 1, y, yEnd, bracket.right);
                    if (xEnd === -1) {
                        continue;
                    }

                    brackets.push({
                        x1: x,
                        y1: y,
                        x2: xEnd,
                        y2: yEnd
                    });
                }
            }
        }

        return brackets;
    }

    _findLeftArmEnd(x, yStart, leftBracket) {
        if (yStart < this.height && this.lines[yStart][x] === leftBracket.bottom) {
            return yStart;
        }

        let currentY = yStart;
        while (currentY < this.height && this.lines[currentY][x] === leftBracket.mid) {
            currentY++;
        }

        return (currentY < this.height && this.lines[currentY][x] === leftBracket.bottom) ? currentY : -1;
    }

    _findRightArmMatch(xStart, yTop, yBottom, rightBracket) {
        const topRow = this.lines[yTop];
        const bottomRow = this.lines[yBottom];
        const topRowWidth = topRow.length;

        for (let x = xStart; x < topRowWidth; x++) {
            if (topRow[x] === rightBracket.top && bottomRow[x] === rightBracket.bottom) {
                return x;
            }
        }

        return -1;
    }

    _calculateNestingDepth() {
        this.foundBrackets.forEach(bracket => {
            bracket.depth = this.foundBrackets.reduce((acc, other) => {
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
    }

    getBoundaryDepth(y, x) {
        const bracket = this.foundBrackets.find(bracket =>
            (x === bracket.x1 || x === bracket.x2) &&
            y >= bracket.y1 &&
            y <= bracket.y2
        );

        return bracket?.depth;
    }

    getContainmentDepth(y, x) {
        return this.foundBrackets.reduce((acc, bracket) => {
            const isContained = (
                x > bracket.x1 &&
                x < bracket.x2 &&
                y >= bracket.y1 &&
                y <= bracket.y2
            );

            return isContained ? acc + 1 : acc;
        }, 0);
    }
}

class TokenResult {
    constructor() {
        this.list = [];
        this.colors = config.colors;
    }

    add(value, type) {
        this.list.push({
            value,
            color: resolveTokenColor(this.colors, type)
        });
    }

    addBracket(char, depth) {
        this.list.push({
            value: char,
            color: resolveBracketColor(this.colors, depth)
        });
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

export function tokenize(text) {
    const lines = text.split('\n');
    const analyzer = new BracketAnalyzer(lines);
    const result = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineWidth = line.length;

        let j = 0;
        let inlineDepth = 0;
        const tokens = new TokenResult();

        while (j < lineWidth) {
            const char = line[j];

            // Multiline Brackets
            const boundaryDepth = analyzer.getBoundaryDepth(i, j);
            if (boundaryDepth !== undefined) {
                tokens.addBracket(char, boundaryDepth);
                j++;
                continue;
            }

            const baseDepth = analyzer.getContainmentDepth(i, j);

            // Comments
            if (char === '#') {
                tokens.add(line.slice(j), TOKENS.COMMENT);
                break;
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

        result.push(tokens.list);
    }

    return result;
}