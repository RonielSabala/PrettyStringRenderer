import {
    redraw
} from '../canvas/buffer.js';
import {
    setColor,
    updateTokensColor
} from '../utils/color.js';
import {
    saveColorsState
} from '../utils/persistence.js';

export function onPick(themeKey, themeValue) {
    setColor(themeKey, themeValue);
    saveColorsState();
    updateTokensColor(themeKey);
    redraw();
}

export function onHex(themeKey, themeValue) {
    if (!(/^#[0-9A-Fa-f]{6}$/.test(themeValue))) {
        return;
    }

    setColor(themeKey, themeValue);
    saveColorsState();
    updateTokensColor(themeKey);
    redraw();
}