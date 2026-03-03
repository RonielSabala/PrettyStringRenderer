import {
    setColor
} from '../common/color_utils.js';
import {
    redraw
} from './canvas_buffer.js';

export function onPick(themeKey, themeValue) {
    setColor(themeKey, themeValue);
    redraw();
}

export function onHex(themeKey, themeValue) {
    if (!(/^#[0-9A-Fa-f]{6}$/.test(themeValue))) {
        return;
    }

    setColor(themeKey, themeValue);
    redraw();
}