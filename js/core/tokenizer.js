import {
    LINE_BREAK
} from '../common/config.js';
import {
    BRACKET_SETS,
    ML_BRACKET_CHARS
} from './brackets/data.js';
import {
    buildBracketsWithDepth,
    detectBrackets
} from './brackets/detector.js';
import {
    getLineAnalysis,
    lineHasBracketChars
} from './brackets/line_analysis.js';
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
    isSpace
} from './predicates.js';
import {
    TOKENS,
    TokenResult
} from './tokens.js';

function _consumeLine(line, start, end, predicate) {
    let i = start;
    while (i < end && predicate(line[i])) {
        i++;
    }

    return i;
}

export class IncrementalTokenizer {
    constructor() {
        this._brackets = [];
        this._rawBrackets = [];

        this._lines = [];
        this._lineAnalysis = [];
        this._tokenizedLines = [];
    }

    get tokenizedLines() {
        return this._tokenizedLines;
    }

    tokenize(text) {
        const newLines = text.split(LINE_BREAK);
        const height = newLines.length;

        const newLineAnalysis = new Array(height);
        const newTokenizedLines = new Array(height);
        const bracketsChanged = this._syncBrackets(newLines);

        for (let i = 0; i < height; i++) {
            const line = newLines[i];
            const prevTokens = this._tokenizedLines[i];
            const prevLineAnalysis = this._lineAnalysis[i];

            const lineChanged = bracketsChanged || this._lines[i] !== line;

            const reuseLineAnalysis = !lineChanged && prevLineAnalysis !== undefined;
            const lineAnalysis = reuseLineAnalysis ? prevLineAnalysis : getLineAnalysis(line, i, this._brackets);

            const reuseTokens = !lineChanged && prevLineAnalysis?.equals(lineAnalysis) && prevTokens !== undefined;
            const tokens = reuseTokens ? prevTokens : this._tokenizeLine(line, lineAnalysis);

            newTokenizedLines[i] = tokens;
            newLineAnalysis[i] = lineAnalysis;
        }

        this._lines = newLines;
        this._lineAnalysis = newLineAnalysis;
        this._tokenizedLines = newTokenizedLines;
    }

    _syncBrackets(newLines) {
        const oldLines = this._lines;
        const newHeight = newLines.length;
        const oldHeight = oldLines.length;
        const minHeight = Math.min(newHeight, oldHeight);
        const maxHeight = Math.max(newHeight, oldHeight);

        let yStart = Infinity;
        let yEnd = -Infinity;

        const updateRange = (yIdx) => {
            yStart = Math.min(yStart, yIdx);
            yEnd = Math.max(yEnd, yIdx);
        };

        const lineHasBrackets = (lineIdx) => {
            return lineHasBracketChars(newLines[lineIdx] ?? oldLines[lineIdx]);
        }

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
                hit = oldChar !== newChar && (ML_BRACKET_CHARS.has(oldChar) || ML_BRACKET_CHARS.has(newChar));
            }

            if (!hit) {
                const maxWidth = Math.max(newLineWidth, oldLineWidth);
                const longestLine = newLineWidth > oldLineWidth ? newLine : oldLine;

                for (let j = sharedWidth; j < maxWidth && !hit; j++) {
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
            if (y1 > yEnd || bracket.y2 < prevStart) {
                continue;
            }

            yStart = Math.min(yStart, y1);
        }

        // Expand yStart upward
        let i = yStart - 1;
        while (i >= 0 && lineHasBrackets(i)) {
            yStart = i;
            i--;
        }

        const safeBrackets = [];
        const lineDelta = newHeight - oldHeight;

        // Partition cached raw brackets
        for (const bracket of this._rawBrackets) {
            let y1 = bracket.y1;
            let y2 = bracket.y2;
            if (y2 >= yStart && y1 <= yEnd) {
                continue;
            }

            const dy = lineDelta !== 0 && y1 > yEnd ? lineDelta : 0;
            safeBrackets.push({
                x1: bracket.x1,
                y1: y1 + dy,
                x2: bracket.x2,
                y2: y2 + dy,
            });
        }

        const newBrackets = detectBrackets(newLines, yStart, yEnd);
        const allBrackets = [...safeBrackets, ...newBrackets];

        this._rawBrackets = structuredClone(allBrackets);
        this._brackets = buildBracketsWithDepth(allBrackets);

        return true;
    }

    _tokenizeLine(line, lineAnalysis) {
        let i = 0;
        let inlineDepth = 0;
        const lineWidth = line.length;
        const tokens = new TokenResult();

        const addSlice = (j, tokenType) => {
            tokens.add(line.slice(i, j), tokenType);
            i = j;
        }
        const consume = (predicate, tokenType) => {
            const j = _consumeLine(line, i, lineWidth, predicate);
            addSlice(j, tokenType);
        };

        while (i < lineWidth) {
            const char = line[i];
            const baseDepth = lineAnalysis.bracketNestingDepths[i];
            const boundaryDepth = lineAnalysis.bracketArmDepths[i];

            if (boundaryDepth !== undefined) {
                tokens.add(char, TOKENS.BRACKET, boundaryDepth);
                i++;

            } else if (BRACKET_SETS.inlineOpen.has(char)) {
                tokens.add(char, TOKENS.BRACKET, baseDepth + inlineDepth++);
                i++;

            } else if (BRACKET_SETS.inlineClose.has(char)) {
                inlineDepth = Math.max(0, inlineDepth - 1);
                tokens.add(char, TOKENS.BRACKET, baseDepth + inlineDepth);
                i++;

            } else if (isSpace(char)) {
                consume(isSpace, TOKENS.WHITE_SPACE);

            } else if (isOperator(char)) {
                consume(isOperator, TOKENS.OPERATOR);

            } else if (isIdentifierStart(char)) {
                const j = _consumeLine(line, i, lineWidth, isIdentifierPart);
                const k = _consumeLine(line, j, lineWidth, isSpace);
                const isFunction = k < lineWidth && isFunctionStart(line[k]);
                addSlice(j, isFunction ? TOKENS.FUNCTION : TOKENS.VARIABLE)

            } else if (isCommentStart(char)) {
                consume(isCommentPart, TOKENS.COMMENT);

            } else if (isSemicolon(char)) {
                consume(isSemicolon, TOKENS.SEMICOLON);

            } else if (isNumberStart(line[i - 1], char, line[i + 1])) {
                let j = i;
                let dotPresent = false;

                while (j < lineWidth) {
                    const current = line[j];
                    if (isDot(current) && !dotPresent) {
                        dotPresent = true;
                    } else if (!isDigit(current)) {
                        break;
                    }

                    j++;

                }

                addSlice(j, TOKENS.NUMBER)

            } else {
                tokens.add(char, TOKENS.UNKNOWN);
                i++;
            }
        }

        return tokens.list;
    }
}