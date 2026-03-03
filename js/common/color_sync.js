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