import {
    resolveBracketColor,
    resolveTokenColor
} from "../common/color_utils.js";

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

export class Token {
    #type;
    #bracketDepth = null;

    constructor(string, type, bracketDepth = null) {
        this.value = string;
        this.#type = type;
        this.#bracketDepth = bracketDepth;
    }

    getColor() {
        return this.#type === null ? resolveBracketColor(this.#bracketDepth) : resolveTokenColor(this.#type);
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
        this.list.push(new Token(char, null, depth));
    }
}