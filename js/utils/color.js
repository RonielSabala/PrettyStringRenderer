import {
    state
} from '../common/store.js';
import {
    TOKENS
} from '../core/tokens.js';

import {
    getColorPickerElement,
    getHexInputElement,
    getSwatchFillElement
} from '../common/elements.js';

export function updateColor(themeKey, themeValue) {
    getSwatchFillElement(themeKey).style.background = themeValue;
    getColorPickerElement(themeKey).value = themeValue;
    getHexInputElement(themeKey).value = themeValue;
}

export function setColor(themeKey, themeValue) {
    state.colors[themeKey] = themeValue;
    updateColor(themeKey, themeValue);
}

export function resolveBracketColor(bracketDepth) {
    return state.colors[`bracket${bracketDepth % 3}`]
}

export function resolveTokenColor(token) {
    const colors = state.colors;
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