import {
    ML_BRACKET_CHARS
} from './brackets/data.js';
import {
    OPERATORS_SET
} from './operators.js';

export const isSpace = (char) => char === ' ' || char === '\t';

export const isDot = (char) => char === '.';

export const isDigit = (char) => /[0-9]/.test(char);

export const isNumberStart = (prevChar, char, nextChar) => {
    if (isDigit(char)) {
        return true;
    }

    return isDot(char) && (prevChar === undefined || isSpace(prevChar)) && isDigit(nextChar);
};

export const isOperator = (char) => OPERATORS_SET.has(char);

export const isIdentifierStart = (char) => /[a-zA-Z_]/.test(char);

export const isIdentifierPart = (char) => /[a-zA-Z0-9_]/.test(char);

export const isFunctionStart = (char) => char === '(';

export const isCommentStart = (char) => char === '#';

export const isCommentPart = (char) => !ML_BRACKET_CHARS.has(char);

export const isSemicolon = (char) => char === ';';