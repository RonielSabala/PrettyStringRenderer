import {
    config,
} from "./config.js";

const TOKENS = {
    BRACKET: 'b',
    OPERATOR: 'op',
    FUNCTION: 'fn',
    VARIABLE: 'va',
    SEMICOLON: 'sc',
    COMMENT: 'co',
    NUMBER: 'nu',
    WS: 'ws',
    UNKNOWN: 'uk',
};

function resolveColor(token) {
    const colors = config.colors;
    switch (token.t) {
        case TOKENS.BRACKET:
            return colors[`bracket${token.d}`];
        case TOKENS.OPERATOR:
            return colors.operator;
        case TOKENS.FUNCTION:
            return colors.function;
        case TOKENS.VARIABLE:
            return colors.variable;
        case TOKENS.SEMICOLON:
            return colors.semicolon;
        case TOKENS.COMMENT:
            return colors.comment;
        case TOKENS.NUMBER:
            return colors.number;
        case TOKENS.WS:
            return null;
        default:
            return colors.unknown;
    }
}

export {
    resolveColor,
    TOKENS
};