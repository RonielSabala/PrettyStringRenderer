import {
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
    Object.fromEntries(
        Object.keys(DEFAULT_THEME).map(key => [
            key,
            TOKENS[key.toUpperCase()]
        ])
    )
);

export class Token {
    constructor(string, type, depth) {
        this.value = string;
        this.type = type;
        this.depth = depth;
        this.color = null;
        this.updateColor();
    }

    updateColor() {
        const type = this.type;
        if (type === TOKENS.WHITE_SPACE) {
            return;
        }

        const colors = state.colors;
        let color = colors[type];

        if (Array.isArray(color)) {
            color = color[this.depth % color.length];
        }

        this.color = color ?? colors.unknown;
    }
}

export class TokenResult {
    constructor() {
        this.list = [];
    }

    add(string, tokenType, depth = null) {
        this.list.push(new Token(string, tokenType, depth));
    }
}