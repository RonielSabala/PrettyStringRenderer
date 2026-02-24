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

function _isWhiteSpace(char) {
    return char === ' ' || char === '\t';
}

function _isComment(char) {
    return char === '#';
}

function _isSemicolon(char) {
    return char === ';';
}

function _startLikeNumber(char) {
    return /[0-9]/.test(char);
}

function _isNumeric(char) {
    return /[0-9.]/.test(char);
}

function _startLikeIdentifier(char) {
    return /[a-zA-Z_]/.test(char);
}

function _isIdentifier(char) {
    return /[a-zA-Z0-9_]/.test(char);
}

function _searchOperator(line, i) {
    for (const op of SORTED_OPS) {
        if (line.startsWith(op, i)) {
            return op;
        }
    }

    return null;
}

function _greedySearch(line, i, charValidator) {
    let j = i;
    while (j < line.length && charValidator(line[j])) {
        j++;
    }

    return j;
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
            value,
            color
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
        this.append(line.slice(i, j), token);
        return j;
    }
}

/**
 * Scan the entire text to map the boxes of the multiline parentheses.
 */
function buildBracketDepthMap(lines) {
    const brackets = [];
    const maxHeight = lines.length;

    for (let y = 0; y < maxHeight; y++) {
        for (let x = 0; x < lines[y].length; x++) {
            const char = lines[y][x];

            for (const t of MULTILINE_BRACKETS) {
                if (char === t.lTop) {
                    let yEnd = -1;
                    if (y + 1 < maxHeight && lines[y + 1][x] === t.lBot) yEnd = y + 1;
                    else {
                        let curY = y + 1;
                        while (curY < maxHeight && lines[curY][x] === t.lMid) curY++;
                        if (curY < maxHeight && lines[curY][x] === t.lBot) yEnd = curY;
                    }

                    if (yEnd !== -1) {
                        for (let x2 = x + 1; x2 < lines[y].length; x2++) {
                            if (lines[y][x2] === t.rTop) {
                                let validRight = (yEnd === y + 1) ?
                                    lines[yEnd][x2] === t.rBot :
                                    (lines[yEnd][x2] === t.rBot);

                                if (validRight) {
                                    brackets.push({
                                        x1: x,
                                        x2: x2,
                                        y1: y,
                                        y2: yEnd
                                    });
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Calculate each bracket depth
    brackets.forEach(b => {
        b.depth = brackets.reduce((acc, other) => {
            if (other !== b && b.x1 > other.x1 && b.x2 < other.x2 && b.y1 >= other.y1 && b.y2 <= other.y2) {
                return acc + 1;
            }
            return acc;
        }, 0);
    });

    const boundaryMap = new Map();
    brackets.forEach(b => {
        for (let row = b.y1; row <= b.y2; row++) {
            boundaryMap.set(`${row},${b.x1}`, b.depth);
            boundaryMap.set(`${row},${b.x2}`, b.depth);
        }
    });

    return {
        getBoundaryDepth: (y, x) => boundaryMap.get(`${y},${x}`),
        getContainmentCount: (y, x) => {

            return brackets.reduce((acc, b) => {
                if (x > b.x1 && x < b.x2 && y >= b.y1 && y <= b.y2) return acc + 1;
                return acc;
            }, 0);
        }
    };
}

function tokenize(text) {
    const result = [];
    const lines = text.split('\n');
    const depthUtils = buildBracketDepthMap(lines);
    const tokens = new Tokens();

    for (let y = 0; y < lines.length; y++) {
        let i = 0;
        const line = lines[y];
        let inlineStackDepth = 0;

        while (i < line.length) {
            const char = line[i];

            // Multiline brackets
            const boundaryDepth = depthUtils.getBoundaryDepth(y, i);
            if (boundaryDepth !== undefined) {
                tokens.appendBracket(char, boundaryDepth);
                i++;
                continue;
            }

            const baseDepth = depthUtils.getContainmentCount(y, i);

            // Comments
            if (_isComment(char)) {
                tokens.append(line.slice(i), TOKENS.COMMENT);
                break;
            }

            // Inline brackets

            if (BRACKET_SETS.inlineOpen.has(char)) {
                tokens.appendBracket(char, baseDepth + inlineStackDepth);
                inlineStackDepth++;
                i++;
                continue;
            }

            if (BRACKET_SETS.inlineClose.has(char)) {
                inlineStackDepth = Math.max(0, inlineStackDepth - 1);
                tokens.appendBracket(char, baseDepth + inlineStackDepth);
                i++;
                continue;
            }

            // Whitespaces
            if (_isWhiteSpace(char)) {
                i = tokens.greedyAppend(line, i, _isWhiteSpace, TOKENS.WHITE_SPACE);
                continue;
            }

            // Numbers
            if (_startLikeNumber(char)) {
                i = tokens.greedyAppend(line, i, _isNumeric, TOKENS.NUMBER);
                continue;
            }

            // Semicolons
            if (_isSemicolon(char)) {
                tokens.append(char, TOKENS.SEMICOLON);
                i++;
                continue;
            }

            // Operators
            const op = _searchOperator(line, i);
            if (op !== null) {
                tokens.append(op, TOKENS.OPERATOR);
                i += op.length;
                continue;
            }

            // Identifiers (variables and functions)
            if (_startLikeIdentifier(char)) {
                const j = _greedySearch(line, i, _isIdentifier);
                const k = _greedySearch(line, j, _isWhiteSpace);
                tokens.append(line.slice(i, j), line[k] === '(' ? TOKENS.FUNCTION : TOKENS.VARIABLE);
                if (k > j) {
                    tokens.append(line.slice(j, k), TOKENS.WHITE_SPACE);
                }

                i = k;
                continue;
            }

            // Unknown token
            tokens.append(char, TOKENS.UNKNOWN);
            i++;
        }

        result.push(tokens.tokens);
        tokens.clear();
    }

    return result;
}

export {
    tokenize
};