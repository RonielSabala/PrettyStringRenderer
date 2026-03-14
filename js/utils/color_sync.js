import {
    getColorPickerElement,
    getHexInputElement,
    getSwatchFillElement
} from '../common/elements.js';
import {
    state
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

    const tokenizedLines = state.tokenizer.tokenizedLines;
    for (const tokenizedLine of tokenizedLines) {
        for (const token of tokenizedLine) {
            if (isKeyProvided && token.type !== tokenType) {
                continue;
            }

            token.updateColor();
        }
    }
}