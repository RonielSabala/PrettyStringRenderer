import {
    BRACKET_COLOR_PREFIX,
    BRACKET_COLORS_COUNT,
    DEFAULT_THEME
} from '../common/config.js';
import {
    state
} from '../common/store.js';

export const TOKENS = Object.freeze({
    WHITE_SPACE: 'white_space',
    COMMENT: 'comment',
    NUMBER: 'number',
    OPERATOR: 'operator',
    VARIABLE: 'variable',
    FUNCTION: 'function',
    SEMICOLON: 'semicolon',
    BRACKET: 'bracket',
    UNKNOWN: 'unknown',
});

export const THEME_KEYS_TO_TOKENS = Object.freeze(
    Object.keys(DEFAULT_THEME).reduce((acc, key) => {
        if (key.startsWith(BRACKET_COLOR_PREFIX)) {
            acc[key] = TOKENS.BRACKET;
        } else {
            acc[key] = TOKENS[key.toUpperCase()];
        }

        return acc;
    }, {})
);

export class Token {
    constructor(string, type, bracketDepth = null) {
        this.value = string;
        this.color = null;
        this.type = type;
        this.bracketDepth = bracketDepth;
        this.updateColor();
    }

    updateColor() {
        const tokenType = this.type;
        if (tokenType === TOKENS.WHITE_SPACE) {
            return;
        }

        let colorKey;
        if (tokenType === TOKENS.BRACKET) {
            colorKey = `${BRACKET_COLOR_PREFIX}${this.bracketDepth % BRACKET_COLORS_COUNT}`;
        } else {
            colorKey = tokenType;
        }

        const colors = state.colors;
        this.color = colors[colorKey] ?? colors.unknown;
    }
}

export class TokenResult {
    constructor() {
        this.list = [];
    }

    add(string, tokenType) {
        this.list.push(new Token(string, tokenType));
    }

    addBracket(char, depth) {
        this.list.push(new Token(char, TOKENS.BRACKET, depth));
    }
}