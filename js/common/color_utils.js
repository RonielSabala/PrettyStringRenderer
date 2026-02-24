import {
    setColor
} from '../controllers/render_controller.js';
import {
    TOKENS
} from '../core/tokens.js';
import {
    config
} from './config.js';

function onPick(themeKey, themeValue) {
    setColor(themeKey, themeValue);
}

function onHex(themeKey, themeValue) {
    if (!(/^#[0-9A-Fa-f]{6}$/.test(themeValue))) {
        return;
    }

    setColor(themeKey, themeValue);
}

function resolveTokenColor(token) {
    const colors = config.colors;
    switch (token.token) {
        case TOKENS.BRACKET:
            return colors[`bracket${token.bracketDepth}`];
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
    onHex,
    onPick,
    resolveTokenColor
};