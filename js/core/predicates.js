import {
    BRACKET_SETS
} from './brackets.js';
import {
    OPERATORS_SET
} from './operators.js';

export const isSpace = (char) => char === ' ' || char === '\t';

export const isDigit = (char) => /[0-9]/.test(char);

export const isNumeric = (char) => /[0-9.]/.test(char);

export const isOperator = (char) => OPERATORS_SET.has(char);

export const isIdentifierStart = (char) => /[a-zA-Z_]/.test(char);

export const isIdentifierPart = (char) => /[a-zA-Z0-9_]/.test(char);

export const isFunctionStart = (char) => char === '(';

export const isCommentStart = (char) => char === '#';

export const isCommentPart = (char) => !BRACKET_SETS.multilineAll.has(char);

export const isSemicolon = (char) => char === ';';