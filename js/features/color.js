import {
    redraw
} from '../canvas/buffer.js';
import {
    setColor,
    updateTokensColor
} from '../utils/color.js';
import {
    createSaveScheduler,
    saveColorsState
} from '../utils/persistence.js';

const _scheduleColorSave = createSaveScheduler(saveColorsState);

export function onPick(themeKey, themeValue) {
    setColor(themeKey, themeValue);
    _scheduleColorSave();
    updateTokensColor(themeKey);
    redraw();
}

export function onHex(themeKey, themeValue) {
    if (!(/^#[0-9A-Fa-f]{6}$/.test(themeValue))) {
        return;
    }

    setColor(themeKey, themeValue);
    _scheduleColorSave();
    updateTokensColor(themeKey);
    redraw();
}