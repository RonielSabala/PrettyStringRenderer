import {
    getColorPickerElement,
    getHexInputElement,
    getSwatchFillElement
} from './elements.js';
import {
    state
} from './store.js';

export function updateColor(themeKey, themeValue) {
    getSwatchFillElement(themeKey).style.background = themeValue;
    getColorPickerElement(themeKey).value = themeValue;
    getHexInputElement(themeKey).value = themeValue;
}

export function setColor(themeKey, themeValue) {
    state.colors[themeKey] = themeValue;
    updateColor(themeKey, themeValue);
}