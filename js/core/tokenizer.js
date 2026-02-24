import {
    resolveBracketColor,
    resolveTokenColor
} from "../common/color_utils.js";
import {
    config
} from "../common/config.js";
import {
    BRACKET_SETS
} from "./brackets.js";
import {
    SORTED_OPS
} from "./operators.js";
import {
    TOKENS
} from "./tokens.js";

function _isWhiteSpace(char) {
    return char === ' ' || char === '\t';
}

function _isComment(char) {
    return char === '#';
}

function _isSemicolon(char) {
    return char === ';';
}

function _isDivision(char) {
    return char === '\u2500';
}

function _getOperator(line, i) {
    for (const op of SORTED_OPS) {
        if (line.startsWith(op, i)) {
            return op;
        }
    }

    return null;
}

function _isAlphabetic(char) {
    return /[a-zA-Z]/.test(char);
}

function _isDigit(char) {
    return /[0-9]/.test(char);
}

function _isNumeric(char) {
    return _isDigit(char) || char === '.';
}

function _isIdentifier(char) {
    return _isAlphabetic(char) || _isDigit(char) || char === '_';
}

function _greedySearch(line, startIndex, charValidator) {
    const lineWidth = line.length;

    let i = startIndex;
    while (i < lineWidth && charValidator(line[i])) {
        i++
    };

    return i;
}

class Tokens {
    constructor() {
        this.tokens = [];
        this.colors = config.colors;
    }

    clear() {
        this.tokens = [];
    }

    _push(value, color) {
        this.tokens.push({
            value: value,
            color: color
        });
    }

    append(word, token) {
        this._push(word, resolveTokenColor(this.colors, token));
    }

    appendBracket(word, bracketDepth) {
        this._push(word, resolveBracketColor(this.colors, bracketDepth));
    }

    greedyAppend(line, i, charValidator, token) {
        const j = _greedySearch(line, i, charValidator);
        this.append(line.slice(i, j), token)
        return j;
    }
}

function tokenize(text) {
    const result = [];
    const colML = {};
    const tokens = new Tokens();

    for (const line of text.split('\n')) {
        let i = 0;
        let ilD = 0;
        let lineWidth = line.length;

        while (i < lineWidth) {
            const char = line[i];

            if (_isComment(char)) {
                tokens.append(line.slice(i), TOKENS.COMMENT)
                break;
            }

            if (_isSemicolon(char)) {
                tokens.append(char, TOKENS.SEMICOLON)
                i++;
                continue;
            }

            if (_isDivision(char)) {
                i = tokens.greedyAppend(line, i, _isDivision, TOKENS.OPERATOR);
                continue;
            }

            if (_isWhiteSpace(char)) {
                i = tokens.greedyAppend(line, i, _isWhiteSpace, TOKENS.WHITE_SPACE);
                continue;
            }

            if (_isDigit(char)) {
                i = tokens.greedyAppend(line, i, _isNumeric, TOKENS.NUMBER);
                continue;
            }

            // Operator

            const op = _getOperator(line, i);
            if (op !== null) {
                tokens.append(op, TOKENS.OPERATOR)
                i += op.length;
                continue;
            }

            // Identifier (function or variable)
            if (_isAlphabetic(char)) {
                const j = _greedySearch(line, i, _isIdentifier);
                const k = _greedySearch(line, j, _isWhiteSpace);
                tokens.append(line.slice(i, j), line[k] === '(' ? TOKENS.FUNCTION : TOKENS.VARIABLE)

                if (k > j) {
                    tokens.append(line.slice(j, k), TOKENS.WHITE_SPACE);
                }

                i = k;
                continue;
            }

            // ML_OPEN
            if (BRACKET_SETS.open.has(char)) {
                const bracketDepth = colML[i] ?? 0;
                tokens.appendBracket(char, bracketDepth)
                colML[i] = bracketDepth + 1;
                i++;
                continue;
            }

            // ML_CLOSE
            if (BRACKET_SETS.close.has(char)) {
                const bracketDepth = Math.max(0, (colML[i] ?? 0) - 1);
                colML[i] = bracketDepth;
                tokens.appendBracket(char, bracketDepth)
                i++;
                continue;
            }

            // ML_PASS
            if (BRACKET_SETS.pass.has(char)) {
                const bracketDepth = Math.max(0, (colML[i] ?? 0) - 1);
                tokens.appendBracket(char, bracketDepth)
                i++;
                continue;
            }

            // IL_OPEN
            if (BRACKET_SETS.ilO.has(char)) {
                tokens.appendBracket(char, ilD)
                ilD++;
                i++;
                continue;
            }

            // IL_CLOSE
            if (BRACKET_SETS.ilC.has(char)) {
                ilD = Math.max(0, ilD - 1);
                tokens.appendBracket(char, ilD)
                i++;
                continue;
            }

            tokens.append(char, TOKENS.UNKNOWN)
            i++;
        }

        result.push(tokens.tokens);
        tokens.clear()
    }

    return result;
}

export {
    tokenize
};