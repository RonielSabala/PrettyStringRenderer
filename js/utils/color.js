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

export function setColor(themeKey, themeValue) {
    state.colors[themeKey] = themeValue;
    getSwatchFillElement(themeKey).style.background = themeValue;
    getColorPickerElement(themeKey).value = themeValue;
    getHexInputElement(themeKey).value = themeValue;
}

export function updateTokensColor(themeKey = null) {
    const providedKey = themeKey !== null;
    const tokenType = THEME_KEYS_TO_TOKENS[themeKey];

    if (providedKey && tokenType == null) {
        return;
    }

    const tokenizedLines = state.tokenizer.tokenizedLines;
    for (const tokenizedLine of tokenizedLines) {
        for (const token of tokenizedLine) {
            if (providedKey && token.type !== tokenType) {
                continue;
            }

            token.updateColor();
        }
    }
}