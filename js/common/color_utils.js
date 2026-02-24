import {
    setColor
} from '../controllers/render_controller.js';
import {
    TOKENS
} from '../core/tokens.js';

export function onPick(themeKey, themeValue) {
    setColor(themeKey, themeValue);
}

export function onHex(themeKey, themeValue) {
    if (!(/^#[0-9A-Fa-f]{6}$/.test(themeValue))) {
        return;
    }

    setColor(themeKey, themeValue);
}

export function resolveBracketColor(colors, bracketDepth) {
    return colors[`bracket${bracketDepth % 3}`]
}

export function resolveTokenColor(colors, token) {
    switch (token) {
        case TOKENS.WHITE_SPACE:
            return null;
        case TOKENS.COMMENT:
            return colors.comment;
        case TOKENS.NUMBER:
            return colors.number
        case TOKENS.OPERATOR:
            return colors.operator;
        case TOKENS.VARIABLE:
            return colors.variable;
        case TOKENS.FUNCTION:
            return colors.function;
        case TOKENS.SEMICOLON:
            return colors.semicolon;
        default:
            return colors.unknown;
    }
}