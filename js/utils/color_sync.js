import {
    getColorPickerElement,
    getHexInputElement,
    getSwatchFillElement
} from '../common/elements.js';
import {
    state,
    tokenizer
} from '../common/store.js';
import {
    THEME_KEYS_TO_TOKENS
} from '../core/tokens.js';

// Private helpers

function _updateElementsColors(HTMLElementId, colorHex) {
    getSwatchFillElement(HTMLElementId).style.background = colorHex;
    getColorPickerElement(HTMLElementId).value = colorHex;
    getHexInputElement(HTMLElementId).value = colorHex;
}

// Public methods

export function setColor(themeKey, themeValue) {
    state.colors[themeKey] = themeValue;

    const multipleValues = Array.isArray(themeValue);
    const colors = multipleValues ? themeValue : [themeValue];

    colors.forEach((colorHex, i) => {
        const HTMLElementID = themeKey + (multipleValues ? `${i}` : '');
        _updateElementsColors(HTMLElementID, colorHex);
    });
}

export function updateTokensColor(themeKey = null) {
    const isKeyProvided = themeKey !== null;
    const tokenType = THEME_KEYS_TO_TOKENS[themeKey];
    if (isKeyProvided && tokenType == null) {
        return;
    }

    for (const line of tokenizer.tokenizedLines) {
        for (const token of line) {
            if (!isKeyProvided || token.type === tokenType) {
                token.updateColor();
            }
        }
    }
}