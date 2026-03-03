import {
    LINE_BREAK
} from '../common/config.js';
import {
    BRACKET_SETS,
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
    TokenResult,
} from './tokens.js';

function _consumeLine(line, i, maxIndex, predicate) {
    let j = i;
    while (j < maxIndex && predicate(line[j])) {
        j++;
    }

    return j;
}

export class IncrementalTokenizer {
    constructor() {
        this.lines = [];
        this.lineAnalysis = [];
        this.tokenizedLines = [];
    }

    tokenize(text) {
        const newLines = text.split(LINE_BREAK);
        const newLineAnalysis = [];
        const newTokenizedLines = [];

        const height = newLines.length;
        const foundBrackets = findBracketsWithDepth(newLines);

        for (let i = 0; i < height; i++) {
            const line = newLines[i];
            let lineAnalysis = getLineAnalysis(line, i, foundBrackets);
            let tokens = [];

            // Only re-tokenize if the text or the bracket depth context changed
            if (this.lines[i] === line && this.lineAnalysis[i]?.equals(lineAnalysis)) {
                tokens = this.tokenizedLines[i];
            } else {
                tokens = this._tokenizeLine(line, lineAnalysis);
            }

            newTokenizedLines.push(tokens);
            newLineAnalysis.push(lineAnalysis);
        }

        this.lines = newLines;
        this.lineAnalysis = newLineAnalysis;
        this.tokenizedLines = newTokenizedLines;
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