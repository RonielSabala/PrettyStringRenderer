import {
    TOKENS
} from '../core/tokens.js';
import {
    config
} from './config.js';
import {
    getColorPickerElement,
    getHexInputElement,
    getSwatchFillElement
} from './elements.js';

export function updateColor(themeKey, themeValue) {
    getSwatchFillElement(themeKey).style.background = themeValue;
    getColorPickerElement(themeKey).value = themeValue;
    getHexInputElement(themeKey).value = themeValue;
}

export function setColor(themeKey, themeValue) {
    config.colors[themeKey] = themeValue;
    updateColor(themeKey, themeValue);
}

export function resolveBracketColor(bracketDepth) {
    return config.colors[`bracket${bracketDepth % 3}`]
}

export function resolveTokenColor(token) {
    const colors = config.colors;
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