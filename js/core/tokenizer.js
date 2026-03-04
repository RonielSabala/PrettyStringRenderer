import {
    LINE_BREAK
} from '../common/config.js';
import {
    BRACKET_SETS,
    ML_BRACKET_CHARS
} from './brackets/data.js';
import {
    findBracketsWithDepth
} from './brackets/detector.js';
import {
    getLineAnalysis
} from './brackets/line_analysis.js';
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
    TokenResult
} from './tokens.js';

function _lineHasBracketChars(line) {
    for (let i = 0; i < line.length; i++) {
        if (ML_BRACKET_CHARS.has(line[i])) {
            return true;
        }
    }

    return false;
}

function _consumeLine(line, i, maxIndex, predicate) {
    let j = i;
    while (j < maxIndex && predicate(line[j])) j++;
    return j;
}

export class IncrementalTokenizer {
    constructor() {
        this._lines = [];
        this._lineAnalysis = [];
        this._tokenizedLines = [];
        this._brackets = [];
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
        const newLinesCount = newLines.length;
        const oldLinesCount = oldLines.length;
        const sharedHeight = Math.min(newLinesCount, oldLinesCount);
        let changed = false;

        for (let i = 0; i < sharedHeight && !changed; i++) {
            const newLine = newLines[i];
            const oldLine = oldLines[i];
            if (newLine === oldLine) {
                continue;
            }

            const newLineWidth = newLine.length;
            const oldLineWidth = oldLine.length;
            const sharedWidth = Math.min(newLineWidth, oldLineWidth);

            // A bracket char must have appeared or disappeared
            for (let j = 0; j < sharedWidth && !changed; j++) {
                const oldChar = oldLine[j];
                const newChar = newLine[j];
                if (oldChar === newChar) {
                    continue;
                }

                changed = ML_BRACKET_CHARS.has(oldChar) || ML_BRACKET_CHARS.has(newChar);
            }

            if (changed) {
                continue;
            }

            const maxWidth = Math.max(newLineWidth, oldLineWidth);
            const longer = newLineWidth > oldLineWidth ? newLine : oldLine;

            // Check the tail of the longest line
            for (let j = sharedWidth; j < maxWidth && !changed; j++) {
                changed = ML_BRACKET_CHARS.has(longer[j]);
            }
        }

        // Check added or removed lines at the tail
        if (!changed && newLinesCount !== oldLinesCount) {
            const low = sharedHeight;
            const high = Math.max(newLinesCount, oldLinesCount);

            for (let i = low; i < high && !changed; i++) {
                changed = _lineHasBracketChars(newLines[i] ?? oldLines[i]);
            }
        }

        if (!changed) {
            return false;
        }

        this._brackets = findBracketsWithDepth(newLines);
        return true;
    }

    _tokenizeLine(line, lineAnalysis) {
        let i = 0;
        let inlineDepth = 0;
        const lineWidth = line.length;
        const tokens = new TokenResult();

        const consume = (predicate, tokenType) => {
            const j = _consumeLine(line, i, lineWidth, predicate);
            tokens.add(line.slice(i, j), tokenType);
            i = j;
        };

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
                consume(isCommentPart, TOKENS.COMMENT);

            } else if (isSpace(char)) {
                consume(isSpace, TOKENS.WHITE_SPACE);

            } else if (isDigit(char)) {
                consume(isNumeric, TOKENS.NUMBER);

            } else if (isOperator(char)) {
                consume(isOperator, TOKENS.OPERATOR);

            } else if (isSemicolon(char)) {
                consume(isSemicolon, TOKENS.SEMICOLON);

            } else {
                tokens.add(char, TOKENS.UNKNOWN);
                i++;
            }
        }

        return tokens.list;
    }
}