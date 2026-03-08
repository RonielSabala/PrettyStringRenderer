import {
    redraw
} from '../canvas/buffer.js';
import {
    THEME_KEYS
} from '../common/config.js';
import {
    EVENTS
} from '../common/constants/events.js';
import {
    getColorPickerElement,
    getHexInputElement
} from '../common/elements.js';
import {
    setColor,
    updateTokensColor
} from '../utils/color_sync.js';
import {
    createSaveScheduler,
    saveColorsState
} from '../utils/persistence.js';

const _scheduleColorSave = createSaveScheduler(saveColorsState);

// Helpers

function _updateColor(themeKey, themeValue) {
    setColor(themeKey, themeValue);
    _scheduleColorSave();
    updateTokensColor(themeKey);
    redraw();
}

// Public methods

export function initColors() {
    for (const themeKey of THEME_KEYS) {
        // Color Picker
        getColorPickerElement(themeKey).addEventListener(EVENTS.INPUT, (event) => {
            _updateColor(themeKey, event.target.value);
        });

        // Hex Input
        getHexInputElement(themeKey).addEventListener(EVENTS.INPUT, (event) => {
            const value = event.target.value;
            if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                _updateColor(themeKey, value);
            }
        });
    }
}